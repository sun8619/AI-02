#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SSH_TARGET="${AI02_SSH_TARGET:-ai02-prod}"
PUBLIC_HEALTH_URL="${AI02_PUBLIC_HEALTH_URL:-}"
COMMAND="${1:-deploy}"
shift || true

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

run_checks() {
  npm ci
  npm test
  npx playwright install chromium
  npm run test:browser
  node tools/deploy-regression-audit.mjs
  bash -n tools/update-server.sh
  bash -n tools/server-deploy-gateway.sh
  bash -n tools/install-deploy-access.sh
  node --check tools/release.mjs
}

case "$COMMAND" in
  check)
    run_checks
    node tools/release.mjs verify
    ;;
  status)
    ssh -o BatchMode=yes "$SSH_TARGET" status
    ;;
  logs)
    lines="${1:-100}"
    [[ "$lines" =~ ^[0-9]+$ ]] || fail "log line count must be numeric"
    ssh -o BatchMode=yes "$SSH_TARGET" "logs $lines"
    ;;
  deploy)
    branch="$(git branch --show-current)"
    [[ "$branch" == "main" ]] || fail "production deployment is allowed only from main (current: $branch)"

    git fetch origin main
    git merge-base --is-ancestor origin/main HEAD || fail "local main is behind or diverged from origin/main; update it first"

    run_checks
    release_id="$(node tools/release.mjs build)"
    node tools/release.mjs verify

    git add -A
    git diff --cached --check
    message="${*:-Release ${release_id}}"
    git commit -m "$message"
    git push origin HEAD:main

    revision="$(git rev-parse HEAD)"
    ssh -o BatchMode=yes "$SSH_TARGET" "deploy $revision"
    ssh -o BatchMode=yes "$SSH_TARGET" status

    if [[ -n "$PUBLIC_HEALTH_URL" ]]; then
      curl -fsS --max-time 15 "$PUBLIC_HEALTH_URL" >/dev/null
      printf 'Public health check passed: %s\n' "$PUBLIC_HEALTH_URL"
    fi
    printf 'DEPLOYED revision=%s release=%s\n' "$revision" "$release_id"
    ;;
  *)
    fail "usage: tools/deploy-local.sh {check|deploy [commit message]|status|logs [lines]}"
    ;;
esac
