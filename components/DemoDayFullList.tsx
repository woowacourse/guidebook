'use client'

import report from '../content/education/conversations/demo-day-data.json'
import { Toggle } from './Toggle'
import styles from './DemoDayFullList.module.css'

type TranscriptStatus = 'ok' | 'no_captions' | 'private' | 'rate_limited'

interface DemoDayEntry {
  index: number
  id: string
  title: string
  duration: string
  url: string
  stage: string
  projectName: string
  cohort: string
  transcriptStatus: TranscriptStatus
}

const STAGE_ORDER = [
  '스케치 영상',
  '프로젝트 최종 데모',
  '프로젝트 5차 데모',
  '프로젝트 4차 데모',
  '프로젝트 3차 데모',
  '프로젝트 2차 데모',
  '프로젝트 1차 데모',
  '프로젝트 소개',
  '미니프로젝트',
  '비공개',
] as const

const STATUS_LABELS: Record<TranscriptStatus, string> = {
  ok: '정리본 있음',
  no_captions: '자막 없음',
  private: '비공개',
  rate_limited: '재수집 필요',
}

function stripStagePrefix(title: string) {
  return title.replace(/^\[[^\]]+\]\s*/, '').trim()
}

function statusClass(status: TranscriptStatus) {
  switch (status) {
    case 'ok':
      return `${styles.status} ${styles.statusOk}`
    case 'private':
      return `${styles.status} ${styles.statusPrivate}`
    case 'rate_limited':
      return `${styles.status} ${styles.statusRateLimited}`
    case 'no_captions':
    default:
      return `${styles.status} ${styles.statusNoCaptions}`
  }
}

export function DemoDayFullList() {
  const entries = (report.entries as DemoDayEntry[]).slice().sort((a, b) => a.index - b.index)
  const summary = report.summary as {
    totalVideos: number
    transcriptOk: number
    transcriptUnavailable: number
    transcriptStatusCounts: Partial<Record<TranscriptStatus, number>>
  }

  return (
    <div className={styles.root}>
      <p className={styles.summary}>
        전체 {summary.totalVideos}개 영상을 단계별로 펼쳐볼 수 있습니다. 현재 정리본 기준으로는{' '}
        {summary.transcriptOk}개 영상에 자막 정리본이 있고, 나머지 {summary.transcriptUnavailable}개는
        비공개 또는 자막 없음 상태로 표시했습니다.
      </p>

      {STAGE_ORDER.map((stage, index) => {
        const stageEntries = entries.filter((entry) => entry.stage === stage)

        if (stageEntries.length === 0) {
          return null
        }

        const available = stageEntries.filter((entry) => entry.transcriptStatus === 'ok').length

        return (
          <Toggle key={stage} title={`${stage} (${stageEntries.length}건)`} defaultOpen={index === 0}>
            <p className={styles.groupMeta}>
              정리본 있음 {available}건 / 상태 표시 {stageEntries.length - available}건
            </p>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>분류</th>
                    <th>프로젝트</th>
                    <th>영상</th>
                    <th>길이</th>
                    <th>자막</th>
                  </tr>
                </thead>
                <tbody>
                  {stageEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className={styles.index}>{String(entry.index).padStart(3, '0')}</td>
                      <td className={styles.category}>{entry.cohort}</td>
                      <td className={styles.project}>{entry.projectName}</td>
                      <td>
                        <a
                          className={styles.link}
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {stripStagePrefix(entry.title)}
                        </a>
                      </td>
                      <td className={styles.duration}>{entry.duration === 'NA' ? '-' : entry.duration}</td>
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
