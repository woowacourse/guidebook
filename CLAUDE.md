# 우아한테크코스 공식문서

Nextra 4 + Next.js App Router 기반 교육 가이드북.

## 콘텐츠 추가 시 필수 작업

`content/` 디렉토리에 새 MDX 파일을 추가하거나 기존 문서에 의미 있는 내용을 추가했을 때, 반드시 아래 두 가지를 함께 수행해야 한다:

1. **`_meta.ts` 업데이트** — 해당 디렉토리의 `_meta.ts`에 새 항목 등록
2. **`content/updates.ts` 업데이트** — 배열 맨 위에 새 항목 추가. 랜딩 페이지 "최근 업데이트" 타임라인에 자동 반영됨
3. **실험 로그는 `content/logs.ts`에만 추가** — `content/education-experiment/logs/` 하위에 MDX를 추가했을 때, `content/logs.ts` 배열 맨 위에 항목 추가. `index.mdx`는 `<LogList />`가 자동 렌더링하므로 직접 수정 불필요

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
  href: '/education-experiment/logs/my-log',
  date: '2026-03-17',        // YYYY-MM-DD — 페이지 최초 커밋 날짜 (정렬 기준)
  category: '레벨1',         // '온보딩' | '레벨0' | '레벨1' | '레벨3' | '소프트스킬' | '코치훈련'
}
```

## 프로젝트 구조

```
content/
├── index.mdx                  홈 (RecentUpdates 컴포넌트로 타임라인 자동 렌더링)
├── updates.ts                 최근 업데이트 데이터 (단일 진실 원천)
├── education-model/           교육 원칙
└── education-experiment/      교육 실험
    ├── logs/                  실험 로그
    ├── insights/              인사이트
    └── tools/                 실험 도구
```

## 컴포넌트

MDX에서 사용 가능한 커스텀 컴포넌트: Hero, Card, CardGrid, Timeline, TimelineItem, Toggle, Callout, AssetCard, Placeholder, RecentUpdates, LogList

- **LogList** — 실험 로그 목록을 날짜 최신 순으로 렌더링. 카테고리 필터 탭 포함. `content/logs.ts`를 데이터 소스로 사용.

## hidden 처리

`_meta.ts`에서 `display: 'hidden'`으로 설정된 항목은 사이드바에 표시되지 않지만 폴더는 존재함. 삭제하지 말 것.

## 실험 로그 반복 개선 (autoresearch 패턴)

Karpathy autoresearch 메커니즘을 실험 로그 품질 개선에 적용한 워크플로우.

### 핵심 구조

| autoresearch | 실험 로그 | 파일 |
|---|---|---|
| `prepare.py` (불변 평가 인프라) | 품질 루브릭 (5차원, 25점 만점) | `.claude/log-quality-rubric.md` |
| `val_bpb` (메트릭 측정) | `/review-log` (점수 매기기) | `.claude/commands/review-log.md` |
| train → measure → commit/reset 루프 | `/improve-log` (한 차원씩 개선) | `.claude/commands/improve-log.md` |
| 밤새 실험 순회 | `/improve-all` (전체 로그 순회) | `.claude/commands/improve-all.md` |
| `results.tsv` (실험 기록) | `improvement-log.tsv` (개선 기록) | 루트 디렉터리 |

### 사용법

```bash
# 1. 특정 로그 평가만 (수정 없음)
/review-log expedition

# 2. 전체 로그 일괄 평가
/review-log

# 3. 특정 로그 반복 개선 (최대 5회, A등급까지)
/improve-log expedition

# 4. 전체 로그 순회 개선 (가장 약한 것부터)
/improve-all
```

### 루브릭 수정 원칙

`.claude/log-quality-rubric.md`는 autoresearch의 `prepare.py`처럼 **에이전트가 수정하지 않는다**. 평가 기준 변경은 사람이 직접 한다. 기준이 바뀌면 모든 이전 점수와 비교 불가능해지므로.
