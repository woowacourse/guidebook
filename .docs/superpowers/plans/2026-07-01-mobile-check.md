# 모바일 점검 스킬 (mobile-check) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 디자인(CSS Modules/컴포넌트) 변경 시 모바일 UX 깨짐을 예방(작성 규칙)하고 검증(Playwright)하는 스킬 + 넌지시 Stop 훅을 구축한다.

**Architecture:** 결정론적 정적 린트(`mobile-lint.mjs`)가 변경된 CSS의 고신뢰 오버플로우 위험을 싸게 잡고 → Stop 훅이 커밋 히스토리 diff로 미점검 변경을 감지해 위반 시 넌지시 알린다 → 다음 턴에 `/모바일점검` 스킬이 실제 모바일 뷰포트로 브라우저 검증한다. 정적(싸다)+브라우저(확실하다)의 이중 구조.

**Tech Stack:** Node ESM 스크립트(`node --test`), Bash Stop 훅, Playwright MCP, Nextra 4/Next.js 15/CSS Modules.

## Global Constraints

- 모든 스크립트·훅·스킬·커맨드 본문은 **한국어**.
- 스크립트는 `ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd()` 관례를 따른다(tone-lint와 동형).
- 훅은 커밋 히스토리 기반 감지(`git diff <마커> HEAD`) — 워킹트리 diff 금지(auto-commit 훅이 매 턴 비운다).
- 훅은 도구/파일/마커 부재 시 **조용히 `exit 0`**(깨지지 않게). 넌지시 알림은 `exit 2` + stderr.
- 커밋은 이 leaf(`projects/woowahan/woowacourse-docs`)에서. **푸시는 요청 시에만**(메모리 규칙).
- 정적 린트 `error`는 명백한 것만(오탐 최소화), 나머지는 `warn`. 훅은 **error가 있을 때만** 알린다.
- breakpoint 계단: 주력 `≤640px`, 폰 `≤480px`. 검증 뷰포트: 375×812 / 360×800 / 640×900.
- 커밋 메시지 끝: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## 파일 구조

| 파일 | 책임 | Task |
|---|---|---|
| `scripts/mobile/mobile-lint.mjs` | CSS 정적 린트: `lintCss(content, file)` + CLI | 1 |
| `scripts/mobile/__tests__/mobile-lint.test.mjs` | 린트 규칙 단위 테스트(node --test) | 1 |
| `package.json` | `lint:mobile`·`test:mobile` 스크립트 추가 | 1 |
| `.claude/sync-state.json` | `lastMobileCheckCommit`·`mobileCheckConfig` 추가 | 2 |
| `.claude/hooks/mobile-check-nudge.sh` | Stop 훅: 변경 감지 → 린트 → 넌지시 알림 | 2 |
| `.claude/settings.json` | Stop 배열에 훅 등록 | 2 |
| `.claude/skills/mobile-check/SKILL.md` | 스킬 본체(작성 규칙 + 검증 프로토콜) | 3 |
| `.claude/commands/모바일점검.md` | 수동 진입점 | 3 |
| (검증) | E2E dry run + 마커 초기화 | 4 |

---

## Task 1: 정적 린트 `mobile-lint.mjs` + 테스트

**Files:**
- Create: `scripts/mobile/mobile-lint.mjs`
- Test: `scripts/mobile/__tests__/mobile-lint.test.mjs`
- Modify: `package.json` (scripts 블록)

**Interfaces:**
- Produces: `lintCss(content: string, filename?: string): Finding[]` where `Finding = { severity: 'error'|'warn', rule: string, selector: string, line: number, message: string, file: string }`.
- Produces (CLI): `node scripts/mobile/mobile-lint.mjs [file...]` — 인자 없으면 `components/*.module.css` + `app/globals.css` 전체. `error>0`이면 exit 1, 아니면 exit 0. 각 발견은 `✗`(error)/`⚠`(warn)로 stdout.
- Consumes: 없음.

- [ ] **Step 1: 실패 테스트 작성**

Create `scripts/mobile/__tests__/mobile-lint.test.mjs`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lintCss } from '../mobile-lint.mjs'

const rules = (findings) => findings.map((f) => f.rule)

test('max-width 없는 큰 고정 width 는 error', () => {
  const f = lintCss('.card { width: 900px; padding: 1rem; }', 'x.module.css')
  assert.ok(rules(f).includes('fixed-width-no-max'))
  assert.equal(f.find((x) => x.rule === 'fixed-width-no-max').severity, 'error')
})

