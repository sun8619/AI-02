# v96 发布与服务器更新

- 发布版本：`v96-20260901`
- 已推送 GitHub 的代码提交：`d6502d62e1826133427bf140e51a3a9a0aadd452`
- GitHub 代码：https://github.com/sun8619/AI-02/commit/d6502d62e1826133427bf140e51a3a9a0aadd452
- 本轮已完成报告核对、同类问题修复、全量静态回归、浏览器验收和发布校验。

在服务器终端执行以下完整代码。脚本按固定提交更新，不依赖服务器工作区是否存在本地修改。

```bash
bash <<'SH'
set -euo pipefail
REV='d6502d62e1826133427bf140e51a3a9a0aadd452'
curl -fL --retry 5 --connect-timeout 20 --max-time 120 \
  "https://raw.githubusercontent.com/sun8619/AI-02/$REV/tools/update-server.sh" \
  -o /tmp/lezhi-update.sh
bash /tmp/lezhi-update.sh "$REV"
SH
```

脚本要求 Node.js 20 及以上，会下载并校验 58 个发布文件，运行完整测试后再切换和重启。它会保留 `.env`、`.git`、`data/`、`uploads/`、`logs/`、`backups/`，失败时停止或回滚。

成功时末尾应出现 `Ready: v96-20260901`。随后刷新网页并抽测：

1. 学习未结束时打开家长页，今日时长不再显示为 0。
2. 家长页显示今日目标、7/30 天汇总、42 个知识点状态、语音次数和平均有效回答时间。
3. 连续说“我太笨了”“我生气了”时，老师先接住情绪，不计错，并提供简单一点或休息。
4. 连续答对后难度只逐级提高；答错或求助时只逐级降低，不会跨级跳变。
5. 用真实儿童语音、弱网和麦克风拒绝权限各抽测一次；这三项仍需真机人工验证。

详细核对见 `docs/v96-online-acceptance-review.md`。
