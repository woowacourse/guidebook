export interface Notice {
  /** 표시·정렬용 날짜 또는 연도 문자열 (예: '2025') */
  date: string
  title: string
  /** 외부/상세 링크 (선택) */
  href?: string
  /** 본문 직접 노출 시 (선택) */
  body?: string
}

// 최신 항목을 맨 위에. href 없으면 제목만 표시합니다.
const notices: Notice[] = [
  { date: '2025', title: '우아한테크코스 2025 리크루팅데이 참여 기업 모집' },
  { date: '2025', title: '우아한테크코스 2025 입학설명회' },
  { date: '2024', title: '우아한테크코스 2024 신입생 서류접수 오픈' },
  { date: '2024', title: '우아한테크코스 2024 입학설명회' },
  { date: '2023', title: '우아한테크코스 2023 리크루팅데이 참여 기업 모집' }
]

export default notices
