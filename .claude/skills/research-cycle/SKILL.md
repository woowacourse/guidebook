---
name: research-cycle
description: "실험 로그 → 인사이트 → 도구/교육 모델 전체 승격 파이프라인 실행. /research-cycle, /extract-insights, /sync-model, 연구 사이클, 로그 승격, 전체 로그 처리, 인사이트 추출 후 교육 모델 반영, 로그 전체 평가 및 승격, 매주 실험 로그 처리, 연구 사이클 실행, 승격 파이프라인 요청 시 반드시 이 스킬을 사용할 것. dry-run 인자로 평가만 실행 가능."
---

# 연구 사이클 오케스트레이터

실험 로그에서 교육 모델로의 전체 승격 파이프라인을 실행한다.

## 팀 구성

`research-cycle-orchestrator` 에이전트를 메인으로 하여, 다음 팀을 구성한다:
- `log-quality-agent` — 로그 품질 평가 및 개선
- `insight-agent` — 교차 패턴 탐지 및 인사이트 문서 작성
- `promotion-agent` — 교육 모델 승격 실행

## 인자 처리

| 인자 | 동작 |
|------|------|
| (없음) | 전체 사이클 실행 |
| `dry-run` | Phase 1, 3만 실행 (측정 + 후보 식별, 변경 없음) |
| `skip-improve` | Phase 2(품질 개선) 건너뜀 |
| `{slug}` | 특정 로그만 대상으로 전체 사이클 |

## Phase 0: 컨텍스트 확인

1. `_workspace/` 존재 여부 확인
   - 없음 → 초기 실행
   - 있음 + 부분 수정 요청 → 부분 재실행 (해당 Phase만)
   - 있음 + 새 로그 → 증분 실행 (새 로그만 대상)
2. `research-cycle-log.tsv` 읽기 (이전 사이클 결과 파악)

## Phase 1: 전체 측정

**실행 모드: 병렬 서브 에이전트**

1. `content/logs.ts` 전체 로그 목록 로드
2. `log-quality-agent` + `.claude/log-quality-rubric.md`로 각 로그 평가
3. `research-cycle-log.tsv`에 결과 기록:
   ```
   date	slug	D1	D2	D3	D4	D5	quality_total	grade	P1	P2	P3	P4	promo_total	promo_verdict	action
   ```

## Phase 2: 품질 개선

B등급(16점) 미만 로그를 `log-quality-agent`로 순차 개선.
조기 종료: 모든 로그 B등급+ 또는 10개 처리 완료.

## Phase 3: 승격 평가

`.claude/promotion-rubric.md`로 승격 후보 선별 + `insight-agent`로 교차 패턴 탐지.

```
승격 가능 (16~20점) → Phase 4로
조건부 승격 (12~15점) → 사용자 확인 후 Phase 4
보류 (8~11점) → 다음 사이클
```

## Phase 4-5: 승격 실행 + 모델 동기화

`promotion-agent`가 도구/인사이트/교육 모델에 반영.
한 사이클 교육 모델 반영 최대 3건.

## Phase 6: 사이클 기록

`research-cycle-log.tsv` 업데이트 + 완료 요약 출력.

## 안전 장치

- 루브릭 파일(`.claude/log-quality-rubric.md`, `.claude/promotion-rubric.md`) 수정 금지
- 교육 모델 기존 내용 삭제/재작성 금지 (추가만)
- `dry-run`에서는 Phase 1, 3만 실행
- 모든 변경은 개별 커밋 (단일 `git revert`로 원복 가능)

## 참조

- 품질 루브릭: `.claude/log-quality-rubric.md`
- 승격 루브릭: `.claude/promotion-rubric.md`
- 상세 커맨드: `.claude/commands/로그승격.md` (기존 `research-cycle.md`는 한국어 커맨드로 리디렉션하는 shim)
- 에이전트 정의: `.claude/agents/research-cycle-orchestrator.md`