test('max-width 동반 고정 width 는 통과', () => {
  const f = lintCss('.card { width: 900px; max-width: 100%; }', 'x.module.css')
  assert.ok(!rules(f).includes('fixed-width-no-max'))
})

test('작은 고정 width(≤375) 는 통과 (아이콘 등)', () => {
  const f = lintCss('.icon { width: 24px; height: 24px; }', 'x.module.css')
  assert.equal(f.length, 0)
})

test('폰 폭 초과 min-width 는 error', () => {
  const f = lintCss('.wrap { min-width: 700px; }', 'x.module.css')
  assert.ok(rules(f).includes('min-width-no-max'))
})

test('white-space:nowrap 는 warn', () => {
  const f = lintCss('.chip { white-space: nowrap; }', 'x.module.css')
  const hit = f.find((x) => x.rule === 'nowrap')
  assert.ok(hit && hit.severity === 'warn')
})

test('100vw 는 warn', () => {
  const f = lintCss('.full { width: 100vw; }', 'x.module.css')
  assert.ok(rules(f).includes('viewport-width'))
})

test('@media 안의 고정 width 는 반응형이므로 no-media 를 유발하지 않는다', () => {
  const css = '.a { color: red; }\n@media (max-width: 640px) { .a { width: 500px; max-width: 100%; } }'
  const f = lintCss(css, 'x.module.css')
  assert.ok(!rules(f).includes('no-media-fixed-layout'))
})

test('@media 없는 고정 px 레이아웃은 no-media warn', () => {
  const f = lintCss('.a { width: 800px; max-width: 100%; }', 'x.module.css')
  assert.ok(rules(f).includes('no-media-fixed-layout'))
})

test('주석 안의 위험 패턴은 무시한다', () => {
  const f = lintCss('/* width: 900px 예시 */\n.a { padding: 1rem; }', 'x.module.css')
  assert.equal(f.length, 0)
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test scripts/mobile/__tests__/mobile-lint.test.mjs`
Expected: FAIL — `Cannot find module '../mobile-lint.mjs'`.

- [ ] **Step 3: 린트 구현**

Create `scripts/mobile/mobile-lint.mjs`:
```js
#!/usr/bin/env node
// mobile-lint — CSS 모듈/전역 CSS의 모바일 오버플로우 위험을 정적 점검합니다.
//
// 이 저장소는 CSS Modules 기반이라 반응형이 각 .module.css 의 @media 와 고정 width 에
// 흩어져 있습니다. Tailwind breakpoint 유틸이 없으므로 여기서 직접 고신뢰 위험만 잡습니다.
// error 는 "명백한 오버플로우 유발"만(오탐 최소화), 나머지는 warn(사람 판단).
//
// 사용: node scripts/mobile/mobile-lint.mjs [file...]
//   인자 없음 → components/*.module.css + app/globals.css 전체
// 종료코드: error>0 → 1, 아니면 0.

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd()

// 주석을 공백으로 치환하되 개행은 보존해 라인 번호를 유지합니다.
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length
}

export function lintCss(content, filename = '<input>') {
  const findings = []
  const src = stripComments(content)
  const hasMedia = /@media/.test(src)
  let sawFixed = false

  // 선언 블록 "selector { body }" 순회. 중첩 @media 는 안쪽 규칙만 매칭되지만
  // 안쪽 선언을 여전히 검사하므로 목적을 충족합니다.
  const blockRe = /([^{}]*)\{([^{}]*)\}/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const selector = m[1].trim().split('\n').pop().trim() || '(unknown)'
    const body = m[2]
    const line = lineOf(content, m.index)
    const hasMaxWidth = /max-width\s*:/.test(body)

    for (const d of body.matchAll(/(?<![\w-])width\s*:\s*(\d+)px/g)) {
      const n = Number(d[1])
      if (n <= 375) continue
      sawFixed = true
      if (!hasMaxWidth) {
        findings.push({
          severity: 'error', rule: 'fixed-width-no-max', selector, line,
          message: `width:${n}px — max-width 없이 고정 폭. 뷰포트 초과 위험. max-width:100% 동반 필요.`,
        })
      }
    }
    for (const d of body.matchAll(/min-width\s*:\s*(\d+)px/g)) {
      const n = Number(d[1])
      if (n <= 360) continue
      sawFixed = true
      if (!hasMaxWidth) {
        findings.push({
          severity: 'error', rule: 'min-width-no-max', selector, line,
          message: `min-width:${n}px — 폰 폭(360px) 초과 최소폭. 가로 스크롤 유발. max-width:100% 또는 낮춤 필요.`,
        })
      }
    }
    if (/white-space\s*:\s*nowrap/.test(body)) {
      findings.push({
        severity: 'warn', rule: 'nowrap', selector, line,
        message: `white-space:nowrap — 긴 텍스트면 오버플로우. 짧은 라벨에만 쓰는지 확인.`,
      })
    }
    if (/\b100vw\b/.test(body)) {
      findings.push({
        severity: 'warn', rule: 'viewport-width', selector, line,
        message: `100vw — 스크롤바 폭만큼 가로 오버플로우 흔함. width:100% 또는 overflow-x 관리 확인.`,
      })
    }
  }

  if (sawFixed && !hasMedia) {
    findings.push({
      severity: 'warn', rule: 'no-media-fixed-layout', selector: '(file)', line: 1,
      message: `고정 px 레이아웃인데 @media 쿼리가 없음 — 반응형 미고려 신호.`,
    })
  }
  return findings.map((f) => ({ ...f, file: filename }))
}

