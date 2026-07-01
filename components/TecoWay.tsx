import styles from './TecoWay.module.css'
import { Eyebrow } from './Eyebrow'
import { Claim } from './Manifesto'
import { crewCount } from '../content/crew-voices'

/**
 * TecoWay: 랜딩에서 Hero 다음에 오는 '우테코라는 곳' 선언.
 * 정체성(스스로 자라는 개발자를 기르는 곳) + 성장 방식 3원칙을 Manifesto 스타일로.
 * 바로 뒤 CrewVoiceMap(별자리)의 '함께 자란 동료'가 여기 02를 회수한다.
 * 규모(crewCount)는 content/crew-voices.ts 단일 원천 재사용 → 별자리·행선지와 같은 실.
 */
export function TecoWay() {
  return (
    <section className={styles.section} aria-label="우테코는 어떤 곳이고 크루가 어떻게 자라는가">
      <Eyebrow>우테코라는 곳</Eyebrow>
      <h2 className={styles.heading}>우테코는, 스스로 자라는 개발자를 기르는 곳입니다</h2>
      <p className={styles.lede}>
        2018년부터 10개월 과정을 굴리며, 지금까지 크루 <strong>{crewCount}명</strong>이 이곳을 거쳐 갔습니다.
      </p>

      <div className={styles.claims}>
        <Claim n="01">진짜 미션으로 배웁니다. 강의를 듣는 게 아니라, 손으로 미션을 풀며 익힙니다.</Claim>
        <Claim n="02">페어와 코드리뷰로 함께 자랍니다. 혼자 빨리 가기보다, 동료와 더 멀리 갑니다.</Claim>
        <Claim n="03">스스로 '왜'를 묻습니다. 정답을 받기보다, 자기 근거를 세웁니다.</Claim>
      </div>
    </section>
  )
}
