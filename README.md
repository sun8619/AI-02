# 乐之老师

低年级孩子用的 AI 语音陪练原型。当前版本包含：

- 孩子端平板横屏学习页
- 人教版一年级、二年级数学知识图谱
- 分步脚手架提示
- “讲给老师听”的复述环节
- 换讲法与程序精准绘图
- 说“换知识点”“想学人民币换算”等自然表达后自动切换题目、步骤和右侧图示
- Ark 图片生成入口
- 家长进展页

## 课程设计

当前内置一年级上册、一年级下册、二年级上册、二年级下册的数学知识点骨架。每个知识点包含：

- 学段、单元、课题和知识点名称
- 一个低门槛样题
- 3 个小台阶
- 前置知识
- 常见卡点
- 适合的程序图类型
- 费曼复述提示
- 生活类比图生成提示

教材内容只按知识点和能力目标对齐，不复制教材原文和插图。真实讲解由大模型结合这些结构生成，原则是：先补前置知识，每次只推进一个小台阶；答对后让孩子讲给老师听；讲不清时换画图、生活类比、举例或更小步骤。

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
npm run audit:teaching
npm run audit:scenarios
npm run audit:paths
npm run audit:page
```

- `audit:teaching` 检查 42 个知识点的讲法、变式、说理和费曼复述配置是否完整。
- `audit:scenarios` 检查答对、答错、不会、跑题、变式、讲给老师听六类场景。
- `audit:paths` 模拟真实孩子路径，确认每个知识点不会因为空白、跑题、短答案、敷衍复述而误推进。
- `audit:page` 从页面体验角度检查老师回复是否明确告诉孩子“现在答什么”、图示是否跟当前小台阶同步、是否疑似提前泄露答案、同一路径是否过于机械重复。

## Railway 环境变量

如果用 Railway，在 Railway 的 Variables 里添加：

```text
ARK_API_KEY=你的火山 Ark API Key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_TEXT_MODEL=默认文本模型或接入点 ID
ARK_TUTOR_MODEL=讲解回复模型或接入点 ID
ARK_REASONING_MODEL=思考/拆知识点模型或接入点 ID
ARK_EVALUATION_MODEL=复述评估模型或接入点 ID
ARK_SUMMARY_MODEL=总结模型或接入点 ID
ARK_SPEECH_API_KEY=火山语音服务 API Key，新版控制台用这个
ARK_SPEECH_APP_ID=火山语音 APP ID，旧版控制台用这个
ARK_SPEECH_ACCESS_KEY=火山语音 Access Token，旧版控制台用这个
ARK_ASR_MODEL=bigmodel
ARK_ASR_RESOURCE_ID=volc.bigasr.auc_turbo
ARK_TTS_RESOURCE_ID=seed-tts-2.0
ARK_TTS_SPEAKER=zh_female_vv_uranus_bigtts
ARK_IMAGE_MODEL=doubao-seedream-5-0-260128
```

模型分工：

- `ARK_REASONING_MODEL`：思考、拆知识点、判断下一步。
- `ARK_TUTOR_MODEL`：生成给孩子听的讲解。
- `ARK_EVALUATION_MODEL`：判断孩子“讲给老师听”是否讲明白。
- `ARK_SUMMARY_MODEL`：生成家长总结。
- `ARK_ASR_MODEL` / `ARK_ASR_RESOURCE_ID`：把孩子语音转成文字。
- `ARK_TTS_RESOURCE_ID` / `ARK_TTS_SPEAKER`：把 AI 回复合成语音。
- `ARK_IMAGE_MODEL`：生成生活类比图。

语音输入优先级：

1. 短录音上传到火山 ASR，松开按钮后识别。
2. 模拟回答，接口、权限或网络失败时兜底。

浏览器自带实时语音识别默认关闭，因为在部分环境里会明显卡顿。

语音输出优先级：

1. 火山 TTS，只朗读老师对孩子说的话，不朗读内部判断和上下文。
2. 浏览器自带朗读，TTS 没配好时兜底。

语音自然度主要取决于 `ARK_TTS_SPEAKER` 对应的音色。代码会把数学符号改成口语读法，并使用稍慢语速；如果仍然机械，优先在火山里换一个更自然的 SeedTTS 音色，再把新的音色 ID 填到 Railway Variables。

如果火山页面给你的是 APP ID、Access Token、Secret Key 三个值：

- APP ID 填到 `ARK_SPEECH_APP_ID`
- Access Token 填到 `ARK_SPEECH_ACCESS_KEY`
- Secret Key 先不要填，本项目当前语音接口不用它
- `ARK_SPEECH_API_KEY` 可以留空；如果你已经有新版 API Key，也可以只填 `ARK_SPEECH_API_KEY`

如果你不知道怎么选，最简单是先把 `ARK_TEXT_MODEL`、`ARK_TUTOR_MODEL`、`ARK_REASONING_MODEL`、`ARK_EVALUATION_MODEL`、`ARK_SUMMARY_MODEL` 都填成同一个 Ark 文本模型/接入点 ID，先跑通；以后再拆成不同模型。

`ARK_TEXT_MODEL` 是默认兜底。
`ARK_IMAGE_MODEL` 用于“AI 画生活例子”的图片生成。

后续接入真实语音时再添加：

```text
ARK_TEXT_MODEL=你的文本模型名
ARK_ASR_MODEL=你的语音识别模型名
ARK_TTS_MODEL=你的语音合成模型名
ARK_TTS_SPEECH_RATE=-4
ARK_TTS_LOUDNESS_RATE=2
ARK_TTS_STYLE=请用温和、自然、像真人老师一样的语气说给低年级孩子听。
```

Railway 会自动提供 `PORT`，不要手动设置 `PORT`。

## 更简单的 Vercel 部署

如果 Railway 构建失败，可以改用 Vercel：

1. 把本项目上传到 GitHub。
2. 打开 Vercel，选择 Add New Project。
3. Import 刚才的 GitHub 仓库。
4. Framework Preset 选择 Other。
5. Environment Variables 添加：

```text
ARK_API_KEY=你的火山 Ark API Key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_TEXT_MODEL=你在火山 Ark 里选择的文本模型或接入点 ID
ARK_IMAGE_MODEL=doubao-seedream-5-0-260128
```

6. 点击 Deploy。

Vercel 不需要配置端口，也不需要 Docker。