function listDefaultFiles() {
  const out = []
  const compDir = path.join(ROOT, 'components')
  if (fs.existsSync(compDir)) {
    for (const f of fs.readdirSync(compDir)) {
      if (f.endsWith('.module.css')) out.push(path.join(compDir, f))
    }
  }
  const globals = path.join(ROOT, 'app/globals.css')
  if (fs.existsSync(globals)) out.push(globals)
  return out
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const argv = process.argv.slice(2)
  const files = argv.length ? argv.map((f) => path.resolve(f)) : listDefaultFiles()
  let errors = 0
  let warns = 0
  for (const abs of files) {
    if (!fs.existsSync(abs)) continue
    const findings = lintCss(fs.readFileSync(abs, 'utf8'), path.relative(ROOT, abs))
    for (const f of findings) {
      if (f.severity === 'error') errors++
      else warns++
      console.log(`${f.severity === 'error' ? '✗' : '⚠'} ${f.file}:${f.line} [${f.rule}] ${f.selector} — ${f.message}`)
    }
  }
  console.log(`\n모바일 정적 점검: error ${errors} · warn ${warns} (검사 ${files.length}개 파일)`)
  process.exit(errors > 0 ? 1 : 0)
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test scripts/mobile/__tests__/mobile-lint.test.mjs`
Expected: PASS — 9 tests pass.

- [ ] **Step 5: `package.json`에 스크립트 추가**

Modify `package.json` scripts 블록에 두 줄 추가(기존 `lint:tone` 아래):
```json
    "lint:tone": "node scripts/style/tone-lint.mjs",
    "lint:style": "node scripts/style/ai-style-lint.mjs",
    "lint:mobile": "node scripts/mobile/mobile-lint.mjs",
    "test:mobile": "node --test scripts/mobile/__tests__/mobile-lint.test.mjs",
```

- [ ] **Step 6: 전체 CSS에 실제 실행(스모크)**

Run: `npm run lint:mobile`
Expected: 종료코드 0 또는 1, 마지막 줄 `모바일 정적 점검: error N · warn M ...` 출력. (기존 CSS에 error가 있으면 실제 UX 위험이므로 목록을 기록해 둔다 — Task 4에서 브라우저로 확인.)

- [ ] **Step 7: 커밋**

```bash
git add scripts/mobile/mobile-lint.mjs scripts/mobile/__tests__/mobile-lint.test.mjs package.json
git commit -m "feat(mobile): CSS 모바일 오버플로우 정적 린트 추가

$(printf 'lintCss + CLI. 고정폭/nowrap/100vw/@media부재 검사. node --test 9건.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 2: 넌지시 Stop 훅 `mobile-check-nudge.sh`

**Files:**
- Modify: `.claude/sync-state.json` (필드 추가)
- Create: `.claude/hooks/mobile-check-nudge.sh`
- Modify: `.claude/settings.json` (Stop 배열)

**Interfaces:**
- Consumes: `scripts/mobile/mobile-lint.mjs` CLI(Task 1) — exit 1 = error 있음.
- Consumes: `.claude/sync-state.json` `.lastMobileCheckCommit`, `.mobileCheckConfig.threshold`.
- Produces: Stop 훅. 변경 디자인 파일에 error 있으면 stderr 알림 + `exit 2`, 아니면 `exit 0`.

- [ ] **Step 1: `sync-state.json`에 필드 추가**

`.claude/sync-state.json`의 최상위에 두 키를 추가한다(다른 키 유지). `lastMobileCheckCommit` 값은 아래 명령으로 얻은 현재 HEAD로 채운다:

Run: `git rev-parse HEAD`

그 값을 넣어 다음 두 키를 최상위 객체에 추가(예시의 커밋 해시는 위 명령 결과로 치환):
```json
  "lastMobileCheckCommit": "<git rev-parse HEAD 결과>",
  "mobileCheckConfig": {
    "threshold": 1,
    "viewports": [[375, 812], [360, 800], [640, 900]],
    "minTouchTarget": 44,
    "minBodyFont": 16,
    "_note": "threshold=변경 디자인 파일 최소 수. 훅은 이들 중 정적 error가 있을 때만 알림."
  },
```

- [ ] **Step 2: 훅 스크립트 작성**

Create `.claude/hooks/mobile-check-nudge.sh`:
```bash
#!/bin/bash
# mobile-check-nudge — Stop 훅. 마커 커밋 이후 바뀐 디자인 파일(.module.css / app/globals.css /
# components/*.tsx)에 모바일 오버플로우 정적 위반(error)이 있으면 다음 턴에 /모바일점검 을 권장한다.
#
# auto-sync-check.sh 와 동일한 커밋-히스토리 기반 감지: 이 저장소는 auto-commit 훅이 매 턴
# 커밋하므로 워킹트리 diff 는 늘 비어 보인다. 따라서 <lastMobileCheckCommit> HEAD diff 로 본다.
#
# 알림은 "정적 error 가 있을 때만" — 단순 변경만으로는 알리지 않아 노이즈를 막는다.
# (정적 error 없이도 실제 레이아웃이 깨질 수 있다. 그 경우는 수동 /모바일점검 과 작성 규칙이 커버.)
#
# 동작: error 감지 → exit 2 (stderr). 도구/마커/변경 부재·error 없음 → exit 0 (조용).

set -e
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE="$PROJECT_DIR/.claude/sync-state.json"
LINT="$PROJECT_DIR/scripts/mobile/mobile-lint.mjs"

if [ ! -f "$STATE" ]; then exit 0; fi
if [ ! -f "$LINT" ]; then exit 0; fi
if ! command -v jq >/dev/null 2>&1; then exit 0; fi
if ! command -v node >/dev/null 2>&1; then exit 0; fi

MARKER=$(jq -r '.lastMobileCheckCommit // empty' "$STATE" 2>/dev/null || true)
if [ -z "$MARKER" ]; then exit 0; fi
THRESHOLD=$(jq -r '.mobileCheckConfig.threshold // 1' "$STATE" 2>/dev/null || echo 1)

PATHSPEC=('*.module.css' 'app/globals.css' 'components/*.tsx')

CHANGED=$(git -C "$PROJECT_DIR" diff --name-only "$MARKER" HEAD -- "${PATHSPEC[@]}" 2>/dev/null | grep -c . || true)
case "$CHANGED" in ''|*[!0-9]*) CHANGED=0 ;; esac
if [ "$CHANGED" -lt "$THRESHOLD" ]; then exit 0; fi

# 바뀐 파일 중 현재 존재하는 것만 절대경로로
FILES=$(git -C "$PROJECT_DIR" diff --name-only "$MARKER" HEAD -- "${PATHSPEC[@]}" 2>/dev/null \
  | while read -r f; do [ -f "$PROJECT_DIR/$f" ] && echo "$PROJECT_DIR/$f"; done)
if [ -z "$FILES" ]; then exit 0; fi

# 정적 린트 (error>0 → exit 1). set -e 아래 종료코드 캡처를 위해 임시로 끈다.
set +e
OUT=$(CLAUDE_PROJECT_DIR="$PROJECT_DIR" node "$LINT" $FILES 2>/dev/null)
RC=$?
set -e

if [ "$RC" -eq 1 ]; then
  ERRLINES=$(echo "$OUT" | grep -c '^✗' || true)
  echo "[mobile-check] 디자인 변경 ${CHANGED}개 파일에서 모바일 오버플로우 위험(error ${ERRLINES}건) 감지. 다음 턴에 /모바일점검 으로 실제 모바일 뷰포트 검증을 권장합니다." >&2
  exit 2
fi
exit 0
```

- [ ] **Step 3: 실행 권한 부여**

Run: `chmod +x .claude/hooks/mobile-check-nudge.sh`
Expected: 무출력(성공).

- [ ] **Step 4: 훅 등록**

Modify `.claude/settings.json` — `Stop[0].hooks` 배열에 세 번째 항목 추가:
```json
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/auto-sync-check.sh"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/auto-compile-check.sh"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/mobile-check-nudge.sh"
          }
        ]
      }
    ]
```

- [ ] **Step 5: 훅 동작 검증 (positive — error 있으면 exit 2)**

위반 CSS 픽스처를 임시 커밋해 마커를 그 이전으로 두고 훅을 직접 실행한다:
```bash
BASE=$(git rev-parse HEAD)
mkdir -p components && printf '.probe { min-width: 900px; }\n' > components/__mobileprobe.module.css
git add components/__mobileprobe.module.css && git commit -q -m "test: mobile probe (임시)"
# 마커를 픽스처 이전으로 강제
node -e "const fs=require('fs');const p='.claude/sync-state.json';const j=JSON.parse(fs.readFileSync(p));j.lastMobileCheckCommit='$BASE';fs.writeFileSync(p,JSON.stringify(j,null,2))"
CLAUDE_PROJECT_DIR="$(pwd)" bash .claude/hooks/mobile-check-nudge.sh; echo "exit=$?"
```
Expected: stderr에 `[mobile-check] ... error 1건 ...`, `exit=2`.

- [ ] **Step 6: 훅 동작 검증 (negative — 디자인 외 변경은 조용)**

```bash
# 픽스처 되돌리기
git revert --no-edit HEAD
git rm -q components/__mobileprobe.module.css 2>/dev/null || true
# 마커를 현재 HEAD로 (미점검 디자인 변경 없음)
node -e "const cp=require('child_process');const fs=require('fs');const h=cp.execSync('git rev-parse HEAD').toString().trim();const p='.claude/sync-state.json';const j=JSON.parse(fs.readFileSync(p));j.lastMobileCheckCommit=h;fs.writeFileSync(p,JSON.stringify(j,null,2))"
CLAUDE_PROJECT_DIR="$(pwd)" bash .claude/hooks/mobile-check-nudge.sh; echo "exit=$?"
```
Expected: 무출력, `exit=0`. (`components/__mobileprobe.module.css`가 남아 있지 않은지 `ls components/__mobileprobe.module.css` 로 확인 — 없어야 정상.)

- [ ] **Step 7: 커밋**

```bash
git add .claude/hooks/mobile-check-nudge.sh .claude/settings.json .claude/sync-state.json
git commit -m "feat(mobile): 디자인 변경 감지 넌지시 Stop 훅 추가

$(printf 'auto-sync-check 패턴. 마커 이후 바뀐 CSS/컴포넌트에 정적 error 시 /모바일점검 권장.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 3: 스킬 `SKILL.md` + 커맨드 `/모바일점검`

**Files:**
- Create: `.claude/skills/mobile-check/SKILL.md`
- Create: `.claude/commands/모바일점검.md`

**Interfaces:**
- Consumes: `mobile-lint.mjs`(Task 1) CLI, `mobile-check-nudge.sh`(Task 2) 알림, Playwright MCP 툴(`browser_navigate`·`browser_resize`·`browser_evaluate`·`browser_take_screenshot`).
- Consumes: `.claude/sync-state.json` `.mobileCheckConfig` (뷰포트·임계값).
- Produces: 스킬 실행 절차(사람이 읽는 문서). 검증 = 자체 리뷰 체크리스트.

- [ ] **Step 1: 스킬 본체 작성**

Create `.claude/skills/mobile-check/SKILL.md`:
````markdown
---
name: mobile-check
description: "woowacourse-docs 의 모바일 UX 를 점검한다. CSS Module/컴포넌트를 쓸 때 지킬 작성 규칙(가로 오버플로우 금지·한글 word-break·44px 터치·overflow 컨테이너·safe-area·hover 금지)과, Playwright 로 실제 모바일 뷰포트(375·360·640px)에 띄워 가로 스크롤·터치 타깃·글자 잘림을 탐지·수정하는 검증 프로토콜. 모바일 점검·반응형 확인·모바일에서 깨져·디자인 변경 후 검증·/모바일점검 요청 시, 그리고 Stop 훅의 [mobile-check] 알림을 봤을 때 이 스킬을 사용한다."
---

# 모바일 점검 (mobile-check)

이 저장소는 **CSS Modules** 기반이라 반응형이 각 `.module.css` 의 `@media` 와 고정 width 에 흩어져 있습니다. Tailwind 의 `sm:`/`md:` 유틸이 없어 모바일 깨짐이 놓치기 쉽습니다. 이 스킬은 **예방(작성 규칙)** 과 **검증(브라우저)** 두 층으로 "모바일에서 어색함이 없도록" 보장합니다.

## Layer 1 · 작성 규칙 (CSS/컴포넌트를 쓸 때 항상 준수)

1. **가로 오버플로우 금지** — 어떤 요소도 뷰포트 폭을 넘지 않습니다.
   - 고정 `width`/`min-width`(px)엔 `max-width: 100%` 를 동반합니다.
   - 풀블리드(`data-landing-hero` 류)에서 `100vw` 는 스크롤바 폭만큼 넘칠 수 있으니 `width: 100%` 또는 `overflow-x: clip` 로 관리합니다.
   - 이미지/미디어: `max-width: 100%; height: auto`.
2. **한글 줄바꿈** — 본문 텍스트에 `word-break: keep-all` + `overflow-wrap: anywhere` (단어 절단·고아 끝줄 방지). `white-space: nowrap` 은 짧은 라벨/칩에만 씁니다.
3. **터치 타깃 ≥ 44×44px** — 링크·버튼·칩·아이콘 버튼. 작으면 `padding`/`min-height` 로 키웁니다.
4. **폰트 크기** — 본문 ≥ 16px(iOS 자동 확대 방지). 모바일에서 데스크톱 폰트를 줄일 때 최소 14px.
5. **넘치는 콘텐츠 가두기** — 테이블·코드블록·Mermaid·넓은 카드 그리드는 자체 `overflow-x: auto` 컨테이너 안에 둡니다. body 가 가로로 스크롤되면 안 됩니다.
6. **breakpoint 계단** — 이 저장소는 `≤640px`(주력)·`≤480px`(폰)을 씁니다. 새 컴포넌트도 이 계단을 따릅니다. 데스크톱 다열 그리드는 `≤640px` 에서 1열로.
7. **safe-area** — 하단 고정 요소는 `padding-bottom: env(safe-area-inset-bottom)`.
8. **hover 전용 UI 금지** — 터치엔 hover 가 없습니다. hover 로만 드러나는 정보·동작을 만들지 않습니다(포커스/탭으로도 접근 가능하게).

## Layer 2 · 실행 검증 (Playwright MCP)

싼 정적 린트로 먼저 거르고, 브라우저로 지상 진실을 확인합니다.

**0. 정적 린트 먼저** — `npm run lint:mobile` (또는 변경 파일만 `node scripts/mobile/mobile-lint.mjs <files>`). `✗`(error)는 반드시 수정 후보, `⚠`(warn)은 사람 판단.

**1. dev 서버 확보** — `curl -s -o /dev/null -w "%{http_code}" localhost:3000` 로 확인. 떠 있으면 재사용, 없으면 `next dev` 를 백그라운드로 띄우고 준비될 때까지 대기.

**2. 검증 대상 라우트** — 변경된 컴포넌트/CSS 가 렌더되는 페이지를 grep(예: `grep -rl "ComponentName" content app`)으로 찾고, 항상 홈(`/`) 포함.

**3. 뷰포트 순회** — `.claude/sync-state.json` 의 `mobileCheckConfig.viewports`(기본 `[375,812]`·`[360,800]`·`[640,900]`)에 대해 `browser_resize` → 대상 라우트 `browser_navigate`. 라이트·다크 각각(다크는 `?theme` 또는 테마 토글). 

**4. 오버플로우·터치 측정** — 각 화면에서 `browser_evaluate` 로 아래를 실행:
```js
(() => {
  const de = document.documentElement, vw = window.innerWidth;
  const overflow = de.scrollWidth > vw + 1;
  const wide = [...document.querySelectorAll('*')]
    .filter(el => el.getBoundingClientRect().right > vw + 1)
    .slice(0, 20)
    .map(el => ({ tag: el.tagName.toLowerCase(), cls: (typeof el.className === 'string' ? el.className : ''), right: Math.round(el.getBoundingClientRect().right) }));
  const smallTaps = [...document.querySelectorAll('a,button,[role=button]')]
    .map(el => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent || '').trim().slice(0, 24) }; })
    .filter(t => t.w > 0 && t.h > 0 && (t.w < 44 || t.h < 44))
    .slice(0, 20);
  return { vw, overflow, scrollWidth: de.scrollWidth, wide, smallTaps };
})()
```

**5. 스크린샷** — 각 뷰포트/모드 `browser_take_screenshot` 을 `.inbox/mobile-check/` 에 저장(`.inbox/` 는 gitignore). 사람이 눈으로 확인합니다.

**6. 리포트 & 수정** — 발견 항목마다 `원인 CSS 위치(file:line)` → `구체 수정안` 을 제시하고, **사람 승인 후** Layer 1 규칙에 맞춰 수정합니다. 자동 강행 금지.

**7. 마커 advance** — 점검·수정을 커밋한 뒤 `.claude/sync-state.json` 의 `lastMobileCheckCommit` 을 최신 HEAD 로 갱신합니다(다음 훅 알림이 이 지점 이후만 보도록).

## 판정 기준 (= "어색함" fail)

하나라도 있으면 fail → 수정 대상:
- 가로 스크롤 발생(`overflow: true`) / 요소가 뷰포트 폭 초과(`wide` 비어있지 않음)
- 터치 타깃 < 44px(`smallTaps` 비어있지 않음)
- 본문 글자 잘림·고아 끝줄(스크린샷 육안)
- 텍스트 < 14px
- hover 전용 UI(터치로 접근 불가)

## 한계 (정직하게)

- 정적 린트는 실제 레이아웃 오버플로우를 다 잡지 못합니다 — 브라우저 검증이 지상 진실입니다.
- Stop 훅은 **정적 error 가 있을 때만** 알립니다. error 없이 깨지는 경우는 이 스킬을 수동 실행(`/모바일점검`)하거나 작성 규칙 준수로 예방합니다.
````

- [ ] **Step 2: 커맨드 진입점 작성**

Create `.claude/commands/모바일점검.md`:
```markdown
---
description: 실제 모바일 뷰포트로 페이지를 검증해 가로 스크롤·터치 타깃·글자 잘림을 탐지·수정한다
---

