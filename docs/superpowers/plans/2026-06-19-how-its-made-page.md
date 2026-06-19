# "이 문서는 어떻게 만들어지는가" 페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 외부 독자에게 이 문서가 실험 로그에서 귀납되고 루브릭 게이트로 검증되며 언제든 수정됨을 시각적으로 보여주는 독립 신뢰 페이지를 만든다.

**Architecture:** Nextra 4(App Router) MDX 페이지 1개 + repo 관례(TS + CSS Module)로 만든 인터랙티브 비스포크 컴포넌트 `PromotionPipeline` 1개. 나머지 섹션은 기존 컴포넌트(Mermaid·CardGrid·RecentUpdates·Callout) 재사용. 3개 진입점(홈 카드·상단 nav·철학 교차링크)에서 도달.

**Tech Stack:** Next 15, React 19, Nextra 4, TypeScript 5.7, CSS Modules, Mermaid 11.

## Global Constraints

- 본문 문체는 **합니다체**로 통일 (한다체·해요체 금지). `npm run lint:tone` 통과 필수.
- 컴포넌트는 `'use client'` + `.module.css` + `:global(.dark)` 다크모드 패턴 (선례: `CurriculumTimeline.tsx`).
- 루브릭 차원·점수·임계값은 `.claude/log-quality-rubric.md`(25점)·`.claude/promotion-rubric.md`(20점)와 **1:1 일치** — 임의 변경 금지.
- 액센트 색: `#4285f4` (사이트 기존). 표면/텍스트: `rgba(55,53,47,...)` Notion 팔레트.
- 신규 MDX는 frontmatter(`id`/`summary`≤120자/`last_verified`) 포함 (`.claude/conventions/frontmatter-spec.md`).
- 콘텐츠 추가 시 `content/updates.ts`·`_meta.ts` 갱신 필수 (CLAUDE.md).
- 컴포넌트 단위 테스트 하네스 없음 → 검증은 `npm run build`·`npm run lint:tone`·`npm run dev` 렌더 확인.
- 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## Task 0: 작업 브랜치 생성

**Files:** 없음 (git 작업)

- [ ] **Step 1: 새 브랜치 생성**

```bash
git checkout -b feature/how-its-made-page
```

- [ ] **Step 2: 스펙·플랜 문서 커밋**

```bash
git add docs/superpowers/specs/2026-06-19-how-its-made-page-design.md docs/superpowers/plans/2026-06-19-how-its-made-page.md
git commit -m "docs: '이 문서는 어떻게 만들어지는가' 신뢰 페이지 설계·계획

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 1: `PromotionPipeline` 비스포크 컴포넌트

**Files:**
- Create: `components/PromotionPipeline.tsx`
- Create: `components/PromotionPipeline.module.css`
- Modify: `components/index.ts` (export 추가)
- Modify: `mdx-components.tsx` (import + 등록)

**Interfaces:**
- Produces: `export function PromotionPipeline(): JSX.Element` — props 없음(데이터는 컴포넌트 내부 상수). MDX에서 `<PromotionPipeline />`로 사용.

- [ ] **Step 1: `components/PromotionPipeline.tsx` 작성**

```tsx
'use client'

import { useState } from 'react'
import styles from './PromotionPipeline.module.css'

type RubricDim = { code: string; name: string; en: string; desc: string }
type Rubric = {
  id: 'quality' | 'promotion'
  name: string
  max: number
  threshold: number
  scale: string
  verdict: string
  dims: RubricDim[]
}

