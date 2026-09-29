#!/usr/bin/env bash
set -Eeuo pipefail
REV="${1:?Pass the full GitHub commit SHA}"
[[ "$REV" =~ ^[a-f0-9]{40}$ ]] || { echo "Invalid commit SHA"; exit 1; }
APP=/opt/qibu-ai
GATEWAY_PATH="${AI02_GATEWAY_INSTALL_PATH:-/usr/local/sbin/ai02-deploy-gateway}"
for command in curl unzip rsync node npm systemctl install nginx; do command -v "$command" >/dev/null; done
node -e 'if(Number(process.versions.node.split(".")[0])<20)process.exit(1)'
test -d "$APP"
TMP=$(mktemp -d /tmp/lezhi-update.XXXXXX)
BACKUP="/root/qibu-backups/$(date +%Y%m%d-%H%M%S)-$$"
NGINX_BACKUP="$BACKUP/nginx"
NGINX_SWITCHED=0
switched=0
finished=0
cleanup() {
  status=$?
  trap - EXIT
  if [ "$switched" -eq 1 ] && [ "$finished" -eq 0 ]; then
    echo "Update failed. Restoring $BACKUP/app"
    if [ "$NGINX_SWITCHED" -eq 1 ]; then
      node "$SOURCE/tools/enable-account-access.mjs" rollback "$NGINX_BACKUP" || true
      nginx -t && systemctl reload nginx || true
    fi
    rsync -ac --delete --exclude='.env' --exclude='.git' --exclude='data/' --exclude='uploads/' --exclude='logs/' --exclude='backups/' "$BACKUP/app/" "$APP/" || true
    systemctl restart qibu-ai || true
    status=1
  fi
  rm -rf "$TMP"
  exit "$status"
}
trap cleanup EXIT
curl -fL --retry 8 --connect-timeout 20 --max-time 300 \
  -o "$TMP/release.zip" "https://codeload.github.com/sun8619/AI-02/zip/$REV"
unzip -q "$TMP/release.zip" -d "$TMP"
SOURCE="$TMP/AI-02-$REV"
test -f "$SOURCE/release.json"
(
  cd "$SOURCE"
  node tools/release.mjs verify
  node --check app.js
  node --check server.mjs
  npm ci --omit=dev
  npm test
  npm run test:account
  npm run test:security
  npm run test:performance
)
EXPECTED=$(node -p "JSON.parse(require('fs').readFileSync('$SOURCE/release.json','utf8')).id")
umask 077
mkdir -p "$BACKUP/app"
chmod 700 "$BACKUP"
rsync -a --exclude='.git' "$APP/" "$BACKUP/app/"
echo "Backup: $BACKUP"
switched=1
rsync -ac --delete --exclude='.env' --exclude='.git' --exclude='data/' --exclude='uploads/' --exclude='logs/' --exclude='backups/' \
  "$SOURCE/" "$APP/"
[ ! -f "$APP/.env" ] || chmod 600 "$APP/.env"
node "$APP/tools/release.mjs" verify
systemctl restart qibu-ai
for i in {1..30}; do
  if curl -fsS --max-time 2 http://127.0.0.1:4173/api/health 2>/dev/null |
    node -e 'let s="";process.stdin.on("data",x=>s+=x);process.stdin.on("end",()=>{try{const r=JSON.parse(s);process.exit(r.ok&&r.release===process.argv[1]?0:1)}catch{process.exit(1)}})' "$EXPECTED"; then
    NGINX_SWITCHED=1
    node "$APP/tools/enable-account-access.mjs" apply "$NGINX_BACKUP"
    nginx -t
    systemctl reload nginx
    ACCOUNT_READY=0
    for i in {1..30}; do
      if curl -fsS --max-time 5 --resolve sunlezhi.top:443:127.0.0.1 https://sunlezhi.top/api/auth/session 2>/dev/null |
        node -e 'let s="";process.stdin.on("data",x=>s+=x);process.stdin.on("end",()=>{try{const r=JSON.parse(s);process.exit(r.authenticated===false?0:1)}catch{process.exit(1)}})'; then
        ACCOUNT_READY=1
        break
      fi
      sleep 1
    done
    [ "$ACCOUNT_READY" -eq 1 ] || { echo "Account entry did not become reachable through local Nginx."; exit 1; }
    PUBLIC_READY=0
    for i in {1..30}; do
      if curl -fsS --max-time 5 https://sunlezhi.top/api/auth/session 2>/dev/null |
        node -e 'let s="";process.stdin.on("data",x=>s+=x);process.stdin.on("end",()=>{try{const r=JSON.parse(s);process.exit(r.authenticated===false?0:1)}catch{process.exit(1)}})'; then
        PUBLIC_READY=1
        break
      fi
      sleep 1
    done
    [ "$PUBLIC_READY" -eq 1 ] || { echo "Account entry did not become reachable through the public domain."; exit 1; }
    finished=1
    install -m 0755 "$APP/tools/server-deploy-gateway.sh" "$GATEWAY_PATH"
    echo "Ready: $EXPECTED ($REV). Account registration is public."
    exit 0
  fi
  sleep 1
done
echo "New release did not become healthy; rolling back."
exit 1
