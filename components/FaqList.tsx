'use client'

import { useState } from 'react'
import faq, { FAQ_CATEGORIES } from '../content/faq'
import { Toggle } from './Toggle'
import styles from './FaqList.module.css'

export function FaqList() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const filtered = q
    ? faq.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(q))
    : faq

  return (
    <div className={styles.wrap}>
      <input
        type="search"
        className={styles.search}
        placeholder="질문 검색…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="질문 검색"
      />

      {FAQ_CATEGORIES.map((category) => {
        const items = filtered.filter((f) => f.category === category)
        if (items.length === 0) return null
        return (
          <section key={category} className={styles.section}>
            <h2 className={styles.category}>{category}</h2>
            {items.map((f) => (
              <Toggle key={f.question + q} title={f.question} defaultOpen={q.length > 0}>
                {f.answer}
              </Toggle>
            ))}
          </section>
        )
      })}

      {filtered.length === 0 && (
        <p className={styles.empty}>“{query}”에 해당하는 질문이 없습니다.</p>
      )}
    </div>
  )
}
