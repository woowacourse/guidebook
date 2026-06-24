import notices from '../content/notices'
import styles from './NoticeList.module.css'

export function NoticeList() {
  const items = [...notices].sort((a, b) => b.date.localeCompare(a.date))

  if (items.length === 0) {
    return <p className={styles.empty}>등록된 공지가 없습니다.</p>
  }

  return (
    <ul className={styles.list}>
      {items.map((n) => (
        <li key={n.title} className={styles.item}>
          <span className={styles.date}>{n.date}</span>
          <div className={styles.body}>
            {n.href ? (
              <a className={styles.title} href={n.href}>
                {n.title}
              </a>
            ) : (
              <span className={styles.title}>{n.title}</span>
            )}
            {n.body && <p className={styles.desc}>{n.body}</p>}
          </div>
        </li>
      ))}
    </ul>
  )
}
