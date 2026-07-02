# 우테코 홈페이지 → 공식문서 통합 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** woowacourse.io(Oopy/노션)의 7개 페이지를 공식문서 사이트로 이전하고, 소개/지원 두 탭으로 분리한다.

**Architecture:** 루트 랜딩·기존 교육 문서는 그대로 두고, `content/about/`(소개)·`content/apply/`(지원) 두 그룹을 `type: 'page'`로 추가한다. 자주 바뀌는 모집·공지는 `content/recruiting.ts`·`content/notices.ts` 데이터 파일로 관리하고, 기존 `RecentUpdates`/`LogList` 패턴대로 컴포넌트가 렌더한다.

**Tech Stack:** Next.js 15 App Router, Nextra 4, MDX, TypeScript, CSS Modules.

## Global Constraints

- **본문 문체는 합니다체로 통일한다** (한다체·해요체 금지). 규약: `AGENTS.md` 6절. 영문 프로그램(히어로테크코스)은 원문 영어 유지.
- 새 폴더마다 `_meta.ts`를 둔다. `display: 'hidden'` 항목은 삭제 금지.
- 신규 컴포넌트는 `components/`에 두고 `mdx-components.tsx`에 import+매핑, `components/index.ts`에 export. CSS는 컴포넌트별 `*.module.css`.
- 인터랙션(상태/이벤트)이 있는 컴포넌트만 `'use client'`. 정적 표시는 서버 컴포넌트.
- 데이터 파일은 `content/`에 두고 타입 + `export default 배열|객체` 형태. 최신 항목을 배열 맨 위에.
- 외부 링크는 외부 유지: 카카오 상담(`https://pf.kakao.com/_budWj/chat`), 개인정보처리방침(`https://terms.baemin.com/content/WOOWACOURSE_644?shotList=true`), 지원 플랫폼(`https://apply.techcourse.co.kr/recruits`).
- **검증 방식(주의):** 이 저장소는 콘텐츠 사이트라 컴포넌트 단위 테스트 하네스가 없다. 검증은 (a) 타입체크 `npx tsc --noEmit`, (b) dev 렌더 `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3006/<path>` → 200, (c) 프로덕션 빌드 `npm run build`, (d) 문체 `npm run lint:tone` 로 한다. 새 테스트 프레임워크는 도입하지 않는다(YAGNI).
- **브랜치 주의:** `content/` 편집이 main에 자동 커밋되는 메커니즘이 있다는 운영 메모가 있다. 각 커밋 전후 `git branch --show-current`로 `feat/homepage-docs-consolidation` 유지를 확인한다.
- dev 서버는 이미 포트 3006에서 실행 중(핫 리로드). 렌더 검증은 이 서버로 한다.

---

## File Structure

신규/수정 파일과 책임:

- `content/_meta.ts` (수정) — 루트 상단 내비. `about`·`apply` 추가, 순서 지정.
- `content/about/_meta.ts` (생성) — 소개 탭 사이드바.
- `content/about/index.mdx` (생성) — 소개(우테코란).
- `content/about/curriculum.mdx` (생성) — 교육과정(5단계 커리큘럼과 문화).
- `content/about/faq.mdx` (생성) — FAQ.
- `content/about/hero.mdx` (생성) — 히어로테크코스(영문 프로그램).
- `content/apply/_meta.ts` (생성) — 지원 탭 사이드바.
- `content/apply/index.mdx` (생성) — 지원하기. `RecruitingStatus`+`RecruitingSchedule` 렌더.
- `content/apply/notices.mdx` (생성) — 공지사항. `NoticeList` 렌더.
- `content/apply/contact.mdx` (생성) — 문의하기.
- `content/recruiting.ts` (생성) — 현재 기수 모집 데이터(단일 진실 원천).
- `content/notices.ts` (생성) — 공지 배열.
- `components/RecruitingStatus.tsx` + `.module.css` (생성) — 모집 상태 배지 + 지원 CTA.
- `components/RecruitingSchedule.tsx` + `.module.css` (생성) — 선발 일정(Timeline) + 미리 생각해 볼 질문.
- `components/NoticeList.tsx` + `.module.css` (생성) — 공지 목록.
- `components/RecruitingBanner.tsx` (생성, 선택) — 홈 상단, `모집중`일 때만 노출.
- `mdx-components.tsx` (수정) — 신규 컴포넌트 등록.
- `components/index.ts` (수정) — 신규 컴포넌트 export.
- `content/updates.ts` (수정) — 통합 항목 1개 추가.

