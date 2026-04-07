# woowacourse org 레포 부트스트랩

> 1회성·재실행 가능. woowacourse org 전체 공개 레포의 메타데이터 스냅샷을 만들고
> `.research/repo-scores.tsv` 에 T0 엔트리로 등록한다.

## 전제

- `gh auth status`가 정상이어야 한다. 실패하면 즉시 중단하고 사용자에게 안내한다.
- `.research/` 디렉토리는 이미 존재해야 한다.

## 절차

### Step 1: 인증 확인

`gh auth status` 를 실행해 로그인 상태와 스코프(`repo`, `read:org`)를 확인한다.
실패하면: "gh CLI 인증이 필요합니다. `gh auth login`을 실행해주세요." 로 중단.

### Step 2: 메타데이터 수집

`gh api "orgs/woowacourse/repos?per_page=100&type=public" --paginate` 로 전체 공개 레포를 가져온다.

각 레포에서 추출할 필드:
- name
- description
- html_url
- topics
- language
- pushed_at
- archived
- stargazers_count
- open_issues_count
- default_branch

아카이브된(`archived=true`) 레포는 **수집은 하되** T0에 등록할 때 `last_scanned`에 `archived`로 마킹한다(분석 대상에서 자동 제외).

### Step 3: `_index.json` 작성

`.research/repos/_index.json` 에 다음 형태로 저장한다:

```json
{
  "snapshot_at": "2026-04-07T12:34:56Z",
  "org": "woowacourse",
  "total_count": 207,
  "repos": [
    {
      "name": "java-racingcar-6",
      "description": "...",
      "url": "https://github.com/woowacourse/java-racingcar-6",
      "topics": ["mission", "java"],
      "language": "Java",
      "pushed_at": "2026-03-15T...",
      "archived": false,
      "stars": 3,
      "open_issues": 12,
      "default_branch": "main"
    }
  ]
}
```

기존 파일이 있으면:
- 기존에 있고 새 응답에 없는 레포: `removed_at` 필드를 추가(이력 보존).
- 신규 레포: 추가.
- 기존 레포: 모든 필드 덮어쓰기.

### Step 4: 미션 1차 자동 분류

각 레포에 대해 `is_mission` 을 다음 규칙으로 판정:

1. `topics`에 `mission` 또는 `missions` 포함 → true
2. 이름이 `{언어}-{단어}(-N)?` 패턴 (예: `java-racingcar-6`, `javascript-lotto`, `kotlin-baseball-6`) → true
3. 이름이 `woowacourse-*`, `*-docs`, `*-infra`, `*-cli`, `*-template`, `*-wiki`, `*-guidelines` → false
4. 그 외 → `?` (애매, T2 진입 시 수동 확인)

지원 언어 접두사 화이트리스트: `java`, `javascript`, `kotlin`, `typescript`, `python`, `swift`, `android`, `ios`, `react`, `spring`.

### Step 5: `repo-scores.tsv` 업서트

`.research/repo-scores.tsv` 를 읽어 기존 엔트리와 비교한다.

- 기존에 없는 레포: T0 엔트리 추가
  ```
  {name}	T0	-	-	-	-	-	-	{is_mission}	-	.research/repos/{name}.md
  ```
  `is_mission` 컬럼에는 `true`/`false`/`?` 중 하나를 기록.
- 기존 엔트리: 건드리지 않는다 (이미 진행된 분석을 덮어쓰지 않음).
- 아카이브되었거나 삭제된 레포: `last_scanned` 를 `archived` 또는 `removed` 로 마킹.

### Step 6: 결과 보고

다음 형식으로 출력:

```
## 부트스트랩 결과

- 총 공개 레포: N개
- 신규 T0 등록: M개
- 기존 유지: K개
- 아카이브: A개
- 삭제 감지: R개
- 미션 자동 분류: 미션 X개, 비미션 Y개, 애매 Z개
```

### Step 7: 커밋

```bash
git add .research/repo-scores.tsv .research/repos/_index.json
git commit -m "research: bootstrap woowacourse org ({N} repos, {M} new)"
```

## 제약

- `_index.json` 과 `repo-scores.tsv` 만 커밋한다. 다른 파일은 생성하지 않는다.
- 비공개 레포는 조회하지 않는다 (`type=public` 명시).
- rate limit 초과 시 `gh api --paginate`가 자동 처리한다. 수동 sleep 불필요.
- 한 번 실행에 수 분 걸릴 수 있다. 재실행 안전.
