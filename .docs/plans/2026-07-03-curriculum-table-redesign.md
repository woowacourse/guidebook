# 커리큘럼 테이블 개편 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/education/curriculum`의 기수 스텝퍼 UI를 "현재 기수(8기) 4트랙×6레벨 테이블 + 과거 기수 델타 연표"로 교체한다.

**Architecture:** 데이터(`content/curriculum-history.ts`)의 타입을 확장해 델타 링크·셀 배지 앵커를 담고, `CurriculumTimeline` 컴포넌트를 상태 없는 정적 렌더(테이블+연표)로 재작성한다. 컴포넌트 이름·MDX 등록은 유지해 인터페이스를 고정한다. 스펙: `.docs/specs/2026-07-03-curriculum-table-redesign.md`.

**Tech Stack:** Next.js App Router + Nextra 4, CSS Modules, React Server Component(상태 제거로 `'use client'` 불필요).

## Global Constraints

- 본문·데이터 문자열은 합니다체(연표 델타는 명사형 종결 허용, 기존 데이터와 동일).
- AI 어휘 금지: `§`, '리듬', '단순한 X 모음이 아닙니다' 템플릿, em-dash 부연(`—`) 회피.
- 모바일 규칙: 가로 오버플로우 금지(스크롤은 `overflow-x: auto` 컨테이너 안에서만), 한글 `word-break: keep-all`, 터치 타깃 확보, hover 의존 금지.
- 다크 모드는 기존 패턴 `[data-theme='dark'] .x, :global(.dark) .x` 이중 선택자.
- 커스텀 링크 칩은 `text-decoration: none !important`(Nextra a:hover 밑줄 차단, Card 패턴).
- 커밋 메시지 끝: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. 푸시는 하지 않는다(요청 시에만).
- 이 저장소에 단위 테스트 인프라 없음. 태스크별 검증은 `npx tsc --noEmit`, 마지막에 `npm run build` + lint + Playwright 뷰포트 확인.

---

### Task 1: 데이터 모델 확장 + 컴포넌트·CSS 재작성

세 파일이 함께 바뀌어야 타입이 맞으므로 한 태스크·한 커밋으로 묶는다.

**Files:**
- Modify: `content/curriculum-history.ts` (전체 교체)
- Modify: `components/CurriculumTimeline.tsx` (전체 교체)
- Modify: `components/CurriculumTimeline.module.css` (전체 교체)

**Interfaces:**
- Consumes: 없음 (최상류).
- Produces: `CurriculumTimeline` 컴포넌트(props 없음, 기존과 동일 시그니처), `curriculum-history.ts`의 `CohortDelta`·`CohortHighlight` 타입과 `cohorts` 기본 export.

- [ ] **Step 1: `content/curriculum-history.ts` 전체 교체**

