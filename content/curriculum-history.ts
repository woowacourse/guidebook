// 기수별 커리큘럼의 단일 진실 원천 (웹 표시용).
//
// 원본/상세는 llm-wiki/wiki/curriculum-evolution.md, 레벨 골격은 공식 트랙 페이지
// (woowacourse.io/{frontend,backend,android,softskill}) 기반.
//
// 구조: 기수(gi)별로 "이 해의 핵심" + 그 기수에 존재한 트랙만 노출.
//   - 레벨 0~5 골격은 트랙별로 거의 안정적이라 LEVELS_BY_TRACK 에 한 번만 정의(현재 기준).
//   - 매년 바뀐 미션·강조점의 차이는 각 기수의 core[] 에 담는다.
//   - depth 'sparse' = 핵심 데이터가 얇음("기록 보강 중"). 'rich' = 교차 확인됨.
// 트랙 시작: 웹 백엔드 1기~, 웹 프론트엔드 3기(2021)~, 안드로이드 5기(2023)~, 소프트스킬 6기(2024)~.

export type TrackKey = '웹 프론트엔드' | '웹 백엔드' | '안드로이드' | '소프트스킬'

export const TRACK_ORDER: TrackKey[] = [
  '웹 프론트엔드',
  '웹 백엔드',
  '안드로이드',
  '소프트스킬',
]

export interface CurriculumLevel {
  level: string // '레벨 0' ~ '레벨 5'
  stage: string // 단계 한 단어 (온보딩·기초·심화 …)
  name: string
  desc: string
}

export interface CurriculumCohort {
  gi: number // 기수
  year: number
  headline: string // 이 해를 한 줄로
  core: string[] // 핵심 요소 2~3개
  tracks: TrackKey[] // 그 기수에 존재한 트랙
  depth: 'sparse' | 'rich'
  current?: boolean // 현재 진행 중 기수
}

// 레벨 0~5 골격 — 공식 트랙 페이지(현재 기준)에서 합성. 트랙별로 강조점이 다르다.
export const LEVELS_BY_TRACK: Record<TrackKey, CurriculumLevel[]> = {
  '웹 프론트엔드': [
    { level: '레벨 0', stage: '온보딩', name: '적응 · 기초', desc: '연극 온보딩으로 시작, 심리적 안정감 형성' },
    { level: '레벨 1', stage: '기초', name: '프로그래밍 기초', desc: 'HTML·CSS·JS 기본, 테스트 작성·리팩터링' },
    { level: '레벨 2', stage: '중급', name: 'React 애플리케이션', desc: '컴포넌트 설계, 상태 관리 라이브러리 활용' },
    { level: '레벨 3', stage: '협업', name: '팀 프로젝트', desc: '실제 개발 프로세스, 서비스 배포 경험' },
    { level: '레벨 4', stage: '심화', name: '심화 + 협업', desc: '레거시 리팩터링, 성능 최적화, 접근성, 배포 전략' },
    { level: '레벨 5', stage: '취업', name: '취업 준비', desc: '개인 학습 보충, 이력서, 기업 면담' },
  ],
  '웹 백엔드': [
    { level: '레벨 0', stage: '온보딩', name: '적응 · 기초', desc: '연극 온보딩으로 시작, 기초 개념' },
    { level: '레벨 1', stage: '기초', name: '프로그래밍 기초', desc: '콘솔 앱으로 핵심 역량 정립, 코드 가독성 강조' },
    { level: '레벨 2', stage: '웹', name: '웹 프로그래밍', desc: '웹 애플리케이션 구현, 백엔드 기술 학습' },
    { level: '레벨 3', stage: '협업', name: '팀 프로젝트', desc: '협업 프로세스, 기획·구현·실 사용자 배포' },
    { level: '레벨 4', stage: '심화', name: '심화 웹 + 팀', desc: '레거시 리팩토링, 시스템 아키텍처, CS 기초' },
    { level: '레벨 5', stage: '취업', name: '개인 학습 & 취업', desc: '역량 보완, 이력서, 레벨 인터뷰, 리크루팅 데이' },
  ],
  '안드로이드': [
    { level: '레벨 0', stage: '온보딩', name: '적응 · 기초', desc: '연극 온보딩으로 시작, 코틀린 문법' },
    { level: '레벨 1', stage: '기초', name: '프로그래밍 기초', desc: '코틀린 문법, 코드 품질 향상' },
    { level: '레벨 2', stage: '입문', name: '모바일 개발 입문', desc: '안드로이드 프레임워크, UI, 테스트, 서버 통신' },
    { level: '레벨 3', stage: '협업', name: '팀 협업 프로젝트', desc: '의존성 주입, 비동기 프로그래밍, 선언형 UI' },
    { level: '레벨 4', stage: '심화', name: '팀 프로젝트 심화', desc: '아키텍처·심화 협업 (레벨 3~4 연속)' },
    { level: '레벨 5', stage: '취업', name: '취업 준비', desc: '이력서, 인터뷰, 기업 매칭' },
  ],
  '소프트스킬': [
    { level: '레벨 0', stage: '적응', name: '적응', desc: '연극 온보딩 미션: 심리적 안정감·신뢰 구축' },
    { level: '레벨 1', stage: '마인드셋', name: '마인드셋 전환', desc: '기존 마인드셋 점검 → 협력 중심 사고' },
    { level: '레벨 2', stage: '개인', name: '개인 역량 강화', desc: '강점·약점 인식, 목표 설정, 피드백 성장' },
    { level: '레벨 3', stage: '협업', name: '협업 역량', desc: '협업 소프트스킬 정의·실천 (팀 프로젝트)' },
    { level: '레벨 4', stage: '지속', name: '지속 성장', desc: '피드백 중심 성장, 글쓰기 문화(테코톡)' },
    { level: '레벨 5', stage: '취업', name: '취업 준비', desc: '이력서, 면접 특강, 레벨 인터뷰' },
  ],
}

