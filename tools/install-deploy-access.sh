#!/usr/bin/env bash
set -Eeuo pipefail

PUBLIC_KEY="${1:?Usage: install-deploy-access.sh '<ssh-ed25519 public key>' [git-ref]}"
REF="${2:-main}"
GATEWAY_PATH="${AI02_GATEWAY_PATH:-/usr/local/sbin/ai02-deploy-gateway}"
AUTHORIZED_KEYS_FILE="${AI02_AUTHORIZED_KEYS_FILE:-/root/.ssh/authorized_keys}"
GATEWAY_SOURCE="${AI02_GATEWAY_SOURCE:-}"

if [[ -z "${AI02_GATEWAY_PATH:-}" && "$EUID" -ne 0 ]]; then
  echo "Run this installer as root." >&2
  exit 1
fi
[[ "$PUBLIC_KEY" =~ ^ssh-ed25519\ [A-Za-z0-9+/=]+(\ .*)?$ ]] || {
  echo "Only a valid ssh-ed25519 public key is accepted." >&2
  exit 1
}
[[ "$REF" =~ ^[A-Za-z0-9._/-]+$ ]] || {
  echo "Invalid Git ref." >&2
  exit 1
}

mkdir -p "$(dirname "$GATEWAY_PATH")" "$(dirname "$AUTHORIZED_KEYS_FILE")"
if [[ -n "$GATEWAY_SOURCE" ]]; then
  install -m 0755 "$GATEWAY_SOURCE" "$GATEWAY_PATH"
else
  temp_gateway="$(mktemp /tmp/ai02-gateway.XXXXXX)"
  trap 'rm -f "$temp_gateway"' EXIT
  curl -fL --retry 5 --connect-timeout 20 --max-time 120 \
    "https://raw.githubusercontent.com/sun8619/AI-02/${REF}/tools/server-deploy-gateway.sh" \
    -o "$temp_gateway"
  bash -n "$temp_gateway"
  install -m 0755 "$temp_gateway" "$GATEWAY_PATH"
fi

install -m 0600 /dev/null "${AUTHORIZED_KEYS_FILE}.new"
if [[ -f "$AUTHORIZED_KEYS_FILE" ]]; then
  cat "$AUTHORIZED_KEYS_FILE" > "${AUTHORIZED_KEYS_FILE}.new"
fi
key_identity="$(awk '{print $1" "$2}' <<< "$PUBLIC_KEY")"
if ! grep -Fq "$key_identity" "${AUTHORIZED_KEYS_FILE}.new"; then
  printf 'restrict,command="%s" %s\n' "$GATEWAY_PATH" "$PUBLIC_KEY" >> "${AUTHORIZED_KEYS_FILE}.new"
fi
mv "${AUTHORIZED_KEYS_FILE}.new" "$AUTHORIZED_KEYS_FILE"
chmod 700 "$(dirname "$AUTHORIZED_KEYS_FILE")"
chmod 600 "$AUTHORIZED_KEYS_FILE"

bash -n "$GATEWAY_PATH"
grep -Fq "$key_identity" "$AUTHORIZED_KEYS_FILE"
printf 'AI-02 deploy access installed. The key is restricted to deploy/status/logs.\n'
