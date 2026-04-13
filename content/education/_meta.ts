import logs from '../logs'
import insightsMeta from './insights/_meta'

const insightsCount = Object.entries(insightsMeta).filter(
  ([key, value]) =>
    key !== 'index' &&
    !(typeof value === 'object' && value !== null && 'display' in value && value.display === 'hidden')
).length

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
  philosophy: '🎯 교육 철학',
  curriculum: '🗺️ 커리큘럼',
  'design-patterns': '🧩 디자인 패턴',
  tools: '🛠️ 검증된 도구',
  conversations: '💬 수다 타임 아카이브',
  insights: `⬆️ 핵심 인사이트 (${insightsCount})`,
  logs: `⬆️ 실험 로그 (${logs.length})`,
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
