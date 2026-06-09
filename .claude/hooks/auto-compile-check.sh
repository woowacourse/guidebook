#!/bin/bash
# auto-compile-check — Stop 훅. knowledge/raw/ 에 미합성분 raw 가 임계값 이상 누적되면
# 다음 턴에 /지식정제 자동 실행을 추천한다.
#
# 카파시 LLM Wiki 패턴의 ingest/compile 분리 원칙에 따라 raw 가 자주 쌓이고
# wiki 합성이 드물 수 있는데, 그 격차가 너무 벌어지면 위키가 식는다. 이 훅이
# "raw 가 N개 쌓였다, 정제할 때다" 라는 자연 압력을 만든다.
#
# 동작:
# - lastCompileCommit (sync-state.json) 이후 추가된 knowledge/raw/**/*.md 파일 수 세기
# - threshold 이상이면 exit 2 (stderr 메시지)
# - lastCompileCommit 미설정 / 임계값 미달 / 위키 비활성 → exit 0

set -e
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE="$PROJECT_DIR/.claude/sync-state.json"

if [ ! -f "$STATE" ]; then exit 0; fi
if ! command -v jq >/dev/null 2>&1; then exit 0; fi

THRESHOLD=$(jq -r '.compileConfig.threshold // 5' "$STATE" 2>/dev/null || echo 5)
LAST_COMPILE=$(jq -r '.lastCompileCommit // empty' "$STATE" 2>/dev/null || true)

# lastCompileCommit 미설정: 위키 운영 시작 전 → 조용히 종료
if [ -z "$LAST_COMPILE" ]; then exit 0; fi

# 커밋 SHA 가 실제로 존재하는지 확인 (squash merge 등으로 사라질 수 있음)
if ! git -C "$PROJECT_DIR" cat-file -e "$LAST_COMPILE" 2>/dev/null; then
  echo "[auto-compile] sync-state.json 의 lastCompileCommit($LAST_COMPILE) 이 더 이상 존재하지 않습니다. 사람이 직접 갱신하세요." >&2
  exit 0
fi

# lastCompileCommit 이후 추가된 knowledge/raw/ 파일 수
PENDING=$(git -C "$PROJECT_DIR" diff --name-only --diff-filter=A "$LAST_COMPILE" HEAD -- 'knowledge/raw/**.md' 'knowledge/raw/*.md' 2>/dev/null | grep -c . || true)

if [ "$PENDING" -ge "$THRESHOLD" ]; then
  echo "[auto-compile] knowledge/raw/ 에 ${PENDING}개 raw 가 미합성 상태로 누적 (임계값 ${THRESHOLD}). 다음 턴에 /지식정제 자동 실행을 권장합니다." >&2
  exit 2
fi

exit 0
