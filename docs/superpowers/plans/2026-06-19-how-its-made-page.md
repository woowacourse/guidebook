# "이 문서는 어떻게 만들어지는가" 페이지 Implementation Plan

> 설계: `docs/superpowers/specs/2026-06-19-how-its-made-page-design.md`

**Goal:** 외부 독자에게 이 문서가 실험 로그에서 귀납되고 루브릭 게이트로 검증되며 수정됨을 시각적으로 보여주는 독립 신뢰 페이지.

**Architecture:** Nextra 4 MDX 페이지 1개 + 인터랙티브 비스포크 컴포넌트 `PromotionPipeline` 1개 + 기존 컴포넌트 재사용(Mermaid·CardGrid·RecentUpdates·Callout). 3개 진입점(홈·nav·철학).

## Global Constraints
- 본문 합니다체(`npm run lint:tone`). 컴포넌트 `'use client'` + CSS Module + `:global(.dark)`.
- 루브릭 차원·점수는 `.claude/log-quality-rubric.md`(25)·`.claude/promotion-rubric.md`(20)와 1:1.
- 액센트 `#4285f4`. 신규 MDX frontmatter(id/summary/last_verified). `content/updates.ts`·`_meta.ts` 갱신.
- 컴포넌트 테스트 하네스 없음 → 검증은 build·lint:tone·dev 렌더.

## Tasks
1. **PromotionPipeline 컴포넌트** — `components/PromotionPipeline.tsx`+`.module.css`, `components/index.ts`·`mdx-components.tsx` 등록.
2. **페이지** — `content/how-its-made.mdx`(8섹션), `content/_meta.ts` nav 항목(`type:'page'`, "문서가 만들어지는 법").
3. **진입점** — `content/index.mdx` 홈 카드, `content/education/philosophy.mdx` 교차링크, `content/updates.ts` 항목.
4. **검증** — `npm run build && npm run lint:tone`, 3진입점·다크·모바일 확인.

## 실행 노트
- 공유 워킹 디렉터리에서 병렬 커밋(knowledge→llm-wiki 마이그레이션)이 미커밋 파일을 흡수/삭제하는 충돌이 발생 → 격리 worktree(`worktree-how-its-made`, base `origin/main` 17bd904)로 이동해 재구성.
