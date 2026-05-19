'use client'

import report from '../content/education/conversations/education-briefing-data.json'
import { Toggle } from './Toggle'
import styles from './DemoDayFullList.module.css'

type TranscriptStatus = 'ok' | 'no_captions'

interface EducationBriefingEntry {
  index: number
  id: string
  displayTitle: string
  url: string
  duration: string
  year: number | null
  groupKey: string
  format: string
  transcriptStatus: TranscriptStatus
}

interface EducationBriefingGroup {
  key: string
  label: string
  description: string
  count: number
  transcriptOk: number
  transcriptUnavailable: number
  entries: EducationBriefingEntry[]
}

const STATUS_LABELS: Record<TranscriptStatus, string> = {
  ok: '정리본 있음',
  no_captions: '자막 없음',
}

function statusClass(status: TranscriptStatus) {
  switch (status) {
    case 'ok':
      return `${styles.status} ${styles.statusOk}`
    case 'no_captions':
    default:
      return `${styles.status} ${styles.statusNoCaptions}`
  }
}

function formatTitle(title: string) {
  return title
    .replace(/🪐/g, '')
    .replace(/입학설명회/g, '입학 설명회')
    .replace(/세션(\d)/g, '세션 $1')
    .replace(/\s+/g, ' ')
    .trim()
}

function categoryLabel(entry: EducationBriefingEntry) {
  if (entry.year) {
    return String(entry.year)
  }

  if (entry.groupKey === 'coach_chat') {
    return '라이브'
  }

  return '교육설명회'
}

export function EducationBriefingFullList() {
  const groups = report.groups as EducationBriefingGroup[]
  const summary = report.summary as {
    totalVideos: number
    transcriptOk: number
    transcriptUnavailable: number
  }

  return (
    <div className={styles.root}>
      <p className={styles.summary}>
        전체 {summary.totalVideos}개 영상을 묶음별로 펼쳐볼 수 있습니다. 현재 자막 정리본은{' '}
        {summary.transcriptOk}개 영상에 있고, 나머지 {summary.transcriptUnavailable}개는 자막 없음
        상태로 표시했습니다.
      </p>

      {groups.map((group, index) => {
        const entries = group.entries.slice().sort((a, b) => a.index - b.index)

        return (
          <Toggle
            key={group.key}
            title={`${group.label} (${group.count}건)`}
            defaultOpen={index === 0}
          >
            <p className={styles.groupMeta}>
              {group.description} 정리본 있음 {group.transcriptOk}건 / 상태 표시{' '}
              {group.transcriptUnavailable}건
            </p>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>구분</th>
                    <th>형식</th>
                    <th>영상</th>
                    <th>길이</th>
                    <th>자막</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className={styles.index}>{String(entry.index).padStart(2, '0')}</td>
                      <td className={styles.category}>{categoryLabel(entry)}</td>
                      <td className={styles.project}>{entry.format}</td>
                      <td>
                        <a
                          className={styles.link}
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatTitle(entry.displayTitle)}
                        </a>
                      </td>
                      <td className={styles.duration}>{entry.duration}</td>
                      <td>
                        <span className={statusClass(entry.transcriptStatus)}>
                          {STATUS_LABELS[entry.transcriptStatus]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Toggle>
        )
      })}
    </div>
  )
}