---

## Task 1: IA 스캐폴딩 — 소개/지원 탭 + 내비

**Files:**
- Modify: `content/_meta.ts`
- Create: `content/about/_meta.ts`, `content/about/index.mdx`
- Create: `content/apply/_meta.ts`, `content/apply/index.mdx`

**Interfaces:**
- Produces: 라우트 `/about`, `/apply`와 상단 내비 탭 `소개`·`지원`. 후속 태스크가 이 폴더에 페이지를 채운다.

- [ ] **Step 1: 루트 `content/_meta.ts`에 about·apply 추가 (순서: 홈│소개│지원│교육│문서가 만들어지는 법)**

`content/_meta.ts` 전체를 아래로 교체:

```ts
export default {
  index: {
    title: '홈',
    type: 'page',
    display: 'hidden',
    theme: {
      sidebar: false,
      toc: false,
      breadcrumb: false,
      pagination: false,
      copyPage: false,
      timestamp: false,
      typesetting: 'article'
    }
  },
  about: {
    title: '소개',
    type: 'page'
  },
  apply: {
    title: '지원',
    type: 'page'
  },
  education: {
    title: '교육',
    type: 'page'
  },
  'how-its-made': {
    title: '문서가 만들어지는 법',
    type: 'page'
  },
  timeline: {
    title: '타임라인',
    display: 'hidden'
  },
  'education-experiment': {
    title: 'Education Experiment',
    display: 'hidden'
  }
}
```

- [ ] **Step 2: `content/about/_meta.ts` 생성**

```ts
export default {
  index: '소개',
  curriculum: '교육과정',
  faq: 'FAQ',
  hero: '히어로테크코스'
}
```

- [ ] **Step 3: `content/apply/_meta.ts` 생성**

```ts
export default {
  index: '지원하기',
  notices: '공지사항',
  contact: '문의하기'
}
```

- [ ] **Step 4: 스텁 `content/about/index.mdx` 생성**

```mdx
# 우아한테크코스 소개

(이전 예정 — about/index)
```

- [ ] **Step 5: 스텁 `content/apply/index.mdx` 생성**

```mdx
# 지원하기

(이전 예정 — apply/index)
```

- [ ] **Step 6: 렌더 검증**

```bash
for p in about apply; do curl -s -o /dev/null -w "$p: %{http_code}\n" http://localhost:3006/$p; done
```
Expected: `about: 200`, `apply: 200`. 브라우저에서 상단 내비에 `소개`·`지원` 탭이 보인다.

- [ ] **Step 7: 커밋**

```bash
git branch --show-current   # feat/homepage-docs-consolidation 확인
git add content/_meta.ts content/about content/apply
git commit -m "feat(consolidation): 소개/지원 탭 IA 스캐폴딩"
```

---

## Task 2: 동적 데이터 모델 — recruiting.ts + notices.ts

**Files:**
- Create: `content/recruiting.ts`, `content/notices.ts`

**Interfaces:**
- Produces:
  - `content/recruiting.ts` → `export default` `Recruiting` 객체. 타입: `RecruitingStatus = '모집중'|'모집예정'|'마감'`, `RecruitingSchedule = { phase: string; period: string; note?: string }`, `Recruiting = { cohort: string; year: number; status: RecruitingStatus; applyUrl?: string; infoSessionUrl?: string; schedule: RecruitingSchedule[]; questions: string[] }`.
  - `content/notices.ts` → `export default Notice[]`. 타입: `Notice = { date: string; title: string; href?: string; body?: string }`.
- Task 3 컴포넌트가 이 default export들을 import한다.

- [ ] **Step 1: 실제 모집 데이터 캡처**

