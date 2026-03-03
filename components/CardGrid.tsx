import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardGridProps {
  children: ReactNode
  columns?: 2 | 3
  variant?: 'grid' | 'list'
}

export function CardGrid({ children, columns = 2, variant = 'grid' }: CardGridProps) {
  if (variant === 'list') {
    return <div className={styles.list}>{children}</div>
  }
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
