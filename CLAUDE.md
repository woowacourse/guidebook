# 우아한테크코스 공식문서

Nextra 4 + Next.js App Router 기반 교육 가이드북.

## LLM Wiki 패턴 (Karpathy + llms.txt)

이 저장소는 LLM 친화적 위키 구조를 따른다. 자세한 규약은 다음 문서를 참고한다:

- **`AGENTS.md`** — 외부 LLM 에이전트가 이 저장소에 기여할 때의 규약 (OpenAI/Codex/Cursor 호환).
- **`.claude/conventions/frontmatter-spec.md`** — MDX frontmatter 표준 (새 페이지부터 점진 적용).
- **`.claude/templates/`** — 새 페이지 작성 템플릿.
- **`public/llms.txt` / `public/llms-full.txt`** — 외부 LLM이 사이트를 빠르게 훑을 수 있는 진입점. `npm run build` 시 자동 생성.
- **`/위키정리`** — 위키 정합성 lint 커맨드.
- **`/말투점검`** (`npm run lint:tone`) — content 본문 문체 점검. **본문은 합니다체로 통일한다**(한다체·해요체 금지). 규약: `AGENTS.md` > 6. 문체.
- **`npm run lint:codefence`** — 코드펜스 더블 스페이스(문장마다 빈 줄) 검출. **코드블록 빈 줄은 화면에서 한 줄 높이를 그대로 차지하므로 빈 줄은 섹션(헤더) 사이에만 둔다.** 규약: `AGENTS.md` > 4. 자동 검사.

| 역할 | 파일 | 대상 독자 |
|------|------|-----------|
| 워크플로우/schema | `CLAUDE.md` | Claude Code (이 저장소 내부) |
| 컨트리뷰션 규약 | `AGENTS.md` | 모든 LLM 에이전트 |
| 사이트 카탈로그 | `public/llms.txt` | 외부 LLM (ChatGPT/Claude/Gemini 등) |
| 전체 콘텐츠 평탄화 | `public/llms-full.txt` | 일괄 ingest 가 필요한 외부 LLM |

## 지식 위키 분리 — 원본(llm-wiki)과 발행본(content)

이 저장소에는 **두 개의 위키**가 있다. 용어가 비슷하니 구분한다:

| | **발행 위키** (공개) | **원본 위키** (비공개) |
|---|---|---|
| 위치 | `content/` (이 repo) | `./llm-wiki/` — `woowacourse-projects/llm-wiki` 클론 |
| 성격 | 독자용으로 분석·정리한 발행 문서 | 모든 raw 1차자료 + 합성 wiki 노트 (source of truth) |
| 추적 | 이 repo가 커밋 | `/llm-wiki/` 는 **gitignore** — 별도 비공개 repo |
| 커맨드 | `/위키정리`(lint) · `/말투점검`(문체) | `/위키흡수` · `/위키정제` · `/위키점검` · `/위키질의` |

- **부트스트랩**: 원본 위키 작업(`/위키*`) 전, 새 체크아웃에서는 한 번 클론한다 — `git clone https://github.com/woowacourse-projects/llm-wiki.git llm-wiki`.
- **dual-write**: `/로그추가` 는 발행본(`content/`)을 이 repo에, 원본(`raw/`)을 `./llm-wiki`(비공개)에 각각 커밋한다.

## 콘텐츠 추가 시 필수 작업

`content/` 디렉토리에 새 MDX 파일을 추가하거나 기존 문서에 의미 있는 내용을 추가했을 때, 반드시 아래 두 가지를 함께 수행해야 한다:

1. **`_meta.ts` 업데이트** — 해당 디렉토리의 `_meta.ts`에 새 항목 등록
2. **`content/updates.ts` 업데이트** — 배열 맨 위에 새 항목 추가. 랜딩 페이지 "최근 업데이트" 타임라인에 자동 반영됨
3. **실험 로그는 `content/logs.ts`에만 추가** — `content/education/logs/` 하위에 MDX를 추가했을 때, `content/logs.ts` 배열 맨 위에 항목 추가. `index.mdx`는 `<LogList />`가 자동 렌더링하므로 직접 수정 불필요. **팀원은 `/로그추가` 커맨드로 MDX와 `logs.ts`를 한 번에 갱신할 수 있다.**

### updates.ts 항목 형식

```ts
{
  date: '2025년 8기',        // 기수 정보
  title: '문서 제목',         // 타임라인에 표시될 제목
  description: '한 줄 요약.', // 타임라인에 표시될 설명
  href: '/경로/슬러그',       // 문서 링크
  status: 'active',          // active: 최근 추가, completed: 안정화됨, upcoming: 예정
}
```

### logs.ts 항목 형식