`https://www.woowacourse.io/apply`를 Playwright로 다시 떠서 "선발 일정" 단계·기간과 "미리 생각해 볼 질문" 전문을 확보한다(설명회 영상: `https://www.youtube.com/watch?v=cv01__jxppU`, 지원 플랫폼: `https://apply.techcourse.co.kr/recruits`). 캡처값을 Step 2 시드에 채운다.

- [ ] **Step 2: `content/recruiting.ts` 생성**

```ts
export type RecruitingStatus = '모집중' | '모집예정' | '마감'

export interface RecruitingSchedule {
  /** 단계명 (예: '서류 접수') */
  phase: string
  /** 기간/날짜 문자열 */
  period: string
  /** 보조 설명 (선택) */
  note?: string
}

export interface Recruiting {
  /** 기수 (예: '8기') */
  cohort: string
  /** 모집 연도 */
  year: number
  status: RecruitingStatus
  /** 지원 폼 URL */
  applyUrl?: string
  /** 입학 설명회 영상 URL */
  infoSessionUrl?: string
  schedule: RecruitingSchedule[]
  /** 미리 생각해 볼 질문 */
  questions: string[]
}

// 다음 기수 모집은 이 파일만 수정하면 된다.
const recruiting: Recruiting = {
  cohort: '8기',
  year: 2026,
  status: '마감', // Step 1 캡처 기준 실제 상태로 설정
  applyUrl: 'https://apply.techcourse.co.kr/recruits',
  infoSessionUrl: 'https://www.youtube.com/watch?v=cv01__jxppU',
  schedule: [
    // Step 1에서 캡처한 단계·기간으로 채운다. 예시 형태:
    // { phase: '서류 접수', period: '2025.11.xx ~ 11.xx' },
  ],
  questions: [
    // Step 1에서 캡처한 질문 전문으로 채운다.
  ]
}

export default recruiting
```

- [ ] **Step 3: `content/notices.ts` 생성 (캡처한 공지 이력 시드)**

```ts
export interface Notice {
  /** 표시·정렬용 날짜 또는 연도 문자열 (예: '2025') */
  date: string
  title: string
  /** 외부/상세 링크 (선택) */
  href?: string
  /** 본문 직접 노출 시 (선택) */
  body?: string
}

// 최신 항목을 맨 위에. href 없으면 제목만 표시.
const notices: Notice[] = [
  { date: '2025', title: '우아한테크코스 2025 리크루팅데이 참여 기업 모집' },
  { date: '2025', title: '우아한테크코스 2025 입학설명회' },
  { date: '2024', title: '우아한테크코스 2024 신입생 서류접수 오픈' },
  { date: '2024', title: '우아한테크코스 2024 입학설명회' },
  { date: '2023', title: '우아한테크코스 2023 리크루팅데이 참여 기업 모집' }
]

export default notices
```

> 비고: 원본 공지 본문은 노션 서브페이지에 있다. 노션 폐기 방침이므로 핵심 공지는 후속으로 `body` 전사 또는 적절한 외부 링크로 보강한다. 이번엔 제목·연도 시드로 목록을 살린다.

- [ ] **Step 4: 타입체크**

```bash
npx tsc --noEmit
```
Expected: recruiting.ts/notices.ts 관련 오류 없음.

- [ ] **Step 5: 커밋**

```bash
git branch --show-current
git add content/recruiting.ts content/notices.ts
git commit -m "feat(consolidation): 모집·공지 데이터 모델(recruiting.ts, notices.ts)"
```

---

## Task 3: 컴포넌트 — RecruitingStatus / RecruitingSchedule / NoticeList

**Files:**
- Create: `components/RecruitingStatus.tsx`, `components/RecruitingStatus.module.css`
- Create: `components/RecruitingSchedule.tsx`, `components/RecruitingSchedule.module.css`
- Create: `components/NoticeList.tsx`, `components/NoticeList.module.css`
- Modify: `mdx-components.tsx`, `components/index.ts`

**Interfaces:**
- Consumes: `content/recruiting.ts`(default), `content/notices.ts`(default), `components/Timeline.tsx`의 `Timeline`/`TimelineItem`.
- Produces: MDX에서 쓰는 `<RecruitingStatus />`, `<RecruitingSchedule />`, `<NoticeList />`.

