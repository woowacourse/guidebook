import type { ReactNode } from 'react'
import styles from './Eyebrow.module.css'

/**
 * Eyebrow — 섹션 위에 놓는 작은 라벨 배지. 섹션 종류를 한눈에 알리고 스캔성을 높인다.
 * 통일 액센트(따뜻한 오렌지) pill.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className={styles.eyebrow}>{children}</span>
}
