'use client'

import { useState } from 'react'
import styles from './CrewVoiceMap.module.css'
import { crewThemes, crewThemesAreExample, crewCount } from '../content/crew-voices'
import { Eyebrow } from './Eyebrow'

/**
 * CrewVoiceMap — "크루들이 가장 많이 남긴 메시지"를 손그림 별무리로.
 * 크루의 말 = 별(크기=빈도). Hero의 손그림 별(StarMark)과 같은 모양을 쓴다.
 * 억지 연결선 대신 따뜻한 광원 + 희미한 잔별로 밤하늘 분위기를 만든다.
 * 호버/포커스/탭하면 대표 문장이 아래 캡션에 뜬다. 데이터: content/crew-voices.ts
 */

// Hero StarMark와 동일한 손그림 별 모양(외곽 실루엣, 솔리드)
const STAR_PATH =
  'M47.4503 55.4507C43.6684 58.9605 39.8864 62.3888 36.1861 65.9531C33.955 68.1025 31.9416 70.4697 29.8465 72.7007C28.1596 74.4965 26.5543 76.4011 24.7041 78.0336C23.507 79.0947 21.7929 79.2035 20.378 78.3601C19.1264 77.5982 19.0176 76.3195 19.2353 74.9046C20.0515 69.9255 20.7045 64.9192 21.5752 59.94C21.9017 58.1171 22.6635 56.3485 23.3437 54.2807C18.936 54.2807 14.8275 54.3351 10.6918 54.2807C7.59009 54.2263 4.59718 53.4917 1.76751 52.2401C0.543131 51.6959 -0.218703 50.7436 0.0261726 49.1927C0.271048 47.7507 0.89684 46.8528 2.31167 46.2814C3.78092 45.6829 5.11413 44.7306 6.52897 43.9143C11.4265 41.0302 16.324 38.1734 21.4391 35.1532C20.6229 33.4119 19.589 31.5073 18.8544 29.4939C17.0042 24.4059 15.2356 19.2908 13.6303 14.1484C13.3311 13.1689 13.5215 11.6724 14.1201 10.8834C14.8275 9.95829 16.1607 9.38692 17.5483 10.1215C20.5685 11.6996 23.6702 13.1689 26.6631 14.8014C30.2002 16.7604 33.6557 18.8554 37.2744 20.9505C38.009 19.2635 38.7709 17.495 39.5599 15.7537C41.2468 11.9445 42.9609 8.13533 44.6479 4.32616C44.9744 3.56433 45.2464 2.8025 45.5457 2.01345C46.3892 -0.136006 49.1372 -0.680173 50.5521 1.11558C51.2867 2.04066 51.9669 3.129 52.2934 4.27175C53.3001 7.78162 54.1436 11.3459 55.1503 15.2095C57.5174 14.23 59.939 13.1145 62.4421 12.2166C64.7548 11.4003 67.122 10.6657 69.5163 10.1488C71.965 9.63179 73.5431 11.7268 72.8357 14.0668C71.8018 17.3862 69.7068 19.971 67.6389 22.6646C65.5711 25.3582 63.6937 28.2151 61.7619 31.0176C61.517 31.3985 61.2994 31.9698 61.381 32.378C62.687 37.5748 64.2107 42.7171 65.3534 47.9684C66.1425 51.5326 66.4962 55.2058 66.9043 58.8245C67.122 60.5386 66.5234 62.1439 65.1085 63.1778C63.8298 64.1029 62.4421 63.7492 61.0545 62.9602C56.7284 60.5386 52.3206 58.2803 47.9401 55.9404C47.668 55.8044 47.4503 55.5323 47.4231 55.5051L47.4503 55.4507Z'

