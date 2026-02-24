#!/bin/bash
# Bug review hook — runs after git add (PostToolUse)
# Injects review context so Claude reviews staged changes inline

set -euo pipefail

STAGED_FILES=$(git diff --cached --name-only 2>/dev/null | grep -E '\.(py|ts|tsx|js|jsx|rs|swift)$' || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

FILE_COUNT=$(echo "$STAGED_FILES" | wc -l | tr -d ' ')
DIFF_LINES=$(git diff --cached --stat 2>/dev/null | tail -1 | grep -oE '[0-9]+ insertion|[0-9]+ deletion' | awk '{s+=$1} END{print s+0}')
DIFF_SUMMARY=$(git diff --cached --stat 2>/dev/null)

FILE_LIST=$(echo "$STAGED_FILES" | sed 's/^/  - /')

CONTEXT="AUTO BUG REVIEW — Staged Changes (~${DIFF_LINES} lines changed)

Staged code files (${FILE_COUNT}):
${FILE_LIST}

Diff summary:
${DIFF_SUMMARY}

Please run: git diff --cached -- <file> for each code file above, review for:
1. Logic bugs, off-by-one errors, null/undefined issues
2. Missing error handling or uncaught exceptions
3. Security issues (injection, XSS, exposed secrets)
4. Race conditions or async issues
5. Type mismatches or wrong API contracts
6. Broken imports or missing dependencies

After reviewing, summarize any issues found or confirm the code looks clean."

jq -n \
  --arg reason "Bug review for ${FILE_COUNT} staged code file(s), ~${DIFF_LINES} lines changed. Review the staged changes for bugs now." \
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
