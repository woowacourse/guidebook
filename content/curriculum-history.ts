// 기수별 커리큘럼의 단일 진실 원천 (웹 표시용).
//
// 원본/상세는 llm-wiki/wiki/curriculum-evolution.md, 레벨 골격은 공식 트랙 페이지
// (woowacourse.io/{frontend,backend,android,softskill}) 기반.
//
// 구조: 현재 기수(current)는 트랙×레벨 테이블로, 과거 기수는 델타 연표로 렌더된다.
//   - 레벨 골격은 행 단위로 CURRICULUM_ROWS 에 정의(현재 기준). 전 트랙이 공통으로
//     지나는 구간(온보딩·팀 프로젝트·커리어 준비)은 common 한 칸으로, 트랙마다 다른
//     구간(레벨 1~2)은 cells 로 트랙별 칸을 둔다.
//   - 매년 바뀐 미션·강조점은 각 기수의 core[] 에 담고, link 로 실험 로그와 잇는다.
//   - depth 'sparse' = 핵심 데이터가 얇음("기록 보강 중"). 'rich' = 교차 확인됨.
// 트랙 시작: 웹 백엔드 1기~, 웹 프론트엔드 3기(2021)~, 안드로이드 5기(2023)~, 소프트스킬 6기(2024)~.
// 1~6기 델타 수치는 FE 페이먼츠 미션 555 PR 분석 중심의 부분 관측(원본 위키의 한계 명시를 따름).

export type TrackKey = '웹 프론트엔드' | '웹 백엔드' | '안드로이드' | '소프트스킬'

export const TRACK_ORDER: TrackKey[] = [
  '웹 프론트엔드',
  '웹 백엔드',
  '안드로이드',
  '소프트스킬',
]

export interface CurriculumCell {
  name: string
  desc: string
}

// 한 행 = 한 레벨 구간. common 이 있으면 전 트랙 공통(테이블에서 전체 폭 한 칸),
// cells 가 있으면 트랙별 칸.
export type CurriculumRow =
  | { level: string; common: CurriculumCell; cells?: never }
  | { level: string; common?: never; cells: Record<TrackKey, CurriculumCell> }

export interface CohortDelta {
  text: string
  link?: { label: string; href: string }
}

export interface CurriculumCohort {
  gi: number // 기수
  year: number
  headline: string // 이 해를 한 줄로
  core: CohortDelta[] // 이 해에 얹힌 델타 (비면 연표에 헤드라인만)
  tracks: TrackKey[] // 그 기수에 존재한 트랙
  depth: 'sparse' | 'rich'
  current?: boolean // 현재 진행 중 기수 → 테이블로 렌더
}

// 레벨 골격 — 공식 트랙 페이지(현재 기준)에서 합성. 트랙마다 다른 건 레벨 1~2뿐이고,
// 시작(온보딩)과 후반(팀 프로젝트·커리어 준비)은 전 트랙이 함께 걷는다.
export const CURRICULUM_ROWS: CurriculumRow[] = [
  {
    level: '0',
    common: { name: '온보딩', desc: '전 트랙이 한데 섞이는 연극 미션, 코드보다 심리적 안정감·신뢰부터' },
  },
  {
    level: '1',
    cells: {
      '웹 프론트엔드': { name: '프로그래밍 기초', desc: 'HTML·CSS·JS 기본, 테스트 작성·리팩터링' },
      '웹 백엔드': { name: '프로그래밍 기초', desc: '콘솔 앱으로 핵심 역량 정립, 코드 가독성 강조' },
      '안드로이드': { name: '프로그래밍 기초', desc: '코틀린 문법, 코드 품질 향상' },
      '소프트스킬': { name: '마인드셋 전환', desc: '기존 마인드셋 점검 → 협력 중심 사고' },
    },
  },
  {
    level: '2',
    cells: {
      '웹 프론트엔드': { name: 'React 애플리케이션', desc: '컴포넌트 설계, 상태 관리 라이브러리 활용' },
      '웹 백엔드': { name: 'Spring 웹 프로그래밍', desc: 'Spring으로 웹 애플리케이션 구현, 백엔드 기술 학습' },
      '안드로이드': { name: '모바일 개발 입문', desc: '안드로이드 프레임워크, UI, 테스트, 서버 통신' },
      '소프트스킬': { name: '개인 역량 강화', desc: '강점·약점 인식, 목표 설정, 피드백 성장' },
    },
  },
  {
    level: '3~4',
    common: { name: '팀 프로젝트', desc: '기획부터 실 사용자 배포까지 협업 프로세스, 레거시 리팩터링·아키텍처 심화' },
  },
  {
    level: '5',
    common: { name: '개인 학습 & 커리어 준비', desc: '역량 보완, 이력서, 레벨 인터뷰, 기업 매칭·리크루팅 데이' },
  },
]

