# 우테코 홈페이지 → 공식문서 통합 설계

- **작성일:** 2026-06-24
- **브랜치:** `feat/homepage-docs-consolidation`
- **상태:** 승인됨 (구현 계획 단계로 진행)

## 배경 / 문제

우아한테크코스는 현재 **두 개의 공개 웹 자산**을 운영한다.

| | woowacourse.io (홈페이지) | 공식문서 (이 저장소) |
|---|---|---|
| 정체 | **Oopy + 노션** 발행 사이트 (코드베이스 아님) | Nextra 4 + Next.js App Router, MDX in git |
| 내용 | 모집·소개·핵심가치·카카오 상담 | 교육 철학·커리큘럼 설계·검증된 패턴·실험 로그 |
| 대상 | 지원 희망자 (마케팅/모집) | 방법론에 관심 있는 일반/교육자 |
| 편집 | 운영진이 노션에서 편집 | 개발자·Claude가 PR로 편집 |

두 사이트가 따로 있어 방문자가 혼란스럽다. 이를 **공식문서 사이트 하나로 합쳐** 단일 공개 웹 자산으로 만든다.

> 참고: `woowacourse/woowacourse.github.io`(정적 HTML, 2023 이후 미사용)는 레거시이며 대상이 아니다. 현재 라이브 woowacourse.io는 Oopy/노션 기반이다.

## 결정 사항 (확정)

1. **통합 범위:** 홈페이지의 모집·소개·FAQ 등 **전부를 저장소(git)로 이전**한다. 노션/Oopy 의존을 제거한다.
2. **루트 랜딩 유지:** 현재 공식문서 루트 랜딩(`Hero` / `CrewJourney` / `CrewVoices` / `EnterDocs` / `BookNote`)은 **그대로 둔다.** 사이트의 1차 정체성("선한 영향력 — 방법론 공유")을 유지하고, 그 위에 모집/소개 콘텐츠를 받을 구조를 새로 만든다.
3. **배치(IA):** 상단 내비를 **소개 / 지원 두 탭으로 분리**한다 (안 1 채택). 안정 콘텐츠와 동적 모집 퍼널을 편집 주기·주체대로 분리한다.
4. **동적 콘텐츠:** 모집 일정·공지처럼 자주 바뀌는 콘텐츠는 이 저장소의 기존 컨벤션(`logs.ts`→`LogList`, `updates.ts`→`RecentUpdates`)과 동일하게 **구조화 데이터 파일**(`recruiting.ts`, `notices.ts`)로 관리한다. 노션이 아니라 git 안에 있으므로 "전부 git" 원칙을 지키면서 갱신은 한 파일 수정으로 끝난다.
5. **도메인:** 컷오버(woowacourse.io 연결)·Oopy 폐기는 **이번 작업 범위 밖**(운영/인프라 결정, 미정). 콘텐츠·구조 설계에만 집중한다.

## 콘텐츠 인벤토리 (이전 대상)

woowacourse.io 네비게이션 기준.

| 홈페이지 페이지 | 성격 | 갱신 주기 | 이전 위치 |
|---|---|---|---|
| 소개 `/intro` | 우테코란 무엇인가 | 안정 | `content/about/index.mdx` |
| 교육과정 `/curriculum` (5단계 커리큘럼과 문화) | 지원자용 커리큘럼 개요 | 안정 | `content/about/curriculum.mdx` |
| FAQ `/faq` | 자주 묻는 질문 | 안정 | `content/about/faq.mdx` |
| 히어로테크코스 `/hero` | 별도 프로그램 | 안정 | `content/about/hero.mdx` |
| 지원하기 `/apply` (8기/2026 모집·선발일정·설명회·미리 생각해 볼 질문) | **모집 퍼널** | **기수마다** | `content/apply/index.mdx` + `recruiting.ts` |
| 공지사항 `/notice` | 공지 | **수시** | `content/apply/notices.mdx` + `notices.ts` |
| 문의하기 `/contact` | 카카오 상담 등 | 안정 | `content/apply/contact.mdx` |

외부 유지: 카카오 상담 채널(`pf.kakao.com/_budWj/chat`), 개인정보처리방침(`terms.baemin.com/.../WOOWACOURSE_644`).

## 정보구조 (목표)

```
상단 내비:  홈 │ 소개 │ 지원 │ 교육 │ 문서가 만들어지는 법

홈        루트 랜딩 (현행 유지) — content/index.mdx
소개      content/about/   (type: 'page')
          ├─ index.mdx      소개 (우테코란)
          ├─ curriculum.mdx 교육과정 (5단계 커리큘럼과 문화)
          ├─ faq.mdx        FAQ
          └─ hero.mdx       히어로테크코스
지원      content/apply/   (type: 'page')
          ├─ index.mdx      지원하기   ← recruiting.ts 렌더
          ├─ notices.mdx    공지사항   ← notices.ts 렌더
          └─ contact.mdx    문의하기
교육      content/education/        (현행 — 손대지 않음)
문서가…   content/how-its-made.mdx  (현행 — 손대지 않음)
```

