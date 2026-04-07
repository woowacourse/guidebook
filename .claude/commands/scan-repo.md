# 레포 1개 측정 (승급 없음)

> autoresearch의 `val_bpb` 측정에 해당. 한 레포에 대해 현재 티어에 맞는 분석을
> 수행하고 점수만 기록한다. 티어 승급은 하지 않는다.

## 인자

$ARGUMENTS — 레포 이름 (예: `java-racingcar-6`). 필수.

## 절차

### Step 1: 현재 티어 조회

1. `.research/repo-scores.tsv`에서 `{인자}` 행을 찾는다.
2. 없으면: "레포가 부트스트랩되지 않았습니다. `/bootstrap-repos`를 먼저 실행하세요." 로 중단.
3. 아카이브/삭제 마킹이면 중단.
4. 현재 티어(T0~T3)와 `is_mission` 플래그를 읽는다.

### Step 2: 티어별 분석 축 선택

- **T0**: R1(구조) + R2(README) + R3(히스토리) → T1 상승 후보 분석으로 간주.
- **T1**:
  - 미션: M1(PR 전수 정량) + M4(공통 피드백 주제 요약)
  - 비미션: R4(이슈/PR 샘플)
- **T2**:
  - 미션: M2(샘플 PR 20개 리뷰 전문) + M3(학습 궤적 체인 2~3개)
  - 비미션: R5(대표 코드 샘플)
- **T3 이상**: `/scan-repo`로 처리하지 않는다. `/extract-insights` 영역.

### Step 3: 데이터 수집 (gh CLI)

공통:
- `gh api repos/woowacourse/{repo}` 로 기본 정보
- `gh api repos/woowacourse/{repo}/contents/README.md` 로 README 전문 (base64 디코드)
- `gh api repos/woowacourse/{repo}/commits?per_page=10` 로 최근 커밋

미션 M1 (PR 전수 정량):
- `gh api "repos/woowacourse/{repo}/pulls?state=all&per_page=100" --paginate` 로 전체 PR
- 총 수, 머지율, 참여 크루 수, 평균 라운드 계산. 상세 리뷰는 가져오지 않는다(가벼운 집계만).

미션 M4 (공통 피드백 주제):
- PR 목록에서 무작위 층화 샘플 10~15개 선택 (오래된/최근/짧은/긴)
- 각 PR의 리뷰 코멘트 수집: `gh api repos/woowacourse/{repo}/pulls/{N}/comments`
- 코멘트 전체를 읽고 공통 주제 Top 10 요약

미션 M2/M3는 샘플 20개 전문/체인 2~3개. 구체 쿼리는 필요 시 쿼리하되 한 레포당 API 호출 합계가 100을 넘지 않도록 제한.

비미션 R4 (이슈/PR 샘플):
- `gh api repos/woowacourse/{repo}/issues?state=all&per_page=20` 최근 20개 관찰

### Step 4: `.research/repos/{repo}.md` 에 분석 노트 누적

기존 파일이 있으면 append, 없으면 생성. 섹션 헤더로 티어별 분석을 구분.

```markdown
# {repo}

Last updated: 2026-04-07T12:34:56Z

## T0→T1 analysis (R1~R3)

### R1. Structure
- Language: Java
- Build tool: Gradle
- Key directories: src/main/java/...

### R2. README
- Purpose: ...
- Target learner: ...
- Tone: ...

### R3. History
- Last commit: 2026-03-15
- Activity pattern: ...

## T1→T2 analysis (미션 M1+M4)

### M1. Quantitative
- Total PRs: 342
- Merge rate: 78%
- Avg review rounds: 2.4
- Unique crews: 56
- Unique reviewers: 8

### M4. Common feedback themes
1. ...
2. ...
```

### Step 5: 루브릭 점수 매기기

`.claude/repo-analysis-rubric.md`를 로드하고 5차원 점수를 매긴다. 비미션이면 D2를 `-`로 두고 4차원 20점으로 측정 후 환산한다.

출력은 루브릭이 명시한 표 형식을 그대로 사용.

### Step 6: `repo-scores.tsv` 업데이트

해당 행의 `d1..d5`, `total`, `last_scanned` 컬럼만 갱신한다. **`tier` 컬럼은 건드리지 않는다** (이 커맨드는 승급 없음).

```
{repo}	T1	4	5	4	5	4	22	true	2026-04-07T12:34	.research/repos/{repo}.md
```

### Step 7: 결과 보고

점수 표 + "현재 티어: T1 / 다음 게이트: T2 (통과|미달)" 만 출력. 승급은 하지 않음을 명시.

## 제약

- 한 번의 `/scan-repo` 실행은 한 레포만 처리.
- gh API 호출 합계 100회 이내 유지.
- `tier` 컬럼을 수정하지 않는다. 승급은 `/analyze-repo`의 책임.
- 커밋하지 않는다. `.research/repos/{repo}.md`는 gitignore 대상이며, TSV 커밋은 `/analyze-repo` 또는 `/analyze-all`의 책임.
