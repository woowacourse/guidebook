import Link from 'next/link'
import styles from './EnterDocs.module.css'

/**
 * EnterDocs — 랜딩의 닫는 초대.
 * 열망(Hero) → 증거(CrewJourney·CrewVoices)를 본 독자에게, 문서로 들어가는 두 입구를 준다.
 * /education 의 "이해하기 → 적용하기" 구조를 그대로 현관으로 쓴다.
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
  }
]

export function EnterDocs() {
  return (
    <section className={styles.section} aria-label="문서로 들어가는 입구">
      <h2 className={styles.heading}>이제 직접 들여다볼 차례입니다</h2>
      <p className={styles.lede}>
        왜 이렇게 가르치는지 이해하거나, 오늘 할 수 있는 것부터 적용하거나. 편한 입구로 들어오면 됩니다.
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
