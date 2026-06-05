export default function handler(request, response) {
  const config = getPublicModelConfig();
  response.status(200).json({
    ok: true,
    app: "qibu-ai-learning-companion",
    platform: "vercel",
    ...config,
    hasApiKey: Boolean(process.env.ARK_API_KEY),
  });
}

function getPublicModelConfig() {
  const tutorModel = process.env.ARK_TUTOR_MODEL || process.env.ARK_TEXT_MODEL || "";
  const reasoningModel = process.env.ARK_REASONING_MODEL || tutorModel;
  const evaluationModel = process.env.ARK_EVALUATION_MODEL || reasoningModel;
  return {
    arkBaseUrl: process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
    modelRoles: {
      tutor: tutorModel,
      reasoning: reasoningModel,
      evaluation: evaluationModel,
      summary: process.env.ARK_SUMMARY_MODEL || tutorModel,
      asr: process.env.ARK_ASR_MODEL || "bigmodel",
      tts: process.env.ARK_TTS_RESOURCE_ID || "seed-tts-2.0",
      image: process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-260128",
    },
    configured: {
      tutor: Boolean(tutorModel),
      reasoning: Boolean(reasoningModel),
      evaluation: Boolean(evaluationModel),
      asr: Boolean(process.env.ARK_ASR_API_KEY || process.env.ARK_SPEECH_API_KEY || process.env.ARK_API_KEY),
      tts: Boolean(process.env.ARK_TTS_API_KEY || process.env.ARK_SPEECH_API_KEY || process.env.ARK_API_KEY),
      image: Boolean(process.env.ARK_IMAGE_MODEL && process.env.ARK_API_KEY),
    },
  };
}
