import type { ReactNode } from 'react'
import styles from './Manifesto.module.css'

// 매니페스토 히어로 — 페이지를 여는 큰 선언 한 줄. 강조용으로 본문보다 훨씬 크게.
export function ManifestoHero({ children }: { children: ReactNode }) {
  return (
    <div className={styles.hero} data-manifesto-hero>
      <p className={styles.heroStatement}>{children}</p>
    </div>
  )
}

// 번호 붙은 원칙 선언 — H2 제목 아래에서 그 원칙의 핵심 명제를 크게 드러낸다.
export function Claim({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <div className={styles.claim}>
      {n && <span className={styles.num} aria-hidden="true">{n}</span>}
      <p className={styles.claimText}>{children}</p>
    </div>
  )
}

// 마무리 선언 — 페이지를 닫는 짧고 강한 한 줄(+ 부연).
export function ManifestoClose({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className={styles.close}>
      <p className={styles.closeStatement}>{children}</p>
      {note && <p className={styles.closeNote}>{note}</p>}
    </div>
  )
}
