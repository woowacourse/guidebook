import type { ReactNode } from 'react'
import styles from './Timeline.module.css'

type TimelineItemStatus = 'completed' | 'active' | 'upcoming'

interface TimelineItemProps {
  date: string
  title: string
  status?: TimelineItemStatus
  children?: ReactNode
}

interface TimelineProps {
  children: ReactNode
}

export function TimelineItem({
  date,
  title,
  status = 'upcoming',
  children,
}: TimelineItemProps) {
  return (
    <div className={`${styles.item} ${styles[status]}`}>
      <div className={styles.marker}>
        <span className={styles.dot} />
        <span className={styles.line} />
      </div>
      <div className={styles.content}>
        <span className={styles.date}>{date}</span>
        <h4 className={styles.title}>{title}</h4>
        {children && <div className={styles.description}>{children}</div>}
      </div>
    </div>
  )
}

export function Timeline({ children }: TimelineProps) {
  return <div className={styles.timeline}>{children}</div>
}
