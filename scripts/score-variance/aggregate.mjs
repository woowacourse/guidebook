#!/usr/bin/env node
// scripts/score-variance/aggregate.mjs
// /채점신뢰도 커맨드의 집계기.
//
// 같은 로그를 N번 독립 채점한 점수 벡터들을 받아, 차원별·총점 신뢰도 통계
// (평균·표준편차·표준오차·95% 신뢰구간)를 계산하고, 합격선과의 거리로
// 권장 채점 횟수를 제안한다.
//
// 설계 원칙: 채점(주관적 판단)은 LLM 서브에이전트가, 집계(객관적 산수)는
// 이 결정론적 스크립트가 한다. LLM에게 산수를 시키면 그 자체가 또 다른 오차원이 된다.
//
// 입력: JSON 파일 경로 (argv[2]). 형식:
//   {
//     "log": "expedition",
//     "rubric": "quality",            // 라벨용 (quality=25점 / promotion=20점)
//     "boundaries": [21, 16, 11, 6],  // 등급/합격 임계값
//     "scores": [ {"D1":5,"D2":4,"D3":4,"D4":3,"D5":4}, ... ]   // N개 벡터
//   }
//
// 출력: 사람이 읽는 마크다운 보고서(stdout).
// 옵션: --date=YYYY-MM-DD --append=<tsv경로>  → 결과 한 줄을 TSV에 누적(헤더 자동 생성).

import { readFileSync, appendFileSync, existsSync } from 'node:fs';

const Z = 1.96; // 95% 정규근사 (N>=20 파일럿 가정)

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
function sampleSD(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  // n-1 (Bessel 보정): 표본으로 모표준편차를 추정할 때 과소평가를 막는다.
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}
const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};

function main() {
  const path = process.argv[2];
  if (!path) {
    console.error('사용법: node aggregate.mjs <scores.json> [--date=YYYY-MM-DD] [--append=<tsv>]');
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const scores = data.scores ?? [];
  const N = scores.length;
  if (N === 0) { console.error('점수 벡터가 비어 있습니다.'); process.exit(1); }

  const dims = Object.keys(scores[0]);
  const perDim = dims.map((d) => {
    const xs = scores.map((s) => Number(s[d]));
    return { dim: d, mean: mean(xs), sd: sampleSD(xs) };
  });

  const totals = scores.map((s) => dims.reduce((a, d) => a + Number(s[d]), 0));
  const tMean = mean(totals);
  const tSD = sampleSD(totals);
  const sem = tSD / Math.sqrt(N);
  const ciLow = tMean - Z * sem;
  const ciHigh = tMean + Z * sem;

  // 가장 가까운 합격선과의 거리
  const boundaries = (data.boundaries ?? []).slice().sort((a, b) => a - b);
  let nearest = null, gap = Infinity;
  for (const b of boundaries) {
    const g = Math.abs(tMean - b);
    if (g < gap) { gap = g; nearest = b; }
  }
  const ciCrosses = nearest != null && ciLow < nearest && ciHigh > nearest;

  // 권장 n: 측정된 σ로 합격선에서 거리 g인 로그를 오분류 5% 미만으로 분류하려면
  //   g / (σ/√n) >= 1.645  →  n >= (1.645·σ/g)²
  const reqN = (g) => Math.max(1, Math.ceil((1.645 * tSD / g) ** 2));

  const L = [];
  L.push(`# 채점 신뢰도 측정: ${data.log ?? '(이름 없음)'}  (루브릭=${data.rubric ?? '?'}, N=${N})`);
  L.push('');
  L.push('## 차원별');
  L.push('| 차원 | 평균 | 표준편차(σ) |');
  L.push('|------|------|-------------|');
  for (const p of perDim) L.push(`| ${p.dim} | ${p.mean.toFixed(2)} | ${p.sd.toFixed(2)} |`);
  L.push('');
  L.push('## 총점');
  L.push(`- 평균: **${tMean.toFixed(2)}**`);
  L.push(`- 표준편차 σ: **${tSD.toFixed(2)}**  ← 한 번 채점의 흔들림 폭`);
  L.push(`- 표준오차 SEM: ${sem.toFixed(2)}  (= σ/√N)`);
  L.push(`- 95% 신뢰구간: **${ciLow.toFixed(2)} ~ ${ciHigh.toFixed(2)}** (평균 ± ${(Z * sem).toFixed(2)})`);
  L.push('');
  if (nearest != null) {
    L.push('## 합격선 판정');
    L.push(`- 가장 가까운 임계값: ${nearest}점 (거리 ${gap.toFixed(2)}점)`);
    if (ciCrosses) {
      L.push(`- ⚠️ 95% 신뢰구간이 임계값 ${nearest}을 **걸칩니다** → 현재 N=${N}으로는 판정 불확실.`);
      L.push(`  - 이 거리(${gap.toFixed(2)})를 오분류 5% 미만으로 분류하려면 **약 ${reqN(gap)}회** 채점 필요.`);
      L.push('  - 그 횟수를 넘겨도 신뢰구간이 계속 걸치면 → **사람 검토로 넘김**(진짜 경계선 로그).');
    } else {
      L.push(`- ✓ 95% 신뢰구간이 임계값 ${nearest}을 넘지 않습니다 → N=${N}으로 판정 신뢰 가능.`);
    }
    L.push('');
  }
  L.push('## 이 σ에서, 임계값과의 거리별 안전 채점 횟수 (오분류 5% 미만)');
  L.push('| 임계값과의 거리 | 필요한 최소 n |');
  L.push('|------------------|----------------|');
  for (const g of [0.5, 1.0, 1.5, 2.0]) {
    const n = reqN(g);
    L.push(`| ${g.toFixed(1)}점 | ${n > 50 ? '50+ (사람 검토 권장)' : n + '회'} |`);
  }
  L.push('');
  L.push('> 신뢰도(σ)는 운(분산)만 잡습니다. 점수가 사람 판단과 맞는지(타당도)는');
  L.push('> 사람이 매긴 골드 로그와 견주어 따로 보정해야 합니다.');

  console.log(L.join('\n'));

  // TSV 누적 (선택)
  const appendPath = arg('append');
  if (appendPath) {
    const date = arg('date') ?? '';
    const header = ['date', 'log', 'rubric', 'N', 'mean', 'sd', 'sem', 'ci95', 'nearest_boundary', 'verdict'].join('\t');
    const row = [
      date, data.log ?? '', data.rubric ?? '', N,
      tMean.toFixed(2), tSD.toFixed(2), sem.toFixed(2),
      `${ciLow.toFixed(2)}~${ciHigh.toFixed(2)}`, nearest ?? '',
      ciCrosses ? 'boundary-crossed' : 'clear',
    ].join('\t');
    if (!existsSync(appendPath)) appendFileSync(appendPath, header + '\n');
    appendFileSync(appendPath, row + '\n');
    console.log(`\n[기록됨] ${appendPath} 에 한 줄 누적`);
  }
}

main();
