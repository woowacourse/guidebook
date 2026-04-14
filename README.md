# woowacourse-docs

우아한테크코스 공식 교육 가이드북. Nextra 4 + Next.js App Router 기반.

## 빠른 시작

```bash
npm install
npm run dev     # http://localhost:3000
```

## 콘텐츠 구조

```
content/
├── index.mdx                  홈 (RecentUpdates 타임라인 자동 렌더링)
├── updates.ts                 최근 업데이트 데이터 (단일 진실 원천)
└── education/
    ├── philosophy/            교육 철학 (근본 원칙, 이론적 기반)
    ├── design-patterns/       디자인 패턴 (검증된 교육 설계 패턴 카탈로그)
    ├── curriculum/            커리큘럼 (레벨별 설계 원칙)
    ├── insights/              인사이트 (실험 로그에서 추출한 교차 패턴)
    ├── tools/                 검증된 도구 (복사해서 바로 쓰는 워크플로우/프롬프트)
    └── logs/                  실험 로그 (매주 쌓이는 원재료)
```

## 연구 사이클 워크플로우

매주 실험 로그가 쌓이면 아래 파이프라인으로 교육 모델로 승격한다.

```
실험 로그 (logs/)
    ↓ 품질 평가·개선 (D1~D5, 25점)
    ↓ 승격 평가 (P1~P4, 20점)
    ├→ 검증된 도구 (tools/)          P2 ≥ 4
    ├→ 인사이트 (insights/)          P3 ≥ 4
    ├→ 디자인 패턴 (design-patterns/) P4 ≥ 4 + P1 ≥ 3
    ├→ 커리큘럼 (curriculum/)         P4 ≥ 4 + P1 ≥ 3
    └→ 교육 철학 (philosophy/)        P4 ≥ 4 + P1 ≥ 4 (엄격)
```

### 커맨드

```bash
# 전체 파이프라인 (측정 → 개선 → 승격 → 동기화)
/research-cycle

# 변경 없이 평가만
/research-cycle dry-run

# 특정 로그 품질 평가
/review-log {slug}

# 특정 로그 반복 개선
/improve-log {slug}

# 전체 로그 순회 개선
/improve-all

# 교차 패턴 탐지 → 인사이트 문서 생성
/extract-insights

# 인사이트 → 교육 모델 동기화
/sync-model
```

### 스킬 (에이전트 컨텍스트)

Claude Code에서 위 커맨드 대신 자연어로 요청할 때 `.claude/skills/`의 스킬이 자동으로 발동된다:

| 스킬 | 트리거 상황 |
|------|------------|
| `research-cycle` | "연구 사이클 실행", "로그 승격", "전체 로그 처리" |
| `log-quality` | "로그 점수 매기기", "특정 로그 리뷰", "로그 개선" |
| `insight-extraction` | "교차 패턴 탐지", "인사이트 추출" |
| `promotion` | "교육 모델 동기화", "디자인 패턴에 반영" |

### 에이전트 팀

`/research-cycle` 실행 시 4개 에이전트가 협력한다:

| 에이전트 | 역할 |
|----------|------|
| `research-cycle-orchestrator` | 전체 파이프라인 조율 |
| `log-quality-agent` | 로그 품질 평가 및 개선 |
| `insight-agent` | 교차 패턴 탐지 및 인사이트 문서 작성 |
| `promotion-agent` | 교육 모델 승격 실행 |

## 콘텐츠 추가 규칙

새 MDX 파일 추가 시 반드시 함께 처리:

1. **`_meta.ts`** — 해당 디렉토리에 새 항목 등록
2. **`content/updates.ts`** — 배열 맨 위에 추가 (랜딩 페이지 타임라인 자동 반영)
3. **`content/logs.ts`** — 실험 로그 추가 시에만 (`index.mdx`는 `<LogList />`가 자동 렌더링)

## 루브릭 (변경 금지)

평가 기준 파일은 사람만 수정한다. 기준이 바뀌면 모든 이전 점수와 비교 불가능해진다.

- `.claude/log-quality-rubric.md` — 로그 품질 (D1~D5, 25점)
- `.claude/promotion-rubric.md` — 승격 적격성 (P1~P4, 20점)
- `.claude/tool-promotion-rubric.md` — 도구 승격 기준

## 기술 스택

- [Nextra 4](https://nextra.site/) — MDX 기반 문서 사이트 프레임워크
- Next.js App Router
- TypeScript
