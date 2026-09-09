# v98 服务器更新

代码已同步GitHub。固定代码提交：`7b63f7a6e198ad25697ac796565e83b24173af6c`。
目标版本：`v98-20260909`。

在服务器终端执行以下完整代码块，不需要再手动reset工作区：

```bash
bash <<'SH'
set -euo pipefail
REV='7b63f7a6e198ad25697ac796565e83b24173af6c'
curl -fL --retry 5 --connect-timeout 20 --max-time 120 \
  "https://raw.githubusercontent.com/sun8619/AI-02/$REV/tools/update-server.sh" \
  -o /tmp/lezhi-update.sh
bash /tmp/lezhi-update.sh "$REV"
SH
```

脚本会在临时目录验证62个发布文件、安装依赖并运行回归，成功后备份、更新、重启并等待健康检查；失败会恢复备份。保留`.env`、数据目录和现有nginx登录账号。测试可能需要等待一段时间，不能仅看到一条PASS就退出终端。

最后必须看到：

```text
Ready: v98-20260909 (7b63f7a6e198ad25697ac796565e83b24173af6c). Refresh the website.
```

再刷新网页。未出现Ready、出现报错或回滚提示，说明不能认定更新成功；保留终端输出定位，不继续执行强制覆盖命令。

本轮已验证的是本地代码与受控浏览器；本次没有通过SSH替用户部署生产服务器。真实儿童语音、真机键盘和学习效果仍需上线验证。详细修复范围见`v98-report-review.md`。
