# knowledge/ → llm-wiki 분리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `knowledge/`를 비공개 정본 repo `woowacourse-projects/llm-wiki`로 분리하고, docs repo는 gitignored 로컬 클론으로 재연결하며, 위키 워크플로우 네이밍을 `llm-wiki`/`/위키*`로 통일한다.

**Architecture:** "경로는 그대로, 추적만 끊기" — git 히스토리를 `subtree split`으로 보존해 llm-wiki에 시드한 뒤, docs repo에서 `knowledge/` 추적을 제거하고 같은 위치(`llm-wiki/`)에 클론으로 재연결한다. 툴링은 경로 prefix와 커맨드 식별자만 치환하면 동작한다.

**Tech Stack:** git (subtree split), gh CLI, Node.js 스크립트(mjs), Nextra/Next.js 빌드, 마크다운 기반 LLM 커맨드/스킬/에이전트.

## Global Constraints

- **본문 보통명사 "지식"은 절대 치환 금지.** `content/**`, `.claude/*-rubric.md`, `public/llms-full.txt`(빌드 생성물), llm-wiki로 이동한 콘텐츠는 손대지 않는다. 워크플로우 토큰(`/지식*`, 폴더·스크립트·스킬 식별자)만 치환한다.
- **순서가 정합성.** subtree split(Task 2)은 `knowledge/` 제거(Task 3) **전에** 실행한다.
- **`.gitignore`는 반드시 `/llm-wiki/`** (leading slash). `llm-wiki/`(슬래시 없음)는 `scripts/llm-wiki/`까지 무시한다.
- **각 Task는 독립 커밋.** 문제 시 `git revert` 한 번으로 되돌릴 수 있게.
- 대상 repo URL: `https://github.com/woowacourse-projects/llm-wiki.git`
- 스펙 원본: `docs/superpowers/specs/2026-06-19-llm-wiki-extraction-design.md`

---

### Task 1: 마이그레이션 브랜치 + push 권한 게이트

**Files:**
- 변경 없음 (브랜치/권한 준비)

**Interfaces:**
- Produces: 작업 브랜치 `feature/llm-wiki-extraction`, push 권한 확인 완료.

- [ ] **Step 1: 깨끗한 베이스에서 브랜치 생성**

```bash
cd /Users/makerjun/git/woowahan/woowacourse-docs
git stash -u            # .DS_Store 등 잡다한 변경 격리 (있으면)
git checkout main && git pull --ff-only
git checkout -b feature/llm-wiki-extraction
# 스펙/플랜 문서를 이 브랜치로 가져오기 (feature/education-getting-started 에서 작성됨)
git checkout feature/education-getting-started -- docs/superpowers/specs/2026-06-19-llm-wiki-extraction-design.md docs/superpowers/plans/2026-06-19-llm-wiki-extraction.md
git add docs/superpowers && git commit -m "docs: llm-wiki 분리 스펙·플랜 추가"
```

- [ ] **Step 2: push 권한 확인 (게이트)**

Run:
```bash
gh api repos/woowacourse-projects/llm-wiki --jq '.permissions'
```
Expected: `push` 또는 `admin` 이 `true`. `false`이거나 권한 에러면 **여기서 중단**하고 사용자에게 보고(`#support-정보보안` 등 org 권한 문의 안내). 이후 Task로 진행 금지.

- [ ] **Step 3: 대상 repo 비어있음 재확인**

Run:
```bash
gh repo view woowacourse-projects/llm-wiki --json isEmpty --jq '.isEmpty'
```
Expected: `true`. `false`면 중단하고 사용자 확인(덮어쓰기 위험).

---

### Task 2: llm-wiki 시드 (subtree split, 히스토리 보존)

**Files:**
- 변경 없음 (git 히스토리 → 원격 push). `knowledge/`는 아직 docs repo에 그대로 존재.

**Interfaces:**
- Consumes: docs repo의 `knowledge/` 추적 히스토리(17커밋).
- Produces: `llm-wiki` 원격에 `main` 브랜치 — 루트에 `raw/ wiki/ index.md log.md AGENTS.md README.md`, 히스토리 보존.

