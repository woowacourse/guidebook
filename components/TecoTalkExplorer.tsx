'use client'

import { useEffect, useState } from 'react'
import report from '../content/education/conversations/techtalk-data.json'
import styles from './TecoTalkExplorer.module.css'

type SortKey = 'popular' | 'recent' | 'shortest' | 'longest'

interface TecoTalkTag {
  label: string
  count: number
}

interface TecoTalkRecommendation {
  id: string
  title: string
  topic: string
  speaker: string
  url: string
  viewCount: number
}

interface TecoTalkCategory {
  id: string
  name: string
  description: string
  focusKeywords: string[]
  count: number
  topTags: TecoTalkTag[]
  recommendations: TecoTalkRecommendation[]
}

interface TecoTalkEntry {
  index: number
  id: string
  title: string
  speaker: string
  topic: string
  duration: string
  durationSeconds: number
  viewCount: number
  url: string
  categoryId: string
  tags: string[]
}

const categories = report.categories as TecoTalkCategory[]
const entries = report.entries as TecoTalkEntry[]
const topTags = report.summary.topTags as TecoTalkTag[]
const availableTags = new Set([
  ...topTags.map((tag) => tag.label),
  ...entries.flatMap((entry) => entry.tags),
])

const SORT_LABELS: Record<SortKey, string> = {
  popular: '인기순',
  recent: '최근 추가순',
  shortest: '짧은 순',
  longest: '긴 순',
}

const initialVisibleCount = 60

function formatViewCount(viewCount: number) {
  return `${new Intl.NumberFormat('ko-KR').format(viewCount)}회`
}

