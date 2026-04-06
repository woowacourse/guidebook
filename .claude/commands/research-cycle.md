# 연구 사이클 (Research Cycle) — autoresearch 마스터 루프

> Karpathy autoresearch의 외부 루프를 확장한 것.
> 개별 로그 개선(`/improve-log`)을 넘어, 로그 → 도구/인사이트 → 교육 모델로의
> **승격 파이프라인**을 포함한 전체 연구 사이클을 실행한다.

## 인자

$ARGUMENTS — 선택. `dry-run`이면 평가만 하고 변경하지 않음. 비어 있으면 전체 사이클 실행.

## 전체 사이클 구조

```
Phase 1: 측정 (Measure)
    ↓
Phase 2: 개선 (Improve)
    ↓
Phase 3: 승격 평가 (Evaluate Promotion)
    ↓
Phase 4: 승격 실행 (Promote)
    ↓
Phase 5: 교육 모델 동기화 (Sync Model)
    ↓
Phase 6: 사이클 기록 (Record)
```

## Phase 1: 전체 측정

1. `content/logs.ts`에서 전체 로그 목록을 로드한다.
2. `.claude/log-quality-rubric.md`와 `.claude/promotion-rubric.md`를 로드한다.
3. 각 로그를 순회하며 **두 가지** 평가를 동시에 수행한다:
   - **품질 점수** (D1~D5, 25점 만점) — 로그 자체의 서술 품질
   - **승격 점수** (P1~P4, 20점 만점) — 상위 레이어로의 승격 적격성
4. 결과를 `research-cycle-log.tsv`에 기록한다:
   ```
   date	slug	D1	D2	D3	D4	D5	quality_total	grade	P1	P2	P3	P4	promo_total	promo_verdict	action
   ```

### 측정 요약 테이블 출력

```
## Phase 1 완료: 전체 측정 결과

| 로그 | 카테고리 | 품질 | 등급 | 승격 | 판정 |
|------|----------|------|------|------|------|
| {slug} | {cat} | {N}/25 | {grade} | {M}/20 | {verdict} |

### 통계
- 평균 품질: {N}/25
- 승격 가능: {N}개 | 조건부: {N}개 | 보류: {N}개
```

## Phase 2: 품질 개선

1. 품질 B등급(16점) 미만인 로그를 점수 오름차순으로 정렬한다.
2. 각 로그에 대해 `/improve-log {slug}` 루프를 실행한다.
3. **조기 종료 조건**: 모든 로그가 B등급 이상이거나, 10개 로그를 처리했을 때.
4. 개선된 로그는 Phase 3에서 재평가한다.

> Phase 2는 기존 autoresearch 루프와 동일. 생략하려면 `skip-improve`를 인자에 포함.

## Phase 3: 승격 평가

1. 승격 점수가 12점 이상인 로그를 후보로 선별한다.
2. **교차 패턴 탐지**를 수행한다:
   - 같은 카테고리 내 로그들의 공통 패턴 식별
   - 카테고리를 넘는 범용 패턴 식별 (예: "점진적 스캐폴딩"은 레벨1, 소프트스킬 모두에서 등장)
   - `.claude/promotion-rubric.md`의 교차 패턴 출력 형식 사용
3. 각 후보 로그와 교차 패턴에 대해 승격 대상을 분류한다:
   - P2 ≥ 4 → **도구** 후보
   - P3 ≥ 4 → **인사이트** 후보
   - P4 ≥ 4 + P1 ≥ 3 → **교육 모델** 후보

### 승격 후보 목록 출력

```
## Phase 3 완료: 승격 후보

### 도구 후보
| 로그 | 추출할 도구 | P2 점수 |
|------|-------------|---------|

### 인사이트 후보 (교차 패턴)
| 패턴명 | 관련 로그 수 | P3 평균 |
|--------|-------------|---------|

### 교육 모델 후보
| 로그/패턴 | 반영할 섹션 | P4 + P1 |
|-----------|-------------|---------|
```

## Phase 4: 승격 실행

승격 가능(16점 이상) 판정을 받은 항목에 대해:

### 4-1. 도구 승격

1. 로그에서 워크플로우/프롬프트/템플릿을 추출한다.
2. `content/education-experiment/tools/{도구명}.mdx`로 작성한다.
3. `content/education-experiment/tools/_meta.ts`에 등록한다.
4. `content/education-experiment/tools/index.mdx`에 링크를 추가한다.
5. 원본 로그에 `> 이 실험에서 검증된 도구: [도구명](/education-experiment/tools/{도구명})` 링크를 추가한다.

### 4-2. 인사이트 승격

1. 교차 패턴 분석 결과를 `content/education-experiment/insights/{인사이트명}.mdx`로 작성한다.
2. `content/education-experiment/insights/_meta.ts`에 등록한다 (hidden 해제 또는 신규 추가).
3. 인사이트 구조:
   - 패턴 요약 (2~3문장)
   - 근거 로그 목록 (로그별 기여 요소)
   - 핵심 원칙 (3~5개 bullet)
   - 적용 가이드 (언제, 어떻게 사용하는가)
4. `content/education-experiment/insights/index.mdx`의 Placeholder를 실제 콘텐츠로 교체한다.

### 4-3. 교육 모델 반영

1. 반영 대상 섹션을 식별한다:
   - `design-patterns/catalog.mdx` — 새 디자인 패턴 추가
   - `curriculum/` — 커리큘럼 원칙 업데이트
   - `philosophy/` — 교육 철학 보강
2. 기존 내용을 **수정하지 않고** 새 사례/패턴을 **추가**한다.
3. 추가 시 근거 로그 링크를 반드시 포함한다.

### 각 승격 후 커밋

```
promote "{로그/패턴 제목}" → {대상} ({점수 정보})
```

## Phase 5: 교육 모델 동기화

1. Phase 4에서 교육 모델에 반영한 내용을 검증한다.
2. `content/updates.ts`에 새 항목을 추가한다 (승격된 콘텐츠).
3. 필요시 `_meta.ts`에서 hidden 항목을 활성화한다.

## Phase 6: 사이클 기록

1. `research-cycle-log.tsv`에 이번 사이클 결과를 기록한다.
2. 사이클 요약을 출력한다:

```
## 사이클 완료 요약

| 항목 | 수치 |
|------|------|
| 측정한 로그 | {N}개 |
| 품질 개선한 로그 | {N}개 |
| 승격 후보 | {N}개 |
| 도구로 승격 | {N}개 |
| 인사이트로 승격 | {N}개 |
| 교육 모델 반영 | {N}개 |
| 평균 품질 변화 | {before} → {after} |

### 다음 사이클 제안
- {다음에 집중할 영역}
- {보강이 필요한 로그}
- {추가 반복 실험이 필요한 패턴}
```

## 제약

- 승격 루브릭(`.claude/promotion-rubric.md`)은 수정하지 않는다.
- 로그 품질 루브릭(`.claude/log-quality-rubric.md`)도 수정하지 않는다.
- 확인 불가능한 수치나 인용을 지어내지 않는다.
- 기존 교육 모델 콘텐츠를 삭제하거나 대폭 변경하지 않는다. 추가만 한다.
- 한 사이클에서 교육 모델에 반영하는 항목은 최대 3개로 제한한다 (과적합 방지).
- `dry-run` 모드에서는 Phase 1, 3만 실행하고 Phase 2, 4, 5는 건너뛴다.
