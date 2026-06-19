# knowledge/ → llm-wiki 분리 및 위키 네이밍 통일

- **날짜:** 2026-06-19
- **상태:** 설계 승인됨 (구현 계획 작성 전)
- **대상 repo:** `woowacourse-projects/llm-wiki` (비공개, 생성됨·비어있음)
- **현재 repo:** `woowacourse/guidebook` (공개)

## 1. 배경 / 동기

현재 `knowledge/`(Karpathy LLM Wiki 패턴, raw 1차자료 + 합성된 wiki 노트)는 공개 repo `woowacourse/guidebook` 안에 있어 모든 원본 데이터가 공개된다.

확정된 멘탈 모델:

- **`llm-wiki` (비공개)** = 모든 원본 데이터의 **source of truth**. 분석 전 raw까지 전부 보유하는 정본.
- **`guidebook` (공개, 이 repo)** = llm-wiki 데이터로부터 **분석·정리한 발행 문서**(`content/`). 독자에게 원본 데이터를 그대로 보여줄 필요는 없다.

두 가지 동기가 이 분리를 정당화한다:

1. **일부 비공개 필요** — 공개 repo라 크루·코칭·미션 raw 원본이 전부 공개되고 있다. 원본은 비공개여야 한다. (하드 제약)
2. **외부 재사용** — 다른 repo·LLM 도구가 이 지식을 가져다 쓰고 싶다. standalone 정본이면 clone/subtree로 소비 가능.

## 2. 결정 요약

| 항목 | 결정 |
|---|---|
| 분리 방식 | 통째로 비공개 정본 repo `woowacourse-projects/llm-wiki` |
| 동선 | docs repo에서 git 추적 제거 + gitignore, 같은 위치에 **로컬 클론**으로 재연결 |
| 네이밍 | **위키로 통일** (구조=`llm-wiki`, 한글 커맨드=`/위키*`) |
| 히스토리 | 보존 (`git subtree split`) |
| `/로그추가` raw push | 커밋 + push 자동 (llm-wiki = source of truth, 즉시 동기화) |

### 동선 선택의 핵심 — "경로는 그대로, 추적만 끊기"

`knowledge/`(→`llm-wiki/`)를 docs repo 체크아웃 **안에** 둔다. git 추적만 guidebook → llm-wiki로 옮기고, 로컬 물리 경로는 유지한다. 그래서 툴링은 경로 prefix(`knowledge/`→`llm-wiki/`)만 일괄 치환하면 동작한다. 핵심 효과(비공개 + 독립 정본)는 그대로 달성한다.

## 3. 네이밍 통일 (위키)

| 층 | before | after |
|---|---|---|
| repo | — | `woowacourse-projects/llm-wiki` |
| 폴더(클론 마운트) | `knowledge/` | `llm-wiki/` (`git clone`이 자동 생성) |
| 스크립트 디렉터리 | `scripts/knowledge/` | `scripts/llm-wiki/` |
| 스킬 | `.claude/skills/knowledge-wiki/` | `.claude/skills/llm-wiki/` |
| 커맨드 | `/지식{흡수,정제,점검,질의}` | `/위키{흡수,정제,점검,질의}` |
| 본문 보통명사 "지식" | (콘텐츠 prose) | **불변 — 절대 치환 금지** |

### 잔여 네이밍 중복 — 의도적으로 수용

`/위키점검`(llm-wiki 원본 정합성)과 **기존 `/위키정리`**(`content/**/*.mdx` 발행 문서 정합성)가 둘 다 "위키 린터"로 공존한다. 사용자 모델("위키 = 지식 시스템 전체, content는 그 발행된 얼굴")에서는 일관된 선택이다. 두 커맨드의 description·글로사리에서 대상을 명확히 구분한다:

- `/위키정리` — **발행 문서**(`content/`, 공개) 정합성 lint
- `/위키점검` — **원본 위키**(`llm-wiki/`, 비공개) 정합성 lint

`/위키정리`·`/말투점검`(content-side 커맨드)의 리네임은 **이번 마이그레이션 범위 밖**이다.

