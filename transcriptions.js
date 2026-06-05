export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = getSpeechApiKey("ASR");
  if (!apiKey) {
    response.status(200).json({
      mode: "mock",
      transcript: "",
      message: "未配置语音识别 Key，前端会回退到模拟输入。",
    });
    return;
  }

  const input = request.body || {};
  const audioData = String(input.audioData || "").trim();
  const audioUrl = String(input.audioUrl || "").trim();
  if (!audioData && !audioUrl) {
    response.status(400).json({ error: "Missing audioData or audioUrl" });
    return;
  }

  const payload = {
    user: { uid: process.env.ARK_ASR_UID || "qibu-child" },
    audio: audioUrl ? { url: audioUrl } : { data: stripDataUrl(audioData) },
    request: {
      model_name: process.env.ARK_ASR_MODEL || "bigmodel",
      enable_itn: true,
      enable_punc: true,
    },
  };

  try {
    const upstream = await fetch(process.env.ARK_ASR_URL || "https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash", {
      method: "POST",
      headers: buildSpeechHeaders("ASR", apiKey),
      body: JSON.stringify(payload),
    });

    const upstreamPayload = await upstream.json().catch(async () => ({ message: await upstream.text().catch(() => "") }));
    const statusCode = upstream.headers.get("X-Api-Status-Code");
    if (!upstream.ok || (statusCode && statusCode !== "20000000")) {
      response.status(502).json({
        error: "ASR failed",
        detail: upstream.headers.get("X-Api-Message") || summarizeUpstreamError(upstreamPayload),
        logId: upstream.headers.get("X-Tt-Logid") || "",
      });
      return;
    }

    response.status(200).json({
      mode: "ark-asr",
      transcript: upstreamPayload?.result?.text || "",
      utterances: upstreamPayload?.result?.utterances || [],
      duration: upstreamPayload?.audio_info?.duration || 0,
    });
  } catch (error) {
    response.status(500).json({ error: "ASR request failed", detail: sanitizeMessage(error) });
  }
}

function getSpeechApiKey(kind) {
  return process.env[`ARK_${kind}_API_KEY`] || process.env.ARK_SPEECH_API_KEY || process.env.ARK_API_KEY || "";
}

function buildSpeechHeaders(kind, apiKey) {
  const headers = {
    "Content-Type": "application/json",
    "X-Api-Request-Id": crypto.randomUUID(),
  };
  if (process.env[`ARK_${kind}_APP_ID`] && process.env[`ARK_${kind}_ACCESS_KEY`]) {
    headers["X-Api-App-Id"] = process.env[`ARK_${kind}_APP_ID`];
    headers["X-Api-Access-Key"] = process.env[`ARK_${kind}_ACCESS_KEY`];
  } else {
    headers["X-Api-Key"] = apiKey;
  }
  headers["X-Api-Resource-Id"] = process.env.ARK_ASR_RESOURCE_ID || "volc.bigasr.auc_turbo";
  headers["X-Api-Sequence"] = "-1";
  return headers;
}

function stripDataUrl(value) {
  const text = String(value || "");
  const index = text.indexOf(",");
  return text.startsWith("data:") && index >= 0 ? text.slice(index + 1) : text;
}

function summarizeUpstreamError(payload) {
  if (typeof payload?.error?.message === "string") return payload.error.message;
  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.error === "string") return payload.error;
  return "上游接口返回错误，请检查模型、额度、权限或请求参数。";
}

function sanitizeMessage(error) {
  return String(error?.message || error || "Unknown error").replace(/Bearer\s+[\w.-]+/g, "Bearer [hidden]");
}
