import styles from './CrewJourney.module.css'

/**
 * CrewJourney — 우테코를 거쳐 간 크루 수와, 지금 일하는 회사들.
 * 행성이가 앞장서고 회사명이 뒤따르는 한 줄 여정으로 보여준다.
 * 숫자·회사 목록은 아래 상수만 고치면 갱신된다.
 */
const CREW_COUNT = 735

// 크루들이 지금 일하는 회사 (대표 목록).
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

export function CrewJourney() {
  return (
    <section className={styles.section} aria-label="우테코를 거쳐 간 크루들의 행선지">
      <h2 className={styles.heading}>크루들은 지금 여기 있습니다</h2>
      <p className={styles.lede}>
        지금까지 <strong>{CREW_COUNT}명</strong>의 크루가 우테코를 거쳐 갔습니다.
        <br />
        그리고 지금, 이런 회사들에서 일하고 있습니다.
      </p>

      <div className={styles.journey}>
        <img
          className={styles.walker}
          src="/images/characters/행성이-걷기.png"
          alt="걸어가는 행성이 캐릭터"
          width={96}
          loading="lazy"
          decoding="async"
        />
        <ul className={styles.companies}>
          {COMPANIES.map((name) => (
            <li className={styles.company} key={name}>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
