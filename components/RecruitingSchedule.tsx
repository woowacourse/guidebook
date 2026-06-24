import recruiting from '../content/recruiting'
import { Timeline, TimelineItem } from './Timeline'
import styles from './RecruitingSchedule.module.css'

export function RecruitingSchedule() {
  const { year, cohort, schedule, questions, infoSessionUrl } = recruiting

  return (
    <div className={styles.wrap}>
      <Timeline label={`${year} 신입생 (${cohort}) 선발 일정`}>
        {schedule.map((s) => (
          <TimelineItem key={s.phase} date={s.period} title={s.phase}>
            {s.note}
          </TimelineItem>
        ))}
      </Timeline>

      {infoSessionUrl && (
        <p className={styles.info}>
          <a href={infoSessionUrl} target="_blank" rel="noreferrer">
            입학 설명회 라이브 영상 →
          </a>
        </p>
      )}

      {questions.length > 0 && (
        <div className={styles.questions}>
          <h3>미리 생각해 볼 질문</h3>
          <ul>
            {questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