const BE_ONLY: TrackKey[] = ['웹 백엔드']
const BE_FE: TrackKey[] = ['웹 프론트엔드', '웹 백엔드']
const PLUS_ANDROID: TrackKey[] = ['웹 프론트엔드', '웹 백엔드', '안드로이드']
const ALL_TRACKS: TrackKey[] = ['웹 프론트엔드', '웹 백엔드', '안드로이드', '소프트스킬']

const PAYMENTS_LOG = {
  label: '555 PR 분석',
  href: '/education/logs/react-payments-555prs-analysis',
}

// 오래된 → 최신. 렌더 순서는 컴포넌트가 정한다(연표는 최신순).
const cohorts: CurriculumCohort[] = [
  {
    gi: 1, year: 2019, headline: '우아한테크코스의 시작',
    core: [{ text: '웹 백엔드 단일 트랙, 10개월 과정의 원형이 만들어진 해' }],
    tracks: BE_ONLY, depth: 'sparse',
  },
  {
    gi: 2, year: 2020, headline: '과정 정착기',
    core: [],
    tracks: BE_ONLY, depth: 'sparse',
  },
  {
    gi: 3, year: 2021, headline: '웹 프론트엔드 트랙 신설',
    core: [
      { text: '웹 프론트엔드 과정 신설' },
      { text: '페이먼츠 미션 개설: 폼·커스텀 훅·컴포넌트 분리 중심, 이후 5년 최장수 미션', link: PAYMENTS_LOG },
    ],
    tracks: BE_FE, depth: 'sparse',
  },
  {
    gi: 4, year: 2022, headline: '배포 경험의 도입',
    core: [
      { text: 'FE 3단계(라이브러리 배포) 도입, 페이먼츠 PR 47개→117개 급증' },
      { text: 'TypeScript 언급 비중 19%→44%' },
    ],
    tracks: BE_FE, depth: 'sparse',
  },
  {
    gi: 5, year: 2023, headline: '안드로이드 트랙 신설',
    core: [
      { text: '안드로이드(모바일) 트랙 신설' },
      { text: 'FE Storybook 문화 정착(81%), 컴포넌트 단위 사고 확산' },
    ],
    tracks: PLUS_ANDROID, depth: 'sparse',
  },
  {
    gi: 6, year: 2024, headline: '소프트스킬 정규 커리큘럼화',
    core: [
      { text: '소프트스킬을 정규 커리큘럼으로 편성' },
      { text: 'FE 3단계 축소, 곁가지를 쳐내고 기본기에 집중' },
    ],
    tracks: ALL_TRACKS, depth: 'sparse',
  },
  {
    gi: 7, year: 2025, headline: '"동작"에서 "책임"으로',
    core: [
      { text: '에러 처리·테스트가 사실상 필수로 상향: testing 28%→94%, error-handling 11%→98%', link: PAYMENTS_LOG },
      { text: '2주마다 전 팀이 모이는 공통 데모데이 운영, 백엔드 선택 미션 실험' },
    ],
    tracks: ALL_TRACKS, depth: 'rich',
  },
  {
    gi: 8, year: 2026, headline: 'AI로 경계를 넘는 프로덕트 빌더 경험',
    core: [
      { text: 'AI 협업 미션 신설(전 트랙 공통), 프로덕트 빌더 경험 기반의 프로젝트 시작', link: { label: '미션 설계 기록', href: '/education/logs/mission-design' } },
      { text: '페이먼츠 미션을 비동기·서버 통신·통합 테스트로 재설계: async 1%→99%, MSW 6%→99%', link: PAYMENTS_LOG },
    ],
    tracks: ALL_TRACKS, depth: 'rich', current: true,
  },
]

export default cohorts