function matchesQuery(entry: TecoTalkEntry, query: string) {
  if (!query) {
    return true
  }

  const searchableText = [
    entry.title,
    entry.topic,
    entry.speaker,
    entry.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()

  return searchableText.includes(query)
}

function sortEntries(left: TecoTalkEntry, right: TecoTalkEntry, sortKey: SortKey) {
  switch (sortKey) {
    case 'recent':
      return left.index - right.index
    case 'shortest':
      return left.durationSeconds - right.durationSeconds
    case 'longest':
      return right.durationSeconds - left.durationSeconds
    case 'popular':
    default:
      if (right.viewCount !== left.viewCount) {
        return right.viewCount - left.viewCount
      }
      return left.index - right.index
  }
}

export function TecoTalkExplorer() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('popular')
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount)

  useEffect(() => {
    setVisibleCount(initialVisibleCount)
  }, [query, selectedCategory, selectedTag, sortKey])

  const normalizedQuery = query.trim().toLowerCase()

  const filteredEntries = entries
    .filter((entry) => {
      if (selectedCategory !== 'all' && entry.categoryId !== selectedCategory) {
        return false
      }

      if (selectedTag !== 'all' && !entry.tags.includes(selectedTag)) {
        return false
      }

      return matchesQuery(entry, normalizedQuery)
    })
    .slice()
    .sort((left, right) => sortEntries(left, right, sortKey))

  const visibleEntries = filteredEntries.slice(0, visibleCount)
  const visibleCategory = selectedCategory === 'all'
    ? null
    : categories.find((category) => category.id === selectedCategory) ?? null

  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div>
          <p className={styles.kicker}>카테고리로 훑고, 키워드로 좁히기</p>
          <h3 className={styles.heading}>테코톡 탐색기</h3>
          <p className={styles.lead}>
            관심 있는 주제를 먼저 누르고, 검색어를 얹어 빠르게 좁혀 보세요. 예: `Spring`,
            `React`, `코루틴`, `웹소켓`, `인덱스`, `HTTP`, `Git`, `AI`
          </p>
        </div>
        <div className={styles.summaryBox}>
          <div>
            <span className={styles.summaryLabel}>전체 영상</span>
            <strong className={styles.summaryValue}>{report.summary.totalVideos}개</strong>
          </div>
          <div>
            <span className={styles.summaryLabel}>총 분량</span>
            <strong className={styles.summaryValue}>{report.summary.totalDuration}</strong>
          </div>
        </div>
      </div>

      <div className={styles.categoryGrid}>
        {categories.map((category) => {
          const isActive = selectedCategory === category.id

          return (
            <section
              key={category.id}
              className={`${styles.categoryCard} ${isActive ? styles.categoryCardActive : ''}`}
            >
              <div className={styles.categoryHeader}>
                <div>
                  <h4 className={styles.categoryTitle}>{category.name}</h4>
                  <p className={styles.categoryDescription}>{category.description}</p>
                </div>
                <span className={styles.categoryCount}>{category.count}편</span>
              </div>

              <div className={styles.pillRow}>
                {category.focusKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    className={`${styles.pill} ${
                      selectedTag === keyword || normalizedQuery === keyword.toLowerCase() ? styles.pillActive : ''
                    }`}
                    onClick={() => {
                      if (availableTags.has(keyword)) {
                        setSelectedTag((current) => (current === keyword ? 'all' : keyword))
                        setQuery('')
                        return
                      }

                      setQuery((current) =>
                        current.trim().toLowerCase() === keyword.toLowerCase() ? '' : keyword,
                      )
                      setSelectedTag('all')
                    }}
                  >
                    {keyword}
                  </button>
                ))}
              </div>

              {category.recommendations.length > 0 ? (
                <div className={styles.recommendations}>
                  {category.recommendations.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.recommendationLink}
                    >
                      <span className={styles.recommendationTopic}>{item.topic}</span>
                      <span className={styles.recommendationMeta}>
                        {item.speaker ? `${item.speaker} · ` : ''}
                        {formatViewCount(item.viewCount)}
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                className={`${styles.filterButton} ${isActive ? styles.filterButtonActive : ''}`}
                onClick={() => setSelectedCategory((current) => (current === category.id ? 'all' : category.id))}
              >
                {isActive ? '전체 보기로 돌아가기' : `${category.name}만 보기`}
              </button>
            </section>
          )
        })}
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <span className={styles.searchLabel}>검색</span>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            placeholder="주제나 키워드를 입력하세요"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label className={styles.sortBox}>
          <span className={styles.searchLabel}>정렬</span>
          <select
            className={styles.select}
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={styles.resetButton}
          onClick={() => {
            setQuery('')
            setSelectedCategory('all')
            setSelectedTag('all')
            setSortKey('popular')
          }}
        >
          필터 초기화
        </button>
      </div>

      <div className={styles.tagSection}>
        <p className={styles.sectionLabel}>자주 찾는 키워드</p>
        <div className={styles.tagGrid}>
          <button
            type="button"
            className={`${styles.tagButton} ${selectedTag === 'all' ? styles.tagButtonActive : ''}`}
            onClick={() => setSelectedTag('all')}
          >
            전체 키워드
          </button>
          {topTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              className={`${styles.tagButton} ${selectedTag === tag.label ? styles.tagButtonActive : ''}`}
              onClick={() => setSelectedTag((current) => (current === tag.label ? 'all' : tag.label))}
            >
              {tag.label}
              <span className={styles.tagCount}>{tag.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.resultHeader}>
        <div>
          <p className={styles.sectionLabel}>탐색 결과</p>
          <h4 className={styles.resultTitle}>
            {filteredEntries.length}편
            {visibleCategory ? ` · ${visibleCategory.name}` : ' · 전체 카테고리'}
            {selectedTag !== 'all' ? ` · ${selectedTag}` : ''}
          </h4>
        </div>
        <p className={styles.resultMeta}>
          {visibleEntries.length < filteredEntries.length
            ? `상위 ${visibleEntries.length}편만 표시 중`
            : '현재 조건에 맞는 영상을 모두 표시 중'}
        </p>
      </div>

      {filteredEntries.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>조건에 맞는 영상이 아직 없습니다.</p>
          <p className={styles.emptyDescription}>
            카테고리를 해제하거나, 더 넓은 키워드로 다시 검색해 보세요.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>카테고리</th>
                  <th>발표</th>
                  <th>키워드</th>
                  <th>길이</th>
                  <th>조회수</th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => {
                  const category = categories.find((item) => item.id === entry.categoryId)

                  return (
                    <tr key={entry.id}>
                      <td className={styles.index}>{String(entry.index).padStart(3, '0')}</td>
                      <td className={styles.categoryCell}>{category?.name ?? entry.categoryId}</td>
                      <td>
                        <a
                          className={styles.entryLink}
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {entry.topic}
                        </a>
                        <div className={styles.entryMeta}>
                          {entry.speaker ? `${entry.speaker} · ` : ''}
                          원제: {entry.title}
                        </div>
                      </td>
                      <td>
                        <div className={styles.inlineTags}>
                          {entry.tags.length > 0 ? (
                            entry.tags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className={`${styles.inlineTag} ${selectedTag === tag ? styles.inlineTagActive : ''}`}
                                onClick={() => setSelectedTag((current) => (current === tag ? 'all' : tag))}
                              >
                                {tag}
                              </button>
                            ))
                          ) : (
                            <span className={styles.muted}>분류 보완 예정</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.durationCell}>{entry.duration}</td>
                      <td className={styles.viewCountCell}>{formatViewCount(entry.viewCount)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {visibleEntries.length < filteredEntries.length ? (
            <button
              type="button"
              className={styles.moreButton}
              onClick={() => setVisibleCount((current) => current + initialVisibleCount)}
            >
              결과 더 보기
            </button>
          ) : null}
        </>
      )}
    </div>
  )
}