function HandStar({ size, rotate, flip }: { size: number; rotate: number; flip: number }) {
  return (
    <svg
      className={styles.starSvg}
      width={size}
      height={Math.round((size * 79) / 73)}
      viewBox="0 0 73 79"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${rotate}deg) scaleX(${flip})` }}
    >
      <path d={STAR_PATH} />
    </svg>
  )
}

// 별마다 다른 기울기 + 일부 좌우 반전 → 같은 path라도 손그림처럼 제각각 보인다 (결정적)
const ROT = [-9, 13, -17, 7, 20, -13, 9, -6, 16]
const FLIP = [1, -1, 1, -1, 1, 1, -1, 1, -1]

// 흐름(flow) 배치에서 각 별을 조금씩 위아래로 띄워 손그림 별무리 느낌을 준다.
// transform 시각 효과만 — 클릭영역(버튼 박스)은 그대로라 서로 겹치지 않는다.
const OFFSET = [-8, 10, -5, 8, -10, 5, -7, 9, -4]

// 배경 잔별 (장식, 빈도와 무관) — 밤하늘 깊이
const SPARKS: Array<[number, number, number]> = [
  [11, 26, 4],
  [89, 30, 5],
  [44, 86, 3],
  [72, 84, 4],
  [7, 56, 3],
  [93, 58, 4],
  [60, 16, 3],
  [31, 20, 4]
]

export function CrewVoiceMap({ bleed = false }: { bleed?: boolean }) {
  const themes = [...crewThemes].sort((a, b) => b.count - a.count)
  const [activeKey, setActiveKey] = useState(themes[0]?.key)
  const active = themes.find((t) => t.key === activeKey) ?? themes[0]

  const max = Math.max(...themes.map((t) => t.count))
  const min = Math.min(...themes.map((t) => t.count))
  // 빈도 → 별 크기(px). 제곱근 스케일 (22 ~ 56px)
  const starPx = (count: number) => Math.round(22 + Math.sqrt((count - min) / (max - min || 1)) * 34)

  return (
    <section
      className={bleed ? `${styles.section} ${styles.bleed}` : styles.section}
      aria-label="크루들이 가장 많이 남긴 메시지"
    >
      <Eyebrow>크루의 목소리</Eyebrow>
      <h2 className={styles.heading}>크루들이 가장 많이 남긴 메시지</h2>
      <p className={styles.sub}>
        앞서 본 {crewCount}명이 우테코를 수료하며 남긴 메시지를, 가장 자주 나온 키워드별로 별자리로 그렸습니다. 가장 크게 남은 건 강의도, 코치도, 시설도 아닌 함께 자란 동료였습니다.
        {crewThemesAreExample && <span className={styles.tag}>예시 미리보기</span>}
      </p>

      <div className={styles.field}>
        <div className={styles.glow} aria-hidden="true" />
        {SPARKS.map(([x, y, s], i) => (
          <span
            key={`s${i}`}
            className={styles.spark}
            style={{ left: `${x}%`, top: `${y}%`, width: s, height: s }}
            aria-hidden="true"
          />
        ))}

        {themes.map((t, i) => {
          const isActive = t.key === active?.key
          return (
            <button
              key={t.key}
              type="button"
              className={isActive ? `${styles.star} ${styles.on}` : styles.star}
              style={{ transform: `translateY(${OFFSET[i % OFFSET.length]}px)` }}
              onMouseEnter={() => setActiveKey(t.key)}
              onFocus={() => setActiveKey(t.key)}
              onClick={() => setActiveKey(t.key)}
              aria-pressed={isActive}
            >
              <HandStar size={starPx(t.count)} rotate={ROT[i % ROT.length]} flip={FLIP[i % FLIP.length]} />
              <span className={styles.lab}>{t.label}</span>
              <span className={styles.ct}>{t.count}</span>
            </button>
          )
        })}
      </div>

      {active && (
        <figure className={styles.cap} aria-live="polite">
          <p className={styles.quote}>{active.quote}</p>
          <figcaption className={styles.meta}>
            {active.label} · 비슷한 메시지 {active.count}건
          </figcaption>
        </figure>
      )}

      <p className={styles.close}>
        이 동료들과 함께, 더 큰 <strong>선한 영향력</strong>을 펼쳐나가기를 바랍니다.
      </p>

      <p className={styles.more}>
        <a href="/education/conversations/crew-voices">크루의 목소리 전체 보기 →</a>
      </p>
    </section>
  )
}