`mobile-check` 스킬을 사용해 모바일 UX 를 검증한다.

인자(`$ARGUMENTS`)로 라우트/컴포넌트를 지정할 수 있다(예: `/모바일점검 /education/logs/expedition`).
인자가 없으면 `lastMobileCheckCommit` 이후 바뀐 디자인 파일이 렌더되는 페이지 + 홈을 대상으로 한다.

절차는 `mobile-check` 스킬의 Layer 2(실행 검증)를 그대로 따른다:
1. `npm run lint:mobile` 로 정적 위반 먼저 거른다.
2. dev 서버 확보 → 모바일 뷰포트 순회(375·360·640px, 라이트/다크).
3. 오버플로우·터치 타깃 측정 + 스크린샷(`.inbox/mobile-check/`).
4. 발견 → 원인 CSS 위치 → 수정안 제시 → 사람 승인 후 수정.
5. 커밋 후 `.claude/sync-state.json` 의 `lastMobileCheckCommit` 을 HEAD 로 advance.
```

- [ ] **Step 3: 자체 리뷰 (플레이스홀더·정합성)**

확인: SKILL.md frontmatter 에 `name`/`description` 존재 · description 에 트리거 표현 포함 · 참조 경로(`scripts/mobile/mobile-lint.mjs`·`.claude/sync-state.json`) 실재 · 참조 툴명(`browser_resize` 등) 정확 · 커맨드가 스킬을 가리킴. TBD/TODO 없음.

- [ ] **Step 4: 커밋**

```bash
git add .claude/skills/mobile-check/SKILL.md ".claude/commands/모바일점검.md"
git commit -m "feat(mobile): mobile-check 스킬 + /모바일점검 커맨드 추가

