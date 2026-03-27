# 전체 실험 로그 순회 개선 (autoresearch 외부 루프)

> autoresearch가 밤새 실험을 돌리듯, 모든 로그를 순회하며 개선한다.
> 가장 약한 로그부터 시작하여 전체 평균을 끌어올린다.

## 절차

### Phase 1: 전체 베이스라인 측정

1. `content/education-experiment/logs/*.mdx`에서 모든 로그 파일을 나열한다 (index.mdx, summary.mdx 제외).
2. `.claude/log-quality-rubric.md`를 로드한다.
3. 각 로그를 5개 차원으로 빠르게 평가한다.
4. 결과를 `improvement-log.tsv`에 기록한다 (없으면 생성):

```
date	slug	d1	d2	d3	d4	d5	total	grade	action
2026-03-27	expedition	4	3	5	4	3	19	B	baseline
```

5. 총점 오름차순으로 정렬하여 개선 우선순위를 결정한다.

### Phase 2: 순회 개선

총점이 가장 낮은 로그부터 시작하여, `/improve-log {slug}` 루프를 실행한다.

- 한 로그의 개선이 끝나면 `improvement-log.tsv`에 최종 점수를 기록한다.
- 다음으로 점수가 낮은 로그로 이동한다.
- **정지 조건**: 아래 중 하나를 만족하면 정지한다.
  - 모든 로그가 B등급(16점) 이상
  - 10개 로그를 처리함
  - 사용자가 중단 요청

### Phase 3: 결과 보고

```
## 순회 개선 결과

| 순서 | 로그 | 전 | 후 | 변화 |
|------|------|----|----|------|
| 1 | {slug} | 12/25 (C) | 18/25 (B) | +6 |
| ... | | | | |

전체 평균: {before} → {after} (+{delta})
다음 순회에서 우선 개선 대상: {가장 낮은 3개}
```

마지막에 `improvement-log.tsv`를 커밋하고 `git push`한다.

## 제약

- `/improve-log`의 모든 제약을 그대로 따른다.
- `improvement-log.tsv`는 git에 커밋한다 (autoresearch의 results.tsv와 동일한 역할).
- 이미 A등급인 로그는 건너뛴다.
