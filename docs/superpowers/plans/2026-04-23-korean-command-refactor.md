# 한국어 커맨드 재구성 · 팀 온보딩 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `woowacourse-docs` 저장소의 `.claude/` 커맨드를 한국어 5개로 재구성하고, 팀 공용 공개에 대비하여 README/CLAUDE.md/훅/gitignore를 정비한다.

**Architecture:** 기존 `.claude/skills/**`·`.claude/agents/**`는 손대지 않고 커맨드 레이어만 재작성한다. 영문 커맨드 7개는 한국어 커맨드로 리디렉션하는 얇은 shim으로 교체한다. `/로그승격`이 기존 `research-cycle + improve-all + extract-insights + sync-model + auto-sync`의 동작을 서브커맨드로 흡수한다.

**Tech Stack:** Claude Code 슬래시 커맨드(마크다운), Bash 훅 스크립트, Git.

**Spec:** `docs/superpowers/specs/2026-04-23-team-onboarding-korean-commands-design.md`

---

## 작업 전 공통 사전 조건

- 모든 작업은 `main` 브랜치 위에서 진행한다.
- 현재 브랜치에 미커밋 변경(예: `TecobleArchiveExplorer.tsx`)이 있지만 이번 스코프와 충돌하지 않는다. 그대로 두고, 본 플랜의 커밋은 `.claude/**`·`README.md`·`CLAUDE.md`·`.gitignore`만 스테이징한다.
- 각 커밋은 기존 저장소 스타일(한국어, 접두어 `feat:`·`chore:`·`docs:` 등)을 따른다.
- 커밋 푸시는 하지 않는다. 마지막 사용자 확인 후 사용자가 직접 푸시.

---

## Task 1: `settings.local.json`을 `.gitignore`에 추가

**Files:**
- Modify: `.gitignore`

**배경:** `git ls-files .claude/settings.local.json`이 빈 결과를 반환하여 이미 untracked 상태임이 확인되었다 (커밋 필요 없음). 단, 팀원이 실수로 `git add .` 했을 때 올라가지 않도록 `.gitignore`에 명시한다.

- [ ] **Step 1: 현재 상태 확인**

Run:
```bash
git ls-files .claude/settings.local.json
test -f .claude/settings.local.json && echo "file exists locally"
```

Expected: `git ls-files`는 빈 출력, 두 번째 명령은 `file exists locally`.

- [ ] **Step 2: `.gitignore`에 항목 추가**

현재 `.gitignore` 마지막 줄(`public/_pagefind/`) 뒤에 아래 두 줄을 덧붙인다. 기존 항목과 섞이지 않도록 새 섹션으로 분리.

```
# Claude Code 개인 설정 (팀 공유 금지)
.claude/settings.local.json
```

- [ ] **Step 3: 무시가 실제로 동작하는지 검증**

Run:
```bash
git check-ignore -v .claude/settings.local.json
```

Expected 출력 예시:
```
.gitignore:12:.claude/settings.local.json	.claude/settings.local.json
```

(줄번호는 환경에 따라 다름)

- [ ] **Step 4: 커밋**

```bash
git add .gitignore
git commit -m "chore: ignore .claude/settings.local.json for team safety"
```

---

## Task 2: `/사용방법` 커맨드 생성

**Files:**
- Create: `.claude/commands/사용방법.md`

**목적:** 팀원이 처음 Claude Code를 띄운 뒤 `/사용방법`을 실행하면 저장소의 핵심 워크플로우를 한 화면에 받을 수 있게 한다.

- [ ] **Step 1: 파일 작성**

`.claude/commands/사용방법.md` 내용:

````markdown
---
description: 팀원 온보딩 가이드 — 실험 로그 추가부터 승격까지 한 번에
---

# 우아한테크코스 공식문서 · 사용 방법

우아한테크코스 교육 가이드북 저장소의 공식 워크플로우입니다. 팀원은 아래 네 커맨드만 기억하면 됩니다.

## 한눈에 보기

```
/로그추가    → 새 실험 로그를 씁니다 (MDX + logs.ts 자동 갱신)
/로그평가    → 쓴 로그의 품질 점수를 봅니다 (파일 변경 없음)
/로그개선    → 점수가 낮은 차원을 반복 보강합니다
/로그승격    → 쌓인 로그를 인사이트·교육 모델로 끌어올립니다
```

## 전형적인 흐름

1. **로그 작성**: `/로그추가` → 슬러그·제목·설명을 대화형으로 입력 → MDX 스켈레톤이 `content/education/logs/`에 만들어지고 `content/logs.ts`가 갱신됩니다. 본문 D1~D5 섹션을 채우세요.
2. **자가 점검**: `/로그평가 {슬러그}`로 D1~D5 다섯 차원 점수를 봅니다. 약한 차원이 한 줄 코멘트로 표시됩니다.
3. **보강**: 점수가 낮으면 `/로그개선 {슬러그}`로 차원별 반복 개선을 돌립니다 (최대 5회, 점수 하락 시 자동 revert).
4. **승격**: 로그가 쌓이면 `/로그승격 dry-run`으로 승격 후보를 먼저 보고, 괜찮으면 `/로그승격`으로 전체 파이프라인 실행.

## 자주 하는 질문

**Q. 처음 쓰는데 무엇부터?**
A. `/로그추가`부터 치고 대화형 질문에 답하세요. 나머지는 본문만 채우면 됩니다.

**Q. 권한 프롬프트가 매번 뜹니다.**
A. `.claude/settings.local.json`에 자주 쓰는 도구를 allow로 추가하세요. 이 파일은 git에 올라가지 않습니다 (개인 설정).

**Q. 예전 `/research-cycle`·`/review-log` 같은 영문 커맨드는?**
A. 한국어로 이름이 바뀌었습니다. 과거 참조 호환을 위해 영문 커맨드는 남겨두었지만, 실제 구현은 한국어 커맨드에 있습니다. 기본 사용은 한국어로 하세요.

## 상세 가이드

- **저장소 안내**: `README.md`
- **프로젝트 규칙**: `CLAUDE.md`
- **평가 루브릭**: `.claude/log-quality-rubric.md` (D1~D5), `.claude/promotion-rubric.md` (P1~P4)
- **내부 구성**: `.claude/agents/`·`.claude/skills/` — 한국어 커맨드가 내부에서 호출하는 에이전트/스킬입니다. 일반 사용 시 직접 다룰 필요 없습니다.
````

- [ ] **Step 2: 커밋**

```bash
git add .claude/commands/사용방법.md
git commit -m "feat(commands): add /사용방법 onboarding guide"
```

---

## Task 3: `/로그추가` 커맨드 생성

**Files:**
- Create: `.claude/commands/로그추가.md`

**목적:** 신규 실험 로그 MDX 스켈레톤을 만들고 `content/logs.ts`를 갱신한다. `content/updates.ts` 추가는 옵션.

이 커맨드는 **대화형 입력**을 받는 커맨드다. Claude가 한 질문씩 던지고 사용자 답변을 받는다. 답변을 모아서 파일을 생성/수정한다.

- [ ] **Step 1: 파일 작성**

`.claude/commands/로그추가.md` 내용:

````markdown
---
description: 새 실험 로그 작성 — MDX 스켈레톤과 logs.ts 항목을 한 번에 만든다
---

# 새 실험 로그 추가

> 팀원이 새 실험 로그를 쓸 때 첫 번째로 치는 커맨드. 파일을 만드는 잡일을 모두 자동화한다.

## 절차

### Step 1: 대화형 입력 수집

아래 순서대로 **한 번에 하나씩** 물어본다. AskUserQuestion 도구가 있으면 사용하고, 없으면 일반 텍스트로 질문한다. 각 입력을 받으면 다음 질문으로 넘어간다.

1. **슬러그** — 영문 소문자와 하이픈만 사용. 예: `pair-programming-retro`.
   - 입력 후 `content/education/logs/{슬러그}.mdx` 존재 여부를 확인. 이미 있으면 "같은 이름의 로그가 존재합니다. 다른 슬러그를 입력하세요."로 재질문.

