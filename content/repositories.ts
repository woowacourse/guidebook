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
