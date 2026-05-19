#!/bin/bash
set -e
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE="$PROJECT_DIR/.claude/sync-state.json"
if [ ! -f "$STATE" ]; then exit 0; fi
THRESHOLD=$(jq -r '.config.threshold // 3' "$STATE" 2>/dev/null || echo 3)
LAST_SYNC=$(jq -r '.lastSyncCommit // empty' "$STATE" 2>/dev/null || true)
if [ -z "$LAST_SYNC" ]; then exit 0; fi
PENDING=$(git -C "$PROJECT_DIR" diff --name-only "$LAST_SYNC" HEAD -- 'content/education/logs/*.mdx' 2>/dev/null | grep -c . || true)
if [ "$PENDING" -ge "$THRESHOLD" ]; then
  echo "[auto-sync] 미반영 실험 로그 ${PENDING}개 누적 (임계값 ${THRESHOLD}). 다음 턴에 /로그승격 자동 실행을 권장합니다." >&2
  exit 2
fi
exit 0