- 루트 `content/_meta.ts`에 `about`(title: '소개', type: 'page'), `apply`(title: '지원', type: 'page') 추가. 표시 순서: index, about, apply, education, how-its-made, (이하 hidden).
- 각 신규 폴더에 `_meta.ts` 추가.

## 동적 콘텐츠 데이터 모델

### `content/recruiting.ts`
현재 기수 모집 정보를 담는 단일 진실 원천.

```ts
export type RecruitingStatus = '모집중' | '모집예정' | '마감'
export interface RecruitingSchedule { phase: string; period: string; note?: string }
export interface Recruiting {
  cohort: string          // 예: '8기'
  year: number            // 예: 2026
  status: RecruitingStatus
  applyUrl?: string       // 지원 폼
  infoSessionUrl?: string // 입학 설명회 영상
  schedule: RecruitingSchedule[]
  questions: string[]     // "미리 생각해 볼 질문"
}
```
→ `apply/index.mdx`가 `RecruitingStatus` 배지 + 지원 버튼 + `Timeline`(선발 일정) + 질문 목록을 렌더.

### `content/notices.ts`
```ts
export interface Notice { date: string; title: string; body?: string; href?: string }
```
→ `notices.mdx`가 `NoticeList`로 최신순 렌더.

## 컴포넌트

기존 재사용 우선. 신규는 최소화.

| 용도 | 컴포넌트 | 신규? |
|---|---|---|
| 선발 일정 | `Timeline` / `TimelineItem` | 기존 |
| FAQ 아코디언 | `Toggle` | 기존 |
| 모집 상태 배지 + 지원 CTA | `RecruitingStatus` | **신규** |
| 공지 목록 | `NoticeList` | **신규** |
| 홈 모집 배너 (status==='모집중'일 때만 노출) | `RecruitingBanner` | **신규(선택)** |

신규 컴포넌트는 기존 컴포넌트 디렉터리 규약·스타일(CSS module)을 따른다.

## 콘텐츠 매핑 & 중복 처리

- 홈페이지 `/curriculum`(지원자용 "5단계 커리큘럼과 문화") ↔ 공식문서 `교육 > 커리큘럼`(설계 원리)은 **층위가 다르다.** 둘 다 유지하고, `about/curriculum.mdx`에서 "설계 원리가 궁금하면 → 교육 > 커리큘럼"으로 **상호 링크**한다.
- 각 페이지의 실제 본문은 구현 단계에서 Playwright로 페이지별 렌더링을 떠서 MDX로 옮긴다(현재 8기/2026 내용을 시드로). 본문 문체는 AGENTS.md 규약(합니다체)을 따른다.

## 진입점 & 필수 갱신

- 루트 랜딩 유지 + 상단 내비 `지원` 탭으로 모집 퍼널 진입 보장. (선택) `RecruitingBanner`로 `모집중`일 때 루트 상단에 노출.
- CLAUDE.md 규약 준수: 신규 폴더마다 `_meta.ts` 추가, `content/updates.ts`에 통합 항목 추가. `public/llms.txt`는 빌드 시 자동 생성.

## 범위 밖

- 도메인 컷오버(woowacourse.io DNS/배포 연결), Oopy/노션 폐기·리다이렉트.
- 모집 콘텐츠의 매 기수 정확성(이번엔 현재 8기/2026을 시드로 이전).
- 외부 링크(카카오 채널, 개인정보처리방침)는 외부로 유지.

## 구현 단계 (개요 — 상세는 구현 계획에서)

1. IA 스캐폴딩: `about/`·`apply/` 폴더 + 각 `_meta.ts` + 루트 `_meta.ts` 갱신 (빈/플레이스홀더 페이지로 내비 먼저 살림).
2. 동적 데이터 모델: `recruiting.ts`·`notices.ts` + `RecruitingStatus`·`NoticeList`(+선택 `RecruitingBanner`) 컴포넌트.
3. 콘텐츠 이전: 페이지별 실제 본문을 Playwright로 추출해 MDX로 이전, 상호 링크 연결.
4. 마무리: `updates.ts` 항목 추가, 빌드/렌더 확인, 문체 점검.

## 성공 기준

- woowacourse.io의 7개 페이지 콘텐츠가 모두 공식문서 안에서 접근 가능하다(노션 의존 0).
- 다음 기수 모집 갱신이 `recruiting.ts` 한 파일 수정으로 가능하다.
- 루트 랜딩과 기존 교육 문서는 변형 없이 유지된다.
- 안정 콘텐츠(소개)와 동적 모집 퍼널(지원)이 내비에서 명확히 분리된다.