- [ ] **Step 1: `components/RecruitingStatus.tsx` 생성 (서버 컴포넌트)**

```tsx
import recruiting from '../content/recruiting'
import styles from './RecruitingStatus.module.css'

export function RecruitingStatus() {
  const { cohort, year, status, applyUrl } = recruiting
  const isOpen = status === '모집중'

  return (
    <div className={styles.box} data-status={status}>
      <span className={styles.badge}>{status}</span>
      <span className={styles.label}>
        {year} 신입생 ({cohort})
      </span>
      {isOpen && applyUrl && (
        <a
          className={styles.cta}
          href={applyUrl}
          target="_blank"
          rel="noreferrer"
        >
          지원하기 →
        </a>
      )}
    </div>
  )
}
```

- [ ] **Step 2: `components/RecruitingStatus.module.css` 생성**

```css
.box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--nextra-border, #e5e7eb);
  border-radius: 0.6rem;
  margin: 1rem 0;
}
.badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
}
.box[data-status='모집중'] .badge {
  background: #dcfce7;
  color: #166534;
}
.box[data-status='모집예정'] .badge {
  background: #fef9c3;
  color: #854d0e;
}
.label {
  font-weight: 600;
}
.cta {
  margin-left: auto;
  font-weight: 600;
  text-decoration: none;
}
```

- [ ] **Step 3: `components/RecruitingSchedule.tsx` 생성 (Timeline 재사용)**

```tsx
import recruiting from '../content/recruiting'
import { Timeline, TimelineItem } from './Timeline'
import styles from './RecruitingSchedule.module.css'

export function RecruitingSchedule() {
  const { year, cohort, schedule, questions, infoSessionUrl } = recruiting

  return (
    <div className={styles.wrap}>
      <Timeline label={`${year} 신입생 (${cohort}) 선발 일정`}>
        {schedule.map((s) => (
          <TimelineItem key={s.phase} date={s.period} title={s.phase}>
            {s.note}
          </TimelineItem>
        ))}
      </Timeline>

      {infoSessionUrl && (
        <p className={styles.info}>
          <a href={infoSessionUrl} target="_blank" rel="noreferrer">
            입학 설명회 라이브 영상 →
          </a>
        </p>
      )}

      {questions.length > 0 && (
        <div className={styles.questions}>
          <h3>미리 생각해 볼 질문</h3>
          <ul>
            {questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: `components/RecruitingSchedule.module.css` 생성**

```css
.wrap {
  margin: 1.5rem 0;
}
.info {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
}
.questions {
  margin-top: 1.5rem;
}
.questions ul {
  margin: 0.5rem 0 0;
  padding-left: 1.2rem;
}
.questions li {
  margin: 0.35rem 0;
}
```

- [ ] **Step 5: `components/NoticeList.tsx` 생성 (서버 컴포넌트)**

```tsx
import notices from '../content/notices'
import styles from './NoticeList.module.css'

