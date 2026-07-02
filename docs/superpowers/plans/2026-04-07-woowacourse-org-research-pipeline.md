# woowacourse org 연구 파이프라인 인프라 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** woowacourse org 전체 저장소를 autoresearch 스타일 승격 파이프라인으로 분석하기 위한 인프라(루브릭·슬래시 커맨드·문서 레이어)를 구축한다. 본 계획은 실제 207개 레포 순회(스펙 8절 단계 8~12)를 **제외**하고, 인프라(단계 1~7)에만 집중한다 — 완료 후 사용자는 `/analyze-all`을 세션별로 돌리기만 하면 데이터가 누적된다.

**Architecture:** 기존 실험 로그 파이프라인(`/improve-log`, `/improve-all`, `.claude/log-quality-rubric.md`, `content/logs.ts`, `LogList`)을 템플릿으로 삼아 구조적으로 복제·확장한다. 신규 어휘를 도입하지 않는다. 상태의 단일 진실 원천은 `.research/repo-scores.tsv`(커밋)이고, 문서 표현의 단일 진실 원천은 `content/repositories.ts`(자동 갱신)이다.

**Tech Stack:** Nextra 4 + Next.js App Router, TypeScript, CSS Modules, `gh` CLI v2.74.2 (imakerjun 계정, repo+read:org 스코프), Markdown 기반 슬래시 커맨드, TSV 상태 파일.

**관련 스펙:** [2026-04-07-woowacourse-org-research-pipeline-design.md](../specs/2026-04-07-woowacourse-org-research-pipeline-design.md)

---

## File Structure

**생성할 파일:**
```
.claude/repo-analysis-rubric.md              # 신규 루브릭 (사람 관리, 불변)
.claude/commands/bootstrap-repos.md          # org 메타데이터 수집
.claude/commands/scan-repo.md                # 단건 측정 (승급 없음)
.claude/commands/analyze-repo.md             # 단건 사이클 (측정+승급)
.claude/commands/analyze-all.md              # 배치 순회
.research/repo-scores.tsv                    # 상태 TSV (커밋)
.research/.gitkeep                           # 디렉토리 보존
content/repositories.ts                      # logs.ts 복제 패턴
content/education-experiment/repositories/_meta.ts
content/education-experiment/repositories/index.mdx
components/RepoList.tsx                      # LogList 복제
components/RepoList.module.css               # LogList.module.css 복제
```

**수정할 파일:**
```
.gitignore                                   # .research/repos/, .research/batches/ 추가
components/index.ts                          # RepoList export
mdx-components.tsx                           # RepoList import/export
content/education-experiment/_meta.ts        # repositories 등록
content/updates.ts                           # 신규 섹션 소개 항목
```

각 파일은 한 가지 책임을 가진다:
- 루브릭 1개 = 평가 기준 정의(불변)
- 커맨드 4개 = scan(측정)·analyze-repo(단건 사이클)·analyze-all(배치)·bootstrap-repos(초기화) — 각 커맨드 한 책임
- `repositories.ts` = 문서 노출 데이터 (자동 갱신)
- `RepoList.tsx` = 렌더링만 (데이터는 `repositories.ts`에만 의존)

---

## Task 1: 인프라 부트스트랩 (루브릭 + 상태 파일 + gitignore)

**Files:**
- Create: `.claude/repo-analysis-rubric.md`
- Create: `.research/repo-scores.tsv`
- Create: `.research/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1: `.research/` 디렉토리와 `.gitkeep` 생성**

```bash
mkdir -p .research/repos .research/batches
touch .research/.gitkeep
```

- [ ] **Step 2: `.research/repo-scores.tsv` 헤더 작성**

파일 전체 내용 (탭 구분):

```
repo_name	tier	d1	d2	d3	d4	d5	total	is_mission	last_scanned	notes_path
```

- [ ] **Step 3: `.gitignore` 업데이트**

파일 끝에 추가:

```
# woowacourse org research pipeline — 분석 노트·배치 로그는 재생성 가능하므로 gitignore
# repo-scores.tsv 와 _index.json 은 커밋한다 (autoresearch의 results.tsv 역할)
.research/repos/
.research/batches/
```

- [ ] **Step 4: `.claude/repo-analysis-rubric.md` 작성**

파일 전체 내용:

```markdown
# 레포 분석 품질 루브릭 (repo-analysis-rubric)

> autoresearch의 `prepare.py`와 동일한 불변 평가 인프라다.
> 이 파일은 에이전트가 수정하지 않는다. 사람이 직접 수정한다.
> 수정하면 모든 이전 측정값과의 비교 가능성이 사라진다는 것을 전제로 한다.

## 대상

woowacourse org의 공개 저장소 1개를 분석하고 5차원 25점 만점(비미션은 4차원 20점 만점 비례 환산)으로 점수를 매긴다.

## 5차원

### D1. 교육적 의도 명확성 (1~5점)

이 레포는 학습자에게 무엇을 가르치려 하는가?

