import recruiting from '../content/recruiting'
import styles from './RecruitingStatus.module.css'

export function RecruitingStatus() {
  const { cohort, year, status, applyUrl } = recruiting
  const isOpen = status === '모집중'

  return (
    <div className={styles.box} data-status={status}>
      <span className={styles.badge}>{status}</span>
      <span className={styles.label}>
        {year} 신입생 ({cohort})
      </span>
      {isOpen && applyUrl && (
        <a
          className={styles.cta}
          href={applyUrl}
          target="_blank"
          rel="noreferrer"
        >
          지원하기 →
        </a>
      )}
    </div>
  )
}