```ts
// 기수별 커리큘럼의 단일 진실 원천 (웹 표시용).
//
// 원본/상세는 llm-wiki/wiki/curriculum-evolution.md, 레벨 골격은 공식 트랙 페이지
// (woowacourse.io/{frontend,backend,android,softskill}) 기반.
//
// 구조: 현재 기수(current)는 트랙×레벨 테이블로, 과거 기수는 델타 연표로 렌더된다.
//   - 레벨 0~5 골격은 트랙별로 거의 안정적이라 LEVELS_BY_TRACK 에 한 번만 정의(현재 기준).
//   - 매년 바뀐 미션·강조점은 각 기수의 core[] 에 담고, link 로 실험 로그와 잇는다.
//   - 현재 기수의 highlights[] 는 올해 새로 얹힌 층을 테이블 셀(트랙×레벨) 배지로 표시한다.
//   - depth 'sparse' = 핵심 데이터가 얇음("기록 보강 중"). 'rich' = 교차 확인됨.
// 트랙 시작: 웹 백엔드 1기~, 웹 프론트엔드 3기(2021)~, 안드로이드 5기(2023)~, 소프트스킬 6기(2024)~.
// 1~6기 델타 수치는 FE 페이먼츠 미션 555 PR 분석 중심의 부분 관측(원본 위키의 한계 명시를 따름).

export type TrackKey = '웹 프론트엔드' | '웹 백엔드' | '안드로이드' | '소프트스킬'

export const TRACK_ORDER: TrackKey[] = [
  '웹 프론트엔드',
  '웹 백엔드',
  '안드로이드',
  '소프트스킬',
]

export interface CurriculumLevel {
  level: string // '레벨 0' ~ '레벨 5'
  stage: string // 단계 한 단어 (온보딩·기초·심화 …)
  name: string
  desc: string
}

export interface CohortDelta {
  text: string
  link?: { label: string; href: string }
}

export interface CohortHighlight {
  level: string // '레벨 0' ~ '레벨 5'
  tracks: TrackKey[] | 'all' // 'all' = 전 트랙 공통 → 해당 레벨 행 아래 스팬 줄로 렌더
  label: string
  href: string
}

export interface CurriculumCohort {
  gi: number // 기수
  year: number
  headline: string // 이 해를 한 줄로
  core: CohortDelta[] // 이 해에 얹힌 델타 (비면 연표에 헤드라인만)
  tracks: TrackKey[] // 그 기수에 존재한 트랙
  depth: 'sparse' | 'rich'
  current?: boolean // 현재 진행 중 기수 → 테이블로 렌더
  highlights?: CohortHighlight[] // current 기수의 테이블 셀 배지
}

// 레벨 0~5 골격 — 공식 트랙 페이지(현재 기준)에서 합성. 트랙별로 강조점이 다르다.
export const LEVELS_BY_TRACK: Record<TrackKey, CurriculumLevel[]> = {
  '웹 프론트엔드': [
    { level: '레벨 0', stage: '온보딩', name: '적응 · 기초', desc: '연극 온보딩으로 시작, 심리적 안정감 형성' },
    { level: '레벨 1', stage: '기초', name: '프로그래밍 기초', desc: 'HTML·CSS·JS 기본, 테스트 작성·리팩터링' },
    { level: '레벨 2', stage: '중급', name: 'React 애플리케이션', desc: '컴포넌트 설계, 상태 관리 라이브러리 활용' },
    { level: '레벨 3', stage: '협업', name: '팀 프로젝트', desc: '실제 개발 프로세스, 서비스 배포 경험' },
    { level: '레벨 4', stage: '심화', name: '심화 + 협업', desc: '레거시 리팩터링, 성능 최적화, 접근성, 배포 전략' },
    { level: '레벨 5', stage: '취업', name: '취업 준비', desc: '개인 학습 보충, 이력서, 기업 면담' },
  ],
  '웹 백엔드': [
    { level: '레벨 0', stage: '온보딩', name: '적응 · 기초', desc: '연극 온보딩으로 시작, 기초 개념' },
    { level: '레벨 1', stage: '기초', name: '프로그래밍 기초', desc: '콘솔 앱으로 핵심 역량 정립, 코드 가독성 강조' },
    { level: '레벨 2', stage: '웹', name: '웹 프로그래밍', desc: '웹 애플리케이션 구현, 백엔드 기술 학습' },
    { level: '레벨 3', stage: '협업', name: '팀 프로젝트', desc: '협업 프로세스, 기획·구현·실 사용자 배포' },
    { level: '레벨 4', stage: '심화', name: '심화 웹 + 팀', desc: '레거시 리팩토링, 시스템 아키텍처, CS 기초' },
    { level: '레벨 5', stage: '취업', name: '개인 학습 & 취업', desc: '역량 보완, 이력서, 레벨 인터뷰, 리크루팅 데이' },
  ],
  '안드로이드': [
    { level: '레벨 0', stage: '온보딩', name: '적응 · 기초', desc: '연극 온보딩으로 시작, 코틀린 문법' },
    { level: '레벨 1', stage: '기초', name: '프로그래밍 기초', desc: '코틀린 문법, 코드 품질 향상' },
    { level: '레벨 2', stage: '입문', name: '모바일 개발 입문', desc: '안드로이드 프레임워크, UI, 테스트, 서버 통신' },
    { level: '레벨 3', stage: '협업', name: '팀 협업 프로젝트', desc: '의존성 주입, 비동기 프로그래밍, 선언형 UI' },
    { level: '레벨 4', stage: '심화', name: '팀 프로젝트 심화', desc: '아키텍처·심화 협업 (레벨 3~4 연속)' },
    { level: '레벨 5', stage: '취업', name: '취업 준비', desc: '이력서, 인터뷰, 기업 매칭' },
  ],
  '소프트스킬': [
    { level: '레벨 0', stage: '적응', name: '적응', desc: '연극 온보딩 미션: 심리적 안정감·신뢰 구축' },
    { level: '레벨 1', stage: '마인드셋', name: '마인드셋 전환', desc: '기존 마인드셋 점검 → 협력 중심 사고' },
    { level: '레벨 2', stage: '개인', name: '개인 역량 강화', desc: '강점·약점 인식, 목표 설정, 피드백 성장' },
    { level: '레벨 3', stage: '협업', name: '협업 역량', desc: '협업 소프트스킬 정의·실천 (팀 프로젝트)' },
    { level: '레벨 4', stage: '지속', name: '지속 성장', desc: '피드백 중심 성장, 글쓰기 문화(테코톡)' },
    { level: '레벨 5', stage: '취업', name: '취업 준비', desc: '이력서, 면접 특강, 레벨 인터뷰' },
  ],
}

const BE_ONLY: TrackKey[] = ['웹 백엔드']
const BE_FE: TrackKey[] = ['웹 프론트엔드', '웹 백엔드']
const PLUS_ANDROID: TrackKey[] = ['웹 프론트엔드', '웹 백엔드', '안드로이드']
const ALL_TRACKS: TrackKey[] = ['웹 프론트엔드', '웹 백엔드', '안드로이드', '소프트스킬']

const PAYMENTS_LOG = {
  label: '555 PR 분석',
  href: '/education/logs/react-payments-555prs-analysis',
}

// 오래된 → 최신. 렌더 순서는 컴포넌트가 정한다(연표는 최신순).
const cohorts: CurriculumCohort[] = [
  {
    gi: 1, year: 2019, headline: '우아한테크코스의 시작',
    core: [{ text: '웹 백엔드 단일 트랙, 10개월 과정의 원형이 만들어진 해' }],
    tracks: BE_ONLY, depth: 'sparse',
  },
  {
    gi: 2, year: 2020, headline: '과정 정착기',
    core: [],
    tracks: BE_ONLY, depth: 'sparse',
  },
  {
    gi: 3, year: 2021, headline: '웹 프론트엔드 트랙 신설',
    core: [
      { text: '웹 프론트엔드 과정 신설' },
      { text: '페이먼츠 미션 개설: 폼·커스텀 훅·컴포넌트 분리 중심, 이후 5년 최장수 미션', link: PAYMENTS_LOG },
    ],
    tracks: BE_FE, depth: 'sparse',
  },
  {
    gi: 4, year: 2022, headline: '배포 경험의 도입',
    core: [
      { text: 'FE 3단계(라이브러리 배포) 도입, 페이먼츠 PR 47개→117개 급증' },
      { text: 'TypeScript 언급 비중 19%→44%' },
    ],
    tracks: BE_FE, depth: 'sparse',
  },
  {
    gi: 5, year: 2023, headline: '안드로이드 트랙 신설',
    core: [
      { text: '안드로이드(모바일) 트랙 신설' },
      { text: 'FE Storybook 문화 정착(81%), 컴포넌트 단위 사고 확산' },
    ],
    tracks: PLUS_ANDROID, depth: 'sparse',
  },
  {
    gi: 6, year: 2024, headline: '소프트스킬 트랙 신설',
    core: [
      { text: '소프트스킬을 정식 트랙으로 분리·신설' },
      { text: 'FE 3단계 축소, 곁가지를 쳐내고 기본기에 집중' },
    ],
    tracks: ALL_TRACKS, depth: 'sparse',
  },
  {
    gi: 7, year: 2025, headline: '"동작"에서 "책임"으로',
    core: [
      { text: '에러 처리·테스트가 사실상 필수로 상향: testing 28%→94%, error-handling 11%→98%', link: PAYMENTS_LOG },
      { text: 'PR이 사고 과정 공유의 장으로: 본문 평균 3,154자' },
    ],
    tracks: ALL_TRACKS, depth: 'rich',
  },
  {
    gi: 8, year: 2026, headline: '서버 경계 설계 + AI 협업 미션',
    core: [
      { text: '페이먼츠 미션을 비동기·서버 통신·통합 테스트로 재설계: async 1%→99%, MSW 6%→99%', link: PAYMENTS_LOG },
      { text: '레벨1에 AI 협업 미션(Gemini Canvas) 신설, 전 트랙 공통', link: { label: '미션 설계 기록', href: '/education/logs/mission-design' } },
    ],
    tracks: ALL_TRACKS, depth: 'rich', current: true,
    highlights: [
      { level: '레벨 1', tracks: 'all', label: 'AI 협업 미션 신설: 1주 만에 만들어 배포하는 경험 (전 트랙 공통)', href: '/education/logs/mission-design' },
      { level: '레벨 2', tracks: ['웹 프론트엔드'], label: '페이먼츠 재설계: 비동기·서버 경계', href: '/education/logs/react-payments-555prs-analysis' },
    ],
  },
]

export default cohorts
```

