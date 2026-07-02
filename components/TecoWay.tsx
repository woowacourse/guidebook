import Link from 'next/link'
import styles from './TecoWay.module.css'
import { Eyebrow } from './Eyebrow'
import { crewCount } from '../content/crew-voices'

/**
 * TecoWay: 랜딩에서 Hero 다음에 오는 '우테코의 10개월' 선언.
 * 한 크루의 여정을 3단계 타임라인으로: 혼자 도착, 동료와 함께 성장, 빛나는 별이 되어 떠남.
 * 마지막 단계 마커에만 행성이(반짝)를 두어 '빛나는 별'을 그 지점에서 회수한다.
 * 735 캡션은 다운스트림 별자리('앞서 본 735')/행선지('그 735')의 지시 대상을 유지한다(crewCount 단일 원천).
 * 성장 여정 전체(레벨 0~5)는 /education/journey(CrewGrowth)로 연결한다.
 */
const STEPS = [
  { label: '도착', text: '혼자, 우테코에서 시작합니다' },
  { label: '동료와 함께', text: '진짜 미션을 페어와 코드리뷰로 풀며 자랍니다' },
  { label: '떠남', text: '빛나는 별이 되어 소프트웨어 생태계로', star: true },
]

export function TecoWay() {
  return (
    <section className={styles.section} aria-label="우테코의 10개월, 한 크루가 빛나는 별이 되기까지">
      <Eyebrow>우테코의 10개월</Eyebrow>
      <h2 className={styles.heading}>한 크루가, 동료와 함께 빛나는 별이 되어 떠납니다</h2>

      <ol className={styles.timeline}>
        {STEPS.map((s) => (
          <li key={s.label} className={styles.step}>
            <span className={styles.marker} aria-hidden="true">
              {s.star ? (
                <>
                  <span className={styles.glow} />
                  <img className={styles.pose} src="/images/characters/행성이-반짝.png" alt="" width={72} />
                </>
              ) : (
                <span className={styles.dot} />
              )}
            </span>
            <span className={styles.stepLabel}>{s.label}</span>
            <span className={styles.stepText}>{s.text}</span>
          </li>
        ))}
      </ol>

      <p className={styles.caption}>
        지금까지 이 길을 지난 크루 <strong>{crewCount}명</strong>.
      </p>

      <Link className={styles.journeyLink} href="/education/journey">
        10개월, 어떻게 자라는지 →
      </Link>
    </section>
  )
}
