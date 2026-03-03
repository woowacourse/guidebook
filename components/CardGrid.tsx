import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardGridProps {
  children: ReactNode
  columns?: 2 | 3
}

export function CardGrid({ children, columns = 2 }: CardGridProps) {
  return (
    <div
      className={styles.grid}
      data-columns={columns}
      style={{ '--columns': columns } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
