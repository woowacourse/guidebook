# 연도별 커리큘럼 변화 (Curriculum Year-over-Year Evolution) — 설계

> 작성일: 2026-06-16 · 상태: **리뷰 대기 (draft)** · 작성: brainstorming 세션
>
> 본 문서는 합의된 설계의 단일 기록이다. 구현은 사용자 승인 후 `writing-plans`로 넘어간다.

## 1. 배경 / 문제

`content/education/curriculum/` 의 5개 페이지(개요·설계 원칙·레벨 구성·미션 설계·개선 프로세스)는 대부분 `<Placeholder>` 스텁이다. 우테코 커리큘럼이 매 기수 피드백으로 **진화한다**는 사실이 문서에 드러나지 않는다.

목표는 **"연도별로 커리큘럼이 어떻게 변화했는가"를 독자 중심으로, 최대한 심플하게** 보여주는 것이다. 자세한 원본은 `knowledge/`(LLM 위키)에 두고, 웹 페이지에는 거기서 distill 한 요약만 노출한다.

## 2. 합의된 핵심 결정 (사용자 확정)

| 결정 | 선택 | 근거 |
|------|------|------|
| 이야기 축 | **연도별 전경 스냅샷** | "그 해 커리큘럼은 이런 모습이었다"를 타임라인으로. 가장 직관적·심플. |
| 트랙 구조 | **통합 프로그램 타임라인** | 한 타임라인에 전체 커리큘럼 변화 요약. 트랙별 세부는 상세로. 데이터 불균형에 강함. |
| 구현 방식 | **Approach 1 — 데이터 주도 `.ts` + 컴포넌트** | `logs.ts`→`<LogList>`, `repositories.ts`→`<RepoList>` 와 동일한 저장소 컨벤션. |

## 3. 핵심 제약 (조사로 확인)

- **`knowledge/` 는 웹에 서빙되지 않는다.** Nextra `contentDirBasePath: '/'` 로 `content/` 만 렌더. → 웹 카드는 knowledge 노트를 링크할 수 없고, 자체 distill 사본을 가져야 한다.
- **데이터 깊이가 최근으로 갈수록 쏠려 있다.** 연도 언급: 2021(20) → 2026(232). 가장 단단한 출처는 react-payments 5년 분석(2021–2026 연도별 실데이터).
- **트랙은 셋 다 있으나 불균형**: FE(29 files) > BE(19) > Android(10).

## 4. 아키텍처 / 데이터 흐름

```
knowledge/raw/        1차 자료 (2026-05-26-react-payments-555prs-analysis.md, mission-design 등)
      │  /지식정제 (합성·큐레이션)
      ▼
knowledge/wiki/curriculum-evolution.md     ← 원본/detail (연도별 섹션 + 근거·출처). LLM 질의 대상.
      │  사람이 한두 줄로 distill
      ▼
content/curriculum-history.ts              ← 웹의 단일 진실 원천 (요약 데이터)
      │
      ▼
components/CurriculumTimeline.tsx          ← 기존 <Timeline>/<TimelineItem> 위 얇은 매퍼
      │
      ▼
content/education/curriculum/evolution.mdx ← <CurriculumTimeline /> + 짧은 인트로 (심플)
```

원본 깊이는 `knowledge/` 에만 존재한다. 웹은 항상 distill 한 요약만 보여준다 — 사용자 요구("원본은 knowledge, 웹은 심플")와 1:1 대응.

## 5. 데이터 모델 — `content/curriculum-history.ts`

```ts
export interface CurriculumYear {
  year: number             // 2021–2026
  cohort?: string          // '4기' 등 — 알 때만
  headline: string         // 그 해 한 줄 요약: "에러 처리·테스트가 기준이 된 해"
  change: string           // 전년 대비 가장 큰 변화 한 줄
  highlights: string[]     // 2–4 불릿 (레벨/미션/주제 키 변화)
  depth: 'sparse' | 'rich' // 데이터 신뢰도 — 빈약한 해를 솔직히 표시
  detailHref?: string      // 더 깊이 → 웹에 존재하는 로그/인사이트만 (예: react-payments 분석)
}

const curriculumHistory: CurriculumYear[] = [ /* 오래된→최신 */ ]
export default curriculumHistory
```

**`depth` 가 이 설계의 하중을 받는 결정이다.** 단순 연도 타임라인은 모든 해가 동등하게 기록된 것처럼 보이게 만드는데, 데이터는 2021→2026 으로 11배 쏠려 있다. 데이터 신뢰도를 스키마에 박아넣어 UI가 구조적으로 정직하게 만든다 — 얇은 해는 일부러 얇게 보이고, 보강은 플래그 하나 뒤집기.

## 6. 컴포넌트 — `components/CurriculumTimeline.tsx`

