#!/usr/bin/env bash
# PostToolUse hook: validate a .pine file immediately after Claude edits it.
#
# Closes the loop that previously depended on remembering to run the validator.
# Exits 2 on validation errors so the diagnostics are fed back to Claude as a
# blocking error; exits 0 for every other outcome (non-Pine file, missing build,
# validator crash) so ordinary editing is never obstructed by tooling problems.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

file_path="$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')"

case "$file_path" in
  *.pine) ;;
  *) exit 0 ;;
esac

[ -f "$file_path" ] || exit 0
[ -f "$REPO_ROOT/dist/src/parser/accurateValidator.js" ] || exit 0

# Resolve to an absolute path BEFORE cd, or a relative path from the hook payload
# would be looked up against the repo root instead of the caller's directory.
case "$file_path" in
  /*) ;;
  *) file_path="$PWD/$file_path" ;;
esac

output="$(cd "$REPO_ROOT" && node validate-cli.js "$file_path" 2>&1)"
status=$?

# Only exit 1 means "this file has validation errors". validate-cli.js exits 2 when
# it cannot read the file or load the validator, and a missing node yields 127 —
# tooling problems, not code problems. Blocking the edit on those contradicts this
# hook's own contract and would stop work for reasons the author cannot act on.
if [ "$status" -ne 1 ]; then
  exit 0
fi

if [ "$status" -eq 1 ]; then
  # Strip ANSI colour so the feedback reads cleanly in the transcript.
  printf 'Pine validation failed for %s\n\n%s\n' \
    "$file_path" "$(printf '%s' "$output" | sed $'s/\033\\[[0-9;]*m//g')" >&2
  exit 2
fi

exit 0
