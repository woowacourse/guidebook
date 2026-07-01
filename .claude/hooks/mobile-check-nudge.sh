#!/bin/bash
# mobile-check-nudge — Stop 훅. 마커 커밋 이후 바뀐 디자인 파일(.module.css / app/globals.css /
# components/*.tsx)에 모바일 오버플로우 정적 위반(error)이 있으면 다음 턴에 /모바일점검 을 권장한다.
#
# auto-sync-check.sh 와 동일한 커밋-히스토리 기반 감지: 이 저장소는 auto-commit 훅이 매 턴
# 커밋하므로 워킹트리 diff 는 늘 비어 보인다. 따라서 <lastMobileCheckCommit> HEAD diff 로 본다.
#
# 알림은 "정적 error 가 있을 때만" — 단순 변경만으로는 알리지 않아 노이즈를 막는다.
# (정적 error 없이도 실제 레이아웃이 깨질 수 있다. 그 경우는 수동 /모바일점검 과 작성 규칙이 커버.)
#
# 동작: error 감지 → exit 2 (stderr). 도구/마커/변경 부재·error 없음 → exit 0 (조용).

set -e
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE="$PROJECT_DIR/.claude/sync-state.json"
LINT="$PROJECT_DIR/scripts/mobile/mobile-lint.mjs"

if [ ! -f "$STATE" ]; then exit 0; fi
if [ ! -f "$LINT" ]; then exit 0; fi
if ! command -v jq >/dev/null 2>&1; then exit 0; fi
if ! command -v node >/dev/null 2>&1; then exit 0; fi

MARKER=$(jq -r '.lastMobileCheckCommit // empty' "$STATE" 2>/dev/null || true)
if [ -z "$MARKER" ]; then exit 0; fi
THRESHOLD=$(jq -r '.mobileCheckConfig.threshold // 1' "$STATE" 2>/dev/null || echo 1)

PATHSPEC=('*.module.css' 'app/globals.css' 'components/*.tsx')

CHANGED=$(git -C "$PROJECT_DIR" diff --name-only "$MARKER" HEAD -- "${PATHSPEC[@]}" 2>/dev/null | grep -c . || true)
case "$CHANGED" in ''|*[!0-9]*) CHANGED=0 ;; esac
if [ "$CHANGED" -lt "$THRESHOLD" ]; then exit 0; fi

# 바뀐 파일 중 현재 존재하는 것만 절대경로로
FILES=$(git -C "$PROJECT_DIR" diff --name-only "$MARKER" HEAD -- "${PATHSPEC[@]}" 2>/dev/null \
  | while read -r f; do [ -f "$PROJECT_DIR/$f" ] && echo "$PROJECT_DIR/$f"; done)
if [ -z "$FILES" ]; then exit 0; fi

# 정적 린트 (error>0 → exit 1). set -e 아래 종료코드 캡처를 위해 임시로 끈다.
set +e
OUT=$(CLAUDE_PROJECT_DIR="$PROJECT_DIR" node "$LINT" $FILES 2>/dev/null)
RC=$?
set -e

if [ "$RC" -eq 1 ]; then
  ERRLINES=$(echo "$OUT" | grep -c '^✗' || true)
  echo "[mobile-check] 디자인 변경 ${CHANGED}개 파일에서 모바일 오버플로우 위험(error ${ERRLINES}건) 감지. 다음 턴에 /모바일점검 으로 실제 모바일 뷰포트 검증을 권장합니다." >&2
  exit 2
fi
exit 0
