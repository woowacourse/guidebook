# 모바일 점검 스킬 설계 (mobile-check)

- **날짜:** 2026-07-01
- **대상 저장소:** `projects/woowahan/woowacourse-docs` (Nextra 4 + Next.js 15 + React 19, CSS Modules)
- **상태:** 설계 승인됨 → 구현 계획 대기

## 1. 문제와 목표

구현 중 모바일 환경 고려가 사후로 밀려 UX가 깨진다. CSS Modules 기반이라 Tailwind의 `sm:`/`md:` breakpoint 유틸이 없어, 반응형은 각 `.module.css`의 `@media`와 고정 width에 흩어져 있다. 랜딩 풀블리드에서 좌측 여백 쏠림, 한글 글자 절단·고아 끝줄 같은 오버플로우·줄바꿈 버그가 반복 발생해 왔다.

**목표:** 모바일 환경에서 어색함이 **절대 없도록** 보장한다. 두 방향으로:
1. **예방** — CSS/컴포넌트를 쓸 때 지킬 모바일 규칙 체크리스트.
2. **검증** — 실제 모바일 뷰포트(Playwright)로 띄워 가로 스크롤·터치 타깃·글자 잘림을 탐지·수정.

디자인 변경이 일어날 때마다 Stop 훅이 넌지시 점검을 유도한다(자동 실행 아님 — 넌지시 알림).

## 2. 설계 원칙 (이 저장소의 결)

- **결정론적 측정 인프라 + 관찰 검증의 이중 구조** — autoresearch·tone-lint·verify-pagefind가 이미 쓰는 패턴. 싼 정적 린트가 위험 신호를 거르고, 확실한 브라우저 검증이 지상 진실을 확인한다.
- **넌지시 훅은 커밋 히스토리 기반** — 이 저장소는 auto-commit 훅이 매 턴 커밋하므로 워킹트리 diff는 늘 비어 보인다. `auto-sync-check.sh`처럼 `<마커커밋> HEAD` diff를 봐야 한다.
- **알림은 "진짜 신호"가 있을 때만** — 변경 파일 수가 아니라 정적 린트 위반 유무로 알림을 건다(auto-compile의 ledger 원리). 노이즈가 없어야 사람이 알림을 신뢰한다.
- **사람이 최종 판단** — 검증은 발견→원인→수정안을 제시하고, 스크린샷으로 사람이 눈으로 확인한 뒤 승인. 자동 수정 강행 금지.
- **저장소 breakpoint 계단 준수** — 주력 `max-width: 640px`, 실제 폰 `≤480px`. 새 규칙·검증도 이 계단을 따른다.

## 3. 컴포넌트

### A. `.claude/skills/mobile-check/SKILL.md` — 스킬 본체 (2층)

frontmatter: `name: mobile-check`, `description`(한국어, 트리거 표현 포함 — "모바일 점검", "반응형 확인", "모바일에서 깨져", "디자인 변경 후 검증" 등).

#### Layer 1 · 작성 규칙 (예방)
CSS 모듈/컴포넌트를 작성·편집할 때 항상 따른다:

1. **가로 오버플로우 금지** — 어떤 요소도 뷰포트 폭을 넘지 않는다.
   - 고정 `width`/`min-width`(px) → `max-width: 100%` 동반.
   - 풀블리드(`data-landing-hero`류)에서 `100vw` 사용 시 스크롤바 폭만큼 오버플로우 새는지 확인. 필요하면 `width: 100%` 또는 `max-width: 100vw; overflow-x: clip`.
   - 이미지/미디어: `max-width: 100%; height: auto`.
2. **한글 줄바꿈** — 본문 텍스트에 `word-break: keep-all` + `overflow-wrap: anywhere` (단어 절단·고아 끝줄 방지). `white-space: nowrap`은 짧은 라벨/칩에만.
3. **터치 타깃 ≥ 44×44px** — 링크·버튼·칩·아이콘 버튼. 작으면 `padding`/`min-height`로 키운다.
4. **폰트 크기** — 본문 ≥ 16px(iOS 자동 확대 방지). 모바일에서 데스크톱 폰트를 줄일 때 최소 14px.
5. **넘치는 콘텐츠 가두기** — 테이블·코드블록·Mermaid·넓은 카드 그리드는 자체 `overflow-x: auto` 컨테이너 안에 둔다. body가 가로로 스크롤되지 않게.
6. **breakpoint 계단** — 이 저장소는 `≤640px`(주력) / `≤480px`(폰)을 쓴다. 새 컴포넌트도 이 계단을 따른다. 데스크톱 전용 다열 그리드는 `≤640px`에서 1열로.
7. **safe-area** — 하단 고정 요소는 `padding-bottom: env(safe-area-inset-bottom)`.
8. **hover 전용 UI 금지** — 터치엔 hover가 없다. hover로만 드러나는 정보·동작을 만들지 않는다(포커스/탭으로도 접근 가능하게).

#### Layer 2 · 실행 검증 (Playwright MCP)
1. **dev 서버 확보** — `curl -s localhost:3000` 확인. 떠 있으면 재사용, 없으면 `next dev` 백그라운드 실행 후 준비 대기. (woowacourse-docs dev 서버가 이미 떠 있을 수 있음.)
2. **검증 대상 라우트 결정** — 변경된 컴포넌트/CSS가 렌더되는 페이지를 grep(`components/X` 사용처)으로 찾고, 항상 홈(`/`) 포함.
3. **뷰포트 순회** — `browser_resize`로 **375×812**(iPhone), **360×800**(Android 소형), 경계 **640px**. 라이트·다크 각각. 각 뷰포트에서 대상 라우트 `browser_navigate`.
4. **오버플로우 측정** — `browser_evaluate`:
   - 가로 스크롤 여부: `document.documentElement.scrollWidth > window.innerWidth`.
   - 넘친 요소 목록: 뷰포트 폭을 초과하는 요소의 선택자·rect 수집.