- 1점: 목적 불명. README 없음 또는 한두 줄.
- 2점: 개략적 목적은 보이나 대상 학습자·단계 불분명.
- 3점: README로 목적 추정 가능. 단계나 선수지식 암시.
- 4점: 학습 목표와 단계가 명시됨. 대상 학습자 구체적.
- 5점: 학습 목표·단계·선수지식·성취 기준까지 명시.

### D2. 학습자 상호작용 밀도 (1~5점)

학습자 활동의 흔적이 얼마나 풍부한가?

- 1점: PR 0~1개. 학습자 활동 흔적 없음.
- 2점: PR 2~9개. 일회성 활동.
- 3점: PR 10~99개. 단일 기수 활동.
- 4점: PR 100~499개 또는 2기수 이상 누적.
- 5점: PR 500개 이상 또는 3기수 이상 누적.

### D3. 리뷰어 피드백 품질 (1~5점)

리뷰 코멘트가 관찰할 가치가 있는가? (샘플 PR 5~10개의 리뷰 스레드 기준)

- 1점: 리뷰 없음 또는 승인(LGTM)만.
- 2점: 짧은 한두 줄 코멘트 위주.
- 3점: 중간 길이 코멘트, 간혹 질문 있음.
- 4점: 긴 대화, 질문형 리뷰, 왕복 교신.
- 5점: 구조화된 피드백, 참고 자료 링크, 여러 라운드의 심층 대화.

### D4. 패턴 추출 가능성 (1~5점)

교차 레포 패턴의 원료가 되는가?

- 1점: 일회성, 다른 레포와 비교 축 없음.
- 2점: 부분 일반화 가능하나 독특함.
- 3점: 다른 레포에서도 유사 패턴 기대 가능.
- 4점: 다른 미션·기수와 직접 비교 축 제공.
- 5점: 교차 비교·승격의 중심 허브가 될 잠재력.

### D5. 최신성·활성도 (1~5점)

현재 교육에 여전히 유효한가? (GitHub 기본 브랜치 최신 커밋 기준)

- 1점: 2년 이상 정체 또는 아카이브.
- 2점: 1~2년 활동 없음.
- 3점: 간헐적 활동(6~12개월 내).
- 4점: 최근 6개월 내 활동.
- 5점: 최근 3개월 내 활동 또는 진행 기수 내.

## 미션 vs 비미션 가중치

### 미션 레포 (is_mission=true)

- 5차원 25점 만점 그대로 사용.
- D2(상호작용 밀도)·D3(리뷰 품질)이 결정적.
- D2 ≤ 2이면 실질적으로 T2 컷(심층 분석 대상 아님).

### 비미션 레포 (is_mission=false, 도구·문서·인프라)

- D2는 N/A로 두고 4차원 20점 만점 측정 후, 25점 환산: `round(total20 * 25 / 20)`.
- D1(의도 명확성)·D4(패턴 추출)이 결정적.
- TSV의 `d2` 컬럼에는 `-` 를 기록한다.

## 티어 승급 게이트

- **T1→T2**: 총점 ≥ 13 **또는** D2 ≥ 4
- **T2→T3**: 총점 ≥ 18 **그리고** D3 ≥ 4
- **T3→T4(인사이트)·T4→T5(모델)**: `.claude/promotion-rubric.md`의 P1~P4를 사용.

## 출력 형식

루브릭을 적용할 때는 반드시 다음 형식으로 출력한다:

```
## 레포 분석 점수: {repo_name}

| 차원 | 점수 | 근거 |
|------|------|------|
| D1. 교육적 의도 | N/5 | ... |
| D2. 상호작용 밀도 | N/5 | PR 수, 기수 누적 |
| D3. 리뷰 품질 | N/5 | 샘플 PR 근거 |
| D4. 패턴 가능성 | N/5 | ... |
| D5. 최신성 | N/5 | 최신 커밋 일자 |

총점: N/25 (비미션이면 N/20 → 환산 M/25)
is_mission: true|false
티어 판정: T{현재} → T{대상} ({통과|미달, 사유})
```
```

- [ ] **Step 5: 커밋**

```bash
git add .claude/repo-analysis-rubric.md .research/repo-scores.tsv .research/.gitkeep .gitignore
git commit -m "$(cat <<'EOF'
feat(research): add repo-analysis rubric and state TSV scaffold

- .claude/repo-analysis-rubric.md: 불변 5차원 25점 루브릭 (미션/비미션 가중치 포함)
- .research/repo-scores.tsv: 티어·점수 상태 파일 (헤더만)
- .gitignore: repos/ batches/ 제외 (노트는 재생성 가능)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `/bootstrap-repos` 커맨드 작성 및 실행

**Files:**
- Create: `.claude/commands/bootstrap-repos.md`
- Modify: `.research/repo-scores.tsv` (커맨드 실행 결과로 채워짐)
- Create: `.research/repos/_index.json` (커맨드 실행 결과)

- [ ] **Step 1: `.claude/commands/bootstrap-repos.md` 작성**

파일 전체 내용:

```markdown
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
```