- [ ] **Step 2: `components/CurriculumTimeline.tsx` 전체 교체**

상태가 없어졌으므로 `'use client'` 를 제거한다(서버 컴포넌트).

```tsx
import { Fragment } from 'react'
import cohorts, {
  LEVELS_BY_TRACK,
  TRACK_ORDER,
  type CohortDelta,
} from '../content/curriculum-history'
import styles from './CurriculumTimeline.module.css'

// content/curriculum-history.ts 를 두 섹션으로 렌더링한다.
// 1) 현재 기수: 트랙 4개 × 레벨 0~5 테이블 + 올해의 실험 배지(셀/스팬 줄)
// 2) 과거 기수: 헤드라인 + 델타 + 실험 링크의 압축 연표(최신순)
// 원본/상세는 llm-wiki/wiki/curriculum-evolution.md.

const LEVEL_COUNT = 6

function DeltaLine({ delta }: { delta: CohortDelta }) {
  return (
    <li>
      {delta.text}
      {delta.link && (
        <>
          {' · '}
          <a href={delta.link.href} className={styles.deltaLink}>
            {delta.link.label}
          </a>
        </>
      )}
    </li>
  )
}

export function CurriculumTimeline() {
  const current = cohorts.find((c) => c.current) ?? cohorts[cohorts.length - 1]
  const past = cohorts.filter((c) => c.gi !== current.gi).sort((a, b) => b.gi - a.gi)
  const tracks = TRACK_ORDER.filter((t) => current.tracks.includes(t))
  const highlights = current.highlights ?? []

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <span className={styles.headTitle}>지금의 커리큘럼</span>
        <span className={styles.headMeta}>
          {current.gi}기 · {current.year}
        </span>
        {current.current && <span className={styles.badgeNow}>진행 중</span>}
      </div>

      <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="트랙별 레벨 0~5 커리큘럼 표">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.levelCell} scope="col">레벨</th>
              {tracks.map((t) => (
                <th key={t} scope="col">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: LEVEL_COUNT }, (_, i) => {
              const levelLabel = `레벨 ${i}`
              const rowHl = highlights.filter((h) => h.level === levelLabel)
              const spanHl = rowHl.filter((h) => h.tracks === 'all')
              return (
                <Fragment key={levelLabel}>
                  <tr>
                    <th scope="row" className={styles.levelCell}>
                      <span className={styles.levelNum}>{i}</span>
                    </th>
                    {tracks.map((t) => {
                      const cell = LEVELS_BY_TRACK[t][i]
                      const cellHl = rowHl.filter(
                        (h) => h.tracks !== 'all' && h.tracks.includes(t)
                      )
                      return (
                        <td key={t}>
                          <span className={styles.cellName}>{cell.name}</span>
                          <span className={styles.cellDesc}>{cell.desc}</span>
                          {cellHl.map((h) => (
                            <a key={h.href} href={h.href} className={styles.hl}>
                              <span aria-hidden>★</span> {h.label}
                            </a>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                  {spanHl.map((h) => (
                    <tr key={h.href} className={styles.hlRow}>
                      <td colSpan={tracks.length + 1}>
                        <a href={h.href} className={styles.hl}>
                          <span aria-hidden>★</span> {h.label}
                        </a>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className={styles.legend}>★ 올해 새로 얹힌 층입니다. 누르면 실험 기록으로 이어집니다.</p>

      <div className={[styles.head, styles.headGap].join(' ')}>
        <span className={styles.headTitle}>커리큘럼이 쌓여 온 길</span>
        <span className={styles.headMeta}>
          {past[past.length - 1].gi}~{past[0].gi}기
        </span>
      </div>

      <ol className={styles.deltas}>
        {past.map((c) => (
          <li key={c.gi} className={styles.delta}>
            <div>
              <span className={styles.deltaGi}>{c.gi}기</span>
              <span className={styles.deltaYr}>{c.year}</span>
            </div>
            <div>
              <div className={styles.deltaHeadline}>
                {c.headline}
                {c.depth === 'sparse' && <span className={styles.chip}>기록 보강 중</span>}
              </div>
              {c.core.length > 0 && (
                <ul className={styles.deltaList}>
                  {c.core.map((d, idx) => (
                    <DeltaLine key={idx} delta={d} />
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.legend}>
        ▸ 1~6기의 델타는 FE 페이먼츠 미션 555개 PR 분석 중심의 부분 관측입니다. 백엔드·안드로이드의 연도별 기록은 모이는 대로 보강합니다.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: `components/CurriculumTimeline.module.css` 전체 교체**

```css
.root {
  margin: 20px 0;
}

