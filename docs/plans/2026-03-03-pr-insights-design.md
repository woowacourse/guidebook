# PR 리뷰 인사이트 추출 설계

## 목표

gemini-canvas-mission PR 145개의 리뷰 대화를 수집·분석하여,
크루/코치/교육자/개발자 독자에게 실질적으로 유용한 인사이트를
`content/ai-experience/logs/mission-design.mdx`에 추가한다.

## 팀 구성

```
팀 리더
├── 수집 에이전트 A  — PR #1~50
├── 수집 에이전트 B  — PR #51~100
└── 수집 에이전트 C  — PR #101~145
분석/작성 에이전트 — 수집 완료 후 인사이트 추출 + MDX 작성
```

## 수집 대상

- 리뷰 댓글: `GET /repos/woowacourse/gemini-canvas-mission/pulls/{number}/comments`
- 이슈 댓글: `GET /repos/woowacourse/gemini-canvas-mission/issues/{number}/comments`
- PR 본문: `GET /repos/woowacourse/gemini-canvas-mission/pulls/{number}`

## 중간 저장 경로

```
docs/plans/pr-data/batch-a.json  (PR 1-50)
docs/plans/pr-data/batch-b.json  (PR 51-100)
docs/plans/pr-data/batch-c.json  (PR 101-145)
```

각 JSON 구조:
```json
[
  {
    "pr_number": 1,
    "crew_nickname": "벨로",
    "body": "...",
    "review_comments": [
      { "user": "Chocochip101", "body": "..." }
    ],
    "issue_comments": [
      { "user": "BaekCCI", "body": "..." }
    ]
  }
]
```

## 분석/작성 에이전트 작업

1. 3개 batch JSON 합치기
2. 반복 패턴 추출 (리뷰어가 여러 PR에서 반복한 피드백 테마)
3. 빈도 집계 (테마별 언급 PR 수)
4. 대표 인용 선별 (테마당 1-2개, 닉네임만 표기)
5. 교훈 도출 (미션 설계/AI 도입에 반영할 시사점)
6. mission-design.mdx "교훈" 섹션 뒤에 새 섹션 추가

## 최종 결과물 형태

mission-design.mdx에 추가:

```md
## PR 리뷰에서 나온 패턴

> 145개 PR 리뷰 대화를 분석한 결과입니다.

### 패턴 1: [테마명]
**빈도:** N개 PR에서 반복
> "실제 리뷰 인용..." — 리뷰어 닉네임
**시사점:** ...
```

## 인사이트 방향

- 빈도 데이터로 신뢰성
- 실제 인용으로 생동감 (닉네임만, 실명 제거)
- 교훈으로 실용성
- 독자: 크루, 코치, 교육자, 개발자
