#!/usr/bin/env node
// tone-lint — 큐레이션 교육 문서의 문체(말투)를 점검한다.
//
// 규약: content/education 의 큐레이션 문서 본문은 **한다체**(평서형 -ㄴ다/-다)로 쓴다.
//       합니다체("~합니다/~습니다")·해요체("~해요/~예요")는 지양한다.
//       단, 크루·코치의 실제 발화 인용은 원문(합니다체)을 유지한다 — 이 린트는
//       자동 차단이 아니라 사람이 판단하는 온디맨드 리포트다.
//
// 사용: node scripts/style/tone-lint.mjs
// 종료코드: 위반 0 → 0, 위반 있음 → 1 (CI/precommit 게이트로도 쓸 수 있음)

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// 점검 범위 (큐레이션 교육 콘텐츠만 — 실험 로그/아카이브/자동생성 제외)
const SCOPE = [
  'content/education/philosophy.mdx',
  'content/education/insights',
  'content/education/design-patterns',
  'content/education/curriculum',
  'content/education/tools',
];

// '요'로 끝나지만 어미가 아닌 흔한 명사/표현 (오탐 제거)
const YO_NOUN_DENY = /(중요|필요|개요|내용|상호|용도|효용|범위|이유|자유|비유|여유|소요|수요|공유|소유|점유|보유|함유|고유)$/;

function listFiles(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  const st = fs.statSync(abs);
  if (st.isFile()) return /\.mdx?$/.test(abs) ? [abs] : [];
  return fs
    .readdirSync(abs)
    .flatMap((e) => listFiles(path.join(rel, e)));
}

// 펜스 코드블록 / 인라인 코드 / frontmatter 제거 (라인 번호 보존 위해 빈 줄 치환)
function maskNonProse(text) {
  const lines = text.split('\n');
  let inFence = false;
  let inFrontmatter = false;
  return lines.map((l, i) => {
    if (i === 0 && /^---\s*$/.test(l)) { inFrontmatter = true; return ''; }
    if (inFrontmatter) { if (/^---\s*$/.test(l)) inFrontmatter = false; return ''; }
    if (/^\s*```/.test(l)) { inFence = !inFence; return ''; }
    if (inFence) return '';
    return l.replace(/`[^`]*`/g, ' ');
  });
}

// 한 줄에서 합니다체/해요체 어미를 검출한다.
function findEndings(line, isHeading) {
  const hits = [];
  // 합니다체: 습니다 / 습니까
  for (const m of line.matchAll(/[가-힣]*(습니다|습니까)/g)) {
    hits.push({ kind: '합니다체', text: m[0] });
  }
  // 합니다체: ~ㅂ니다 (받침 ㅂ + 니다). '아니다'(한다체)와 '습니다'(위 처리)는 제외
  for (const m of line.matchAll(/([가-힣])니다/g)) {
    if (m[1] === '아') continue;            // 아니다 = 한다체
    if (/습니다$/.test(m[0])) continue;      // 위에서 처리
    hits.push({ kind: '합니다체', text: m[0] });
  }
  // 해요체: 문장 끝 ~요 (헤딩 제외, 명사 오탐 제외)
  if (!isHeading) {
    for (const m of line.matchAll(/[가-힣]{2,}요(?=[.!?…"'」)\]]|$)/g)) {
      if (YO_NOUN_DENY.test(m[0])) continue;
      hits.push({ kind: '해요체', text: m[0] });
    }
  }
  return hits;
}

// 매치가 인용("..."/'...'/「...」/> blockquote) 안일 가능성 — 사람 판단용 표시
function looksQuoted(rawLine) {
  return /^\s*>/.test(rawLine) || /["'"'「][^"'"'」]*["'"'」]/.test(rawLine);
}

const files = SCOPE.flatMap(listFiles);
let violationCount = 0;
let quotedCount = 0;
const report = [];

for (const abs of files) {
  const raw = fs.readFileSync(abs, 'utf8');
  const rawLines = raw.split('\n');
  const masked = maskNonProse(raw);
  masked.forEach((line, idx) => {
    const isHeading = /^\s*#/.test(rawLines[idx]);
    const hits = findEndings(line, isHeading);
    if (!hits.length) return;
    const quoted = looksQuoted(rawLines[idx]);
    for (const h of hits) {
      if (quoted) quotedCount++; else violationCount++;
      report.push({
        file: path.relative(ROOT, abs),
        line: idx + 1,
        kind: h.kind,
        text: h.text,
        quoted,
        snippet: rawLines[idx].trim().slice(0, 90),
      });
    }
  });
}

// 출력
if (report.length === 0) {
  console.log(`✓ tone-lint: 위반 없음 (${files.length}개 파일, 한다체 일관 ✓)`);
  process.exit(0);
}

console.log(`tone-lint: ${files.length}개 파일 점검 — 본문 위반 ${violationCount}건, 인용 추정 ${quotedCount}건\n`);
const prose = report.filter((r) => !r.quoted);
const quoted = report.filter((r) => r.quoted);

if (prose.length) {
  console.log('■ 수정 권장 (본문 — 한다체로):');
  for (const r of prose) {
    console.log(`  ${r.file}:${r.line}  [${r.kind} "${r.text}"]  ${r.snippet}`);
  }
}
if (quoted.length) {
  console.log('\n□ 검토 필요 (인용/블록쿼트 안 — 원문이면 유지):');
  for (const r of quoted) {
    console.log(`  ${r.file}:${r.line}  [${r.kind} "${r.text}"]  ${r.snippet}`);
  }
}

// 본문 위반이 있으면 1로 종료(인용 추정만 있으면 0)
process.exit(violationCount > 0 ? 1 : 0);
