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

在 Railway 的 Variables 里添加：

```text
ARK_API_KEY=你的火山 Ark API Key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_TEXT_MODEL=你在火山 Ark 里选择的文本模型或接入点 ID
ARK_IMAGE_MODEL=doubao-seedream-5-0-260128
```

`ARK_TEXT_MODEL` 用于真实文字理解、换讲法和“讲给 AI 听”的评估。
`ARK_IMAGE_MODEL` 用于“AI 画生活例子”的图片生成。

后续接入真实语音时再添加：

```text
ARK_TEXT_MODEL=你的文本模型名
ARK_ASR_MODEL=你的语音识别模型名
ARK_TTS_MODEL=你的语音合成模型名
```

Railway 会自动提供 `PORT`，不要手动设置 `PORT`。