- [ ] **Step 2: 커맨드 파일 커밋**

```bash
git add .claude/commands/bootstrap-repos.md
git commit -m "$(cat <<'EOF'
feat(research): add /bootstrap-repos command for org snapshot

gh CLI 기반 woowacourse org 공개 레포 전수 메타데이터 수집 및
repo-scores.tsv T0 엔트리 업서트.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: 실제 실행 — `/bootstrap-repos` 1회 실행**

Claude Code 세션에서 `/bootstrap-repos` 를 호출해 실제로 실행한다.

예상 출력: "총 공개 레포: ~207개" 수준의 결과 보고와 `repo-scores.tsv`에 T0 엔트리들이 쌓인 상태.

- [ ] **Step 4: 실행 결과 수동 검증**

```bash
wc -l .research/repo-scores.tsv
head -5 .research/repo-scores.tsv
cat .research/repos/_index.json | head -30
```

기대:
- TSV 줄 수: 1(헤더) + 약 200+
- `_index.json`에 `"total_count"` 필드 존재
- TSV 샘플 엔트리 중 미션 레포가 `is_mission=true`로, 문서 레포가 `false`로 표시

문제 있으면 커맨드 프롬프트 조정 후 재실행.

- [ ] **Step 5: 실행 결과 커밋** (커맨드가 이미 커밋했으면 스킵)

```bash
git status
# 커맨드가 이미 커밋했으면 이 단계는 "already committed"로 스킵
```

---

## Task 3: `/scan-repo` 커맨드 (단건 측정, 승급 없음)

**Files:**
- Create: `.claude/commands/scan-repo.md`

- [ ] **Step 1: `.claude/commands/scan-repo.md` 작성**

파일 전체 내용:

```markdown
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
```

- [ ] **Step 2: 커밋**

```bash
git add .claude/commands/scan-repo.md
git commit -m "$(cat <<'EOF'
feat(research): add /scan-repo command (measurement only)

현재 티어에 맞는 분석 축(R1-R5/M1-M4)을 실행하고 루브릭 점수를
TSV에 기록한다. 티어 승급은 하지 않음 (수동 검증용).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: 샘플 레포 1개로 검증 실행**

부트스트랩이 끝난 상태에서 샘플 미션 레포 1개를 골라(예: `repo-scores.tsv`에서 가장 위에 있는 미션 레포 이름을 사용) `/scan-repo <repo-name>` 실행.

검증:
- `.research/repos/<repo>.md` 파일이 생성되었다
- `.research/repo-scores.tsv` 해당 행의 d1~d5와 total이 채워졌다
- `tier` 컬럼은 `T0` 그대로다 (승급 없음 확인)

문제 있으면 커맨드 프롬프트 조정 후 재검증.

---

## Task 4: `/analyze-repo` 커맨드 (단건 사이클, 승급 포함)

**Files:**
- Create: `.claude/commands/analyze-repo.md`

- [ ] **Step 1: `.claude/commands/analyze-repo.md` 작성**

파일 전체 내용:

```markdown
# 레포 1개 분석 사이클 (측정 → 게이트 → 승급)

> `/scan-repo`의 측정 결과를 기반으로 루브릭 게이트를 확인하고 티어를 승급시킨다.
> 승급 시 문서 레이어(`repositories.ts`·`updates.ts`)도 자동 업서트한다.

## 인자

$ARGUMENTS — 레포 이름. 필수.

## 절차

### Step 1: /scan-repo 로직 실행

`.claude/commands/scan-repo.md`의 Step 1~6을 그대로 수행한다 (측정 + TSV의 점수 컬럼 업데이트, `tier`는 아직 건드리지 않음).

### Step 2: 게이트 판정

현재 티어에 따라:

- **T0 → T1**: 측정이 수행되었으면 항상 승급 (T0은 수집 상태일 뿐). `last_scanned`만 있으면 T1.
- **T1 → T2**: 총점 ≥ 13 **또는** D2 ≥ 4
- **T2 → T3**: 총점 ≥ 18 **그리고** D3 ≥ 4
- **T3 이상**: `/analyze-repo` 범위 밖. "T3 이상은 /extract-insights 영역입니다." 출력 후 종료.

게이트 미달이면 승급 없이 "점수 {N}/25, 게이트 미달로 T{현재} 유지" 출력 후 종료(커밋은 Step 5에서).

### Step 3: 티어 승급

게이트 통과 시 `repo-scores.tsv`의 `tier` 컬럼을 다음 티어로 교체한다.

### Step 4: T2 이상 승급 시 문서 레이어 업서트

**T2 이상으로 승급한 경우에만** 다음을 수행한다 (T1 승급은 문서에 노출하지 않음).

#### 4a. `content/repositories.ts` 업서트

파일을 읽고, 해당 `slug`(레포 이름 그대로) 엔트리가 있으면 `tier`, `score`, `lastScanned`를 업데이트한다. 없으면 배열 맨 위에 새 엔트리를 추가한다.

엔트리 형식:
```ts
{
  slug: '{repo-name}',
  name: '{repo-name}',
  title: '{레포 한국어 제목 — README 또는 description 기반으로 생성}',
  description: '{한 줄 요약 — 분석 노트 기반}',
  category: '미션' | '도구' | '문서' | '인프라' | '기타',
  tier: 'T2' | 'T3',
  score: N,
  href: '/education-experiment/repositories/{repo-name}',
  url: 'https://github.com/woowacourse/{repo-name}',
  lastScanned: 'YYYY-MM-DD',
}
```

`category` 결정:
- `is_mission=true` → '미션'
- 이름에 `docs`/`wiki`/`guidelines` → '문서'
- 이름에 `infra`/`template`/`cli` → '인프라' 또는 '도구'
- 그 외 → '기타'

#### 4b. `content/education-experiment/repositories/{repo-name}.mdx` 생성

아직 없으면 생성한다. 내용은 분석 노트의 요약(타이틀, description, 주요 발견, GitHub 링크). 이미 있으면 건드리지 않는다 (사람 편집 보존).

최소 템플릿:
```mdx
---
title: {title}
---

