import { CrewVoiceConstellation } from '../../../components/CrewVoiceConstellation'

/**
 * 별자리 개편 시안 프리뷰 (컨셉 A). 콘텐츠(MDX) 파이프라인 밖의 격리 라우트라
 * 사이드바·검색·llms.txt에 잡히지 않는다. 승인 후 이 라우트는 삭제한다.
 */
export const metadata = {
  title: '별자리 시안 · 프리뷰'
}

const VARIANTS = [
  {
    key: 'hybrid' as const,
    name: '① 하이브리드 — 동료만 별, 나머지는 동그라미 (추천)',
    note: '북극성(함께 자란 동료)만 손그림 별, 나머지 키워드는 동그라미. 위계 + 간결 + 브랜드 온기.'
  },
  {
    key: 'dots' as const,
    name: '② 전부 동그라미 — 성도風 간결형',
    note: '모든 별을 손그림 점으로. 실제 천문 성도에 가장 가깝고 가장 미니멀.'
  },
  {
    key: 'star' as const,
    name: '③ 전부 손그림 별 — 현재 시안',
    note: 'Hero StarMark 계열 손그림 별 6개. 따뜻하지만 다소 번잡할 수 있음.'
  }
]

export default async function ConstellationPreviewPage({
  searchParams
}: {
  searchParams: Promise<{ only?: string }>
}) {
  const { only } = await searchParams
  const shown = only ? VARIANTS.filter((v) => v.key === only) : VARIANTS

  return (
    <div style={{ maxWidth: '62rem', margin: '0 auto', padding: '2rem 1rem 5rem' }}>
      <p style={{ fontSize: '0.85rem', color: 'rgb(150,150,150)', margin: '0 0 2rem' }}>
        시안 · 컨셉 A(국자가 북극성을 가리킴) · 별 글리프 3형태 비교 — 라이브 컴포넌트는 아직 그대로입니다.
      </p>

      {shown.map((v) => (
        <section key={v.key} style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.15rem', color: 'rgb(70,70,70)' }}>
            {v.name}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'rgb(150,150,150)', margin: '0 0 0.75rem' }}>{v.note}</p>
          <CrewVoiceConstellation variant={v.key} />
        </section>
      ))}
    </div>
  )
}
