'use client'

import { useState } from 'react'
import styles from './CrewVoiceConstellation.module.css'
import { crewThemes, crewThemesAreExample, crewCount } from '../content/crew-voices'
import { Eyebrow } from './Eyebrow'

/**
 * CrewVoiceConstellation — CrewVoiceMap의 별자리 개편 시안(컨셉 A).
 * 크루의 말 = 별. 가장 많이 나온 '함께 자란 동료'를 길잡이 북극성으로 홀로 크게 띄우고,
 * 나머지 테마 5개 + 채움별 2개가 북두칠성 국자를 이룬다. 국자 끝 두 별이 북극성을 가리킨다.
 * 흐름(flex) 배치였던 원본과 달리, 별자리는 '모양이 곧 의미'라 좌표를 고정한다.
 */

// Hero StarMark / CrewVoiceMap과 동일한 손그림 별 실루엣(솔리드)
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

// 북두칠성 asterism 좌표(0-100 정규화). 핸들 왼쪽 → 국자 오른쪽.
// 국자 끝 두 별(merak·dubhe)이 위쪽 북극성(polaris)을 가리킨다.
const STAR = {
  polaris: [72, 14],
  alkaid: [12, 44],
  mizar: [27, 37],
  alioth: [43, 36],
  megrez: [57, 44],
  phecda: [60, 66],
  merak: [80, 68],
  dubhe: [78, 46]
} as const

// 밝은 테마부터 눈에 띄는 국자 자리에 매핑(count 내림차순 순서와 1:1)
const THEME_SLOTS = [STAR.dubhe, STAR.alioth, STAR.megrez, STAR.phecda, STAR.alkaid]
// 라벨 없는 채움별 — 7별 국자 실루엣 완성용
const FILLER_SLOTS = [STAR.mizar, STAR.merak]
// 연결선: 국자(핸들+사발) + 북극성 지시 점선
const DIPPER_LINE = [STAR.alkaid, STAR.mizar, STAR.alioth, STAR.megrez, STAR.dubhe, STAR.merak, STAR.phecda, STAR.megrez]
const POINTER_LINE = [STAR.merak, STAR.dubhe, STAR.polaris]

const pts = (line: readonly (readonly [number, number])[]) => line.map(([x, y]) => `${x},${y}`).join(' ')

// 별마다 다른 기울기 + 일부 좌우 반전 → 같은 path라도 손그림처럼 제각각 (결정적)
const ROT = [13, -17, 7, 20, -13]
const FLIP = [-1, 1, -1, 1, 1]

// 배경 잔별 (장식) — 밤하늘 깊이
const SPARKS: Array<[number, number, number]> = [
  [14, 22, 3],
  [88, 26, 4],
  [46, 84, 3],
  [70, 82, 3],
  [9, 60, 2],
  [92, 64, 3]
]

export function CrewVoiceConstellation() {
  const sorted = [...crewThemes].sort((a, b) => b.count - a.count)
  const pole = sorted[0]
  const dipper = sorted.slice(1) // 테마 5개

  const [activeKey, setActiveKey] = useState(pole.key)
  const active = sorted.find((t) => t.key === activeKey) ?? pole

  // 국자 테마 빈도 → 별 크기(px). 북극성보다 작게(15~27px)
  const counts = dipper.map((t) => t.count)
  const dMax = Math.max(...counts)
  const dMin = Math.min(...counts)
  const themePx = (c: number) => Math.round(15 + Math.sqrt((c - dMin) / (dMax - dMin || 1)) * 12)

  const activate = (key: string) => setActiveKey(key)

  return (
    <section className={styles.section} aria-label="크루들이 가장 많이 남긴 메시지">
      <Eyebrow>크루의 목소리</Eyebrow>
      <h2 className={styles.heading}>크루들이 가장 많이 남긴 메시지</h2>
      <p className={styles.sub}>
        앞서 본 {crewCount}명이 우테코를 수료하며 남긴 메시지를, 가장 자주 나온 키워드별로 별자리로 그렸습니다. 가장 크게
        남은 건 강의도, 코치도, 시설도 아닌 함께 자란 동료였습니다.
        {crewThemesAreExample && <span className={styles.tag}>예시 미리보기</span>}
      </p>

      <div
        className={styles.field}
        role="img"
        aria-label={`크루가 가장 많이 남긴 메시지: ${sorted.map((t) => t.label).join(', ')}`}
      >
        <div className={styles.glow} aria-hidden="true" />
        {SPARKS.map(([x, y, s], i) => (
          <span
            key={`s${i}`}
            className={styles.spark}
            style={{ left: `${x}%`, top: `${y}%`, width: s, height: s }}
            aria-hidden="true"
          />
        ))}

        {/* 별자리 연결선 */}
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline className={styles.dipperLine} points={pts(DIPPER_LINE)} />
          <polyline className={styles.pointerLine} points={pts(POINTER_LINE)} />
        </svg>

        {/* 채움별 (라벨 없음) */}
        {FILLER_SLOTS.map(([x, y], i) => (
          <span
            key={`f${i}`}
            className={styles.filler}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-hidden="true"
          >
            <HandStar size={11} rotate={i ? -6 : 9} flip={i ? -1 : 1} />
          </span>
        ))}

        {/* 북극성 — 함께 자란 동료 (가장 밝게) */}
        <button
          type="button"
          className={
            active.key === pole.key ? `${styles.star} ${styles.pole} ${styles.on}` : `${styles.star} ${styles.pole}`
          }
          style={{ left: `${STAR.polaris[0]}%`, top: `${STAR.polaris[1]}%` }}
          onMouseEnter={() => activate(pole.key)}
          onFocus={() => activate(pole.key)}
          onClick={() => activate(pole.key)}
          aria-pressed={active.key === pole.key}
        >
          <HandStar size={40} rotate={-6} flip={1} />
          <span className={styles.lab}>{pole.label}</span>
          <span className={styles.ct}>{pole.count}</span>
        </button>

        {/* 국자 별 — 나머지 테마 5개 */}
        {dipper.map((t, i) => {
          const [x, y] = THEME_SLOTS[i]
          const on = t.key === active.key
          return (
            <button
              key={t.key}
              type="button"
              className={on ? `${styles.star} ${styles.on}` : styles.star}
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => activate(t.key)}
              onFocus={() => activate(t.key)}
              onClick={() => activate(t.key)}
              aria-pressed={on}
            >
              <HandStar size={themePx(t.count)} rotate={ROT[i]} flip={FLIP[i]} />
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
    </section>
  )
}
