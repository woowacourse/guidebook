import Link from 'next/link'
import styles from './TecoWay.module.css'
import { Eyebrow } from './Eyebrow'
import { crewCount } from '../content/crew-voices'

/**
 * TecoWay: 랜딩에서 Hero 다음에 오는 '우테코의 10개월' 소개.
 * 히어로(문서의 약속) 뒤에서 "이 기록이 나온 현장"을 사실 선언으로 보여준다 —
 * 리드 한 줄이 히어로와의 이음새(문서→현장 전환)를 맡고, 레벨 0~5를 3구간으로 압축한
 * 타임라인이 과정의 뼈대(기간·방법·결과)를 전달한다. 마지막 구간 마커에만 행성이(반짝).
 * 735 캡션은 다운스트림 별자리('그중 422명')/행선지('이 길을 지난 735명')의 지시 대상(crewCount 단일 원천).
 * 성장 여정 상세(레벨 0~5)는 /education/journey(CrewGrowth)가 담당한다.
 */
const STEPS = [
  { label: '레벨 0~1 · 시작', text: '연극으로 동료를 먼저 만나고, 테스트와 리팩터링으로 기본기를 다집니다' },
  { label: '레벨 2~4 · 성장', text: '진짜 미션을 페어와 코드 리뷰로 풀고, 팀으로 서비스를 만들어 실제 사용자에게 배포합니다' },
  { label: '레벨 5 · 수료', text: '이력서와 면접을 준비해 소프트웨어 생태계로 나갑니다', star: true },
]

export function TecoWay() {
  return (
    <section className={styles.section} aria-label="우테코의 10개월, 한 명의 개발자로 수료하기까지">
      <Eyebrow>우테코의 10개월</Eyebrow>
      <h2 className={styles.heading}>10개월 뒤, 한 명의 빛나는 개발자로 수료합니다</h2>
      <p className={styles.lede}>
        이 문서에 담긴 실험과 기록은 모두 이 10개월에서 나왔습니다. 크루가 지나는 길을 먼저
        한눈에 담았습니다.
      </p>

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
        레벨 0~5, 어떻게 자라는지 →
      </Link>
    </section>
  )
}