- [ ] **Step 1: knowledge/ prefix 히스토리를 분리 브랜치로 split**

```bash
git subtree split --prefix=knowledge -b export-llm-wiki
```
Expected: `Created branch 'export-llm-wiki'` 와 커밋 SHA 출력.

- [ ] **Step 2: split 결과 검증 (루트에 콘텐츠가 오는지)**

Run:
```bash
git ls-tree --name-only export-llm-wiki
```
Expected: `AGENTS.md README.md index.md log.md raw wiki` (prefix `knowledge/`가 벗겨진 상태). `knowledge/`가 보이면 중단.

- [ ] **Step 3: llm-wiki main 으로 push**

```bash
git push https://github.com/woowacourse-projects/llm-wiki.git export-llm-wiki:main
```
Expected: 새 `main` 브랜치 생성 성공. 인증 실패 시 `gh auth setup-git` 후 재시도.

- [ ] **Step 4: 원격 반영 검증**

Run:
```bash
git ls-remote --heads https://github.com/woowacourse-projects/llm-wiki.git
gh api repos/woowacourse-projects/llm-wiki/contents --jq '.[].name'
```
Expected: `refs/heads/main` 존재, 콘텐츠 목록에 `raw wiki index.md log.md` 포함.

- [ ] **Step 5: split 임시 브랜치 정리**

```bash
git checkout feature/llm-wiki-extraction
git branch -D export-llm-wiki
```

---

### Task 3: docs repo 추적 제거 + gitignore + 로컬 클론 재연결

**Files:**
- Modify: `.gitignore`
- Delete (tracking): `knowledge/**` (137 파일)
- Create (untracked): `llm-wiki/` (llm-wiki 클론)

**Interfaces:**
- Consumes: Task 2의 원격 `llm-wiki` main.
- Produces: docs repo가 더 이상 knowledge를 추적하지 않음. `./llm-wiki/`는 gitignored 클론.

- [ ] **Step 1: `.gitignore`에 `/llm-wiki/` 추가 (leading slash 필수)**

`.gitignore`의 `.inbox/` 줄 아래에 추가:
```gitignore
# 비공개 지식 정본 repo (woowacourse-projects/llm-wiki) 로컬 클론. 추적하지 않음.
/llm-wiki/
```

- [ ] **Step 2: knowledge/ 추적 + 워킹트리 제거**

```bash
git rm -r knowledge
```
Expected: 137개 파일 `rm` 출력.

- [ ] **Step 3: 커밋**

```bash
git add .gitignore
git commit -m "refactor(knowledge): knowledge/ 추적 제거 + /llm-wiki/ gitignore

비공개 정본 repo(woowacourse-projects/llm-wiki)로 분리. 원본 히스토리는
subtree split으로 llm-wiki main에 보존됨."
```

- [ ] **Step 4: 같은 위치에 llm-wiki 클론 (재연결)**

```bash
git clone https://github.com/woowacourse-projects/llm-wiki.git llm-wiki
```
Expected: `llm-wiki/` 디렉터리 생성, `raw/ wiki/ index.md …` 존재.

- [ ] **Step 5: gitignore 정합성 검증 (이게 leading-slash 가드의 핵심)**

Run:
```bash
git check-ignore llm-wiki/index.md && echo "OK: 클론 무시됨"
git status --porcelain | grep -q llm-wiki && echo "FAIL: 클론이 추적됨" || echo "OK: status 깨끗"
```
Expected: 첫 줄 `OK: 클론 무시됨`, 둘째 줄 `OK: status 깨끗`.

---

### Task 4: 경로 치환 `knowledge/` → `llm-wiki/` (docs repo 잔류 툴링)

