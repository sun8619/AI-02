# v93 服务器更新

版本：`v93-20260831`

固定代码提交：`3cfeea9e41077814d03a101e61051d0a29ca6191`

## 本次变更

- 语音与键盘共用回答分类；答非所问、没有说完不再记为数学错误，也不推进题目。
- 补齐 6 道角、7 道观察物体题的选项图，修正对应讲解图。
- 加强钟表、尺子、统计与排列的图示提示，保留当前题目的原始图表信息。
- 修复手机选项图和文字裁切、知识点选择器小字，以及短时学习记录显示为 0 分钟的问题。

## 更新命令

在服务器终端执行以下完整代码。需要 Node.js 20 或更新版本。

```bash
bash <<'SH'
set -Eeuo pipefail
REV=3cfeea9e41077814d03a101e61051d0a29ca6191
TMP=$(mktemp -d /tmp/lezhi-launch.XXXXXX)
trap 'rm -rf "$TMP"' EXIT
curl -fL --retry 8 --connect-timeout 20 --max-time 300 \
  -o "$TMP/release.zip" \
  "https://codeload.github.com/sun8619/AI-02/zip/$REV"
unzip -q "$TMP/release.zip" -d "$TMP"
bash "$TMP/AI-02-$REV/tools/update-server.sh" "$REV"
SH
```

只有看到 `Ready: v93-20260831` 才代表本次版本就绪，然后刷新网页。

脚本先核验发布文件并运行测试，再备份与切换；下载或预检失败不会覆盖正在运行的网站，切换失败会回滚。保留 `.env`、`.git`、`data/`、`uploads/`、`logs/`、`backups/`，不修改 Nginx 或账号密码验证。备份位置在 `/root/qibu-backups/`，本机浏览器的学习记录不受这次服务器更新影响。

## 更新后人工验收

1. 默认进入元角分换算；随口说或输入与数学无关的话，原题和小步不变，不进入答错讲解。
2. 给出明确的错误数学答案，仍会有针对性讲解；正确答案能继续。
3. 进入角和观察物体，手机上三个选项的图与标签都能看见，提示图与当前题一致。
4. 用真实麦克风验证新输入能中断旧语音；检查手机权限、切换后台和弱网恢复。
5. 家长查看短时学习记录与跨日复测记录，不能把一次通过当作长期掌握。

自动回归覆盖范围和仍需人工验证的边界见 `docs/v93-verification-report.md`。
