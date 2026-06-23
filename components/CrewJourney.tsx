import styles from './CrewJourney.module.css'

/**
 * CrewJourney — "크루는 어디로 갔나"
 * 우테코를 거쳐 간 크루 수와, 지금 일하는 회사들을 행성이가 걸어가는 여정으로 보여준다.
 * 숫자·회사 목록은 아래 상수만 고치면 갱신된다.
 */
const CREW_COUNT = 735

// 크루들이 지금 일하는 회사 (대표 목록). 거쳐 가는 순서대로.
const COMPANIES = [
  '우아한형제들',
  '카카오',
  '토스',
  '야놀자',
  '신한은행',
  '네이버',
  '마이리얼트립',
  '삼성전자',
  '그렙',
  '쿠팡',
  '라인',
  '핵클',
  '딜리버리히어로즈',
  '탈라밧'
]

/** Hero의 손그림 별과 같은 모티프 — 거쳐 가는 정거장 마커 */
function StarBullet() {
  return (
    <svg className={styles.star} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 1.6l2.85 6.55 7.15.6-5.45 4.7 1.7 6.95L12 17.25 5.75 20.4l1.7-6.95L2 8.75l7.15-.6z" />
    </svg>
  )
}

export function CrewJourney() {
  return (
    <section className={styles.section} aria-label="우테코를 거쳐 간 크루들의 행선지">
      <h2 className={styles.heading}>크루는 어디로 갔나</h2>
      <p className={styles.lede}>
        지금까지 <strong>{CREW_COUNT}명</strong>의 크루가 우테코를 거쳐 갔습니다. 그리고 지금, 이런 회사들에서 일하고 있습니다.
      </p>

      <div className={styles.journey}>
        {/* 걸어가는 행성이 — 여정의 출발점 */}
        <img
          className={styles.walker}
          src="/images/characters/행성이-걷기.png"
          alt="걸어가는 행성이 캐릭터"
          width={116}
          loading="lazy"
          decoding="async"
        />

        <ul className={styles.trail}>
          {COMPANIES.map((name) => (
            <li className={styles.stop} key={name}>
              <StarBullet />
              <span className={styles.company}>{name}</span>
            </li>
          ))}
          <li className={`${styles.stop} ${styles.more}`}>
            <span className={styles.company}>그리고 더</span>
          </li>
        </ul>
      </div>
    </section>
  )
}
