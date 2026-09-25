#!/usr/bin/env bash
set -Eeuo pipefail

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
readonly REPO="sun8619/AI-02"
readonly SERVICE="qibu-ai"
readonly HEALTH_URL="http://127.0.0.1:4173/api/health"
readonly LOCK_FILE="/run/lock/ai02-deploy.lock"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

show_status() {
  printf 'service=%s\n' "$(systemctl is-active "$SERVICE" 2>/dev/null || true)"
  curl -fsS --max-time 5 "$HEALTH_URL" || fail "AI-02 health endpoint is unavailable"
  printf '\n'
}

deploy_revision() {
  local revision="$1"
  [[ "$revision" =~ ^[a-f0-9]{40}$ ]] || fail "invalid commit SHA"

  exec 9>"$LOCK_FILE"
  flock -n 9 || fail "another AI-02 deployment is already running"

  local updater
  updater="$(mktemp /tmp/ai02-update.XXXXXX.sh)"
  trap 'rm -f "$updater"' EXIT

  curl -fL --retry 5 --connect-timeout 20 --max-time 120 \
    "https://raw.githubusercontent.com/${REPO}/${revision}/tools/update-server.sh" \
    -o "$updater"
  chmod 700 "$updater"
  bash "$updater" "$revision"
  show_status
}

show_logs() {
  local lines="${1:-100}"
  [[ "$lines" =~ ^[0-9]+$ ]] || fail "log line count must be numeric"
  (( lines >= 1 && lines <= 500 )) || fail "log line count must be between 1 and 500"
  journalctl -u "$SERVICE" -n "$lines" --no-pager
}

read -r -a command_parts <<< "${SSH_ORIGINAL_COMMAND:-status}"
case "${command_parts[0]:-}" in
  deploy)
    (( ${#command_parts[@]} == 2 )) || fail "usage: deploy <full-commit-sha>"
    deploy_revision "${command_parts[1]}"
    ;;
  status)
    (( ${#command_parts[@]} == 1 )) || fail "usage: status"
    show_status
    ;;
  logs)
    (( ${#command_parts[@]} <= 2 )) || fail "usage: logs [1-500]"
    show_logs "${command_parts[1]:-100}"
    ;;
  *)
    fail "allowed commands: deploy <sha>, status, logs [lines]"
    ;;
esac
