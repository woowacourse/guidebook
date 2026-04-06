# 실험 로그 → 교육 모델 자동 동기화 설계

> 작성일: 2026-04-07
> 컨텍스트: Karpathy autoresearch 메커니즘을 교육 콘텐츠 파이프라인에 적용. 실험 로그가 일정 수 이상 쌓일 때마다 교육 모델(철학/디자인 패턴/커리큘럼)이 데이터 기반으로 자동 업데이트되는 증분 루프 구축.

## 목표

- 로그가 쌓일 때마다 사람이 일일이 `/research-cycle`을 돌리지 않아도, 일정 임계점에서 자동으로 교육 모델이 갱신된다.
- 단일 로그(noise)로는 모델을 흔들지 않는다 — 시그널이 누적되어야 반영된다.
- 자동 변경은 항상 git 커밋 단위로 격리되어 언제든 revert 가능하다.
- 풀 사이클(`/research-cycle`)은 사람이 의도적으로 돌릴 때만 작동하고, 자동 루프는 **증분만** 처리한다.

## 비목표

- 로그 작성 자체의 자동화는 다루지 않는다 (사람이 작성).
- 평가 루브릭의 자동 수정은 하지 않는다 (CLAUDE.md 원칙).
- 풀 사이클 재구현은 하지 않는다 (`/research-cycle`은 그대로 유지).

## autoresearch 매핑

| autoresearch 개념 | 본 설계의 대응 |
|---|---|
| `prepare.py` (불변 평가 인프라) | `.claude/promotion-rubric.md`, `log-quality-rubric.md` (불변) |
| 매 N step마다 eval | Stop 훅 + git diff 카운터 (N=3) |
| incremental eval (체크포인트 검증) | `/auto-sync` (신규 로그만) |
| full eval (전체 재평가) | `/research-cycle` (수동) |
| `results.tsv` | `research-cycle-log.tsv` (mode=auto/manual 컬럼 추가) |
| 모델 weight 업데이트 | 교육 모델 MDX 자동 수정 (마커 섹션 안에서만) |
| revert / checkpoint rollback | `git revert <auto-sync commit>` |

## 아키텍처

```
[Layer 0: 트리거]
  Stop 훅 (.claude/hooks/auto-sync-check.sh)
    │ git diff lastSyncCommit HEAD -- content/education-experiment/logs/*.mdx
    │ 신규/수정 로그 ≥ THRESHOLD(=3) 이면 stderr 알림
    ▼
[Layer 1: 다음 사용자 턴]
  Claude가 알림을 보고 /auto-sync 실행
    │
    ├─ Phase A: 승격 평가 (신규 로그만)
    │     promotion-rubric 적용, 16점↑만 통과
    │
    ├─ Phase B: 인사이트 추출 (증분)
    │     기존 insights/ 중복 검사 후 신규/병합
    │
    └─ Phase C: 모델 동기화
          philosophy / design-patterns / curriculum 자동 수정
          마커 섹션(<!-- auto-sync ... -->) 안에서만
    ▼
[Layer 2: 기록 + 커밋]
  .claude/sync-state.json 갱신
  research-cycle-log.tsv 한 줄 append
  단일 커밋: "auto-sync: N logs → M insights → K files"

[Layer 3: 수동 — 변경 없음]
  /research-cycle, /improve-log, /improve-all 등 기존 커맨드 유지
```

### 설계 원칙

1. **풀 사이클 vs 증분 사이클 분리.** `/research-cycle`은 비싸고 의도적이고, `/auto-sync`는 싸고 자동.
2. **상태는 git이 진실.** 카운터 파일을 쓰지 않는다. `.claude/sync-state.json`의 `lastSyncCommit` 하나만 신뢰한다. 미반영 로그 수는 항상 `git diff`로 실시간 계산.
3. **훅은 판단만, 실행은 다음 턴.** 훅에서 직접 긴 파이프라인을 돌리지 않는다. 알림만 띄우고, 다음 사용자 턴에 Claude가 `/auto-sync`를 실행한다. 디버깅·중단·UX 모두 유리.
4. **모든 자동 변경은 단일 커밋.** 부분 실패 시 working tree만 더러워지고 state는 갱신되지 않으므로 다음 턴에서 재시도된다.
5. **자동 섹션은 마커로 격리.** 사람이 손댄 영역과 절대 섞이지 않는다.

