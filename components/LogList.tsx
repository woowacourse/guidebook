'use client'

import { useState } from 'react'
import logs, { type LogCategory } from '../content/logs'
import styles from './LogList.module.css'

const ALL = '전체' as const
type Filter = typeof ALL | LogCategory

const CATEGORIES: Filter[] = ['전체', '온보딩', '레벨0', '레벨1', '소프트스킬', '코치훈련']

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  return `${year}.${month}`
}

export function LogList() {
  const [selected, setSelected] = useState<Filter>('전체')

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
            onClick={() => setSelected(cat)}
          >
            {cat}
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
