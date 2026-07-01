import Link from 'next/link'
import styles from './EnterDocs.module.css'

/**
 * EnterDocs — 랜딩의 닫는 초대.
 * 열망(Hero) → 증거(CrewJourney·CrewVoices)를 본 독자에게, 독자별 입구를 준다.
 * /education 의 "이해하기 → 적용하기" 구조에, 우테코에 지원하려는 독자를 위한
 * 지원하기(/apply)를 더해 세 갈래로 안내한다.
 */
const DOORS = [
  {
    icon: '🧭',
    title: '이해하기',
    desc: '왜 이렇게 가르치는가',
    href: '/education/philosophy'
  },
  {
    icon: '🚀',
    title: '적용하기',
    desc: '오늘 할 수 있는 것부터',
    href: '/education/start'
  },
  {
    icon: '✍️',
    title: '지원하기',
    desc: '우테코 크루가 되고 싶다면',
    href: '/apply'
  }
]

export function EnterDocs() {
  return (
    <section className={styles.section} aria-label="문서로 들어가는 입구">
      <h2 className={styles.heading}>어떤 이유로 오셨나요</h2>
      <p className={styles.lede}>
        우테코의 교육이 궁금한 분, 교육을 직접 만드는 분, 우테코에 지원하려는 분. 각자 필요한 곳으로 바로 안내합니다.
      </p>

      <div className={styles.doors}>
        {DOORS.map((d) => (
          <Link className={styles.door} href={d.href} key={d.href}>
            <span className={styles.icon} aria-hidden="true">
              {d.icon}
            </span>
            <span className={styles.doorBody}>
              <span className={styles.doorTitle}>{d.title}</span>
              <span className={styles.doorDesc}>{d.desc}</span>
            </span>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
