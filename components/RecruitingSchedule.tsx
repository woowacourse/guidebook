import recruiting from '../content/recruiting'
import { Timeline, TimelineItem } from './Timeline'
import { Embed } from './Embed'
import { Callout } from './Callout'
import styles from './RecruitingSchedule.module.css'

function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    const id =
      u.searchParams.get('v') ||
      (u.hostname.includes('youtu.be') ? u.pathname.slice(1) : null)
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  } catch {
    return null
  }
}

export function RecruitingSchedule() {
  const { year, cohort, schedule, questions, infoSessionUrl } = recruiting
  const infoSessionEmbed = infoSessionUrl ? toYouTubeEmbed(infoSessionUrl) : null

  return (
    <div className={styles.wrap}>
      <Timeline label={`${year} 신입생 (${cohort}) 선발 일정`}>
        {schedule.map((s) => (
          <TimelineItem key={s.phase} date={s.period} title={s.phase}>
            {s.note}
          </TimelineItem>
        ))}
      </Timeline>

      {infoSessionEmbed && (
        <div className={styles.info}>
          <h3>입학 설명회 라이브 영상</h3>
          <Embed src={infoSessionEmbed} title="입학 설명회 라이브 영상" />
        </div>
      )}

      {questions.length > 0 && (
        <Callout type="note" emoji="💭">
          <p>
            <strong>미리 생각해 볼 질문</strong>
          </p>
          {questions.map((q) => (
            <p key={q}>{q}</p>
          ))}
        </Callout>
      )}
    </div>
  )
}
