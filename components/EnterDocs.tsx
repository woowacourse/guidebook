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
      <h2 className={styles.heading}>이런 교육엔 어떤 생각과 실험이 있었을까요</h2>
      <p className={styles.lede}>
        동료와 함께 이런 영향력을 키워 온 교육에는, 수많은 생각과 실험과 도전이 있었습니다. 이해하기와 적용하기로 직접 살펴볼 수 있습니다.
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
