---
name: mobile-check
description: "woowacourse-docs 의 모바일 UX 를 점검한다. CSS Module/컴포넌트를 쓸 때 지킬 작성 규칙(가로 오버플로우 금지·한글 word-break·44px 터치·overflow 컨테이너·safe-area·hover 금지)과, Playwright 로 실제 모바일 뷰포트(375·360·640px)에 띄워 가로 스크롤·터치 타깃·글자 잘림을 탐지·수정하는 검증 프로토콜. 모바일 점검·반응형 확인·모바일에서 깨져·디자인 변경 후 검증·/모바일점검 요청 시, 그리고 Stop 훅의 [mobile-check] 알림을 봤을 때 이 스킬을 사용한다."
---

# 모바일 점검 (mobile-check)

이 저장소는 **CSS Modules** 기반이라 반응형이 각 `.module.css` 의 `@media` 와 고정 width 에 흩어져 있습니다. Tailwind 의 `sm:`/`md:` 유틸이 없어 모바일 깨짐이 놓치기 쉽습니다. 이 스킬은 **예방(작성 규칙)** 과 **검증(브라우저)** 두 층으로 "모바일에서 어색함이 없도록" 보장합니다.

## Layer 1 · 작성 규칙 (CSS/컴포넌트를 쓸 때 항상 준수)

1. **가로 오버플로우 금지** — 어떤 요소도 뷰포트 폭을 넘지 않습니다.
   - 고정 `width`(px)엔 `max-width: 100%` 를 동반합니다. **`min-width`(px)는 `max-width` 로 무효화되지 않으니** 폰 폭을 넘는 값을 피합니다(값을 낮추거나 제거).
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

**3. 뷰포트 순회** — `.claude/sync-state.json` 의 `mobileCheckConfig.viewports`(기본 `[375,812]`·`[360,800]`·`[640,900]`)에 대해 `browser_resize` → 대상 라우트 `browser_navigate`. 라이트·다크 각각(다크는 테마 토글).

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
