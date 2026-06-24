const hidden = (title: string) => ({
  title,
  display: 'hidden' as const,
})

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
  'crew-voices': '크루의 목소리',
  posuta: '포수타',
  bsuta: '브수타',
  'education-briefing-archive': '교육 설명회 아카이브',
  'demo-day-archive': '프로젝트 데모데이 아카이브',
  'interview-challenge-archive': '인터뷰 챌린지 아카이브',
  'newsletter-archive': '뉴스레터 아카이브',
  'tecoble-archive': '테코블 아카이브',
  'uteco-youtube-archive': '우테코 유튜브 채널',
  'techtalk-archive': '테코톡 아카이브',
  'vlog-archive': '브이로그 아카이브',
  'posuta-2024-09-20': hidden('2024년 6기 포수타 · 2024년 9월 20일'),
  'posuta-2025-04-18': hidden('2025년 7기 포수타 · 2025년 4월 18일'),
  'posuta-2025-05-02': hidden('2025년 7기 포수타 · 2025년 5월 2일'),
  'posuta-2025-05-16': hidden('2025년 7기 포수타 · 2025년 5월 16일'),
  'posuta-2025-05-30': hidden('2025년 7기 포수타 · 2025년 5월 30일'),
  'bsuta-8th-2026-04-03': hidden('2026년 8기 브수타 · 2026년 4월 3일'),
}
