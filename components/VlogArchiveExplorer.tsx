'use client'

import { useState } from 'react'
import report from '../content/education/conversations/vlog-data.json'
import styles from './VlogArchiveExplorer.module.css'

type TranscriptStatus = 'ok' | 'no_captions' | 'rate_limited' | 'missing'

interface VlogCategory {
  id: string
  label: string
  description: string
  count: number
}

interface VlogEntry {
  index: number
  id: string
  title: string
  url: string
  duration: string
  categoryId: string
  categoryLabel: string
  tags: string[]
  summary: string
  audienceNeeds: string[]
  transcriptStatus: TranscriptStatus
  transcriptStatusLabel: string
  transcriptNote: string
}

interface VlogSummary {
  totalVideos: number
  totalDurationLabel: string
  transcriptOk: number
  transcriptUnavailable: number
  tagCounts: Record<string, number>
}

function statusClass(status: TranscriptStatus) {
  switch (status) {
    case 'ok':
      return `${styles.status} ${styles.statusOk}`
    case 'rate_limited':
      return `${styles.status} ${styles.statusRetry}`
    case 'no_captions':
      return `${styles.status} ${styles.statusNoCaptions}`
    case 'missing':
    default:
      return `${styles.status} ${styles.statusMissing}`
  }
}

export function VlogArchiveExplorer() {
  const entries = report.entries as VlogEntry[]
  const categories = report.categories as VlogCategory[]
  const summary = report.summary as VlogSummary
  const tagCounts = Object.entries(summary.tagCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
    .slice(0, 14)

  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [tag, setTag] = useState('all')

  const normalizedQuery = query.trim().toLowerCase()
  const filteredEntries = entries.filter((entry) => {
    const matchesCategory = categoryId === 'all' || entry.categoryId === categoryId
    const matchesTag = tag === 'all' || entry.tags.includes(tag)
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [entry.title, entry.summary, entry.categoryLabel, ...entry.tags, ...entry.audienceNeeds]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)

    return matchesCategory && matchesTag && matchesQuery
  })

  return (
    <div className={styles.root}>
      <p className={styles.summary}>
        전체 {summary.totalVideos}개 영상, 총 {summary.totalDurationLabel}. 현재 기준으로{' '}
        {summary.transcriptOk}개는 자막 정리본이 있고, 나머지 {summary.transcriptUnavailable}개는
        상태만 표시해 두었습니다.
      </p>

      <div className={styles.controls}>
        <label className={styles.searchLabel}>
          <span className={styles.controlTitle}>검색</span>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 방학식, 캠퍼스, 테코톡, 마무리, 리뷰"
          />
        </label>

        <div className={styles.filterGroup}>
          <p className={styles.controlTitle}>카테고리</p>
          <div className={styles.chips}>
            <button
              type="button"
              className={categoryId === 'all' ? `${styles.chip} ${styles.chipActive}` : styles.chip}
              onClick={() => setCategoryId('all')}
            >
              전체 ({summary.totalVideos})
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={
                  categoryId === category.id ? `${styles.chip} ${styles.chipActive}` : styles.chip
                }
                onClick={() => setCategoryId(category.id)}
                title={category.description}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <p className={styles.controlTitle}>자주 찾는 키워드</p>
          <div className={styles.chips}>
            <button
              type="button"
              className={tag === 'all' ? `${styles.chip} ${styles.chipActive}` : styles.chip}
              onClick={() => setTag('all')}
            >
              전체
            </button>
            {tagCounts.map(([keyword, count]) => (
              <button
                key={keyword}
                type="button"
                className={tag === keyword ? `${styles.chip} ${styles.chipActive}` : styles.chip}
                onClick={() => setTag(keyword)}
              >
                {keyword} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className={styles.resultMeta}>
        현재 조건에 맞는 영상 {filteredEntries.length}개
      </p>

      <div className={styles.list}>
        {filteredEntries.map((entry) => (
          <article key={entry.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <p className={styles.index}>#{String(entry.index).padStart(2, '0')}</p>
                <a className={styles.link} href={entry.url} target="_blank" rel="noreferrer">
                  {entry.title}
                </a>
              </div>
              <span className={styles.duration}>{entry.duration}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.category}>{entry.categoryLabel}</span>
              <span className={statusClass(entry.transcriptStatus)}>{entry.transcriptStatusLabel}</span>
            </div>

            <p className={styles.description}>{entry.summary}</p>
            <p className={styles.needs}>이런 궁금증에 맞아요: {entry.audienceNeeds.join(' · ')}</p>

            <div className={styles.tags}>
              {entry.tags.map((keyword) => (
                <span key={keyword} className={styles.tag}>
                  {keyword}
                </span>
              ))}
            </div>

            {entry.transcriptNote ? <p className={styles.note}>{entry.transcriptNote}</p> : null}
          </article>
        ))}
      </div>
    </div>
  )
}
