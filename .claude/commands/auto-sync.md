# /auto-sync — 실험 로그 → 교육 모델 증분 동기화 (비대화형)

> autoresearch의 incremental eval에 해당. 신규 로그만 대상으로 승격 평가 → 인사이트 추출 → 교육 모델 동기화 → 단일 커밋을 수행한다.
> **사람에게 어떤 확인도 묻지 않는다.** 각 Phase 결과는 stdout으로만 보고한다.

## 절대 규칙

- `.claude/promotion-rubric.md`, `.claude/log-quality-rubric.md`는 **읽기만** 한다. 절대 수정하지 않는다.
- 교육 모델 MDX를 수정할 때는 반드시 마커 섹션 안에서만 수정한다:

  ```
  {/* <auto-sync slug="..." date="YYYY-MM-DD" logs={["a","b"]}> */}
  ...자동 생성 콘텐츠...
  {/* </auto-sync> */}
  ```

- 마커 밖 영역은 절대 수정하지 않는다.
- 한 파일에 자동 마커 섹션이 5개 이상이면 그 파일은 더 이상 수정하지 않고 `needsHumanReview`에 추가한다.
- 모든 파일 변경은 단일 커밋으로 묶는다. 중간에 커밋하지 않는다.

## Phase A — 범위 확정

1. `.claude/sync-state.json`을 읽어 `lastSyncCommit`을 가져온다.
2. `lastSyncCommit`이 null이면 cold start: 아무 변경 없이 현재 HEAD를 `lastSyncCommit`에 기록하고 종료한다 (커밋 1개: "auto-sync: cold start baseline").
3. `git diff --name-only <lastSyncCommit> HEAD -- content/education-experiment/logs/*.mdx`로 신규/수정된 로그 파일 목록을 추출한다.
4. 비어 있으면 즉시 종료 (no-op).
5. 파일명에서 슬러그를 뽑고, `content/logs.ts`에서 메타데이터를 결합한다.

## Phase B — 승격 평가

1. `.claude/promotion-rubric.md`를 로드한다.
2. 각 대상 로그를 읽고 P1~P4 점수(20점 만점)를 매긴다.
3. `config.promotionMinScore` (기본 16) 이상만 통과. 미달 로그는 `lastBatch.skipped`에 `{slug, score}`로 기록.
4. 통과한 로그가 0개면 Phase E로 건너뛴다 (skipped만 기록하고 종료).

## Phase C — 인사이트 추출 (증분)

1. 통과한 로그들을 함께 읽어 교차 패턴을 탐지한다 (`.claude/commands/extract-insights.md`의 로직을 참조).
2. 각 신규 인사이트 후보에 대해:
   - `content/education-experiment/insights/` 전체를 grep해 유사 인사이트(제목/핵심 키워드)가 있는지 검사.
   - **있으면:** 신규 MDX를 만들지 않고, 기존 MDX에 "근거 로그" 섹션을 마커 안에서 추가/갱신.
   - **없으면:** `content/education-experiment/insights/<slug>.mdx`를 새로 생성하고, `_meta.ts`와 `content/updates.ts`에 항목을 추가.
3. 결과 인사이트 슬러그 목록을 `lastBatch.insights`에 기록.

## Phase D — 모델 동기화

1. 각 인사이트를 다음 매핑으로 분류:
   - 구체적 워크플로우/커리큘럼 함의 → `content/education-model/curriculum/`
   - 반복 패턴/설계 원칙 → `content/education-model/design-patterns/`
   - 가치/관점 변화 → `content/education-model/philosophy/`
2. 대상 디렉토리에서 가장 관련 깊은 기존 MDX를 고르거나, 적합한 것이 없으면 신규 MDX 생성.
3. **마커 섹션 카운트:** 대상 파일에서 `<auto-sync` 마커 개수를 센다. `config.maxAutoSectionsPerFile` (기본 5) 이상이면 그 파일은 건너뛰고 경로를 `needsHumanReview`에 추가.
4. 그렇지 않으면 마커 섹션을 새로 추가하고 인사이트 내용을 데이터 기반으로 작성. 본문에는 반드시 근거 로그 슬러그를 명시한다.
5. 신규 MDX 생성 시 `_meta.ts`와 `content/updates.ts`도 함께 갱신 (CLAUDE.md 필수 작업).
6. 변경된 모델 파일 경로 목록을 `lastBatch.modelFilesChanged`에 기록.

## Phase E — 기록 + 단일 커밋

1. `.claude/sync-state.json`을 갱신:
   - `lastSyncDate` = 오늘 날짜
   - `lastBatch` = { logs, promoted, skipped, insights, modelFilesChanged }
   - `needsHumanReview`에 신규 항목 append (중복 제거)
2. `research-cycle-log.tsv`에 한 줄 append:

   ```
   <YYYY-MM-DD>\tauto\t<logs_count>\t<insights_count>\t<model_files_changed>
   ```

   파일이 없으면 헤더와 함께 생성.
3. `git add`로 변경된 모든 파일을 스테이지.
4. 첫 커밋:

   ```
   git commit -m "auto-sync: <N> logs → <M> insights → <K> files"
   ```

   (Co-Authored-By 포함)
5. 새 HEAD를 `lastSyncCommit`에 반영하고 같은 커밋에 amend:

   ```bash
   jq --arg c "$(git rev-parse HEAD)" '.lastSyncCommit=$c' .claude/sync-state.json > /tmp/s && mv /tmp/s .claude/sync-state.json
   git add .claude/sync-state.json
   git commit --amend --no-edit
   ```

6. stdout에 요약 출력:

   ```
   auto-sync 완료
   - 대상 로그: N개
   - 승격 통과: P개 (skipped: S개)
   - 신규/갱신 인사이트: M개
   - 모델 파일 변경: K개
   - needs human review: <목록>
   ```

## 실패 처리

- 어느 Phase라도 실패하면 `git restore .` 등으로 working tree만 되돌리고 종료한다. `sync-state.json`은 갱신하지 않으므로 다음 실행에서 재시도된다.
- Phase A에서 대상이 0개면 아무것도 하지 않는다.
