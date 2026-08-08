#!/usr/bin/env bash
#
# Activate .githooks/pre-commit for this clone.
#
# Two situations, and conflating them breaks one of them:
#
#   1. core.hooksPath already points somewhere else — typically a machine-wide
#      secret scanner. Overwriting it would silently disable that protection, which
#      is a bad trade for a test gate. A well-behaved global hook chains to
#      .githooks/pre-commit, so there is nothing to do but confirm.
#
#   2. core.hooksPath is unset. Point it at .githooks, which is tracked, so the hook
#      arrives with the clone instead of having to be remembered.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
chmod +x .githooks/pre-commit

existing="$(git config core.hooksPath || true)"

if [ -z "$existing" ]; then
  git config core.hooksPath .githooks
  echo "core.hooksPath -> .githooks"
  echo "pre-commit active: typecheck, full test suite, examples/ validation."
  exit 0
fi

if [ "$existing" = ".githooks" ]; then
  echo "Already active (core.hooksPath = .githooks)."
  exit 0
fi

echo "core.hooksPath is set to: $existing"
if [ -x "$existing/pre-commit" ] && grep -q '\.githooks/pre-commit' "$existing/pre-commit" 2>/dev/null; then
  echo "That hook chains to .githooks/pre-commit — nothing to change."
else
  echo
  echo "WARNING  It does NOT appear to chain to .githooks/pre-commit, so this repo's"
  echo "         gate will not run. Either add the chain there, or run:"
  echo "             git config core.hooksPath .githooks"
  echo "         Be aware that replaces whatever $existing was doing."
  exit 1
fi
