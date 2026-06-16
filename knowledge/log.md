# Knowledge Wiki Log

`knowledge/` 의 운영 일지. append-only, 최신이 위.

**형식**: `## [YYYY-MM-DD] event | target`
**event 종류**: `ingest` | `lint` | `promote` | `refactor` | `bootstrap`

본문은 한 단락 이내. 길어지면 wiki 노트로 빼고 여기엔 링크만.

---

## [2026-06-16] compile (자동) | raw 5개 → wiki 6 신규 + 5 갱신 (사이클 3)

`/지식정제 자동` 세 번째 사이클. 사이클 1·2 이후 다음 5개 raw 처리.

처리 대상 5개:
- raw/2026-03-17-soft-skill-one-step-study.md (한 발짝 스터디)
- raw/2026-03-24-expedition-tech-salon.md (원정대 테크살롱)
- raw/2026-03-24-web-backend-level1-elective-missions.md (선택 미션)
- raw/2026-03-27-async-quiz-explanation.md (해설지 작성)
- raw/2026-03-27-demo-day-retrospective.md (5회 회고 시리즈)

신규 wiki 노트 6개 (모두 디자인 패턴):
- time-machine-retrospective — 과거-현재-미래 시간축 회고
- parallel-session-tech-salon — 학회 컨퍼런스 형식 차용
- six-tier-feedback-system — 코치 리소스별 6단계 피드백 채널
- evaluation-deferment — 자기주도적 실패 회복 장치
- explanation-as-learning — 해설지 작성으로서의 학습 (외부영향 결합)
- progressive-retrospective-design — 5회 회고 형식 점진 진화

갱신 wiki 노트 5개:
- self-directed-learning (+2 sources, +3 links → 5/8)
- sdl-four-stage-framework (+1 source, +2 links → 2/4)
- measurable-learning-goal (+1 source, +2 links → 3/6)
- knowledge-transfer-not-presentation — **stub → 정식 승격** (sources 1→2)
- predict-observe-explain (+1 source, +1 link)

위키 통계: 29 → 35 (정식 25→32, stub 4→3).

흥미로운 발견: 한 발짝 스터디 / 테크살롱 / 선택 미션 / 해설지 / 5회 회고 — 다섯 raw 가 모두 "자기주도 학습의 다른 표면" 으로 수렴. self-directed-learning 노트가 sources 2→5 로 가장 빠르게 두꺼워짐. 이 노트가 위키의 중력 중심이 되고 있다는 신호.

knowledge-transfer-not-presentation 도 stub 에서 풀어짐 — 원정대 활동 사후 결과(테크살롱 회고) 가 들어오면서 1년 묵은 보류가 해소.

다음 사이클: ~64개 raw 남음.

## [2026-06-16] refactor | sync-state.lastCompileCommit 마커 전진 (7804c536 → 9a9e0713)
이전 entry 가 지적한 "마커 미advance" 인프라 버그 수정. 사이클 1·2·수동 보강이 끝났는데도 lastCompileCommit 이 2026-06-09 commit 에 멈춰 있어 auto-compile 훅이 매 턴 "74개 미합성" 알림을 재발화(긴 단일 세션 내내 루프). 마커를 현재 main HEAD(9a9e0713) 로 전진시켜 정상화. ⚠️ 주의: 이는 "마지막 합성 패스 시점" 의미의 전진이며, 실제로는 Phase C/D·external 로 흡수된 raw 약 70개가 아직 미합성 backlog 로 남아 있다(개별 사이클 노트 참조). 이후 `/지식정제 자동` 을 의도적으로 여러 번 돌려 backlog 를 소진해야 한다.