2. **제목** — 한국어. 예: `페어 프로그래밍 회고`.

3. **한 줄 요약 (description)** — 한 문장. 예: `레벨1 페어 회고 5회 누적 패턴 정리.`

4. **phases** — `온보딩 / 레벨0 / 레벨1 / 레벨2 / 레벨3 / 레벨4 / 레벨5` 중 하나 이상. 쉼표로 구분한 입력을 파싱. 예: `레벨1` 또는 `레벨1, 레벨2`.

5. **tracks** — `웹 백엔드 / 웹 프론트엔드 / 모바일` 중 하나 이상. 쉼표 구분.

6. **themes (선택)** — `소프트스킬 / 코치훈련` 중 0개 이상. 엔터로 건너뛸 수 있음.

7. **랜딩 타임라인에 올릴까요? (y/N)** — 기본값은 N. 기본값이면 `content/updates.ts`는 건드리지 않는다.
   - y인 경우에만 추가 질문:
     - **업데이트 date 라벨** — 예: `7기·8기` 또는 `2025년 8기`. 기본값은 `content/updates.ts` 배열 최상단의 `date` 값. `cat content/updates.ts` 에서 확인하거나 Read 도구로 앞 30줄을 읽는다.

### Step 2: 입력 요약 확인

모든 입력을 받으면 한 번 요약을 출력하고 "이대로 진행할까요? (Y/n)"을 묻는다. n이면 중단.

예시 요약:
```
슬러그: pair-programming-retro
제목: 페어 프로그래밍 회고
요약: 레벨1 페어 회고 5회 누적 패턴 정리.
phases: [레벨1]
tracks: [웹 백엔드]
themes: [소프트스킬]
랜딩 추가: 아니오
생성 파일: content/education/logs/pair-programming-retro.mdx
갱신 파일: content/logs.ts
```

### Step 3: MDX 스켈레톤 생성

`content/education/logs/{슬러그}.mdx`를 다음 내용으로 **Write 도구**를 이용해 생성한다.

```mdx
---
title: {제목}
description: {한 줄 요약}
---

import { Callout } from 'nextra/components'

# {제목}

<Callout>
**대상**: (예: 7기·8기 레벨1 페어)
**맥락**: (왜 이 실험을 했는지)
**핵심 질문**: (한 문장으로 답하려는 질문)
</Callout>

## 맥락

(이 실험이 필요했던 배경. 기존 운영 방식의 한계, 관찰한 현상 등.)

## 시도한 것

(구체적 운영 방법. 타임라인, 팀 구성, 사용한 템플릿 등. 다른 코치가 재현할 수 있을 정도로 구체적으로.)

## 관찰

(실제로 일어난 것. 가능하면 수치/인용과 함께. "좋았다" 대신 "18개 팀 중 15개 팀이 ~했다".)

## 반성

**잘 작동한 것**
- (구체적 근거와 함께)

**개선이 필요한 것**
- (구체적 근거와 함께)

## 다음 실험

(이 결과를 바탕으로 다음에 시도할 변형. 독립 실험이 아니라 연속선상의 다음 단계.)

{/* 원본 자료 링크가 있으면 아래에 추가 (GitHub Discussion, 슬라이드 등) */}
```

### Step 4: `content/logs.ts` 갱신

`content/logs.ts`를 Read 도구로 읽는다. `const logs: Log[] = [` 바로 다음 줄에 새 항목을 삽입한다 (배열 맨 위).

삽입할 항목:
```ts
  {
    slug: '{슬러그}',
    title: '{제목}',
    description: '{한 줄 요약}',
    href: '/education/logs/{슬러그}',
    date: '{오늘 YYYY-MM-DD}',
    phases: [{phases를 문자열 배열로}],
    tracks: [{tracks를 문자열 배열로}],
{themes가 있으면: `    themes: [{themes를 문자열 배열로}],`}
  },
```

Edit 도구를 사용하며, `old_string`은 `const logs: Log[] = [\n`, `new_string`은 `const logs: Log[] = [\n  {...새 항목...},\n` 형태.

`{오늘 YYYY-MM-DD}`는 `date +%Y-%m-%d` Bash로 구한다.

### Step 5: `content/updates.ts` 갱신 (옵션)

Step 1의 "랜딩 타임라인에 올릴까요?"가 y였을 때만 실행.

`content/updates.ts`를 읽고 `const updates: Update[] = [` 바로 다음 줄에 새 항목을 삽입:

```ts
  {
    date: '{date 라벨}',
    title: '{제목}',
    description: '{한 줄 요약}',
    href: '/education/logs/{슬러그}',
    status: 'active',
  },
```

### Step 6: 결과 보고

```
✅ 실험 로그 추가 완료

생성: content/education/logs/{슬러그}.mdx
갱신: content/logs.ts
{옵션: 갱신: content/updates.ts}

다음 단계:
1. MDX 본문의 D1~D5 섹션을 채우세요.
2. 작성 후 `/로그평가 {슬러그}`로 점수를 확인하세요.
```

## 제약

- 파일은 **생성/수정만** 한다. 커밋·푸시는 하지 않는다 (본문 작성 후 사용자가 직접).
- 슬러그 중복 검사 실패 시 재질문. 덮어쓰지 않는다.
- `content/logs.ts`·`content/updates.ts`의 **형식을 깨뜨리지 않는다**. 들여쓰기(2칸)와 작은따옴표 스타일을 기존 항목과 일치시킨다.
- `updates.ts`는 기본값 '아니오'다. 실험 로그는 랜딩 타임라인에 항상 올라갈 필요가 없다.
- CLAUDE.md의 문체 규칙(합니다체)을 따른다.
````

- [ ] **Step 2: 커밋**

```bash
git add .claude/commands/로그추가.md
git commit -m "feat(commands): add /로그추가 for guided experiment log creation"
```

---

## Task 4: `/로그평가` 커맨드 생성 (영문 review-log 포팅)

**Files:**
- Create: `.claude/commands/로그평가.md`
- Read (참고): `.claude/commands/review-log.md`

**포팅 원칙:** 기존 `.claude/commands/review-log.md`의 절차 구조와 제약은 그대로 유지. 아래 두 가지만 수정.

- 제목과 도입부 문구를 "실험 로그 품질 평가" → "`/로그평가` — 실험 로그 품질 점수 측정"
- **경로 수정**: `content/education-experiment/logs/` → `content/education/logs/` (두 군데)

- [ ] **Step 1: 기존 파일 참고 후 한국어 포팅**

`.claude/commands/로그평가.md`:

````markdown
---
description: 실험 로그 품질 점수 측정 (D1~D5, 25점) — 읽기 전용
---

# /로그평가 — 실험 로그 품질 점수 측정

> 로그를 수정하지 않고 루브릭 기준으로 점수만 매긴다. autoresearch의 `val_bpb` 측정에 해당.

## 인자

$ARGUMENTS — 평가할 로그 파일명 (예: `expedition`, `drama-onboarding`). 비어 있으면 전체 로그를 평가한다.

## 절차

1. `.claude/log-quality-rubric.md`를 읽어 평가 기준을 로드한다.
2. 대상 로그 파일을 읽는다.
   - 인자가 있으면: `content/education/logs/{인자}.mdx`
   - 인자가 없으면: `content/education/logs/*.mdx` 전체 (index.mdx, summary.mdx 제외)
3. 루브릭의 5개 차원(D1~D5)에 따라 각 로그를 평가한다.
4. 루브릭에 정의된 출력 형식으로 결과를 보여준다.
5. 전체 평가 시에는 마지막에 요약 테이블을 추가한다:

```
## 전체 요약

| 로그 | D1 | D2 | D3 | D4 | D5 | 총점 | 등급 |
|------|----|----|----|----|-----|------|------|
| ... | | | | | | | |

### 개선 우선순위
총점이 가장 낮은 로그 3개를 나열하고, 각각 가장 약한 차원을 표시한다.
```

