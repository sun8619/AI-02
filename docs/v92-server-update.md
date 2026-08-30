# v92 服务器更新

应用版本：`v92-20260830`。固定代码提交：`4710916854fe2d6b78af0ff8364b6a15c034136f`。

在Ubuntu服务器终端执行以下完整代码块，不要把网址转换为Markdown链接后再粘贴。要求Node.js 20或以上。

```bash
bash <<'SH'
set -Eeuo pipefail
REV=4710916854fe2d6b78af0ff8364b6a15c034136f
TMP=$(mktemp -d /tmp/lezhi-launch.XXXXXX)
trap 'rm -rf "$TMP"' EXIT
curl -fL --retry 8 --connect-timeout 20 --max-time 300 \
  -o "$TMP/release.zip" "https://codeload.github.com/sun8619/AI-02/zip/$REV"
unzip -q "$TMP/release.zip" -d "$TMP"
bash "$TMP/AI-02-$REV/tools/update-server.sh" "$REV"
SH
```

脚本在临时目录验证文件、安装生产依赖并运行回归，成功后才备份并替换应用。保留服务器`.env`、`data/`、`uploads/`、`logs/`、`backups/`和`.git`；不修改Nginx或账号密码验证。下载/预检失败立即停止；替换后重启失败或健康接口仍是旧版本则回滚。备份路径会打印为`/root/qibu-backups/...`。

预期成功行：`Ready: v92-20260830 (...)`。未出现这行时不要反复运行`git reset --hard`或手动覆盖环境变量，保留完整错误信息定位。

更新后刷新页面，使用原账号登录。先检查：元角分默认题；立体图形四个候选；点击图示辅助再收起；打字及语音；家长筛选。无本机历史时家长页应显示无证据，而不是虚构进度。

GitHub发布、服务器成功运行目标版本、真实设备体验是三个独立验收项。
