export type LogPhase =
  | '온보딩'
  | '레벨0'
  | '레벨1'
  | '레벨2'
  | '레벨3'
  | '레벨4'
  | '레벨5'

export type LogTrack = '웹 백엔드' | '웹 프론트엔드' | '모바일'
export type LogTheme = '소프트스킬' | '코치훈련'

export type LogPrimaryCategory = '전체' | LogPhase | LogTrack | LogTheme
export type LogTrackFilter = '전체' | LogTrack

export interface Log {
  slug: string
  title: string
  description: string
  href: string
  date: string
  phases: LogPhase[]
  tracks: LogTrack[]
  themes?: LogTheme[]
}

export const LEVEL_PHASES: LogPhase[] = [
  '온보딩',
  '레벨0',
  '레벨1',
  '레벨2',
  '레벨3',
  '레벨4',
  '레벨5',
]

export const TRACKS: LogTrack[] = ['웹 백엔드', '웹 프론트엔드', '모바일']

export const PRIMARY_TABS: LogPrimaryCategory[] = [
  '전체',
  ...LEVEL_PHASES,
  '소프트스킬',
  ...TRACKS,
  '코치훈련',
]

const ALL_TRACKS: LogTrack[] = [...TRACKS]
const WEB_TRACKS: LogTrack[] = ['웹 백엔드', '웹 프론트엔드']

const PHASE_ORDER: Record<LogPhase, number> = {
  '온보딩': 0,
  '레벨0': 1,
  '레벨1': 2,
  '레벨2': 3,
  '레벨3': 4,
  '레벨4': 5,
  '레벨5': 6,
}

export function isLevelPhase(category: LogPrimaryCategory): category is LogPhase {
  return LEVEL_PHASES.includes(category as LogPhase)
}

function getThemes(log: Log): LogTheme[] {
  return log.themes ?? []
}

export function matchesPrimaryCategory(log: Log, category: LogPrimaryCategory): boolean {
  if (category === '전체') return true
  if (isLevelPhase(category)) return log.phases.includes(category)
  if (TRACKS.includes(category as LogTrack)) return log.tracks.includes(category as LogTrack)
  return getThemes(log).includes(category as LogTheme)
}

export function matchesTrackFilter(log: Log, track: LogTrackFilter): boolean {
  return track === '전체' || log.tracks.includes(track)
}

export function filterLogs(
  entries: Log[],
  primary: LogPrimaryCategory,
  track: LogTrackFilter = '전체'
): Log[] {
  return entries.filter((log) => {
    if (!matchesPrimaryCategory(log, primary)) return false
    if (!isLevelPhase(primary)) return true
    return matchesTrackFilter(log, track)
  })
}

function summarizePhases(phases: LogPhase[]): string | null {
  if (phases.length === 0) return null

  const ordered = [...new Set(phases)].sort((a, b) => PHASE_ORDER[a] - PHASE_ORDER[b])
  const numericLevels = ordered
    .map((phase) => {
      const match = phase.match(/^레벨(\d)$/)
      return match ? Number(match[1]) : null
    })
    .filter((level): level is number => level !== null)

  if (
    numericLevels.length === ordered.length &&
    numericLevels.length > 1 &&
    numericLevels.every((level, index) => index === 0 || level === numericLevels[index - 1] + 1)
  ) {
    return `레벨${numericLevels[0]}~${numericLevels[numericLevels.length - 1]}`
  }

  return ordered.join('·')
}

function summarizeTracks(tracks: LogTrack[]): string | null {
  if (tracks.length === 0) return null
  if (TRACKS.every((track) => tracks.includes(track))) return '전 트랙'

  const ordered = TRACKS.filter((track) => tracks.includes(track))
  return ordered.join('·')
}

