# 레포 배치 순회 분석

> autoresearch의 밤새 실험 순회에 해당. `.research/repo-scores.tsv`에서
> 가장 낮은 티어의 가장 오래된 레포부터 배치 크기 N개를 골라 `/analyze-repo`를
> 반복 실행한다. 컨텍스트 한계 도달 시 안전 종료하고 다음 세션에서 재개.

## 인자

$ARGUMENTS — 선택적 배치 크기 (기본 5, 예: `10`).

## 절차

### Step 1: 선택 대상 결정

`.research/repo-scores.tsv` 를 읽어 다음 조건으로 정렬:

1. 아카이브/삭제 마킹은 제외.
2. 정렬 키: (현재 티어 오름차순, `last_scanned` 오름차순 — 비어있으면 가장 먼저).
3. `T3` 이상은 제외 (T3→T4는 `/extract-insights` 영역).

상위 N개(기본 5)를 선택.

### Step 2: 배치 로그 시작

`.research/batches/{YYYY-MM-DD-batch-NN}.md` 생성하고 헤더 기록:

```markdown
# Batch {YYYY-MM-DD}-{NN}

Started: {ISO timestamp}
Batch size: {N}
Selected repos: [{repo1}, {repo2}, ...]

## Results

```

### Step 3: 반복 실행

각 레포에 대해 `/analyze-repo {repo}` 를 순차 실행한다.
(이 커맨드는 같은 세션 안에서 `.claude/commands/analyze-repo.md` 절차를 그대로 인라인 수행하는 것으로 해석한다. 슬래시 커맨드 내부에서 다른 슬래시 커맨드를 호출하는 메커니즘이 없으므로 프롬프트에 "Step 1~6을 수행" 명시.)

각 레포 처리 후 배치 로그에 한 줄 추가:

```
- {repo}: T{before}→T{after}, score {N}/25, {commit-sha}
```

### Step 4: 컨텍스트 가드

다음 레포로 넘어가기 전, 남은 컨텍스트가 충분한지 대략 판단한다:

- 아직 처리한 레포가 0개면 무조건 최소 1개는 끝까지.
- 처리 후 30% 미만의 여유가 예상되면 안전 종료. 배치 로그에 "truncated at {K}/{N}" 기록.
- 넉넉하면 다음 레포 진행.

(이는 휴리스틱이다. 주어진 세션의 실제 사용량에 따라 판단한다.)

### Step 5: 배치 종료 처리

배치 로그 마지막에:

```
Ended: {ISO timestamp}
Completed: {K}/{N}
```

### Step 6: 결과 보고

```
## 배치 결과

| 레포 | before | after | 점수 | 승급 |
|------|--------|-------|------|------|
| ... | T1 | T2 | 20/25 | ✅ |

Completed: K/N
Next session will resume from: {다음 순위 레포}
```

### Step 7: TSV 재커밋 (개별 /analyze-repo 커밋들과 별도로 필요한 경우 스킵)

각 `/analyze-repo` 호출이 자체 커밋을 수행하므로 별도 커밋은 불필요.
다만 `batches/` 는 gitignore이므로 배치 로그는 커밋되지 않는다.

## 제약

- 세션당 티어 1개 원칙: 한 레포가 한 배치 안에서 T1→T2→T3으로 연달아 승급하지 않는다 (각 레포는 한 티어만 상승).
- 배치 중단 시 TSV는 마지막 완료 레포 시점까지는 일관된 상태여야 한다 (각 `/analyze-repo`가 원자 커밋).
- 아카이브/삭제 마킹은 자동 스킵.
- 재실행 안전: 동일 명령을 다시 돌리면 멈춘 지점부터 자연스럽게 이어진다.