**Files (Modify):**
- `.claude/agents/wiki-compiler.md`
- `.claude/agents/wiki-linter.md`
- `.claude/commands/로그추가.md`
- `.claude/commands/지식점검.md` `지식정제.md` `지식질의.md` `지식흡수.md` (리네임은 Task 6, 여기선 경로만)
- `.claude/hooks/auto-compile-check.sh`
- `.claude/hooks/protect-raw.sh`
- `.claude/skills/knowledge-wiki/SKILL.md` (리네임은 Task 5)
- `components/CurriculumTimeline.tsx` (주석)
- `content/curriculum-history.ts` (주석)
- `scripts/knowledge/compile-state.mjs` (리네임은 Task 5)
- `scripts/mdx-to-raw.mjs` (주석)

**Interfaces:**
- Produces: 모든 잔류 툴링이 `llm-wiki/` 경로를 가리킴.

- [ ] **Step 1: 대상 파일에서 `knowledge/` → `llm-wiki/` 치환**

```bash
FILES=$(grep -rln "knowledge/" . \
  | grep -v node_modules | grep -v "^\./\.git/" \
  | grep -v "^\./llm-wiki/" | grep -v "^\./docs/superpowers/")
echo "$FILES"   # 대상 확인 — content/ prose 파일이 없어야 함
for f in $FILES; do
  perl -pi -e 's{knowledge/}{llm-wiki/}g' "$f"
done
```
Expected: 출력된 `$FILES`에 `content/education/...`, `*-rubric.md`, `llms-full.txt`가 **없어야** 함(있으면 중단). 5.1절 목록과 일치.

- [ ] **Step 2: 잔여 `knowledge/` 없음 확인 (docs/ 와 클론 제외)**

Run:
```bash
grep -rln "knowledge/" . | grep -v node_modules | grep -v "^\./\.git/" \
  | grep -v "^\./llm-wiki/" | grep -v "^\./docs/superpowers/"
```
Expected: 출력 없음(빈 결과).

- [ ] **Step 3: 컴파일 스크립트 동작 검증**

Run:
```bash
node scripts/knowledge/compile-state.mjs pending --count
```
Expected: 에러 없이 숫자 출력(`llm-wiki/wiki` 를 읽음). 경로 에러 나면 해당 파일 재확인.

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "refactor(tooling): knowledge/ 경로 참조를 llm-wiki/ 로 치환"
```

---

### Task 5: 디렉터리·스크립트·스킬 식별자 리네임 → llm-wiki

**Files:**
- Rename: `scripts/knowledge/` → `scripts/llm-wiki/`
- Rename: `.claude/skills/knowledge-wiki/` → `.claude/skills/llm-wiki/`
- Modify: `.claude/skills/llm-wiki/SKILL.md` (`name:` 필드), 그리고 `knowledge-wiki`·`scripts/knowledge`를 참조하는 파일들

**Interfaces:**
- Consumes: Task 4의 경로 치환 완료 상태.
- Produces: 스크립트 디렉터리·스킬 id가 `llm-wiki`로 통일.

- [ ] **Step 1: 디렉터리 git mv**

```bash
git mv scripts/knowledge scripts/llm-wiki
git mv .claude/skills/knowledge-wiki .claude/skills/llm-wiki
```

- [ ] **Step 2: `scripts/knowledge` 문자열 참조 치환**

```bash
grep -rln "scripts/knowledge" . | grep -v node_modules | grep -v "^\./\.git/" \
  | grep -v "^\./llm-wiki/" | grep -v "^\./docs/superpowers/" \
  | xargs -I{} perl -pi -e 's{scripts/knowledge}{scripts/llm-wiki}g' {}
```

- [ ] **Step 3: 스킬 id `knowledge-wiki` → `llm-wiki` 치환 (SKILL.md name 포함)**

```bash
grep -rln "knowledge-wiki" . | grep -v node_modules | grep -v "^\./\.git/" \
  | grep -v "^\./llm-wiki/" | grep -v "^\./docs/superpowers/" \
  | xargs -I{} perl -pi -e 's{knowledge-wiki}{llm-wiki}g' {}
```

- [ ] **Step 4: 검증 — 잔여 참조 없음 + 스킬 name 일치**

Run:
```bash
grep -rln "scripts/knowledge\|knowledge-wiki" . | grep -v node_modules \
  | grep -v "^\./\.git/" | grep -v "^\./llm-wiki/" | grep -v "^\./docs/superpowers/"
