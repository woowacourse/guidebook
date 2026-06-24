'use client'

import { useState } from 'react'
import styles from './CrewVoiceMap.module.css'
import { crewThemes, crewThemesAreExample } from '../content/crew-voices'

/**
 * CrewVoiceMap — "크루들이 가장 많이 한 말"을 타이포그래픽 빈도 맵으로.
 * 막대 차트 대신 글자 크기(빈도) + 불투명도(순위)로 위계를 만들고,
 * 주제를 호버/포커스/탭하면 대표 문장이 아래 캡션에 뜬다.
 * 데이터 원천: content/crew-voices.ts (crewThemes)
 */
export function CrewVoiceMap() {
  // 빈도 내림차순. 가장 자주 나온 주제를 기본 선택해 캡션을 채운다.
  const themes = [...crewThemes].sort((a, b) => b.count - a.count)
  const [activeKey, setActiveKey] = useState(themes[0]?.key)
  const active = themes.find((t) => t.key === activeKey) ?? themes[0]

  const max = Math.max(...themes.map((t) => t.count))

  // 빈도 → 글자 크기: 제곱근 스케일로 큰 값의 지배를 누른다 (1.0rem ~ 2.4rem)
  const fontSize = (count: number) => {
    const ratio = Math.sqrt(count / max) // 0~1
    return `${(1.0 + ratio * 1.4).toFixed(3)}rem`
  }
  // 빈도 → 불투명도: 순위가 낮을수록 옅게. 선택된 주제는 1.0
  const opacity = (count: number, isActive: boolean) => {
    if (isActive) return 1
    return Number((0.5 + (count / max) * 0.45).toFixed(3))
  }

  return (
    <section className={styles.section} aria-label="크루들이 가장 많이 한 말">
      <h2 className={styles.heading}>크루들이 가장 많이 한 말</h2>
      <p className={styles.sub}>
        수료 크루 메시지에서 자주 나온 주제
        {crewThemesAreExample && <span className={styles.tag}>예시 미리보기</span>}
      </p>

      <div className={styles.cloud}>
        {themes.map((t) => {
          const isActive = t.key === active?.key
          return (
            <button
              type="button"
              key={t.key}
              className={isActive ? `${styles.word} ${styles.active}` : styles.word}
              style={{ fontSize: fontSize(t.count), opacity: opacity(t.count, isActive) }}
              onMouseEnter={() => setActiveKey(t.key)}
              onFocus={() => setActiveKey(t.key)}
              onClick={() => setActiveKey(t.key)}
              aria-pressed={isActive}
            >
              {t.label}
              <sup className={styles.count}>{t.count}</sup>
            </button>
          )
        })}
      </div>

      {active && (
        <figure className={styles.caption} aria-live="polite">
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
