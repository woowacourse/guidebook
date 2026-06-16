# "시작하기" 페이지 + 두 모드 IA — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/education`에 "만들기" 모드의 진입점인 "시작하기" 페이지를 신설하고, 개요·사이드바를 두 모드(이해하기·만들기)로 재편한다.

**Architecture:** 콘텐츠/IA 변경 4개 파일(MDX·TS). 신규 `start.mdx`(6블록, 활성화 흐름), `_meta.ts`(사이드바 3그룹 + tools 노출), `index.mdx`(개요 두 문 재작성), `updates.ts`(타임라인 항목). 단위 테스트 대상이 아니므로 각 태스크의 "검증"은 `npm run build`(Next 빌드 + llms-txt/search-index 생성·검증) + `npm run lint:tone`(합니다체) + 링크 grep로 한다.

**Tech Stack:** Nextra 4, Next.js App Router, MDX, 커스텀 컴포넌트(Card/CardGrid/Callout/Toggle).

**근거 문서:** [docs/superpowers/specs/2026-06-16-getting-started-design.md](../specs/2026-06-16-getting-started-design.md)

**작업 위치:** 격리 워크트리 `.worktrees/education-gs` (branch `feat/edu-getting-started`).

**⚠️ 공통 주의:**
- `node_modules`가 심링크라 untracked로 잡힌다. **`git add -A` 금지** — 변경 파일만 명시적으로 스테이징한다.
- 본문 산문은 **합니다체**로만 쓴다(한다체·해요체 금지). `npm run lint:tone`이 검사한다.

---

## 파일 구조

| 파일 | 책임 | 작업 |
|------|------|------|
| `content/education/start.mdx` | "만들기" 모드 진입점 페이지 | 신규 |
| `content/education/_meta.ts` | 사이드바 항목·순서·그룹 | 수정 |
| `content/education/index.mdx` | 개요(두 모드 갈림길) | 재작성 |
| `content/updates.ts` | 랜딩 "최근 업데이트" 타임라인 | 항목 추가 |

---

## Task 1: "시작하기" 페이지 신설 (`start.mdx`)

**Files:**
- Create: `content/education/start.mdx`

- [ ] **Step 1: 파일 생성 — 아래 전체 내용 그대로**

````mdx
---
id: start
summary: 우테코 교육 모델을 5분 안에 이해하고, 이번 주에 시도할 가장 작은 변화 행동 1개를 손에 쥐고 나가는 시작점.
last_verified: 2026-06-16
---

# 시작하기 — 이번 주, 가장 작은 변화 하나

동료가 한 명이든 백 명이든, 사람이 스스로 자라는 환경을 만드는 원리는 같습니다. 이 페이지를 끝까지 읽으면 **이번 주에 당신이 시도할 가장 작은 변화 행동 1개**를 손에 쥐고 나갑니다. 바로 행동만 보고 싶다면 아래 안내를 따라가세요.