# {title}

> [GitHub: woowacourse/{repo-name}](https://github.com/woowacourse/{repo-name})
>
> 분석 티어: T{N} · 점수: {N}/25 · 마지막 스캔: YYYY-MM-DD

## 개요

{description 확장판}

## 주요 발견

{분석 노트에서 추출한 3~5개 핵심 포인트}

## 원본 데이터

`.research/repos/{repo-name}.md` 에 전체 분석 노트가 있습니다.
```

#### 4c. `content/updates.ts` 업서트

배열 맨 위에 다음 항목을 추가 (동일 href가 이미 있으면 스킵):

```ts
{
  date: '2026년 연구',
  title: '{title}',
  description: '{description}',
  href: '/education-experiment/repositories/{repo-name}',
  status: 'active',
}
```

### Step 5: 커밋

승급이 일어났다면:

```bash
git add .research/repo-scores.tsv content/repositories.ts content/updates.ts \
        content/education-experiment/repositories/{repo-name}.mdx
git commit -m "research({repo-name}): promote to T{N} (score {X}/25)"
```

승급이 없었다면 TSV만 커밋:

```bash
git add .research/repo-scores.tsv
git commit -m "research({repo-name}): rescan (score {X}/25, stay T{N})"
```

### Step 6: 결과 보고

```
## 분석 결과: {repo-name}

점수: {N}/25
티어: T{before} → T{after} ({승급|유지})
문서 업서트: {예|아니오}
```

## 제약

- 한 번에 한 레포만 처리.
- 세션당 티어 1개 원칙: 이 커맨드는 한 티어만 올린다 (예: T1→T2만, T2→T3으로 연달아 올라가지 않는다).
- `content/education-experiment/repositories/{repo-name}.mdx`가 이미 존재하면 덮어쓰지 않는다.
```

- [ ] **Step 2: 커밋**

```bash
git add .claude/commands/analyze-repo.md
git commit -m "$(cat <<'EOF'
feat(research): add /analyze-repo command (measurement + tier gate)

/scan-repo 로직 + 게이트 판정 + 티어 승급.
T2 이상 승급 시 repositories.ts·updates.ts·개별 MDX 자동 업서트.
세션당 티어 1개 원칙.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

*검증은 Task 6(문서 레이어)·Task 7(자동 업서트) 완료 후 Task 7 Step 4에서 end-to-end로 수행한다. 이 시점에는 `content/repositories.ts`가 아직 없어 Step 4a가 실패한다 — 의도된 순서다.*

---

## Task 5: `/analyze-all` 커맨드 (배치 순회)

**Files:**
- Create: `.claude/commands/analyze-all.md`

- [ ] **Step 1: `.claude/commands/analyze-all.md` 작성**

파일 전체 내용:

```markdown
# 레포 배치 순회 분석

> autoresearch의 밤새 실험 순회에 해당. `.research/repo-scores.tsv`에서
> 가장 낮은 티어의 가장 오래된 레포부터 배치 크기 N개를 골라 `/analyze-repo`를
> 반복 실행한다. 컨텍스트 한계 도달 시 안전 종료하고 다음 세션에서 재개.

## 인자

$ARGUMENTS — 선택적 배치 크기 (기본 5, 예: `10`).

## 절차

### Step 1: 선택 대상 결정

`.research/repo-scores.tsv` 를 읽어 다음 조건으로 정렬:

1. 아카이브/삭제 마킹은 제외.
2. 정렬 키: (현재 티어 오름차순, `last_scanned` 오름차순 — 비어있으면 가장 먼저).
3. `T3` 이상은 제외 (T3→T4는 `/extract-insights` 영역).

상위 N개(기본 5)를 선택.

### Step 2: 배치 로그 시작

`.research/batches/{YYYY-MM-DD-batch-NN}.md` 생성하고 헤더 기록:

```markdown
# Batch {YYYY-MM-DD}-{NN}

Started: {ISO timestamp}
Batch size: {N}
Selected repos: [{repo1}, {repo2}, ...]

## Results

```

### Step 3: 반복 실행

각 레포에 대해 `/analyze-repo {repo}` 를 순차 실행한다.
(이 커맨드는 같은 세션 안에서 `.claude/commands/analyze-repo.md` 절차를 그대로 인라인 수행하는 것으로 해석한다. 슬래시 커맨드 내부에서 다른 슬래시 커맨드를 호출하는 메커니즘이 없으므로 프롬프트에 "Step 1~6을 수행" 명시.)

각 레포 처리 후 배치 로그에 한 줄 추가:

```
- {repo}: T{before}→T{after}, score {N}/25, {commit-sha}
```

### Step 4: 컨텍스트 가드

다음 레포로 넘어가기 전, 남은 컨텍스트가 충분한지 대략 판단한다:

- 아직 처리한 레포가 0개면 무조건 최소 1개는 끝까지.
- 처리 후 30% 미만의 여유가 예상되면 안전 종료. 배치 로그에 "truncated at {K}/{N}" 기록.
- 넉넉하면 다음 레포 진행.

(이는 휴리스틱이다. 주어진 세션의 실제 사용량에 따라 판단한다.)

### Step 5: 배치 종료 처리

배치 로그 마지막에:

```
Ended: {ISO timestamp}
Completed: {K}/{N}
```

### Step 6: 결과 보고

```
## 배치 결과

| 레포 | before | after | 점수 | 승급 |
|------|--------|-------|------|------|
| ... | T1 | T2 | 20/25 | ✅ |

Completed: K/N
Next session will resume from: {다음 순위 레포}
```

### Step 7: TSV 재커밋 (개별 /analyze-repo 커밋들과 별도로 필요한 경우 스킵)

각 `/analyze-repo` 호출이 자체 커밋을 수행하므로 별도 커밋은 불필요.
다만 `batches/` 는 gitignore이므로 배치 로그는 커밋되지 않는다.

## 제약

- 세션당 티어 1개 원칙: 한 레포가 한 배치 안에서 T1→T2→T3으로 연달아 승급하지 않는다 (각 레포는 한 티어만 상승).
- 배치 중단 시 TSV는 마지막 완료 레포 시점까지는 일관된 상태여야 한다 (각 `/analyze-repo`가 원자 커밋).
- 아카이브/삭제 마킹은 자동 스킵.
- 재실행 안전: 동일 명령을 다시 돌리면 멈춘 지점부터 자연스럽게 이어진다.
```

- [ ] **Step 2: 커밋**

```bash
git add .claude/commands/analyze-all.md
git commit -m "$(cat <<'EOF'
feat(research): add /analyze-all batch loop command

티어 오름차순·last_scanned 오름차순으로 N개 레포를 골라 /analyze-repo를
순차 실행한다. 컨텍스트 가드·재개 안전·세션당 티어 1개 원칙.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

*검증은 Task 7 완료 후 Task 7 Step 5에서 수행한다.*

---

## Task 6: 문서 레이어 (`repositories.ts` + `RepoList` + 섹션 등록)

**Files:**
- Create: `content/repositories.ts`
- Create: `components/RepoList.tsx`
- Create: `components/RepoList.module.css`
- Create: `content/education-experiment/repositories/_meta.ts`
- Create: `content/education-experiment/repositories/index.mdx`
- Modify: `components/index.ts`
- Modify: `mdx-components.tsx`
- Modify: `content/education-experiment/_meta.ts`
- Modify: `content/updates.ts`

- [ ] **Step 0: react-best-practices 스킬 호출**

이 Task는 TSX 컴포넌트를 작성하므로 `react-best-practices` 스킬을 먼저 호출해 체크리스트를 로드한다. LogList.tsx를 구조 참조로 복제하는 작업이다.

- [ ] **Step 1: `content/repositories.ts` 작성**

파일 전체 내용:

```ts
export type RepoCategory = '미션' | '도구' | '문서' | '인프라' | '기타'
export type RepoTier = 'T2' | 'T3'

export interface Repo {
  slug: string
  name: string
  title: string
  description: string
  category: RepoCategory
  tier: RepoTier
  score: number
  href: string
  url: string
  lastScanned: string  // YYYY-MM-DD
}

// /analyze-repo, /analyze-all 커맨드가 자동으로 갱신합니다.
// 수동 편집 시에는 최신 항목을 맨 위에 두세요.
const repositories: Repo[] = []

export default repositories
```

- [ ] **Step 2: `components/RepoList.module.css` 작성**

`components/LogList.module.css`를 그대로 복제한 뒤, 해당 파일을 `RepoList.module.css`로 저장한다(동일 시각 스타일 재사용).

실제 내용(복사본):

```css
.container {
  margin: 24px 0;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: transparent;
  font-size: 0.85rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
}

.count {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  opacity: 0.6;
}

.tab:hover {
  border-color: #9ca3af;
  color: #374151;
}

.tabActive {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #ffffff;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item {
  display: block;
  padding: 16px;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: background 0.1s;
}

.item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.date {
  font-size: 0.8rem;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}

.category {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
}

.tier {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
}

.title {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  color: #111827;
}

.description {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
}

.empty {
  padding: 32px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

[data-theme="dark"] .tab,
:global(.dark) .tab {
  border-color: #374151;
  color: #9ca3af;
}

[data-theme="dark"] .tab:hover,
:global(.dark) .tab:hover {
  border-color: #6b7280;
  color: #d1d5db;
}

[data-theme="dark"] .tabActive,
:global(.dark) .tabActive {
  background: #f9fafb;
  border-color: #f9fafb;
  color: #111827;
}

[data-theme="dark"] .item:hover,
:global(.dark) .item:hover {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .category,
:global(.dark) .category {
  background: #1f2937;
  color: #9ca3af;
}

[data-theme="dark"] .tier,
:global(.dark) .tier {
  background: #312e81;
  color: #c7d2fe;
}

[data-theme="dark"] .title,
:global(.dark) .title {
  color: #f9fafb;
}

[data-theme="dark"] .description,
:global(.dark) .description {
  color: #9ca3af;
}
```

- [ ] **Step 3: `components/RepoList.tsx` 작성**

파일 전체 내용:

```tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import repositories, { type RepoCategory } from '../content/repositories'
import styles from './RepoList.module.css'

const ALL = '전체' as const
type Filter = typeof ALL | RepoCategory

const CATEGORIES: Filter[] = ['전체', '미션', '도구', '문서', '인프라', '기타']

const CATEGORY_SLUG: Record<Filter, string> = {
  '전체': '',
  '미션': 'mission',
  '도구': 'tool',
  '문서': 'doc',
  '인프라': 'infra',
  '기타': 'etc',
}

const SLUG_TO_CATEGORY: Record<string, Filter> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG)
    .filter(([, slug]) => slug !== '')
    .map(([cat, slug]) => [slug, cat as Filter])
)

function getCategoryFromURL(): Filter {
  if (typeof window === 'undefined') return '전체'
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('category')
  if (!slug) return '전체'
  return SLUG_TO_CATEGORY[slug] ?? '전체'
}

export function RepoList() {
  const [selected, setSelected] = useState<Filter>('전체')

  useEffect(() => {
    setSelected(getCategoryFromURL())
  }, [])

  const handleSelect = useCallback((cat: Filter) => {
    setSelected(cat)
    const slug = CATEGORY_SLUG[cat]
    const url = new URL(window.location.href)
    if (slug) {
      url.searchParams.set('category', slug)
    } else {
      url.searchParams.delete('category')
    }
    window.history.replaceState(null, '', url.toString())
  }, [])

  const filtered = repositories
    .filter((repo) => selected === '전체' || repo.category === selected)
    .sort((a, b) => b.score - a.score || b.lastScanned.localeCompare(a.lastScanned))

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist" aria-label="카테고리 필터">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selected === cat}
            className={`${styles.tab} ${selected === cat ? styles.tabActive : ''}`}
            onClick={() => handleSelect(cat)}
          >
            {cat}
            <span className={styles.count}>
              {cat === '전체'
                ? repositories.length
                : repositories.filter((r) => r.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map((repo) => (
          <a key={repo.slug} href={repo.href} className={styles.item}>
            <div className={styles.meta}>
              <span className={styles.date}>{repo.lastScanned}</span>
              <span className={styles.category}>{repo.category}</span>
              <span className={styles.tier}>{repo.tier} · {repo.score}/25</span>
            </div>
            <h3 className={styles.title}>{repo.title}</h3>
            <p className={styles.description}>{repo.description}</p>
          </a>
        ))}
        {filtered.length === 0 && (
          <p className={styles.empty}>
            아직 T2 이상으로 승급된 레포가 없습니다. `/analyze-all`을 실행해 분석을 시작하세요.
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `components/index.ts`에 RepoList export 추가**

기존 파일 끝에 추가:

```ts
export { RepoList } from './RepoList'
```

수정 후 `components/index.ts` 전체:

```ts
export { Callout } from './Callout'
export { Card } from './Card'
export { CardGrid } from './CardGrid'
export { Toggle } from './Toggle'
export { AssetCard } from './AssetCard'
export { Timeline, TimelineItem } from './Timeline'
export { Placeholder } from './Placeholder'
export { LogList } from './LogList'
export { Mermaid } from './Mermaid'
export { RepoList } from './RepoList'
```

- [ ] **Step 5: `mdx-components.tsx`에 RepoList 등록**

import 섹션에 추가:

```tsx
import { RepoList } from './components/RepoList'
```

components 객체에 추가:

```tsx
    RepoList,
```

수정 후 파일 전체 — 기존 구조는 그대로, `LogList` 다음에 한 줄씩 추가:

```tsx
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Callout } from './components/Callout'
import { Card } from './components/Card'
import { CardGrid } from './components/CardGrid'
import { Toggle } from './components/Toggle'
import { AssetCard } from './components/AssetCard'
import { Timeline, TimelineItem } from './components/Timeline'
import { Placeholder } from './components/Placeholder'
import { Hero } from './components/Hero'
import { RecentUpdates } from './components/RecentUpdates'
import { LogList } from './components/LogList'
import { Mermaid } from './components/Mermaid'
import { RepoList } from './components/RepoList'

