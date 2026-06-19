#!/bin/bash
# auto-compile-check — Stop 훅. llm-wiki/raw/ 에 미합성분 raw 가 임계값 이상 누적되면
# 다음 턴에 /지식정제 자동 실행을 추천한다.
#
# 카파시 LLM Wiki 패턴의 ingest/compile 분리 원칙에 따라 raw 가 자주 쌓이고
# wiki 합성이 드물 수 있는데, 그 격차가 너무 벌어지면 위키가 식는다. 이 훅이
# "raw 가 N개 쌓였다, 정제할 때다" 라는 자연 압력을 만든다.
#
# 탐지 방식 (2026-06-16 ledger 전환):
# - 과거: `git diff --diff-filter=A <lastCompileCommit> HEAD` 로 "마지막 compile 이후
#   추가된 raw" 를 셌다. 두 결함 — (1) 사이클이 마커를 advance 안 하면 같은 raw 를 매 턴
#   다시 세서 무한 오탐, (2) 한 커밋이 batchSize 보다 많이 추가하면 일부가 orphan.
# - 현재: scripts/llm-wiki/compile-state.mjs 의 파일 단위 ledger(compiledRaw) 로
#   "실제로 wiki 에 합성 안 된 auto-eligible raw" 수를 직접 센다. 마커 불일치/orphan 소멸.
#   auto-eligible = llm-wiki/raw/*.md (루트). 하위 폴더는 deliberate-only 라 제외.
#
# 동작:
# - compile-state.mjs pending --count >= threshold 이면 exit 2 (stderr 메시지)
# - node/스크립트/상태파일 부재, 임계값 미달 → exit 0 (조용히)

set -e
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE="$PROJECT_DIR/.claude/sync-state.json"
SCRIPT="$PROJECT_DIR/scripts/llm-wiki/compile-state.mjs"

# 위키 비활성 / 도구 부재 → 조용히 종료 (훅이 깨지지 않도록)
if [ ! -f "$STATE" ]; then exit 0; fi
if [ ! -f "$SCRIPT" ]; then exit 0; fi
if ! command -v jq >/dev/null 2>&1; then exit 0; fi
if ! command -v node >/dev/null 2>&1; then exit 0; fi

THRESHOLD=$(jq -r '.compileConfig.threshold // 5' "$STATE" 2>/dev/null || echo 5)

# ledger 기반 미합성 auto-eligible raw 수
PENDING=$(CLAUDE_PROJECT_DIR="$PROJECT_DIR" node "$SCRIPT" pending --count 2>/dev/null || echo 0)

# 숫자 검증 (스크립트 오류 시 0 처리)
case "$PENDING" in
  ''|*[!0-9]*) PENDING=0 ;;
esac

if [ "$PENDING" -ge "$THRESHOLD" ]; then
  echo "[auto-compile] llm-wiki/raw/ 에 ${PENDING}개 auto-eligible raw 가 미합성 누적 (임계값 ${THRESHOLD}). 다음 턴에 /지식정제 자동 실행을 권장합니다. (하위 폴더 external/derived/conversations 는 deliberate-only 라 제외)" >&2
  exit 2
fi

exit 0