export function getLogBadges(log: Log): string[] {
  const badges: string[] = []

  const phaseBadge = summarizePhases(log.phases)
  if (phaseBadge) badges.push(phaseBadge)

  for (const theme of getThemes(log)) {
    badges.push(theme)
  }

  const trackBadge = summarizeTracks(log.tracks)
  if (trackBadge) badges.push(trackBadge)

  return badges
}

// 최신 항목을 맨 위에 추가하세요.
const logs: Log[] = [
  {
    slug: 'fe-lotto-2026-prs',
    title: '로또 미션 8기: PR 57개로 본 콘솔에서 웹으로의 관심사 분리',
    description: 'woowacourse/javascript-lotto 2026년 PR 57건·리뷰 코멘트 983건에서 레벨1 크루가 콘솔에서 웹으로 같은 도메인을 옮기며 관심사 분리·검증 위치·TDD를 어떻게 익혔는지 정리했다.',
    href: '/education/logs/fe-lotto-2026-prs',
    date: '2026-06-23',
    phases: ['레벨1'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'fe-ts-learning-2026-prs',
    title: 'ts러닝 미션 8기: PR 26개로 본 "학습법을 학습하는" 신설 미션',
    description: '2026년 신설된 woowacourse/ts-and-learning PR 26건·리뷰 코멘트 177건에서, 크루가 TypeScript를 익히는 동시에 자신의 학습법 자체를 설계·측정·개선하도록 한 메타학습 실험을 정리했다.',
    href: '/education/logs/fe-ts-learning-2026-prs',
    date: '2026-06-23',
    phases: ['레벨1'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'fe-movie-review-2026-prs',
    title: '영화리뷰 미션 8기: PR 54개로 본 비동기 에러와 상태 기반 설계의 첫 만남',
    description: 'woowacourse/javascript-movie-review 2026년 PR 54건·리뷰 코멘트 1,786건에서 레벨1 크루가 fetch 비동기 통신·에러 경로 설계·상태 기반 렌더링을 처음 부딪히며 익힌 과정을 정리했다.',
    href: '/education/logs/fe-movie-review-2026-prs',
    date: '2026-06-23',
    phases: ['레벨1'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'react-payments-555prs-analysis',
    title: 'React 페이먼츠 미션 5년치 PR 555개 데이터 분석',
    description: 'woowacourse/react-payments 저장소 555개 PR(2021–2026)의 본문·리뷰 코멘트 2,360건을 정량 분석해 학습 주제 진화·리뷰어 코칭 패턴·미션 재설계 흔적을 추적했다.',
    href: '/education/logs/react-payments-555prs-analysis',
    date: '2026-05-26',
    phases: [],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'posuta-coach-qa-archive',
    title: '포수타 코치 Q&A 5회 아카이브: 학습·관계·삶에 대한 누적 대화',
    description: '2024-2025년 포수타 5회 전사를 모아 시간 부족·완벽주의·관계·취업·재미라는 반복 주제와 코치들의 우테코식 가이드 어법을 정리.',
    href: '/education/logs/posuta-coach-qa-archive',
    date: '2026-05-19',
    phases: [],
    tracks: [],
    themes: ['소프트스킬'],
  },
  {
    slug: 'posuta-archive',
    title: '크루들과의 포수타 5회 스크립트 아카이브',
    description: '포비 캡틴과 6~7기 크루들의 포수타 5회 전사를 정리하고, 방향 설정에서 학습 태도·관계 맺기로 이동한 질문 흐름을 함께 읽었다.',
    href: '/education/logs/posuta-archive',
    date: '2026-05-19',
    phases: ['레벨2', '레벨4'],
    tracks: [],
    themes: ['소프트스킬'],
  },
  {
    slug: 'android-level2-mini-project',
    title: '안드로이드 레벨2 미니 프로젝트 수업 계획',
    description: '안드로이드 레벨2 크루 17명을 대상으로 4주 8회차 MVP 빌더 성장을 목표로 설계된 미니 프로젝트 수업 계획서.',
    href: '/education/logs/android-level2-mini-project',
    date: '2026-05-19',
    phases: ['레벨2'],
    tracks: ['모바일'],
  },
  {
    slug: 'thanks-feedback-workshop',
    title: '레벨2 지키미 선택 과목 - 고맙다 피드백 워크숍',
    description: 'Stone & Heen의 Thanks for the Feedback 프레임(3종 피드백, 3트리거, SSCC, 7일 약속)을 레벨2 지키미 선택 과목 90분 워크숍 6활동으로 설계합니다.',
    href: '/education/logs/thanks-feedback-workshop',
    date: '2026-05-19',
    phases: ['레벨2'],
    tracks: [],
    themes: ['소프트스킬'],
  },
  {
    slug: 'android-participatory',
    title: '레벨2 안드로이드 강의형에서 참여형으로',
    description: '레벨2 안드로이드 수업을 강의형에서 참여형으로 전환한 실험 기록.',
    href: '/education/logs/android-participatory',
    date: '2026-04-28',
    phases: ['레벨2'],
    tracks: ['모바일'],
  },
  {
    slug: 'writing-sessions',
    title: '레벨1 글쓰기 회고 미션',
    description: '레벨1 글쓰기 회고 미션 에세이 사례 모음',
    href: '/education/logs/writing-sessions',
    date: '2026-04-28',
    phases: ['레벨1'],
    tracks: ['웹 백엔드', '웹 프론트엔드', '모바일'],
    themes: ['소프트스킬'],
  },
  {
    slug: 'crew-autonomy',
    title: '크루 자율성 강화 - 선택 미션',
    description: '레벨1에서 기존 필수로 수행하게 했던 미션을 선택해서 진행하게 하여 크루들의 학습 능동성과 자율성 강화를 기대하는 실험.',
    href: '/education/logs/crew-autonomy',
    date: '2026-04-27',
    phases: ['레벨1'],
    tracks: ['웹 백엔드'],
  },
  {
    slug: 'coaching-squad-training-loop',
    title: '코칭 스쿼드 전문성 강화 루프: 회상에서 표준화 크루, AI 피드백까지',
    description: '회상, 표준화 크루, 클린 랭귀지, GPT 반복 훈련, 원온원 준비 템플릿까지 이어진 11회차 코치 훈련 기록.',
    href: '/education/logs/coaching-squad-training-loop',
    date: '2026-04-14',
    phases: [],
    tracks: [],
    themes: ['코치훈련'],
  },
  {
    slug: 'fe-accessibility-report',
    title: 'FE 접근성 리포트: 자기 서비스를 진단하는 6기·7기 반복 실험',
    description: '성능 리포트 구조를 접근성으로 확장. 6기 리포트를 7기 디스커션에 누적 자산으로 명시한 반복 실험.',
    href: '/education/logs/fe-accessibility-report',
    date: '2026-04-07',
    phases: ['레벨4'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'fe-ssr-discussion',
    title: 'FE SSR 학습: 토론과 OX퀴즈로 "서버와 클라이언트의 평행세계" 체험하기',
    description: 'JS 평행세계 토론과 OX퀴즈 해설지를 결합해, SSR이라는 추상 개념을 자기 코드 검증으로 체화하는 2단 구조.',
    href: '/education/logs/fe-ssr-discussion',
    date: '2026-04-07',
    phases: ['레벨4'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'fe-rendering-strategy-workshop',
    title: '렌더링 전략 워크숍: 팀×팀 피드백으로 기술 결정 단단히 만들기',
    description: '"CSR이냐 SSR이냐"를 페이지 단위 논증으로 강제하고, 팀 간 피드백·개정 단계로 결정의 단단함을 키운 워크숍.',
    href: '/education/logs/fe-rendering-strategy-workshop',
    date: '2026-04-07',
    phases: ['레벨4'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'fe-react-typescript-convention',
    title: 'FE React & TypeScript 컨벤션 워크숍: 5기와 7기 사이의 2년 변화',
    description: '같은 템플릿을 2년 간격으로 운영하며, "사용한다"에서 "왜 사용하는가"로 학습 초점이 이동한 비교 실험.',
    href: '/education/logs/fe-react-typescript-convention',
    date: '2026-04-07',
    phases: ['레벨2'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'layout-component-workshop',
    title: '유연하게 재사용 가능한 레이아웃 컴포넌트 워크숍',
    description: '"재사용성"이라는 추상어 대신 "긴 라벨", "세로형" 같은 구체적 시나리오로 사용자 입장을 의인화한 컴포넌트 설계 훈련.',
    href: '/education/logs/layout-component-workshop',
    date: '2026-04-07',
    phases: ['레벨4'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'level3-team-project-retrospective-series',
    title: '레벨3 팀 프로젝트 회고 3부작: 중간 → 최종 → 사용자 유치',
    description: '같은 팀 프로젝트를 시점별로 다른 형식(점수화/3층위/외부 시야)의 회고로 설계해 회고 피로감을 줄인 기록.',
    href: '/education/logs/level3-team-project-retrospective-series',
    date: '2026-04-07',
    phases: ['레벨3'],
    tracks: [],
    themes: ['소프트스킬'],
  },
  {
    slug: 'ux-research-training',
    title: 'UX 리서치 3단계 훈련: 글쓰기에서 UT 실전까지',
    description: '페어 글쓰기 → JTBD 인터뷰 설계 → UT 실전이라는 3단계 점진적 스캐폴딩으로 개발자의 UX 리서치 역량을 훈련한 기록.',
    href: '/education/logs/ux-research-training',
    date: '2026-03-27',
    phases: ['레벨3'],
    tracks: [...WEB_TRACKS],
  },
  {
    slug: 'demo-day-retrospective',
    title: '데모데이 회고의 점진적 설계: 자유 형식에서 메타인지까지',
    description: '5회 연속 데모데이 회고를 매회 다른 형식으로 설계하여 성찰 깊이를 점진적으로 끌어올린 실험.',
    href: '/education/logs/demo-day-retrospective',
    date: '2026-03-27',
    phases: ['레벨3', '레벨4'],
    tracks: [],
    themes: ['소프트스킬'],
  },
  {
    slug: 'fe-level2-16steps',
    title: 'FE 레벨2 16단계 학습 체계: 점진적 깊이로 리액트를 체화하기',
    description: '적게 읽기, 거꾸로 만들기, 관점 전환, 세 가지 제약으로 설계한 FE 레벨2 전체 16단계 학습 체계.',
    href: '/education/logs/fe-level2-16steps',
    date: '2026-03-27',
    phases: ['레벨2'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'async-quiz-explanation',
    title: '비동기 퀴즈 해설지 만들기: 설명하며 배우는 3개 기수 반복 실험',
    description: '같은 4개의 비동기 퀴즈를 5기/6기/7기에 반복하며, 해설지 작성을 통해 설명 능력의 변화를 관찰한 실험.',
    href: '/education/logs/async-quiz-explanation',
    date: '2026-03-27',
    phases: ['레벨1'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'feedback-refactoring',
    title: '피드백 리팩터링: 피드백을 코드처럼 진단하고 개선하는 훈련',
    description: '5가지 진단 기준으로 기존 피드백을 진단하고, 수동 리팩터링과 GPTs 활용을 비교하며 피드백 품질을 높이는 훈련.',
    href: '/education/logs/feedback-refactoring',
    date: '2026-03-27',
    phases: ['레벨2'],
    tracks: [],
    themes: ['소프트스킬'],
  },
  {
    slug: 'growth-graph',
    title: '나의 성장 그래프: 시각화와 감정 키워드로 레벨을 회고하기',
    description: 'A3 모눈종이에 기술/소프트스킬 성장 곡선을 그리고 감정 키워드를 붙여 레벨을 회고하는 시각적 회고 활동.',
    href: '/education/logs/growth-graph',
    date: '2026-03-27',
    phases: ['레벨1'],
    tracks: [...ALL_TRACKS],
    themes: ['소프트스킬'],
  },
  {
    slug: 'team-building-ground-rules',
    title: '나 사용설명서에서 팀 그라운드 룰까지: 팀 빌딩 미션 (6기)',
    description: '개인 사용설명서로 자기 이해를 먼저 하고, 이를 기반으로 팀 그라운드 룰을 협상하는 2단계 팀 빌딩 설계.',
    href: '/education/logs/team-building-ground-rules',
    date: '2026-03-27',
    phases: ['레벨3'],
    tracks: [...ALL_TRACKS],
    themes: ['소프트스킬'],
  },
  {
    slug: 'finding-tech-strengths',
    title: '나만의 기술적 강점 찾기: 정체성 선언 기반 딥다이브 학습 (7기 FE)',
    description: '"나는 __에 강점이 있는 개발자입니다" 정체성 선언으로 48명의 크루가 각자의 기술 영역을 깊이 탐구한 실험.',
    href: '/education/logs/finding-tech-strengths',
    date: '2026-03-27',
    phases: ['레벨4'],
    tracks: ['웹 프론트엔드'],
    themes: ['소프트스킬'],
  },
  {
    slug: 'reinventing-the-wheel',
    title: '바퀴의 재발명 사전 에세이: 3개 기수가 탐구한 재구현의 교육적 가치',
    description: '안드로이드 레벨4 "바퀴의 재발명" 강의 전 사전 에세이 과제. 5기·6기·7기 크루의 사고 깊이 변화를 추적한 기록.',
    href: '/education/logs/reinventing-the-wheel',
    date: '2026-03-27',
    phases: ['레벨4'],
    tracks: ['모바일'],
  },
  {
    slug: 'fe-performance-report',
    title: 'FE 성능 리포트: 자기 서비스를 진단하는 3단계 프레임워크의 진화',
    description: '자기 팀 서비스를 대상으로 성능을 측정하고 개선하는 3단계 프레임워크. 5기·6기·7기에 걸친 진화 과정.',
    href: '/education/logs/fe-performance-report',
    date: '2026-03-27',
    phases: ['레벨4'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'ux-lecture-level3',
    title: '레벨3 UX 특강: 사용자 관점으로 서비스 다듬기 (6기)',
    description: 'UX Writing, JTBD 인터뷰 설계, UT 인터뷰 3회 시리즈로 개발자가 사용자 관점을 체험하고 서비스를 개선하는 활동.',
    href: '/education/logs/ux-lecture-level3',
    date: '2026-03-27',
    phases: ['레벨3'],
    tracks: [...WEB_TRACKS],
  },
  {
    slug: 'web-backend-level1-elective-missions',
    title: '웹백엔드 레벨1 선택미션',
    description: '기술·문제정의·사고 확장 3가지 유형의 선택미션으로 자기주도 학습 환경을 설계한 기록.',
    href: '/education/logs/web-backend-level1-elective-missions',
    date: '2026-03-24',
    phases: ['레벨1'],
    tracks: ['웹 백엔드'],
  },
  {
    slug: 'expedition-tech-salon',
    title: '원정대 테크살롱: 공유회로 전이 설계하기',
    description: '원정대가 쌓은 지식을 다른 크루에게 실제로 전이시키는 테크살롱 공유회 설계와 운영 기록.',
    href: '/education/logs/expedition-tech-salon',
    date: '2026-03-24',
    phases: ['레벨1'],
    tracks: [...WEB_TRACKS],
  },
  {
    slug: 'pair-programming-manifesto',
    title: '짝 프로그래밍 선언문',
    description: '첫 미션 후 KPT 회고로 크루가 직접 만든 10가지 협업 원칙. 외부 가이드라인이 아닌 자신들의 언어로 쓴 선언문.',
    href: '/education/logs/pair-programming-manifesto',
    date: '2026-03-17',
    phases: ['레벨1'],
    tracks: [...ALL_TRACKS],
    themes: ['소프트스킬'],
  },
  {
    slug: 'soft-skill-one-step-study',
    title: '한 발짝 스터디',
    description: '크루 스스로 소프트 스킬 목표를 설정하고 매주 팀 스터디로 실험하는 성장 사이클.',
    href: '/education/logs/soft-skill-one-step-study',
    date: '2026-03-17',
    phases: ['레벨1'],
    tracks: [...ALL_TRACKS],
    themes: ['소프트스킬'],
  },
  {
    slug: 'codelab-lotto-domain-ui',
    title: '코드랩으로 관심사 분리 체험하기',
    description: '예측→관찰→설명 흐름으로 "도메인과 UI를 왜 분리해야 하는가"를 크루 스스로 발견하게 하는 수업 설계.',
    href: '/education/logs/codelab-lotto-domain-ui',
    date: '2026-03-17',
    phases: ['레벨1'],
    tracks: ['웹 프론트엔드'],
  },
  {
    slug: 'drama-retrospective',
    title: '연극 회고: 취약함 공유로 심리적 안전감 만들기',
    description: '연극 직후 강점과 취약함을 포스트잇으로 공유하며 팀 신뢰의 토대를 만드는 90분 회고 활동.',
    href: '/education/logs/drama-retrospective',
    date: '2026-03-17',
    phases: ['온보딩', '레벨1'],
    tracks: [...ALL_TRACKS],
    themes: ['소프트스킬'],
  },
  {
    slug: 'drama-onboarding',
    title: '온보딩 연극 미션',
    description: '연극으로 시작하는 온보딩. 심리적 안전감 형성과 팀 정체성을 위한 첫 번째 장치.',
    href: '/education/logs/drama-onboarding',
    date: '2026-03-17',
    phases: ['온보딩'],
    tracks: [...ALL_TRACKS],
  },
  {
    slug: 'android-level0',
    title: '레벨0: 자기주도 학습 설계 (안드로이드 8기)',
    description: '입학 전 4주, 계획-실행-회고 구조로 자기주도 학습 루틴을 만드는 실험. 19명 전원 완주.',
    href: '/education/logs/android-level0',
    date: '2026-03-10',
    phases: ['레벨0'],
    tracks: ['모바일'],
  },
  {
    slug: 'senior-code-review',
    title: '선배 코드로 눈 키우기',
    description: '선배 PR의 AS-IS를 먼저 판단하고 TO-BE와 비교하여 "못 보던 것"을 발견하는 활동.',
    href: '/education/logs/senior-code-review',
    date: '2026-03-10',
    phases: ['레벨1'],
    tracks: [],
  },
  {
    slug: 'expedition',
    title: '원정대: 송곳 같은 강점 만들기',
    description: '동료와 함께 탐험하며 각자의 전문 영역을 만드는 활동.',
    href: '/education/logs/expedition',
    date: '2026-03-10',
    phases: ['레벨1'],
    tracks: [],
  },
  {
    slug: 'standardized-crew-coaching',
    title: '표준화 크루를 활용한 코칭 훈련',
    description: 'GPTs로 구현한 가상 크루와 코칭을 연습하는 훈련 환경.',
    href: '/education/logs/standardized-crew-coaching',
    date: '2026-03-10',
    phases: [],
    tracks: [],
    themes: ['코치훈련'],
  },
  {
    slug: 'mission-design',
    title: 'Gemini Canvas 웹앱 다작하기',
    description: 'AI와 협업하는 방식을 익히기 위한 1주 4앱 미션 설계기.',
    href: '/education/logs/mission-design',
    date: '2026-03-03',
    phases: ['레벨1'],
    tracks: [...ALL_TRACKS],
  },
]

export default logs