head -3 .claude/skills/llm-wiki/SKILL.md
node scripts/llm-wiki/compile-state.mjs pending --count
git check-ignore scripts/llm-wiki/compile-state.mjs && echo "FAIL: 스크립트가 ignore됨" || echo "OK: 스크립트 추적됨"
```
Expected: 첫 grep 빈 결과; SKILL.md `name:` 가 `llm-wiki`; 스크립트 정상 실행; 마지막 줄 `OK: 스크립트 추적됨`(leading-slash 가드 확인).

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "refactor(tooling): scripts/knowledge·knowledge-wiki 스킬을 llm-wiki 로 리네임"
```

---

### Task 6: 커맨드 리네임 `/지식*` → `/위키*` + 워크플로우 토큰 통일

**Files:**
- Rename: `.claude/commands/지식{흡수,정제,점검,질의}.md` → `위키{흡수,정제,점검,질의}.md`
- Modify (`/지식` 토큰 참조): `.claude/agents/wiki-compiler.md`, `.claude/agents/wiki-linter.md`, `.claude/hooks/auto-compile-check.sh`, `.claude/skills/llm-wiki/SKILL.md`, 그리고 리네임된 4개 커맨드 파일 자체

**Interfaces:**
- Produces: 워크플로우 커맨드가 `/위키흡수·정제·점검·질의`로 통일.

- [ ] **Step 1: 커맨드 파일 git mv**

```bash
git mv .claude/commands/지식흡수.md .claude/commands/위키흡수.md
git mv .claude/commands/지식정제.md .claude/commands/위키정제.md
git mv .claude/commands/지식점검.md .claude/commands/위키점검.md
git mv .claude/commands/지식질의.md .claude/commands/위키질의.md
```

- [ ] **Step 2: 커맨드 식별자 `/지식*` → `/위키*` 치환 (안전 — 식별자만)**

```bash
TOOLING=".claude/commands/위키흡수.md .claude/commands/위키정제.md .claude/commands/위키점검.md .claude/commands/위키질의.md .claude/agents/wiki-compiler.md .claude/agents/wiki-linter.md .claude/hooks/auto-compile-check.sh .claude/skills/llm-wiki/SKILL.md"
for f in $TOOLING; do
  perl -pi -e 's{/지식(흡수|정제|점검|질의)}{/위키$1}g' "$f"
done
```

- [ ] **Step 3: 위 툴링 파일 내 워크플로우 명사 "지식" → "위키" 검토 치환**

이 파일들에서 "지식"은 워크플로우 어휘다. 치환 후 어색한 중복("지식 위키"→"위키 위키")이 생기지 않는지 diff로 확인하며 적용한다.
```bash
for f in $TOOLING; do
  perl -pi -e 's{지식 위키}{위키}g; s{지식}{위키}g' "$f"
done
git diff -- $TOOLING | grep -n "위키 위키" && echo "REVIEW: 중복 표현 수동 정리 필요" || echo "OK: 중복 없음"
```
중복 표현이 나오면 해당 줄을 수동으로 자연스럽게 정리한다.

- [ ] **Step 4: 검증 — `/지식` 토큰이 툴링에서 사라졌는지 + 새 커맨드 존재**

Run:
```bash
ls .claude/commands/위키*.md
grep -rln "/지식" .claude/ | grep -v "^\.claude/.*docs"
```
Expected: `위키흡수.md 위키정제.md 위키점검.md 위키질의.md 위키정리.md`(기존 위키정리 포함), 둘째 grep 빈 결과.

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "refactor(commands): /지식* 커맨드를 /위키* 로 리네임·통일"
```

---

### Task 7: `/로그추가` dual-write 2-repo 분기 재설계

**Files:**
- Modify: `.claude/commands/로그추가.md`

**Interfaces:**
- Consumes: `./llm-wiki/`가 gitignored 클론(독립 git repo)이라는 사실.
- Produces: `/로그추가`가 content는 guidebook PR, raw는 llm-wiki 자동 커밋·push로 분기.

- [ ] **Step 1: 현재 dual-write 섹션 파악**

Run:
```bash
grep -n "knowledge\|llm-wiki\|git add\|git commit\|raw/\|dual-write" .claude/commands/로그추가.md
```
(Task 4에서 경로는 이미 `llm-wiki/raw`로 치환됨. 이번엔 커밋 흐름을 2-repo로 바꾼다.)

- [ ] **Step 2: 커밋 흐름을 2-repo로 분리**

기존 단일 `git add content/... llm-wiki/raw/... llm-wiki/log.md` 를 두 단계로 교체한다. 로그추가.md의 git 단계 설명을 아래 내용으로 수정:

```markdown
### 커밋 (2-repo 분기)

