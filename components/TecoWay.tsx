import Link from 'next/link'
import styles from './TecoWay.module.css'
import { Eyebrow } from './Eyebrow'
import { crewCount } from '../content/crew-voices'

/**
 * TecoWay: 랜딩에서 Hero 다음에 오는 '우테코의 10개월' 소개.
 * 헤드라인은 교육 철학 첫 H2("우리는 가르치지 않습니다")의 예고편 — philosophy.mdx와 호응.
 * 리드 한 줄이 히어로의 '교육 실험과 경험'을 받아 문서→현장 전환의 이음새를 맡고,
 * 4단계는 레벨 0→4 시간순이되 단계마다 우테코만 말할 수 있는 사실 하나를 싣는다
 * (다른 교육기관 랜딩에 붙여도 어색하지 않은 문장은 넣지 않는다 — 문구 출처: growth-arc.ts·philosophy.mdx).
 * 마커는 점 대신 행성이 포즈가 단계마다 커지며(성장) 점선 길을 걷고, 캡션의 행성이(반짝·최대)가
 * 수료 시점에서 아크를 닫는다 — 포즈는 각 단계의 사실 헤드라인과 1:1(카탈로그: public/images/characters/index.md).
 * 735 캡션은 다운스트림 별자리('그중 422명')/행선지('이 길을 지난 735명')의 지시 대상(crewCount 단일 원천).
 * 성장 여정 상세(레벨 0~5)는 /education/journey(CrewGrowth)가 담당한다.
 */
const STEPS = [
  {
    level: '레벨 0',
    fact: '첫 미션은 코드가 아니라 연극입니다',
    text: '트랙을 섞어 무대를 만들며, 함께 배우는 법부터 익힙니다',
    pose: '행성이-호기심',
    size: 40,
  },
  {
    level: '레벨 1',
    fact: '강의보다 미션이 먼저입니다',
    text: '페어와 코드 리뷰 속에서 테스트와 리팩터링이 습관이 됩니다',
    pose: '행성이-페어',
    size: 50,
  },
  {
    level: '레벨 2~3',
    fact: '같은 문제를 여러 번 다시 풉니다',
    text: '정답 대신 트레이드오프를 저울질하며, 팀으로 실제 사용자에게 배포합니다',
    pose: '행성이-운동',
    size: 58,
  },
  {
    level: '레벨 4',
    fact: '이미 있는 도구를 일부러 다시 만듭니다',
    text: '바퀴를 재발명하며 원리를 몸에 새깁니다',
    pose: '행성이-과열',
    size: 64,
  },
]

export function TecoWay() {
  return (
    <section className={styles.section} aria-label="우테코의 10개월 — 우리는 가르치지 않습니다">
      <Eyebrow>우테코의 10개월</Eyebrow>
      <h2 className={styles.heading}>
        우리는 가르치지 않습니다.
        <br />
        10개월의 경험이 가르칩니다.
      </h2>
      <p className={styles.lede}>
        이 문서에 담긴 실험과 기록은 모두 이 10개월에서 나왔습니다. 크루가 지나는 길을 먼저
        한눈에 담았습니다.
      </p>

      <ol className={styles.timeline}>
        {STEPS.map((s) => (
          <li key={s.level} className={styles.step}>
            <span className={styles.marker} aria-hidden="true">
              <img className={styles.pose} src={`/images/characters/${s.pose}.png`} alt="" width={s.size} />
            </span>
            <span className={styles.stepLevel}>{s.level}</span>
            <span className={styles.stepFact}>{s.fact}</span>
            <span className={styles.stepText}>{s.text}</span>
          </li>
        ))}
      </ol>

      <div className={styles.outro}>
        <span className={styles.grad} aria-hidden="true">
          <span className={styles.glow} />
          <img className={styles.pose} src="/images/characters/행성이-반짝.png" alt="" width={72} />
        </span>
        <p className={styles.caption}>
          이 10개월을 지나 개발자가 된 크루, 지금까지 <strong>{crewCount}명</strong>.
        </p>
      </div>

      <Link className={styles.journeyLink} href="/education/journey">
        레벨 0 → 5, 어떻게 자라는지 →
      </Link>
    </section>
  )
}
