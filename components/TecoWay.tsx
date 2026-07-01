import Link from 'next/link'
import styles from './TecoWay.module.css'
import { Eyebrow } from './Eyebrow'
import { crewCount } from '../content/crew-voices'

/**
 * TecoWay: 랜딩에서 Hero 다음에 오는 '우테코의 10개월' 선언.
 * 작은 행성이가 스스로 빛나는 별이 되어 생태계로 걸어 나가는 별 메타포 서사로,
 * 미션·페어·스스로 '왜'라는 우테코의 how를 이야기에 녹인다.
 * 바로 뒤 CrewVoiceMap(별자리) '함께 자란 동료'와 CrewJourney(행선지)로 이어지는 setup이자,
 * 735 throughline의 시작점(crewCount는 content/crew-voices.ts 단일 원천).
 * 성장 여정 전체(레벨 0~5)는 /education/journey(CrewGrowth)로 연결한다.
 */
export function TecoWay() {
  return (
    <section className={styles.section} aria-label="우테코의 10개월, 작은 행성이가 빛나는 별이 되기까지">
      <Eyebrow>우테코의 10개월</Eyebrow>

      <span className={styles.figure} aria-hidden="true">
        <span className={styles.glow} />
        <img className={styles.pose} src="/images/characters/행성이-반짝.png" alt="" width={112} />
      </span>

      <h2 className={styles.heading}>작은 행성이가, 스스로 빛나는 별이 되어 떠납니다</h2>
      <p className={styles.lede}>
        우테코의 10개월은, 작은 행성이 하나가 낯선 별에 내려앉는 데서 시작합니다. 강의를 듣는 대신 진짜
        미션을 손으로 풀고, 혼자가 아니라 페어와 코드리뷰로 동료와 함께 부딪히고, 답을 받기보다 스스로
        '왜'를 물으며 한 단계씩 밝아집니다. 레벨 0에서 5를 지나는 사이 스스로 빛나게 된 크루가 지금까지{' '}
        <strong>{crewCount}명</strong>입니다. 이 별들이 이제 소프트웨어 생태계로 걸어 나갑니다.
      </p>

      <Link className={styles.journeyLink} href="/education/journey">
        10개월, 어떻게 자라는지 →
      </Link>
    </section>
  )
}