llm-wiki(`./llm-wiki/`)는 독립된 비공개 정본 repo다. content와 raw를 각자 repo에 커밋한다.

**A. 원본(raw) — llm-wiki (비공개, 자동 커밋·push):**
\`\`\`bash
cd llm-wiki
git add raw/{date}-{슬러그}.md log.md
git commit -m "ingest({슬러그}): {date} 실험 로그 원본 dual-write"
git push origin main
cd ..
\`\`\`

**B. 발행 문서(content) — guidebook (공개, PR):**
\`\`\`bash
git add content/education/logs/{슬러그}.mdx content/logs.ts content/updates.ts
git commit -m "docs(log): {슬러그} 실험 로그 추가"
# 이후 기존 PR 절차 동일
\`\`\`
```

protect-raw 훅 안내 문장 등 `knowledge/raw` → `llm-wiki/raw` 잔여 표현이 있으면 함께 정리한다.

- [ ] **Step 3: 검증**

Run:
```bash
grep -n "cd llm-wiki\|git push origin main\|content/education/logs" .claude/commands/로그추가.md
grep -n "knowledge/" .claude/commands/로그추가.md
```
Expected: 첫 grep에 2-repo 흐름 3줄 모두 존재; 둘째 grep 빈 결과.

- [ ] **Step 4: 커밋**

```bash
git add .claude/commands/로그추가.md
git commit -m "refactor(로그추가): dual-write 를 guidebook/llm-wiki 2-repo 로 분기"
```

---

### Task 8: 문서·글로사리·부트스트랩 갱신

**Files:**
- Modify: `CLAUDE.md`, `AGENTS.md`(루트), `.claude/skills/llm-wiki/SKILL.md`(부트스트랩 안내)

**Interfaces:**
- Produces: 팀원이 위키 분리 모델·부트스트랩·커맨드 매핑을 문서에서 확인 가능.

- [ ] **Step 1: CLAUDE.md에 위키 분리 모델 + 글로사리 추가**

`## LLM Wiki 패턴` 섹션 근처에 추가:
```markdown
## 지식 위키 분리 (llm-wiki)

- **원본 위키** = `woowacourse-projects/llm-wiki` (**비공개 정본**). 모든 raw 1차자료 + 합성 wiki 노트. 로컬에선 gitignored `./llm-wiki/` 클론으로 작업한다.
- **발행 문서** = 이 repo의 `content/` (공개). llm-wiki에서 분석·정리한 결과만 발행한다.
- **부트스트랩**: 새 체크아웃에서 위키 작업 전 `git clone https://github.com/woowacourse-projects/llm-wiki.git llm-wiki` 필요.
- **커맨드 매핑**:
  - `/위키흡수·정제·점검·질의` → 원본 위키(`./llm-wiki/`) 대상
  - `/위키정리`·`/말투점검` → 발행 문서(`content/`) 대상
```

- [ ] **Step 2: AGENTS.md(루트) 원본/발행 구분 문장 보강**

`## Wiki pages` 관련 줄(약 13행) 근처에 한 줄 추가:
```markdown
> 원본 raw·합성 노트는 비공개 정본 `llm-wiki` repo에 있다. 이 repo의 `content/`는 거기서 정리한 발행 문서다.
```

- [ ] **Step 3: SKILL.md에 부트스트랩 가드 추가**