const docsComponents = getDocsMDXComponents()

export function useMDXComponents(components?: Record<string, React.FC>) {
  return {
    ...docsComponents,
    Callout,
    Card,
    CardGrid,
    Toggle,
    AssetCard,
    Timeline,
    TimelineItem,
    Placeholder,
    Hero,
    RecentUpdates,
    LogList,
    Mermaid,
    RepoList,
    ...components
  }
}
```

- [ ] **Step 6: `content/education-experiment/repositories/_meta.ts` 작성**

파일 전체 내용:

```ts
export default {
  index: {
    title: '개요',
    theme: {
      breadcrumb: false,
      pagination: false,
      timestamp: false,
      typesetting: 'article'
    }
  }
}
```

- [ ] **Step 7: `content/education-experiment/repositories/index.mdx` 작성**

파일 전체 내용:

```mdx
---
title: 우아한테크코스 저장소 연구
---

# 우아한테크코스 저장소 연구

woowacourse org의 공개 저장소를 autoresearch 스타일 승격 파이프라인으로 분석한 결과입니다.

각 레포는 5차원 25점 루브릭(교육적 의도·상호작용 밀도·리뷰 품질·패턴 가능성·최신성)으로 측정되고, 일정 점수 이상일 때 이 목록에 등장합니다. T2는 심층 분석 완료, T3는 리뷰 대화·학습 궤적까지 관찰 완료를 의미합니다.