## 제약

- 로그 파일을 **수정하지 않는다**. 읽기 전용이다.
- 점수는 루브릭 기준을 엄격하게 적용한다. 관대하게 주지 않는다.
- "업데이트 예정", "진행 중" 등 미완성 표시가 있는 섹션은 해당 차원에서 감점한다.
````

- [ ] **Step 2: 커밋**

```bash
git add .claude/commands/로그평가.md
git commit -m "feat(commands): add /로그평가 (Korean port of review-log)"
```

---

## Task 5: `/로그개선` 커맨드 생성 (영문 improve-log 포팅)

**Files:**
- Create: `.claude/commands/로그개선.md`
- Read (참고): `.claude/commands/improve-log.md`

**포팅 원칙:** `.claude/commands/improve-log.md` 전체 내용 복사 + 아래 수정.

- 제목을 `/로그개선` 으로
- Step 0의 경로 `content/education-experiment/logs/` → `content/education/logs/`
- 다른 본문/제약은 그대로

- [ ] **Step 1: 한국어 포팅 파일 작성**

아래 내용을 `.claude/commands/로그개선.md`로 저장한다. 본문은 기존 `improve-log.md`와 거의 동일하며, 경로와 제목만 수정되었다.

````markdown
---
description: 한 로그를 차원별 반복 개선 (최대 5회, 퇴보 시 자동 revert)
---

# /로그개선 — 단일 로그 반복 개선 (autoresearch 핵심 루프)

> Karpathy autoresearch의 핵심 루프를 실험 로그에 적용한다.
> 한 번에 한 차원만 개선하고, 개선되면 커밋하고, 퇴보하면 리버트한다.

## 인자

$ARGUMENTS — 개선할 로그 파일명 (예: `expedition`). 필수.

## 루프 절차

아래 단계를 **최대 5회** 반복한다. 총점이 A등급(21점 이상)에 도달하면 조기 종료한다.

### Step 0: 베이스라인 측정

1. `content/education/logs/{인자}.mdx`를 읽는다.
2. `.claude/log-quality-rubric.md`를 읽어 루브릭을 로드한다.
3. 현재 상태를 5개 차원으로 평가한다 (루브릭 출력 형식 사용).
4. 베이스라인 점수를 기록한다.

### Step 1: 가장 약한 차원 선택

- 가장 점수가 낮은 차원을 선택한다.
- 동점이면 D2(구체성) > D3(전이) > D4(교훈) > D1(구조) > D5(원본) 순으로 우선한다.
- 이전 반복에서 이미 시도한 차원은 건너뛴다 (5개 차원을 모두 시도했으면 종료).

### Step 2: 개선 실행

선택한 차원에 따라 개선한다:

**D1(구조)**: 누락된 섹션을 추가한다. Callout에 대상/맥락/핵심질문이 빠졌으면 보충한다.
**D2(구체성)**: 추상적 서술을 구체화한다. 가능하면 원본 디스커션에서 데이터를 가져온다. "좋았다" → "18개 팀 중 15개 팀이 ~했다" 식으로. 단, 확인 불가능한 수치를 지어내지 않는다.
**D3(전이)**: 운영 방법, 타임라인, 팀 구성 방식, 사용한 템플릿을 구체적으로 서술한다.
**D4(교훈)**: "잘 작동한 것"과 "개선이 필요한 것"을 균형있게 보강한다. 각 항목에 구체적 근거를 추가한다.
**D5(원본)**: GitHub Discussion, 슬라이드, 스프레드시트 등 원본 자료 링크를 추가한다.

### Step 3: 재측정

- 수정된 로그를 다시 5개 차원으로 평가한다.
- 점수 변화를 기록한다.

### Step 4: 커밋 또는 리버트

- **총점이 올랐거나 같으면**: `git add` + `git commit` (메시지: `improve "{로그 제목}" D{N} {before}→{after}점`)
- **총점이 내려갔으면**: `git checkout -- {파일}` 로 리버트. 이 차원은 "시도 완료"로 표시하고 다음 차원으로.

### Step 5: 다음 반복

- Step 1로 돌아간다.
- 모든 차원을 시도했거나, A등급에 도달했거나, 5회 반복했으면 종료.

## 종료 시 출력

```
## 개선 결과: {로그 제목}

| 반복 | 차원 | 전 | 후 | 판정 |
|------|------|----|----|------|
| 1 | D2 | 2 | 4 | ✅ 커밋 |
| 2 | D3 | 3 | 3 | ⏭️ 유지 |
| ... | | | | |

베이스라인: {N}/25 (등급 {X}) → 최종: {M}/25 (등급 {Y})
```

마지막에 `git push`한다.

## 제약

- 한 번에 **한 차원만** 건드린다. 여러 차원을 동시에 수정하면 어떤 변경이 효과적이었는지 알 수 없다.
- 교육적 맥락을 벗어난 내용을 추가하지 않는다.
- 확인 불가능한 수치나 인용을 지어내지 않는다. 원본 디스커션에서 확인 가능한 것만 사용한다.
- 기존에 잘 작성된 부분을 불필요하게 리팩터링하지 않는다.
- CLAUDE.md의 문체 규칙(합니다체)을 따른다.
- `_meta.ts`, `logs.ts`, `updates.ts`는 수정하지 않는다. 로그 본문만 수정한다.
````

- [ ] **Step 2: 커밋**

```bash
git add .claude/commands/로그개선.md
git commit -m "feat(commands): add /로그개선 (Korean port of improve-log)"
```

---

## Task 6: `/로그승격` 커맨드 생성 (research-cycle + improve-all + extract-insights + sync-model + auto-sync 통합)

**Files:**
- Create: `.claude/commands/로그승격.md`
- Read (참고): `.claude/commands/research-cycle.md`, `.claude/commands/improve-all.md`, `.claude/commands/extract-insights.md`, `.claude/commands/sync-model.md`, `.claude/commands/auto-sync.md`

**포팅 원칙:** 기존 5개 커맨드를 하나의 `/로그승격` 커맨드로 통합하되, 서브커맨드 디스패치로 개별 모드 유지.

**중요 경로 치환 (전 파일):** `content/education-experiment/` → `content/education/` (logs·tools·insights·_meta.ts 모두).

- [ ] **Step 1: 파일 작성**

`.claude/commands/로그승격.md`:

````markdown
---
description: 실험 로그를 인사이트·도구·교육 모델로 끌어올리는 승격 파이프라인
---

# /로그승격 — 승격 파이프라인 (통합 마스터 루프)

> 실험 로그 → 검증된 도구 → 인사이트 → 교육 모델로 **끌어올리는** 전체 파이프라인.
> Karpathy autoresearch의 외부 루프를 확장한 구조.

## 인자

$ARGUMENTS — 선택. 비어 있으면 전체 파이프라인 실행.

| 인자 | 동작 |
|------|------|
| (없음) | 전체 6단계 파이프라인 (측정 → 개선 → 승격평가 → 승격실행 → 동기화 → 기록) |
| `dry-run` | 측정 + 승격 후보 파악만. 파일 변경 없음. |
| `추출` | 교차 패턴 탐지 → 인사이트 문서 생성만. |
| `동기화` | 기존 인사이트 → 교육 모델 반영만. |
| `자동` | 증분 비대화형 모드. 신규 로그만 대상으로 단일 커밋. |

## 디스패치

인자를 먼저 확인하고 해당 섹션으로 분기한다:

- `$ARGUMENTS`가 `dry-run`이면 **Mode: dry-run** 섹션으로.
- `$ARGUMENTS`가 `추출`이면 **Mode: 추출** 섹션으로.
- `$ARGUMENTS`가 `동기화`면 **Mode: 동기화** 섹션으로.
- `$ARGUMENTS`가 `자동`이면 **Mode: 자동** 섹션으로.
- 비어 있으면 **Mode: 전체 사이클** 섹션으로.