`.claude/skills/llm-wiki/SKILL.md` 상단 작업 전제에 추가:
```markdown
**전제:** 이 스킬은 `./llm-wiki/`(비공개 정본 repo 클론)에서 동작한다. 없으면 먼저 `git clone https://github.com/woowacourse-projects/llm-wiki.git llm-wiki` 안내 후 중단한다.
```

- [ ] **Step 4: 커밋**

```bash
git add CLAUDE.md AGENTS.md .claude/skills/llm-wiki/SKILL.md
git commit -m "docs: 지식 위키 분리 모델·부트스트랩·커맨드 매핑 문서화"
```

---

### Task 9: 최종 통합 검증

**Files:**
- 변경 없음 (검증만)

**Interfaces:**
- Consumes: Task 1–8 전체.

- [ ] **Step 1: 빌드 성공 (사이트 + llms.txt + 검색 인덱스)**

Run:
```bash
npm run build
```
Expected: 성공. `postbuild`의 `check:llms-txt`·`check:search-index`까지 통과. (knowledge/는 빌드 미사용이라 분리 영향 없음을 확인.)

- [ ] **Step 2: 잔여 stale 참조 전수 검사**

Run:
```bash
grep -rln "knowledge/\|scripts/knowledge\|knowledge-wiki\|/지식" . \
  | grep -v node_modules | grep -v "^\./\.git/" \
  | grep -v "^\./llm-wiki/" | grep -v "^\./docs/superpowers/"
```
Expected: 빈 결과. (docs/superpowers 스펙·플랜과 llm-wiki 클론 내부는 의도적 제외.)

- [ ] **Step 3: 위키 툴링 동작 스모크 체크**

Run:
```bash
node scripts/llm-wiki/compile-state.mjs pending --count
git -C llm-wiki status --short
git -C llm-wiki remote -v
```
Expected: compile-state 정상 출력; 클론 status 깨끗; remote가 llm-wiki 가리킴.

- [ ] **Step 4: git 상태 + 본문 "지식" 보존 확인**

Run:
```bash
git status --porcelain        # llm-wiki/ 가 안 보여야 함
git log --oneline -8
grep -rc "지식" content/logs.ts content/education/logs/*.mdx | head   # prose 보존 — 0이 아니어야 정상
```
Expected: status에 `llm-wiki/` 없음; 커밋 히스토리에 Task별 커밋; content prose의 "지식"이 그대로 남아있음(치환 안 됨).

- [ ] **Step 5: PR 생성 (사용자 확인 후)**

사용자가 원하면 `feature/llm-wiki-extraction` → `main` PR 생성. 본문에 스펙 링크와 "knowledge/ 분리, llm-wiki 정본화" 요약 포함.

---

## Self-Review

**Spec coverage:**
- 2절 분리/동선 → Task 2,3 ✓
- 3절 네이밍 통일(폴더/스크립트/스킬/커맨드) → Task 4,5,6 ✓
- 3절 잔여 중복(`/위키정리` vs `/위키점검`) → Task 8 Step 1 커맨드 매핑 문서화 ✓
- 4절 마이그레이션 순서(split 먼저) → Task 2 before 3 ✓
- 5.1절 경로 치환 → Task 4 ✓ / 5.2절 리네임 → Task 5,6 ✓ / 5.3절 문서 → Task 8 ✓ / 5.4절 prose 보존 → Global Constraint + Task 9 Step 4 ✓
- 6절 dual-write 분기(raw 자동 push) → Task 7 ✓
- 8절 위험(push 권한·gitignore leading slash·prose 오치환·빌드) → Task 1 Step 2, Task 3 Step 5, Task 9 Step 4, Task 9 Step 1 ✓
- 9절 완료 정의 6항 → Task 9 전반 ✓

**Placeholder scan:** 모든 Step에 실제 명령·치환·검증 포함. 플레이스홀더 없음.

**Type/식별자 일관성:** `llm-wiki/`(폴더), `scripts/llm-wiki/`, 스킬 id `llm-wiki`, 커맨드 `/위키{흡수,정제,점검,질의}`, gitignore `/llm-wiki/` — Task 전반 일관.