// .claude/log-quality-rubric.md (25점) — 1:1 일치
const QUALITY: Rubric = {
  id: 'quality',
  name: '품질 루브릭',
  max: 25,
  threshold: 16,
  scale: '5차원 × 1~5점',
  verdict: '21~25 A · 16~20 B · 11~15 C · 6~10 D · 5 F',
  dims: [
    { code: 'D1', name: '구조 완성도', en: 'Structure', desc: '대상·배경·설계·결과·교훈·다음 실험 등 필수 섹션을 갖췄는가' },
    { code: 'D2', name: '구체성', en: 'Specificity', desc: '수치 데이터·크루 인용·구체적 타임라인이 있는가' },
    { code: 'D3', name: '전이 가능성', en: 'Transferability', desc: '다른 코치가 이 로그만 읽고 동일 활동을 재현할 수 있는가' },
    { code: 'D4', name: '교훈의 양면성', en: 'Balanced Lessons', desc: '성공과 실패가 균형 있고 다음 행동으로 연결되는가' },
    { code: 'D5', name: '원본 자료 연결', en: 'Source Linkage', desc: '디스커션·슬라이드·크루 결과물 원본이 링크됐는가' },
  ],
}

// .claude/promotion-rubric.md (20점) — 1:1 일치
const PROMOTION: Rubric = {
  id: 'promotion',
  name: '승격 루브릭',
  max: 20,
  threshold: 16,
  scale: '4차원 × 1~5점',
  verdict: '16~20 승격 가능 · 12~15 조건부 · 8~11 보류',
  dims: [
    { code: 'P1', name: '반복 검증', en: 'Replication', desc: '같은 활동이 다른 기수·맥락에서 반복되었는가' },
    { code: 'P2', name: '추출 가능성', en: 'Extractability', desc: '독립적인 도구·패턴·원칙을 뽑아낼 수 있는가' },
    { code: 'P3', name: '교차 연결', en: 'Cross-Reference', desc: '다른 로그·인사이트·교육 모델과 연결되는가' },
    { code: 'P4', name: '실행 영향력', en: 'Impact', desc: '실제 교육 과정에 미치는 영향이 큰가' },
  ],
}

const RUBRICS: Record<'quality' | 'promotion', Rubric> = { quality: QUALITY, promotion: PROMOTION }

type Stage = { icon: string; title: string; sub: string; tone: string }
const STAGES: Stage[] = [
  { icon: '📝', title: '실험 로그', sub: '한 기수의 원본 기록', tone: 'log' },
  { icon: '🛠️', title: '검증된 도구 · 패턴', sub: '재사용 가능한 워크플로우와 교차 패턴', tone: 'mid' },
  { icon: '📐', title: '커리큘럼 · 철학', sub: '원칙으로 일반화된 교육 모델', tone: 'top' },
]

// STAGES 사이에 끼는 게이트 (stage i → i+1)
const GATE_ORDER: Array<'quality' | 'promotion'> = ['quality', 'promotion']

