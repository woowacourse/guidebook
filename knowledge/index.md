# Knowledge Wiki Index

> Last updated: 2026-06-16 · 25 articles (20 정식 + 5 stub) · 14 raw sources (raw 13 + posuta 5)

이 파일은 `wiki/` 안 모든 노트의 한 줄 카탈로그다. LLM은 질의 응답 시 먼저 이 파일을 읽고, 어떤 wiki 노트를 통째로 열지 결정한다.

**핵심 제약: 단일 컨텍스트 윈도우에 들어가는 크기를 유지한다.** 노트당 한 줄. 단락 설명 금지.

**포맷**:
- `- [slug](wiki/slug.md) — 한 줄 요약. (sources: N, updated: YYYY-MM-DD)`

새 wiki 노트가 추가되면 반드시 **같은 턴에** 여기 등록한다.

---

## 핵심 개념

- [coaching-first-principle-do-no-harm](wiki/coaching-first-principle-do-no-harm.md) — 코치의 마음 상태도 코칭의 변수다. 미숙할 때는 미루고, 정답보다 인식을 먼저 본다. (sources: 1, updated: 2026-06-09)
- [curriculum-evolution](wiki/curriculum-evolution.md) — 우테코 커리큘럼은 영구 골격을 유지한 채 매년 새 학습 목표를 한 층씩 누적하며 진화한다. (sources: 2, updated: 2026-06-16)
- [feedback-trigger-recognition](wiki/feedback-trigger-recognition.md) — 피드백 반응의 차이는 메시지가 아니라 듣는 사람 안의 사실·관계·정체성 트리거에서 온다. (sources: 1, updated: 2026-06-09)
- [self-directed-learning](wiki/self-directed-learning.md) — 환경·측정·선택이 함께 작동해야 자기주도성이 생긴다. (sources: 3, updated: 2026-06-09)

## 디자인 패턴

- [agent-debate-curriculum-design](wiki/agent-debate-curriculum-design.md) — 기존 방식과 새 방향을 각각 AI 에이전트로 모델링해 토론시키는 커리큘럼 설계법. (sources: 1, updated: 2026-06-09)
- [as-is-judge-then-compare](wiki/as-is-judge-then-compare.md) — AS-IS만 먼저 보고 자기 판단을 내린 뒤 TO-BE와 비교해 "못 보던 것"을 드러낸다. (sources: 1, updated: 2026-06-09)
- [declare-feedback-revise-cycle](wiki/declare-feedback-revise-cycle.md) — 기술 결정을 선언·팀×팀 피드백·개정의 3단으로 검증한다. (sources: 1, updated: 2026-06-09)
- [feedback-request-direct](wiki/feedback-request-direct.md) — SSCC 4질문 + 페어 증인 + 7일 약속으로 수동 수신을 능동 요청으로 뒤집는다. (sources: 1, updated: 2026-06-09)
- [measurable-learning-goal](wiki/measurable-learning-goal.md) — 작다·깊다·실행가능·측정가능 4조건을 만족하는 학습 목표만 자기주도로 작동한다. (sources: 2, updated: 2026-06-09)
- [page-level-technical-decision](wiki/page-level-technical-decision.md) — 기술 결정을 페이지·기능·의존성 단위로 쪼개 사고 해상도를 높인다. (sources: 1, updated: 2026-06-09)
- [personal-utility-test](wiki/personal-utility-test.md) — "본인이 실제로 이 앱을 쓸 것인가?" 단일 질문으로 문제 정의의 진정성을 점검한다. (sources: 1, updated: 2026-06-09)
- [predict-observe-explain](wiki/predict-observe-explain.md) — 예측 → 관찰 → 설명 순서로 인지적 갈등을 의도적으로 만든다. POE를 코드 학습에 이식. (sources: 1, updated: 2026-06-09)
- [sdl-four-stage-framework](wiki/sdl-four-stage-framework.md) — 자기주도성을 준비·주도·조정·책임 4단계 행동으로 분해해 채점한다. (sources: 1, updated: 2026-06-09)
- [standardized-learner-simulation](wiki/standardized-learner-simulation.md) — 의학의 표준화 환자 모델을 차용해 GPTs로 표준화 크루를 만들어 코칭을 안전하게 연습한다. (sources: 1, updated: 2026-06-09)
- [structured-prompt-pattern](wiki/structured-prompt-pattern.md) — 섹션화 + 기술 스택 선언 + 부정 제약 보조의 3요소가 AI 협업 시 반복 수정을 줄인다. (sources: 1, updated: 2026-06-09)
- [teach-by-silence](wiki/teach-by-silence.md) — 코치 발화를 줄이고 크루 발견을 늘리는 참여형 수업 전환. (sources: 3, updated: 2026-06-09)

## 인물·개체

- [stone-and-heen](wiki/stone-and-heen.md) **stub** — Thanks for the Feedback 저자, 피드백 워크숍 프레임의 출처. (sources: 1, updated: 2026-06-09)

## 외부 영향

- [implementation-intention](wiki/implementation-intention.md) — Gollwitzer(1999): if-then 형태 약속이 막연한 다짐보다 실행률 약 2.5배. (sources: 1, updated: 2026-06-09)
- [kolb-experiential-learning](wiki/kolb-experiential-learning.md) — Kolb(1984): 경험 → 성찰 → 개념화 → 실험의 4단계 학습 사이클. (sources: 1, updated: 2026-06-09)
- [krashen-i-plus-one](wiki/krashen-i-plus-one.md) — Krashen: 현재 수준보다 약간 높은 입력(i+1)에서 습득이 일어난다. 자기 선택으로 자동 매칭한다. (sources: 1, updated: 2026-06-09)
- [piaget-cognitive-conflict](wiki/piaget-cognitive-conflict.md) — Piaget: 기존 스키마와 새 경험의 불일치가 스키마 재구성을 일으킨다. (sources: 2, updated: 2026-06-09)
- [pro-sdls-scale](wiki/pro-sdls-scale.md) **stub** — Stockdale & Brockett(2011): 자기주도 학습 성향 측정 4요인 25문항 척도. (sources: 1, updated: 2026-06-09)

## 미발달 (stub)

- [knowledge-transfer-not-presentation](wiki/knowledge-transfer-not-presentation.md) **stub** — 공유는 발표가 아니라 다른 사람이 그대로 따라 할 수 있게 만드는 시간. (sources: 1, updated: 2026-06-09)
- [psychological-safety-classroom](wiki/psychological-safety-classroom.md) **stub** — 참여형 수업 전환의 핵심 관찰 지점은 코치·크루 양쪽의 심리적 안전감. (sources: 1, updated: 2026-06-09)
- [wild-learning](wiki/wild-learning.md) **stub** — 순차 학습 대신 목적 명확화 후 모든 자원을 활용하는 학습 태도. (sources: 1, updated: 2026-06-09)