$(printf '작성 규칙(예방) + Playwright 실행 검증(탐지) 2층. 판정 기준·한계 명시.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 4: E2E dry run + 마커 초기화

**Files:**
- Modify: `.claude/sync-state.json` (`lastMobileCheckCommit` 을 최종 HEAD 로)

**Interfaces:**
- Consumes: 전체 파이프라인(Task 1~3).
- Produces: 실제 한 페이지의 모바일 검증 증거 + 초기화된 마커.

- [ ] **Step 1: dev 서버 확보**

Run: `curl -s -o /dev/null -w "%{http_code}" localhost:3000 || echo "down"`
Expected: `200`(재사용) 또는 `down`. down 이면 `next dev` 를 백그라운드로 띄우고 `200` 될 때까지 대기.

- [ ] **Step 2: 홈을 375px 모바일로 검증**

Playwright MCP 로:
1. `browser_resize` width=375 height=812
2. `browser_navigate` `http://localhost:3000/`
3. `browser_evaluate` — SKILL.md Layer 2 Step 4 의 오버플로우·터치 프로브 실행
4. `browser_take_screenshot` → `.inbox/mobile-check/home-375-light.png`

Expected: 프로브가 `{ vw:375, overflow, wide, smallTaps }` 반환. `overflow:true` 또는 `wide`/`smallTaps` 가 비어있지 않으면 판정 기준상 fail — 원인 CSS 를 찾아 리포트(이번 dry run 에서는 수정 후보 기록까지, 실제 수정은 사람 승인 후).

- [ ] **Step 3: Task 1 스모크에서 나온 error 목록 재검토**

Task 1 Step 6 에서 기록한 기존 CSS error 가 실제 브라우저에서 오버플로우로 재현되는지 대조한다. 재현되면 수정 후보로 리포트(사람 승인 후 수정), 오탐이면 린트 규칙의 한계로 기록.

- [ ] **Step 4: 마커를 최신 HEAD 로 초기화**

Run:
```bash
node -e "const cp=require('child_process');const fs=require('fs');const h=cp.execSync('git rev-parse HEAD').toString().trim();const p='.claude/sync-state.json';const j=JSON.parse(fs.readFileSync(p));j.lastMobileCheckCommit=h;fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n')"
```
Expected: 무출력. 이후 훅은 이 지점 이후의 디자인 변경만 감지.

- [ ] **Step 5: 커밋**

```bash
git add .claude/sync-state.json
git commit -m "chore(mobile): lastMobileCheckCommit 마커 초기화

$(printf 'E2E dry run 완료 후 마커를 현 HEAD 로 고정.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Self-Review (계획 작성자 체크)

**Spec coverage:**
- 예방 규칙 8항목 → Task 3 SKILL.md Layer 1 ✓
- Playwright 검증 프로토콜(뷰포트·오버플로우·터치·스크린샷·리포트) → Task 3 Layer 2 + Task 4 E2E ✓
- 정적 린트(고신뢰 패턴, error/warn) → Task 1 ✓
- 넌지시 훅(커밋 히스토리·error only·조용한 exit 0) → Task 2 ✓
- 수동 커맨드 → Task 3 ✓
- settings.json 등록 → Task 2 Step 4 ✓
- sync-state 필드 → Task 2 Step 1 ✓
- 판정 기준 6항목 → Task 3 SKILL.md ✓
- 마커 advance → Task 3 Layer 2 Step 7 + Task 4 Step 4 ✓

**Placeholder scan:** 모든 코드 스텝에 실제 코드/명령. TBD/TODO 없음. ✓

**Type consistency:** `lintCss(content, filename)` 시그니처·`Finding` 필드(`severity/rule/selector/line/message/file`)가 Task 1 구현·테스트·훅 사용에서 일치. `lastMobileCheckCommit`·`mobileCheckConfig.threshold`/`.viewports` 키가 Task 2 정의·훅·스킬에서 일치. ✓

**스펙과의 차이(의도적):** 스펙은 `white-space:nowrap` 을 error 로 뒀으나, 정적으로 "본문성 선택자" 를 확정할 수 없어 **warn 으로 낮춤**(스펙의 "error 는 명백한 것만" 원칙에 부합). 훅은 error 에만 반응하므로 nowrap 은 넌지시 알림을 유발하지 않고 수동 점검에서 노출된다.
