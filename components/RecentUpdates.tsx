import updates from '../content/updates'
import { Timeline, TimelineItem } from './Timeline'

// limit 을 주면 최신 N개만 보여주고 전체는 /timeline 으로 넘긴다.
// (how-its-made 처럼 "갱신된다는 사실"만 보이면 되는 곳에서 스크롤 폭주 방지)
export function RecentUpdates({ limit }: { limit?: number }) {
  const items = limit ? updates.slice(0, limit) : updates
  const hasMore = limit != null && updates.length > limit

  return (
    <>
      <Timeline label="최근 업데이트">
        {items.map((item) => (
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
      {hasMore && (
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem' }}>
          <a href="/timeline">전체 {updates.length}개 업데이트 보기 →</a>
        </p>
      )}
    </>
  )
}
