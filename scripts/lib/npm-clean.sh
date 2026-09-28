# shellcheck shell=bash
# The ONLY way a shell script in this repository runs npm (#67). Source it, then call
#   npm_clean <npm arguments...>
# Shell twin of packages/validator/scripts/npm-clean.js; the same policy:
#   - every inherited npm_config_* / NPM_CONFIG_* variable removed; userconfig =
#     ~/.npmrc (authentication only), globalconfig = /dev/null, registry pinned;
#   - `--registry https://registry.npmjs.org/` on the command line for every command
#     that can reach a registry (any caller-supplied --registry is replaced);
#   - refused when the working directory is inside iCloud ("Mobile Documents"),
#     except `npm run` and `npm --version`.
# test/npm-guard.test.js fails on any direct npm call in a script outside the helpers.

NPM_CLEAN_REGISTRY="https://registry.npmjs.org/"

npm_clean() {
  local sub="" a cwd skip=0
  for a in "$@"; do
    case "$a" in -*) ;; *) sub="$a"; break ;; esac
  done
  [ -n "$sub" ] || sub="--version"
  cwd="$(pwd -P)"
  case "$sub" in
    run|run-script|--version) ;;
    *) case "$cwd" in
         *"Mobile Documents"*)
           echo "npm_clean: npm $sub refused: working directory $cwd is inside iCloud; run it from a clean export" >&2
           return 1 ;;
       esac ;;
  esac
  local args=()
  for a in "$@"; do
    if [ "$skip" = 1 ]; then skip=0; continue; fi
    case "$a" in
      --registry) skip=1; continue ;;
      --registry=*) continue ;;
    esac
    args+=("$a")
  done
  case "$sub" in
    ci|install|i|add|update|up|pack|publish|unpublish|view|info|show|v|dist-tag|deprecate|outdated|audit|exec|x|search|whoami|ping|access|owner|token|login|logout|adduser|fund|doctor)
      args+=(--registry "$NPM_CLEAN_REGISTRY") ;;
  esac
  local unset_args=() name
  for name in $(compgen -e); do
    case "$name" in npm_config_*|NPM_CONFIG_*) unset_args+=(-u "$name") ;; esac
  done
  # ${arr[@]+...}: an empty array is safe under set -u on bash 3.2 (macOS /bin/bash).
  env ${unset_args[@]+"${unset_args[@]}"} \
    npm_config_userconfig="$HOME/.npmrc" \
    npm_config_globalconfig=/dev/null \
    npm_config_registry="$NPM_CLEAN_REGISTRY" \
    npm_config_audit=false npm_config_fund=false npm_config_update_notifier=false \
    npm ${args[@]+"${args[@]}"}
}
