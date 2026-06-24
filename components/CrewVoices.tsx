import styles from './CrewVoices.module.css'
import crewVoices, { type CrewVoice } from '../content/crew-voices'

/**
 * CrewVoices — 우테코를 거쳐 간 크루들이 남긴 메시지·추천사.
 * 데이터 원천: content/crew-voices.ts
 *   <CrewVoices limit={3} /> → featured 중 위에서 N개 (랜딩 큐레이션)
 *   <CrewVoices />           → 전체 (아카이브 페이지)
 */

// 랜딩에 무엇을 띄울지 고르는 큐레이션 규칙 — "첫인상"을 정하는 한 곳.
// 현재: featured 표시된 문장만, 데이터 배열 순서대로 limit 개수.
// 가장 강한 첫인상을 보장하려면 featured 순서를 직접 큐레이션한다.
function selectVoices(limit?: number): CrewVoice[] {
  if (limit == null) return crewVoices
  return crewVoices.filter((v) => v.featured).slice(0, limit)
}

export function CrewVoices({ limit }: { limit?: number }) {
  const voices = selectVoices(limit)
  const hasMore = limit != null && crewVoices.length > voices.length

  return (
    <section className={styles.section} aria-label="크루들이 남긴 메시지">
      <h2 className={styles.heading}>크루의 목소리</h2>
      <p className={styles.lede}>우테코를 거쳐 간 크루들이 남긴 메시지입니다.</p>

      <ul className={styles.grid}>
        {voices.map((v, i) => (
          <li className={styles.card} key={v.author + i}>
            {v.example && <span className={styles.badge}>예시</span>}
            <blockquote className={styles.quote}>{v.quote}</blockquote>
            <div className={styles.meta}>
              <cite className={styles.author}>{v.author}</cite>
              {v.recommendsTo && (
                <span className={styles.recommends}>이런 분께 추천 · {v.recommendsTo}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <p className={styles.more}>
          <a href="/education/conversations/crew-voices">크루의 목소리 전체 보기 →</a>
        </p>
      )}
    </section>
  )
}
