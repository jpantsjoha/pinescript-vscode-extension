#!/usr/bin/env bash
# Publish pinescript-v6-validator from a clean export, never the working tree (#67).
set -euo pipefail

usage() {
  # Builtins only (no cat): --help must work with nothing on PATH.
  while IFS= read -r line; do printf '%s\n' "$line"; done <<'USAGE'
Publish pinescript-v6-validator from a clean export, never the working tree (#67).

  scripts/publish-engine.sh                   dry run: export, build, guard, pack, test
  scripts/publish-engine.sh --publish --pre <inspection.json>
                                              the same, then `npm publish` of THAT tarball
  scripts/publish-engine.sh --candidate [--pre <inspection.json>]
                                              dry run of a HEAD not yet on origin/main
  scripts/publish-engine.sh --keep            keep the temporary export
  scripts/publish-engine.sh --help            this text (no git, npm or network)

Release sequence: merge -> git fetch && git checkout origin/main ->
node scripts/inspect-artefacts.js --out-dir <dir> -> scripts/publish-engine.sh --publish
--pre <dir>/inspection.json -> node scripts/verify-published.js --engine <v> --pre <same>.

The script:
  1. refuses a dirty tree (tracked files) and a project-level .npmrc in the checkout or
     the commit; a dry run needs HEAD on origin/main (or --candidate); --publish needs
     HEAD to BE the freshly fetched origin/main tip;
  2. exports HEAD with `git archive` into a fresh directory under $TMPDIR, refusing any
     path inside iCloud ("Mobile Documents");
  3. isolates npm: no inherited npm_config_* variables, the user's ~/.npmrc (auth) as
     the only config file, an empty global config, `--registry https://registry.npmjs.org/`
     on every registry command (a CLI flag outranks publishConfig and the environment),
     and refuses a publishConfig registry pointing anywhere else; cwd in the export;
  4. installs (`npm ci --ignore-scripts`), builds, runs the check-pack guard;
  5. packs, prints every file, the count and the SHA-256, re-checks the tarball;
  6. installs the tarball into a throwaway project and runs the regression corpus;
  7. with --pre: the record must be a PASS inspection (no failures, every artefact run,
     hashes present) of this tree, this engine version and this exact tarball SHA-256;
  8. only with --publish: re-hashes the tarball, then `npm publish <that tarball>`.
     Authentication and 2FA are npm's own (OTP prompt); this script never reads, stores
     or prints a token.
USAGE
}

# Help first: nothing below runs for --help.
for a in "$@"; do
  case "$a" in -h|--help) usage; exit 0 ;; esac
done

PUBLISH=0
CANDIDATE=0
KEEP=0
PRE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --publish) PUBLISH=1 ;;
    --candidate) CANDIDATE=1 ;;
    --keep) KEEP=1 ;;
    --pre) shift; PRE="${1:-}" ;;
    *) echo "publish-engine: unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

die() { echo "publish-engine: REFUSED — $*" >&2; exit 1; }
REG="https://registry.npmjs.org/"

if [ "$PUBLISH" = 1 ] && [ "$CANDIDATE" = 1 ]; then
  die "--candidate is for dry runs; publish only the origin/main tip"
fi
if [ "$PUBLISH" = 1 ] && [ -z "$PRE" ]; then
  die "--publish needs --pre <inspection.json> from scripts/inspect-artefacts.js run on the origin/main tip"
fi
if [ -n "$PRE" ]; then
  [ -f "$PRE" ] || die "no pre-release record at $PRE"
  PRE="$(cd "$(dirname "$PRE")" && pwd -P)/$(basename "$PRE")"
fi

REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"
POLICY="$REPO/scripts/lib/publish-policy.js"

# 1. Clean tree, no project npm config, the right commit.
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  git status --short --untracked-files=no >&2
  die "the working tree has uncommitted changes to tracked files"
fi
for rc in "$REPO/.npmrc" "$REPO/packages/validator/.npmrc"; do
  [ ! -e "$rc" ] || die "a project-level $rc exists; it could redirect the registry or authentication — remove it"
done
HEAD_SHA="$(git rev-parse HEAD)"
HEAD_TREE="$(git rev-parse "HEAD^{tree}")"
git fetch --quiet origin main
TIP="$(git rev-parse origin/main)"
if [ "$PUBLISH" = 1 ]; then
  WHY="$(node "$POLICY" tip "$HEAD_SHA" "$TIP")" || die "$WHY"
  ON_MAIN="tip"
