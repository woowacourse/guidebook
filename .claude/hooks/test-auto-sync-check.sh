#!/bin/bash
set -e
HOOK="$(cd "$(dirname "$0")" && pwd)/auto-sync-check.sh"
PASS=0
FAIL=0

run_case() {
  local name="$1"
  local expected_exit="$2"
  local expected_stderr_contains="$3"
  shift 3
  local tmp
  tmp=$(mktemp -d)
  set +e
  (
    set -e
    cd "$tmp"
    git init -q
    git config user.email t@t
    git config user.name t
    mkdir -p content/education-experiment/logs .claude
    echo init > README.md
    git add . && git commit -q -m init
    "$@"
    set +e
    stderr=$(CLAUDE_PROJECT_DIR="$tmp" bash "$HOOK" 2>&1 >/dev/null)
    actual_exit=$?
    set -e
    if [ "$actual_exit" != "$expected_exit" ]; then
      echo "FAIL [$name] exit: expected=$expected_exit actual=$actual_exit" >&2
      exit 1
    fi
    if [ -n "$expected_stderr_contains" ] && [[ "$stderr" != *"$expected_stderr_contains"* ]]; then
      echo "FAIL [$name] stderr did not contain: $expected_stderr_contains" >&2
      echo "  got: $stderr" >&2
      exit 1
    fi
    exit 0
  )
  rc=$?
  set -e
  rm -rf "$tmp"
  if [ "$rc" -eq 0 ]; then
    echo "PASS [$name]"
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
  fi
}

case_no_state() { :; }
run_case "no state, no logs" 0 "" case_no_state

case_cold_start() {
  cat > .claude/sync-state.json <<'JSON'
{ "lastSyncCommit": null, "config": { "threshold": 3 } }
JSON
  for i in 1 2; do
    echo "log $i" > "content/education-experiment/logs/log$i.mdx"
  done
  git add . && git commit -q -m "add 2 logs"
}
run_case "cold start under threshold" 0 "" case_cold_start

case_under() {
  echo '{"lastSyncCommit":"HEAD","config":{"threshold":3}}' > .claude/sync-state.json
  git add . && git commit -q -m state
  echo log > content/education-experiment/logs/a.mdx
  git add . && git commit -q -m "add 1"
  PREV=$(git rev-parse HEAD~1)
  jq --arg c "$PREV" '.lastSyncCommit=$c' .claude/sync-state.json > /tmp/s.json && mv /tmp/s.json .claude/sync-state.json
}
run_case "under threshold" 0 "" case_under

case_over() {
  echo '{"lastSyncCommit":"HEAD","config":{"threshold":3}}' > .claude/sync-state.json
  git add . && git commit -q -m state
  PREV=$(git rev-parse HEAD)
  for i in 1 2 3; do
    echo log > "content/education-experiment/logs/log$i.mdx"
  done
  git add . && git commit -q -m "add 3"
  jq --arg c "$PREV" '.lastSyncCommit=$c' .claude/sync-state.json > /tmp/s.json && mv /tmp/s.json .claude/sync-state.json
}
run_case "over threshold triggers alert" 2 "미반영 실험 로그 3개" case_over

echo "---"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
