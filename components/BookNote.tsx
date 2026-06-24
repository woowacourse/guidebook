import styles from './BookNote.module.css'

/**
 * BookNote — "이 문서가 나오기까지의 이야기는 책으로" 를 알리는 조용한 한 줄.
 * 지금은 '발간 예정'만 확정이라 링크 없는 muted 텍스트.
 * 책의 제목·발간일·구매 링크가 생기면 이 컴포넌트 한 곳만 고치면 된다.
 */
export function BookNote() {
  return (
    <p className={styles.note}>
      이 문서가 나오기까지의 생생한 이야기는 곧 책으로 — <span className={styles.tag}>2026년 11월 발간 예정</span>
    </p>
  )
}
