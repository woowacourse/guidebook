# woowacourse-docs

우아한테크코스 공식 교육 가이드북. Nextra 4 + Next.js App Router 기반.

## 빠른 시작

```bash
npm install
npm run dev     # http://localhost:3000
```

## 팀원으로 처음 왔다면

Claude Code를 이 저장소에서 열고 아래 네 커맨드만 기억하세요.

```
/사용방법       저장소 워크플로우 한눈에 보기
/로그추가       새 실험 로그를 씁니다
/로그평가       쓴 로그의 품질 점수를 봅니다
/로그개선       약한 차원을 자동 보강합니다
```

첫 실험 로그를 쓰는 순서:

1. `/사용방법` — 전체 흐름을 한 번 훑습니다.
2. `/로그추가` — 대화형 질문(슬러그·제목·요약·phases·tracks)에 답하면 `content/education/logs/`에 MDX 스켈레톤이, `content/logs.ts`에 항목이 자동으로 만들어집니다.
3. MDX 본문의 D1~D5 섹션(맥락·시도한 것·관찰·반성·다음 실험)을 채웁니다.
4. `/로그평가 {슬러그}` 로 점수를 확인합니다.
5. 낮은 차원이 보이면 `/로그개선 {슬러그}` 로 반복 보강합니다.

## 실험 로그 워크플로우

### 작성

```
/로그추가
```

대화형 질문에 답하면 아래 파일이 정합적으로 갱신됩니다.

- 생성: `content/education/logs/{슬러그}.mdx` (D1~D5 섹션 스켈레톤)
- 수정: `content/logs.ts` (배열 맨 위에 새 항목)
- 선택: `content/updates.ts` (팀원이 "랜딩 타임라인에 올림"을 선택한 경우에만)

### 점검

```
/로그평가 {슬러그}     # 개별 로그
/로그평가              # 전체 일괄
```

D1~D5 다섯 차원(25점 만점) 점수와 약한 차원 코멘트를 반환합니다. **파일은 변경하지 않습니다.**

### 보강

```
/로그개선 {슬러그}
```

가장 약한 차원부터 한 번에 하나씩 최대 5회 반복 개선. 점수가 떨어지면 자동 revert.

## 승격 파이프라인

로그가 쌓이면 검증된 패턴을 도구·인사이트·교육 모델로 끌어올립니다.

```
실험 로그 (logs/)
    ↓ 품질 평가·개선 (D1~D5, 25점)
    ↓ 승격 평가 (P1~P4, 20점)
    ├→ 검증된 도구 (tools/)           P2 ≥ 4
    ├→ 인사이트 (insights/)           P3 ≥ 4
    ├→ 디자인 패턴 (design-patterns/) P4 ≥ 4 + P1 ≥ 3
    ├→ 커리큘럼 (curriculum/)         P4 ≥ 4 + P1 ≥ 3
    └→ 교육 철학 (philosophy/)        P4 ≥ 4 + P1 ≥ 4 (엄격)
```

### 커맨드

```
/로그승격            전체 파이프라인 (측정 → 개선 → 승격 → 동기화)
/로그승격 dry-run    평가와 후보 파악만, 파일 변경 없음
/로그승격 추출       교차 패턴 탐지 → 인사이트 문서 생성만
/로그승격 동기화     인사이트 → 교육 모델 반영만
/로그승격 자동       증분 비대화형 (신규 로그만, 단일 커밋)
```

처음 쓰는 경우 `dry-run`으로 먼저 현황을 확인한 뒤 전체 실행하는 것을 권장합니다.

## 커맨드 레퍼런스

| 커맨드 | 인자 | 파일 변경 | 한 줄 설명 |
|--------|------|-----------|------------|
| `/사용방법` | 없음 | 없음 | 팀원용 온보딩 가이드 출력 |
| `/로그추가` | 없음 (대화형) | MDX + logs.ts | 새 실험 로그 생성 |
| `/로그평가` | `[슬러그]` | 없음 | 로그 품질 점수 측정 |
| `/로그개선` | `<슬러그>` 필수 | 로그 MDX | 차원별 반복 개선 |
| `/로그승격` | `[dry-run\|추출\|동기화\|자동]` | 서브커맨드별 | 승격 파이프라인 |

## 내부 구성

`.claude/` 아래의 구성 요소. 일반 사용 시 직접 다룰 필요는 없습니다.

- `agents/` — 한국어 커맨드가 내부에서 호출하는 전문 에이전트 (log-quality, insight, promotion, research-cycle-orchestrator)
- `skills/` — 승격 파이프라인의 단계별 스킬 (log-quality, insight-extraction, promotion, research-cycle)
- `hooks/auto-sync-check.sh` — 매 대화 종료 시 미반영 로그를 감지해 `/로그승격 자동` 실행을 권장하는 알림 훅
- `log-quality-rubric.md` / `promotion-rubric.md` / `tool-promotion-rubric.md` — 평가 기준. **사람만 수정합니다** (기준이 바뀌면 과거 점수와 비교 불가능).
- `sync-state.json` — 증분 동기화 상태 (팀 공유)
- `settings.json` — 훅 설정 (팀 공유)
- `settings.local.json` — 개인 권한 설정 (`.gitignore` 대상)

## 콘텐츠 구조

```
content/
├── index.mdx           홈 (RecentUpdates 타임라인 자동 렌더링)
├── updates.ts          최근 업데이트 데이터 (단일 진실 원천)
├── logs.ts             실험 로그 메타데이터 (LogList 데이터 소스)
└── education/
    ├── philosophy/        교육 철학
    ├── design-patterns/   디자인 패턴 카탈로그
    ├── curriculum/        커리큘럼 (레벨별 설계 원칙)
    ├── insights/          인사이트 (실험 로그에서 추출한 교차 패턴)
    ├── tools/             검증된 도구 (복사해서 바로 쓰는 워크플로우)
    └── logs/              실험 로그 (매주 쌓이는 원재료)
```

## 콘텐츠 추가 규칙

- **실험 로그**: `/로그추가`로 자동 처리 (MDX + `logs.ts`)
- **그 외 문서**: 새 MDX 추가 시 `_meta.ts` 등록 + (필요 시) `updates.ts` 추가

상세 규칙은 `CLAUDE.md` 참조.

## 기술 스택

- [Nextra 4](https://nextra.site/) — MDX 기반 문서 사이트 프레임워크
- Next.js App Router
- TypeScript
