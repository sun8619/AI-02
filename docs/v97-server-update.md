# v97 服务器更新

代码已同步GitHub：`c54e75887156c65a3939d9d2f1aade688361c246`。
目标版本：`v97-20260907`。服务器需要执行下面的更新命令，GitHub同步本身不会自动部署服务器。

```bash
bash <<'SH'
set -euo pipefail
REV='c54e75887156c65a3939d9d2f1aade688361c246'
curl -fL --retry 5 --connect-timeout 20 --max-time 120 \
  "https://raw.githubusercontent.com/sun8619/AI-02/$REV/tools/update-server.sh" \
  -o /tmp/lezhi-update.sh
bash /tmp/lezhi-update.sh "$REV"
SH
```

结束时必须看到 `Ready: v97-20260907` 才算部署成功，再刷新网页。原有账号、`.env` 和持久数据保持不变。

命令较短是因为下载并运行了仓库中的更新脚本，下载、哈希校验、依赖安装、回归测试、备份、替换、重启、健康检查和失败回滚步骤仍在脚本中，并没有省略。

更新后建议检查：元角分答错时先出现一句具体讲解，讲完后进入新检查题；可点“我来试试”跳过剩余讲解；打字不会因画面刷新丢字；有选项的图形题支持直接点击图片。

复核结论与剩余验收：[v97-report-review.md](v97-report-review.md)。真实儿童语音、弱网和学习效果仍需上线验收。
