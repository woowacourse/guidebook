# javascript-lotto PR 자산화 실험 계획

- 작성일: 2026-04-14
- 상태: 1차 실험 설계 + 코어 표본 생성 완료
- 대상 저장소: `woowacourse/javascript-lotto`
- 목적: PR, 리뷰, 크루-리뷰어 대화에서 교육적으로 재사용 가능한 자산을 추출하고, 향후 woowacourse org 전체 미션 저장소 연구 파이프라인의 첫 검증 사례로 삼는다.

## 빠른 사실 확인

2026-04-14 기준 public GitHub HTML에서 아래를 확인했다.

- 저장소 설명: "자바스크립트로 구현하는 로또 어플리케이션"
- PR 현황: `0 Open`, `472 Closed`, 총 `19` 페이지
- 목록 스냅샷 기준 머지 연도 분포: `2021~2026`
- 목록 스냅샷 기준 평균 댓글 수: `29.82`, 최대 댓글 수: `97`
- 최근 구간 표본: PR `#470~#475`, 2026년 3월 머지, 댓글 수 `9~22`
- 중간 구간 표본: PR `#243~#248`, 2023년 2월 머지, 댓글 수 `22~34`
- 초기 구간 표본: PR `#1~#23`, 2021년 2월 머지, 댓글 수 `16~28`
- 제목 패턴상 최소 `1단계`, `2단계` 미션 축이 반복된다.
- 개별 PR HTML에는 작성자, 머지 시각, 커밋 수, 댓글 본문, 라인 코멘트 영역이 포함된다.
- `.patch` 엔드포인트로 커밋 시퀀스와 변경 파일 흐름을 public 경로로 읽을 수 있다.

즉, 이 저장소는 단일 기수 미션이 아니라 2021년부터 2026년까지 누적된 교육 담론 코퍼스에 가깝다. 따라서 1차 실험도 "좋은 PR 몇 개 읽기"가 아니라, 기수 간 반복 패턴을 추출하는 연구로 설계해야 한다.

## 현재 실행 결과

2026-04-14 현재 아래 산출물을 생성했다.

- `docs/plans/pr-data/javascript-lotto/pr-list.tsv`
- `docs/plans/pr-data/javascript-lotto/core-sample.tsv`
- `docs/plans/pr-data/javascript-lotto/core-sample.json`
- `docs/plans/pr-data/javascript-lotto/core-sample-details.json`
- `docs/plans/pr-data/javascript-lotto/pilot-conversations.json`

실행 결과 요약:

- 전체 closed PR `472`건 목록 스냅샷 생성
- 비교용 코어 표본 `30`건 생성
- 코어 표본 `30`건의 PR 본문/메타데이터 정규화 완료
- 연도별 고밀도 대화 파일럿 `3`건의 issue comments / reviews / review comments 정규화 완료
- 비교 표본에서는 `1단계`, `2단계`만 사용했고, `2021-3단계` `24`건은 별도 holdout으로 남겨두었다

참고:

- `docs/plans/pr-data/`는 `.gitignore` 대상이라 위 산출물은 현재 로컬 작업 산출물이다.
- 재실행은 `node scripts/javascript-lotto/build-core-sample.mjs --pull-details --pilot-conversations`로 가능하다.

## 목표

`javascript-lotto` PR 대화에서 아래 자산을 추출한다.

- 반복적으로 등장하는 리뷰 주제
- 단계별로 달라지는 피드백 포인트
- 리뷰어의 질문 방식과 코칭 스타일
- 크루가 자주 막히는 구현/설계 지점
- 미션 설계 문서로 환원 가능한 교육적 시사점

최종적으로는 다음 두 층위의 결과물을 만든다.

1. 연구용 중간 산출물: 수집 JSON, 태깅 메모, 패턴 카탈로그
2. 문서용 최종 산출물: `content/education/logs/*` 또는 `content/education/insights/*`로 승격 가능한 인사이트 초안

## 1차 실험 범위

이번 턴에서는 "전량 메타데이터 수집 + 표본 심층 분석" 구조를 사용한다.

### 왜 표본부터 시작하는가

- `472`개 PR 전수 수집은 가능하지만, 먼저 "어떤 패턴이 실제로 유의미한지"를 확인해야 한다.
- 현재 `gh` 인증 토큰이 만료되어 API 기반 수집은 막혀 있다.
- public HTML과 patch만으로도 충분한 표본 실험이 가능하다.
- 표본에서 신호가 확인되면, 그때 전수 수집 포맷을 고정하는 편이 낭비가 적다.

### 표본 설계

1차 실험은 두 층으로 나눈다.

