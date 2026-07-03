// 크루 성장 여정의 단일 진실 원천 (웹 표시용).
//
// 레벨 0~5를 하나의 "보편 아크"로 본다 — 트랙(FE·BE·안드로이드·소프트스킬)과
// 무관하게 온보딩→기초→중급→협업→심화→취업이라는 성장 골격은 공통이다.
// 히어로(한눈에 보는 성장 길)와 서사 섹션이 이 배열 하나를 공유한다.
//
// - pose: public/images/characters/{pose}.png (기존 18종에서만 고름)
// - 트랙별 상세 흐름은 CurriculumTimeline(/education/curriculum)이 담당. 여기선 서사만.

export interface GrowthStage {
  level: string // '레벨 0' ~ '레벨 5'
  stage: string // 단계 한 단어
  title: string // 이 단계의 한 줄 제목
  glance: string // 히어로 캡션 (짧게)
  story: string // 서사 2~3문장 (합니다체)
  pose: string // 파일명 (확장자 제외)
  links?: { label: string; href: string }[] // 커리큘럼 근거
}

const GROWTH_ARC: GrowthStage[] = [
  {
    level: '레벨 0',
    stage: '온보딩',
    title: '낯선 우테코에 도착',
    glance: '연극으로 서로를 먼저 압니다',
    story:
      '우테코의 첫 미션은 코드가 아니라 연극입니다. 프론트엔드·백엔드·안드로이드 크루가 트랙 구분 없이 한 조로 섞여 무대를 함께 준비합니다. 작은 협업 경험 속에서 나를 드러내고, 심리적 안전감을 함께 만들어 가는 법을 배웁니다.',
    pose: '행성이-호기심',
    links: [{ label: '연극 온보딩 도구', href: '/education/tools/drama-onboarding-kit' }],
  },
  {
    level: '레벨 1',
    stage: '기초',
    title: '프로그래밍 기본 근육을 익힙니다',
    glance: '테스트와 리팩터링이 습관이 됩니다',
    story:
      '이제 직접 만듭니다. 콘솔 앱으로 프로그래밍 기본기를 다지되 동작하는 코드에서 멈추지 않습니다. 테스트를 쓰고 리팩터링하며, 왜 이렇게 짰는지를 PR에 적어 동료와 나눕니다.',
    pose: '행성이-코딩',
    links: [{ label: '로또 미션 기록', href: '/education/logs/fe-lotto-2026-prs' }],
  },
  {
    level: '레벨 2',
    stage: '중급',
    title: '프레임워크로 설계 근육을 키웁니다',
    glance: '트레이드오프를 저울질합니다',
    story:
      '기본기 위에 프레임워크를 올립니다. 애플리케이션을 스스로 설계하고 구조화하며, 같은 문제를 여러 번 다시 풀어 정답 대신 트레이드오프를 저울질하는 힘을 기릅니다.',
    pose: '행성이-운동',
    links: [{ label: '쌓아 올리는 학습', href: '/education/curriculum#쌓아-올리는-학습' }],
  },
  {
    level: '레벨 3',
    stage: '협업',
    title: '팀으로 함께 짓습니다',
    glance: '기획부터 배포까지, 실제 사용자에게',
    story:
      '혼자 짜던 코드가 팀의 코드가 됩니다. 기획하고 역할을 나누고 충돌을 조율하며 하나의 서비스를 만듭니다. 그리고 실제 사용자에게 배포합니다. 코드보다 사람과 프로세스가 더 어렵다는 걸 여기서 배웁니다.',
    pose: '행성이-회의',
    links: [{ label: '커리큘럼 전체 흐름', href: '/education/curriculum' }],
  },
  {
    level: '레벨 4',
    stage: '심화',
    title: '바퀴를 다시 만들며 깊어집니다',
    glance: '바퀴를 재발명해 원리까지',
    story:
      '이미 있는 도구를 일부러 직접 다시 만듭니다. 바퀴를 재발명하는 이 고생이, 갖다 쓰기만 할 땐 안 보이던 원리를 몸에 새깁니다.',
    pose: '행성이-과열',
    links: [{ label: '검증된 패턴', href: '/education/insights' }],
  },
  {
    level: '레벨 5',
    stage: '취업',
    title: '빛나는 개발자로',
    glance: '이력서·면접·리크루팅데이',
    story:
      '10개월의 성장을 세상에 내보일 시간입니다. 이력서를 다듬고 레벨 인터뷰와 면접을 준비하고 리크루팅데이에서 회사와 만납니다. 낯선 우테코에 도착했던 작은 행성이가 이제 IT 생태계로 걸어 나갑니다.',
    pose: '행성이-축하',
    links: [{ label: '교육 철학으로', href: '/education/philosophy' }],
  },
]

export default GROWTH_ARC
