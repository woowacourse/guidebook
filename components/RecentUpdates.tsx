import updates from '../content/updates'
import { Timeline, TimelineItem } from './Timeline'

export function RecentUpdates() {
  return (
    <Timeline label="최근 업데이트">
      {updates.map((item) => (
        <TimelineItem
          key={item.href + item.title}
          date={item.date}
          title={item.title}
          status={item.status}
          href={item.href}
        >
          {item.description}
        </TimelineItem>
      ))}
    </Timeline>
  )
}
