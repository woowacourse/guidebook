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
  about: '👋 우테코 소개',
  hero: '🌍 글로벌 확장 (베를린)',
  philosophy: '🎯 교육 철학',
  curriculum: '🗺️ 커리큘럼',
  insights: '🧩 검증된 패턴',
  '--build': { type: 'separator', title: '적용하기' },
  start: '🚀 시작하기',
  'design-poe': '🔭 발견 학습 설계하기',
  tools: '🛠️ 검증된 도구',
  '--meta': { type: 'separator', title: '이 문서에 대해' },
  'how-its-made': '🏗️ 문서가 만들어지는 법',
  logs: { title: `실험 로그 (${logs.length})`, display: 'hidden' },
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