```ts
{
  slug: 'my-log',            // MDX 파일명 (확장자 제외)
  title: '실험 제목',
  description: '한 줄 요약.',
  href: '/education/logs/my-log',
  date: '2026-03-17',        // YYYY-MM-DD — 페이지 최초 커밋 날짜 (정렬 기준)
  phases: ['레벨1'],         // LogPhase[] — '온보딩' | '레벨0' ~ '레벨5'
  tracks: ['웹 백엔드'],     // LogTrack[] — '웹 백엔드' | '웹 프론트엔드' | '모바일'
  themes: ['소프트스킬'],    // LogTheme[]? (선택) — '소프트스킬' | '코치훈련'
}
```

> 타입 정의는 `content/logs.ts` 상단을 참고한다. `/로그추가` 커맨드가 이 구조를 자동으로 맞춰주므로 수동 편집은 수정/삭제 시에만 필요하다.

## 프로젝트 구조

```
content/
├── index.mdx                  홈 (RecentUpdates 컴포넌트로 타임라인 자동 렌더링)
├── updates.ts                 최근 업데이트 데이터 (단일 진실 원천)
├── logs.ts                    실험 로그 메타데이터 (LogList 데이터 소스)
└── education/
    ├── philosophy/            교육 철학
    ├── curriculum/            커리큘럼 (레벨별 설계 원칙)
    ├── insights/              검증된 패턴 (실험 로그에서 추출·검증된 해결 패턴)
    ├── tools/                 검증된 도구 (복사해서 바로 쓰는 워크플로우)
    └── logs/                  실험 로그 (매주 쌓이는 원재료)
```

## 임시 작업 디렉터리: `.inbox/`

저장소 루트의 `.inbox/`는 **임시·일회성 작업물** 전용 공간이다. 스크래치 메모, 실험 스크립트, 외부에서 받아 정리 중인 원본 파일, 한 번 쓰고 버릴 산출물 등은 모두 여기에 둔다.

- `.gitignore`에 등록되어 있으므로 커밋되지 않는다. 팀에 공유할 필요가 없는 모든 임시 산출물은 이 디렉터리를 사용한다.
- 정식 콘텐츠(`content/` 하위)나 도구(`.claude/`, `scripts/` 등)로 승격할 가치가 있다고 판단되면, 해당 위치로 옮기고 `.inbox/`에서는 제거한다.
- 디렉터리 자체는 비어 있을 수 있다(git에 추적되지 않음). 사라져도 무방하며, 필요 시 다시 만들면 된다.

## 컴포넌트

MDX에서 사용 가능한 커스텀 컴포넌트: Hero, Card, CardGrid, Timeline, TimelineItem, Toggle, Callout, AssetCard, Placeholder, RecentUpdates, LogList, Mermaid

- **LogList** — 실험 로그 목록을 날짜 최신 순으로 렌더링. 카테고리 필터 탭 포함. `content/logs.ts`를 데이터 소스로 사용.
- **Mermaid** — Mermaid 다이어그램 렌더링. `<Mermaid chart={\`flowchart TD ...\`} />` 형식으로 사용.

## 이미지·캐릭터 리소스

문서에 일러스트가 필요하면 **새로 만들지 말고 공식 캐릭터 행성이를 쓴다.** 18가지 포즈 라인아트 + 주황 대표 1종이 `public/images/characters/`에 있고, 카탈로그는 같은 폴더의 `index.md`다. "추천 사용 맥락" 태그(축하·협업·코딩·과열 등)로 후보를 좁히고 파일명으로 고른다. 본문 참조 경로는 `/images/characters/행성이-걷기.png` 형식.

## hidden 처리

`_meta.ts`에서 `display: 'hidden'`으로 설정된 항목은 사이드바에 표시되지 않지만 폴더는 존재함. 삭제하지 말 것.

## 실험 로그 반복 개선 (autoresearch 패턴)

Karpathy autoresearch 메커니즘을 실험 로그 품질 개선에 적용한 워크플로우.

### 핵심 구조

| autoresearch | 실험 로그 | 파일 |
|---|---|---|
| `prepare.py` (불변 평가 인프라) | 품질 루브릭 (5차원, 25점 만점) | `.claude/log-quality-rubric.md` |
| `prepare.py` (승격 평가 인프라) | 승격 루브릭 (4차원, 20점 만점) | `.claude/promotion-rubric.md` |
| `val_bpb` (메트릭 측정) | `/로그평가` (점수 매기기) | `.claude/commands/로그평가.md` |
| train → measure → commit/reset 루프 | `/로그개선` (한 차원씩 개선) | `.claude/commands/로그개선.md` |
| 전체 파이프라인 (측정·개선·승격·동기화) | `/로그승격` (마스터 루프) | `.claude/commands/로그승격.md` |
| 증분 비대화형 | `/로그승격 자동` | 상동 |
| 교차 패턴 탐지만 | `/로그승격 추출` | 상동 |
| 교육 모델 반영만 | `/로그승격 동기화` | 상동 |
| 신규 로그 작성 | `/로그추가` (MDX 스켈레톤 + logs.ts) | `.claude/commands/로그추가.md` |
| `results.tsv` (실험 기록) | `research-cycle-log.tsv` (사이클 기록) | 루트 디렉터리 |

### 사용법

