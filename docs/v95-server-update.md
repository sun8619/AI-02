# v95 发布与服务器更新

- 发布版本：`v95-20260901`
- 已推送GitHub的代码提交：`db0c75fdb61b48e8ace765794abbd5d0e84c30cb`
- GitHub代码：https://github.com/sun8619/AI-02/commit/db0c75fdb61b48e8ace765794abbd5d0e84c30cb
- 本轮工程清单9/9完成；尚未代替用户执行线上部署或真实儿童录音测试。
- 本地预览：http://127.0.0.1:4188/

在服务器终端执行以下完整代码。按固定提交更新，不依赖服务器当前Git是否有未提交修改。

```bash
bash <<'SH'
set -euo pipefail
REV='db0c75fdb61b48e8ace765794abbd5d0e84c30cb'
curl -fL --retry 5 --connect-timeout 20 --max-time 120 \
  "https://raw.githubusercontent.com/sun8619/AI-02/$REV/tools/update-server.sh" \
  -o /tmp/lezhi-update.sh
bash /tmp/lezhi-update.sh "$REV"
SH
```

脚本要求Node.js 20及以上，会先下载、校验56个文件并运行完整测试，再备份旧版、切换并重启。保留 `.env`、`.git`、`data/`、`uploads/`、`logs/`、`backups/`；失败会在切换前停止，或在切换后回滚。

成功时末尾应出现 `Ready: v95-20260901`，再刷新网页。下载失败不需要重复覆盖代码，也不要执行 `git reset --hard`。

## 更新后抽测

1. 默认进入元角分，先整题；说不会后应讲清当前这一点并给检查题。
2. 在购物题中检查1元3角的讲法：1元换成10角，还要加回3角，不能漏掉零钱。
3. 说“我累了”，确认暂停；说“我准备好了”恢复。连续求助结束后恢复会换一道整题，不返回卡死的状态。
4. 说“太无聊了”，确认可选择换题或休息；不计错，不误判掌握。
5. 检查图形规律、破十减和角的分类，确认讲法与图、检查题属于同一小技能。
6. 用真实语音回答，观察识别和打断播放。自动化测试没有替代这项验证。

详细覆盖与限制见 `docs/v95-verification-report.md`。