## 4. 마이그레이션 절차 (순서 의존)

> 순서가 곧 정합성이다. 특히 1번(subtree split)은 docs repo에서 `knowledge/`를 제거하기 **전에** 실행해야 한다 — split이 git 히스토리의 경로를 읽기 때문.

1. **llm-wiki 시드 (히스토리 보존)**
   - `git subtree split --prefix=knowledge -b export-llm-wiki` — prefix가 벗겨져 llm-wiki 루트에 `raw/ wiki/ index.md log.md AGENTS.md README.md`가 배치됨.
   - `git push git@github.com:woowacourse-projects/llm-wiki.git export-llm-wiki:main`
   - ⚠ **push 권한은 이 단계에서 최종 확인.** `woowacourse-projects` org 접근이 막히면 여기서 중단·보고.
2. **docs repo 추적 제거**
   - `git rm -r --cached knowledge` (워킹트리 파일은 보존)
   - `.gitignore`에 `/llm-wiki/` 추가 — **반드시 leading slash.** `llm-wiki/`(슬래시 없음)는 `scripts/llm-wiki/`까지 무시해버린다.
3. **로컬 재연결**
   - 워킹트리의 `knowledge/`를 `llm-wiki/`로 교체: 기존 폴더 제거 후 `git clone …/llm-wiki llm-wiki` (또는 rename 후 remote 재설정). gitignored라 docs repo에 다시 잡히지 않음.
4. **경로 일괄 치환** `knowledge/` → `llm-wiki/` (§5.1 대상)
5. **디렉터리/파일/커맨드 리네임** (§5.2)
6. **문서 갱신** — `CLAUDE.md`·`AGENTS.md`에 위키/문서 분리 + 부트스트랩 안내 + 글로사리 (§5.3)
7. **`/로그추가` dual-write 분기** (§6)
8. **검증** (§8)

## 5. 재배선 인벤토리 (실측)

### 5.1 경로 치환 `knowledge/` → `llm-wiki/` (docs repo 잔류 파일)

- `.claude/agents/wiki-compiler.md`
- `.claude/agents/wiki-linter.md`
- `.claude/commands/로그추가.md` (dual-write 출력 경로)
- `.claude/commands/지식점검.md` → `위키점검.md`
- `.claude/commands/지식정제.md` → `위키정제.md`
- `.claude/commands/지식질의.md` → `위키질의.md`
- `.claude/commands/지식흡수.md` → `위키흡수.md`
- `.claude/hooks/auto-compile-check.sh`
- `.claude/hooks/protect-raw.sh`
- `.claude/skills/knowledge-wiki/SKILL.md` → `.claude/skills/llm-wiki/SKILL.md`
- `components/CurriculumTimeline.tsx` (주석)
- `content/curriculum-history.ts` (주석)
- `scripts/knowledge/compile-state.mjs` → `scripts/llm-wiki/compile-state.mjs` (`WIKI_DIR` 상수 포함)
- `scripts/mdx-to-raw.mjs` (`--output` 기본 경로)
- `docs/superpowers/specs/2026-06-16-curriculum-year-over-year-design.md` (과거 스펙, 주석성 — 선택적)

### 5.2 디렉터리/파일/커맨드 리네임

- `scripts/knowledge/` → `scripts/llm-wiki/`
- `.claude/skills/knowledge-wiki/` → `.claude/skills/llm-wiki/` (SKILL.md `name:` 필드 포함)
- `.claude/commands/지식{흡수,정제,점검,질의}.md` → `위키*.md` (frontmatter description + 본문 내 `/지식*` 자기참조 갱신)
- 커맨드 이름 참조 갱신 대상: `wiki-compiler.md`, `wiki-linter.md`, 위 4개 커맨드 파일, `llm-wiki/SKILL.md`, 루트 `AGENTS.md`

### 5.3 문서

