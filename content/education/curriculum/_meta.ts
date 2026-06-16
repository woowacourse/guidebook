export default {
  index: {
    title: '개요',
    display: 'hidden',
    theme: {
      breadcrumb: false,
      pagination: false,
      timestamp: false
      // typesetting:'article' 제거 — h1을 가운데 정렬해 다른 콘텐츠 페이지(철학·인사이트·로그)와 어긋났음
    }
  },
  // 설계 원칙: 본문은 비워뒀지만 승격 자동화(PROMOTED 마커)의 대상이라 파일은 유지하고 사이드바에서만 숨김.
  // 단일 페이지 구조라 형제 페이지가 없으므로 pagination 비활성(없으면 prerender 시 route 오류).
  'design-principles': {
    title: '설계 원칙',
    display: 'hidden',
    theme: {
      breadcrumb: false,
      pagination: false,
      timestamp: false
    }
  }
}