```bash
# 새 실험 로그 작성 (대화형)
/로그추가

# 특정 로그 평가만 (수정 없음)
/로그평가 expedition

# 전체 로그 일괄 평가
/로그평가

# 특정 로그 반복 개선 (최대 5회, A등급까지)
/로그개선 expedition

# 전체 파이프라인 (측정 → 개선 → 승격 → 동기화 → 기록)
/로그승격

# 평가만, 변경 없음
/로그승격 dry-run

# 교차 패턴 탐지만
/로그승격 추출

# 교육 모델 반영만
/로그승격 동기화

# 증분 비대화형 (신규 로그만)
/로그승격 자동
```

### 자동 동기화 (`/로그승격 자동`)

`/로그승격`이 사람이 의도적으로 돌리는 풀 사이클이라면, `/로그승격 자동`은 신규 로그만 대상으로 증분 처리하는 자동 루프다.

- **트리거:** Stop 훅 (`.claude/hooks/auto-sync-check.sh`)이 매 대화 종료 시 `git diff lastSyncCommit HEAD -- content/education/logs/*.mdx`로 미반영 로그 수를 계산한다. 임계값(기본 3) 이상이면 stderr로 알림(`exit 2`).
- **실행:** 알림을 본 다음 사용자 턴에 Claude가 `/로그승격 자동`을 실행한다. 훅이 직접 파이프라인을 돌리지 않는다.
- **상태:** `.claude/sync-state.json`의 `lastSyncCommit` 한 필드가 진실의 원천. 카운터는 git diff로 매번 실시간 계산.
- **안전장치:** 승격 점수 16점 미만 자동 제외, 한 파일당 자동 마커 섹션 5개 상한, 모든 변경은 단일 커밋(`git revert` 한 번으로 원복), 마커 섹션 밖은 절대 수정 금지.
- **튜닝:** `.claude/sync-state.json`의 `config.threshold`, `config.promotionMinScore`, `config.maxAutoSectionsPerFile`로 사람이 조정.

### 승격 파이프라인

```
실험 로그 → /로그개선 → /로그승격 추출 → /로그승격 동기화
   ↑                                                 |
   └── /로그승격 (6단계 마스터 루프) ────────────────────┘
```

승격 판정 기준 (20점 만점): P1.반복검증 + P2.추출가능성 + P3.교차연결 + P4.실행영향력
- 16~20: 승격 가능 → 도구/인사이트/교육모델에 추가
- 12~15: 조건부 승격 → 보강 후 재평가
- 8~11: 보류 → 추가 반복 실험 후 재평가

### 레포 분석 파이프라인

woowacourse org 197개 공개 저장소 분석에도 동일 autoresearch 구조가 적용됩니다.

| 구성 | 파일 |
|---|---|
| 측정 루브릭 | `.claude/repo-analysis-rubric.md` |
| 상태 TSV | `.research/repo-scores.tsv` |
| 부트스트랩 | `/bootstrap-repos` |
| 단건 측정 | `/scan-repo <repo>` |
| 단건 사이클 | `/analyze-repo <repo>` |
| 배치 순회 | `/analyze-all [N]` |
| 문서 데이터 | `content/repositories.ts` (자동 갱신) |

T2 이상 승급된 레포만 `content/education-experiment/repositories/` 에 노출됩니다.
세션당 티어 1개 원칙을 따릅니다.

### 루브릭 수정 원칙

`.claude/log-quality-rubric.md`와 `.claude/promotion-rubric.md`는 autoresearch의 `prepare.py`처럼 **에이전트가 수정하지 않는다**. 평가 기준 변경은 사람이 직접 한다. 기준이 바뀌면 모든 이전 점수와 비교 불가능해지므로.

---

## 하네스: 연구 사이클

**목표:** 실험 로그에서 인사이트·도구·교육 모델로의 승격 파이프라인을 팀 전체가 동일하게 실행한다.

**트리거:** `/로그승격`, 로그 승격, 전체 로그 처리, 인사이트 추출, 교육 모델 동기화 관련 요청 시 `research-cycle` 스킬을 사용하라.

```
실험 로그
    ↓ log-quality-agent (품질 평가 + 개선)
    ↓ insight-agent (교차 패턴 탐지)
    ├→ tools/          (검증된 도구, P2 ≥ 4)
    ├→ insights/       (검증된 패턴, P3 ≥ 4 또는 P4 ≥ 4 + P1 ≥ 3)
    ├→ curriculum/     (커리큘럼 원칙, P4 ≥ 4 + P1 ≥ 3)
    └→ philosophy/     (교육 철학, P4 ≥ 4 + P1 ≥ 4, 엄격)
```

**에이전트:** `.claude/agents/` — log-quality-agent, insight-agent, promotion-agent, research-cycle-orchestrator

**스킬:** `.claude/skills/` — research-cycle (오케스트레이터), log-quality, insight-extraction, promotion

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-04-14 | 초기 구성 | 전체 | 팀 워크플로우 통일을 위한 하네스 구축 |
