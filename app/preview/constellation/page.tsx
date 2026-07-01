import { CrewVoiceMap } from '../../../components/CrewVoiceMap'

/** 히트 영역 검증용 임시 프리뷰. 검증 후 삭제. */
export const metadata = { title: '별자리 히트영역 검증' }

export default function ConstellationPreviewPage() {
  return (
    <div style={{ maxWidth: '62rem', margin: '0 auto', padding: '2rem 1rem 5rem' }}>
      <p style={{ fontSize: '0.85rem', color: 'rgb(150,150,150)', margin: '0 0 1.5rem' }}>
        히트영역 검증 · 각 별의 호버/탭 가능 영역(임시로 주황 원 표시)
      </p>
      <CrewVoiceMap />
    </div>
  )
}