/* ---------- 섹션 머리 ---------- */
.head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.headGap {
  margin-top: 36px;
}
.headTitle {
  font-weight: 800;
  font-size: 1.05rem;
}
.headMeta {
  color: #9ca3af;
  font-weight: 600;
  font-size: 0.9rem;
}
.badgeNow {
  align-self: center;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--accent-on);
  background: var(--accent-fill);
  padding: 2px 9px;
  border-radius: 999px;
}
.chip {
  align-self: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 9px;
  border-radius: 999px;
  white-space: nowrap;
}

/* ---------- 현재 기수 테이블 ---------- */
.tableWrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fafafa;
}
.table {
  width: 100%;
  min-width: 640px;
  border-collapse: separate; /* collapse 는 sticky 열에서 테두리가 밀린다 */
  border-spacing: 0;
  font-size: 0.88em;
  line-height: 1.55;
}
.table thead th {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: #6b7280;
  text-align: left;
  padding: 10px 12px;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}
.table tbody th,
.table tbody td {
  padding: 12px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid #e5e7eb;
  word-break: keep-all;
}
.table tbody tr:last-child th,
.table tbody tr:last-child td {
  border-bottom: 0;
}
.levelCell {
  position: sticky;
  left: 0;
  z-index: 1;
  width: 56px;
  min-width: 56px;
  background: #fafafa;
  color: var(--accent-text);
}
.levelNum {
  font-size: 1.05rem;
  font-weight: 800;
}
.cellName {
  display: block;
  font-weight: 700;
  font-size: 0.95em;
}
.cellDesc {
  display: block;
  color: #6b7280;
  font-size: 0.88em;
  margin-top: 2px;
}

