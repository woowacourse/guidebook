export default {
  index: {
    title: '개요',
    theme: {
      breadcrumb: false,
      pagination: false,
      timestamp: false,
      typesetting: 'article'
    }
  },
  // 일단 아래 3개(회고 형식·연극 온보딩·AI 협업 미션)만 노출.
  // 나머지는 display:'hidden'으로 사이드바에서만 숨김 — 라우트·파일은 유지(직접 URL 접근 가능).
  'clean-language-mentoring': { title: '클린 랭귀지 상호 멘토링', display: 'hidden' },
  'research-cycle-workflow': { title: '연구 사이클 워크플로우', display: 'hidden' },
  'rendering-strategy-workshop': { title: '렌더링 전략 결정 워크숍', display: 'hidden' },
  'mission-repo-analysis-workflow': { title: '미션 저장소 PR 데이터 분석', display: 'hidden' },
  'retrospective-format-kit': '회고 형식',
  'drama-onboarding-kit': '연극 온보딩',
  'ai-collaboration-mission-kit': 'AI 협업 미션'
}
