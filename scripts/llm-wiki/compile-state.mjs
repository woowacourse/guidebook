#!/usr/bin/env node
// llm-wiki compile-state — "아직 wiki 로 합성 안 된 raw" 를 wiki sources 에서 동적 계산한다.
//
// 왜 동적 계산인가:
//   기존 auto-compile 훅은 `git diff --diff-filter=A <lastCompileCommit> HEAD` 로 raw 수를 셌다.
//   두 결함 — (1) 사이클이 lastCompileCommit 을 advance 안 하면 같은 raw 를 매 턴 다시 세서
//   무한 오탐, (2) 한 커밋이 batchSize 보다 많이 추가하면 일부가 orphan.
//   별도 ledger 를 저장하는 방식도 "갱신 안 하면 stale" 이라는 같은 류의 버그를 부른다.
//
//   해법: "compiled = 어떤 wiki 노트의 frontmatter `sources:` 에 그 raw 가 적혀 있음" 으로
//   정의하고, 매 호출 시 wiki 를 스캔해 파생시킨다. wiki 노트가 곧 합성 기록의 진실 원천이므로
//   동기화할 별도 상태가 없다 — 누가(사람/자동화) 합성하든 항상 정확하다.
//
// auto-eligible 범위: llm-wiki/raw/*.md (루트) 만.
//   하위 폴더(conversations/·external/·derived/·assets/)는 새 유형/큐레이션 자료라
//   사람 검토가 필요한 deliberate-only. auto 훅 대상에서 제외한다.
//   (deliberate `/위키정제 raw/<subdir>/...` 로 처리.)
//
// 사용법:
//   node scripts/llm-wiki/compile-state.mjs pending [--count]
//     --count 없으면 미합성 auto-eligible raw 목록(JSON), 있으면 개수만.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const RAW_DIR = path.join(ROOT, 'llm-wiki/raw');
const WIKI_DIR = path.join(ROOT, 'llm-wiki/wiki');

// auto-eligible raw = llm-wiki/raw/ 루트의 *.md (하위 폴더 제외)
function rootRawFiles() {
  if (!fs.existsSync(RAW_DIR)) return [];
  return fs
    .readdirSync(RAW_DIR)
    .filter((f) => f.endsWith('.md') && fs.statSync(path.join(RAW_DIR, f)).isFile())
    .sort();
}

// wiki 노트들이 sources 로 참조하는 raw basename 집합 = "실제 합성된 raw"
function compiledRawBasenames() {
  if (!fs.existsSync(WIKI_DIR)) return new Set();
  const set = new Set();
  const re = /raw\/(?:[^\s)\]]+\/)?([^\s)\]/]+\.md)/g;
  for (const f of fs.readdirSync(WIKI_DIR).filter((x) => x.endsWith('.md'))) {
    const txt = fs.readFileSync(path.join(WIKI_DIR, f), 'utf8');
    let m;
    while ((m = re.exec(txt)) !== null) set.add(m[1]);
  }
  return set;
}

function pending() {
  const compiled = compiledRawBasenames();
  return rootRawFiles().filter((f) => !compiled.has(f));
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'pending') {
  const list = pending();
  if (args.includes('--count')) console.log(list.length);
  else console.log(JSON.stringify(list, null, 2));
} else {
  console.error('usage: compile-state.mjs pending [--count]');
  process.exit(1);
}
