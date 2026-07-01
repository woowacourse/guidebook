import { CrewVoiceMap } from '../../../components/CrewVoiceMap'

/** 별자리 검증용 임시 프리뷰(라이브 CrewVoiceMap 그대로). 검증 후 삭제. */
export const metadata = { title: '별자리 검증 · 프리뷰' }

export default function ConstellationPreviewPage() {
  return (
    <div style={{ maxWidth: '62rem', margin: '0 auto', padding: '2rem 1rem 5rem' }}>
      <p style={{ fontSize: '0.85rem', color: 'rgb(150,150,150)', margin: '0 0 1.5rem' }}>
        검증용 · 8별(북극성 1 + 국자 7) · 점 축소 · 캡션 간격 · 생각방울 말풍선 · 북극성 색은 호버 시에만
      </p>
      <CrewVoiceMap />
    </div>
  )
}
