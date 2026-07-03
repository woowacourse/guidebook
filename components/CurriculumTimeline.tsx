import cohorts, {
  CURRICULUM_ROWS,
  TRACK_ORDER,
  type CohortDelta,
} from '../content/curriculum-history'
import styles from './CurriculumTimeline.module.css'

// content/curriculum-history.ts 를 두 섹션으로 렌더링한다.
// 1) 현재 기수: 트랙 4개 × 레벨 테이블. 전 트랙 공통 구간(common)은 전체 폭 한 칸.
// 2) 과거 기수: 헤드라인 + 델타 + 실험 링크의 압축 연표(최신순)
// 원본/상세는 llm-wiki/wiki/curriculum-evolution.md.

function DeltaLine({ delta }: { delta: CohortDelta }) {
  return (
    <li>
      {delta.text}
      {delta.link && (
        <>
          {' · '}
          <a href={delta.link.href} className={styles.deltaLink}>
            {delta.link.label}
          </a>
        </>
      )}
    </li>
  )
}

export function CurriculumTimeline() {
  const current = cohorts.find((c) => c.current) ?? cohorts[cohorts.length - 1]
  const history = [...cohorts].sort((a, b) => b.gi - a.gi) // 진행 중 기수 포함 연표(최신순)
  const tracks = TRACK_ORDER.filter((t) => current.tracks.includes(t))

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <span className={styles.headTitle}>지금의 커리큘럼</span>
        <span className={styles.headMeta}>
          {current.gi}기 · {current.year}
        </span>
        {current.current && <span className={styles.badgeNow}>진행 중</span>}
      </div>

      <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="트랙별 레벨 0~5 커리큘럼 표">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.levelCell} scope="col">레벨</th>
              {tracks.map((t) => (
                <th key={t} scope="col">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CURRICULUM_ROWS.map((row) => (
              <tr key={row.level} className={row.common ? styles.commonRow : undefined}>
                <th scope="row" className={styles.levelCell}>
                  <span className={styles.levelNum}>{row.level}</span>
                </th>
                {row.common ? (
                  <td colSpan={tracks.length} className={styles.commonCell}>
                    <span className={styles.cellName}>
                      {row.common.name}
                      <span className={styles.commonTag}>전 트랙 공통</span>
                    </span>
                    <span className={styles.cellDesc}>{row.common.desc}</span>
                  </td>
                ) : (
                  tracks.map((t) => {
                    const cell = row.cells[t]
                    return (
                      <td key={t}>
                        <span className={styles.cellName}>{cell.name}</span>
                        <span className={styles.cellDesc}>{cell.desc}</span>
                      </td>
                    )
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={[styles.head, styles.headGap].join(' ')}>
        <span className={styles.headTitle}>커리큘럼이 쌓여 온 길</span>
        <span className={styles.headMeta}>
          {history[history.length - 1].gi}~{history[0].gi}기
        </span>
      </div>

      <ol className={styles.deltas}>
        {history.map((c) => (
          <li key={c.gi} className={styles.delta}>
            <div>
              <span className={styles.deltaGi}>{c.gi}기</span>
              <span className={styles.deltaYr}>{c.year}</span>
            </div>
            <div>
              <div className={styles.deltaHeadline}>
                {c.headline}
                {c.current && <span className={styles.badgeNow}>진행 중</span>}
                {c.depth === 'sparse' && <span className={styles.chip}>기록 보강 중</span>}
              </div>
              {c.core.length > 0 && (
                <ul className={styles.deltaList}>
                  {c.core.map((d, idx) => (
                    <DeltaLine key={idx} delta={d} />
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.legend}>
        ▸ 1~6기의 델타는 FE 페이먼츠 미션 555개 PR 분석 중심의 부분 관측입니다. 백엔드·안드로이드의 연도별 기록은 모이는 대로 보강합니다.
      </p>
    </div>
  )
}
