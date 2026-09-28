#!/usr/bin/env bash
# Publish pinescript-v6-validator from a clean export, never the working tree (#67).
#
#   scripts/publish-engine.sh               # dry run: export, build, guard, pack, test
#   scripts/publish-engine.sh --publish     # the same, then `npm publish` of THAT tarball
#   scripts/publish-engine.sh --candidate   # dry run of a HEAD not yet on origin/main
#   scripts/publish-engine.sh --keep        # keep the temporary export for inspection
#
# 0.4.2 was published from the iCloud working tree and shipped 22 sync-conflict copies
# (`dist/src/accurateValidator 2.js`, a stale validator, among them) because
# `files: ["dist"]` packs whatever sits in dist/. This script:
#   1. refuses a dirty tree (tracked files) or a HEAD that is not on origin/main;
#   2. exports HEAD with `git archive` into a fresh directory under $TMPDIR, and refuses
#      any path inside iCloud ("Mobile Documents");
#   3. installs (`npm ci --ignore-scripts`), builds, and runs the check-pack guard;
#   4. packs, prints every file, the count and the SHA-256, re-checks the tarball;
#   5. installs the tarball into a throwaway project and runs the regression corpus;
#   6. only with --publish, runs `npm publish <that tarball>`. Authentication and 2FA
#      are npm's own (~/.npmrc, OTP prompt); this script never reads, stores or prints
#      a token.
set -euo pipefail

PUBLISH=0
CANDIDATE=0
KEEP=0
for arg in "$@"; do
  case "$arg" in
    --publish) PUBLISH=1 ;;
    --candidate) CANDIDATE=1 ;;
    --keep) KEEP=1 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "publish-engine: unknown argument: $arg" >&2; exit 2 ;;
  esac
done

die() { echo "publish-engine: REFUSED — $*" >&2; exit 1; }

if [ "$PUBLISH" = 1 ] && [ "$CANDIDATE" = 1 ]; then
  die "--candidate is for dry runs; publish only a commit that is on origin/main"
fi

REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"

# 1. Clean tree, and a commit that has been reviewed and merged.
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  git status --short --untracked-files=no >&2
  die "the working tree has uncommitted changes to tracked files"
fi
HEAD_SHA="$(git rev-parse HEAD)"
git fetch --quiet origin main
if git merge-base --is-ancestor "$HEAD_SHA" origin/main; then
  ON_MAIN="yes"
else
  ON_MAIN="no"
  [ "$CANDIDATE" = 1 ] || die "HEAD $HEAD_SHA is not on origin/main (use --candidate for a dry run of a branch)"
fi

# 2. A fresh export outside any synced folder.
BASE="$(cd "${TMPDIR:-/tmp}" && pwd -P)"
WORK="$(mktemp -d "$BASE/engine-publish.XXXXXX")"
WORK="$(cd "$WORK" && pwd -P)"
case "$WORK" in
  *"Mobile Documents"*) rmdir "$WORK"; die "export path is inside iCloud: $WORK" ;;
esac
cleanup() { if [ "$KEEP" = 1 ]; then echo "publish-engine: kept $WORK"; else rm -rf "$WORK"; fi; }
trap cleanup EXIT

mkdir -p "$WORK/src" "$WORK/out"
git archive --format=tar "$HEAD_SHA" | tar -x -C "$WORK/src"
PKG="$WORK/src/packages/validator"
VERSION="$(node -p "require('$PKG/package.json').version")"

echo "publish-engine: pinescript-v6-validator@$VERSION"
echo "  commit:   $HEAD_SHA (on origin/main: $ON_MAIN)"
echo "  export:   $WORK/src"
echo "  node $(node --version), npm $(npm --version)"

# 3. Install, build, guard.
(cd "$PKG" && npm ci --ignore-scripts --no-audit --no-fund >/dev/null)
(cd "$PKG" && npm run --silent build)
(cd "$PKG" && node -e "require('./dist/index.js')")
(cd "$PKG" && node scripts/check-pack.js)

# 4. Pack (prepack runs the guard again) and inspect the tarball itself.
TARBALL_NAME="$(cd "$PKG" && npm pack --silent --pack-destination "$WORK/out" | tail -n 1)"
TARBALL="$WORK/out/$TARBALL_NAME"
(cd "$PKG" && node scripts/check-pack.js --tarball "$TARBALL")
COUNT="$(tar -tzf "$TARBALL" | grep -vc '/$')"
echo "publish-engine: $TARBALL_NAME — $COUNT files, $(wc -c < "$TARBALL" | tr -d ' ') bytes"
tar -tzf "$TARBALL" | grep -v '/$' | sed 's/^package\//    /' | sort
echo "  sha256:   $(shasum -a 256 "$TARBALL" | cut -d' ' -f1)"

# 5. The published bits, installed by name, against the regression corpus.
node "$WORK/src/scripts/engine-tarball-smoke.js" "$TARBALL"

if npm view "pinescript-v6-validator@$VERSION" version >/dev/null 2>&1; then
  ALREADY="yes"
else
  ALREADY="no"
fi

# 6. Publish only on request, and only the tarball inspected above.
if [ "$PUBLISH" = 1 ]; then
  [ "$ALREADY" = "no" ] || die "pinescript-v6-validator@$VERSION is already on npm; bump the version"
  echo "publish-engine: publishing $TARBALL_NAME"
  npm publish "$TARBALL" --access public
  echo "publish-engine: published. Next: node scripts/verify-published.js --engine $VERSION"
else
  echo "publish-engine: DRY RUN — nothing published (already on npm: $ALREADY). Re-run with --publish to publish this tarball."
fi
