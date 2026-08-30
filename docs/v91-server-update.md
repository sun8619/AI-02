# v91 服务器更新

代码已发布，服务器不会随GitHub自动升级。下面固定到已验证的代码提交，不执行 `git reset --hard`。需要root权限、Node20或以上，以及curl、unzip、rsync、npm、systemctl。无需另填GitHub令牌或重配语音密钥。

```bash
bash <<'SH'
set -Eeuo pipefail
REV=47c55b3a876fe41e4bae7694fa037fa0a9906905
TMP=$(mktemp -d /tmp/lezhi-launch.XXXXXX)
trap 'rm -rf "$TMP"' EXIT
curl -fL --retry 8 --connect-timeout 20 --max-time 300 \
  -o "$TMP/release.zip" "https://codeload.github.com/sun8619/AI-02/zip/$REV"
unzip -q "$TMP/release.zip" -d "$TMP"
bash "$TMP/AI-02-$REV/tools/update-server.sh" "$REV"
SH
```

成功标志：`Ready: v91-20260830`。脚本会再次下载并验证固定提交的完整发布包，在覆盖前备份；故障时停止，覆盖后的故障会尝试自动回滚。不需要立即手动再重启服务。

- `.env`和现有Nginx账号密码验证不变。
- `data/`、`uploads/`、`logs/`、`backups/`和`.git`保留。
- 备份保存在`/root/qibu-backups/`，包含服务器原有应用文件；不要公开上传备份。
- 更新期间会短暂停服。健康检查等待新服务启动，且检查版本，而不是一重启就马上curl然后误报失败。
- 若失败，请保留错误输出排查，不要继续执行旧的覆盖/重置命令。

部署成功后仍要在真实域名检查：默认元角分、整题答对前进、答错讲解再试、换知识点清上下文、连续求助不叠音，以及手机麦克风。当前确认的是代码和自动回归，不是已经替用户完成服务器部署。