export function NoticeList() {
  const items = [...notices].sort((a, b) => b.date.localeCompare(a.date))

  if (items.length === 0) {
    return <p className={styles.empty}>등록된 공지가 없습니다.</p>
  }

  return (
    <ul className={styles.list}>
      {items.map((n) => (
        <li key={n.title} className={styles.item}>
          <span className={styles.date}>{n.date}</span>
          <div className={styles.body}>
            {n.href ? (
              <a className={styles.title} href={n.href}>
                {n.title}
              </a>
            ) : (
              <span className={styles.title}>{n.title}</span>
            )}
            {n.body && <p className={styles.desc}>{n.body}</p>}
          </div>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 6: `components/NoticeList.module.css` 생성**

```css
.list {
  list-style: none;
  margin: 1rem 0;
  padding: 0;
}
.item {
  display: flex;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--nextra-border, #e5e7eb);
}
.date {
  flex: 0 0 4rem;
  color: #64748b;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}
.title {
  font-weight: 600;
  text-decoration: none;
}
.desc {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: #475569;
}
.empty {
  color: #64748b;
}
```

- [ ] **Step 7: `mdx-components.tsx`에 등록**

import 블록(기존 import들 아래)에 추가:

```tsx
import { RecruitingStatus } from './components/RecruitingStatus'
import { RecruitingSchedule } from './components/RecruitingSchedule'
import { NoticeList } from './components/NoticeList'
```

return 객체에 추가(`...components` 위):

```tsx
    RecruitingStatus,
    RecruitingSchedule,
    NoticeList,
```

- [ ] **Step 8: `components/index.ts`에 export 추가**

```ts
export { RecruitingStatus } from './RecruitingStatus'
export { RecruitingSchedule } from './RecruitingSchedule'
export { NoticeList } from './NoticeList'
```

- [ ] **Step 9: 타입체크**

```bash
npx tsc --noEmit
```
Expected: 오류 없음.

- [ ] **Step 10: 커밋**

```bash
git branch --show-current
git add components/RecruitingStatus.* components/RecruitingSchedule.* components/NoticeList.* mdx-components.tsx components/index.ts
git commit -m "feat(consolidation): 모집·공지 렌더 컴포넌트"
```

---

## Task 4: 지원 탭 콘텐츠 — apply/index · notices · contact

**Files:**
- Modify: `content/apply/index.mdx`
- Create: `content/apply/notices.mdx`, `content/apply/contact.mdx`

**Interfaces:**
- Consumes: `<RecruitingStatus />`, `<RecruitingSchedule />`, `<NoticeList />` (Task 3).

- [ ] **Step 1: `content/apply/index.mdx` 교체 (스텁 → 실제)**

```mdx
# 지원하기

<RecruitingStatus />

우아한테크코스는 소프트웨어 생태계에 선한 영향력을 만드는 개발자를 찾습니다. 아래 일정을 확인하고 지원해 주세요.

<RecruitingSchedule />

> 지원 및 선발에 대한 자세한 내용은 [FAQ](/about/faq)를 확인해 주세요.
```

- [ ] **Step 2: `content/apply/notices.mdx` 생성**

```mdx
# 공지사항

우아한테크코스의 모집·행사 공지입니다.

<NoticeList />
```

- [ ] **Step 3: `content/apply/contact.mdx` 생성 (캡처한 /contact 구조 전사, 합니다체)**

`https://www.woowacourse.io/contact` 구조: 주소(판교 캠퍼스) / 문의(개인 문의 → 카카오, 기업 문의) / 개인정보 처리방침. 실제 주소·연락 정보는 라이브에서 전사한다.

```mdx
# 문의하기

## 주소

### 판교 캠퍼스

(라이브 /contact 에서 주소 전사)

## 문의

### 개인 문의

지원·교육 관련 문의는 카카오 채널로 연락해 주세요.

[카카오 채널 상담하기 →](https://pf.kakao.com/_budWj/chat)

### 기업 문의

(라이브 /contact 에서 기업 문의 연락처 전사)

## 개인정보 처리방침

[우아한테크코스 개인정보 처리방침 →](https://terms.baemin.com/content/WOOWACOURSE_644?shotList=true)
```

- [ ] **Step 4: 렌더 검증**

```bash
for p in apply apply/notices apply/contact; do curl -s -o /dev/null -w "$p: %{http_code}\n" http://localhost:3006/$p; done
```
Expected: 모두 200. 브라우저에서 모집 상태 배지·선발 일정 Timeline·공지 목록이 보인다.

- [ ] **Step 5: 문체 점검 + 커밋**

```bash
npm run lint:tone
git branch --show-current
git add content/apply
git commit -m "feat(consolidation): 지원 탭 콘텐츠(지원하기·공지사항·문의하기) 이전"
```

---

## Task 5: 소개 탭 콘텐츠 — about/index · curriculum · faq · hero

**Files:**
- Modify: `content/about/index.mdx`
- Create: `content/about/curriculum.mdx`, `content/about/faq.mdx`, `content/about/hero.mdx`

**Interfaces:**
- Consumes: `Card`/`CardGrid`(핵심 교육방식·대상자 그리드), `Toggle`(FAQ), `Callout`(상호 링크).

- [ ] **Step 1: `content/about/index.mdx` 교체 — /intro 전사 (합니다체)**

`https://www.woowacourse.io/intro` 구조: 미션("소프트웨어 생태계에 선한 영향력을") / 핵심 교육방식 3(미션기반의 코드 리뷰 중심·소통과 협업 위주 학습·현장 중심 교육) / 교육 대상자 3(몰입·프로그래밍·현장) / 캡틴의 메시지(포비·제이슨). 본문은 라이브에서 전사한다.

```mdx
# 우아한테크코스 소개

## 소프트웨어 생태계에 선한 영향력을

(라이브 /intro 미션 문단 전사)

## 핵심 교육방식

<CardGrid>
  <Card title="미션기반의 코드 리뷰 중심">(전사)</Card>
  <Card title="소통과 협업 위주 학습">(전사)</Card>
  <Card title="현장 중심 교육">(전사)</Card>
</CardGrid>

## 교육 대상자

<CardGrid>
  <Card title="몰입">(전사)</Card>
  <Card title="프로그래밍">(전사)</Card>
  <Card title="현장">(전사)</Card>
</CardGrid>

## 캡틴의 메시지

### 캡틴 포비입니다

(전사)

### 캡틴 제이슨입니다

(전사)
```

> Card/CardGrid 사용 전 `components/Card.tsx`로 props(title 등) 확인 후 맞춘다.

- [ ] **Step 2: `content/about/curriculum.mdx` 생성 — /curriculum 전사 + 상호 링크**

`https://www.woowacourse.io/curriculum` 구조: "5단계의 커리큘럼과 문화" / 교육 분야별 커리큘럼 / 공통 교육. 본문은 라이브에서 전사한다.

```mdx
# 교육과정

## 5단계의 커리큘럼과 문화

(라이브 /curriculum 전사)

<Callout type="info">
커리큘럼을 **어떻게 설계했는지** 그 원리가 궁금하다면 [교육 › 커리큘럼](/education/curriculum)을 확인해 주세요.
</Callout>
```

- [ ] **Step 3: `content/about/faq.mdx` 생성 — /faq 전사 (Toggle 사용)**

`https://www.woowacourse.io/faq` 구조: 3분류(지원 및 선발 / 교육 프로그램 / 기타), 각 분류에 Q&A. 각 Q를 `<Toggle title="질문">답변</Toggle>`로. 본문은 라이브에서 전사한다.

```mdx
# 자주 묻는 질문 (FAQ)

## 지원 및 선발

<Toggle title="(질문 전사)">
(답변 전사)
</Toggle>

## 교육 프로그램

<Toggle title="(질문 전사)">
(답변 전사)
</Toggle>

## 기타

<Toggle title="(질문 전사)">
(답변 전사)
</Toggle>
```

- [ ] **Step 4: `content/about/hero.mdx` 생성 — /hero 전사 (영문 원문 유지)**

`https://www.woowacourse.io/hero`(Hero Tech Course, Berlin/Delivery Hero)는 영문 프로그램이므로 **원문 영어 유지**(합니다체 규약 예외). 구조: Introducing / About / Learning Objectives & Curriculum / After Completion / We're Looking For / Eligibility / Application Process / Training Period & Location. 영상·링크(`https://youtu.be/tweV95l39tA`, `https://youtu.be/JTUIOC2QmR0`, `https://apply.techcourse.co.kr/recruits`, 베를린 오피스 지도)는 그대로 옮긴다. 본문은 라이브에서 전사한다.

```mdx
# Hero Tech Course: Berlin Edition

(라이브 /hero 전체 전사 — 영문 원문 유지, 위 섹션 구조대로)
```

- [ ] **Step 5: 렌더 검증**

```bash
for p in about about/curriculum about/faq about/hero; do curl -s -o /dev/null -w "$p: %{http_code}\n" http://localhost:3006/$p; done
```
Expected: 모두 200. 브라우저에서 그리드·토글·상호 링크가 보인다.

- [ ] **Step 6: 문체 점검 + 커밋**

```bash
npm run lint:tone
git branch --show-current
git add content/about
git commit -m "feat(consolidation): 소개 탭 콘텐츠(소개·교육과정·FAQ·히어로테크코스) 이전"
```

---

## Task 6: 통합 마무리 — updates 항목 · (선택) 홈 배너 · 빌드

**Files:**
- Modify: `content/updates.ts`
- Create(선택): `components/RecruitingBanner.tsx`; Modify(선택): `content/index.mdx`, `mdx-components.tsx`

**Interfaces:**
- Consumes: `RecruitingStatus`(배너 재사용).

- [ ] **Step 1: `content/updates.ts` 맨 위에 통합 항목 추가**

`const updates: Update[] = [` 바로 다음에:

```ts
  {
    date: '2026년 연구',
    title: '우테코 홈페이지를 공식문서로 통합',
    description:
      'woowacourse.io(노션/Oopy)의 소개·교육과정·지원·공지·FAQ·문의·히어로테크코스를 공식문서로 옮겼습니다. 소개/지원 두 탭으로 나누고, 모집·공지는 데이터 파일(recruiting.ts·notices.ts)로 관리해 다음 기수 갱신을 한 파일 수정으로 끝냅니다.',
    href: '/about',
    status: 'active'
  },
```

- [ ] **Step 2: (선택) `components/RecruitingBanner.tsx` 생성 — 모집중일 때만 홈 상단 노출**

```tsx
import recruiting from '../content/recruiting'
import { RecruitingStatus } from './RecruitingStatus'

export function RecruitingBanner() {
  if (recruiting.status !== '모집중') return null
  return <RecruitingStatus />
}
```

등록: `mdx-components.tsx`에 `import { RecruitingBanner } from './components/RecruitingBanner'` + 매핑 추가. `content/index.mdx`의 `<Hero ... />` 바로 아래에 `<RecruitingBanner />` 추가.

> 현재 `status: '마감'`이면 아무것도 렌더되지 않으므로 홈 화면은 그대로다. 모집 시즌에 `recruiting.ts`만 `'모집중'`으로 바꾸면 배너가 켜진다.

- [ ] **Step 3: 프로덕션 빌드 검증**

```bash
npm run build
```
Expected: 빌드 성공. `postbuild`의 llms-txt/search-index 생성·검증 통과(새 페이지가 llms.txt에 자동 반영).

- [ ] **Step 4: 문체 점검**

```bash
npm run lint:tone
```
Expected: 위반 0 (히어로 영문 페이지 예외 확인).

- [ ] **Step 5: 커밋**

```bash
git branch --show-current
git add content/updates.ts content/index.mdx components/RecruitingBanner.tsx mdx-components.tsx
git commit -m "feat(consolidation): 통합 업데이트 타임라인 + 모집 배너(조건부)"
```

---

## Self-Review (작성자 점검 결과)

**1. Spec coverage:** 스펙의 콘텐츠 인벤토리 7개 페이지 → Task 4(지원 3) + Task 5(소개 4)로 전부 매핑됨. IA(소개/지원 탭) → Task 1. 동적 데이터 모델 → Task 2. 컴포넌트 → Task 3. updates.ts/llms.txt/문체 → Task 6/Global. 도메인·Oopy 폐기는 스펙상 범위 밖 → 계획에서도 제외(일치). 누락 없음.

**2. Placeholder scan:** 인프라(스캐폴딩·데이터·컴포넌트) 태스크는 완전한 코드 포함. 콘텐츠 태스크의 "(전사)"는 외부 라이브 소스(woowacourse.io)에서 옮겨오는 마케팅 본문으로, URL·섹션 구조·사용 컴포넌트·문체 규약을 명시함 — 발명할 수 없는 1차 콘텐츠이므로 실행 시 전사가 올바른 방식.

**3. Type consistency:** `recruiting.ts` 타입(`RecruitingStatus`/`RecruitingSchedule`/`Recruiting`)을 Task 3의 `RecruitingStatus`/`RecruitingSchedule` 컴포넌트가 동일 필드명(`cohort`,`year`,`status`,`applyUrl`,`infoSessionUrl`,`schedule[].phase/period/note`,`questions`)으로 소비. `Notice` 타입(`date`,`title`,`href?`,`body?`)을 `NoticeList`가 동일 필드명으로 소비. `Timeline`/`TimelineItem` props(`label`,`date`,`title`,`children`)는 기존 정의와 일치. 불일치 없음.