#### 1. 전량 메타데이터 수집

닫힌 PR `472`개 전체에 대해 아래 메타데이터를 먼저 수집한다.

- PR 번호
- 제목
- 작성자
- 머지 시각
- 댓글 수
- 상태
- 페이지 위치

이 단계의 목적은 "표본을 공정하게 뽑을 수 있는 프레임"을 만드는 것이다.

#### 2. 심층 대화 표본

심층 분석은 총 `30`개 PR로 시작한다.

- 초기 코호트: 2021년 구간에서 `10`개
- 중간 코호트: 2023년 구간에서 `10`개
- 최근 코호트: 2026년 구간에서 `10`개

각 코호트 안에서는 아래를 균형 있게 섞는다.

- `1단계` / `2단계`
- 댓글 수 낮음 / 중간 / 높음
- 빠르게 끝난 PR / 라운드가 길었던 PR

이 `30`개 심층 표본으로 먼저 태그 체계와 분석 축을 검증한다. 신호가 충분하면 이후 표본을 `60`개 이상으로 늘리거나, 특정 패턴만 골라 전수 검증한다.

## 수집 원천

1차 실험의 수집 원천은 아래와 같다.

- PR 목록 HTML: 제목, PR 번호, 작성자, 머지 시각, 댓글 수
- 개별 PR HTML: 본문, 타임라인 댓글, 리뷰 댓글, 라인 코멘트, 머지/커밋 메타데이터
- PR patch: 커밋 흐름, 변경 파일, 단계별 수정 맥락

`gh` 인증이 복구되면 아래 원천으로 2차 확장한다.

- `gh api repos/woowacourse/javascript-lotto/pulls/{number}`
- `gh api repos/woowacourse/javascript-lotto/pulls/{number}/comments`
- `gh api repos/woowacourse/javascript-lotto/issues/{number}/comments`
- 필요 시 review thread, review state, reviewer 분포 추가 수집

## 분석 축

이번 실험에서는 아래 축으로 자산을 뽑는다.

### A. 반복 피드백 패턴

- 입력 검증
- 모델 분리
- UI/도메인 관심사 분리
- 테스트 전략
- 네이밍과 상수화
- 객체 책임 분배

### B. 코칭 방식 패턴

- 질문형 리뷰
- 힌트형 리뷰
- 직접 수정 유도형 리뷰
- 개념 설명형 리뷰
- 확장 질문형 리뷰

### C. 학습자 반응 패턴

- 바로 수정하고 반영
- 질문으로 되묻기
- 자신의 의도를 설명하기
- 설계 선택을 방어하기
- 다음 커밋에서 구조를 갈아엎기

### D. 단계별 차이

- `1단계`는 구현 정확성과 규칙 준수 중심인지
- `2단계`는 구조화, UI 분리, 상태 흐름 논의가 늘어나는지
- 댓글 밀도와 라운드 수가 단계에 따라 달라지는지

### E. 교육 자산 승격 가능성

- 여러 기수에서 반복된 피드백인가
- 특정 미션에만 갇히지 않고 다른 미션에도 전이 가능한가
- 크루/리뷰어/교육자에게 각각 실질적 도움이 되는가

## 팀 구성

이번 실험은 아래 팀으로 진행한다.

```text
팀 리더 / 설계
├── 정찰 담당         — 저장소 규모, 페이지 분포, 수집 가능 surface 검증
├── 수집 담당 A       — 초기 코호트(2021) 표본 수집
├── 수집 담당 B       — 중간 코호트(2023) 표본 수집
├── 수집 담당 C       — 최근 코호트(2026) 표본 수집
├── 대화 분석 담당    — 코멘트 태그 체계 설계, 패턴 분류
└── 문서 승격 담당    — 인사이트를 education/logs 또는 insights 포맷으로 정리
```

역할별 책임은 다음과 같다.

- 팀 리더 / 설계: 표본 기준 고정, 품질 기준 정의, 중복 제거, 최종 문서 방향 결정
- 정찰 담당: PR 수, 시기 분포, 단계 분포, 댓글량 분포를 빠르게 잡아 표본 틀을 만든다
- 수집 담당 A/B/C: 담당 코호트의 PR 원문을 동일한 JSON 스키마로 정리한다
- 대화 분석 담당: 반복 피드백과 코칭 패턴을 태그로 정리하고 빈도를 집계한다
- 문서 승격 담당: 연구 메모를 독자용 자산으로 압축한다

## 중간 산출물

1차 실험의 중간 산출물은 아래 경로를 기준으로 둔다.

