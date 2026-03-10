export interface Update {
  date: string
  title: string
  description: string
  href: string
  status: 'completed' | 'active' | 'upcoming'
}

// 최신 항목을 맨 위에 추가하세요.
const updates: Update[] = [
  {
    date: '2025년 8기',
    title: '선배 코드로 눈 키우기',
    description: '선배 PR의 AS-IS를 먼저 판단하고 TO-BE와 비교하여 "못 보던 것"을 발견하는 활동.',
    href: '/education-experiment/logs/senior-code-review',
    status: 'active',
  },
  {
    date: '2025년 8기',
    title: '표준화 크루를 활용한 코칭 훈련',
    description: 'GPTs로 구현한 가상 크루와 코칭을 연습하는 훈련 환경.',
    href: '/education-experiment/logs/standardized-crew-coaching',
    status: 'active',
  },
  {
    date: '2025년 8기',
    title: '원정대: 송곳 같은 강점 만들기',
    description: '동료와 함께 탐험하며 각자의 전문 영역을 만드는 활동.',
    href: '/education-experiment/logs/expedition',
    status: 'active',
  },
  {
    date: '2025년 8기',
    title: 'Gemini Canvas 미션 — PR 리뷰 패턴 분석',
    description: '145개 PR 리뷰 대화에서 추출한 8가지 반복 패턴. 프롬프팅 전략부터 피어 리뷰 구조까지.',
    href: '/education-experiment/logs/mission-design',
    status: 'completed',
  },
  {
    date: '2025년 8기',
    title: 'Gemini Canvas 웹앱 다작하기 미션 설계',
    description: 'AI와 협업하는 방식을 익히기 위한 1주 4앱 미션 설계기.',
    href: '/education-experiment/logs/mission-design',
    status: 'completed',
  },
]

export default updates