- `CLAUDE.md` — 현재 `knowledge/`·`/지식*` 직접 언급 없음(line 7·13의 "위키"/"위키정리"만). 위키 분리 모델 + 부트스트랩 안내 + 글로사리 추가.
- `AGENTS.md`(루트) — `/지식*` 참조 없음. line 13("Wiki pages")·39("/위키정리")는 content 대상이라 유지. 원본/발행 구분 문장 보강.

### 5.4 본문 "지식"(보통명사) — 절대 치환 금지

다음은 prose 또는 생성물이므로 손대지 않는다:

- `content/education/{logs,insights,conversations,operations}/**` (다수)
- `content/logs.ts`, `content/updates.ts`
- `.claude/promotion-rubric.md`, `.claude/repo-analysis-rubric.md`
- `public/llms-full.txt` — **빌드 생성물.** `npm run build`로 자동 재생성, 수동 편집 금지.
- `llm-wiki/` 내부 콘텐츠 — llm-wiki repo로 이동하며 그대로 보존. (내부의 `knowledge/wiki/...` 식 경로 표기는 root-relative로 정리 — llm-wiki repo 측 후속 정리)

## 6. `/로그추가` dual-write 재설계

현재 `/로그추가`는 `content/…logs/*.mdx` + `content/logs.ts` + `content/updates.ts` + `knowledge/raw/{date}.md` + `knowledge/log.md`를 **단일 커밋**으로 쓴다. 분리 후 2-repo로 분기한다:

- **content 측** (`content/…mdx`, `logs.ts`, `updates.ts`) → docs repo(guidebook) 커밋/PR. 공개. **기존과 동일.**
- **raw 측** (`llm-wiki/raw/{date}.md`, `llm-wiki/log.md`) → `./llm-wiki`(=llm-wiki 클론)에서 **별도 커밋 + 자동 push**. 비공개. llm-wiki가 source of truth이므로 로그 추가 즉시 원본을 동기화한다.

`protect-raw.sh`(기존 raw 수정 차단)·`auto-compile-check.sh`(미합성 raw 누적 감시)는 파일시스템/`content/` 경로 기준이라 경로 치환 후 그대로 동작.

## 7. 범위 밖 (YAGNI)

- **외부 재사용 publish 파이프라인** — llm-wiki가 standalone 정본이 된 순간 다른 repo는 clone/subtree로 소비 가능. 구체적 소비처가 생기면 그때 subtree-publish 설계.
- **`/위키정리`·`/말투점검` 리네임** — content-side 커맨드. 별건.
- **content/education/logs 의 공개 여부 변경** — 현 공개 상태 유지(status quo).

## 8. 위험 / 검증

- **push 권한** — `woowacourse-projects/llm-wiki` push 가능 여부를 절차 1에서 확인. 실패 시 중단·보고.
- **subtree split 순서** — `knowledge/` 제거 전 실행 (히스토리 의존).
- **`.gitignore` leading slash** — `/llm-wiki/`로 root만 무시, `scripts/llm-wiki/`는 추적 유지.
- **본문 "지식" 오치환 방지** — 커맨드 식별자만 정밀 치환, prose는 불변(§5.4).
- **빌드 영향 없음** — `knowledge/`는 Next.js/Nextra 빌드에 import되지 않음(주석·툴링 스크립트만 참조). 분리 후 사이트 빌드·Vercel 배포 정상 확인.
- **새 체크아웃 부트스트랩** — `./llm-wiki` 부재 시 위키 툴링이 "먼저 `git clone …/llm-wiki`" 안내. README에 1줄 명시.

## 9. 검증 기준 (완료 정의)

1. `llm-wiki` repo에 17커밋 히스토리 보존된 raw/wiki가 루트에 존재.
2. docs repo에서 `knowledge/` 추적 제거됨, `/llm-wiki/` gitignored, `git status` 깨끗.
3. `npm run build` 성공 (사이트·llms.txt 정상 생성).
4. `/위키*` 커맨드 4종이 `./llm-wiki/`를 대상으로 정상 동작.
5. `scripts/llm-wiki/compile-state.mjs` 정상 실행.
6. `/로그추가` 시 content는 guidebook, raw는 llm-wiki로 분기.
