# 启步学伴

低年级孩子用的 AI 语音陪练原型。当前版本包含：

- 孩子端平板横屏学习页
- 人教版知识点拆分示例
- 分步脚手架提示
- “讲给 AI 听”的复述环节
- 换讲法与精准分数图
- Ark 图片生成入口
- 家长进展页

## 本地运行

```bash
npm start
```

打开：

```text
http://127.0.0.1:4173
```

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
ARK_SPEECH_API_KEY=火山语音服务 API Key，如果和 Ark Key 相同可不填
ARK_ASR_MODEL=bigmodel
ARK_ASR_RESOURCE_ID=volc.bigasr.auc_turbo
ARK_TTS_RESOURCE_ID=seed-tts-2.0
ARK_TTS_SPEAKER=zh_female_vv_uranus_bigtts
ARK_IMAGE_MODEL=doubao-seedream-5-0-260128
```

模型分工：

- `ARK_REASONING_MODEL`：思考、拆知识点、判断下一步。
- `ARK_TUTOR_MODEL`：生成给孩子听的讲解。
- `ARK_EVALUATION_MODEL`：判断孩子“讲给 AI 听”是否讲明白。
- `ARK_SUMMARY_MODEL`：生成家长总结。
- `ARK_ASR_MODEL` / `ARK_ASR_RESOURCE_ID`：把孩子语音转成文字。
- `ARK_TTS_RESOURCE_ID` / `ARK_TTS_SPEAKER`：把 AI 回复合成语音。
- `ARK_IMAGE_MODEL`：生成生活类比图。

如果你不知道怎么选，最简单是先把 `ARK_TEXT_MODEL`、`ARK_TUTOR_MODEL`、`ARK_REASONING_MODEL`、`ARK_EVALUATION_MODEL`、`ARK_SUMMARY_MODEL` 都填成同一个 Ark 文本模型/接入点 ID，先跑通；以后再拆成不同模型。

`ARK_TEXT_MODEL` 是默认兜底。
`ARK_IMAGE_MODEL` 用于“AI 画生活例子”的图片生成。

后续接入真实语音时再添加：

```text
ARK_TEXT_MODEL=你的文本模型名
ARK_ASR_MODEL=你的语音识别模型名
ARK_TTS_MODEL=你的语音合成模型名
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
