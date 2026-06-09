# Knowledge Wiki Log

`knowledge/` 의 운영 일지. append-only, 최신이 위.

**형식**: `## [YYYY-MM-DD] event | target`
**event 종류**: `ingest` | `lint` | `promote` | `refactor` | `bootstrap`

본문은 한 단락 이내. 길어지면 wiki 노트로 빼고 여기엔 링크만.

---

## [2026-06-09] compile (자동) | raw 5개 → wiki 9 신규 + 3 갱신 (사이클 1)

`/지식정제 자동` 첫 사이클. lastCompileCommit (#16, 7804c536) 이후 추가된 38개 raw 중 오래된 순으로 batchSize(5) 처리.

처리 대상 5개:
- raw/2026-03-03-mission-design.md
- raw/2026-03-10-android-level0.md
- raw/2026-03-10-senior-code-review.md
- raw/2026-03-10-standardized-crew-coaching.md
- raw/2026-03-17-codelab-lotto-domain-ui.md

신규 wiki 노트 9개:
- 핵심 개념: coaching-first-principle-do-no-harm
- 디자인 패턴: structured-prompt-pattern, personal-utility-test, predict-observe-explain, as-is-judge-then-compare, standardized-learner-simulation
- 외부 영향: krashen-i-plus-one, kolb-experiential-learning, piaget-cognitive-conflict

갱신 wiki 노트 3개:
- measurable-learning-goal (+android-level0, +personal-utility-test 링크)
- self-directed-learning (+android-level0)
- teach-by-silence (+codelab-lotto-domain-ui, +senior-code-review, +predict-observe-explain·as-is-judge-then-compare 링크)

위키 통계: 15 → 24 (정식 14 → 19 + stub 5).

자기 검증 5단계 모두 통과. 보류 3건 (peer-observation-by-suggestion, commit-confront-cycle, barrows-standardized-patient) 은 단일 사례라 단독 노트화 보류, 관련 노트 본문에 흡수.

다음 사이클: 33개 남음.

## [2026-06-09] ingest | Phase C — 일괄 마이그레이션 (34개, raw 9 → 43)

`content/` 의 raw-eligible 자료 전부를 `knowledge/raw/` 에 흡수. Phase A·B(9개) 이후 미반영 분 일괄 처리. `scripts/mdx-to-raw.mjs` 자동 변환 스크립트로 일관성 보장.

**실험 로그 29개 → `raw/` 루트** (logs.ts 등록 기준):
- 2026-04-28: writing-sessions
- 2026-04-14: coaching-squad-training-loop
- 2026-04-07: fe-accessibility-report, fe-ssr-discussion, fe-react-typescript-convention, layout-component-workshop, level3-team-project-retrospective-series
- 2026-03-27: ux-research-training, demo-day-retrospective, fe-level2-16steps, async-quiz-explanation, feedback-refactoring, growth-graph, team-building-ground-rules, finding-tech-strengths, reinventing-the-wheel, fe-performance-report, ux-lecture-level3
- 2026-03-24: web-backend-level1-elective-missions, expedition-tech-salon
- 2026-03-17: pair-programming-manifesto, soft-skill-one-step-study, codelab-lotto-domain-ui, drama-retrospective, drama-onboarding
- 2026-03-10: android-level0, senior-code-review, standardized-crew-coaching
- 2026-03-03: mission-design

**Posuta 대화 전사 5개 → `raw/conversations/`** (Whisper 원문):
- 2024-09-20 (포비 캡틴), 2025-04-18 (검프), 2025-05-02 (저스틴), 2025-05-16 (시지프), 2025-05-30 (디노)

raw 총 9 → **43** (raw 루트 38 + conversations 5).

**변환 도구**: `scripts/mdx-to-raw.mjs` — MDX frontmatter·import 제거, `<Callout>` → blockquote, `<Mermaid>` → 코드블록, 기타 JSX 제거, 본문 markdown 보존. `published_at` 으로 원본 mdx 추적.

**제외**: insights, tools, design-patterns, curriculum, philosophy 디렉터리 — 카파시 정통상 derived 자료이므로 raw 부적합. wiki 합성 후 별도 비교 대상으로 활용 가능.

다음: `/지식정제` 가 wiki 노트 폭증을 처리할 때 한 번에 너무 많이 끌어오지 않게 5~10개씩 점진 합성. 첫 우선순위 후보 — 코칭 패턴(posuta 5회 + senior-code-review + coaching-squad-training-loop + standardized-crew-coaching) 클러스터.

## [2026-06-09] ingest | Phase B 마이그레이션 (4개)

지난 OLD `/로그승격 자동` 사이클의 lastBatch.logs 6개 중 knowledge/raw/ 미반영 4개를 마이그레이션. Phase A (5개 시드) 와 동일 변환 규칙(MDX → 평문, Callout → blockquote, Mermaid → 코드블록) 적용.

- `raw/2026-05-19-android-level2-mini-project.md` (안드 레벨2 미니 프로젝트 4주 8회차 수업 계획, 평가 기준 = 선택 근거)
- `raw/2026-05-19-posuta-archive.md` (포비 캡틴 포수타 5회 전사 아카이브, 3층 구조: 원문/년도/메타)
- `raw/2026-05-19-posuta-coach-qa-archive.md` (포수타 5회 메타 분석, 8가지 반복 패턴, 우테코식 가이드 어법)
- `raw/2026-05-26-react-payments-555prs-analysis.md` (5년치 PR 555개 정량 분석, 24개 카테고리 시계열, 리뷰 코멘트 2,178건 테마 분류)

이번 흡수는 위키의 깊이를 강화한다 — 특히 코칭 어법(포수타 5회 메타·페이먼츠 555 PR 코멘트) 자료가 누적되어 다음 /지식정제 가 코칭 패턴 wiki 노트를 만들 수 있는 토양이 됨.

raw 총 5 → 9.

## [2026-06-09] promote | 보류 5개 → stub 노트로 승격

지난 compile 에서 wiki-compiler 가 자기 검증으로 보류 처리한 6개 중 5개를 **stub** 태그로 승격. 자매 raw 가 부족해 본격 노트는 안 되지만, 개념을 위키 그래프에 등록해 두면 다음 raw 흡수 시 자연스럽게 본격 노트로 진화 가능.

신규 stub (5):
- `wiki/knowledge-transfer-not-presentation.md` (sources: expedition) — 핵심 개념 그룹은 아니므로 미발달 섹션
- `wiki/stone-and-heen.md` (sources: thanks-feedback) — 인물·개체 그룹
- `wiki/pro-sdls-scale.md` (sources: crew-autonomy) — 외부 영향 그룹
- `wiki/wild-learning.md` (sources: expedition) — 미발달 섹션
- `wiki/psychological-safety-classroom.md` (sources: android-participatory) — 미발달 섹션

기존 6개 wiki 노트의 `links:` 복구 — 첫 compile 때 죽은 링크라 제거됐던 항목들이 이제 stub 으로 살아남:
- `self-directed-learning` ← + `pro-sdls-scale`, `wild-learning`
- `measurable-learning-goal` ← + `knowledge-transfer-not-presentation`, `wild-learning`
- `sdl-four-stage-framework` ← + `pro-sdls-scale`
- `feedback-trigger-recognition` ← + `stone-and-heen`
- `feedback-request-direct` ← + `stone-and-heen`
- `teach-by-silence` ← + `psychological-safety-classroom`

index.md 갱신: 인물·개체 1, 외부영향 +1, 미발달 3. 위키 총 10 → 15 노트.

미승격 1: `elective-mission-design` — 자매 raw (`web-backend-level1-elective-missions`) 가 아직 raw 에 없음. 그 raw 가 들어와야 노트로 만들 수 있음.

## [2026-06-09] query | "코치 강의 비중 줄이기 시작" (첫 query)

`/지식질의` 첫 실행. index.md 라우팅으로 wiki 노트 2개(`agent-debate-curriculum-design`, `teach-by-silence`)를 통째로 읽고 인용과 함께 답변. RAG 없이 위키 단위 라우팅이 작동하는지 첫 검증.

한계로 명시한 항목 (다음 흡수 표적):
- 다른 트랙 전환 사례 (일반화 신뢰도)
- 침묵으로 가르치기 책 핵심 발췌 또는 운영 후 회고

## [2026-06-09] lint | wiki 10개 검사 (첫 lint)

`/지식점검` 첫 실행. `wiki-linter` 에이전트가 4종 + 정합성 검사 수행.

발견: **모순 1건** — `wiki/declare-feedback-revise-cycle.md` 본문 첫 단락 "8기" 가 같은 노트 뒷부분과 raw·자매 노트(`page-level-technical-decision.md`)의 "7기" 와 충돌. wiki-compiler 합성 단계의 미세한 오기를 lint 가 즉시 포착.

발견 없음: 고아 0, 미생성 개념 0, 낡은 주장 0, 정합성 0.

조치: 같은 PR 안에서 "8기" → "7기" 수정 적용.

## [2026-06-09] refactor | declare-feedback-revise-cycle.md 기수 표기 수정

`/지식점검` 결과에 따라 "8기 FE 레벨4" → "7기 FE 레벨4" 한 줄 수정. raw 및 자매 wiki 노트와 일치.

## [2026-06-09] compile | raw 5개 → wiki 10개 (첫 합성)

`/지식정제` 첫 실행. `wiki-compiler` 에이전트가 5개 raw 를 읽고 10개 wiki 노트 draft 생성. 자기 검증으로 죽은 링크 6개 자체 발견하여 정리 후 반영.

신규 wiki 노트 (10개):
- `wiki/self-directed-learning.md` (sources: expedition + crew-autonomy)
- `wiki/measurable-learning-goal.md` (sources: expedition)
- `wiki/sdl-four-stage-framework.md` (sources: crew-autonomy)
- `wiki/declare-feedback-revise-cycle.md` (sources: fe-rendering-strategy-workshop)
- `wiki/page-level-technical-decision.md` (sources: fe-rendering-strategy-workshop)
- `wiki/teach-by-silence.md` (sources: android-participatory)
- `wiki/agent-debate-curriculum-design.md` (sources: android-participatory)
- `wiki/feedback-trigger-recognition.md` (sources: thanks-feedback-workshop)
- `wiki/feedback-request-direct.md` (sources: thanks-feedback-workshop)
- `wiki/implementation-intention.md` (sources: thanks-feedback-workshop)

`index.md` 갱신: 핵심 개념 2, 디자인 패턴 7, 외부 영향 1 (총 10라인).

에이전트 자체 보류 (다음 raw 누적 후 wiki 노트로 승격 검토):
- knowledge-transfer-not-presentation, stone-and-heen, pro-sdls-scale, wild-learning, psychological-safety-classroom, elective-mission-design

다음: 위키 거동 검증 — `/지식점검` 또는 `/지식질의` 로 lint·라우팅 테스트.

## [2026-06-09] ingest | Phase A 시드 마이그레이션 (5개)

기존 `content/education/logs/` 에서 다양성(phase·track·theme) 균형 잡힌 실험 로그 5개를 평문 마크다운으로 변환·복사. Karpathy 권고 "start with ten sources" 의 절반 규모로 위키 거동 검증용 시드.

- `raw/2026-03-10-expedition.md` — 원정대 (자기주도 학습 활동 설계, 코치훈련/소프트스킬)
- `raw/2026-04-07-fe-rendering-strategy-workshop.md` — FE 렌더링 전략 워크숍 (기술 결정 훈련, 레벨4)
- `raw/2026-04-27-crew-autonomy.md` — 선택 미션 자율성 효과 분석 (정량 분석, 레벨1 BE)
- `raw/2026-04-28-android-participatory.md` — 안드로이드 강의→참여 전환 (교수법 전환, 레벨2 안드로이드)
- `raw/2026-05-19-thanks-feedback-workshop.md` — 피드백 워크숍 (Stone & Heen, 레벨2 소프트스킬)

변환 규칙: MDX frontmatter·`import` 제거, `<Callout>` → blockquote, `{/* */}` 주석 제거. 본문 내용은 보존. frontmatter 에 `published_at` 으로 원본 추적 보장.

다음: 누적 5개 raw → `/지식정제` 로 wiki 노트 합성 시도 (PR 머지 후).

## [2026-06-09] bootstrap | knowledge/

Karpathy LLM Wiki 패턴(2026-04-03 Gist)으로 `knowledge/` 디렉터리 골격 생성.

- `raw/` + 하위 3개(`conversations/`, `external/`, `assets/`) — 실험 로그·회고는 raw 루트에 flat
- `wiki/` — 납작 구조, LLM 합성 노트
- `index.md` — 단일 컨텍스트 카탈로그
- `log.md` — 이 파일
- `AGENTS.md` — LLM 운영 스키마
- `README.md` — 팀 온보딩

기존 `content/` 는 그대로 두고 공존. 마이그레이션은 별도 단계.

출처: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
