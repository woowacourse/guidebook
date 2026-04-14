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

| 커맨드 | 파일 변경 | 역할 |
|--------|-----------|------|
| `/review-log [slug]` | 없음 | 품질 평가만 (읽기 전용) |
| `/improve-log <slug>` | 로그 MDX | 특정 로그 반복 개선 |
| `/improve-all` | 로그 MDX들 | 전체 로그 순회 개선 |
| `/extract-insights [카테고리]` | insights/ | 교차 패턴 → 인사이트 문서 생성 |
| `/sync-model [slug\|scan]` | education-model/ | 인사이트 → 교육 모델 반영 |
| `/research-cycle [dry-run]` | 전체 | 전체 파이프라인 실행 |
| `/auto-sync` | 자동 | 신규 로그 증분 처리 (비대화형) |

#### `/review-log` — 품질 평가 (변경 없음)

```
/review-log             # 전체 로그 일괄 평가 + 우선순위 제안
/review-log expedition  # 특정 로그만 평가
```

5개 차원(D1 구조 · D2 구체성 · D3 전이 · D4 교훈 · D5 원본, 25점 만점)으로 점수를 매깁니다. **로그를 수정하지 않습니다.** 어떤 로그를 먼저 개선할지 판단하거나, 개선 전·후 변화를 확인할 때 사용합니다.

#### `/improve-log` — 로그 개선 (인자 필수)

```
/improve-log expedition
```

한 번에 **한 차원만** 개선하고 재측정합니다. 점수가 올랐으면 커밋, 내려갔으면 자동 리버트합니다. 최대 5회 반복하거나 A등급(21점+)에 도달하면 종료됩니다.

#### `/improve-all` — 전체 순회 개선

```
/improve-all
```

점수가 낮은 로그부터 순서대로 `/improve-log`를 실행합니다. 전체 평균이 B등급(16점) 이상이 되거나 10개를 처리하면 멈춥니다.

#### `/extract-insights` — 교차 패턴 탐지

```
/extract-insights           # 전체 로그 분석
/extract-insights 레벨1     # 특정 카테고리만 분석
```

3개 이상의 로그에서 공통으로 나타나는 요소만 **강한 패턴**으로 인정하고 인사이트 문서를 생성합니다. 2개 이하는 약한 패턴으로 기록만 하고, 추가 실험을 기다립니다.

#### `/sync-model` — 교육 모델 동기화

```
/sync-model                         # 미반영 인사이트 전체 반영
/sync-model scaffolding-pattern     # 특정 인사이트만 반영
/sync-model scan                    # 반영 대상 식별만, 변경 없음
```

기존 교육 모델 내용을 **수정하지 않고**, 실험에서 검증된 사례를 추가하는 방식으로 동기화합니다. 한 사이클에 최대 3건 제한.

#### `/research-cycle` — 전체 파이프라인

```
/research-cycle          # 측정→개선→승격→동기화 전체 실행
/research-cycle dry-run  # Phase 1·3만 실행 (평가만, 변경 없음)
```

처음 전체 현황을 파악할 때는 `dry-run`으로 시작한 후 전체 실행을 판단하는 것을 권장합니다.

#### `/auto-sync` — 증분 자동 동기화 (비대화형)

```
/auto-sync
```

`lastSyncCommit` 이후 변경된 신규 로그만 대상으로 승격 평가 → 인사이트 추출 → 모델 동기화 → 단일 커밋을 자동 수행합니다. 사람에게 확인을 묻지 않으며, 모든 변경은 단일 커밋으로 묶어 `git revert` 한 번으로 원복 가능합니다.

**안전장치**: 승격 점수 16점 미만 자동 제외 / 파일당 auto-sync 마커 5개 상한 도달 시 `needsHumanReview`에 추가.

Stop 훅(`.claude/hooks/auto-sync-check.sh`)이 미반영 로그 수가 임계값 이상이면 알림을 보냅니다. 임계값은 `.claude/sync-state.json`의 `config.threshold`로 조정합니다.

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