## 컴포넌트 명세

### C1. `.claude/hooks/auto-sync-check.sh`

Stop 훅. 매 대화 종료 시 호출.

```bash
#!/bin/bash
set -e
STATE="$CLAUDE_PROJECT_DIR/.claude/sync-state.json"
THRESHOLD=$(jq -r '.config.threshold // 3' "$STATE" 2>/dev/null || echo 3)
LAST_SYNC=$(jq -r '.lastSyncCommit // empty' "$STATE" 2>/dev/null)

if [ -z "$LAST_SYNC" ]; then
  RANGE="HEAD"
  PENDING=$(git -C "$CLAUDE_PROJECT_DIR" ls-files 'content/education-experiment/logs/*.mdx' | wc -l | tr -d ' ')
else
  PENDING=$(git -C "$CLAUDE_PROJECT_DIR" diff --name-only "$LAST_SYNC" HEAD -- 'content/education-experiment/logs/*.mdx' 2>/dev/null | wc -l | tr -d ' ')
fi

if [ "$PENDING" -ge "$THRESHOLD" ]; then
  echo "[auto-sync] 미반영 실험 로그 ${PENDING}개 누적 (임계값 ${THRESHOLD}). 다음 턴에 /auto-sync 실행을 권장합니다." >&2
  exit 2
fi
exit 0
```

`.claude/settings.json`에 등록:
```json
{
  "hooks": {
    "Stop": [
      { "matcher": "", "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/auto-sync-check.sh" }] }
    ]
  }
}
```

### C2. `.claude/commands/auto-sync.md`

비대화형 증분 커맨드. 어떤 확인 프롬프트도 띄우지 않는다.

**입력:** 없음 (자동으로 sync-state에서 lastSyncCommit 읽음)

**단계:**

1. **범위 확정**
   - `.claude/sync-state.json`에서 `lastSyncCommit` 로드.
   - `git diff --name-only $LAST_SYNC HEAD -- content/education-experiment/logs/*.mdx`로 대상 로그 슬러그 목록 추출.
   - 비어있으면 즉시 종료(no-op).

2. **Phase A — 승격 평가**
   - 각 대상 로그에 `.claude/promotion-rubric.md` 적용 (P1~P4, 20점 만점).
   - 16점 이상만 다음 단계로. 미달 로그는 sync-state의 `skipped`에 기록.

3. **Phase B — 인사이트 추출 (증분)**
   - 통과한 로그들에서 교차 패턴 탐지 (`/extract-insights` 로직 재사용).
   - **중복 검사:** 신규 인사이트 후보마다 `content/education-experiment/insights/` 전체 grep. 유사 인사이트(제목/키워드 매칭) 존재 시:
     - 신규 MDX 생성 대신 기존 문서의 "근거 로그" 섹션에 슬러그만 추가.
   - 신규 인사이트는 `content/education-experiment/insights/<slug>.mdx`로 생성.
   - `content/education-experiment/insights/_meta.ts` 업데이트.

4. **Phase C — 모델 동기화**
   - 각 인사이트를 다음 매핑으로 반영:
     - **구체적 워크플로우/커리큘럼 함의** → `content/education-model/curriculum/*.mdx`
     - **반복 패턴/설계 원칙** → `content/education-model/design-patterns/*.mdx`
     - **가치/관점 변화** → `content/education-model/philosophy/*.mdx`
   - 기존 문서에 섹션 추가하거나 신규 MDX 생성.
   - 모든 자동 수정은 다음 마커 사이에서만:
     ```mdx
     {/* <auto-sync slug="..." date="2026-04-07" logs={["a","b"]}> */}
     ...자동 생성 콘텐츠...
     {/* </auto-sync> */}
     ```
   - 신규 MDX인 경우 해당 디렉토리의 `_meta.ts`와 `content/updates.ts`도 같이 갱신 (CLAUDE.md 필수 작업).
   - **사람 리뷰 플래그:** 한 파일에 자동 섹션이 5개 이상 누적되면 그 파일은 더 이상 수정하지 않고 sync-state의 `needsHumanReview`에 추가.