분석 원본 노트는 로컬 `.research/repos/` 에만 존재하며, 요약된 결과만 문서로 승격됩니다.

<RepoList />
```

- [ ] **Step 8: `content/education-experiment/_meta.ts`에 repositories 등록**

먼저 기존 파일 확인:

```bash
cat content/education-experiment/_meta.ts
```

`tools` 등록 근처에 `repositories` 추가. 기존 키들 사이에서 알파벳 순으로 적절한 위치에 한 줄 삽입:

```ts
  'repositories': '저장소 연구',
```

(기존 파일의 정확한 구조를 확인한 뒤 같은 스타일로 한 줄 추가한다. 다른 키 순서·포맷을 흐트러뜨리지 않는다.)

- [ ] **Step 9: `content/updates.ts`에 신규 섹션 소개 항목 추가**

파일 상단 배열 맨 위에 다음 항목 삽입:

```ts
{
  date: '2026년 연구',
  title: '우아한테크코스 저장소 연구 (신규)',
  description: 'woowacourse org 전체 공개 저장소를 autoresearch 파이프라인으로 분석하기 시작했습니다.',
  href: '/education-experiment/repositories',
  status: 'active',
},
```

- [ ] **Step 10: 빌드 검증**

```bash
npm run build 2>&1 | tail -30
```

기대: 빌드 성공. `/education-experiment/repositories` 페이지가 생성됨.

실패 시: 빈 `repositories` 배열로 인한 타입 에러라면 수정, import 경로 오류라면 수정.

- [ ] **Step 11: 커밋**

```bash
git add content/repositories.ts \
        components/RepoList.tsx components/RepoList.module.css \
        components/index.ts mdx-components.tsx \
        content/education-experiment/repositories/_meta.ts \
        content/education-experiment/repositories/index.mdx \
        content/education-experiment/_meta.ts \
        content/updates.ts