/* 올해의 실험 배지 */
.hl {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--accent-subtle);
  color: var(--accent-text);
  font-weight: 700;
  font-size: 0.85em;
  line-height: 1.35;
  text-decoration: none !important; /* Nextra a:hover 밑줄 차단 (Card 패턴) */
  word-break: keep-all;
}
.table .hlRow td {
  /* .table tbody td 보다 명시도가 높아야 패딩이 먹는다 */
  padding-top: 0;
}

/* ---------- 과거 기수 델타 연표 ---------- */
.deltas {
  list-style: none;
  margin: 0;
  padding: 0;
}
.delta {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 14px;
  padding: 13px 0;
  border-top: 1px solid #e5e7eb;
}
.delta:first-child {
  border-top: 0;
}
.deltaGi {
  display: block;
  font-weight: 800;
  font-size: 0.95em;
  color: var(--accent-text);
}
.deltaYr {
  display: block;
  color: #9ca3af;
  font-size: 0.8em;
  font-weight: 600;
}
.deltaHeadline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-weight: 700;
  font-size: 0.95em;
}
.deltaList {
  margin: 6px 0 0;
  padding-left: 18px;
  font-size: 0.9em;
  color: #4b5563;
}
.deltaList li {
  margin: 3px 0;
  word-break: keep-all;
}
.deltaLink {
  font-weight: 600;
}

