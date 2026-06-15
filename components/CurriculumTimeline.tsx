import curriculumHistory from '../content/curriculum-history'
import { Timeline, TimelineItem } from './Timeline'
import styles from './CurriculumTimeline.module.css'

// content/curriculum-history.ts 를 연도별 타임라인으로 렌더링한다.
// 데이터 → 표현의 얇은 매퍼. 원본/상세는 knowledge/wiki/curriculum-evolution.md.
export function CurriculumTimeline() {
  const latestYear = Math.max(...curriculumHistory.map((y) => y.year))

  return (
    <Timeline label="연도별 변화">
      {curriculumHistory.map((year) => (
        <TimelineItem
          key={year.year}
          date={String(year.year)}
          title={year.headline}
          status={year.year === latestYear ? 'active' : 'completed'}
        >
          <div className={year.depth === 'sparse' ? styles.sparse : undefined}>
            <p className={styles.change}>
              {year.cohort && <span className={styles.badge}>{year.cohort}</span>}
              {year.change}
              {year.depth === 'sparse' && (
                <span className={styles.chip}>기록 보강 중</span>
              )}
            </p>
            <ul className={styles.highlights}>
              {year.highlights.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
            {year.detailHref && (
              <a className={styles.detailLink} href={year.detailHref}>
                자세히 →
              </a>
            )}
          </div>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
