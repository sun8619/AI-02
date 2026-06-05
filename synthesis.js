export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = getSpeechApiKey("TTS");
  if (!apiKey) {
    response.status(200).json({
      mode: "browser-fallback",
      message: "未配置语音合成 Key，前端会回退到浏览器朗读。",
    });
    return;
  }

  const text = naturalizeSpeechText(String((request.body || {}).text || "").trim());
  if (!text) {
    response.status(400).json({ error: "Missing text" });
    return;
  }

  const format = process.env.ARK_TTS_FORMAT || "mp3";
  const payload = {
    user: { uid: process.env.ARK_TTS_UID || "qibu-child" },
    req_params: {
      text: text.slice(0, 500),
      speaker: process.env.ARK_TTS_SPEAKER || "zh_female_vv_uranus_bigtts",
      audio_params: {
        format,
        sample_rate: Number(process.env.ARK_TTS_SAMPLE_RATE || 24000),
        speech_rate: Number(process.env.ARK_TTS_SPEECH_RATE || -4),
        loudness_rate: Number(process.env.ARK_TTS_LOUDNESS_RATE || 2),
      },
      additions: JSON.stringify({
        explicit_language: "zh",
        disable_markdown_filter: true,
        disable_emoji_filter: true,
        context_texts: [
          process.env.ARK_TTS_STYLE ||
            "你是一位低年级孩子的陪练老师。请像真人老师一样自然说话，语速稍慢，停顿清楚，语气温和，不要播音腔，不要读得像说明书。",
        ],
      }),
    },
  };

  try {
    const upstream = await fetch(process.env.ARK_TTS_URL || "https://openspeech.bytedance.com/api/v3/tts/unidirectional", {
      method: "POST",
      headers: buildSpeechHeaders("TTS", apiKey),
      body: JSON.stringify(payload),
    });
    const raw = await upstream.text();
    if (!upstream.ok) {
      response.status(502).json({
        error: "TTS failed",
        detail: raw.slice(0, 500),
        logId: upstream.headers.get("X-Tt-Logid") || "",
      });
      return;
    }
    const chunks = parseConcatenatedJson(raw).map((item) => item?.data).filter(Boolean);
    if (!chunks.length) {
      response.status(502).json({
        error: "TTS returned no audio",
        detail: raw.slice(0, 500),
        logId: upstream.headers.get("X-Tt-Logid") || "",
      });
      return;
    }
    response.status(200).json({
      mode: "ark-tts",
      format,
      audioBase64: chunks.join(""),
      audioDataUrl: `data:audio/${format};base64,${chunks.join("")}`,
      logId: upstream.headers.get("X-Tt-Logid") || "",
    });
  } catch (error) {
    response.status(500).json({ error: "TTS request failed", detail: sanitizeMessage(error) });
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
  headers["X-Api-Resource-Id"] = process.env.ARK_TTS_RESOURCE_ID || "seed-tts-2.0";
  headers["X-Api-App-Key"] = process.env.ARK_TTS_APP_KEY || "aGjiRDfUWi";
  headers.Connection = "keep-alive";
  return headers;
}

function parseConcatenatedJson(raw) {
  const items = [];
  let index = 0;
  const text = String(raw || "");
  while (index < text.length) {
    while (/\s/.test(text[index] || "")) index += 1;
    if (index >= text.length) break;
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;
    for (let i = index; i < text.length; i += 1) {
      const char = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') inString = true;
      else if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end < 0) break;
    try {
      items.push(JSON.parse(text.slice(index, end)));
    } catch {
      break;
    }
    index = end;
  }
  return items;
}

function sanitizeMessage(error) {
  return String(error?.message || error || "Unknown error").replace(/Bearer\s+[\w.-]+/g, "Bearer [hidden]");
}

function naturalizeSpeechText(text) {
  return String(text || "")
    .replace(/2\/3/g, "三分之二")
    .replace(/3\/4/g, "四分之三")
    .replace(/8\/12/g, "十二分之八")
    .replace(/9\/12/g, "十二分之九")
    .replace(/3:20/g, "三点二十")
    .replace(/3:45/g, "三点四十五")
    .replace(/\b5\s*\+\s*3\s*\+\s*5\s*\+\s*3\b/g, "五加三加五加三")
    .replace(/AI/g, "小学伴")
    .replace(/L2/g, "第二级提示")
    .replace(/[“”"]/g, "")
    .replace(/[：:]/g, "，")
    .replace(/。/g, "。 ")
    .replace(/，/g, "， ")
    .replace(/\s+/g, " ")
    .trim();
}
