'use client'

import { useState } from 'react'
import styles from './CrewVoiceMap.module.css'
import { crewThemes, crewThemesAreExample } from '../content/crew-voices'

/**
 * CrewVoiceMap — "크루들이 가장 많이 한 말"을 별자리로.
 * 크루의 말 = 별(크기=빈도), 별들을 잇는 선이 별자리를 만든다.
 * Hero 별 모티프("크루가 별이 되길")를 그대로 시각화한다.
 * 호버/포커스/탭하면 대표 문장이 아래 캡션에 뜬다. 데이터: content/crew-voices.ts
 */

// 별자리 좌표(%, 결정적) — 빈도 내림차순 기준 배치. 큰 별이 가운데 위쪽.
const POS = [
  [48, 28],
  [26, 50],
  [72, 38],
  [40, 72],
  [64, 63],
  [16, 76],
  [84, 70]
]

export function CrewVoiceMap() {
  const themes = [...crewThemes].sort((a, b) => b.count - a.count)
  const [activeKey, setActiveKey] = useState(themes[0]?.key)
  const active = themes.find((t) => t.key === activeKey) ?? themes[0]

  const max = Math.max(...themes.map((t) => t.count))
  const min = Math.min(...themes.map((t) => t.count))
  // 빈도 → 별 크기(px). 제곱근 스케일로 큰 값의 지배를 누른다 (18 ~ 48px)
  const starPx = (count: number) => Math.round(18 + Math.sqrt((count - min) / (max - min || 1)) * 30)

  const linePoints = themes.map((_, i) => (POS[i] ?? [50, 50]).join(',')).join(' ')

  return (
    <section className={styles.section} aria-label="크루들이 가장 많이 한 말">
      <h2 className={styles.heading}>크루들이 가장 많이 한 말</h2>
      <p className={styles.sub}>
        자주 나온 말일수록 큰 별이 됩니다
        {crewThemesAreExample && <span className={styles.tag}>예시 미리보기</span>}
      </p>

      <div className={styles.field}>
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points={linePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="3 3"
          />
        </svg>

        {themes.map((t, i) => {
          const [x, y] = POS[i] ?? [50, 50]
          const isActive = t.key === active?.key
          const px = starPx(t.count)
          return (
            <button
              key={t.key}
              type="button"
              className={isActive ? `${styles.star} ${styles.on}` : styles.star}
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setActiveKey(t.key)}
              onFocus={() => setActiveKey(t.key)}
              onClick={() => setActiveKey(t.key)}
              aria-pressed={isActive}
            >
              <svg width={px} height={px} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 1.7l2.85 6.5 7.15.6-5.45 4.65 1.7 6.85L12 17.1 5.75 20.7l1.7-6.85L2 8.8l7.15-.6z" />
              </svg>
              <span className={styles.lab}>{t.label}</span>
              <span className={styles.ct}>{t.count}</span>
            </button>
          )
        })}
      </div>

      {active && (
        <figure className={styles.cap} aria-live="polite">
          <blockquote className={styles.quote}>{active.quote}</blockquote>
          <figcaption className={styles.meta}>
            {active.label} · 비슷한 메시지 {active.count}건
          </figcaption>
        </figure>
      )}

      <p className={styles.more}>
        <a href="/education/conversations/crew-voices">크루의 목소리 전체 보기 →</a>
      </p>
    </section>
  )
}