<Callout type="tip">
**5분 이해 → 오늘의 변화 1개 → 다음 문.** 이해는 건너뛰고 바로 행동을 고르고 싶다면 [오늘의 작은 변화 1개](#today)로 내려가, 코드·사람을 마주하는 멘토·팀을 운영하는 팀리더·환경을 설계하는 운영자·아직 권한이 없는 누구나 중 자기 한 장을 고르세요.
</Callout>

## 5분 이해 — 우테코 모델 한 문장

**정답을 떠먹여 주지 않고, 사람이 스스로 자라는 환경을 설계합니다.**

가르치는 사람(코치)은 답을 주는 사람이 아니라 '기준'과 '환경'을 까는 사람이고, 배우는 사람(크루)은 가르침의 대상이 아니라 자기 학습을 직접 진단하고 설계하는 주체입니다. 그래서 강의를 먼저 하지 않고 먼저 예측하게 한 뒤 부딪히게 하고(발견 학습), 무거운 주제는 한 번에 쏟지 않고 여러 회차로 나눠 깊이를 쌓으며(점진적 스캐폴딩), 답 대신 질문을 던지는 회고로 협업을 '분위기'가 아니라 '구조'로 깝니다. 이 원칙들은 누군가의 신념이 아니라 매주 쌓이는 실험에서 데이터로 귀납한 결과입니다.

<CardGrid columns={2}>
  <Card title="자기주도 학습" icon="🧭" href="/education/insights/self-diagnostic-framework">
    배우는 사람이 학습의 주체입니다.
  </Card>
  <Card title="발견 학습 (예측→관찰→설명)" icon="🔭" href="/education/insights/poe-discovery-learning">
    답보다 예측을 먼저 하게 합니다.
  </Card>
  <Card title="함께 성장하는 문화" icon="🤝" href="/education/insights/argumentation-based-learning">
    협업은 분위기가 아니라 구조입니다.
  </Card>
  <Card title="점진적 스캐폴딩" icon="🪜" href="/education/insights/progressive-scaffolding">
    한 번에 쏟지 않고 발판을 댑니다.
  </Card>
</CardGrid>

줄기는 하나(스스로 자라는 환경)이고, 손잡이 크기만 다릅니다 — 운영자는 큰 레버, 팀리더는 중간 레버, 멘토는 작은 레버를 잡습니다.

## 오늘의 작은 변화 1개 — 자기 한 장만 고르세요 [#today]

코드와 사람을 마주하면 **멘토**, 팀을 운영하면 **팀리더**, 커리큘럼·미션을 설계하면 **운영자**, 아직 권한이 없으면 **누구나** 카드입니다. **자기 한 장만** 고르세요.

<CardGrid columns={2}>
  <Card title="누구나 · 권한 0 · 20분" icon="🌱">
**내가 최근 남긴 코멘트 1줄을 5가지 기준으로 다시 씁니다.** 내가 쓴 피드백 한 줄을 구체성·균형성·실행가능성·관찰기반·성장지향성 5기준으로 점수화하고, 가장 낮은 기준 1개를 Before/After로 고쳐 씁니다. 이번 주 약속은 다음에 글을 남길 때 이 다시 쓴 버전처럼 쓰는 것입니다. [근거·전체 절차 보기](/education/logs/feedback-refactoring) · [자기 진단 패턴](/education/insights/self-diagnostic-framework)
  </Card>
  <Card title="멘토 · 작은 레버 · 15분" icon="💬">
**다음 리뷰 코멘트 1줄을 정답 대신 질문으로 바꿉니다.** 정답을 적어 주려던 코멘트를 멈추고, 그 자리에 "왜 이렇게 했나요?" 같은 되묻는 질문 한 줄을 적습니다. 이번 주 약속은 다음 1:1에서 정답 대신 질문 1줄을 던지는 것입니다. [검증된 패턴에서 더 보기](/education/insights/argumentation-based-learning)
  </Card>
  <Card title="팀리더 · 중간 레버 · 20분" icon="🔄">
**다음 회고 1회만 형식을 바꿔봅니다(10점 척도 점수화).** '협업이 잘 됐다' 같은 추상 감상 1개에 0~10점을 매기게 하고, "왜 그 점수인가"를 의무 코멘트로 붙입니다. 이번 주 약속은 이번 회고를 점수화 형식으로만 진행하는 것입니다. [회고 형식 설계 키트 — 검증된 도구 모음의 일부](/education/tools/retrospective-format-kit)
  </Card>
  <Card title="운영자 · 큰 레버 · 20분 · 운영 환경 필요" icon="🗺️">
**미션 1개의 최근 PR 3건만 웹에서 열어 골격과 사라진 층을 메모합니다.** CLI 없이 GitHub 웹에서 최근 PR 3건의 본문만 열고, 항상 등장하는 영구 골격 1개와 새로 들어오거나 사라진 층 1개를 메모합니다. 권한 있는 저장소가 없으면 공개 저장소의 아무 미션이나 봐도 됩니다. 이번 주 약속은 다음 미션 재설계 회의에 이 메모 한 장을 들고 들어가 "무엇을 더 쌓을까"를 묻는 것입니다. [미션 저장소 분석 워크플로우 — 검증된 도구 모음의 일부](/education/tools/mission-repo-analysis-workflow)
  </Card>
</CardGrid>

<Toggle title="이게 정말 데이터로 증명됐나">
우아한테크코스는 7년째 교육을 운영해 왔고, 그중 한 React 페이먼츠 미션 저장소의 5년치 기록을 정량 분석했습니다. 555개의 PR과 인간 리뷰 코멘트 2,178건을 분류하니 51.2%가 답이 아니라 질문이었습니다(질문 35.2% + "왜?" 형태 16.0%, 긍정 피드백 37%). 즉 이 원칙들은 믿어서가 아니라 매주 실험이 증명해서 남은 가설입니다. 원본은 [페이먼츠 5년 555 PR 분석](/education/logs/react-payments-555prs-analysis)과 [논증 기반 학습](/education/insights/argumentation-based-learning)에서 확인할 수 있습니다.
</Toggle>

## 다음 문 — 더 깊이

이번 주 첫 행동을 한 번 해본 뒤, 왜 이게 작동했는지 원리가 궁금해지면 이 문을 여세요.

<CardGrid variant="list">
  <Card title="왜 이렇게 가르치는가 — 교육 철학" icon="🎯" href="/education/philosophy" variant="row">
    스스로 자라는 환경을 떠받치는 4가지 원칙과 그 근거.
  </Card>
  <Card title="철학을 10개월로 — 커리큘럼" icon="🗺️" href="/education/curriculum" variant="row">
    원리를 레벨0~5의 시간표로 옮기는 설계.
  </Card>
  <Card title="검증된 패턴 전체" icon="⬆️" href="/education/insights" variant="row">
    여러 실험에서 반복 검증된 해결 패턴 모음.
  </Card>
  <Card title="검증된 도구 모음" icon="🛠️" href="/education/tools" variant="row">
    복사해서 바로 쓰는 워크숍·회고·멘토링 도구.
  </Card>
</CardGrid>
````

> **MDX 주의:** ④ 카드의 children 본문은 **들여쓰기 없이**(JSX 여는 태그 다음 줄, 0칸 들여쓰기) 한 문단으로 둔다. 4칸 이상 들여쓰면 MDX가 코드블록으로 오인한다. 헤딩 `## ... [#today]`의 `[#today]`는 Nextra 명시 id 문법이다(빌드에서 `id="today"` 확인).

- [ ] **Step 2: lint:tone 통과 확인**

Run: `npm run lint:tone`
Expected: 신규 `start.mdx`에 한다체/해요체 위반 0건 (PASS).
실패 시: 지적된 문장을 합니다체로 고치고 재실행.

- [ ] **Step 3: 빌드로 MDX 파싱·렌더 확인**

Run: `npm run build 2>&1 | tail -30`
Expected: 빌드 성공. `start.mdx` 관련 MDX 파싱 에러 없음.
실패 시(카드 children 파싱 에러): ④ 카드 본문의 들여쓰기를 0칸으로 맞추고, 그래도 안 되면 본문을 한 문장으로 더 단순화. **`[#today]` 앵커가 안 먹으면 폴백:** 헤딩을 평문으로 두고 ② Callout의 `#today` 링크를 자동 생성 id(빌드 산출 HTML에서 확인한 실제 id)로 교체.

- [ ] **Step 4: 앵커·링크 정합성 grep**

Run:
```bash
grep -n "#today" content/education/start.mdx
grep -oE "/education/[a-z/-]+" content/education/start.mdx | sort -u
```
Expected: `#today` 1회(Callout) + 헤딩 정의 1회. 링크 슬러그가 아래 9개에 모두 포함:
`/education/insights/self-diagnostic-framework`, `/education/insights/poe-discovery-learning`, `/education/insights/argumentation-based-learning`, `/education/insights/progressive-scaffolding`, `/education/logs/feedback-refactoring`, `/education/tools/retrospective-format-kit`, `/education/tools/mission-repo-analysis-workflow`, `/education/logs/react-payments-555prs-analysis`, 그리고 다음 문 4개(`/education/philosophy`, `/education/curriculum`, `/education/insights`, `/education/tools`).

- [ ] **Step 5: 커밋**

```bash
git add content/education/start.mdx
git commit -m "feat(education): 시작하기 페이지 신설 — 이번 주 가장 작은 변화 1개"
```

---

## Task 2: 사이드바 3그룹 + tools 노출 (`_meta.ts`)

**Files:**
- Modify: `content/education/_meta.ts`

- [ ] **Step 1: `export default {...}` 본문을 아래로 교체**

상단의 `import`/`insightsCount` 계산 블록(L1~8)은 **건드리지 않는다**. `export default` 객체만 아래로 바꾼다:

```ts
export default {
  index: {
    title: '📖 개요',
    theme: {
      breadcrumb: false,
      pagination: false,
      timestamp: false,
      typesetting: 'article'
    }
  },
  '--build': { type: 'separator', title: '만들기' },
  start: '🚀 시작하기',
  '--understand': { type: 'separator', title: '교육 모델 이해하기' },
  philosophy: '🎯 교육 철학',
  curriculum: '🗺️ 커리큘럼',
  insights: `⬆️ 검증된 패턴 (${insightsCount})`,
  '--raw': { type: 'separator', title: '원재료' },
  logs: `⬆️ 실험 로그 (${logs.length})`,
  tools: '🛠️ 검증된 도구',
  conversations: {
    title: '🗂️ 우테코 콘텐츠 아카이브',
    display: 'hidden'
  },
  assessment: {
    title: '평가',
    display: 'hidden'
  },
  'failed-experiments': {
    title: '실패한 교육',
    display: 'hidden'
  },
  operations: {
    title: '운영',
    display: 'hidden'
  }
}
```

> 변경점: ① `start` 신규(개요 바로 아래) ② separator 3개로 그룹화 ③ `tools`의 `display: 'hidden'` 제거(원재료 그룹에 노출). 나머지 hidden 항목은 그대로.

- [ ] **Step 2: 타입·빌드 확인 (separator 렌더 검증)**

Run: `npm run build 2>&1 | tail -30`
Expected: 빌드 성공. 사이드바에 "만들기 / 교육 모델 이해하기 / 원재료" 그룹 헤더가 생성됨.
**실패 시 폴백(separator를 Nextra 4가 거부하면):** separator 3줄을 제거하고 항목 순서만 위와 동일하게 유지한다(start는 index 다음, tools는 logs 다음, hidden 제거는 유지). 두 모드 구분은 개요(Task 3)의 "두 문"이 담당한다. CLAUDE.md의 hidden 규칙상 `tools`는 절대 삭제하지 않는다.

- [ ] **Step 3: 커밋**

```bash
git add content/education/_meta.ts
git commit -m "feat(education): 사이드바를 만들기/이해하기/원재료 3그룹으로 재편 + 도구 노출"
```

---

## Task 3: 개요를 두 문 랜딩으로 재작성 (`index.mdx`)

**Files:**
- Modify: `content/education/index.mdx`

- [ ] **Step 1: 파일 전체를 아래로 교체**

````mdx
# 교육

우아한테크코스는 8년째 10개월짜리 교육을 굴려 왔습니다. 그 7년간의 경험과, 현장에서 진행 중인 실험을 한 자리에 모은 공식문서입니다. 이 문서는 두 길로 읽을 수 있습니다 — 그 설계를 **이해**하거나, 당신의 자리에서 직접 **시작**하거나.

<CardGrid columns={2}>
  <Card title="모델 이해하기" icon="🧭" href="/education/philosophy" meta="철학 → 커리큘럼 → 검증된 패턴">
    8년의 설계를 철학부터 커리큘럼 구현까지, 추상에서 구체로 따라갑니다.
  </Card>
  <Card title="직접 만들기" icon="🚀" href="/education/start" meta="이번 주 가장 작은 변화 1개">
    스스로 자라는 환경을, 당신의 자리에서 오늘 할 수 있는 작은 행동부터 시작합니다.
  </Card>
</CardGrid>

## 전체 지도

위에서 아래로 갈수록 추상에서 구체로 — 철학과 커리큘럼에서 출발해, 검증된 패턴을 거쳐, 오늘의 실험까지 이어집니다.

<CardGrid variant="list">
  <Card title="교육 철학" icon="🎯" href="/education/philosophy" variant="row">
    왜 이런 방식으로 가르치는가
  </Card>
  <Card title="커리큘럼" icon="🗺️" href="/education/curriculum" variant="row">
    철학을 10개월 과정으로 구조화한 설계
  </Card>
  <Card title="검증된 패턴" icon="⬆️" href="/education/insights" variant="row">
    반복되는 교육 문제와, 여러 실험에서 검증된 해결 패턴
  </Card>
  <Card title="실험 로그" icon="⬆️" href="/education/logs" variant="row">
    교육 현장에서 시도한 실험의 원본 기록과 파생 자산
  </Card>
</CardGrid>

`⬆️` 아이콘이 붙은 항목은 승격 파이프라인의 출발점입니다. 실험 로그에서 반복 패턴이 발견되면 검증된 패턴으로, 검증된 패턴이 실전 절차로 정제되면 검증된 도구로 묶입니다. 패턴과 도구가 더 일반화되면 커리큘럼과 교육 철학으로 올라갑니다. 승격 과정의 세부는 [연구 사이클 워크플로우](/education/tools/research-cycle-workflow)에서 확인할 수 있습니다.
````

> 기존 4카드 리스트와 "승격 파이프라인" 설명은 "전체 지도"로 압축 보존한다(서사 톤만 다듬음). 두 문 카드가 히어로, 지도는 보조다.

- [ ] **Step 2: lint:tone + 빌드**

Run: `npm run lint:tone && npm run build 2>&1 | tail -20`
Expected: 합니다체 위반 0건, 빌드 성공.

- [ ] **Step 3: 커밋**

```bash
git add content/education/index.mdx
git commit -m "feat(education): 개요를 두 문(이해하기·만들기) 랜딩으로 재작성"
```

---

## Task 4: 타임라인 항목 추가 (`updates.ts`)

**Files:**
- Modify: `content/updates.ts:10` (배열 시작 직후)

- [ ] **Step 1: `const updates: Update[] = [` 바로 다음 줄에 항목 삽입**

```ts
  {
    date: '2026년 연구',
    title: '시작하기 페이지 신설 + 교육 IA를 두 모드(이해·만들기)로 재편',
    description:
      '"이해하기"와 "직접 만들기" 두 독자 모드를 개요의 두 문과 사이드바 그룹으로 명시화하고, 만들기 모드의 입구로 "이번 주 가장 작은 변화 1개"를 주는 시작하기 페이지를 추가했다.',
    href: '/education/start',
    status: 'active',
  },
```

> `description`은 데이터 문자열이라 합니다체 규칙(본문 산문) 대상이 아니다. 기존 항목들의 한다체 종결과 결을 맞춘다.

- [ ] **Step 2: 타입·빌드 확인**

Run: `npm run build 2>&1 | tail -20`
Expected: 빌드 성공(타입 에러 없음), 랜딩 타임라인 최상단에 새 항목 반영.

- [ ] **Step 3: 커밋**

```bash
git add content/updates.ts
git commit -m "docs(updates): 시작하기 페이지 신설 타임라인 항목 추가"
```

---

## Task 5: 통합 검증

- [ ] **Step 1: 전체 빌드 + llms-txt/search-index 생성·검증**

Run: `npm run build 2>&1 | tail -40`
Expected: `next build` + `postbuild`(build:llms-txt → check:llms-txt → build:search-index → check:search-index) 전부 PASS.

- [ ] **Step 2: 합니다체 최종 점검**

Run: `npm run lint:tone`
Expected: 신규/수정 본문 위반 0건.

- [ ] **Step 3: 내부 링크 실재 최종 확인**

Run:
```bash
for s in insights/self-diagnostic-framework insights/poe-discovery-learning insights/argumentation-based-learning insights/progressive-scaffolding logs/feedback-refactoring tools/retrospective-format-kit tools/mission-repo-analysis-workflow logs/react-payments-555prs-analysis philosophy curriculum insights tools; do
  test -e "content/education/$s.mdx" -o -e "content/education/$s/index.mdx" -o -d "content/education/$s" && echo "✅ $s" || echo "❌ $s";
done
```
Expected: 전부 ✅.

- [ ] **Step 4: 생성된 llms.txt에 시작하기 반영 확인**

Run: `grep -n "education/start" public/llms.txt`
Expected: 시작하기 항목이 카탈로그에 포함됨(없으면 빌드 산출 경로/슬러그 점검).

---

## Self-Review (작성자 체크)

- **스펙 커버리지:** start.mdx(§4) ✅ Task1 · 사이드바 그룹+tools(§3.1) ✅ Task2 · 개요 두 문(§3.2) ✅ Task3 · updates(§3.3) ✅ Task4 · 검증 체크리스트(§7) ✅ Task5.
- **스펙과의 의도적 차이(1건):** ② 직행 앵커를 페르소나별 4개 → "오늘의 작은 변화 1개" 섹션으로의 **단일 앵커(#today)**로 단순화. 사유: `Card`에 `id` prop이 없어 그리드 내 per-card 앵커가 취약. 페르소나 자기 식별은 ④의 라우팅 한 줄이 담당. (사용자 확인 사항)
- **Placeholder:** 없음(모든 파일 전체 내용·정확한 명령 포함).
- **타입 일관성:** `Callout type="tip"`, `Toggle title`, `CardGrid columns={2}|variant="list"`, `Card variant="row"` 모두 실제 시그니처와 일치. href 없는 ④ 카드(중첩 링크 회피) 확인.
- **링크:** 9개 슬러그 전부 2026-06-16 파일시스템 존재 확인됨.

---

## 비범위

홈·탑내비 변경 / 페르소나 하위 페이지 / `tools/index.mdx` 목록 보강 / 로드맵 페이지.
