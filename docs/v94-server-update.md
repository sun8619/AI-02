# v94 服务器更新

固定代码提交：`24050532ace0a263e923c813bdaf43e3132fe648`

版本：`v94-20260831`

本版修复多答案题的卡关：孩子可以完整作答，也可以分次补答。覆盖全库57道同类题，不把只答一部分算成整题掌握。详细检查见 `docs/v94-verification-report.md`。

## 已安装 v91 或更新版本

在服务器终端执行：

```bash
cd /opt/qibu-ai
bash tools/update-server.sh 24050532ace0a263e923c813bdaf43e3132fe648
```

## 没有更新脚本时

执行下面这一整段，下载同一固定版本中的更新脚本。需要 Node.js 20 或更新版本。

```bash
bash <<'SH'
set -Eeuo pipefail
REV=24050532ace0a263e923c813bdaf43e3132fe648
TMP=$(mktemp -d /tmp/lezhi-launch.XXXXXX)
trap 'rm -rf "$TMP"' EXIT
curl -fL --retry 8 --connect-timeout 20 --max-time 300 \
  -o "$TMP/release.zip" \
  "https://codeload.github.com/sun8619/AI-02/zip/$REV"
unzip -q "$TMP/release.zip" -d "$TMP"
bash "$TMP/AI-02-$REV/tools/update-server.sh" "$REV"
SH
```

只有看到 `Ready: v94-20260831` 才表示新版就绪。刷新网页后再测试，不要把刚重启时尚未响应当作更新失败。

脚本先核验文件并运行回归，再备份和切换；预检失败不覆盖当前站点，切换后启动失败会回滚。保留 `.env`、`.git`、`data/`、`uploads/`、`logs/`、`backups/`，不改 Nginx 和账号密码。备份在 `/root/qibu-backups/`。

## 上线验收

1. 默认进入元角分换算，正常答题到“1元等于多少角，又等于多少分”。
2. 先说“100分”，老师应接着问“1元是几角”，原题仍在屏幕上。
3. 再说“十角”，这道题应通过，不再循环重复。
4. 一次说“一元等于十角等于一百分”也可以；换成错误的数值或单位不能通过。
5. 用真实麦克风测试。工程回归包含语音文本路由，不等同于儿童录音识别率或线上语音服务可用性验收。
