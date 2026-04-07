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
    date: '2026년 연구',
    title: '자바 HTTP 미션 (톰캣 직접 구현, Java)',
    description: '톰캣을 직접 구현하며 385회 포크·1,100+ PR 누적. 세션 보안·쿠키 파싱·에러 핸들링 일관성이 핵심 리뷰 주제.',
    href: '/education-experiment/repositories/java-http',
    status: 'active',
  },
  {
    date: '2026년 연구',
    title: '리액트 페이먼츠 미션 (UI 컴포넌트 설계, TypeScript)',
    description: '결제 카드 UI를 2단계로 구현하며 207회 포크·496 PR 누적. 커스텀 훅·접근성·TypeScript 타이핑이 핵심 리뷰 주제.',
    href: '/education-experiment/repositories/react-payments',
    status: 'active',
  },
  {
    date: '2026년 연구',
    title: '자바 로또 미션 (구현→리팩토링 2단계, Java)',
    description: '로또 구현 1단계·리팩토링 2단계 구조로 327회 포크·676 PR 누적. 단일 책임·일급 컬렉션이 핵심 리뷰 주제.',
    href: '/education-experiment/repositories/java-lotto',
    status: 'active',
  },
  {
    date: '2026년 연구',
    title: '자바 체스 미션 (OOP 심화·DB 연동, Java)',
    description: 'OOP 심화와 DB 연동을 주제로 461회 포크·857 PR이 누적된 대표 심화 미션 레포.',
    href: '/education-experiment/repositories/java-chess',
    status: 'active',
  },
  {
    date: '2026년 연구',
    title: '자바 블랙잭 미션 (다기수 누적, Java)',
    description: 'OOP 설계 원칙과 입력 검증 책임 분리를 핵심 주제로, 549회 포크·1,000+ PR이 누적된 대표 미션 레포.',
    href: '/education-experiment/repositories/java-blackjack',
    status: 'active',
  },
  {
    date: '2026년 연구',
    title: '우아한테크코스 저장소 연구 (신규)',
    description: 'woowacourse org 전체 공개 저장소를 autoresearch 파이프라인으로 분석하기 시작했습니다.',
    href: '/education-experiment/repositories',
    status: 'active',
  },
  {
    date: '아카이브',
    title: 'FE 레벨3·4 워크숍 6편 아카이브',
    description: '접근성 리포트, SSR 토론, 렌더링 전략, TS 컨벤션, 레이아웃 컴포넌트, 레벨3 회고 3부작 — GitHub Discussions 기반 6개 실험 로그를 일괄 자산화.',
    href: '/education-experiment/logs',
    status: 'active',
  },
  {
    date: '2026년 8기',
    title: '연구 사이클 워크플로우',
    description: '실험 로그 → 검증된 도구 → 인사이트 → 교육 모델로의 승격 파이프라인을 Mermaid로 시각화.',
    href: '/education-experiment/tools/research-cycle-workflow',
    status: 'active',
  },
  {
    date: '2024년 6기',
    title: '레벨3 UX 특강: 사용자 관점으로 서비스 다듬기',
    description: 'UX Writing, JTBD 인터뷰 설계, UT 인터뷰 3회 시리즈로 개발자가 사용자 관점을 체험하고 서비스를 개선하는 활동.',
    href: '/education-experiment/logs/ux-lecture-level3',
    status: 'active',
  },
  {
    date: '2026년 8기',
    title: '웹백엔드 레벨1 선택미션',
    description: '기술·문제정의·사고 확장 3가지 유형의 선택미션으로 자기주도 학습 환경을 설계한 기록.',
    href: '/education-experiment/logs/web-backend-level1-elective-missions',
    status: 'active',
  },
  {
    date: '2026년 8기',
    title: '원정대 테크살롱: 공유회로 전이 설계하기',
    description: '원정대가 쌓은 지식을 다른 크루에게 실제로 전이시키는 테크살롱 공유회 설계와 운영 기록.',
    href: '/education-experiment/logs/expedition-tech-salon',
    status: 'active',
  },
  {
    date: '2026년 8기',
    title: '한 발짝 스터디',
    description: '크루 스스로 소프트 스킬 목표를 설정하고 매주 팀 스터디로 실험하는 성장 사이클.',
    href: '/education-experiment/logs/soft-skill-one-step-study',
    status: 'active',
  },
  {
    date: '2026년 8기',
    title: '온보딩 연극 미션',
    description: '연극으로 시작하는 온보딩. 심리적 안전감 형성과 팀 정체성을 위한 첫 번째 장치.',
    href: '/education-experiment/logs/drama-onboarding',
    status: 'active',
  },
  {
    date: '2026년 8기',
    title: '연극 회고: 취약함 공유로 심리적 안전감 만들기',
    description: '연극 직후 강점과 취약함을 포스트잇으로 공유하며 팀 신뢰의 토대를 만드는 90분 회고 활동.',
    href: '/education-experiment/logs/drama-retrospective',
    status: 'active',
  },
  {
    date: '2026년 8기',
    title: '코드랩으로 관심사 분리 체험하기',
    description: 'POE 사이클로 "도메인과 UI를 왜 분리해야 하는가"를 크루 스스로 발견하게 하는 수업 설계.',
    href: '/education-experiment/logs/codelab-lotto-domain-ui',
    status: 'active',
  },
  {
    date: '2026년 8기',
    title: '레벨0: 자기주도 학습 설계 (안드로이드)',
    description: '입학 전 4주, 계획-실행-회고 구조로 크루 스스로 학습 리듬을 만드는 실험. 19명 전원 완주.',
    href: '/education-experiment/logs/android-level0',
    status: 'active',
  },
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
