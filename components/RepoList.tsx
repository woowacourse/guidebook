'use client'

import { useCallback, useEffect, useState } from 'react'
import repositories, { type RepoCategory } from '../content/repositories'
import styles from './RepoList.module.css'

const ALL = '전체' as const
type Filter = typeof ALL | RepoCategory

const CATEGORIES: Filter[] = ['전체', '미션', '도구', '문서', '인프라', '기타']

const CATEGORY_SLUG: Record<Filter, string> = {
  '전체': '',
  '미션': 'mission',
  '도구': 'tool',
  '문서': 'doc',
  '인프라': 'infra',
  '기타': 'etc',
}

const SLUG_TO_CATEGORY: Record<string, Filter> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG)
    .filter(([, slug]) => slug !== '')
    .map(([cat, slug]) => [slug, cat as Filter])
)

function getCategoryFromURL(): Filter {
  if (typeof window === 'undefined') return '전체'
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('category')
  if (!slug) return '전체'
  return SLUG_TO_CATEGORY[slug] ?? '전체'
}

export function RepoList() {
  const [selected, setSelected] = useState<Filter>('전체')

  useEffect(() => {
    setSelected(getCategoryFromURL())
  }, [])

  const handleSelect = useCallback((cat: Filter) => {
    setSelected(cat)
    const slug = CATEGORY_SLUG[cat]
    const url = new URL(window.location.href)
    if (slug) {
      url.searchParams.set('category', slug)
    } else {
      url.searchParams.delete('category')
    }
    window.history.replaceState(null, '', url.toString())
  }, [])

  const filtered = repositories
    .filter((repo) => selected === '전체' || repo.category === selected)
    .sort((a, b) => b.score - a.score || b.lastScanned.localeCompare(a.lastScanned))

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist" aria-label="카테고리 필터">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selected === cat}
            className={`${styles.tab} ${selected === cat ? styles.tabActive : ''}`}
            onClick={() => handleSelect(cat)}
          >
            {cat}
            <span className={styles.count}>
              {cat === '전체'
                ? repositories.length
                : repositories.filter((r) => r.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map((repo) => (
          <a key={repo.slug} href={repo.href} className={styles.item}>
            <div className={styles.meta}>
              <span className={styles.date}>{repo.lastScanned}</span>
              <span className={styles.category}>{repo.category}</span>
              <span className={styles.tier}>{repo.tier} · {repo.score}/25</span>
            </div>
            <h3 className={styles.title}>{repo.title}</h3>
            <p className={styles.description}>{repo.description}</p>
          </a>
        ))}
        {filtered.length === 0 && (
          <p className={styles.empty}>
            아직 T2 이상으로 승급된 레포가 없습니다. `/analyze-all`을 실행해 분석을 시작하세요.
          </p>
        )}
      </div>
    </div>
  )
}