git commit -m "$(cat <<'EOF'
feat(research): add repositories section with RepoList component

- content/repositories.ts: 자동 갱신 데이터 소스 (빈 배열로 시작)
- components/RepoList: LogList 복제 기반, 카테고리 필터 + 점수 표시
- education-experiment/repositories: 신규 섹션 (index.mdx + _meta.ts)
- mdx-components.tsx · components/index.ts: RepoList 등록
- education-experiment/_meta.ts · updates.ts: 신규 섹션 노출

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: End-to-End 검증 및 `/research-cycle` 확장

**Files:**
- Modify: `.claude/commands/research-cycle.md`
- Modify: `.claude/commands/extract-insights.md` (소스 경로 한 줄 추가)

- [ ] **Step 1: 기존 `/research-cycle` 읽기**

```
Read .claude/commands/research-cycle.md
```

구조를 파악한다. 어떤 단계가 소스를 스캔하는지, 어디에 레포 단계를 추가할지 결정한다.

- [ ] **Step 2: `/extract-insights` 소스 경로 확장**

`.claude/commands/extract-insights.md`의 "소스 경로" 또는 "입력" 섹션을 찾아 `.research/repos/*.md`를 한 줄 추가한다.

변경 전 해당 섹션 예:
```
소스:
- content/education-experiment/logs/*.mdx
```

변경 후:
```
소스:
- content/education-experiment/logs/*.mdx
- .research/repos/*.md  (레포 분석 노트 — T2 이상만 의미 있음)
```