---

## Mode: 전체 사이클

### Phase 1: 전체 측정

1. `content/logs.ts`에서 전체 로그 목록을 로드한다.
2. `.claude/log-quality-rubric.md`와 `.claude/promotion-rubric.md`를 로드한다.
3. 각 로그를 순회하며 **두 가지** 평가를 동시에 수행한다:
   - **품질 점수** (D1~D5, 25점 만점) — 로그 자체의 서술 품질
   - **승격 점수** (P1~P4, 20점 만점) — 상위 레이어로의 승격 적격성
4. 결과를 `research-cycle-log.tsv`에 기록한다:
   ```
   date	slug	D1	D2	D3	D4	D5	quality_total	grade	P1	P2	P3	P4	promo_total	promo_verdict	action
   ```

출력:
```
## Phase 1 완료: 전체 측정 결과

| 로그 | 카테고리 | 품질 | 등급 | 승격 | 판정 |
|------|----------|------|------|------|------|
| {slug} | {cat} | {N}/25 | {grade} | {M}/20 | {verdict} |

### 통계
- 평균 품질: {N}/25
- 승격 가능: {N}개 | 조건부: {N}개 | 보류: {N}개
```

### Phase 2: 품질 개선 (전체 순회)

1. 품질 B등급(16점) 미만인 로그를 점수 오름차순으로 정렬한다.
2. 각 로그에 대해 `/로그개선 {slug}` 루프를 실행한다.
3. **조기 종료 조건**: 모든 로그가 B등급 이상이거나, 10개 로그를 처리했을 때.
4. 개선된 로그는 Phase 3에서 재평가한다.
5. A등급 로그는 건너뛴다.

### Phase 3: 승격 평가 (교차 패턴 탐지)

1. 승격 점수가 12점 이상인 로그를 후보로 선별한다.
2. **교차 패턴 탐지**를 수행한다:
   - 같은 카테고리 내 로그들의 공통 패턴 식별
   - 카테고리를 넘는 범용 패턴 식별 (예: "점진적 스캐폴딩"은 레벨1, 소프트스킬 모두에서 등장)
   - `.claude/promotion-rubric.md`의 교차 패턴 출력 형식 사용
3. 클러스터링:
   - 3개 이상 로그가 겹치는 클러스터 → **강한 패턴** (인사이트 문서 작성 대상)
   - 2개 로그 → **약한 패턴** (기록만)
   - 1개 → **독립 실험** (건너뜀)
4. 각 후보를 분류:
   - P2 ≥ 4 → **도구** 후보
   - P3 ≥ 4 → **인사이트** 후보
   - P4 ≥ 4 + P1 ≥ 3 → **교육 모델** 후보

### Phase 4: 승격 실행 (한 사이클 최대 3건)

**승격 가능(16점 이상)** 판정을 받은 항목에 대해 아래 중 해당하는 것만 실행.

#### 4-1. 도구 승격

1. 로그에서 워크플로우/프롬프트/템플릿을 추출한다.
2. `content/education/tools/{도구명}.mdx`로 작성한다.
3. `content/education/tools/_meta.ts`에 등록한다.
4. `content/education/tools/index.mdx`에 링크를 추가한다.
5. 원본 로그에 `> 이 실험에서 검증된 도구: [도구명](/education/tools/{도구명})` 링크를 추가한다.

#### 4-2. 인사이트 승격

1. 교차 패턴 분석 결과를 `content/education/insights/{인사이트명}.mdx`로 작성한다.
2. `content/education/insights/_meta.ts`에 등록한다.
3. 인사이트 구조:
   - 패턴 요약 (2~3문장)
   - 근거 로그 목록 (로그별 기여 요소)
   - 핵심 원칙 (3~5개 bullet)
   - 적용 가이드 (언제, 어떻게 사용하는가)
4. `content/education/insights/index.mdx`의 Placeholder를 실제 콘텐츠로 교체한다.

#### 4-3. 교육 모델 반영

1. 반영 대상 섹션:
   - `content/education/design-patterns/catalog.mdx` — 새 디자인 패턴 추가
   - `content/education/curriculum/` — 커리큘럼 원칙 업데이트
   - `content/education/philosophy/` — 교육 철학 보강
2. 기존 내용을 **수정하지 않고** 새 사례/패턴을 **추가**한다.
3. 추가 시 근거 로그 링크를 반드시 포함한다.

#### 각 승격 후 커밋

```
promote "{로그/패턴 제목}" → {대상} ({점수 정보})
```

### Phase 5: 교육 모델 동기화

1. Phase 4에서 교육 모델에 반영한 내용을 검증한다.
2. `content/updates.ts`에 새 항목을 추가한다 (승격된 콘텐츠).
3. 필요시 `_meta.ts`에서 hidden 항목을 활성화한다.

### Phase 6: 사이클 기록

1. `research-cycle-log.tsv`에 이번 사이클 결과를 기록한다.
2. 사이클 요약을 출력한다:

```
## 사이클 완료 요약

| 항목 | 수치 |
|------|------|
| 측정한 로그 | {N}개 |
| 품질 개선한 로그 | {N}개 |
| 승격 후보 | {N}개 |
| 도구로 승격 | {N}개 |
| 인사이트로 승격 | {N}개 |
| 교육 모델 반영 | {N}개 |
| 평균 품질 변화 | {before} → {after} |

### 다음 사이클 제안
- {다음에 집중할 영역}
- {보강이 필요한 로그}
- {추가 반복 실험이 필요한 패턴}
```

---

## Mode: dry-run

`Mode: 전체 사이클`의 **Phase 1과 Phase 3만** 실행한다. 파일은 전혀 변경하지 않는다. Phase 4의 출력 테이블(승격 후보 목록)만 보여주고 종료.

---

## Mode: 추출

`Mode: 전체 사이클`의 **Phase 3 + Phase 4-2**만 실행한다. 인사이트 문서 생성만. 도구·교육모델 반영은 하지 않는다.

출력 형식은 기존 `/extract-insights`와 동일:

```
## 인사이트 추출 완료

### 강한 패턴 (인사이트 문서 생성)
| 패턴명 | 관련 로그 수 | 카테고리 |
|--------|-------------|----------|

### 약한 패턴 (추가 실험 대기)
| 패턴명 | 관련 로그 수 | 필요한 추가 실험 |
|--------|-------------|-----------------|

### 독립 실험 (패턴화 불가)
| 로그 | 이유 |
|------|------|
```

$ARGUMENTS 뒤에 추가 인자(예: `추출 레벨1`)를 허용하여 특정 카테고리로 범위 제한. 입력 파싱: 첫 토큰이 `추출`이면 나머지를 카테고리 필터로 사용.

---

## Mode: 동기화

`Mode: 전체 사이클`의 **Phase 4-3 + Phase 5**만 실행한다.

### 절차

1. `content/education/insights/` 전체 인사이트 MDX를 읽는다.
2. 각 인사이트의 "관련 교육 모델" 섹션을 확인.
3. 아직 교육 모델에 반영되지 않은 인사이트를 식별:
   - 인사이트에 교육 모델 링크가 있으나 교육 모델 문서에 역참조가 없는 경우
   - 인사이트에 "관련 교육 모델" 섹션 자체가 없는 경우
4. 매핑:

| 인사이트 유형 | 반영 대상 | 반영 방식 |
|--------------|-----------|-----------|
| 교육 설계 패턴 | `content/education/design-patterns/catalog.mdx` | 새 패턴 추가 |
| 교육 원칙 검증 | `content/education/philosophy/core-principles.mdx` | 실증 사례 추가 |
| 커리큘럼 시사점 | `content/education/curriculum/` 해당 문서 | 설계 근거 보강 |

5. **한 사이클 최대 3건** 반영.
6. 각 반영마다 개별 커밋: `sync model: "{인사이트 제목}" → education/{섹션}`
7. 역참조 추가: 인사이트 문서의 "관련 교육 모델" 섹션에 "✅ 반영 완료 (YYYY-MM-DD)" 표시.
8. `content/updates.ts`에 반영 항목 추가.

