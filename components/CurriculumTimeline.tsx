'use client'

import { Fragment, useState } from 'react'
import cohorts, {
  LEVELS_BY_TRACK,
  TRACK_ORDER,
  type TrackKey,
} from '../content/curriculum-history'
import styles from './CurriculumTimeline.module.css'

// content/curriculum-history.ts 를 기수별 커리큘럼 뷰로 렌더링한다.
// 기수 스텝퍼 → 그 해의 핵심 + 트랙 토글 + 레벨 0~5.
// 원본/상세는 llm-wiki/wiki/curriculum-evolution.md.
export function CurriculumTimeline() {
  const latest = cohorts.reduce((m, c, i) => (c.year >= cohorts[m].year ? i : m), 0)
  const [active, setActive] = useState(latest)
  const [track, setTrack] = useState<TrackKey>('웹 프론트엔드')

  const cohort = cohorts[active]
  const tracks = TRACK_ORDER.filter((t) => cohort.tracks.includes(t))
  const effectiveTrack = tracks.includes(track) ? track : tracks[0]
  const levels = LEVELS_BY_TRACK[effectiveTrack]

  return (
    <div className={styles.root}>
      <div className={styles.stepper} role="tablist" aria-label="기수 선택">
        {cohorts.map((c, i) => (
          <Fragment key={c.gi}>
            {i > 0 && <span className={styles.conn} aria-hidden />}
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
              <span className={styles.gi}>{c.gi}기</span>
              <span className={styles.dot} />
              <span className={styles.yr}>{c.year}</span>
            </button>
          </Fragment>
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.ptitle}>
          <span className={styles.pgi}>{cohort.gi}기</span>
          <span className={styles.pyr}>· {cohort.year}</span>
          {cohort.current && <span className={styles.badgeNow}>진행 중</span>}
          {cohort.depth === 'sparse' && <span className={styles.chip}>기록 보강 중</span>}
        </div>

        <div className={styles.core}>
          <span className={styles.coreLbl}>이 해의 핵심</span>
          <ul>
            {cohort.core.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>

        <div className={styles.tracks} role="tablist" aria-label="트랙 선택">
          {tracks.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === effectiveTrack}
              className={[styles.trk, t === effectiveTrack ? styles.trkOn : ''].join(' ')}
              onClick={() => setTrack(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.levels}>
          {levels.map((l) => (
            <div key={l.level} className={styles.lv}>
              <div className={styles.lvtag}>
                {l.level}
                <small>{l.stage}</small>
              </div>
              <div>
                <div className={styles.lvname}>{l.name}</div>
                <div className={styles.lvdesc}>{l.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p className={styles.legend}>
          ▸ {effectiveTrack} · 레벨 골격은 현재 기준(공식 페이지). 기수별 차이는 ‘이 해의 핵심’에 표시.
        </p>
      </div>
    </div>
  )
}
