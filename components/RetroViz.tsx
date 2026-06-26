import styles from './RetroViz.module.css'

type Mark = { value: number; label: string }

/**
 * ScoreScale — 구글폼 선형 척도(linear scale)식 0~N점 UI.
 * 회고 형식 키트의 "10점 척도 점수화"에서, 같은 팀이 서로 다른 점수를
 * 매긴 인지 비대칭을 두 개의 채워진 점으로 보여준다.
 */
export function ScoreScale({
  question,
  min = 0,
  max = 10,
  marks = [],
  minLabel,
  maxLabel,
}: {
  question?: string
  min?: number
  max?: number
  marks?: Mark[]
  minLabel?: string
  maxLabel?: string
}) {
  const points: number[] = []
  for (let v = min; v <= max; v++) points.push(v)
  const markMap = new Map(marks.map((m) => [m.value, m.label]))

  return (
    <div className={styles.scale}>
      {question && <div className={styles.scaleQ}>{question}</div>}
      <div className={styles.scaleRow}>
        {points.map((v) => {
          const label = markMap.get(v)
          const on = label !== undefined
          return (
            <div key={v} className={styles.scalePoint}>
              <span className={styles.scaleName}>{label ?? ' '}</span>
              <span className={`${styles.dot} ${on ? styles.dotOn : ''}`} />
              <span className={styles.scaleNum}>{v}</span>
            </div>
          )
        })}
      </div>
      {(minLabel || maxLabel) && (
        <div className={styles.scaleEnds}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  )
}

type RatioItem = { label: string; planned: number; actual: number }

/**
 * RatioBars — 계획 대 실제 비율을 두 줄 막대로 비교한다.
 * Mermaid xychart는 막대 두 계열을 겹쳐 그려 "계획 vs 실제"가 헷갈리므로,
 * 중립 회색 톤(실제만 강조)으로 직접 그린다.
 */
export function RatioBars({
  items,
  max,
}: {
  items: RatioItem[]
  max?: number
}) {
  const scaleMax =
    max ?? Math.ceil(Math.max(...items.flatMap((i) => [i.planned, i.actual])))

  return (
    <div className={styles.ratio}>
      {items.map((it) => (
        <div key={it.label} className={styles.ratioItem}>
          <div className={styles.ratioLabel}>{it.label}</div>
          <div className={styles.ratioRow}>
            <span className={styles.ratioCat}>계획</span>
            <div className={styles.ratioBarWrap}>
              <div
                className={`${styles.ratioFill} ${styles.ratioFillPlanned}`}
                style={{ width: `${(it.planned / scaleMax) * 100}%` }}
              />
            </div>
            <span className={styles.ratioVal}>{it.planned}</span>
          </div>
          <div className={styles.ratioRow}>
            <span className={styles.ratioCat}>실제</span>
            <div className={styles.ratioBarWrap}>
              <div
                className={`${styles.ratioFill} ${styles.ratioFillActual}`}
                style={{ width: `${(it.actual / scaleMax) * 100}%` }}
              />
            </div>
            <span className={styles.ratioVal}>{it.actual}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