`$ARGUMENTS`가 `동기화 scan`이면 식별만 하고 실행하지 않는다.

### 제약

- 교육 모델의 **기존 내용을 수정하거나 삭제하지 않는다**.
- 근거 없는 내용을 추가하지 않는다.
- 한 사이클 최대 3건.

---

## Mode: 자동

**비대화형·증분·단일 커밋** 모드. 신규 로그만 대상.

### 절대 규칙

- `.claude/promotion-rubric.md`, `.claude/log-quality-rubric.md`는 **읽기만** 한다.
- 교육 모델 MDX 수정은 반드시 마커 섹션 안에서만:
  ```
  {/* <auto-sync slug="..." date="YYYY-MM-DD" logs={["a","b"]}> */}
  ...자동 생성 콘텐츠...
  {/* </auto-sync> */}
  ```
- 마커 밖 영역은 절대 수정하지 않는다.
- 한 파일에 자동 마커 섹션이 5개 이상이면 수정하지 않고 `needsHumanReview`에 추가한다.
- 모든 파일 변경은 **단일 커밋**으로 묶는다.

### Phase A — 범위 확정

1. `.claude/sync-state.json`을 읽어 `lastSyncCommit`을 가져온다.
2. `lastSyncCommit`이 null이면 cold start: 현재 HEAD를 `lastSyncCommit`에 기록하고 종료 (커밋 메시지: `auto-sync: cold start baseline`).
3. `git diff --name-only <lastSyncCommit> HEAD -- content/education/logs/*.mdx`로 신규/수정 로그 파일 목록 추출.
4. 비어 있으면 즉시 종료.
5. 파일명에서 슬러그 추출, `content/logs.ts`에서 메타데이터 결합.

### Phase B — 승격 평가

1. `.claude/promotion-rubric.md`를 로드.
2. 각 대상 로그를 P1~P4로 평가 (20점 만점).
3. `config.promotionMinScore` (기본 16) 이상만 통과. 미달은 `lastBatch.skipped`에 `{slug, score}`.
4. 통과가 0개면 Phase E로 건너뜀.

### Phase C — 인사이트 추출 (증분)

1. 통과 로그들을 함께 읽어 교차 패턴 탐지.
2. 각 신규 인사이트 후보에 대해:
   - `content/education/insights/` 전체를 grep해 유사 인사이트 유무 검사.
   - **있으면:** 기존 MDX에 "근거 로그" 섹션을 마커 안에서 추가/갱신.
   - **없으면:** `content/education/insights/<slug>.mdx` 신규 생성 + `_meta.ts` 등록 + `content/updates.ts` 항목 추가.
3. 결과 슬러그 목록을 `lastBatch.insights`에 기록.

### Phase D — 모델 동기화

1. 각 인사이트 분류:
   - 워크플로우/커리큘럼 함의 → `content/education/curriculum/`
   - 설계 원칙 → `content/education/design-patterns/`
   - 가치/관점 → `content/education/philosophy/`
2. 대상 디렉토리에서 가장 관련 깊은 기존 MDX 선택, 없으면 신규 생성.
3. 마커 섹션 카운트: `<auto-sync` 마커 개수가 `config.maxAutoSectionsPerFile` (기본 5) 이상이면 건너뛰고 `needsHumanReview`에 추가.
4. 마커 섹션 추가 시 근거 로그 슬러그 명시.
5. 신규 MDX는 `_meta.ts` + `content/updates.ts`도 갱신.

### Phase E — 기록 + 단일 커밋

1. `.claude/sync-state.json` 갱신:
   - `lastSyncDate` = 오늘
   - `lastBatch` = { logs, promoted, skipped, insights, modelFilesChanged }
   - `needsHumanReview` append (중복 제거)
2. `research-cycle-log.tsv`에 한 줄 append:
   ```
   <YYYY-MM-DD>	auto	<logs>	<insights>	<model_files>
   ```
3. `git add` + 첫 커밋:
   ```
   git commit -m "auto-sync: <N> logs → <M> insights → <K> files"
   ```
4. 새 HEAD를 `lastSyncCommit`에 반영하고 amend:
   ```bash
   jq --arg c "$(git rev-parse HEAD)" '.lastSyncCommit=$c' .claude/sync-state.json > /tmp/s && mv /tmp/s .claude/sync-state.json
   git add .claude/sync-state.json
   git commit --amend --no-edit
   ```
5. stdout 요약:
   ```
   auto-sync 완료
   - 대상 로그: N개
   - 승격 통과: P개 (skipped: S개)
   - 신규/갱신 인사이트: M개
   - 모델 파일 변경: K개
   - needs human review: <목록>
   ```

### 실패 처리

- 어느 Phase에서든 실패 시 `git restore .` 로 working tree 되돌리고 종료. `sync-state.json`은 갱신하지 않으므로 다음 실행에서 재시도된다.

---

## 공통 제약

- 루브릭 파일(`.claude/log-quality-rubric.md`, `.claude/promotion-rubric.md`, `.claude/tool-promotion-rubric.md`)은 **절대 수정하지 않는다**.
- 확인 불가능한 수치/인용을 지어내지 않는다.
- 기존 교육 모델 콘텐츠를 삭제하거나 대폭 변경하지 않는다. 추가만 한다.
- 한 사이클에서 교육 모델에 반영하는 항목은 최대 3개 (과적합 방지).
````

- [ ] **Step 2: 커밋**

```bash
git add .claude/commands/로그승격.md
git commit -m "feat(commands): add /로그승격 unifying research-cycle, extract-insights, sync-model, auto-sync"
```

---

## Task 7: 영문 커맨드 7개를 리디렉션 shim으로 교체

**Files:**
- Modify: `.claude/commands/review-log.md`
- Modify: `.claude/commands/improve-log.md`
- Modify: `.claude/commands/improve-all.md`
- Modify: `.claude/commands/extract-insights.md`
- Modify: `.claude/commands/sync-model.md`
- Modify: `.claude/commands/research-cycle.md`
- Modify: `.claude/commands/auto-sync.md`

**원칙:** 각 영문 파일을 "한국어 커맨드를 대신 쓰라"는 1~2줄 shim으로 전면 교체한다 (기존 내용 전부 삭제). 파일 자체는 남기므로 과거 대화의 `/research-cycle` 참조는 여전히 해결된다.

- [ ] **Step 1: `review-log.md` 교체**

전체 내용을 아래로 덮어쓴다:

```markdown
---
description: (구) 로그 품질 측정 — 이제 /로그평가로 이름이 바뀌었습니다.
---

이 커맨드는 **`/로그평가`로 이름이 바뀌었습니다**. 대신 `/로그평가 $ARGUMENTS`를 실행하세요. 전체 사용법은 `/사용방법`을 참고하세요.
```

- [ ] **Step 2: `improve-log.md` 교체**

```markdown
---
description: (구) 단일 로그 반복 개선 — 이제 /로그개선으로 이름이 바뀌었습니다.
---

이 커맨드는 **`/로그개선`으로 이름이 바뀌었습니다**. 대신 `/로그개선 $ARGUMENTS`를 실행하세요. 전체 사용법은 `/사용방법`을 참고하세요.
```

- [ ] **Step 3: `improve-all.md` 교체**

```markdown
---
description: (구) 전체 로그 순회 개선 — 이제 /로그승격이 Phase 2로 흡수합니다.
---

이 커맨드는 **`/로그승격`에 흡수되었습니다**. `/로그승격`의 Phase 2가 동일한 역할을 합니다. 전체 사용법은 `/사용방법`을 참고하세요.
```

- [ ] **Step 4: `extract-insights.md` 교체**

```markdown
---
description: (구) 교차 패턴 탐지 — 이제 /로그승격 추출로 이름이 바뀌었습니다.
---

이 커맨드는 **`/로그승격 추출`로 이름이 바뀌었습니다**. 대신 `/로그승격 추출 $ARGUMENTS`를 실행하세요. 전체 사용법은 `/사용방법`을 참고하세요.
```