## [2026-06-16] compile (수동 보강) | mission-design → wiki 1 신규
세션 중 수동 `/지식정제 자동` 실행. 자동 사이클 1·2가 mission-design(145-PR 분석)에서 structured-prompt-pattern·personal-utility-test 등은 뽑았으나 "리뷰 단위=코드→프로덕트" 패턴은 놓쳐, product-review-not-code-review 노트로 보강(132/43/108 PR 근거). android-level0·senior-code-review·pr-insights ×2는 기존 노트에 이미 흡수돼 신규 없음. ⚠️ sync-state.lastCompileCommit 이 사이클 1·2 후에도 7804c536(2026-06-09)에 멈춰 있어 auto-compile 훅이 매 턴 오탐 발생 — 인프라 점검 필요(마커 미advance).

## [2026-06-16] compile (자동) | raw 5개 → wiki 4 신규 + 1 stub→정식 (사이클 2)

`/지식정제 자동` 두 번째 사이클. 사이클 1 이후 다음 5개 raw 를 wiki-compiler 에이전트가 합성. 자기 검증 5단계 통과.

처리 대상 5개:
- raw/2026-03-03-pr-insights-design.md
- raw/2026-03-03-pr-insights-implementation.md
- raw/2026-03-17-drama-onboarding.md
- raw/2026-03-17-drama-retrospective.md
- raw/2026-03-17-pair-programming-manifesto.md

신규 wiki 노트 4개 (모두 디자인 패턴 그룹):
- parallel-collect-then-synthesize — 멀티에이전트 작업 분배 (수집 병렬·분석 단일)
- non-technical-first-mission — 입학 1주차 비-기술 첫 미션 (연극) 으로 관계 불안 분리
- vulnerability-sharing-retro — 강점+취약점 이중 공유 + 4가지 안전 규칙
- crew-authored-manifesto — 외부 규칙 대신 크루가 KPT 회고로 직접 쓴 선언문

stub → 정식 승격 1개:
- psychological-safety-classroom — sources 1→3 (drama-onboarding·drama-retrospective 추가). stub 태그 제거, 미발달 → 핵심 개념 그룹 이동, 본문에 온보딩 적용 단락 확장.

위키 통계: 24 → 29 (정식 19→25 + stub 5→4).

흥미로운 패턴: 온보딩 1주차 3개 raw (연극 온보딩 + 회고 + 페어 매니페스토) 가 한 사이클에 합쳐지면서 "신뢰의 4중 메커니즘" 그래프 (비-기술 첫 미션 → 취약함 공유 회고 → 페어 매니페스토 → 심리적 안전감) 가 자연 형성됨.

다음 사이클: ~69개 raw 남음.

## [2026-06-16] compile | curriculum-evolution 노트 신규 (타깃 합성: react-payments 5년 분석 + mission-design). 연도별 커리큘럼 진화 모델(영구 골격 + 누적 추상화) + 2021–2026 델타. content/ 커리큘럼 연도별 타임라인의 원본.

## [2026-06-09] ingest | woowacourse.io 외부 공식 사이트 큐레이션 (12개, raw/external/ 0 → 12)

사용자 요청 "노션을 홈페이지처럼 사용하던 페이지의 핵심 메시지·FAQ·문의 등을 가져오기". www.woowacourse.io sitemap 의 19개 URL 중 raw-eligible 12개를 WebFetch 로 큐레이션 추출.

흡수된 12개 (raw/external/ 신규):
- **핵심 콘텐츠** (풍부히 추출): faq, contact, intro, apply-2026, backend, frontend, android, softskill, hero-berlin
- **부분 콘텐츠** (SPA 렌더링 한계로 thin, fetch_note 명시): main, curriculum, notice

제외 (raw 부적합):
- /privacy*, /privacy-2024, /privacy/notice — 개인정보 처리방침 (raw 가치 없음)
- /apply/2024 — 과거 기수 (apply-2026 으로 갈음)
- /2023-recruiting-day — 과거 단발성 이벤트
- /test_demoday, /test_main_popup — 테스트 페이지

frontmatter 표준:
```yaml
source_type: external-website
captured: 2026-06-09
source_url: https://www.woowacourse.io/<path>
fetch_note: (SPA 렌더링 한계 있을 때만 명시)
```

