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
