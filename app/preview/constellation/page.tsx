import { CrewVoiceConstellation } from '../../../components/CrewVoiceConstellation'

/**
 * 별자리 개편 시안 프리뷰 (컨셉 A). 콘텐츠(MDX) 파이프라인 밖의 격리 라우트라
 * 사이드바·검색·llms.txt에 잡히지 않는다. 승인 후 이 라우트는 삭제한다.
 */
export const metadata = {
  title: '별자리 시안 · 프리뷰'
}

export default function ConstellationPreviewPage() {
  return (
    <div style={{ maxWidth: '62rem', margin: '0 auto', padding: '2rem 1rem 5rem' }}>
      <p style={{ fontSize: '0.85rem', color: 'rgb(150,150,150)', margin: '0 0 1.5rem' }}>
        시안 · 컨셉 A(국자가 북극성을 가리킴) · 은은한 연결선 · 모바일도 별자리 유지 —
        라이브 컴포넌트는 아직 그대로입니다.
      </p>
      <CrewVoiceConstellation />
    </div>
  )
}
