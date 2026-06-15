// 연도별 커리큘럼 변화의 단일 진실 원천 (웹 표시용 요약 데이터).
//
// 원본/상세는 knowledge/wiki/curriculum-evolution.md 에 있다 (LLM 위키, 웹 비공개).
// 이 파일은 거기서 distill 한 요약이며, <CurriculumTimeline> 이 렌더링한다.
//
// depth: 데이터 신뢰도를 솔직히 표시한다.
//   - 'rich'   : 다수 출처로 교차 확인됨 (강조)
//   - 'sparse' : 단일 미션 중심 부분 관측 ("기록 보강 중"으로 표시, muted)
// 새 연도를 추가하려면 배열 맨 아래(최신)에 객체 하나만 더하면 된다.

export interface CurriculumYear {
  /** 연도 (정렬·라벨 기준) */
  year: number
  /** 기수 — 확정된 경우에만. 없으면 배지 생략 */
  cohort?: string
  /** 그 해를 한 줄로 요약한 제목 */
  headline: string
  /** 전년 대비 가장 큰 변화 한 줄 */
  change: string
  /** 레벨/미션/주제의 키 변화 2~4개 */
  highlights: string[]
  /** 데이터 신뢰도 */
  depth: 'sparse' | 'rich'
  /** 더 깊이 — 웹에 발행된 로그/인사이트만 (없으면 펼침만 제공) */
  detailHref?: string
}

// 오래된 → 최신 순. 진화 서사로 읽히도록 배열 순서를 유지한다.
const curriculumHistory: CurriculumYear[] = [
  {
    year: 2021,
    headline: '학습 골격이 자리잡다',
    change: 'FE 페이먼츠 미션 개설 — Form·Custom Hook·컴포넌트 분리가 핵심.',
    highlights: [
      'Form 상태 관리와 재사용 가능한 컴포넌트가 React 학습의 축으로 설정',
      '이후 5년간 변하지 않는 영구 골격(form·상태·컴포넌트·재사용)의 출발점',
    ],
    depth: 'sparse',
  },
  {
    year: 2022,
    headline: '배포 경험을 더하다',
    change: '3단계(라이브러리 배포) 도입, TypeScript 비중이 한 단계 상승.',
    highlights: [
      '미션에 "직접 만든 것을 배포해보는" 단계가 추가',
      'TypeScript를 다루는 PR 비중이 눈에 띄게 증가',
    ],
    depth: 'sparse',
  },
  {
    year: 2023,
    headline: 'Storybook 문화의 정착',
    change: '컴포넌트 문서화(Storybook)가 대부분의 제출에 자리잡음.',
    highlights: [
      'Storybook 사용이 일부 실험에서 표준 관행으로 전환',
      '컴포넌트를 "문서화 가능한 단위"로 설계하는 감각 확산',
    ],
    depth: 'sparse',
  },
  {
    year: 2024,
    headline: '곁가지를 쳐내고 기본기로',
    change: '3단계를 축소하고 FE 기본기에 다시 집중.',
    highlights: [
      '확장 단계를 덜어내고 핵심 학습 목표에 자원을 모음',
      '"무엇을 더할까"만큼 "무엇을 뺄까"도 커리큘럼 설계임을 보여준 해',
    ],
    depth: 'sparse',
  },
  {
    year: 2025,
    headline: '"동작"에서 "책임"으로 기준 상향',
    change: '에러 처리와 테스트가 사실상 필수가 됨. PR이 사고 과정 공유의 장으로.',
    highlights: [
      '테스트·에러 처리를 다루는 PR 비중이 급증 (정상 동작 → 예외까지 책임)',
      'PR 본문 평균 길이가 늘며 셀프 리뷰·고민 명시 문화 정착',
    ],
    depth: 'rich',
    detailHref: '/education/logs/react-payments-555prs-analysis',
  },
  {
    year: 2026,
    headline: '서버 경계 설계 + AI 협업 미션',
    change: '페이먼츠 미션이 비동기·서버 통신·통합 테스트로 재설계되고, 레벨 1에 AI 협업 미션 신설.',
    highlights: [
      '비동기 상태·MSW 모킹·통합 테스트 도입 — 학습 단위가 "기능 동작"에서 "서버 경계·계약 설계"로 상향',
      '레벨 1에 Gemini Canvas 기반 AI 협업 미션 신설(전 트랙 공통) — "동작하는 무언가를 세상에 내놓는 경험"',
      'PR 본문 평균 길이 2021년 대비 약 2.5배 — 테크 스펙·자기 분석 동반',
    ],
    depth: 'rich',
    detailHref: '/education/logs/react-payments-555prs-analysis',
  },
]

export default curriculumHistory
