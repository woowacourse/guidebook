# PR 리뷰 인사이트 추출 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** gemini-canvas-mission PR 145개의 리뷰 대화를 병렬 수집·분석하여 `mission-design.mdx`에 인사이트 섹션을 추가한다.

**Architecture:** 3개 수집 에이전트가 PR을 병렬로 나눠 수집 → JSON으로 중간 저장 → 분석/작성 에이전트가 통합 분석 후 MDX 작성.

**Tech Stack:** GitHub CLI (`gh api`), Bash, general-purpose subagents, MDX

---

## 팀 구성 및 실행 순서

```
Phase 1 (병렬): 수집 에이전트 A + B + C 동시 실행
Phase 2 (순차): 분석/작성 에이전트 — 수집 완료 후 실행
```

---

## Task 1: 수집 에이전트 A — PR #1~50 수집

**Files:**
- Create: `docs/plans/pr-data/batch-a.json`

**컨텍스트:**
- repo: `woowacourse/gemini-canvas-mission`
- GitHub CLI 사용: `gh api`
- PR 번호 1~50 (단, 실제 존재하는 PR만: #1~45는 page 2에서 확인됨)
- 수집 항목: PR 본문, 리뷰 댓글(`pulls/{n}/comments`), 이슈 댓글(`issues/{n}/comments`)

**Step 1: PR 1~50 수집 스크립트 실행**

각 PR에 대해 아래를 실행:
```bash
# PR 본문
gh api "repos/woowacourse/gemini-canvas-mission/pulls/{number}" \
  --jq '{number: .number, title: .title, user: .user.login, body: .body}'

# 리뷰 댓글
gh api "repos/woowacourse/gemini-canvas-mission/pulls/{number}/comments" \
  --jq '[.[] | {user: .user.login, body: .body}]'

# 이슈 댓글
gh api "repos/woowacourse/gemini-canvas-mission/issues/{number}/comments" \
  --jq '[.[] | {user: .user.login, body: .body}]'
```

**Step 2: JSON 형태로 저장**

`docs/plans/pr-data/batch-a.json` 형식:
```json
[
  {
    "pr_number": 1,
    "title": "...",
    "crew_github": "juntae6942",
    "body": "...",
    "review_comments": [{"user": "...", "body": "..."}],
    "issue_comments": [{"user": "...", "body": "..."}]
  }
]
```

**Step 3: 완료 확인**

파일이 존재하고 비어있지 않은지 확인:
```bash
wc -c docs/plans/pr-data/batch-a.json
```

---

## Task 2: 수집 에이전트 B — PR #51~100 수집

**Files:**
- Create: `docs/plans/pr-data/batch-b.json`

**컨텍스트:** Task 1과 동일한 방법, PR 번호 51~100 담당

**Step 1~3:** Task 1과 동일, 저장 파일만 `batch-b.json`으로 변경

---

## Task 3: 수집 에이전트 C — PR #101~145 수집

**Files:**
- Create: `docs/plans/pr-data/batch-c.json`

**컨텍스트:** Task 1과 동일한 방법, PR 번호 101~145 담당

**Step 1~3:** Task 1과 동일, 저장 파일만 `batch-c.json`으로 변경

---

## Task 4: 분석/작성 에이전트 — 인사이트 추출 및 MDX 작성

> **전제조건:** Task 1, 2, 3이 모두 완료되어 batch-a/b/c.json이 존재해야 함

**Files:**
- Read: `docs/plans/pr-data/batch-a.json`
- Read: `docs/plans/pr-data/batch-b.json`
- Read: `docs/plans/pr-data/batch-c.json`
- Read: `content/ai-experience/logs/mission-design.mdx`
- Modify: `content/ai-experience/logs/mission-design.mdx`

**Step 1: 3개 batch JSON 합치기**

모든 PR 데이터를 하나의 컨텍스트로 통합하여 읽기

**Step 2: 패턴 분석**

아래 기준으로 반복 패턴 추출:
- 리뷰어(코치)가 **여러 PR에서 반복적으로** 남긴 피드백 테마
- 크루들이 **공통적으로 질문하거나 어려워한** 주제
- **긍정적 패턴** (칭찬받은 구현 방식, 독창적인 접근)
- **개선 요청 패턴** (반복적으로 지적된 문제)
- **AI 활용 패턴** (프롬프팅 방식, Gemini 사용 전략)

각 패턴에 대해:
- 테마명 (한국어, 5단어 이내)
- 해당 PR 수 (빈도)
- 대표 인용 1-2개 선별 (원문 그대로, 닉네임/GitHub ID만 표기)
- 독자에게 주는 시사점

**Step 3: MDX 섹션 작성**

`mission-design.mdx`의 기존 "교훈" 섹션(`## 교훈`) **뒤에** 아래 형태의 섹션 추가:

```mdx
## PR 리뷰에서 나온 패턴

145개 PR 리뷰 대화를 분석한 결과입니다. 코치와 크루의 대화에서 반복적으로 나타난 패턴을 정리했습니다.

<Callout type="info">
리뷰 댓글은 GitHub ID 또는 우테코 닉네임으로 표기했습니다.
</Callout>

### [패턴 1 테마명]

**N개 PR에서 반복**

> "대표 인용 원문" — GitHub ID

**독자에게:** 시사점 서술 (2-3문장, 크루/코치/교육자 관점 모두 커버)

---

### [패턴 2 테마명]

... (동일 구조 반복, 최소 5개 패턴)
```

**Step 4: 작성 품질 체크**

- 패턴 최소 5개 이상
- 각 패턴에 실제 인용 포함
- 빈도(PR 수) 명시
- 독자에게 실질적으로 유용한 시사점
- 기존 "교훈" 섹션 내용과 중복되지 않음

**Step 5: 파일 저장 확인**

```bash
# 추가된 섹션이 있는지 확인
grep -n "PR 리뷰에서 나온 패턴" content/ai-experience/logs/mission-design.mdx
```

---

## 실행 지침

### Phase 1: 병렬 수집 (Task 1, 2, 3 동시)

팀 리더가 수집 에이전트 3개를 동시에 dispatching:
- 에이전트 A: PR #1~50
- 에이전트 B: PR #51~100
- 에이전트 C: PR #101~145

### Phase 2: 순차 분석 (Task 4)

3개 에이전트 모두 완료 후 분석/작성 에이전트 실행

### Rate Limit 주의

- GitHub API: 인증 시 시간당 5,000 요청
- 예상 총 API 호출: ~450회 (PR당 3회 × 145개)
- 각 PR 수집 간 0.5초 딜레이 권장 (`sleep 0.5`)

### 오류 처리

- PR이 존재하지 않는 번호는 건너뜀 (404 응답 시 skip)
- 댓글 없는 PR도 빈 배열로 저장 (`[]`)