const BE_ONLY: TrackKey[] = ['웹 백엔드']
const BE_FE: TrackKey[] = ['웹 프론트엔드', '웹 백엔드']
const PLUS_ANDROID: TrackKey[] = ['웹 프론트엔드', '웹 백엔드', '안드로이드']
const ALL_TRACKS: TrackKey[] = ['웹 프론트엔드', '웹 백엔드', '안드로이드', '소프트스킬']

// 오래된 → 최신. 핵심(core)은 1·8기 외 임시 — 추후 보강 예정.
const cohorts: CurriculumCohort[] = [
  {
    gi: 1, year: 2019, headline: '우아한테크코스의 시작',
    core: ['우아한테크코스의 시작: 첫 기수 출범', '웹 백엔드 과정으로 출발'],
    tracks: BE_ONLY, depth: 'sparse',
  },
  {
    gi: 2, year: 2020, headline: '과정 정착기',
    core: ['(임시) 기록 보강 중'],
    tracks: BE_ONLY, depth: 'sparse',
  },
  {
    gi: 3, year: 2021, headline: '웹 프론트엔드 트랙 신설',
    core: ['웹 프론트엔드 과정 신설', '(임시) 페이먼츠 미션 개설, 이후 5년 최장수 단일 미션'],
    tracks: BE_FE, depth: 'sparse',
  },
  {
    gi: 4, year: 2022, headline: '배포 경험의 도입',
    core: ['(임시) FE 3단계(라이브러리 배포) 단계 도입'],
    tracks: BE_FE, depth: 'sparse',
  },
  {
    gi: 5, year: 2023, headline: '안드로이드 트랙 신설',
    core: ['안드로이드(모바일) 트랙 신설', '(임시) FE Storybook 문화 정착'],
    tracks: PLUS_ANDROID, depth: 'sparse',
  },
  {
    gi: 6, year: 2024, headline: '소프트스킬 트랙 신설',
    core: ['소프트스킬을 정식 트랙으로 분리·신설', '(임시) FE 곁가지 축소 → 기본기 집중'],
    tracks: ALL_TRACKS, depth: 'sparse',
  },
  {
    gi: 7, year: 2025, headline: '"동작"에서 "책임"으로',
    core: ['에러 처리·테스트가 사실상 필수로 상향', 'PR이 사고 과정 공유의 장으로(본문 길이 급증)'],
    tracks: ALL_TRACKS, depth: 'rich',
  },
  {
    gi: 8, year: 2026, headline: '서버 경계 설계 + AI 협업 미션',
    core: ['현재 진행 중인 기수', '페이먼츠 미션을 비동기·서버 통신·통합 테스트로 재설계', '레벨1에 AI 협업 미션(Gemini Canvas) 신설, 전 트랙 공통'],
    tracks: ALL_TRACKS, depth: 'rich', current: true,
  },
]

export default cohorts
