'use client'

import { useEffect, useState } from 'react'
import logs, {
  filterLogs,
  getLogBadges,
  isLevelPhase,
  PRIMARY_TABS,
  TRACKS,
  type LogPrimaryCategory,
  type LogTrackFilter,
} from '../content/logs'
import styles from './LogList.module.css'

const ALL = '전체' as const

const PRIMARY_SLUG: Record<LogPrimaryCategory, string> = {
  '전체': '',
  '온보딩': 'onboarding',
  '레벨0': 'level0',
  '레벨1': 'level1',
  '레벨2': 'level2',
  '레벨3': 'level3',
  '레벨4': 'level4',
  '레벨5': 'level5',
  '소프트스킬': 'soft-skill',
  '웹 백엔드': 'web-backend',
  '웹 프론트엔드': 'web-frontend',
  '모바일': 'mobile',
  '코치훈련': 'coach-training',
}

const TRACK_SLUG: Record<LogTrackFilter, string> = {
  '전체': '',
  '웹 백엔드': 'web-backend',
  '웹 프론트엔드': 'web-frontend',
  '모바일': 'mobile',
}

const SLUG_TO_PRIMARY = Object.fromEntries(
  Object.entries(PRIMARY_SLUG)
    .filter(([, slug]) => slug !== '')
    .map(([category, slug]) => [slug, category as LogPrimaryCategory])
)

const SLUG_TO_TRACK = Object.fromEntries(
  Object.entries(TRACK_SLUG)
    .filter(([, slug]) => slug !== '')
    .map(([track, slug]) => [slug, track as LogTrackFilter])
)

interface LogListProps {
  fixedPrimary?: LogPrimaryCategory
  fixedTrack?: LogTrackFilter
  showPrimaryTabs?: boolean
  showTrackTabs?: boolean
  syncUrl?: boolean
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  return `${year}.${month}`
}

function getSelectionFromURL(): {
  primary: LogPrimaryCategory
  track: LogTrackFilter
} {
  if (typeof window === 'undefined') {
    return { primary: '전체', track: '전체' }
  }

  const params = new URLSearchParams(window.location.search)
  const primarySlug = params.get('primary')
  const legacyCategorySlug = params.get('category')
  const trackSlug = params.get('track')

  const primary =
    (primarySlug && SLUG_TO_PRIMARY[primarySlug]) ||
    (legacyCategorySlug && SLUG_TO_PRIMARY[legacyCategorySlug]) ||
    '전체'

  const track = (trackSlug && SLUG_TO_TRACK[trackSlug]) || '전체'

  if (!isLevelPhase(primary)) {
    return { primary, track: '전체' }
  }

  return { primary, track }
}

function replaceUrl(primary: LogPrimaryCategory, track: LogTrackFilter) {
  const url = new URL(window.location.href)
  const primarySlug = PRIMARY_SLUG[primary]
  const trackSlug = TRACK_SLUG[track]

  if (primarySlug) {
    url.searchParams.set('primary', primarySlug)
  } else {
    url.searchParams.delete('primary')
  }

  url.searchParams.delete('category')

  if (isLevelPhase(primary) && trackSlug) {
    url.searchParams.set('track', trackSlug)
  } else {
    url.searchParams.delete('track')
  }

  window.history.replaceState(null, '', url.toString())
}

export function LogList({
  fixedPrimary,
  fixedTrack,
  showPrimaryTabs = true,
  showTrackTabs = true,
  syncUrl = true,
}: LogListProps) {
  const [selectedPrimary, setSelectedPrimary] = useState<LogPrimaryCategory>(
    fixedPrimary ?? '전체'
  )
  const [selectedTrack, setSelectedTrack] = useState<LogTrackFilter>(fixedTrack ?? '전체')

  useEffect(() => {
    if (!syncUrl || fixedPrimary || fixedTrack) return

    const { primary, track } = getSelectionFromURL()
    setSelectedPrimary(primary)
    setSelectedTrack(track)
  }, [fixedPrimary, fixedTrack, syncUrl])

  const primary = fixedPrimary ?? selectedPrimary
  const track = fixedTrack ?? selectedTrack
  const trackTabsVisible = showTrackTabs && isLevelPhase(primary) && !fixedTrack

  const filtered = filterLogs(logs, primary, track).sort((a, b) => b.date.localeCompare(a.date))

  function handlePrimarySelect(nextPrimary: LogPrimaryCategory) {
    if (fixedPrimary) return

    const nextTrack: LogTrackFilter = isLevelPhase(nextPrimary) ? selectedTrack : '전체'
    const normalizedTrack = isLevelPhase(nextPrimary) ? nextTrack : '전체'

    setSelectedPrimary(nextPrimary)
    setSelectedTrack(normalizedTrack)

    if (syncUrl) {
      replaceUrl(nextPrimary, normalizedTrack)
    }
  }

  function handleTrackSelect(nextTrack: LogTrackFilter) {
    if (fixedTrack) return

    setSelectedTrack(nextTrack)

    if (syncUrl) {
      replaceUrl(primary, nextTrack)
    }
  }

  return (
    <div className={styles.container}>
      {showPrimaryTabs && (
        <div className={styles.tabs} role="tablist" aria-label="실험 로그 분류">
          {PRIMARY_TABS.map((category) => (
            <button
              key={category}
              role="tab"
              aria-selected={primary === category}
              className={`${styles.tab} ${primary === category ? styles.tabActive : ''}`}
              onClick={() => handlePrimarySelect(category)}
            >
              {category}
              <span className={styles.count}>{filterLogs(logs, category).length}</span>
            </button>
          ))}
        </div>
      )}

      {trackTabsVisible && (
        <div className={styles.subtabs} role="tablist" aria-label="트랙 필터">
          {[ALL, ...TRACKS].map((trackTab) => (
            <button
              key={trackTab}
              role="tab"
              aria-selected={track === trackTab}
              className={`${styles.subtab} ${track === trackTab ? styles.subtabActive : ''}`}
              onClick={() => handleTrackSelect(trackTab)}
            >
              {trackTab}
              <span className={styles.count}>{filterLogs(logs, primary, trackTab).length}</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.list}>
        {filtered.map((log) => (
          <a key={log.slug + log.date} href={log.href} className={styles.item}>
            <div className={styles.meta}>
              <span className={styles.date}>{formatDate(log.date)}</span>
              <div className={styles.badges}>
                {getLogBadges(log).map((badge) => (
                  <span key={`${log.slug}-${badge}`} className={styles.category}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <h3 className={styles.title}>{log.title}</h3>
            <p className={styles.description}>{log.description}</p>
          </a>
        ))}
        {filtered.length === 0 && (
          <p className={styles.empty}>해당 분류에 표시할 실험 로그가 아직 없습니다.</p>
        )}
      </div>
    </div>
  )
}
