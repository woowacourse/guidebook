export interface CrewVoice {
  /** 크루가 남긴 메시지 본문 */
  quote: string
  /** 익명 표기. 예: '6기 백엔드 크루' */
  author: string
  /** "이런 분께 추천한다" 한 줄 (일부 항목에만). 추천 대상 표현을 모을 때 사용 */
  recommendsTo?: string
  /** 랜딩 큐레이션(<CrewVoices limit={n} />)에 노출할지 여부 */
  featured?: boolean
  /** true면 '예시' 배지를 단다. 실제 크루 문장을 받으면 이 줄을 지운다 */
  example?: boolean
}

// ─────────────────────────────────────────────────────────────
// 아래 문구는 실제 크루 문장을 받기 전 "예시"입니다 (example: true).
// 실제 메시지가 도착하면: ① quote/author 교체 → ② example 줄 삭제.
// 랜딩 노출은 featured: true 인 항목에서 위에서부터 limit 개수만큼.
// ─────────────────────────────────────────────────────────────
const crewVoices: CrewVoice[] = [
  {
    quote:
      '혼자였다면 못 갔을 거리를 10개월간 동료들과 함께 걸었습니다. 코드보다 먼저 "같이 자라는 법"을 배웠어요.',
    author: '6기 백엔드 크루',
    recommendsTo: '혼자보다 함께 더 멀리 가고 싶은 분',
    featured: true,
    example: true,
  },
  {
    quote:
      '정답을 떠먹여 주지 않아 처음엔 답답했는데, 그 답답함이 결국 스스로 학습하는 근육이 됐습니다.',
    author: '7기 프론트엔드 크루',
    recommendsTo: '스스로 답을 찾는 과정을 즐기는 분',
    featured: true,
    example: true,
  },
  {
    quote:
      '리뷰어의 질문 하나하나가 "왜?"를 멈추지 않게 했어요. 지금도 PR을 올릴 때 그 질문들이 떠오릅니다.',
    author: '8기 안드로이드 크루',
    featured: true,
    example: true,
  },
  {
    quote:
      '비전공자로 시작했지만, 매주 쌓이는 작은 완성이 "나도 만들 수 있다"는 확신으로 바뀌었습니다.',
    author: '7기 백엔드 크루',
    recommendsTo: '전공·경력보다 성장 의지가 앞서는 분',
    example: true,
  },
  {
    quote:
      '데모데이마다 내 서비스를 사람들 앞에서 설명하며, 기술만큼 "전달하는 힘"도 자란다는 걸 느꼈어요.',
    author: '6기 프론트엔드 크루',
    example: true,
  },
]

export default crewVoices
