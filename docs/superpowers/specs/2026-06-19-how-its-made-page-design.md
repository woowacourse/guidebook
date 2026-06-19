# 설계: "이 문서는 어떻게 만들어지는가" 신뢰 페이지

- **날짜:** 2026-06-19
- **작성:** brainstorming 세션 (im1@woowahan.com)
- **상태:** 설계 확정, 구현 완료

## 1. 목적과 배경

외부 독자는 이 문서의 **다듬어진 결과물**(철학·커리큘럼·검증된 패턴)만 봅니다. 그래서 "이건 그냥 멋진 말 아닌가? 위에서 내려온 선언이거나 AI가 뽑은 글 아닌가?"라는 의심이 *읽기 전에* 생깁니다. 이 문서의 콘텐츠는 실제로는 **아래에서 위로 승격**됩니다 — 실험 로그에서 귀납되고, 루브릭 점수와 게이트를 통과해야 올라가며, 새 로그가 쌓이면 언제든 수정됩니다. 이 페이지는 그 **제작 과정을 시각적으로 드러내** 신뢰도를 높입니다.

### 신뢰의 세 기둥
1. **귀납** — 주장은 위에서 떨어진 게 아니라 실험 로그에서 귀납된다.
2. **게이트** — 감이 아니라 루브릭 점수(품질 25점 / 승격 20점)와 임계값으로 승격된다.
3. **수정 가능** — 박제된 교리가 아니라 언제든 갱신되는 가설이다.

## 2. 위치 · 진입점 (확정)
- **라우트:** `/how-its-made` — 독립 최상위 페이지 (`content/how-its-made.mdx`)
- **상단 nav:** `type: 'page'`, 라벨 **"문서가 만들어지는 법"** (H1은 "이 문서는 어떻게 만들어지는가")
- **홈 진입:** `content/index.mdx` Hero 아래 진입 카드 1개
- **철학 교차링크:** `content/education/philosophy.mdx` 마무리 Callout에 "→ 어떻게 검증되는지 보기"
- **청중:** 외부 독자(회의적). **본문은 합니다체**.
- **차별화:** `research-cycle-workflow.mdx`(코치용·슬래시 커맨드)와 달리 독자용·신뢰 중심. 서로 교차링크.

## 3. 페이지 섹션 (파이프라인 조망형)
도입 → 승격 파이프라인(비스포크) → 게이트 설명 → 정량 근거(CardGrid) → 한 주장 추적(Mermaid) → 살아있는 문서(RecentUpdates) → 고정된 잣대(Callout) → 더 깊이(Card 링크).

## 4. 비스포크 컴포넌트 `PromotionPipeline`
repo 관례(TS + `.module.css` + `:global(.dark)`)로 작성, Folio의 autoresearch 점수카드 패턴 이식. 게이트 클릭 시 루브릭 점수카드 아코디언. **실제 `.claude/*-rubric.md`와 1:1.** 막대는 *특정 로그 점수가 아니라 통과선·차원 정의*를 보여줌(가짜 점수 비노출). 품질 5차원(D1~D5, 25점, 통과 16)·승격 4차원(P1~P4, 20점, 통과 16). 액센트 `#4285f4`, 다크모드·모바일 세로·`prefers-reduced-motion` 존중.

## 5. 정량 근거 (출처 고정)
`react-payments-555prs-analysis` 인용: 5년/555 PR · 215명 중 97% 재방문 · 코멘트 2,178건 중 51% 질문.

## 6. 파일 변경
신규: `content/how-its-made.mdx`, `components/PromotionPipeline.tsx`, `components/PromotionPipeline.module.css`
수정: `mdx-components.tsx`, `components/index.ts`, `content/_meta.ts`, `content/index.mdx`, `content/education/philosophy.mdx`, `content/updates.ts`

## 7. 범위 밖 (YAGNI)
풀 스크롤리텔링, Folio JSX 직접 import, 개별 로그 실점수 노출, 별도 stat-tile 컴포넌트.

## 8. 검증 기준
`npm run build` 통과 · `npm run lint:tone` 통과 · 3개 진입점 도달 · 루브릭 정합 · 다크/모바일 안 깨짐.
