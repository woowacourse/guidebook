'use client'

import { useState } from 'react'
import report from '../content/education/conversations/tecoble-data.json'
import styles from './TecobleArchiveExplorer.module.css'

interface TecobleTagCount {
  label: string
  count: number
}

interface TecobleCohortCount {
  label: string
  count: number
}

interface TecobleAuthor {
  name: string
  bio: string
}

interface TecobleEntry {
  index: number
  title: string
  url: string
  slug: string
  date: string
  year: string
  readingTime: number
  excerpt: string
  authors: TecobleAuthor[]
  primaryAuthor: string
  cohort: string
  tags: string[]
  normalizedTags: string[]
}

interface TecobleSummary {
  totalPosts: number
  totalAuthors: number
  firstPublishedAt: string
  lastPublishedAt: string
  cohortCounts: TecobleCohortCount[]
  topTags: TecobleTagCount[]
}

const entries = report.entries as TecobleEntry[]
const summary = report.summary as TecobleSummary

function formatDate(date: string) {
  return date.replaceAll('-', '.')
}

function matchesQuery(entry: TecobleEntry, query: string) {
  if (!query) {
    return true
  }

  const text = [
    entry.title,
    entry.excerpt,
    entry.cohort,
    entry.authors.map((author) => author.name).join(' '),
    entry.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()

  return text.includes(query)
}

export function TecobleArchiveExplorer() {
  const [query, setQuery] = useState('')
  const [selectedCohort, setSelectedCohort] = useState('all')
  const [selectedTag, setSelectedTag] = useState('all')

  const normalizedQuery = query.trim().toLowerCase()
  const highlightedTags = summary.topTags.slice(0, 12)

  const filteredEntries = entries.filter((entry) => {
    const matchesCohort = selectedCohort === 'all' || entry.cohort === selectedCohort
    const matchesTag = selectedTag === 'all' || entry.normalizedTags.includes(selectedTag)

    return matchesCohort && matchesTag && matchesQuery(entry, normalizedQuery)
  })

  return (
    <div className={styles.root}>
      <div className={styles.summaryGrid}>
        <section className={styles.summaryCard}>
          <span className={styles.summaryLabel}>전체 글</span>
          <strong className={styles.summaryValue}>{summary.totalPosts}편</strong>
        </section>
        <section className={styles.summaryCard}>
          <span className={styles.summaryLabel}>필자</span>
          <strong className={styles.summaryValue}>{summary.totalAuthors}명</strong>
        </section>
        <section className={styles.summaryCard}>
          <span className={styles.summaryLabel}>첫 글</span>
          <strong className={styles.summaryValue}>{formatDate(summary.firstPublishedAt)}</strong>
        </section>
        <section className={styles.summaryCard}>
          <span className={styles.summaryLabel}>마지막 글</span>
          <strong className={styles.summaryValue}>{formatDate(summary.lastPublishedAt)}</strong>
        </section>
      </div>

      <p className={styles.summary}>
        검색어, 기수, 태그를 조합해 테코블의 전체 글을 바로 훑어볼 수 있습니다. 목록은 원문 사이트의
        공개 메타데이터 스냅샷을 바탕으로 구성했습니다.
      </p>

      <div className={styles.controls}>
        <label className={styles.searchLabel}>
          <span className={styles.controlTitle}>검색</span>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: Spring, 동시성, 테스트, JPA, React"
          />
        </label>

        <div className={styles.filterGroup}>
          <p className={styles.controlTitle}>기수</p>
          <div className={styles.chips}>
            <button
              type="button"
              className={selectedCohort === 'all' ? `${styles.chip} ${styles.chipActive}` : styles.chip}
              onClick={() => setSelectedCohort('all')}
            >
              전체 ({summary.totalPosts})
            </button>
            {summary.cohortCounts.map((cohort) => (
              <button
                key={cohort.label}
                type="button"
                className={
                  selectedCohort === cohort.label ? `${styles.chip} ${styles.chipActive}` : styles.chip
                }
                onClick={() => setSelectedCohort(cohort.label)}
              >
                {cohort.label} ({cohort.count})
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <p className={styles.controlTitle}>자주 나온 태그</p>
          <div className={styles.chips}>
            <button
              type="button"
              className={selectedTag === 'all' ? `${styles.chip} ${styles.chipActive}` : styles.chip}
              onClick={() => setSelectedTag('all')}
            >
              전체
            </button>
            {highlightedTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                className={selectedTag === tag.label ? `${styles.chip} ${styles.chipActive}` : styles.chip}
                onClick={() => setSelectedTag(tag.label)}
              >
                {tag.label} ({tag.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className={styles.resultMeta}>현재 조건에 맞는 글 {filteredEntries.length}편</p>

      <div className={styles.list}>
        {filteredEntries.map((entry) => (
          <article key={entry.slug} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <p className={styles.index}>#{String(entry.index).padStart(3, '0')}</p>
                <a className={styles.link} href={entry.url} target="_blank" rel="noreferrer">
                  {entry.title}
                </a>
              </div>
              <span className={styles.date}>{formatDate(entry.date)}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.badge}>{entry.cohort}</span>
              <span className={styles.metaText}>{entry.authors.map((author) => author.name).join(', ')}</span>
              <span className={styles.metaText}>{entry.readingTime} min read</span>
            </div>

            <p className={styles.excerpt}>{entry.excerpt}</p>

            <div className={styles.tags}>
              {entry.tags.map((tag) => (
                <span key={`${entry.slug}-${tag}`} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