```text
docs/plans/pr-data/javascript-lotto/pr-list.tsv
docs/plans/pr-data/javascript-lotto/sample-2021.json
docs/plans/pr-data/javascript-lotto/sample-2023.json
docs/plans/pr-data/javascript-lotto/sample-2026.json
docs/plans/pr-data/javascript-lotto/tagging-notes.md
docs/plans/pr-data/javascript-lotto/pattern-catalog.md
```

수집 JSON은 최소 아래 필드를 가진다.

```json
{
  "pr_number": 472,
  "title": "[2단계 - 웹 기반 로또 게임] 루멘 미션 제출합니다.",
  "stage": "2단계",
  "author": "bigcloud07",
  "merged_at": "2026-03-17T13:20:58Z",
  "comment_count": 22,
  "commits_count": 51,
  "body": "...",
  "timeline_comments": [
    { "user": "eastroots92", "body": "...", "kind": "issue_comment" }
  ],
  "review_comments": [
    { "user": "eastroots92", "body": "...", "kind": "review_comment" }
  ],
  "notes": {
    "themes": ["관심사 분리", "검증 책임"],
    "coach_style": ["질문형 리뷰"]
  }
}
```

## 실행 단계

### Phase 0. 정찰

- PR 총량과 페이지 수 확인
- 초기/중기/최근 구간 대표 PR 확인
- 단계 표기와 댓글량 패턴 확인
- public-only 경로로 어디까지 읽히는지 확인

### Phase 1. 표본 수집

- PR 목록 `472`건 메타데이터 정리
- 코호트별 심층 표본 10개씩 선정
- 개별 PR 댓글과 패치 정보 수집
- JSON 스키마 통일

### Phase 2. 태깅

- 피드백 테마 사전 만들기
- 리뷰어 스타일 태그 만들기
- 크루 반응 태그 만들기
- 태그 충돌 사례는 별도 메모에 남기기

### Phase 3. 패턴 추출

- 코호트 공통 패턴 정리
- 단계별 차이 정리
- 대표 인용 선별
- 교육적 시사점 초안 작성

### Phase 4. 승격 판단

- 반복성이 충분한 패턴만 남기기
- 단순 구현 팁과 교육 자산을 구분하기
- `content/education/logs/*`에 올릴지
- `content/education/insights/*`까지 승격할지 결정하기

## 최종 승격 기준

아래 조건을 만족하는 패턴만 최종 문서로 승격한다.

- 서로 다른 코호트에서 반복된다
- 실제 댓글 인용으로 뒷받침된다
- 단계 차이 또는 코칭 방식 차이를 설명할 수 있다
- 크루, 리뷰어, 교육자 중 최소 두 독자군에게 유용하다
- 다른 미션 저장소에도 재사용 가능한 관찰이다

## 리스크와 대응

- `gh` 인증 만료: 표본 실험은 public HTML + patch로 진행하고, 전수 수집 전에 인증을 복구한다
- 댓글 구조 파싱 난이도: 먼저 전량 메타데이터와 심층 표본 30개로 스키마를 고정한 뒤 확장한다
- 단순 코드 품질 리뷰로만 축소될 위험: 구현 팁이 아니라 교육적 상호작용 패턴을 우선 태깅한다
- 특정 리뷰어 스타일에 과도하게 끌릴 위험: 코호트와 리뷰어를 섞어 표본을 구성한다

## 다음 단계

1. `docs/plans/pr-data/javascript-lotto/` 경로를 만들고 PR 목록 `472`건 스냅샷을 저장한다.
2. 코호트별 심층 표본 `10`개씩 선정한다.
3. 표본 PR를 JSON으로 정규화한다.
4. 태그 체계를 한번 적용해보고 중복/애매한 태그를 줄인다.
5. 패턴 카탈로그 초안을 만든다.
6. 신호가 충분하면 대화 표본을 `60`개 이상으로 확장하거나, 특정 패턴에 한해 전수 검증한다.

## 연결 포인트

- org 단위 확장 설계: [2026-04-07-woowacourse-org-research-pipeline-design.md](/Users/makerjun/git/woowacourse-projects/woowacourse-docs/docs/superpowers/specs/2026-04-07-woowacourse-org-research-pipeline-design.md)
- 기존 PR 패턴 자산 예시: [mission-design.mdx](/Users/makerjun/git/woowacourse-projects/woowacourse-docs/content/education/logs/mission-design.mdx)
- 기존 단건 계획 예시: [2026-03-03-pr-insights-design.md](/Users/makerjun/git/woowacourse-projects/woowacourse-docs/docs/plans/2026-03-03-pr-insights-design.md)