- 기존 `<Timeline>/<TimelineItem>` 프리미티브 위 얇은 데이터 매퍼. **새 CSS 최소화.**
- 카드 1개 = `연도 + 기수 배지` · **headline(굵게)** · `change` 한 줄 · `<Toggle>` 로 `highlights` 펼침 · 있으면 `자세히 →` 링크(`detailHref`).
- 정렬: **오래된 → 최신** (누적·진화 서사). 가장 최근 해는 `status="active"` 로 강조.
- `depth: 'sparse'` 카드는 muted 스타일 + "기록 보강 중" 칩. `'rich'` 는 기본 강조.

## 7. 리더 페이지 / 배치

- 새 페이지 `content/education/curriculum/evolution.mdx`: 인트로 2–3문장(우테코 커리큘럼은 매 기수 진화한다 + 읽는 법) + `<CurriculumTimeline />`. 그게 전부.
- 기존 4개 하위 페이지는 "구조" 축으로 그대로 둔다. 새 타임라인은 "진화" 축. 둘은 상호 링크.
- 커리큘럼 `index.mdx` 의 CardGrid 에 "연도별 변화" 카드 1개 추가해 진입점 제공.

## 8. 시드 데이터 계획 (정직하게)

- react-payments 5년 분석이 2021–2026 실척추를 제공(특히 FE). mission-design 등 raw 가 프로그램 레벨 신호 보강.
- 첫 출시 신뢰도: **2021–2024 `sparse`, 2025–2026 `rich`.**
- 카피에 "계속 보강되는 살아있는 기록"임을 명시. 없는 것을 있는 척하지 않는다.

## 9. knowledge 측 (원본 생성)

- `knowledge/wiki/curriculum-evolution.md` 신규 — 연도별 섹션, 근거·출처(react-payments 분석 등) 포함. `/지식정제` 로 합성.
- **범위: 커리큘럼 관련 raw 만 골라 정제** (62~66개 전체가 아니라). 훅이 요청하는 백로그를 이 작업이 일부 소비한다.
- `knowledge/index.md` 에 노트 등록.

## 10. 등록 체크리스트 (CLAUDE.md 규약)

- [ ] `content/education/curriculum/_meta.ts` — `evolution: '연도별 변화'` 항목 추가
- [ ] `content/education/curriculum/index.mdx` — CardGrid 에 진입 카드 추가
- [ ] `content/updates.ts` — 새 문서 항목 맨 위 추가
- [ ] `mdx-components.tsx` + `components/index.ts` — `CurriculumTimeline` 등록
- [ ] `knowledge/index.md` — `curriculum-evolution` 노트 등록
- [ ] (logs.ts 무관 — 로그 아님)

## 11. 열린 결정 → 기본값 (사용자가 뒤집을 수 있음)

| # | 결정 | 기본값 | 대안 |
|---|------|--------|------|
| 1 | 타임라인 정렬 | 오래된→최신 (진화 서사) | 최신 우선 |
| 2 | 축 단위 | 연도(2021–26) + 기수 배지 병기 | 기수 중심 |
| 3 | 배치 | 새 `evolution.mdx` 페이지 + index 카드 | index 자체를 타임라인으로 교체 |
| 4 | knowledge 합성 범위 | 커리큘럼 관련 raw 만 타깃 정제 | 62~66 전체 먼저 정제 |

## 12. 검증

- `npm run build` 성공 (llms.txt / llms-full.txt 자동 재생성 포함).
- 페이지 렌더 확인: 타임라인 표시, `sparse`/`rich` 스타일 구분, `<Toggle>` 펼침, `detailHref` 링크 동작.
- 로컬 dev 서버에서 시각 확인 (run 스킬).
- `_meta.ts` 사이드바 노출, index 카드 진입 동작.

## 13. 구현 순서 (상위 — 상세는 writing-plans 에서)

1. `knowledge/wiki/curriculum-evolution.md` 합성 (`/지식정제` 타깃 범위) + `knowledge/index.md` 등록.
2. `content/curriculum-history.ts` 작성 (위 노트에서 distill, 2021–2026 시드).
3. `components/CurriculumTimeline.tsx` 작성 + 등록(`mdx-components.tsx`, `components/index.ts`).
4. `content/education/curriculum/evolution.mdx` 작성.
5. `_meta.ts` · `index.mdx` CardGrid · `updates.ts` 갱신.
6. `npm run build` + 시각 검증.

## 14. 리스크 / 비목표

- **비목표**: 트랙별 분리 타임라인, 주제 매트릭스 격자, 자동 생성 빌드 파이프라인(Approach 3) — 데이터가 더 쌓이면 재검토.
- **리스크**: 초기 데이터가 FE(react-payments)에 쏠려 통합 타임라인이 FE 편향. → `depth` 표시 + 카피로 완화하고, BE/Android 보강을 후속 과제로 명시.
