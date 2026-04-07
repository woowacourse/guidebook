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
const repositories: Repo[] = []

export default repositories
