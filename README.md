# 乐之老师

低年级孩子用的 AI 语音陪练原型。当前验收以 [v92 整改记录](docs/v92-verification-report.md) 为准，代码回归不代表已完成真实儿童试用。当前版本包含：

- 手机、平板、电脑学习页
- 人教版一年级、二年级数学知识图谱
- 分步脚手架提示
- 整题先试，答错才讲解，再用独立题检查；不要求精准复述
- 换讲法与程序精准绘图
- 说“换知识点”“想学人民币换算”等自然表达后自动切换题目、步骤和右侧图示
- Ark 图片生成入口
- 受家长PIN保护的进展页、本机学习时间线与隔日复测记录
- 静态文件白名单、接口限流、WebSocket来源校验、上游超时和结构化请求日志
- WebP教师形象、gzip传输与版本化静态缓存

## 课程设计

当前内置一年级上册、一年级下册、二年级上册、二年级下册的数学知识点骨架。每个知识点包含：

- 学段、单元、课题和知识点名称
- 一个低门槛样题
- 根据当前题目生成的答错补救小步
- 前置知识
- 常见卡点
- 适合的程序图类型
- 老师归纳方法和独立练习
- 生活类比图生成提示

教材内容按知识点和能力目标对齐，不复制教材原文和插图。当前孩子流程以绑定题目的受约束讲法和判题规则为主。先试整题，答错后只讲当前缺口并给近似题；得到帮助的题不计入独立掌握证据。不把规则执行成功宣称为真人教师级教学效果。

## 本地运行

```bash
npm start
```

打开：

```text
http://127.0.0.1:4173
```

## 上线前教学体检

```bash
npm ci
npm test
npm run test:security
npx playwright install chromium
npm run test:browser
npm run audit:human
node tools/release.mjs verify
node tools/deploy-regression-audit.mjs
```

浏览器回归逐项点击所有选项，检查实际图示、10种视口及家长筛选。不会调用付费合成或上传录音；模拟记录测试后清除。GitHub CI 自动执行并保存截图。

以下旧配置体检只能辅助定位，不代替首页实际运行验收：

```bash
npm run audit:teaching
npm run audit:scenarios
npm run audit:paths
npm run audit:page
```

- `audit:teaching` 检查 42 个知识点的讲法、变式、说理和费曼复述配置是否完整。
- `audit:scenarios` 检查答对、答错、不会、跑题、变式、讲给老师听六类场景。
- `audit:paths` 模拟真实孩子路径，确认每个知识点不会因为空白、跑题、短答案、敷衍复述而误推进。
- `audit:page` 从页面体验角度检查老师回复是否明确告诉孩子“现在答什么”、图示是否跟当前小台阶同步、是否疑似提前泄露答案、同一路径是否过于机械重复。


## 公开儿童服务验收

当前受密码保护的生产环境可用于内部预览。转为公开儿童服务前，必须把匿名真实数据填写到 `docs/acceptance/` 的四份CSV，并执行：

```bash
npm run audit:public-ready
```

该门禁要求完成462题教师签审、至少100条真实童声、iOS Safari/Android Chrome/微信内浏览器真机测试，以及至少10名儿童的即时、隔日和7日保持实验。自动测试不会伪装成这些真人证据。详细口径见 `docs/acceptance/README.md`。

## 本地接管与生产发布

生产代码目录固定为 `/opt/qibu-ai`，systemd 服务固定为 `qibu-ai`。同一台服务器上的 `/opt/executive-assistant-native`（“靠谱”）不在本项目发布脚本的操作范围内。

首次接管只需在服务器执行一次部署访问安装。它会给指定 SSH 公钥添加强制命令，只允许：

- `deploy <full-commit-sha>`：部署指定提交；
- `status`：查看 `qibu-ai` 状态与健康接口；
- `logs [1-500]`：查看 `qibu-ai` 日志。

本地发布命令：

```bash
npm run release:check
npm run deploy -- "本次更新说明"
npm run deploy:status
npm run deploy:logs -- 100
```

`npm run deploy` 会顺序执行：安装锁定依赖、全量代码回归、浏览器回归、部署回滚演练、生成不可变发布清单、提交并推送 GitHub、通过专用 SSH 命令部署、检查 systemd 与健康接口。服务器更新会保留 `.env`、`data/`、`uploads/`、`logs/` 和 `backups/`；新版本不健康时自动恢复上一版本。

默认 SSH 目标是 `ai02-prod`，可用 `AI02_SSH_TARGET` 覆盖。若有公网健康地址，可设置 `AI02_PUBLIC_HEALTH_URL`，发布完成后再做一次公网检查。密钥和服务器凭据不得提交到仓库。

## 生产环境变量

当前唯一支持的生产方式是 Ubuntu 22.04 + systemd `qibu-ai`，配置保存在服务器 `/opt/qibu-ai/.env`，由受限发布链路保留。至少需要文本模型、ASR、TTS和图片模型对应凭据；不得将任何密钥提交到仓库。

常用运行参数包括接口限流倍率、文本/图片/ASR超时、实时语音累计字节与连接时长、允许的WebSocket Origin。未配置时使用代码中的保守默认值。
