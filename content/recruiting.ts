export type RecruitingStatus = '모집중' | '모집예정' | '마감'

export interface RecruitingSchedule {
  /** 단계명 (예: '서류접수') */
  phase: string
  /** 기간/날짜 문자열 */
  period: string
  /** 보조 설명·링크 안내 (선택) */
  note?: string
}

export interface Recruiting {
  /** 기수 (예: '8기') */
  cohort: string
  /** 모집 연도 */
  year: number
  status: RecruitingStatus
  /** 지원 폼 URL */
  applyUrl?: string
  /** 입학 설명회 영상 URL */
  infoSessionUrl?: string
  schedule: RecruitingSchedule[]
  /** 미리 생각해 볼 질문 */
  questions: string[]
}

// 다음 기수 모집은 이 파일만 수정하면 됩니다.
// status 를 '모집중' 으로 바꾸면 홈 배너와 지원하기 CTA 가 켜집니다.
const recruiting: Recruiting = {
  cohort: '8기',
  year: 2026,
  status: '마감',
  applyUrl: 'https://apply.techcourse.co.kr/recruits',
  infoSessionUrl: 'https://www.youtube.com/watch?v=cv01__jxppU',
  schedule: [
    {
      phase: '입학 설명회',
      period: '2025년 9월 24일(수) 10:30 ~ 12:00',
      note: '온라인'
    },
    {
      phase: '서류접수',
      period: '2025년 9월 29일(월) 오후 3시 ~ 10월 10일(금) 오전 10시'
    },
    {
      phase: '프리코스',
      period: '2025년 10월 14일(화) ~ 11월 17일(월)'
    },
    {
      phase: '1차 합격자 발표',
      period: '2025년 12월 29일(월) 오후 3시'
    },
    {
      phase: '최종 코딩 테스트',
      period: '2026년 1월 10일(토)',
      note: '오프라인, 장소는 추후 안내 예정'
    },
    {
      phase: '최종 합격자 발표',
      period: '2026년 1월 23일(금) 오후 3시'
    },
    {
      phase: '본코스 시작',
      period: '2026년 2월 24일(화) 오전 10시'
    }
  ],
  questions: [
    '가장 깊이 몰입했던 도전 경험을 들려주세요. 프로그래밍이 아닌 다른 분야여도 좋습니다. 왜 그 일에 빠져들었는지, 직면한 가장 큰 난관과 이를 어떻게 극복했는지, 그 경험이 당신을 어떻게 변화시켰는지 구체적으로 작성해 주세요.'
  ]
}

export default recruiting
