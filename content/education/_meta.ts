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
  '--build': { type: 'separator', title: '적용하기' },
  start: '🚀 시작하기',
  'design-poe': '🔭 발견 학습 설계하기',
  '--understand': { type: 'separator', title: '이해하기' },
  philosophy: '🎯 교육 철학',
  curriculum: '🗺️ 커리큘럼',
  insights: '🧩 검증된 패턴',
  logs: { title: `실험 로그 (${logs.length})`, display: 'hidden' },
  tools: { title: '검증된 도구', display: 'hidden' },
  conversations: {
    title: '🗂️ 우테코 콘텐츠 아카이브',
    display: 'hidden'
  },
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
