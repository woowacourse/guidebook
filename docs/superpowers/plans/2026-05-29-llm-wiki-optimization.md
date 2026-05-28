# LLM Wiki Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Karpathy의 LLM Wiki 패턴과 Jeremy Howard의 `llms.txt` 표준을 적용해, LLM이 이 저장소를 점진적으로 더 잘 읽고 기여할 수 있도록 만든다.

**Architecture:** 3개 계층으로 분리한다. (1) 외부 LLM 진입점 — `public/llms.txt` + `public/llms-full.txt` 빌드 자동화. (2) 내부 위키 컨벤션 — frontmatter 스펙, 페이지 템플릿, 크로스 레퍼런스 규칙. (3) Schema 강화 — `AGENTS.md` 신설로 CLAUDE.md(워크플로우) 와 AGENTS.md(컨트리뷰션 규약) 역할 분리, `/위키정리` lint 커맨드 추가.

**Tech Stack:** Nextra 4, Next.js 15, Node.js scripts (ESM), gray-matter (frontmatter parsing), 기존 pagefind 빌드 파이프라인.

**참고 자료:**
- [Karpathy LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — 내부용 markdown 위키 패턴
- [llms.txt spec](https://llmstxt.org/) — 외부 LLM용 사이트 진입점 표준
- [Fern: writing LLM-friendly docs (2026-03)](https://buildwithfern.com/post/how-to-write-llm-friendly-documentation)

---

## File Structure

**신설:**
- `AGENTS.md` (저장소 루트) — LLM 에이전트 기여 규약 (OpenAI/Codex/Cursor 호환)
- `public/llms.txt` (자동 생성) — 외부 LLM용 카탈로그
- `public/llms-full.txt` (자동 생성) — 전체 콘텐츠 평탄화
- `scripts/llms-txt/build.mjs` — llms.txt 빌드
- `scripts/llms-txt/verify.mjs` — 산출물 검증
- `scripts/llms-txt/__tests__/build.test.mjs` — 빌드 스크립트 테스트
- `.claude/conventions/frontmatter-spec.md` — frontmatter 표준 정의
- `.claude/templates/insight-template.mdx` — 새 insight 페이지 템플릿
- `.claude/templates/design-pattern-template.mdx` — 새 design pattern 템플릿
- `.claude/templates/tool-template.mdx` — 새 tool 템플릿
- `.claude/commands/위키정리.md` — lint 커맨드

**수정:**
- `package.json` — postbuild에 llms-txt 빌드+검증 단계 추가
- `CLAUDE.md` — AGENTS.md/llms.txt 와의 역할 분리 명시, LLM Wiki 패턴 참조 추가
- `README.md` — llms.txt 및 AGENTS.md 진입점 안내

**불변(이 PR에서 변경하지 않음):**
- 기존 137개 MDX 파일의 본문 — frontmatter 추가는 새 페이지부터 점진적 적용
- 기존 `_meta.ts` — 사람용 사이드바는 그대로 유지

---

## Task 1: AGENTS.md 신설 + Frontmatter 스펙 정의

**Files:**
- Create: `AGENTS.md`
- Create: `.claude/conventions/frontmatter-spec.md`

- [ ] **Step 1: `.claude/conventions/frontmatter-spec.md` 작성**

다음 내용으로 작성:

```markdown
# MDX Frontmatter 표준 스펙

이 저장소의 모든 새 MDX 페이지는 다음 frontmatter를 가질 수 있다.
**기존 페이지는 강제 마이그레이션하지 않는다.** 새 페이지부터 점진적으로 적용하고, 기존 페이지는 의미 있는 수정 시 함께 갱신한다.

## 필수 필드 (새 페이지 기준)

- `id` — 페이지의 안정적인 식별자. URL slug와 동일하게 유지. 변경 시 redirect 추가 필요.
- `summary` — 한 문장 요약 (최대 120자). LLM이 카탈로그에서 이 페이지를 골라낼 때 사용.
- `last_verified` — `YYYY-MM-DD`. 페이지 내용을 누군가 마지막으로 사실 확인한 날짜.

## 선택 필드

- `related` — 관련 페이지 슬러그 배열. 관계 유형(`similar`, `extends`, `contradicts`)을 명시할 수 있는 형태도 허용:
  ```yaml
  related:
    - slug: progressive-scaffolding
      type: similar
    - slug: poe-discovery-learning
      type: extends
  ```
- `source_logs` — 이 페이지의 근거가 된 실험 로그 슬러그 배열 (insights/design-patterns/curriculum 페이지에서 사용).
- `tags` — 자유 태그. 기존 `logs.ts`의 `phases/tracks/themes`와 다름. 검색 보조용.

## 예시

\`\`\`yaml
---
id: progressive-scaffolding
summary: 단일 세션으로 전달하면 증발하는 내용을 3~5회 점진적 시퀀스로 분산해 인지 부하를 관리하는 설계 원칙.
last_verified: 2026-05-29
related:
  - slug: poe-discovery-learning
    type: similar
source_logs:
  - ux-research-training
  - fe-level2-16steps
  - demo-day-retrospective
tags: [scaffolding, cognitive-load]
---
\`\`\`

## 검증

`/위키정리` 커맨드가 다음을 검사한다:
- `summary` 누락 또는 120자 초과
- `last_verified` 가 12개월 이상 지난 페이지
- `related` 가 존재하지 않는 slug를 참조
- `source_logs` 가 `content/logs.ts` 에 없는 slug를 참조
```

- [ ] **Step 2: `AGENTS.md` 작성**

저장소 루트에 작성. CLAUDE.md가 "이 저장소는 어떻게 구성되어 있고 어떤 워크플로우가 있는가"를 다룬다면, AGENTS.md는 "외부 LLM 에이전트가 이 저장소에 기여할 때 무엇을 따라야 하는가"를 다룬다.

```markdown
# AGENTS.md

LLM 에이전트(Claude Code, Codex, Cursor, 기타)가 이 저장소를 읽고 기여할 때 따르는 규약.

## 이 저장소가 뭔가요?

우아한테크코스의 교육 철학·디자인 패턴·커리큘럼·실험 로그를 모은 공식 가이드북. Nextra 4 기반.
세부 구조는 `CLAUDE.md`, 외부 LLM이 빠르게 훑을 카탈로그는 `public/llms.txt` 참고.

## 3계층 컨텐츠 구조 (Karpathy LLM Wiki 패턴)

- **Raw sources** — `content/education/logs/` (매주 추가되는 실험 로그). 직접 수정 지양, 새 로그 추가는 `/로그추가` 사용.
- **Wiki pages** — `content/education/{philosophy,design-patterns,curriculum,insights,tools}/`. 실험 로그에서 추출·승격된 안정화된 지식.
- **Schema** — `CLAUDE.md`, `.claude/conventions/`, `.claude/promotion-rubric.md`, `.claude/log-quality-rubric.md`.

## 기여 시 따라야 할 규약

### 1. 새 페이지를 만들 때

- 템플릿을 복사한다: `.claude/templates/{insight,design-pattern,tool}-template.mdx`
- frontmatter는 `.claude/conventions/frontmatter-spec.md` 를 따른다 (필수: `id`, `summary`, `last_verified`).
- 새 페이지는 `_meta.ts` 와 (해당되면) `content/updates.ts` 에 등록한다.
- 실험 로그라면 `/로그추가` 커맨드가 모든 보일러플레이트를 처리한다.

### 2. 기존 페이지를 수정할 때

- 의미 있는 변경이면 `last_verified` 를 오늘 날짜로 갱신한다.
- 다른 페이지의 주장과 모순되는 내용을 추가했다면 양쪽에 cross-reference를 단다 (`related: [{slug: ..., type: contradicts}]`).
- 기존 frontmatter가 없는 페이지에 frontmatter를 추가하는 건 환영. 강제는 아님.

### 3. 크로스 레퍼런스

- 페이지 본문에서 다른 페이지를 언급할 때는 절대 경로 마크다운 링크: `[제목](/education/insights/foo)`.
- 관계 메타데이터는 frontmatter `related` 에 표기 — "이 페이지가 어떤 페이지를 확장/유사/반박하는가" 를 LLM이 그래프로 읽을 수 있도록.

### 4. 자동 검사

- 빌드 시 `public/llms.txt` 와 `public/llms-full.txt` 가 자동 생성된다 (`scripts/llms-txt/build.mjs`).
- `/위키정리` 커맨드로 lint 가능: 모순, 고아 페이지, 오래된 `last_verified`, 깨진 `related`.

### 5. 무엇을 자동화하지 말 것

- 기존 페이지 본문의 일괄 재작성. 사람 검토 없이 수행하지 말 것.
- `.claude/log-quality-rubric.md` 와 `.claude/promotion-rubric.md` 수정 — 사람이 직접 수정한다 (autoresearch 의 `prepare.py` 원칙).
- `_meta.ts` 의 `display: 'hidden'` 항목 삭제 — 의도된 숨김이다.

## 출처 표기

이 저장소의 LLM Wiki 구조는 다음을 참고한다:
- Andrej Karpathy, "llm wiki" gist (2026-04) — https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Jeremy Howard, llms.txt spec — https://llmstxt.org/
```

- [ ] **Step 3: 빌드/타입체크가 깨지지 않는지 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (마크다운/문서만 추가했으므로 코드 영향 없음)

- [ ] **Step 4: 커밋**

```bash
git add AGENTS.md .claude/conventions/frontmatter-spec.md
git commit -m "feat(llm-wiki): add AGENTS.md and frontmatter spec

LLM 에이전트가 이 저장소에 기여할 때 따를 규약을 AGENTS.md로 분리.
CLAUDE.md는 워크플로우/schema, AGENTS.md는 contribution norm 역할.
frontmatter 표준은 새 페이지부터 점진 적용."
```

---

## Task 2: 페이지 작성 템플릿 추가

**Files:**
- Create: `.claude/templates/insight-template.mdx`
- Create: `.claude/templates/design-pattern-template.mdx`
- Create: `.claude/templates/tool-template.mdx`

- [ ] **Step 1: insight-template.mdx 작성**

```mdx
---
id: TODO-slug
summary: TODO 한 문장 요약 (최대 120자).
last_verified: 2026-05-29
source_logs:
  - TODO-log-slug
related: []
tags: []
---

# TODO 인사이트 제목

> TODO 한 문단 요약 — 어떤 교차 패턴인가, 어디서 발견됐나.

## 패턴 요약

TODO 추상화된 패턴을 본문 형식으로 서술.

## 근거 로그

| 로그 | 카테고리 | 기여 요소 |
|------|----------|-----------|
| [TODO 로그 1](/education/logs/TODO-slug-1) | TODO | TODO |

## 핵심 원칙

- TODO 원칙 1
- TODO 원칙 2

## 적용 가이드

- **언제 쓰는가:** TODO
- **어떻게 쓰는가:** TODO
- **피해야 할 것:** TODO

## 교육 모델 연결

- [TODO 디자인 패턴](/education/design-patterns/TODO)
```

- [ ] **Step 2: design-pattern-template.mdx 작성**

```mdx
---
id: TODO-slug
summary: TODO 한 문장 요약.
last_verified: 2026-05-29
related: []
tags: []
---

# TODO 디자인 패턴 제목

> TODO 한 문장으로 요약된 의도.

## 의도

TODO 이 패턴이 해결하려는 문제.

## 적용 상황

TODO 언제 이 패턴이 유효한가.

## 구조

TODO 패턴 구성 요소.

## 결과

TODO 적용 후 어떤 변화가 기대되는가.

## 관련 인사이트

- [TODO](/education/insights/TODO)
```

- [ ] **Step 3: tool-template.mdx 작성**

```mdx
---
id: TODO-slug
summary: TODO 한 문장 요약 (이 도구가 무엇을 자동화하는가).
last_verified: 2026-05-29
source_logs: []
related: []
tags: []
---

# TODO 도구 이름

> TODO 이 도구의 한 줄 가치.

## 무엇을 자동화하는가

TODO

## 입력

TODO

## 출력

TODO

## 사용 예시

\`\`\`bash
TODO 명령어
\`\`\`

## 검증된 시나리오

- TODO 어디서 사용해 어떤 결과가 나왔는가
```

- [ ] **Step 4: 커밋**

```bash
git add .claude/templates/
git commit -m "feat(llm-wiki): add MDX page templates for insight/design-pattern/tool

새 페이지 작성 시 복사해서 쓰는 템플릿. frontmatter-spec 와 정렬."
```

---

## Task 3: llms.txt + llms-full.txt 빌드 스크립트 (TDD)

**Files:**
- Create: `scripts/llms-txt/build.mjs`
- Create: `scripts/llms-txt/__tests__/build.test.mjs`
- Create: `scripts/llms-txt/__tests__/fixtures/content/index.mdx`
- Create: `scripts/llms-txt/__tests__/fixtures/content/foo/bar.mdx`

- [ ] **Step 1: 테스트 fixture 생성**

`scripts/llms-txt/__tests__/fixtures/content/index.mdx`:

```mdx
# 우아한테크코스 공식문서

홈 페이지 본문.
```

`scripts/llms-txt/__tests__/fixtures/content/foo/bar.mdx`:

```mdx
---
id: bar
summary: 테스트용 페이지입니다.
last_verified: 2026-05-29
---

# Bar 페이지

본문 내용.
```

- [ ] **Step 2: 실패하는 테스트 작성**

`scripts/llms-txt/__tests__/build.test.mjs`:

```javascript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLlmsTxt } from '../build.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureRoot = path.join(__dirname, 'fixtures', 'content')

test('llms.txt 출력은 사이트 제목 H1 으로 시작한다', async () => {
  const { llmsTxt } = await buildLlmsTxt({ contentDir: fixtureRoot, siteUrl: 'https://example.com' })
  assert.match(llmsTxt, /^# 우아한테크코스 공식문서/)
})

test('llms.txt 는 각 페이지를 마크다운 링크 + summary 로 나열한다', async () => {
  const { llmsTxt } = await buildLlmsTxt({ contentDir: fixtureRoot, siteUrl: 'https://example.com' })
  assert.match(llmsTxt, /- \[Bar 페이지\]\(https:\/\/example\.com\/foo\/bar\): 테스트용 페이지입니다\./)
})

test('llms-full.txt 는 모든 페이지 본문을 평탄화한다', async () => {
  const { llmsFullTxt } = await buildLlmsTxt({ contentDir: fixtureRoot, siteUrl: 'https://example.com' })
  assert.match(llmsFullTxt, /# Bar 페이지/)
  assert.match(llmsFullTxt, /본문 내용\./)
})

test('llms-full.txt 는 frontmatter 를 제거한다', async () => {
  const { llmsFullTxt } = await buildLlmsTxt({ contentDir: fixtureRoot, siteUrl: 'https://example.com' })
  assert.doesNotMatch(llmsFullTxt, /^---/m)
  assert.doesNotMatch(llmsFullTxt, /last_verified:/)
})
```

- [ ] **Step 3: 테스트 실행해서 실패 확인**

Run: `node --test scripts/llms-txt/__tests__/build.test.mjs`
Expected: FAIL — `Cannot find module '../build.mjs'`

- [ ] **Step 4: 최소 구현 작성**

`scripts/llms-txt/build.mjs`:

```javascript
import fs from 'node:fs/promises'
import path from 'node:path'

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n/

function parseMdx(raw) {
  const match = raw.match(FRONTMATTER_RE)
  let frontmatter = {}
  let body = raw
  if (match) {
    body = raw.slice(match[0].length)
    for (const line of match[1].split('\n')) {
      const kv = line.match(/^([a-z_]+):\s*(.*)$/i)
      if (kv) frontmatter[kv[1]] = kv[2].trim()
    }
  }
  const h1Match = body.match(/^#\s+(.+)$/m)
  const title = h1Match ? h1Match[1].trim() : null
  return { frontmatter, body, title }
}

async function walkMdx(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkMdx(full, base)))
    } else if (entry.name.endsWith('.mdx')) {
      files.push({
        absPath: full,
        relPath: path.relative(base, full),
      })
    }
  }
  return files
}

function pathToUrl(relPath, siteUrl) {
  const noExt = relPath.replace(/\.mdx$/, '')
  const slug = noExt.endsWith('/index') ? noExt.slice(0, -'/index'.length) : noExt
  return `${siteUrl.replace(/\/$/, '')}/${slug}`.replace(/\/$/, '')
}

export async function buildLlmsTxt({ contentDir, siteUrl }) {
  const files = await walkMdx(contentDir)
  const pages = []
  let siteTitle = '우아한테크코스 공식문서'
  let siteIntro = ''

  for (const f of files) {
    const raw = await fs.readFile(f.absPath, 'utf8')
    const { frontmatter, body, title } = parseMdx(raw)
    if (f.relPath === 'index.mdx') {
      if (title) siteTitle = title
      siteIntro = body.replace(/^#\s+.+\n/, '').trim().split('\n\n')[0] ?? ''
      continue
    }
    pages.push({
      url: pathToUrl(f.relPath, siteUrl),
      title: title ?? f.relPath,
      summary: frontmatter.summary ?? '',
      body,
    })
  }

  pages.sort((a, b) => a.url.localeCompare(b.url))

  const llmsTxt = [
    `# ${siteTitle}`,
    '',
    siteIntro || '우아한테크코스의 교육 철학·디자인 패턴·커리큘럼·실험 로그.',
    '',
    '## Pages',
    '',
    ...pages.map(p => `- [${p.title}](${p.url})${p.summary ? `: ${p.summary}` : ''}`),
    '',
  ].join('\n')

  const llmsFullTxt = [
    `# ${siteTitle} — Full Contents`,
    '',
    ...pages.flatMap(p => [`<!-- source: ${p.url} -->`, '', p.body.trim(), '', '---', '']),
  ].join('\n')

  return { llmsTxt, llmsFullTxt }
}

async function main() {
  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..')
  const contentDir = path.join(repoRoot, 'content')
  const outDir = path.join(repoRoot, 'public')
  const siteUrl = process.env.SITE_URL ?? 'https://docs.woowahan.com'
  const { llmsTxt, llmsFullTxt } = await buildLlmsTxt({ contentDir, siteUrl })
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(path.join(outDir, 'llms.txt'), llmsTxt)
  await fs.writeFile(path.join(outDir, 'llms-full.txt'), llmsFullTxt)
  console.log(`Wrote public/llms.txt (${llmsTxt.length} bytes) and public/llms-full.txt (${llmsFullTxt.length} bytes)`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}
```

- [ ] **Step 5: 테스트 실행해서 통과 확인**

Run: `node --test scripts/llms-txt/__tests__/build.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 6: 실제 콘텐츠로 빌드 시도 (dry run)**

Run: `node scripts/llms-txt/build.mjs`
Expected: `Wrote public/llms.txt (...) and public/llms-full.txt (...)`

생성된 파일 확인:
Run: `head -30 public/llms.txt && echo "---" && wc -l public/llms-full.txt`
Expected: 사이트 제목 + 137개 가량 페이지 링크가 나열되어야 함.

- [ ] **Step 7: 커밋**

```bash
git add scripts/llms-txt/ public/llms.txt public/llms-full.txt
git commit -m "feat(llm-wiki): generate public/llms.txt and llms-full.txt

외부 LLM 진입점. llms.txt 표준(llmstxt.org) 준수.
사이트 제목 + 모든 페이지를 마크다운 링크와 summary로 카탈로그화.
llms-full.txt는 전체 본문을 평탄화해 단일 요청 ingest 지원."
```

---

## Task 4: 빌드 통합 + Verification 스크립트

**Files:**
- Create: `scripts/llms-txt/verify.mjs`
- Modify: `package.json`

- [ ] **Step 1: verify.mjs 작성**

`scripts/llms-txt/verify.mjs`:

```javascript
import fs from 'node:fs/promises'
import path from 'node:path'

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..')
const publicDir = path.join(repoRoot, 'public')

async function verify() {
  const errors = []
  for (const name of ['llms.txt', 'llms-full.txt']) {
    const p = path.join(publicDir, name)
    try {
      const stat = await fs.stat(p)
      if (stat.size < 100) errors.push(`${name} is suspiciously small (${stat.size} bytes)`)
      const content = await fs.readFile(p, 'utf8')
      if (!content.startsWith('# ')) errors.push(`${name} must start with a markdown H1`)
    } catch (e) {
      errors.push(`${name} missing or unreadable: ${e.message}`)
    }
  }
  if (errors.length) {
    console.error('llms.txt verification failed:')
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }
  console.log('llms.txt verification OK')
}

await verify()
```

- [ ] **Step 2: package.json scripts 수정**

기존 postbuild:
```json
"postbuild": "npm run build:search-index && npm run check:search-index",
```

다음으로 변경:
```json
"postbuild": "npm run build:llms-txt && npm run check:llms-txt && npm run build:search-index && npm run check:search-index",
"build:llms-txt": "node scripts/llms-txt/build.mjs",
"check:llms-txt": "node scripts/llms-txt/verify.mjs",
```

llms.txt를 pagefind보다 먼저 생성하는 이유: pagefind가 public/ 을 스캔하더라도 텍스트 파일이라 영향 없음. 순서는 의미적으로 "사이트맵류 먼저 → 검색 인덱스 나중" 으로 정렬.

- [ ] **Step 3: 빌드 전체 통합 테스트**

Run: `npm run build`
Expected: 정상 종료. 마지막에 "llms.txt verification OK" 와 pagefind 메시지가 차례로 출력.

- [ ] **Step 4: gitignore 검토**

`.gitignore` 에서 `public/llms.txt`, `public/llms-full.txt` 가 ignore 되는지 확인. 빌드 산출물이지만 GitHub raw로 외부 LLM이 접근하려면 커밋되어 있는 게 유리하다. **결론: 커밋한다.**

Run: `grep -E "llms" .gitignore || echo "not ignored — good"`
Expected: `not ignored — good`

- [ ] **Step 5: 커밋**

```bash
git add scripts/llms-txt/verify.mjs package.json
git commit -m "feat(llm-wiki): wire llms-txt build into postbuild pipeline

postbuild에서 build:llms-txt → check:llms-txt → 기존 pagefind 순서 실행.
사이즈/H1 시작 등 최소 sanity check 포함."
```

---

## Task 5: /위키정리 lint 커맨드

**Files:**
- Create: `.claude/commands/위키정리.md`

- [ ] **Step 1: 커맨드 정의 작성**

`.claude/commands/위키정리.md`:

```markdown
---
description: 위키 lint — 모순/고아 페이지/누락 크로스 레퍼런스/오래된 last_verified 검사
---

# /위키정리

LLM Wiki의 정합성을 검사한다. autoresearch lint 작업 패턴과 동일.

## 실행 순서

1. **frontmatter 누락 페이지 탐지**
   - 모든 `content/**/*.mdx` 를 순회한다.
   - frontmatter 자체가 없거나, `id` / `summary` / `last_verified` 중 하나가 누락된 페이지를 나열한다.
   - **출력**: `- [ ] {경로} — 누락 필드: id, summary`

2. **오래된 last_verified 탐지 (12개월 이상)**
   - 오늘 날짜 기준 365일 이상 지난 페이지를 나열한다.
   - **출력**: `- [ ] {경로} — last_verified: 2025-04-12 (391일 전)`

3. **깨진 related slug 탐지**
   - 각 페이지의 `related[].slug` 가 실제 존재하는 페이지인지 확인.
   - 존재하지 않으면 보고.
   - **출력**: `- [ ] {경로} — related "missing-page" 가 존재하지 않음`

4. **깨진 source_logs 탐지**
   - `source_logs` 슬러그가 `content/logs.ts` 에 등록되어 있는지 확인.
   - 미등록 슬러그 보고.

5. **고아 페이지 탐지 (선택, 노이즈 많을 수 있음)**
   - 어떤 다른 페이지에서도 마크다운 링크 또는 `related` 로 참조되지 않은 페이지.
   - 인덱스 페이지(`index.mdx`)는 제외.
   - **출력**: `- ⚠ {경로} — 어떤 페이지도 참조하지 않음 (의도된 경우 무시)`

6. **요약 리포트 생성**
   - 검사 결과를 `.inbox/wiki-lint-{YYYY-MM-DD}.md` 에 저장.
   - 사용자에게 상위 10개 항목과 전체 카운트만 콘솔에 보고.

## 자동 수정은 하지 않는다

- 모든 발견은 보고만 한다. 수정은 사람이 결정한다.
- 단, 사용자가 명시적으로 "위키정리 수정 적용" 이라고 요청하면, `last_verified` 갱신 등 비파괴 작업에 한해 적용 가능.

## 출력 형식 예시

\`\`\`
위키 lint 결과 (2026-05-29)

frontmatter 누락: 132개
오래된 last_verified: 0개 (대부분 아직 미적용)
깨진 related slug: 3개
깨진 source_logs: 1개
고아 페이지: 8개

상세 리포트: .inbox/wiki-lint-2026-05-29.md
\`\`\`
```

- [ ] **Step 2: 커밋**

```bash
git add .claude/commands/위키정리.md
git commit -m "feat(llm-wiki): add /위키정리 lint command

frontmatter 누락, 오래된 last_verified, 깨진 related/source_logs, 고아 페이지 검사.
보고만 하고 자동 수정은 하지 않는다 (autoresearch lint 원칙)."
```

---

## Task 6: CLAUDE.md / README 갱신 및 종합 검증

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

- [ ] **Step 1: CLAUDE.md 상단에 LLM Wiki 패턴 참조 추가**

기존 헤더 아래에 다음 섹션 추가 (가장 적합한 위치는 "콘텐츠 추가 시 필수 작업" 직전):

```markdown
## LLM Wiki 패턴 (Karpathy + llms.txt)

이 저장소는 LLM 친화적 위키 구조를 따른다. 자세한 규약은 다음 문서를 참고한다:

- **`AGENTS.md`** — 외부 LLM 에이전트가 이 저장소에 기여할 때의 규약 (OpenAI/Codex/Cursor 호환).
- **`.claude/conventions/frontmatter-spec.md`** — MDX frontmatter 표준 (새 페이지부터 점진 적용).
- **`.claude/templates/`** — 새 페이지 작성 템플릿.
- **`public/llms.txt` / `public/llms-full.txt`** — 외부 LLM이 사이트를 빠르게 훑을 수 있는 진입점. `npm run build` 시 자동 생성.
- **`/위키정리`** — 위키 정합성 lint 커맨드.

| 역할 | 파일 | 대상 독자 |
|------|------|-----------|
| 워크플로우/schema | `CLAUDE.md` | Claude Code (이 저장소 내부) |
| 컨트리뷰션 규약 | `AGENTS.md` | 모든 LLM 에이전트 |
| 사이트 카탈로그 | `public/llms.txt` | 외부 LLM (ChatGPT/Claude/Gemini 등) |
| 전체 콘텐츠 평탄화 | `public/llms-full.txt` | 일괄 ingest 가 필요한 외부 LLM |
```

- [ ] **Step 2: README.md 에 진입점 안내 추가**

README.md 상단(프로젝트 한 줄 소개 다음)에 짧은 섹션 추가:

```markdown
## LLM이 이 저장소를 읽고 기여하려면

- 외부 LLM은 [`public/llms.txt`](./public/llms.txt) 를 먼저 읽어 사이트 구조를 파악.
- 전체 콘텐츠를 한 번에 ingest 하려면 [`public/llms-full.txt`](./public/llms-full.txt) 사용.
- 기여 규약은 [`AGENTS.md`](./AGENTS.md), 내부 워크플로우는 [`CLAUDE.md`](./CLAUDE.md) 참고.
```

- [ ] **Step 3: 빌드 전체 재확인**

Run: `npm run build`
Expected: 정상 종료, llms-txt + pagefind 모두 OK.

Run: `head -50 public/llms.txt`
Expected: 사이트 제목 + Pages 섹션에 실제 페이지 목록이 보여야 함.

- [ ] **Step 4: /위키정리 시뮬레이션 (수동)**

`/위키정리` 는 LLM이 실행하는 커맨드라 자동화 테스트는 어렵다. 다음을 수동으로 확인:

Run: `grep -c "^---" content/education/insights/*.mdx | awk -F: '$2 == 0 {print $1}' | head -5`
Expected: frontmatter 없는 페이지가 다수 나열될 것 (예상된 결과 — 점진 마이그레이션 대상).

- [ ] **Step 5: TypeScript 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 6: 커밋**

```bash
git add CLAUDE.md README.md
git commit -m "docs(llm-wiki): document LLM Wiki pattern in CLAUDE.md and README

CLAUDE.md에 AGENTS.md/llms.txt 와의 역할 분리 표 추가.
README.md에 외부 LLM이 이 저장소를 읽는 진입점 안내."
```

- [ ] **Step 7: 최종 통합 검증**

Run: `git log --oneline main..HEAD`
Expected: 6개 커밋 (Task 1~6).

Run: `git diff --stat main..HEAD`
Expected: 신설된 파일 위주, 기존 MDX 본문은 변경 없음.

---

## Self-Review 체크리스트

### Spec coverage

- ✅ llms.txt + llms-full.txt 자동 생성 → Task 3, 4
- ✅ frontmatter 표준화 → Task 1 (스펙) + Task 2 (템플릿)
- ✅ AGENTS.md 신설 (CLAUDE.md와 정렬) → Task 1, 6
- ✅ lint 커맨드 → Task 5
- ❌ "content/llm-index.md(LLM용 카탈로그)" → llms.txt 가 동일 역할을 하므로 별도 생성하지 않음. (자기 검토 시 결정)
- ❌ 137개 MDX 전체 마이그레이션 → 옵션3 영역이므로 의도적으로 제외. AGENTS.md 에 점진 적용 정책 명시.

### Placeholder scan

- ✅ 모든 스텝에 실제 코드/명령어 포함
- ✅ 템플릿 내부 `TODO` 는 의도된 placeholder (사용자가 채우는 부분)

### Type consistency

- ✅ `buildLlmsTxt` 의 반환 타입은 `{ llmsTxt, llmsFullTxt }` 로 Task 3 내 일관됨
- ✅ frontmatter 필드명 (`id`, `summary`, `last_verified`, `related`, `source_logs`) Task 1 / 2 / 5 에서 일관됨

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-29-llm-wiki-optimization.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - 사용자가 task별로 fresh subagent 에게 위임, 사이마다 리뷰. 안전성·재현성 높음.

**2. Inline Execution** - 이 세션에서 task를 batch로 실행, 체크포인트마다 사용자 확인.

**Which approach?**