.legend {
  margin-top: 10px;
  font-size: 0.8em;
  color: #9ca3af;
}

/* ---------- 다크 모드 ---------- */
[data-theme='dark'] .tableWrap,
:global(.dark) .tableWrap {
  background: #232323;
  border-color: #333;
}
[data-theme='dark'] .table thead th,
:global(.dark) .table thead th {
  background: #1e1e1e;
  border-color: #333;
  color: #9ca3af;
}
[data-theme='dark'] .table tbody th,
[data-theme='dark'] .table tbody td,
:global(.dark) .table tbody th,
:global(.dark) .table tbody td {
  border-color: #333;
}
[data-theme='dark'] .levelCell,
:global(.dark) .levelCell {
  background: #232323;
}
[data-theme='dark'] .cellDesc,
:global(.dark) .cellDesc {
  color: #9ca3af;
}
[data-theme='dark'] .delta,
:global(.dark) .delta {
  border-color: #333;
}
[data-theme='dark'] .deltaList,
:global(.dark) .deltaList {
  color: #9ca3af;
}
[data-theme='dark'] .chip,
:global(.dark) .chip {
  background: #2c2c2c;
}
```

- [ ] **Step 4: 타입 검사**

Run: `npx tsc --noEmit`
Expected: 오류 0개 (경고 없음, 종료 코드 0)

- [ ] **Step 5: 커밋**

```bash
git add content/curriculum-history.ts components/CurriculumTimeline.tsx components/CurriculumTimeline.module.css
git commit -m "feat(커리큘럼): 기수 스텝퍼를 트랙×레벨 테이블 + 델타 연표로 교체

현재 기수(8기)는 4트랙 × 레벨 0~5 테이블로 한눈에 비교하고, 올해의
실험(AI 협업 미션·페이먼츠 재설계)은 셀 배지로 위치까지 표시한다.
과거 1~7기는 헤드라인 + 델타 + 실험 링크의 압축 연표로. 델타 내용은
llm-wiki curriculum-evolution.md 의 연도별 실측 수치를 반영했다.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: 본문 카피 + updates.ts 갱신

**Files:**
- Modify: `content/education/curriculum/index.mdx:56` (한 단락)
- Modify: `content/updates.ts:10` (배열 맨 위에 항목 추가)

**Interfaces:**
- Consumes: Task 1의 새 `<CurriculumTimeline />` 렌더 결과(테이블+연표).
- Produces: 없음 (말단).

- [ ] **Step 1: index.mdx 56행 단락 교체**

기존:

