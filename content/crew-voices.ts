// ─────────────────────────────────────────────────────────────
// 크루의 목소리 — 두 갈래 데이터
//   crewThemes : 메시지에서 무엇이 "얼마나 자주" 나왔는가 (랜딩 타이포 빈도 맵)
//   crewVoices : 개별 메시지 원문 (아카이브 전체 인용)
//
// 지금 값은 실제 메시지를 받기 전 "예시"입니다 (example: true).
// 실제 메시지가 쌓이면:
//   ① crewVoices 에 원문/작성자 채우고 example 줄 삭제
//   ② crewThemes 의 count 를 실제 빈도로 갱신(주제 태그 집계)
// ─────────────────────────────────────────────────────────────

/** 메시지에서 반복된 주제 한 묶음 — 랜딩 타이포 빈도 맵의 단위 */
export interface CrewTheme {
  /** 식별 키 */
  key: string
  /** 화면에 보일 주제명 (글자 크기로 빈도를 인코딩) */
  label: string
  /** 이 주제가 언급된 메시지 수 (현재는 예시값) */
  count: number
  /** 이 주제를 대표하는 크루 문장 — 호버/탭하면 캡션에 뜬다 */
  quote: string
}

/** 지금까지 우테코를 수료한 누적 크루 수. CrewJourney 궤도와 CrewVoiceMap 서브텍스트가 공유한다 */
export const crewCount = 735

/** 빈도 내림차순으로 둔다. 맵은 이 순서와 count로 크기·위계를 만든다 */
export const crewThemes: CrewTheme[] = [
  {
    key: 'growth',
    label: '성장·자기효능감',
    count: 124,
    quote: '매주 쌓인 작은 완성이 "나도 만든다"는 확신이 됐어요.',
  },
  {
    key: 'together',
    label: '함께 자라기',
    count: 96,
    quote: '혼자였다면 못 갔을 거리를, 동료들과 함께 걸었어요.',
  },
  {
    key: 'self-directed',
    label: '자기주도 학습',
    count: 71,
    quote: '정답을 안 떠먹여 줘서 답답했는데, 그 답답함이 스스로 배우는 근육이 됐어요.',
  },
  {
    key: 'review',
    label: '질문하는 리뷰',
    count: 52,
    quote: '리뷰어의 질문 하나하나가 "왜?"를 멈추지 않게 했어요.',
  },
  {
    key: 'flow',
    label: '몰입',
    count: 44,
    quote: '시간 가는 줄 모르고 붙잡고 있다가, 어느새 어제의 나보다 나아져 있었어요.',
  },
  {
    key: 'safety',
    label: '심리적 안전감',
    count: 38,
    quote: '모른다고 말해도 괜찮은 곳이어서, 처음으로 마음껏 질문했어요.',
  },
  {
    key: 'resilience',
    label: '회복탄력성',
    count: 27,
    quote: '막히면 부끄러워하기보다 먼저 손을 들게 됐어요. 그게 제일 큰 변화예요.',
  },
]

/** 현재 표시값이 실측이 아니라 예시임을 한곳에서 끈다. 실데이터 도입 시 false */
export const crewThemesAreExample = true

/** 아카이브 전체 인용에 쓰는 개별 메시지 */
export interface CrewVoice {
  /** 메시지 본문 */
  quote: string
  /** 익명 표기. 예: '6기 백엔드 크루' */
  author: string
  /** crewThemes 의 key (집계·필터용, 선택) */
  theme?: string
  /** "이런 분께 추천한다" 한 줄 (일부 항목에만) */
  recommendsTo?: string
  /** true면 '예시' 배지. 실제 메시지를 받으면 이 줄을 지운다 */
  example?: boolean
}

const crewVoices: CrewVoice[] = [
  {
    quote:
      '혼자였다면 못 갔을 거리를 10개월간 동료들과 함께 걸었습니다. 코드보다 먼저 "같이 자라는 법"을 배웠어요.',
    author: '6기 백엔드 크루',
    theme: 'together',
    recommendsTo: '혼자보다 함께 더 멀리 가고 싶은 분',
    example: true,
  },
  {
    quote:
      '정답을 떠먹여 주지 않아 처음엔 답답했는데, 그 답답함이 결국 스스로 학습하는 근육이 됐습니다.',
    author: '7기 프론트엔드 크루',
    theme: 'self-directed',
    recommendsTo: '스스로 답을 찾는 과정을 즐기는 분',
    example: true,
  },
  {
    quote:
      '리뷰어의 질문 하나하나가 "왜?"를 멈추지 않게 했어요. 지금도 PR을 올릴 때 그 질문들이 떠오릅니다.',
    author: '8기 안드로이드 크루',
    theme: 'review',
    example: true,
  },
  {
    quote:
      '비전공자로 시작했지만, 매주 쌓이는 작은 완성이 "나도 만들 수 있다"는 확신으로 바뀌었습니다.',
    author: '7기 백엔드 크루',
    theme: 'growth',
    recommendsTo: '전공·경력보다 성장 의지가 앞서는 분',
    example: true,
  },
  {
    quote:
      '모른다고 말해도 괜찮은 분위기여서, 처음으로 마음껏 질문하고 마음껏 틀려봤습니다.',
    author: '6기 프론트엔드 크루',
    theme: 'safety',
    example: true,
  },
]

export default crewVoices
