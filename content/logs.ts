export type LogCategory = '온보딩' | '레벨0' | '레벨1' | '소프트스킬' | '코치훈련'

export interface Log {
  slug: string
  title: string
  description: string
  href: string
  date: string        // YYYY-MM-DD — 실험이 실제로 진행된 날짜
  category: LogCategory
}

// 최신 항목을 맨 위에 추가하세요.
const logs: Log[] = [
  {
    slug: 'pair-programming-manifesto',
    title: '짝 프로그래밍 선언문',
    description: '첫 미션 후 KPT 회고로 크루가 직접 만든 10가지 협업 원칙. 외부 가이드라인이 아닌 자신들의 언어로 쓴 선언문.',
    href: '/education-experiment/logs/pair-programming-manifesto',
    date: '2026-03-17',
    category: '소프트스킬',
  },
  {
    slug: 'soft-skill-one-step-study',
    title: '한 발짝 스터디',
    description: '크루 스스로 소프트 스킬 목표를 설정하고 매주 팀 스터디로 실험하는 성장 사이클.',
    href: '/education-experiment/logs/soft-skill-one-step-study',
    date: '2026-03-05',
    category: '소프트스킬',
  },
  {
    slug: 'codelab-lotto-domain-ui',
    title: '코드랩으로 관심사 분리 체험하기',
    description: 'POE 사이클로 "도메인과 UI를 왜 분리해야 하는가"를 크루 스스로 발견하게 하는 수업 설계.',
    href: '/education-experiment/logs/codelab-lotto-domain-ui',
    date: '2026-03-10',
    category: '레벨1',
  },
  {
    slug: 'drama-retrospective',
    title: '연극 회고: 취약함 공유로 심리적 안전감 만들기',
    description: '연극 직후 강점과 취약함을 포스트잇으로 공유하며 팀 신뢰의 토대를 만드는 90분 회고 활동.',
    href: '/education-experiment/logs/drama-retrospective',
    date: '2026-03-03',
    category: '온보딩',
  },
  {
    slug: 'drama-onboarding',
    title: '온보딩 연극 미션',
    description: '연극으로 시작하는 온보딩. 심리적 안전감 형성과 팀 정체성을 위한 첫 번째 장치.',
    href: '/education-experiment/logs/drama-onboarding',
    date: '2026-03-03',
    category: '온보딩',
  },
  {
    slug: 'android-level0',
    title: '레벨0: 자기주도 학습 설계 (안드로이드 8기)',
    description: '입학 전 4주, 계획-실행-회고 구조로 자기주도 학습 리듬을 만드는 실험. 19명 전원 완주.',
    href: '/education-experiment/logs/android-level0',
    date: '2026-01-26',
    category: '레벨0',
  },
  {
    slug: 'senior-code-review',
    title: '선배 코드로 눈 키우기',
    description: '선배 PR의 AS-IS를 먼저 판단하고 TO-BE와 비교하여 "못 보던 것"을 발견하는 활동.',
    href: '/education-experiment/logs/senior-code-review',
    date: '2025-07-01',
    category: '레벨1',
  },
  {
    slug: 'expedition',
    title: '원정대: 송곳 같은 강점 만들기',
    description: '동료와 함께 탐험하며 각자의 전문 영역을 만드는 활동.',
    href: '/education-experiment/logs/expedition',
    date: '2025-07-01',
    category: '레벨1',
  },
  {
    slug: 'mission-design',
    title: 'Gemini Canvas 웹앱 다작하기',
    description: 'AI와 협업하는 방식을 익히기 위한 1주 4앱 미션 설계기.',
    href: '/education-experiment/logs/mission-design',
    date: '2025-07-01',
    category: '레벨1',
  },
  {
    slug: 'standardized-crew-coaching',
    title: '표준화 크루를 활용한 코칭 훈련',
    description: 'GPTs로 구현한 가상 크루와 코칭을 연습하는 훈련 환경.',
    href: '/education-experiment/logs/standardized-crew-coaching',
    date: '2025-07-01',
    category: '코치훈련',
  },
]

export default logs