```
아래에서 기수를 눌러 보면, 레벨 0~5라는 뼈대는 그대로인데 **'이 해의 핵심'만 한 층씩 바뀝니다.** `기록 보강 중`이라고 적힌 기수는 아직 자료가 부족한 해라, 데이터가 모이는 대로 채워 갑니다.
```

교체:

```
아래 표가 지금 굴러가는 8기 커리큘럼의 전체 골격입니다. 네 트랙을 나란히 놓고 보면 같은 레벨에서 트랙마다 무엇을 기르는지 비교할 수 있습니다. 표 안의 ★ 배지가 올해 새로 얹힌 층이고, 누르면 그 실험의 기록으로 이어집니다. 표 아래 연표에는 1기부터 이 골격 위에 해마다 무엇이 얹혔는지를 적었습니다. `기록 보강 중`이라고 적힌 기수는 아직 자료가 부족한 해라, 데이터가 모이는 대로 채워 갑니다.
```

- [ ] **Step 2: updates.ts 배열 맨 위에 항목 추가**

```ts
  {
    date: '2026년 8기',
    title: '커리큘럼: 트랙×레벨 테이블과 델타 연표로 개편',
    description:
      '기수 탭을 넘기던 커리큘럼 화면을 두 층으로 다시 짰습니다. 지금 굴러가는 8기 커리큘럼은 4개 트랙 × 레벨 0~5 표로 한눈에 비교하고, 올해 새로 얹힌 실험은 표 안 배지로 위치까지 보여줍니다. 1~7기는 해마다 무엇이 얹혔는지의 연표로 압축했습니다.',
    href: '/education/curriculum',
    status: 'active',
  },
```

- [ ] **Step 3: 타입 검사**

Run: `npx tsc --noEmit`
Expected: 오류 0개

- [ ] **Step 4: 커밋**

```bash
git add content/education/curriculum/index.mdx content/updates.ts
git commit -m "docs(커리큘럼): 본문 카피를 새 테이블 UI에 맞게 수정 + 최근 업데이트 항목 추가

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 검증 (빌드·린트·뷰포트·다크 모드)

**Files:** 없음 (수정 발생 시 해당 파일 소급 수정)

**Interfaces:**
- Consumes: Task 1·2의 전체 결과.
- Produces: 검증 통과 확인. 실패 시 원인 파일 수정 후 재검증.

- [ ] **Step 1: 프로덕션 빌드**

Run: `npm run build`
Expected: 빌드 성공, `/education/curriculum` 프리렌더 오류 없음

- [ ] **Step 2: 문체·코드펜스 린트**

Run: `npm run lint:tone && npm run lint:codefence`
Expected: 둘 다 통과 (수정 파일에서 신규 위반 0건)

- [ ] **Step 3: 모바일·다크 확인 (`/모바일점검` 프로토콜)**

dev 서버(`localhost:3001`)에서 Playwright로 `/education/curriculum` 을 375·360·640px 뷰포트로 열어 확인:
- 페이지 본문에 가로 스크롤 없음 (`document.documentElement.scrollWidth <= innerWidth`)
- 테이블은 `tableWrap` 내부에서만 가로 스크롤, 레벨 열 sticky 동작
- ★ 배지 줄바꿈·글자 잘림 없음, 다크 모드에서 테이블 배경·경계선 확인
Expected: 위 항목 전부 통과. 데스크톱(1280px) 라이트/다크 스크린샷 확보.

- [ ] **Step 4: 앵커 생존 확인**

Run: `grep -rn "쌓아-올리는-학습" content/ | grep -v curriculum/index.mdx`
Expected: 참조하는 쪽(growth-arc.ts 등)이 있고, index.mdx 의 `## 쌓아 올리는 학습` 헤딩이 유지돼 앵커가 살아 있음

- [ ] **Step 5: 잔여 수정이 있었으면 커밋**

```bash
git add -u && git commit -m "fix(커리큘럼): 검증 중 발견한 표시 문제 보정

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
