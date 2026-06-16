import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './Hero.module.css'

interface HeroCta {
  label: string
  href: string
}

interface HeroProps {
  title: string
  /** 제목 위에 놓이는 작은 라벨 — 이 사이트가 무엇인지 */
  eyebrow?: string
  /** 제목 아래 메시지 — 독자에게 이 문서가 어떤 의미인지 */
  description?: string | ReactNode
  /** 주요 행동 버튼 (우테코 철학을 담은 초대) */
  cta?: HeroCta
}

export function Hero({ title, eyebrow, description, cta }: HeroProps) {
  return (
    <div className={styles.hero} data-landing-hero>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h1 className={styles.title}>{title}</h1>
      {description && <div className={styles.description}>{description}</div>}
      {cta && (
        <div className={styles.actions}>
          <Link className={styles.cta} href={cta.href}>
            {cta.label}
          </Link>
        </div>
      )}
    </div>
  )
}
