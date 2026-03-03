import type { ReactNode } from 'react'
import styles from './Hero.module.css'

interface HeroProps {
  title: string
  subtitle: string
  description?: string | ReactNode
}

export function Hero({ title, subtitle, description }: HeroProps) {
  return (
    <div className={styles.hero}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  )
}
