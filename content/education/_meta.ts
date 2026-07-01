import logs from '../logs'

export default {
  index: {
    title: '📖 개요',
    theme: {
      breadcrumb: false,
      pagination: false,
      timestamp: false,
      typesetting: 'article'
    }
  },
  '--understand': { type: 'separator', title: '이해하기' },
  philosophy: '🎯 교육 철학',
  curriculum: '🗺️ 커리큘럼',
  insights: '🧩 검증된 패턴',
  '--build': { type: 'separator', title: '적용하기' },
  start: '🚀 시작하기',
  'design-poe': '🔭 발견 학습 설계하기',
  tools: '🛠️ 검증된 도구',
  '--field': { type: 'separator' },
  conversations: '🗂️ 우테코 현장',
  // '이 문서에 대해' 섹션은 사이드바에서 통째로 숨긴다. separator 항목은
  // display를 지원하지 않으므로(Nextra strictObject) 구분선 줄을 제거하고,
  // 아래 항목들은 각각 display: 'hidden'으로 숨긴 채 라우팅만 유지한다.
  'how-its-made': { title: '🏗️ 문서가 만들어지는 법', display: 'hidden' },
  logs: { title: `실험 로그 (${logs.length})`, display: 'hidden' },
  assessment: {
    title: '평가',
    display: 'hidden'
  },
  'failed-experiments': {
    title: '실패한 교육',
    display: 'hidden'
  },
  operations: {
    title: '운영',
    display: 'hidden'
  }
}