elif git merge-base --is-ancestor "$HEAD_SHA" origin/main; then
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
for rc in "$WORK/src/.npmrc" "$PKG/.npmrc"; do
  [ ! -e "$rc" ] || die "the commit tracks $rc; project npm config is not allowed in a publish"
done
WHY="$(node "$WORK/src/scripts/lib/publish-policy.js" publish-config "$PKG/package.json")" || die "$WHY"

# 3. npm configuration isolated from the checkout and the calling shell.
for name in $(compgen -e); do
  case "$name" in npm_config_*|NPM_CONFIG_*) unset "$name" ;; esac
done
: > "$WORK/empty-globalrc"
export npm_config_userconfig="$HOME/.npmrc"
export npm_config_globalconfig="$WORK/empty-globalrc"
export npm_config_registry="$REG"
export npm_config_audit=false npm_config_fund=false

VERSION="$(node -p "require('$PKG/package.json').version")"
echo "publish-engine: pinescript-v6-validator@$VERSION"
echo "  commit:   $HEAD_SHA (tree $HEAD_TREE; origin/main: $ON_MAIN)"
echo "  export:   $WORK/src"
echo "  node $(node --version), npm $(cd "$PKG" && npm --version), registry $REG"

# 4. Install, build, guard — all in the export.
(cd "$PKG" && npm ci --ignore-scripts --registry "$REG" >/dev/null)
(cd "$PKG" && npm run --silent build)
(cd "$PKG" && node -e "require('./dist/index.js')")
(cd "$PKG" && node scripts/check-pack.js)

# 5. Pack (prepack runs the guard again) and inspect the tarball itself.
TARBALL_NAME="$(cd "$PKG" && npm pack --silent --registry "$REG" --pack-destination "$WORK/out" | tail -n 1)"
TARBALL="$WORK/out/$TARBALL_NAME"
(cd "$PKG" && node scripts/check-pack.js --tarball "$TARBALL")
COUNT="$(tar -tzf "$TARBALL" | grep -vc '/$')"
SHA="$(shasum -a 256 "$TARBALL" | cut -d' ' -f1)"
echo "publish-engine: $TARBALL_NAME — $COUNT files, $(wc -c < "$TARBALL" | tr -d ' ') bytes"
tar -tzf "$TARBALL" | grep -v '/$' | sed 's/^package\//    /' | sort
echo "  sha256:   $SHA"

# 6. The published bits, installed by name, against the regression corpus.
(cd "$WORK/out" && node "$WORK/src/scripts/engine-tarball-smoke.js" "$TARBALL")

# 7. Bind to a PASS pre-release inspection of this tree and this tarball.
if [ -n "$PRE" ]; then
  WHY="$(node "$WORK/src/scripts/lib/publish-policy.js" pre "$PRE" "$HEAD_TREE" "$VERSION" "$SHA")" \
    || die "pre-release record does not bind: $WHY"
  echo "publish-engine: matches the PASS pre-release inspection $(basename "$PRE") (tree, version, tarball sha256)"
fi

if (cd "$PKG" && npm view "pinescript-v6-validator@$VERSION" version --registry "$REG" >/dev/null 2>&1); then
  ALREADY="yes"
else
  ALREADY="no"
fi

# 8. Publish only on request, and only the tarball inspected above.
if [ "$PUBLISH" = 1 ]; then
  [ "$ALREADY" = "no" ] || die "pinescript-v6-validator@$VERSION is already on npm; bump the version"
  NOW="$(shasum -a 256 "$TARBALL" | cut -d' ' -f1)"
  [ "$NOW" = "$SHA" ] || die "the tarball changed after inspection ($SHA -> $NOW)"
  echo "publish-engine: publishing $TARBALL_NAME (sha256 $NOW) to $REG"
  (cd "$PKG" && npm publish "$TARBALL" --access public --registry "$REG")
  echo "publish-engine: published. Next: node scripts/verify-published.js --engine $VERSION --pre $PRE"
else
  echo "publish-engine: DRY RUN — nothing published (already on npm: $ALREADY). To publish: on the origin/main tip, --publish --pre <inspection.json>."
fi
