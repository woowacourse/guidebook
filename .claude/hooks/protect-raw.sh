#!/bin/bash
# protect-raw — PreToolUse 훅. llm-wiki/raw/ 안 파일에 대한 Write/Edit 시도를 차단한다.
#
# 카파시 LLM Wiki 패턴의 절대 규약: "raw 는 불변. 한 번 들어오면 절대 수정 안 함."
# 오타·오류조차 wiki 에서 정정한다 — 그래야 모든 wiki 주장이 출처로 역추적된다.
#
# Claude Code PreToolUse 훅 프로토콜:
#   - stdin: { "tool_name": "...", "tool_input": { "file_path": "..." } } 형식 JSON
#   - exit 0: 허용 (도구 호출 진행)
#   - exit 2: 차단 (stderr 메시지를 Claude 에 전달)
#
# 차단 대상 도구: Write, Edit, NotebookEdit
# 차단 대상 경로: llm-wiki/raw/** (단, 새 파일 추가는 허용 — 기존 파일 수정만 차단)
#
# Karpathy Gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
RAW_DIR="$PROJECT_DIR/llm-wiki/raw"

# stdin 에서 JSON 읽기
INPUT="$(cat)"

# jq 가 없으면 검사 못 함. 안전을 위해 통과 (다른 검증 레이어가 있다고 가정).
if ! command -v jq >/dev/null 2>&1; then exit 0; fi

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)

# 검사 대상이 아니면 통과
case "$TOOL_NAME" in
  Write|Edit|NotebookEdit) ;;
  *) exit 0 ;;
esac

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
if [ -z "$FILE_PATH" ]; then exit 0; fi

# 절대 경로로 정규화
case "$FILE_PATH" in
  /*) ABS_PATH="$FILE_PATH" ;;
  *)  ABS_PATH="$PROJECT_DIR/$FILE_PATH" ;;
esac

# llm-wiki/raw/ 안에 있는지 확인
case "$ABS_PATH" in
  "$RAW_DIR"/*) ;;
  *) exit 0 ;;
esac

# Write 인 경우: 기존 파일이면 차단, 새 파일이면 허용 (raw 새 흡수는 정상)
if [ "$TOOL_NAME" = "Write" ] && [ ! -e "$ABS_PATH" ]; then
  exit 0
fi

# Edit / 기존 파일 Write / NotebookEdit → 차단
REL_PATH="${ABS_PATH#$PROJECT_DIR/}"
cat <<EOF >&2
[protect-raw] llm-wiki/raw/ 안 기존 파일은 절대 수정 금지입니다.

차단된 경로: $REL_PATH
도구: $TOOL_NAME

카파시 LLM Wiki 패턴의 절대 규약: "raw 는 불변 (immutable). 한 번 들어오면 절대 수정하지 않는다. 오타·오류조차 wiki 에서 정정한다."

지금 하려는 작업이 정말 raw 수정이 맞다면, 그 작업은 잘못된 것입니다.
- 오타 정정이라면 → wiki 노트에서 정정문을 추가
- 출처 보강이라면 → 새 raw 파일을 추가 (다른 파일명으로)
- 정말 raw 자체를 바꿔야 한다면 → 사용자에게 명시적으로 확인 후 hook 일시 비활성화

규약: llm-wiki/AGENTS.md
EOF
exit 2
