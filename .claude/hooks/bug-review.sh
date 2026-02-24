#!/bin/bash
# Bug review hook — runs after git commit (PostToolUse)
# Injects review context so Claude reviews the commit inline

set -euo pipefail

COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null)
if [ -z "$COMMIT_HASH" ]; then
  exit 0
fi

COMMIT_MSG=$(git log -1 --pretty=format:"%s" "$COMMIT_HASH")
CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r "$COMMIT_HASH" 2>/dev/null)
DIFF=$(git diff "$COMMIT_HASH"~1 "$COMMIT_HASH" --stat 2>/dev/null)

if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

CODE_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(py|ts|tsx|js|jsx|rs|swift)$' || true)
if [ -z "$CODE_FILES" ]; then
  exit 0
fi

FILE_COUNT=$(echo "$CODE_FILES" | wc -l | tr -d ' ')
DIFF_LINES=$(git diff "$COMMIT_HASH"~1 "$COMMIT_HASH" --stat 2>/dev/null | tail -1 | grep -oE '[0-9]+ insertion|[0-9]+ deletion' | awk '{s+=$1} END{print s+0}')

FILE_LIST=$(echo "$CODE_FILES" | sed 's/^/  - /')

CONTEXT="AUTO BUG REVIEW — Commit ${COMMIT_HASH:0:7} (~${DIFF_LINES} lines changed)

Changed code files (${FILE_COUNT}):
${FILE_LIST}

Diff summary:
${DIFF}

Please run: git diff ${COMMIT_HASH}~1 ${COMMIT_HASH} -- <file> for each code file above, review for:
1. Logic bugs, off-by-one errors, null/undefined issues
2. Missing error handling or uncaught exceptions
3. Security issues (injection, XSS, exposed secrets)
4. Race conditions or async issues
5. Type mismatches or wrong API contracts
6. Broken imports or missing dependencies

After reviewing, summarize any issues found or confirm the code looks clean."

# Use jq to produce valid JSON (properly escapes newlines, quotes, etc.)
jq -n \
  --arg reason "Bug review for commit ${COMMIT_HASH:0:7}: ${FILE_COUNT} code file(s), ~${DIFF_LINES} lines changed. Review the changes for bugs now." \
  --arg ctx "$CONTEXT" \
  '{
    decision: "block",
    reason: $reason,
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: $ctx
    }
  }'

exit 0