- [ ] **Step 5: `sync-model.md` 교체**

```markdown
---
description: (구) 교육 모델 동기화 — 이제 /로그승격 동기화로 이름이 바뀌었습니다.
---

이 커맨드는 **`/로그승격 동기화`로 이름이 바뀌었습니다**. 대신 `/로그승격 동기화 $ARGUMENTS`를 실행하세요. 전체 사용법은 `/사용방법`을 참고하세요.
```

- [ ] **Step 6: `research-cycle.md` 교체**

```markdown
---
description: (구) 전체 파이프라인 — 이제 /로그승격으로 이름이 바뀌었습니다.
---

이 커맨드는 **`/로그승격`으로 이름이 바뀌었습니다**. 대신 `/로그승격 $ARGUMENTS`를 실행하세요. 전체 사용법은 `/사용방법`을 참고하세요.
```

- [ ] **Step 7: `auto-sync.md` 교체**

```markdown
---
description: (구) 증분 비대화형 동기화 — 이제 /로그승격 자동으로 이름이 바뀌었습니다.
---

이 커맨드는 **`/로그승격 자동`으로 이름이 바뀌었습니다**. 대신 `/로그승격 자동`을 실행하세요. 전체 사용법은 `/사용방법`을 참고하세요.
```

- [ ] **Step 8: 단일 커밋**

```bash
git add .claude/commands/review-log.md .claude/commands/improve-log.md .claude/commands/improve-all.md .claude/commands/extract-insights.md .claude/commands/sync-model.md .claude/commands/research-cycle.md .claude/commands/auto-sync.md
git commit -m "refactor(commands): replace English commands with redirect shims"
```

---

## Task 8: `auto-sync-check.sh` 훅 수정

**Files:**
- Modify: `.claude/hooks/auto-sync-check.sh`

**수정 사항:**
1. glob 경로: `content/education-experiment/logs/*.mdx` → `content/education/logs/*.mdx`
2. 알림 메시지: `/auto-sync 실행을 권장합니다` → `/로그승격 자동 실행을 권장합니다`

- [ ] **Step 1: 파일 내용 확인**

Run: `cat .claude/hooks/auto-sync-check.sh`

기존 내용은 15줄이며 `content/education-experiment/logs/*.mdx`와 `/auto-sync`를 포함한다.

- [ ] **Step 2: Edit 도구로 두 문자열 교체**

Edit 1:
- old_string: `content/education-experiment/logs/*.mdx`
- new_string: `content/education/logs/*.mdx`

Edit 2:
- old_string: `다음 턴에 /auto-sync 실행을 권장합니다.`
- new_string: `다음 턴에 /로그승격 자동 실행을 권장합니다.`

- [ ] **Step 3: 수정 후 검증**

Run:
```bash
grep -n "education-experiment" .claude/hooks/auto-sync-check.sh
grep -n "/auto-sync" .claude/hooks/auto-sync-check.sh
grep -n "/로그승격 자동" .claude/hooks/auto-sync-check.sh
```

Expected: 첫 두 명령은 매치 없음 (exit 1 또는 빈 출력), 세 번째는 한 줄 매치.

- [ ] **Step 4: 커밋**

```bash
git add .claude/hooks/auto-sync-check.sh
git commit -m "fix(hooks): update auto-sync-check to current logs path and /로그승격 자동"
```

---

## Task 9: `test-auto-sync-check.sh` 삭제

**Files:**
- Delete: `.claude/hooks/test-auto-sync-check.sh`

**배경:** `.claude/settings.json`의 훅 설정에 등록되어 있지 않은 테스트 잔재. 팀원 환경에서 혼란 유발.

- [ ] **Step 1: 등록 여부 재확인**

Run: `grep -r "test-auto-sync-check" .claude/`

Expected: 매치 없음 (확인되면 안전하게 삭제 가능).

- [ ] **Step 2: 삭제 및 커밋**

```bash
git rm .claude/hooks/test-auto-sync-check.sh
git commit -m "chore(hooks): remove unused test-auto-sync-check.sh"
```

---

## Task 10: CLAUDE.md 업데이트

**Files:**
- Modify: `CLAUDE.md`

**수정 사항:**
1. "콘텐츠 추가 시 필수 작업" 섹션에 `/로그추가` 커맨드 안내 추가
2. 경로 `content/education-experiment/logs/` → `content/education/logs/`
3. "실험 로그 반복 개선" 섹션의 커맨드 표를 한국어로 교체
4. "사용법" 섹션의 코드 블록을 한국어 커맨드로 교체

- [ ] **Step 1: 현재 CLAUDE.md 읽기**

Run: `cat CLAUDE.md`

현재 229줄 정도. 주요 변경 지점 파악.

- [ ] **Step 2: "콘텐츠 추가 시 필수 작업" 섹션 수정**

Edit:
- old_string:
  ```
  3. **실험 로그는 `content/logs.ts`에만 추가** — `content/education-experiment/logs/` 하위에 MDX를 추가했을 때, `content/logs.ts` 배열 맨 위에 항목 추가. `index.mdx`는 `<LogList />`가 자동 렌더링하므로 직접 수정 불필요
  ```
- new_string:
  ```
  3. **실험 로그는 `content/logs.ts`에만 추가** — `content/education/logs/` 하위에 MDX를 추가했을 때, `content/logs.ts` 배열 맨 위에 항목 추가. `index.mdx`는 `<LogList />`가 자동 렌더링하므로 직접 수정 불필요. **팀원은 `/로그추가` 커맨드로 세 파일을 한 번에 갱신할 수 있다.**
  ```

- [ ] **Step 3: 프로젝트 구조 경로 수정**

Edit:
- old_string: `└── education-experiment/      교육 실험`
- new_string: `└── education/                교육 (철학·패턴·커리큘럼·로그·인사이트·도구)`

(기존 블록 다이어그램에서 `education-experiment` 표기를 현재 실제 디렉토리와 일치시킴)

- [ ] **Step 4: 커맨드 표를 한국어로 교체**

Edit:
- old_string:
  ```
  | autoresearch | 실험 로그 | 파일 |
  |---|---|---|
  | `prepare.py` (불변 평가 인프라) | 품질 루브릭 (5차원, 25점 만점) | `.claude/log-quality-rubric.md` |
  | `prepare.py` (승격 평가 인프라) | 승격 루브릭 (4차원, 20점 만점) | `.claude/promotion-rubric.md` |
  | `val_bpb` (메트릭 측정) | `/review-log` (점수 매기기) | `.claude/commands/review-log.md` |
  | train → measure → commit/reset 루프 | `/improve-log` (한 차원씩 개선) | `.claude/commands/improve-log.md` |
  | 밤새 실험 순회 | `/improve-all` (전체 로그 순회) | `.claude/commands/improve-all.md` |
  | 패턴 추출 | `/extract-insights` (교차 패턴 탐지) | `.claude/commands/extract-insights.md` |
  | 모델 반영 | `/sync-model` (교육 모델 동기화) | `.claude/commands/sync-model.md` |
  | 전체 파이프라인 | `/research-cycle` (마스터 루프) | `.claude/commands/research-cycle.md` |
  | `results.tsv` (실험 기록) | `research-cycle-log.tsv` (사이클 기록) | 루트 디렉터리 |
  ```