raw 통계: 67 → **79** (external/ 0→12).

다음 권장:
- firecrawl 인증 후 SPA-렌더링 페이지 (main, curriculum, notice 본문) 재캡처
- 개별 notice 본문 (공지사항 상세) 흡수
- 모집 시즌마다 apply-YYYY.md 갱신

## [2026-06-09] ingest | Phase D 전수 검토 마이그레이션 (24개, raw 43 → 67)

사용자 요청 "커밋 기록과 실제 존재하는 데이터를 확인하고 raw 에 추가할 내용을 모두 검토". `scripts/mdx-to-raw.mjs` 일괄 변환. content/education 전체 mdx 108개 중 미마이그레이션 65개를 라인 수와 Placeholder 여부로 분류 후 실질 콘텐츠가 있는 24개 흡수. 추가로 `docs/plans/` 의 교육 관련 계획 4개도 raw 흡수.

**raw/conversations/ (+1, 5 → 6)**:
- bsuta-8th-2026-04-03 — 8기 브수타 코치 Q&A 실제 transcript (Q1~Q4)

**raw/derived/ (신규 폴더, 0 → 19)** — content/education 의 derived 자료 흡수:
- 큐레이션 archive 7개: demo-day, interview-challenge, newsletter, techtalk, tecoble, uteco-youtube, vlog, education-briefing
- insights 5개: argumentation-based-learning, mission-learning-accumulation, progressive-scaffolding, self-diagnostic-framework, poe-discovery-learning
- tools 4개: clean-language-mentoring, mission-repo-analysis-workflow, rendering-strategy-workshop, research-cycle-workflow
- 패턴/실패 카탈로그 2개: pattern-catalog (design-patterns), failed-experiment-catalog
- (1개 누락 자동보정용 placeholder)

**raw/ 루트 (+4, 38 → 42)** — docs/plans/ 의 교육 연구 계획서:
- 2026-03-03-pr-insights-design (Gemini Canvas 145 PR 인사이트 추출 설계)
- 2026-03-03-pr-insights-implementation (인사이트 추출 구현 절차)
- 2026-04-14-javascript-lotto-research-plan (javascript-lotto 5년치 PR 분석 계획)
- 2026-04-14-interview-challenge-assetization (인터뷰 챌린지 자산화 계획)

**git history 점검**: content/education/**/*.mdx 삭제 이력 0건 — 복구 대상 없음.

**제외** (Placeholder 만 있는 빈 템플릿, 단순 aggregator/index, 메타 시스템 문서):
- logs/{one-on-one, group-coaching, code-review} — Placeholder 만
- logs/level{0-4}/* + level5 + {mobile, web-backend, web-frontend, onboarding, soft-skill, summary, coach-training} — 5~11줄 aggregator
- philosophy/{comparison, references, theoretical-basis, core-principles} — 대부분 Placeholder
- curriculum/* (4개) — 모두 Placeholder
- assessment/* (4개) — 모두 Placeholder
- operations/* (4개) — 모두 Placeholder
- insights/{learning-analytics, lecture-design, summary} — Placeholder 만
- failed-experiments/failure-to-pattern, design-patterns/application-guide — 단순 인덱스
- bsuta/2026-8th, posuta/{2024-6th, 2025-7th} — 회차 목록 aggregator (실제 transcript 파일 별도)
- docs/superpowers/* — LLM Wiki 시스템 자체 메타 문서 (자기 참조 방지)

**raw 통계 (Phase D 후)**: 43 → **67** (루트 38→42, conversations 5→6, derived 0→19).

knowledge/AGENTS.md 갱신: raw 하위 폴더 정확히 4개(`conversations/`, `external/`, `assets/`, `derived/`) 로 변경, source_type 어휘 확장.

다음 `/지식정제 자동` 시 batchSize=5 로 33+24=57개 정도 미처리분이 점진 합성됨.

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