5. **Phase D — 기록**
   - `.claude/sync-state.json` 갱신:
     ```json
     {
       "lastSyncCommit": "<커밋 직후 HEAD>",
       "lastSyncDate": "YYYY-MM-DD",
       "config": { "threshold": 3, "promotionMinScore": 16, "maxAutoSectionsPerFile": 5 },
       "lastBatch": {
         "logs": ["..."],
         "promoted": ["..."],
         "skipped": [{ "slug": "...", "score": 14 }],
         "insights": ["..."],
         "modelFilesChanged": ["..."]
       },
       "needsHumanReview": ["content/education-model/design-patterns/feedback-loops.mdx"]
     }
     ```
   - `research-cycle-log.tsv`에 한 줄 append:
     ```
     2026-04-07\tauto\t3\t1\t2
     ```
     (date, mode, logs_count, insights_count, model_files_changed)

6. **Phase E — 단일 커밋**
   - `git add` 한 뒤 `git commit -m "auto-sync: 3 logs → 1 insight → 2 files"` (Co-Authored-By 포함).
   - sync-state.json은 같은 커밋에 포함시켜야 카운터와 git history가 어긋나지 않음 → **순서:** 모든 변경 → state.json의 lastSyncCommit을 placeholder로 두고 add → commit → 새 HEAD를 state에 기록 → state만 amend (단일 커밋 유지). 또는 더 단순하게: state.json에서 lastSyncCommit 필드만 commit 직후 별도 갱신 + 같은 커밋에 amend. **결정: amend 사용**, --no-verify는 사용하지 않음.

### C3. `.claude/sync-state.json` 초기값

```json
{
  "lastSyncCommit": null,
  "lastSyncDate": null,
  "config": {
    "threshold": 3,
    "promotionMinScore": 16,
    "maxAutoSectionsPerFile": 5
  },
  "lastBatch": null,
  "needsHumanReview": []
}
```

처음 실행될 때는 `lastSyncCommit`이 null이므로 모든 기존 로그를 대상으로 삼지 않고, **현재 HEAD를 기준점으로 기록만** 한 뒤 다음 사이클부터 증분으로 작동시킨다 (cold start 보호).

## 실패 모드와 안전장치

| 실패 모드 | 안전장치 |
|---|---|
| 저품질 로그가 모델에 반영 | promotionMinScore=16 게이트 |
| 인사이트 중복 추가 | Phase B 중복 검사, 기존 문서에 근거만 추가 |
| 모델 문서 비대화 | 파일당 자동 섹션 5개 상한 + needsHumanReview |
| 잘못된 자동 수정 | 단일 커밋 → `git revert` 한 번 |
| 훅 오버헤드 | git diff는 ms 단위, 임계값 미달 즉시 exit 0 |
| 파이프라인 중간 실패 | state는 마지막에만 갱신, 다음 실행에서 재시도 |
| 루브릭 자동 수정 시도 | `/auto-sync` 프롬프트에 금지 명시 |
| 사람이 손댄 영역 덮어씀 | 마커 섹션 밖 절대 수정 금지 |
| 첫 실행에서 모든 로그 폭주 | cold start 보호: 첫 실행은 기준점만 기록 |

## 변경되지 않는 것

- `/research-cycle`, `/improve-log`, `/improve-all`, `/extract-insights`, `/sync-model`, `/review-log`
- `.claude/promotion-rubric.md`, `.claude/log-quality-rubric.md`
- 기존 `content/` 콘텐츠 (자동 마커 섹션 추가는 신규 영역으로 간주)

## 오픈 이슈 / 향후 튜닝

- THRESHOLD, promotionMinScore, maxAutoSectionsPerFile 세 숫자는 운영하면서 조정한다.
- 추후 사람 개입이 필요해지면 Phase C의 매핑 단계에서 "philosophy 수정은 제안 diff만" 같은 계층별 차등을 도입할 수 있다 (현재는 일괄 자동 수정).
- 인사이트 중복 검사는 키워드 매칭 수준. 정확도 부족 시 임베딩 기반으로 강화 가능.

## 구현 산출물

1. `.claude/hooks/auto-sync-check.sh` (신규)
2. `.claude/settings.json` (신규 또는 hooks 섹션 추가)
3. `.claude/commands/auto-sync.md` (신규)
4. `.claude/sync-state.json` (신규, 초기값)
5. `CLAUDE.md` 업데이트 — auto-sync 흐름 한 단락 추가