- new_string:
  ```
  | autoresearch | 실험 로그 | 파일 |
  |---|---|---|
  | `prepare.py` (불변 평가 인프라) | 품질 루브릭 (5차원, 25점 만점) | `.claude/log-quality-rubric.md` |
  | `prepare.py` (승격 평가 인프라) | 승격 루브릭 (4차원, 20점 만점) | `.claude/promotion-rubric.md` |
  | `val_bpb` (메트릭 측정) | `/로그평가` | `.claude/commands/로그평가.md` |
  | train → measure → commit/reset 루프 | `/로그개선` | `.claude/commands/로그개선.md` |
  | 전체 파이프라인 (측정·개선·승격·동기화) | `/로그승격` | `.claude/commands/로그승격.md` |
  | 증분 비대화형 | `/로그승격 자동` | 상동 |
  | 교차 패턴 탐지만 | `/로그승격 추출` | 상동 |
  | 교육 모델 반영만 | `/로그승격 동기화` | 상동 |
  | `results.tsv` (실험 기록) | `research-cycle-log.tsv` | 루트 디렉터리 |
  ```

- [ ] **Step 5: "사용법" 예시 블록 교체**

Edit:
- old_string (≈ 80줄 분량, `# 1. 특정 로그 평가만 (수정 없음)`부터 `/research-cycle dry-run` 까지):

기존 사용법 코드블록 전체(`# 1. 특정 로그 평가만` ~ `/research-cycle dry-run`)를 한 번에 교체한다.

- new_string:
  ```bash
  # 특정 로그 평가 (수정 없음)
  /로그평가 expedition
  
  # 전체 로그 일괄 평가
  /로그평가
  
  # 특정 로그 반복 개선 (최대 5회, A등급까지)
  /로그개선 expedition
  
  # 전체 파이프라인 (측정 → 개선 → 승격 → 동기화)
  /로그승격
  
  # 평가만, 변경 없음
  /로그승격 dry-run
  
  # 교차 패턴 탐지만
  /로그승격 추출
  
  # 교육 모델 반영만
  /로그승격 동기화
  
  # 증분 비대화형 (신규 로그만)
  /로그승격 자동
  
  # 새 실험 로그 작성
  /로그추가
  ```

- [ ] **Step 6: "자동 동기화" 섹션의 /auto-sync 언급 갱신**

Edit:
- old_string: `알림을 본 다음 사용자 턴에 Claude가 \`/auto-sync\`를 실행한다.`
- new_string: `알림을 본 다음 사용자 턴에 Claude가 \`/로그승격 자동\`을 실행한다.`

또한:
- old_string: `\`/auto-sync\`는 신규 로그만 대상으로 증분 처리하는 자동 루프다.`
- new_string: `\`/로그승격 자동\`은 신규 로그만 대상으로 증분 처리하는 자동 루프다.`

- [ ] **Step 7: 하네스 섹션의 커맨드 이름 갱신 (해당 위치만)**

Edit:
- old_string: `/research-cycle, 로그 승격, 전체 로그 처리, 인사이트 추출, 교육 모델 동기화 관련 요청 시 \`research-cycle\` 스킬을 사용하라.`
- new_string: `/로그승격, 로그 승격, 전체 로그 처리, 인사이트 추출, 교육 모델 동기화 관련 요청 시 \`research-cycle\` 스킬을 사용하라.`

- [ ] **Step 8: 경로 잔재 최종 점검**

Run:
```bash
grep -n "education-experiment" CLAUDE.md
```

Expected: 매치 없음. 있으면 각각 `education`으로 수정 (컨텍스트 확인 후).

- [ ] **Step 9: 커밋**

```bash
git add CLAUDE.md
git commit -m "docs: sync CLAUDE.md with Korean commands and current logs path"
```

---

## Task 11: README.md 재작성

**Files:**
- Modify: `README.md`

**목적:** 팀원 온보딩 중심으로 재구성. 기존 "상황별 커맨드 선택" 사례 나열은 축소하고, 첫 실험 로그 쓰기까지의 흐름을 맨 앞에 놓는다.

- [ ] **Step 1: 전체 교체 작성**

`README.md` 전체를 아래 내용으로 Write 도구로 덮어쓴다.

````markdown
# woowacourse-docs

우아한테크코스 공식 교육 가이드북. Nextra 4 + Next.js App Router 기반.

## 빠른 시작

```bash
npm install
npm run dev     # http://localhost:3000
```

## 팀원으로 처음 왔다면

Claude Code를 이 저장소에서 열고 아래 네 커맨드만 기억하세요.

```
/사용방법       저장소 워크플로우 한눈에 보기
/로그추가       새 실험 로그를 씁니다
/로그평가       쓴 로그의 품질 점수를 봅니다
/로그개선       약한 차원을 자동 보강합니다
```

첫 실험 로그를 쓰는 순서:

1. `/사용방법` — 전체 흐름을 한 번 훑습니다.
2. `/로그추가` — 대화형 질문(슬러그·제목·요약·phases·tracks)에 답하면 `content/education/logs/`에 MDX 스켈레톤이, `content/logs.ts`에 항목이 자동으로 만들어집니다.
3. MDX 본문의 D1~D5 섹션(맥락·시도한 것·관찰·반성·다음 실험)을 채웁니다.
4. `/로그평가 {슬러그}` 로 점수를 확인합니다.
5. 낮은 차원이 보이면 `/로그개선 {슬러그}` 로 반복 보강합니다.

### 권한 설정

Claude Code 권한 프롬프트가 번거롭다면 `.claude/settings.local.json`에 자주 쓰는 도구를 `allow`로 추가하세요. 이 파일은 **git에 올라가지 않습니다** (개인 설정).

## 실험 로그 워크플로우

### 작성

```
/로그추가
```

대화형 질문에 답하면 아래 파일이 정합적으로 갱신됩니다.

- 생성: `content/education/logs/{슬러그}.mdx` (D1~D5 섹션 스켈레톤)
- 수정: `content/logs.ts` (배열 맨 위에 새 항목)
- 선택: `content/updates.ts` (팀원이 "랜딩 타임라인에 올림"을 선택한 경우에만)

### 점검

```
/로그평가 {슬러그}     # 개별 로그
/로그평가              # 전체 일괄
```

D1~D5 다섯 차원(25점 만점) 점수와 약한 차원 코멘트를 반환합니다. **파일은 변경하지 않습니다.**

### 보강

```
/로그개선 {슬러그}
```

가장 약한 차원부터 한 번에 하나씩 최대 5회 반복 개선. 점수가 떨어지면 자동 revert.

## 승격 파이프라인

로그가 쌓이면 검증된 패턴을 도구·인사이트·교육 모델로 끌어올립니다.

```
실험 로그 (logs/)
    ↓ 품질 평가·개선 (D1~D5, 25점)
    ↓ 승격 평가 (P1~P4, 20점)
    ├→ 검증된 도구 (tools/)           P2 ≥ 4
    ├→ 인사이트 (insights/)           P3 ≥ 4
    ├→ 디자인 패턴 (design-patterns/) P4 ≥ 4 + P1 ≥ 3
    ├→ 커리큘럼 (curriculum/)         P4 ≥ 4 + P1 ≥ 3
    └→ 교육 철학 (philosophy/)        P4 ≥ 4 + P1 ≥ 4 (엄격)
```

### 커맨드

```
/로그승격            전체 파이프라인 (측정 → 개선 → 승격 → 동기화)
/로그승격 dry-run    평가와 후보 파악만, 파일 변경 없음
/로그승격 추출       교차 패턴 탐지 → 인사이트 문서 생성만
/로그승격 동기화     인사이트 → 교육 모델 반영만
/로그승격 자동       증분 비대화형 (신규 로그만, 단일 커밋)
```

처음 쓰는 경우 `dry-run`으로 먼저 현황을 확인한 뒤 전체 실행하는 것을 권장합니다.

## 커맨드 레퍼런스

| 커맨드 | 인자 | 파일 변경 | 한 줄 설명 |
|--------|------|-----------|------------|
| `/사용방법` | 없음 | 없음 | 팀원용 온보딩 가이드 출력 |
| `/로그추가` | 없음 (대화형) | MDX + logs.ts | 새 실험 로그 생성 |
| `/로그평가` | `[슬러그]` | 없음 | 로그 품질 점수 측정 |
| `/로그개선` | `<슬러그>` 필수 | 로그 MDX | 차원별 반복 개선 |
| `/로그승격` | `[dry-run\|추출\|동기화\|자동]` | 서브커맨드별 | 승격 파이프라인 |

