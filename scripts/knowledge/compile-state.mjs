#!/usr/bin/env node
// knowledge compile-state — 파일 단위 ledger 로 "어떤 raw 가 wiki 로 합성됐는지" 추적한다.
//
// 왜 ledger 인가:
//   기존 auto-compile 훅은 `git diff --diff-filter=A <lastCompileCommit> HEAD` 로
//   "마지막 compile 이후 추가된 raw 수" 를 셌다. 이 방식의 두 결함:
//     1) 마커 미advance — 사이클이 lastCompileCommit 을 갱신하지 않으면(LLM 단계 누락/병렬
//        실행 덮어쓰기) 같은 raw 를 매 턴 다시 세서 훅이 무한 오탐한다.
//     2) batch orphan — 한 커밋이 batchSize 보다 많은 raw 를 추가하면, 일부만 처리하고
//        마커를 HEAD 로 옮기는 순간 나머지가 탐지에서 영구 누락된다.
//   ledger 는 "파일이 실제로 처리됐는지" 를 직접 기록하므로 두 결함이 모두 사라진다.
//   결정론적 스크립트라 LLM 단계 누락에도 영향받지 않는다.
//
// auto-eligible 범위: knowledge/raw/*.md (루트) 만.
//   하위 폴더(conversations/·external/·derived/·assets/)는 deliberate-only —
//   새 유형/큐레이션 자료라 사람 검토가 필요하므로 auto 훅 대상에서 제외한다.
//   (deliberate `/지식정제 raw/<subdir>/...` 로 처리. sync-state.compileBacklog 참조.)
//
// 사용법:
//   node scripts/knowledge/compile-state.mjs pending [--count]   미합성 auto-eligible raw 목록/개수
//   node scripts/knowledge/compile-state.mjs mark <file>...      처리한 raw 를 ledger 에 추가
//   node scripts/knowledge/compile-state.mjs init                현재 루트 raw 전체를 기준선으로 등록(1회)

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const STATE = path.join(ROOT, '.claude/sync-state.json');
const RAW_DIR = path.join(ROOT, 'knowledge/raw');

function rootRawFiles() {
  if (!fs.existsSync(RAW_DIR)) return [];
  return fs
    .readdirSync(RAW_DIR)
    .filter((f) => f.endsWith('.md') && fs.statSync(path.join(RAW_DIR, f)).isFile())
    .sort();
}

// wiki 노트의 frontmatter `sources:` 가 실제로 참조하는 raw 파일 basename 집합.
// "이 raw 는 정말로 어떤 wiki 노트에 합성됐는가" 의 진실 원천. init 의 기준선이 된다.
function compiledFromWikiSources() {
  const WIKI_DIR = path.join(ROOT, 'knowledge/wiki');
  if (!fs.existsSync(WIKI_DIR)) return [];
  const set = new Set();
  const re = /raw\/(?:[^\s)\]]+\/)?([^\s)\]/]+\.md)/g;
  for (const f of fs.readdirSync(WIKI_DIR).filter((x) => x.endsWith('.md'))) {
    const txt = fs.readFileSync(path.join(WIKI_DIR, f), 'utf8');
    let m;
    while ((m = re.exec(txt)) !== null) set.add(m[1]);
  }
  return [...set].sort();
}

function readState() {
  return JSON.parse(fs.readFileSync(STATE, 'utf8'));
}

function writeState(s) {
  fs.writeFileSync(STATE, JSON.stringify(s, null, 2) + '\n');
}

const [cmd, ...args] = process.argv.slice(2);

if (!fs.existsSync(STATE)) {
  // 위키 비활성/상태파일 없음 → 조용히 종료(훅이 깨지지 않도록)
  if (cmd === 'pending' && args.includes('--count')) console.log(0);
  process.exit(0);
}

const state = readState();
const compiled = new Set(state.compiledRaw || []);

switch (cmd) {
  case 'init': {
    // wiki sources 에서 역산한 "실제 합성된 raw" 를 기준선으로 등록한다.
    // (루트 raw 전체를 퉁치면 wiki 에 없는 raw 까지 합성됐다고 거짓 표시하게 됨)
    const compiledNow = compiledFromWikiSources();
    state.compiledRaw = compiledNow;
    writeState(state);
    const pendingNow = rootRawFiles().filter((f) => !new Set(compiledNow).has(f));
    console.log(
      `[compile-state] init: wiki sources 역산 → compiledRaw ${compiledNow.length}개 등록. ` +
        `루트 raw 중 미합성(auto-eligible pending): ${pendingNow.length}개`
    );
    break;
  }
  case 'mark': {
    if (!args.length) {
      console.error('mark: 파일명이 필요합니다');
      process.exit(1);
    }
    let added = 0;
    for (const a of args) {
      const base = path.basename(a);
      if (!compiled.has(base)) {
        compiled.add(base);
        added++;
      }
    }
    state.compiledRaw = [...compiled].sort();
    writeState(state);
    console.log(`[compile-state] mark: 신규 ${added}개 추가 → compiledRaw ${state.compiledRaw.length}개`);
    break;
  }
  case 'pending': {
    const pending = rootRawFiles().filter((f) => !compiled.has(f));
    if (args.includes('--count')) console.log(pending.length);
    else console.log(JSON.stringify(pending, null, 2));
    break;
  }
  default:
    console.error('usage: compile-state.mjs <pending [--count] | mark <file>... | init>');
    process.exit(1);
}
