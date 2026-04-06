'use client'

import { useCallback, useEffect, useState } from 'react'
import logs, { type LogCategory } from '../content/logs'
import styles from './LogList.module.css'

const ALL = '전체' as const
type Filter = typeof ALL | LogCategory

const CATEGORIES: Filter[] = [
  '전체',
  '온보딩',
  '레벨0',
  '레벨1',
  '레벨3',
  '소프트스킬',
  '코치훈련',
]

const CATEGORY_SLUG: Record<Filter, string> = {
  '전체': '',
  '온보딩': 'onboarding',
  '레벨0': 'level0',
  '레벨1': 'level1',
  '레벨3': 'level3',
  '소프트스킬': 'softskill',
  '코치훈련': 'coaching',
}

const SLUG_TO_CATEGORY: Record<string, Filter> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG)
    .filter(([, slug]) => slug !== '')
    .map(([cat, slug]) => [slug, cat as Filter])
)

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  return `${year}.${month}`
}

function getCategoryFromURL(): Filter {
  if (typeof window === 'undefined') return '전체'
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('category')
  if (!slug) return '전체'
  return SLUG_TO_CATEGORY[slug] ?? '전체'
}

export function LogList() {
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

  const filtered = logs
    .filter((log) => selected === '전체' || log.category === selected)
    .sort((a, b) => b.date.localeCompare(a.date))

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
                ? logs.length
                : logs.filter((l) => l.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map((log) => (
          <a key={log.slug + log.date} href={log.href} className={styles.item}>
            <div className={styles.meta}>
              <span className={styles.date}>{formatDate(log.date)}</span>
              <span className={styles.category}>{log.category}</span>
            </div>
            <h3 className={styles.title}>{log.title}</h3>
            <p className={styles.description}>{log.description}</p>
          </a>
        ))}
        {filtered.length === 0 && (
          <p className={styles.empty}>해당 카테고리의 로그가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
