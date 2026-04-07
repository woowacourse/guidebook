export type RepoCategory = '미션' | '도구' | '문서' | '인프라' | '기타'
export type RepoTier = 'T2' | 'T3'

export interface Repo {
  slug: string
  name: string
  title: string
  description: string
  category: RepoCategory
  tier: RepoTier
  score: number
  href: string
  url: string
  lastScanned: string  // YYYY-MM-DD
}

// /analyze-repo, /analyze-all 커맨드가 자동으로 갱신합니다.
// 수동 편집 시에는 최신 항목을 맨 위에 두세요.
const repositories: Repo[] = [
  {
    slug: 'java-jdbc',
    name: 'java-jdbc',
    title: '자바 JDBC 미션 (스프링 JDBC 라이브러리 직접 구현, Java)',
    description: '스프링 JDBC 라이브러리를 직접 구현하며 376회 포크·400+ PR 누적. Connection 캡슐화·RowMapper 정적 선언·Optional 반환 일관성·트랜잭션 전파·예외 체이닝이 핵심 리뷰 주제.',
    category: '미션',
    tier: 'T2',
    score: 21,
    href: '/education-experiment/repositories/java-jdbc',
    url: 'https://github.com/woowacourse/java-jdbc',
    lastScanned: '2026-04-07',
  },
  {
    slug: 'javascript-movie-review',
    name: 'javascript-movie-review',
    title: '자바스크립트 영화 리뷰 미션 (DOM 설계, JavaScript)',
    description: 'FE 레벨1 영화 리뷰 미션으로 155회 포크·200+ PR 누적. DOM 설계·상태 관리 일관성·컴포넌트 추상화 수준·데이터 모델링이 핵심 리뷰 주제.',
    category: '미션',
    tier: 'T2',
    score: 18,
    href: '/education-experiment/repositories/javascript-movie-review',
    url: 'https://github.com/woowacourse/javascript-movie-review',
    lastScanned: '2026-04-07',
  },
  {
    slug: 'perf-basecamp',
    name: 'perf-basecamp',
    title: '프론트엔드 성능 베이스캠프 (Memegle 최적화, JavaScript)',
    description: '실제 Memegle 프로젝트 성능을 개선하는 미션으로 205회 포크·191 PR 누적. 이미지 최적화·번들 최적화·캐싱 전략·코드 스플리팅이 핵심 리뷰 주제.',
    category: '미션',
    tier: 'T2',
    score: 20,
    href: '/education-experiment/repositories/perf-basecamp',
    url: 'https://github.com/woowacourse/perf-basecamp',
    lastScanned: '2026-04-07',
  },
  {
    slug: 'java-http',
    name: 'java-http',
    title: '자바 HTTP 미션 (톰캣 직접 구현, Java)',
    description: '톰캣·HTTP 파서를 직접 구현하며 385회 포크·1,100+ PR 누적. 세션 보안·쿠키 파싱 정확성·에러 핸들링 일관성이 핵심 리뷰 주제.',
    category: '미션',
    tier: 'T2',
    score: 22,
    href: '/education-experiment/repositories/java-http',
    url: 'https://github.com/woowacourse/java-http',
    lastScanned: '2026-04-07',
  },
  {
    slug: 'react-payments',
    name: 'react-payments',
    title: '리액트 페이먼츠 미션 (UI 컴포넌트 설계, TypeScript)',
    description: '결제 카드 UI를 2단계로 구현하며 207회 포크·496 PR 누적. 커스텀 훅 설계·CSS 단위·접근성·TypeScript 타이핑이 핵심 리뷰 주제.',
    category: '미션',
    tier: 'T2',
    score: 20,
    href: '/education-experiment/repositories/react-payments',
    url: 'https://github.com/woowacourse/react-payments',
    lastScanned: '2026-04-07',
  },
  {
    slug: 'java-lotto',
    name: 'java-lotto',
    title: '자바 로또 미션 (구현→리팩토링 2단계, Java)',
    description: '로또 구현 1단계·리팩토링 2단계 구조로 327회 포크·676 PR 누적. 단일 책임·일급 컬렉션·예외 처리 일관성이 핵심 리뷰 주제.',
    category: '미션',
    tier: 'T2',
    score: 19,
    href: '/education-experiment/repositories/java-lotto',
    url: 'https://github.com/woowacourse/java-lotto',
    lastScanned: '2026-04-07',
  },
  {
    slug: 'java-chess',
    name: 'java-chess',
    title: '자바 체스 미션 (OOP 심화·DB 연동, Java)',
    description: 'OOP 심화와 DB 연동을 주제로 461회 포크·857 PR이 누적된 대표 심화 미션. Controller 책임 분리·단방향 의존성·DAO 추상화가 핵심 리뷰 주제.',
    category: '미션',
    tier: 'T2',
    score: 19,
    href: '/education-experiment/repositories/java-chess',
    url: 'https://github.com/woowacourse/java-chess',
    lastScanned: '2026-04-07',
  },
  {
    slug: 'java-blackjack',
    name: 'java-blackjack',
    title: '자바 블랙잭 미션 (다기수 누적, Java)',
    description: 'OOP 설계 원칙과 입력 검증 책임 분리를 핵심 주제로, 549회 포크·1,000+ PR이 누적된 대표 미션 레포.',
    category: '미션',
    tier: 'T2',
    score: 20,
    href: '/education-experiment/repositories/java-blackjack',
    url: 'https://github.com/woowacourse/java-blackjack',
    lastScanned: '2026-04-07',
  },
]

export default repositories