실제 섹션 이름과 문구는 파일을 읽고 일치시킨다.

- [ ] **Step 3: `/research-cycle`에 레포 단계 통합**

마스터 루프의 "측정" 단계와 "개선" 단계에 다음 한 문장씩 추가:

- 측정 단계: "로그 점수 외에 `.research/repo-scores.tsv`의 티어 분포도 함께 보고한다."
- 개선 단계: "로그 개선 후 필요 시 `/analyze-all`을 1~2배치 실행해 레포 파이프라인도 진행시킨다."

기존 단계 구조·헤더는 유지하고 문장만 추가.

- [ ] **Step 4: end-to-end 검증 — 샘플 레포 한 개를 T2까지 밀어보기**

전제: Task 2의 `/bootstrap-repos`가 이미 실행되어 T0 엔트리가 존재한다.

1. 활발한 미션 레포 하나를 골라 이름을 확인한다. 예시 명령:
   ```bash
   awk -F'\t' '$9=="true" && $2=="T0" {print $1}' .research/repo-scores.tsv | head -5
   ```
2. 고른 레포에 대해 `/analyze-repo <name>` 실행. 기대: T0→T1 승급.
3. 다시 `/analyze-repo <name>` 실행. 기대: T1→T2 게이트 판정. 게이트 통과 시 T2로 승급 + `content/repositories.ts` 업서트 + `content/education-experiment/repositories/<name>.mdx` 생성 + `content/updates.ts` 업서트 + 커밋.
4. 게이트 미달이면 다른 레포로 재시도(미션은 D2 조건으로 쉽게 통과해야 정상).

검증 항목:
- `.research/repo-scores.tsv` 해당 행이 T2로 갱신됨
- `content/repositories.ts` 에 신규 엔트리 존재
- `content/education-experiment/repositories/<name>.mdx` 생성됨
- `npm run build` 통과
- `git log --oneline -5` 에 `research(<name>): promote to T2` 메시지 확인

- [ ] **Step 5: end-to-end 검증 — `/analyze-all` 1배치**

1. `/analyze-all 3` 실행 (배치 크기 3).
2. 기대:
   - T0 상태인 레포 3개가 선택되어 각각 T1로 승급
   - 각 레포마다 커밋 1건씩 (총 3개 커밋)
   - `.research/batches/YYYY-MM-DD-batch-01.md` 생성 (gitignore)
   - 결과 보고 테이블 출력
3. 재개 검증: 동일 명령을 다시 실행하면 이미 T1인 레포는 건너뛰고 남은 T0부터 집는지 확인.

- [ ] **Step 6: 커맨드 확장 커밋**

```bash
git add .claude/commands/research-cycle.md .claude/commands/extract-insights.md
git commit -m "$(cat <<'EOF'
feat(research): wire repo pipeline into research-cycle & extract-insights

- /research-cycle: 측정 단계에 repo-scores.tsv 보고, 개선 단계에 /analyze-all 포함
- /extract-insights: .research/repos/*.md를 소스에 추가

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7: CLAUDE.md 업데이트 (레포 파이프라인 어휘 추가)**

CLAUDE.md의 "실험 로그 반복 개선 (autoresearch 패턴)" 섹션 아래 또는 병렬로 "레포 분석 파이프라인" 짧은 하위 섹션을 추가한다. 기존 표 바로 아래에 한 문단:

```markdown
### 레포 분석 파이프라인

woowacourse org 207개 공개 저장소 분석에도 동일 autoresearch 구조가 적용됩니다.

| 구성 | 파일 |
|---|---|
| 측정 루브릭 | `.claude/repo-analysis-rubric.md` |
| 상태 TSV | `.research/repo-scores.tsv` |
| 부트스트랩 | `/bootstrap-repos` |
| 단건 측정 | `/scan-repo <repo>` |
| 단건 사이클 | `/analyze-repo <repo>` |
| 배치 순회 | `/analyze-all [N]` |
| 문서 데이터 | `content/repositories.ts` (자동 갱신) |

T2 이상 승급된 레포만 `content/education-experiment/repositories/` 에 노출됩니다.
세션당 티어 1개 원칙을 따릅니다.
```

- [ ] **Step 8: CLAUDE.md 커밋**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs(claude): document repo analysis pipeline vocabulary

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## 인프라 완료 후 (실제 연구 실행, 본 계획 범위 밖)

본 계획이 완료되면 사용자는 다음을 반복 세션으로 실행하기만 하면 됩니다:

- **T1 완주**: `/analyze-all` 을 여러 세션에 걸쳐 실행 → 전체 레포 T1 도달
- **T2 심화**: T1 통과분에 대해 `/analyze-all` 재실행
- **T3 심화**: T2 통과분에 대해 `/analyze-all` 재실행
- **인사이트 승격**: `/extract-insights` 실행 → T4 인사이트 생성
- **모델 반영**: 필요 시 `/sync-model`

이들은 코드 변경이 아니라 데이터 생성 활동이므로 별도 구현 계획이 필요하지 않습니다.