5. **터치 타깃 측정** — `a`, `button`, `[role=button]`의 `getBoundingClientRect()`로 44px 미만 수집.
6. **스크린샷** — 각 뷰포트/모드 `browser_take_screenshot`을 `.inbox/mobile-check/`에 저장 → 사람이 눈으로 확인.
7. **리포트 & 수정** — 발견 항목 → 원인 CSS 위치(`file:line`) → 구체 수정안. 사람 승인 후 Layer 1 규칙에 맞춰 수정.
8. **마커 advance** — 점검·수정 완료 후 `.claude/sync-state.json`의 `lastMobileCheckCommit`을 HEAD로 갱신(커밋 후).

#### 판정 기준 (= "어색함" fail)
하나라도 있으면 fail → 수정 대상:
- 가로 스크롤 발생 / 요소가 뷰포트 폭 초과
- 터치 타깃 < 44px
- 본문 글자 잘림·고아 끝줄
- 텍스트 < 14px
- hover 전용 UI(터치로 접근 불가)

### B. `scripts/mobile/mobile-lint.mjs` — 정적 린트 (결정론적)
`scripts/style/tone-lint.mjs`·`ai-style-lint.mjs`와 동형 구조. `components/*.module.css` + `app/globals.css`를 스캔해 **고신뢰 위험 패턴만** 보수적으로 플래그(오탐 최소화):

- **error** (명백): `max-width` 없는 큰 고정 `width: Npx`(N>375) 또는 `min-width: Npx`(N>360). 본문성 선택자의 `white-space: nowrap`.
- **warn** (신호): `100vw` 사용, `@media`가 전무한 고정 px 레이아웃 CSS.

`package.json`에 `"lint:mobile": "node scripts/mobile/mobile-lint.mjs"` 추가. 인자로 특정 파일만 검사 가능(훅이 변경분만 검사할 때 사용). exit code로 위반 수 전달.

### C. `.claude/hooks/mobile-check-nudge.sh` — Stop 훅 (넌지시)
`auto-sync-check.sh` 패턴 그대로:
```
lastMobileCheckCommit = jq .lastMobileCheckCommit sync-state.json
changed = git diff --name-only <lastMobileCheckCommit> HEAD -- '*.module.css' 'app/globals.css' 'components/*.tsx'
if changed 있음:
    violations = node scripts/mobile/mobile-lint.mjs <changed 파일들>
    if violations > 0:
        echo "[mobile-check] 디자인 변경 N개 파일, 모바일 위반 M건. 다음 턴에 /모바일점검 권장." >&2
        exit 2
exit 0   # 조용히
```
- 도구 부재(node/jq/스크립트 없음)·마커 부재 → 조용히 `exit 0`(훅이 깨지지 않게).
- 위반이 없으면 알림하지 않는다(노이즈 방지).

### D. `.claude/commands/모바일점검.md` — 수동 진입점
스킬 Layer 2를 호출. 인자로 라우트/컴포넌트 지정 가능: `/모바일점검 /education/logs/expedition`. 인자 없으면 미점검 변경분 자동 대상.

### E. `.claude/settings.json` — Stop 배열에 훅 추가
기존 `auto-sync-check.sh`·`auto-compile-check.sh` 옆에 `mobile-check-nudge.sh` 추가.

### F. `.claude/sync-state.json` — 필드 추가
```jsonc
{
  "lastMobileCheckCommit": "<현재 HEAD로 초기화>",
  "mobileCheckConfig": {
    "threshold": 1,                       // 디자인 변경은 1개만 바뀌어도 점검 가치
    "viewports": [[375,812],[360,800],[640,900]],
    "minTouchTarget": 44,
    "minBodyFont": 16
  }
}
```

## 4. 데이터 흐름
```
디자인 편집(.module.css / globals.css / components/*.tsx)
  → (Claude가 편집 중이면 Layer1 규칙 자동 준수)
  → 턴 종료 → Stop 훅(mobile-check-nudge.sh)
       → git diff <lastMobileCheckCommit> HEAD -- 디자인파일 → changed
       → changed에 mobile-lint (싸게)
            위반 有 → stderr 알림 + exit 2 (넌지시)
            위반 無 → exit 0 (조용)
  → 다음 턴 Claude가 알림 보고 /모바일점검 실행
       → Layer2: dev서버 → 모바일 뷰포트 순회 → 오버플로우·터치·잘림 측정 → 스크린샷 → 리포트
       → 사람 승인 → Layer1 규칙으로 수정
       → lastMobileCheckCommit = HEAD 로 advance
```

## 5. 스킬 자체 검증 (구현 후)
- **정적 린트:** 위반 CSS(예: `min-width: 900px` no max-width)를 심어 error로 잡히는지 / 정상 CSS는 통과하는지.
- **훅:** 디자인 파일 커밋 후 `lastMobileCheckCommit`을 이전으로 두면 위반 시 `exit 2`, 디자인 외 파일만 바뀌면 `exit 0`.
- **스킬 E2E:** 실제 한 페이지를 375px로 열어 오버플로우 측정·스크린샷이 동작하는지 dry run.

## 6. 범위 밖 (YAGNI)
- 시각 회귀(스크린샷 diff/baseline 관리) — 과함, 제외.
- 자동 수정 강행 — 사람 승인 게이트 유지.
- 태블릿/데스크톱 전 해상도 매트릭스 — 모바일(≤640px)에 집중.
