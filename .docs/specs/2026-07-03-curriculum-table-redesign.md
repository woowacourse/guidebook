# 커리큘럼 페이지 개편 — 2026 테이블 + 과거 델타 연표

날짜: 2026-07-03 · 상태: 설계 승인됨

## 배경 / 문제

`/education/curriculum`의 `<CurriculumTimeline />`은 기수 스텝퍼(1~8기) → 패널(이 해의 핵심 + 트랙 토글 + 레벨 0~5) 구조다. 두 가지 문제:

1. **분량 착시** — UI가 "기수마다 풀 커리큘럼이 있다"는 인상을 주지만, 실제 데이터는 골격 1개(`LEVELS_BY_TRACK`, 현재 기준) + 기수별 core 2~3줄뿐. 8기수 × 4트랙 × 6레벨을 채울 데이터는 존재하지 않음(llm-wiki `curriculum-evolution.md`: 2021~24 sparse, BE·안드로이드 연도별 미수집).
2. **비교 불가** — 트랙 토글 뒤에 숨어 있어 4트랙 × 6레벨을 한눈에 비교할 수 없다.

## 결정 사항 (사용자 확정)

1. **구조**: 2026(현재 기수)만 4트랙 × 6레벨 풀 테이블. 1~7기는 헤드라인 + 델타 + 실험 링크의 압축 연표.
2. **실험 표시**: 올해의 핵심 실험을 테이블 셀 배지로 위치(트랙×레벨)까지 표시. 전 트랙 공통 실험은 해당 레벨 행 아래 가로 스팬 배지 줄.

## 설계

### 정보 구조

- **섹션 1 "지금의 커리큘럼 (2026 · 8기)"** — 4트랙 × 레벨 0~5 테이블. 셀 = 레벨 이름(굵게) + 한 줄 설명(작게). 배지: 페이먼츠 재설계 → FE×레벨2 셀 내부, AI 협업 미션 → 레벨1 행 아래 스팬 줄. 배지는 실험 로그로 링크. current 기수 "진행 중" 배지 유지.
- **섹션 2 "커리큘럼이 쌓여 온 길 (1~7기)"** — 최신순(7기→1기) 델타 연표. 기수당 헤드라인 + 델타 1~2줄 + 로그 링크. sparse 기수 "기록 보강 중" 칩 유지. "(임시)" 항목은 llm-wiki curriculum-evolution.md의 연도별 델타 실측 수치로 대체(FE 편향 한계는 표기).

### 데이터 모델 (`content/curriculum-history.ts`)

- `LEVELS_BY_TRACK` 유지 — 테이블 골격 데이터.
- `core: string[]` → `{ text: string; link?: { label: string; href: string } }[]`.
- `CurriculumCohort`에 `highlights?: { level: string; tracks: TrackKey[] | 'all'; label: string; href: string }[]` 추가. current 기수의 highlights만 테이블 배지로 렌더.
- 내년 9기: 데이터만 추가하면 8기는 자동으로 연표로 졸업(구조 재작업 불필요).

### 컴포넌트 (`components/CurriculumTimeline.tsx` + `.module.css`)

- 컴포넌트 이름·MDX 등록(`<CurriculumTimeline />`) 유지, 내부만 테이블+연표로 재작성.
- 모바일: 테이블을 `overflow-x: auto` 컨테이너에 넣고 첫 열(레벨) sticky. repo 모바일 규칙(가로 오버플로우 금지 · 44px 터치 · 한글 word-break) 준수.

### 본문 카피 (`content/education/curriculum/index.mdx`)

- "아래에서 기수를 눌러 보면…" 단락을 새 UI 설명으로 수정. 합니다체, 말투점검·사람냄새 기준.

## 비범위

- llm-wiki(원본 위키) 수정 없음 — 읽기만.
- 과거 기수 데이터 신규 수집 없음 — 기존 wiki 델타만 반영.
- growth-arc.ts(성장 여정)·다른 페이지 변경 없음.

## 검증

- `/모바일점검` 프로토콜(375·360·640px) — 가로 스크롤·터치 타깃·글자 잘림.
- `npm run lint:tone`(합니다체) · 다크 모드 확인 · 기존 앵커(`#쌓아-올리는-학습`) 생존 확인.