export function PromotionPipeline() {
  const [open, setOpen] = useState<'quality' | 'promotion' | null>('quality')

  return (
    <div className={styles.root}>
      <div className={styles.flow} role="list">
        {STAGES.map((s, i) => (
          <div key={s.title} className={styles.cell} role="listitem">
            <div className={`${styles.stage} ${styles[s.tone]}`}>
              <span className={styles.stageIcon} aria-hidden>{s.icon}</span>
              <span className={styles.stageTitle}>{s.title}</span>
              <span className={styles.stageSub}>{s.sub}</span>
            </div>
            {i < STAGES.length - 1 && (
              <button
                type="button"
                className={`${styles.gate} ${open === GATE_ORDER[i] ? styles.gateOpen : ''}`}
                aria-expanded={open === GATE_ORDER[i]}
                onClick={() => setOpen(open === GATE_ORDER[i] ? null : GATE_ORDER[i])}
              >
                <span className={styles.gateArrow} aria-hidden>→</span>
                <span className={styles.gateBody}>
                  <span className={styles.gateLabel}>{RUBRICS[GATE_ORDER[i]].name}</span>
                  <span className={styles.gateMax}>{RUBRICS[GATE_ORDER[i]].max}점 만점 · 통과선 {RUBRICS[GATE_ORDER[i]].threshold}</span>
                </span>
                <span className={styles.gateToggle} aria-hidden>{open === GATE_ORDER[i] ? '−' : '+'}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <p className={styles.hint}>
        모든 로그가 위로 올라가는 게 아닙니다. 게이트의 점수를 통과한 것만 승격됩니다.
        게이트를 눌러 실제 채점 기준을 펼쳐 보세요.
      </p>

      {open && <Scorecard rubric={RUBRICS[open]} />}
    </div>
  )
}

function Scorecard({ rubric }: { rubric: Rubric }) {
  const pct = Math.round((rubric.threshold / rubric.max) * 100)
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <div className={styles.panelName}>{rubric.name}</div>
          <div className={styles.panelScale}>{rubric.scale} · 총점 {rubric.max}점</div>
        </div>
        <div className={styles.thresholdBox}>
          <div className={styles.thresholdLabel}>통과선 {rubric.threshold} / {rubric.max}</div>
          <div className={styles.thresholdBar}>
            <div className={styles.thresholdFill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.verdict}>{rubric.verdict}</div>
        </div>
      </div>
      <ul className={styles.dimList}>
        {rubric.dims.map((d) => (
          <li key={d.code} className={styles.dimRow}>
            <span className={styles.dimCode}>{d.code}</span>
            <span className={styles.dimMain}>
              <span className={styles.dimName}>{d.name}<span className={styles.dimEn}>{d.en}</span></span>
              <span className={styles.dimDesc}>{d.desc}</span>
            </span>
            <span className={styles.dimScale}>1–5점</span>
          </li>
        ))}
      </ul>
      <div className={styles.source}>
        이 점수표는 실제 채점 루브릭(<code>.claude/{rubric.id === 'quality' ? 'log-quality' : 'promotion'}-rubric.md</code>)과 동일합니다.
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `components/PromotionPipeline.module.css` 작성**

```css
.root {
  margin: 1.75rem 0;
}

/* ---------- 흐름 ---------- */
.flow {
  display: flex;
  align-items: stretch;
  gap: 0;
  flex-wrap: wrap;
}

.cell {
  display: flex;
  align-items: stretch;
  flex: 1 1 0;
  min-width: 0;
}

.stage {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1 1 0;
  min-width: 9rem;
  padding: 1rem 1.1rem;
  border-radius: 10px;
  border: 1px solid rgba(55, 53, 47, 0.12);
  background: rgba(55, 53, 47, 0.024);
}

.stage.log { border-left: 3px solid #4285f4; }
.stage.mid { border-left: 3px solid #2f9e6b; }
.stage.top { border-left: 3px solid #c4554d; }

.stageIcon { font-size: 1.5rem; line-height: 1; }
.stageTitle { font-weight: 700; font-size: 0.95rem; }
.stageSub { font-size: 0.78rem; color: rgba(55, 53, 47, 0.6); line-height: 1.5; }

/* ---------- 게이트 버튼 ---------- */
.gate {
  appearance: none;
  font: inherit;
  cursor: pointer;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0.4rem;
  padding: 0.5rem 0.7rem;
  border-radius: 999px;
  border: 1px dashed rgba(66, 133, 244, 0.5);
  background: rgba(66, 133, 244, 0.06);
  color: inherit;
  align-self: center;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.gate:hover { background: rgba(66, 133, 244, 0.12); }
.gateOpen {
  border-style: solid;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.12);
}
.gateArrow { color: #4285f4; font-weight: 700; }
.gateBody { display: flex; flex-direction: column; line-height: 1.3; }
.gateLabel { font-size: 0.8rem; font-weight: 700; }
.gateMax { font-size: 0.68rem; color: rgba(55, 53, 47, 0.55); }
.gateToggle { font-size: 1rem; color: #4285f4; font-weight: 700; }

.hint {
  margin: 0.9rem 0 0;
  font-size: 0.82rem;
  color: rgba(55, 53, 47, 0.6);
  line-height: 1.6;
}

/* ---------- 점수카드 패널 ---------- */
.panel {
  margin-top: 1rem;
  border: 1px solid rgba(55, 53, 47, 0.12);
  border-radius: 12px;
  background: rgba(55, 53, 47, 0.016);
  padding: 1.1rem 1.25rem;
  animation: ppFade 0.18s ease;
}
@keyframes ppFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

.panelHead {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(55, 53, 47, 0.08);
}
.panelName { font-weight: 700; font-size: 1rem; }
.panelScale { font-size: 0.78rem; color: rgba(55, 53, 47, 0.55); margin-top: 0.15rem; }
.thresholdBox { min-width: 12rem; flex: 1 1 12rem; max-width: 18rem; }
.thresholdLabel { font-size: 0.74rem; font-weight: 700; color: #2d5bd9; margin-bottom: 0.3rem; }
.thresholdBar { height: 8px; border-radius: 4px; background: rgba(55, 53, 47, 0.08); overflow: hidden; }
.thresholdFill { height: 100%; border-radius: 4px; background: #4285f4; }
.verdict { font-size: 0.7rem; color: rgba(55, 53, 47, 0.55); margin-top: 0.35rem; }

.dimList { list-style: none; margin: 0; padding: 0; }
.dimRow {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.7rem 0;
  border-top: 1px solid rgba(55, 53, 47, 0.06);
}
.dimRow:first-child { border-top: none; }
.dimCode {
  flex: 0 0 auto;
  font-size: 0.72rem;
  font-weight: 700;
  color: #2d5bd9;
  background: rgba(66, 133, 244, 0.1);
  border-radius: 5px;
  padding: 0.15rem 0.4rem;
  margin-top: 0.1rem;
}
.dimMain { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
.dimName { font-weight: 600; font-size: 0.9rem; display: flex; align-items: baseline; gap: 0.45rem; }
.dimEn { font-size: 0.7rem; font-weight: 500; color: rgba(55, 53, 47, 0.45); }
.dimDesc { font-size: 0.8rem; color: rgba(55, 53, 47, 0.65); line-height: 1.55; }
.dimScale { flex: 0 0 auto; font-size: 0.72rem; color: rgba(55, 53, 47, 0.5); margin-top: 0.15rem; }

.source { margin-top: 0.85rem; font-size: 0.74rem; color: rgba(55, 53, 47, 0.5); }
.source code { font-size: 0.92em; }

/* ---------- 모바일 ---------- */
@media (max-width: 720px) {
  .flow { flex-direction: column; }
  .cell { flex-direction: column; }
  .gate { align-self: stretch; margin: 0.4rem 0; justify-content: flex-start; }
  .gateArrow { transform: rotate(90deg); }
}

/* ---------- 다크모드 ---------- */
:global(.dark) .stage { background: rgba(255, 255, 255, 0.03); border-color: rgba(255, 255, 255, 0.12); }
:global(.dark) .stageSub { color: rgba(255, 255, 255, 0.55); }
:global(.dark) .gateMax,
:global(.dark) .panelScale,
:global(.dark) .verdict,
:global(.dark) .dimScale { color: rgba(255, 255, 255, 0.5); }
:global(.dark) .hint,
:global(.dark) .dimDesc { color: rgba(255, 255, 255, 0.6); }
:global(.dark) .panel { background: rgba(255, 255, 255, 0.02); border-color: rgba(255, 255, 255, 0.12); }
:global(.dark) .panelHead { border-bottom-color: rgba(255, 255, 255, 0.08); }
:global(.dark) .dimRow { border-top-color: rgba(255, 255, 255, 0.06); }
:global(.dark) .thresholdBar { background: rgba(255, 255, 255, 0.1); }
:global(.dark) .source { color: rgba(255, 255, 255, 0.45); }
@media (prefers-reduced-motion: reduce) {
  .panel { animation: none; }
}
```

- [ ] **Step 3: `components/index.ts`에 export 추가**

마지막 줄(`CurriculumTimeline` export) 뒤에 추가:

```ts
export { PromotionPipeline } from './PromotionPipeline'
```

- [ ] **Step 4: `mdx-components.tsx`에 등록**

import 블록(`CurriculumTimeline` import 뒤)에 추가:

```tsx
import { PromotionPipeline } from './components/PromotionPipeline'
```

`useMDXComponents` 반환 객체(`CurriculumTimeline,` 뒤)에 추가:

```tsx
    PromotionPipeline,
```

- [ ] **Step 5: 빌드로 컴파일 검증**

Run: `npm run build`
Expected: 타입 에러 없이 빌드 성공 (이 시점엔 페이지에서 아직 사용 안 함 — 컴파일만 확인).

- [ ] **Step 6: 커밋**

```bash
git add components/PromotionPipeline.tsx components/PromotionPipeline.module.css components/index.ts mdx-components.tsx
git commit -m "feat(components): 승격 파이프라인 시각화 컴포넌트 PromotionPipeline 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 페이지 `content/how-its-made.mdx` + 상단 nav 등록

**Files:**
- Create: `content/how-its-made.mdx`
- Modify: `content/_meta.ts`

**Interfaces:**
- Consumes: `<PromotionPipeline />` (Task 1), 기존 `<Mermaid>`·`<CardGrid>`·`<Card>`·`<RecentUpdates>`·`<Callout>`.

- [ ] **Step 1: `content/how-its-made.mdx` 작성**

````mdx
---
id: how-its-made
summary: 이 문서가 실험 로그에서 귀납되고 루브릭 게이트로 검증되며 수정되는 제작 과정을 시각화한 신뢰 페이지.
last_verified: 2026-06-19
---

# 이 문서는 어떻게 만들어지는가

여러분이 보는 건 다듬어진 결과물입니다. 철학과 커리큘럼, 검증된 패턴은 깔끔하게 정리돼 있지만, 그것만 보면 한 가지 의심이 듭니다 — "이건 그냥 멋진 말 아닐까? 위에서 내려온 선언이거나 누군가의 인상에 불과한 건 아닐까?"

이 페이지는 그 의심에 답하기 위해 **결과물이 만들어지는 과정 자체**를 펼쳐 보입니다.

<Callout type="note" emoji="🔍">
**이 문서의 주장은 세 가지 방식으로 떠받쳐집니다.** ① 위에서 떨어진 게 아니라 실험 로그에서 **귀납**되고, ② 감이 아니라 루브릭 **점수와 게이트**를 통과하며, ③ 박제된 교리가 아니라 새 기록이 쌓이면 언제든 **수정**됩니다.
</Callout>

## 콘텐츠는 아래에서 위로 승격됩니다

이 문서의 콘텐츠는 위에서 아래로 쓰이지 않습니다. 매주 쌓이는 실험 로그를 원재료로, 검증을 통과한 것만 한 단계씩 위로 올라갑니다.

<PromotionPipeline />

## 게이트는 감이 아니라 점수입니다

위 게이트를 눌러보면 알 수 있듯, 무엇이 위로 올라갈지는 인상으로 정하지 않습니다. 실험 로그는 **5개 차원·25점**의 품질 루브릭으로, 승격은 **4개 차원·20점**의 승격 루브릭으로 채점됩니다. 점수가 임계값을 넘지 못하면 올라가지 않고, 보강 후 다시 채점됩니다.

## 주장은 수사가 아니라 측정입니다

추상적인 원칙도 가능한 한 숫자로 받칩니다. 아래는 한 미션 저장소(react-payments) 5년치를 분석한 기록에서 나온 값입니다.

<CardGrid>
  <Card title="555 PR · 5년" icon="📦">한 미션 저장소에 5년간 쌓인 풀 리퀘스트</Card>
  <Card title="97% 재방문" icon="🔁">215명 중 97%가 같은 저장소로 두 번 이상 돌아왔습니다 — "몰입 기반 성장"의 증거</Card>
  <Card title="51% 질문" icon="💬">리뷰 코멘트 2,178건 중 51%가 답이 아닌 질문이었습니다 — "협업은 구조다"의 증거</Card>
</CardGrid>

> 출처: [react-payments 5년 555 PR 분석](/education/logs/react-payments-555prs-analysis)

## 한 주장을 끝까지 따라가 보면

철학의 한 문장은 다음처럼 데이터와 원본 로그, 게이트로 거슬러 추적됩니다. 모든 주장이 이렇게 근거로 연결돼 있습니다.

<Mermaid chart={`
flowchart TD
    C["🎯 철학: 협업은 구조다"]
    D["💬 데이터: 코멘트 2,178건 중 51%가 질문"]
    L["📝 원본: react-payments 5년 로그"]
    G["✅ 게이트: 품질·승격 루브릭 통과"]
    C -->|근거| D
    D -->|측정 대상| L
    L -->|통과한 검증| G
    style C fill:#fff0f0,stroke:#c4554d
    style D fill:#e9f3f7,stroke:#487ca5
    style L fill:#f0f4ff,stroke:#4285f4
    style G fill:#eef3ed,stroke:#2f9e6b
`} />

## 박제된 교리가 아닙니다

이 문서는 완성된 정답집이 아니라 **계속 갱신되는 가설의 집합**입니다. 새 실험 로그가 들어오면 점수가 다시 매겨지고, 패턴이 바뀌면 위층의 원칙도 수정됩니다. 아래는 실제로 이 문서가 갱신돼 온 기록입니다.

<RecentUpdates />

## 잣대는 사람만 바꿉니다

<Callout type="warning" emoji="📏">
채점 루브릭(`.claude/log-quality-rubric.md`, `.claude/promotion-rubric.md`)은 **에이전트가 수정하지 않습니다.** 평가 기준이 바뀌면 모든 이전 점수와 비교가 불가능해지기 때문입니다. 기준 변경은 사람이 직접 합니다 — 그래서 점수는 사후에 끼워 맞춰지지 않습니다.
</Callout>

## 더 깊이 보고 싶다면

<CardGrid>
  <Card title="연구 사이클 워크플로우" icon="🔧" href="/education/tools/research-cycle-workflow">코치가 이 파이프라인을 실제로 돌리는 방법(슬래시 커맨드 포함)</Card>
  <Card title="검증된 패턴" icon="💡" href="/education/insights">여러 실험에서 교차 검증된 해결 패턴</Card>
  <Card title="실험 로그" icon="📝" href="/education/logs">이 모든 것의 원재료가 되는 매주의 기록</Card>
</CardGrid>
````

- [ ] **Step 2: `content/_meta.ts`에 nav 항목 추가**

`education` 항목 바로 뒤에 추가 (top nav 노출 위해 `type: 'page'`):

```ts
  'how-its-made': {
    title: '문서가 만들어지는 법',
    type: 'page'
  },
```

- [ ] **Step 3: dev 서버로 렌더 확인**

Run: `npm run dev` 후 `http://localhost:3000/how-its-made` 접속
Expected: 페이지 렌더, 게이트 클릭 시 점수카드 펼침/접힘, 상단 nav에 "문서가 만들어지는 법" 노출.

- [ ] **Step 4: 문체 점검**

Run: `npm run lint:tone`
Expected: 통과 (본문 합니다체). 실패 시 해당 문장만 합니다체로 교정.

- [ ] **Step 5: 빌드 검증**

Run: `npm run build`
Expected: 빌드 성공, `/how-its-made` 정적 생성, llms-txt·search-index 후처리 통과.

- [ ] **Step 6: 커밋**

```bash
git add content/how-its-made.mdx content/_meta.ts
git commit -m "feat(content): '이 문서는 어떻게 만들어지는가' 신뢰 페이지 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 진입점 3곳 연결 + updates.ts

**Files:**
- Modify: `content/index.mdx` (홈 Hero 아래 진입 카드)
- Modify: `content/education/philosophy.mdx` (마무리 Callout 교차링크)
- Modify: `content/updates.ts` (맨 위 항목)

**Interfaces:**
- Consumes: `/how-its-made` 라우트 (Task 2).

- [ ] **Step 1: 홈에 진입 카드 추가 (`content/index.mdx`)**

기존 `<Hero ... />` 뒤(파일 끝)에 추가. 홈은 미니멀 유지 — 카드 1개만:

```mdx

<CardGrid>
  <Card title="이 문서는 어떻게 만들어지는가" icon="🔍" href="/how-its-made">
    결과물만 보이지만, 그 뒤엔 실험 로그·루브릭 게이트·반복 수정이 있습니다. 제작 과정을 펼쳐 봅니다.
  </Card>
</CardGrid>
```

- [ ] **Step 2: 철학 페이지 교차링크 (`content/education/philosophy.mdx`)**

마무리 Callout(`**이 철학은 믿음이 아니라, 경험에서 나온 패턴들입니다.**` ... `언제든 수정되고 업데이트됩니다.`)의 닫는 `</Callout>` 바로 앞 줄에 한 문장 추가:

```mdx

→ [이 원칙들이 어떻게 검증되는지 보기](/how-its-made)
```

- [ ] **Step 3: `content/updates.ts` 맨 위 항목 추가**

`const updates: Update[] = [` 바로 다음에 삽입:

```ts
  {
    date: '2026년 연구',
    title: '"이 문서는 어떻게 만들어지는가" 신뢰 페이지 신설',
    description:
      '외부 독자가 결과물만 보고 갖는 "이거 그냥 멋진 말 아닌가" 의심에 답하기 위해, 콘텐츠가 실험 로그에서 귀납되고 루브릭 게이트(품질 25점·승격 20점)로 검증되며 계속 수정되는 제작 과정을 시각화했다. 게이트를 누르면 실제 채점 기준이 펼쳐진다.',
    href: '/how-its-made',
    status: 'active',
  },
```

- [ ] **Step 4: 최종 빌드·문체·렌더 검증**

Run: `npm run build && npm run lint:tone`
Expected: 둘 다 통과.

Run: `npm run dev` 후 확인
Expected: ① 홈에서 진입 카드 → `/how-its-made` 이동, ② 철학 페이지 하단 링크 → `/how-its-made` 이동, ③ 상단 nav 클릭 → 이동. 다크모드 토글·모바일 폭(≤720px)에서 깨지지 않음.

- [ ] **Step 5: 커밋**

```bash
git add content/index.mdx content/education/philosophy.mdx content/updates.ts
git commit -m "feat(content): 신뢰 페이지 진입점 연결(홈·철학·updates)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (작성자 체크)

**Spec coverage:**
- §3 섹션 0~7 → Task 2 Step 1 MDX의 8개 섹션 ✓
- §4 비스포크 컴포넌트(인터랙티브 게이트·점수카드) → Task 1 ✓
- §5 정량 근거(출처 고정) → Task 2 CardGrid + 출처 인용 ✓
- §6 한 주장 추적(Mermaid) → Task 2 Mermaid ✓
- §2 진입점 3곳 + nav 라벨 "문서가 만들어지는 법" → Task 2 Step 2, Task 3 ✓
- §7 파일 변경 전부 → Task 1~3 ✓
- §9 검증 기준(build·lint:tone·3진입점·루브릭 정합·다크/모바일) → 각 Task 검증 스텝 ✓

**Placeholder scan:** 모든 코드 블록은 실제 내용. TBD/TODO 없음 ✓

**Type consistency:** `PromotionPipeline` props 없음, `open` 상태 `'quality'|'promotion'|null`, `GATE_ORDER` 인덱스가 STAGES 사이 게이트와 매핑. `RUBRICS` 키와 `open` 값 일치 ✓
