'use client'

import { Fragment, useState } from 'react'
import curriculumHistory from '../content/curriculum-history'
import styles from './CurriculumTimeline.module.css'

// content/curriculum-history.ts 를 가로 연도 스텝퍼로 렌더링한다.
// 전체 흐름은 가로 한 줄, 상세는 선택한 한 해만 아래 패널에 펼친다.
// 원본/상세는 knowledge/wiki/curriculum-evolution.md.
export function CurriculumTimeline() {
  const years = curriculumHistory // 오래된 → 최신
  const latest = years.reduce((max, y, i) => (y.year >= years[max].year ? i : max), 0)
  const [active, setActive] = useState(latest)
  const year = years[active]

  return (
    <div className={styles.root}>
      <div className={styles.stepper} role="tablist" aria-label="연도 선택">
        {years.map((item, i) => (
          <Fragment key={item.year}>
            {i > 0 && <span className={styles.connector} aria-hidden />}
            <button
              type="button"
              role="tab"
              aria-selected={i === active}
              className={[
                styles.step,
                i === active ? styles.active : i < active ? styles.done : '',
              ].join(' ')}
              onClick={() => setActive(i)}
            >
              <span className={styles.yr}>{item.year}</span>
              <span className={styles.dot} />
            </button>
          </Fragment>
        ))}
      </div>

      <div className={styles.panel} role="tabpanel">
        <div className={styles.ptop}>
          <span className={styles.pyear}>{year.year}</span>
          {year.cohort && <span className={styles.badge}>{year.cohort}</span>}
          <span className={styles.phead}>· {year.headline}</span>
          {year.depth === 'sparse' && <span className={styles.chip}>기록 보강 중</span>}
        </div>
        <p className={styles.pchange}>{year.change}</p>
        <ul className={styles.highlights}>
          {year.highlights.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
        {year.detailHref && (
          <a className={styles.more} href={year.detailHref}>
            자세히 →
          </a>
        )}
      </div>
    </div>
  )
}