과거 영문 커맨드(`/research-cycle`, `/review-log` 등)는 한국어 커맨드로 리디렉션하는 얇은 shim으로 남아 있습니다.

## 내부 구성

`.claude/` 아래의 구성 요소. 일반 사용 시 직접 다룰 필요는 없습니다.

- `agents/` — 한국어 커맨드가 내부에서 호출하는 전문 에이전트 (log-quality, insight, promotion, research-cycle-orchestrator)
- `skills/` — 승격 파이프라인의 단계별 스킬 (log-quality, insight-extraction, promotion, research-cycle)
- `hooks/auto-sync-check.sh` — 매 대화 종료 시 미반영 로그를 감지해 `/로그승격 자동` 실행을 권장하는 알림 훅
- `log-quality-rubric.md` / `promotion-rubric.md` / `tool-promotion-rubric.md` — 평가 기준. **사람만 수정합니다** (기준이 바뀌면 과거 점수와 비교 불가능).
- `sync-state.json` — 증분 동기화 상태 (팀 공유)
- `settings.json` — 훅 설정 (팀 공유)
- `settings.local.json` — 개인 권한 설정 (`.gitignore` 대상)

## 콘텐츠 구조

```
content/
├── index.mdx           홈 (RecentUpdates 타임라인 자동 렌더링)
├── updates.ts          최근 업데이트 데이터 (단일 진실 원천)
├── logs.ts             실험 로그 메타데이터 (LogList 데이터 소스)
└── education/
    ├── philosophy/        교육 철학
    ├── design-patterns/   디자인 패턴 카탈로그
    ├── curriculum/        커리큘럼 (레벨별 설계 원칙)
    ├── insights/          인사이트 (실험 로그에서 추출한 교차 패턴)
    ├── tools/             검증된 도구 (복사해서 바로 쓰는 워크플로우)
    └── logs/              실험 로그 (매주 쌓이는 원재료)
```

## 콘텐츠 추가 규칙

- **실험 로그**: `/로그추가`로 자동 처리 (MDX + `logs.ts`)
- **그 외 문서**: 새 MDX 추가 시 `_meta.ts` 등록 + (필요 시) `updates.ts` 추가

상세 규칙은 `CLAUDE.md` 참조.

## 기술 스택

- [Nextra 4](https://nextra.site/) — MDX 기반 문서 사이트 프레임워크
- Next.js App Router
- TypeScript
````

- [ ] **Step 2: 경로 잔재 점검**

Run:
```bash
grep -n "education-experiment" README.md
```

Expected: 매치 없음.

- [ ] **Step 3: 커밋**

```bash
git add README.md
git commit -m "docs: restructure README around team onboarding and Korean commands"
```

---

## Task 12: 최종 검증

**Files:** (없음 — 검증만)

- [ ] **Step 1: 경로 드리프트 전역 점검**

Run:
```bash
git grep -n "education-experiment"
```

Expected: 매치 없음. 만약 있다면 어느 파일인지 확인하고 필요 시 수정 커밋 추가.

- [ ] **Step 2: 영문 커맨드 잔여 참조 확인**

Run:
```bash
git grep -n "/research-cycle\|/auto-sync\|/extract-insights\|/sync-model\|/improve-all\|/review-log\|/improve-log" -- ':!docs/superpowers/**' ':!.claude/commands/**'
```

Expected: 매치 없음. shim 파일(`/.claude/commands/` 하위)과 스펙/플랜 문서(`docs/superpowers/**`)는 제외했기 때문에 본문에서 영문 커맨드가 남아있지 않아야 한다. 있다면 한국어 커맨드로 교체 커밋을 추가.

- [ ] **Step 3: 한국어 커맨드 파일 생성 확인**

Run:
```bash
ls .claude/commands/
```

Expected 출력에 다음 파일들이 모두 포함되어야 한다:
```
사용방법.md
로그추가.md
로그평가.md
로그개선.md
로그승격.md
review-log.md          # shim
improve-log.md         # shim
improve-all.md         # shim
extract-insights.md    # shim
sync-model.md          # shim
research-cycle.md      # shim
auto-sync.md           # shim
```

- [ ] **Step 4: shim 파일 크기 확인**

Run:
```bash
wc -l .claude/commands/review-log.md .claude/commands/improve-log.md .claude/commands/improve-all.md .claude/commands/extract-insights.md .claude/commands/sync-model.md .claude/commands/research-cycle.md .claude/commands/auto-sync.md
```

Expected: 각 파일이 10줄 이하 (실제 구현이 아닌 redirect).

- [ ] **Step 5: 삭제 파일 부재 확인**

Run:
```bash
test ! -f .claude/hooks/test-auto-sync-check.sh && echo "OK: deleted" || echo "STILL EXISTS"
```

Expected: `OK: deleted`

- [ ] **Step 6: `.gitignore` 동작 확인**

Run:
```bash
git check-ignore -v .claude/settings.local.json
```

Expected: `.gitignore:<line>:.claude/settings.local.json	.claude/settings.local.json`

- [ ] **Step 7: 훅 스크립트 실행 확인**

Run:
```bash
bash .claude/hooks/auto-sync-check.sh; echo "exit=$?"
```

Expected: 임계값 미만이면 `exit=0`, 임계값 이상이면 stderr에 "미반영 실험 로그 ... 누적 ... /로그승격 자동 ..." 알림 후 `exit=2`.

- [ ] **Step 8: 결과 요약**

콘솔에 출력:
```
✅ 한국어 커맨드 재구성 완료
- 한국어 신규: 5개 (.claude/commands/{사용방법,로그추가,로그평가,로그개선,로그승격}.md)
- 영문 shim: 7개
- 훅: auto-sync-check.sh 갱신, test-auto-sync-check.sh 삭제
- 문서: README.md / CLAUDE.md 재구성
- .gitignore: settings.local.json 추가
```

**Note:** 이 Task에서는 새 커밋을 생성하지 않는다 (검증만). 어느 Step에서 문제가 발견되면 해당 문제에 맞는 수정 커밋을 추가한다.

---

## 실행 후 권장 다음 단계 (사용자 영역)

이 플랜은 구현만 커버한다. 완료 후 사용자가 직접 해야 할 것:

1. **수동 `/로그추가` 테스트** — 테스트 슬러그(예: `plan-verify-test`)로 실제 대화형 흐름을 돌려보고, 생성된 MDX·`logs.ts`·(옵션) `updates.ts`가 정상인지 확인. 테스트 결과물은 커밋하기 전 `git restore .`로 정리.
2. **푸시 결정** — 본 플랜의 커밋들(10~12개)을 origin/main으로 푸시할지 검토.
3. **팀 공지** — 신규 커맨드 이름과 `/사용방법` 안내를 팀 채널에 공유.

---

## 자체 점검 (플랜 작성 직후 체크)

- [x] **스펙 커버리지**: 스펙의 8개 섹션이 모두 작업으로 매핑됨 (커맨드 5개 → Task 2~6 / shim → Task 7 / 스킬·에이전트 유지 → 비작업 / 훅 → Task 8~9 / settings·gitignore → Task 1 / README → Task 11 / CLAUDE.md → Task 10 / docs/plans 정리 → 손대지 않음).
- [x] **플레이스홀더 점검**: "TBD", "나중에 구현" 없음. 각 Task에 실제 파일 내용 또는 구체적 교체 지시 포함.
- [x] **타입/이름 일관성**: 커맨드 이름이 본문·표·검증 단계에서 일관되게 사용됨 (`/로그추가`, `/로그평가`, `/로그개선`, `/로그승격`, `/사용방법`). `로그승격 자동` 같은 서브커맨드 표기도 일관.
- [x] **경로 일관성**: 모든 신규 커맨드 파일이 `content/education/` 경로를 사용함. 낡은 `content/education-experiment/` 잔재 없음.
