export default function handler(request, response) {
  const tutorModel = process.env.ARK_TUTOR_MODEL || process.env.ARK_TEXT_MODEL || "";
  const reasoningModel = process.env.ARK_REASONING_MODEL || tutorModel;
  const evaluationModel = process.env.ARK_EVALUATION_MODEL || reasoningModel;
  const summaryModel = process.env.ARK_SUMMARY_MODEL || tutorModel;

  response.status(200).json({
    arkBaseUrl: process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
    modelRoles: {
      tutor: tutorModel,
      reasoning: reasoningModel,
      evaluation: evaluationModel,
      summary: summaryModel,
      asr: process.env.ARK_ASR_MODEL || "bigmodel",
      tts: process.env.ARK_TTS_RESOURCE_ID || "seed-tts-2.0",
      image: process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-260128",
    },
    voice: {
      asrResourceId: process.env.ARK_ASR_RESOURCE_ID || "volc.bigasr.auc_turbo",
      ttsResourceId: process.env.ARK_TTS_RESOURCE_ID || "seed-tts-2.0",
      ttsSpeaker: process.env.ARK_TTS_SPEAKER || "zh_female_vv_uranus_bigtts",
    },
    configured: {
      arkApiKey: Boolean(process.env.ARK_API_KEY),
      speechApiKey: Boolean(process.env.ARK_SPEECH_API_KEY || process.env.ARK_ASR_API_KEY || process.env.ARK_TTS_API_KEY || process.env.ARK_API_KEY),
      tutor: Boolean(tutorModel),
      reasoning: Boolean(reasoningModel),
      evaluation: Boolean(evaluationModel),
      asr: Boolean(process.env.ARK_ASR_API_KEY || process.env.ARK_SPEECH_API_KEY || process.env.ARK_API_KEY),
      tts: Boolean(process.env.ARK_TTS_API_KEY || process.env.ARK_SPEECH_API_KEY || process.env.ARK_API_KEY),
      image: Boolean(process.env.ARK_IMAGE_MODEL && process.env.ARK_API_KEY),
    },
  });
}
