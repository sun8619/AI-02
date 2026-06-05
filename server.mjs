import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";

await loadDotEnv();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (request.method === "POST" && url.pathname === "/api/images/generations") {
      await handleImageGeneration(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/learning/turn") {
      await handleLearningTurn(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/speech/transcriptions") {
      await handleSpeechTranscription(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/speech/synthesis") {
      await handleSpeechSynthesis(request, response);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/models/config") {
      sendJson(response, 200, getPublicModelConfig());
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        app: "qibu-ai-learning-companion",
        ...getPublicModelConfig(),
        hasApiKey: Boolean(process.env.ARK_API_KEY),
      });
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    await serveStatic(url.pathname, response, request.method === "HEAD");
  } catch (error) {
    sendJson(response, 500, { error: "Local server error", detail: sanitizeMessage(error) });
  }
});

server.listen(port, host, () => {
  const shownHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`启步学伴原型已启动：http://${shownHost}:${port}`);
});

async function handleImageGeneration(request, response) {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    sendJson(response, 500, {
      error: "Missing ARK_API_KEY",
      detail: "请先在本地环境变量或 .env 文件中配置 ARK_API_KEY，再启动服务。",
    });
    return;
  }

  const input = await readJsonBody(request);
  const prompt = String(input.prompt || "").trim();
  if (!prompt) {
    sendJson(response, 400, { error: "Missing prompt" });
    return;
  }

  const upstreamPayload = {
    model: process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-260128",
    prompt,
    sequential_image_generation: "disabled",
    response_format: "url",
    size: input.size || "2K",
    stream: false,
    watermark: input.watermark ?? true,
  };

  const upstreamResponse = await fetch("https://ark.cn-beijing.volces.com/api/v3/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(upstreamPayload),
  });

  const contentType = upstreamResponse.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await upstreamResponse.json()
    : { message: await upstreamResponse.text() };

  if (!upstreamResponse.ok) {
    sendJson(response, upstreamResponse.status, {
      error: "Image generation failed",
      detail: summarizeUpstreamError(payload),
    });
    return;
  }

  sendJson(response, 200, payload);
}

async function handleLearningTurn(request, response) {
  const apiKey = process.env.ARK_API_KEY;
  const input = await readJsonBody(request);
  const phase = String(input.phase || "guiding");
  const model = selectLearningModel(phase);
  if (!apiKey || !model) {
    sendJson(response, 200, {
      mode: "mock",
      message: "本地模拟 AI 已接管。部署后配置 ARK_API_KEY 和对应教学模型，就会使用火山 Ark 真实模型。",
      nextPhase: "mock",
    });
    return;
  }

  const userText = String(input.text || "").trim();
  const context = String(input.context || "");
  const step = String(input.step || "");
  const lesson = input.lesson && typeof input.lesson === "object" ? input.lesson : {};
  const lessonProblem = String(lesson.problem || "比较 2/3 和 3/4 哪个大？");
  const lessonTextbook = String(lesson.textbook || "人教版 三年级上册 分数的初步认识");
  const lessonNode = String(lesson.node || "异分母分数比较");

  if (!userText) {
    sendJson(response, 400, { error: "Missing text" });
    return;
  }

  const payload = {
    model: selectLearningModel(phase),
    messages: [
      {
        role: "system",
        content: [
          "你是启步学伴，面向小学低年级孩子的中文 AI 语音陪练老师。",
          "你使用启发式教学，不直接代答；每次只推进一个很小的台阶。",
          "如果孩子已经答对，要邀请孩子当小老师讲一遍。",
          "如果孩子讲不清，不批评，换一种讲法：画图、生活类比、举例或更小步骤。",
          "aiMessage 必须只写老师会对孩子说的话，不要展示内部思考过程、评分标准或分析日志。",
          "aiContext 只给系统记录使用，前端不会展示给孩子。",
          "你必须只输出一段合法 JSON，不要使用 Markdown。",
          "JSON 字段为 aiContext, aiMessage, nextPhase, feynmanStatus, evidenceSignal, evidenceText, bestStrategy。",
        ].join("\n"),
      },
      {
        role: "user",
        content: JSON.stringify({
          problem: lessonProblem,
          textbook: lessonTextbook,
          knowledgeNode: lessonNode,
          microSteps: Array.isArray(lesson.microSteps) ? lesson.microSteps : [],
          commonGaps: Array.isArray(lesson.commonGaps) ? lesson.commonGaps : [],
          currentPhase: phase,
          currentContext: context,
          currentStep: step,
          childSaid: userText,
        }),
      },
    ],
    temperature: 0.35,
  };

  const baseUrl = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
  const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const upstreamPayload = await upstream.json().catch(async () => ({ message: await upstream.text().catch(() => "") }));
  if (!upstream.ok) {
    sendJson(response, 502, {
      error: "AI Gateway failed",
      detail: summarizeUpstreamError(upstreamPayload),
    });
    return;
  }

  const content = upstreamPayload?.choices?.[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(extractJsonObject(content));
  } catch {
    parsed = {
      aiContext: "我听到了，我们换个更简单的说法。",
      aiMessage: content.slice(0, 220) || "先看分母是不是一样。",
      nextPhase: phase,
      feynmanStatus: "",
      evidenceSignal: "模型回复",
      evidenceText: "AI Gateway 返回了非 JSON 回复，已做保守处理。",
      bestStrategy: "拆步骤",
    };
  }

  sendJson(response, 200, {
    mode: "ark",
    ...parsed,
  });
}

async function handleSpeechTranscription(request, response) {
  const input = await readJsonBody(request);
  const audioData = String(input.audioData || "").trim();
  const audioUrl = String(input.audioUrl || "").trim();
  const apiKey = getSpeechApiKey("ASR");

  if (!apiKey) {
    sendJson(response, 200, {
      mode: "mock",
      transcript: "",
      message: "未配置语音识别 Key，前端会回退到模拟输入。",
    });
    return;
  }

  if (!audioData && !audioUrl) {
    sendJson(response, 400, { error: "Missing audioData or audioUrl" });
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

  const upstream = await fetch(process.env.ARK_ASR_URL || "https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash", {
    method: "POST",
    headers: buildSpeechHeaders("ASR", apiKey),
    body: JSON.stringify(payload),
  });

  const upstreamPayload = await upstream.json().catch(async () => ({ message: await upstream.text().catch(() => "") }));
  const statusCode = upstream.headers.get("X-Api-Status-Code");
  if (!upstream.ok || (statusCode && statusCode !== "20000000")) {
    sendJson(response, 502, {
      error: "ASR failed",
      detail: upstream.headers.get("X-Api-Message") || summarizeUpstreamError(upstreamPayload),
      logId: upstream.headers.get("X-Tt-Logid") || "",
    });
    return;
  }

  sendJson(response, 200, {
    mode: "ark-asr",
    transcript: upstreamPayload?.result?.text || "",
    utterances: upstreamPayload?.result?.utterances || [],
    duration: upstreamPayload?.audio_info?.duration || 0,
  });
}

async function handleSpeechSynthesis(request, response) {
  const input = await readJsonBody(request);
  const text = naturalizeSpeechText(String(input.text || "").trim());
  const apiKey = getSpeechApiKey("TTS");
  if (!apiKey) {
    sendJson(response, 200, {
      mode: "browser-fallback",
      message: "未配置语音合成 Key，前端会回退到浏览器朗读。",
    });
    return;
  }
  if (!text) {
    sendJson(response, 400, { error: "Missing text" });
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

  const upstream = await fetch(process.env.ARK_TTS_URL || "https://openspeech.bytedance.com/api/v3/tts/unidirectional", {
    method: "POST",
    headers: buildSpeechHeaders("TTS", apiKey),
    body: JSON.stringify(payload),
  });

  const raw = await upstream.text();
  if (!upstream.ok) {
    sendJson(response, 502, {
      error: "TTS failed",
      detail: raw.slice(0, 500),
      logId: upstream.headers.get("X-Tt-Logid") || "",
    });
    return;
  }

  const chunks = parseConcatenatedJson(raw)
    .map((item) => item?.data)
    .filter((item) => typeof item === "string" && item.length > 0);

  if (!chunks.length) {
    sendJson(response, 502, {
      error: "TTS returned no audio",
      detail: raw.slice(0, 500),
      logId: upstream.headers.get("X-Tt-Logid") || "",
    });
    return;
  }

  sendJson(response, 200, {
    mode: "ark-tts",
    format,
    audioBase64: chunks.join(""),
    audioDataUrl: `data:audio/${format};base64,${chunks.join("")}`,
    logId: upstream.headers.get("X-Tt-Logid") || "",
  });
}

function getModelConfig() {
  return {
    arkBaseUrl: process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
    tutorModel: process.env.ARK_TUTOR_MODEL || process.env.ARK_TEXT_MODEL || "",
    reasoningModel: process.env.ARK_REASONING_MODEL || process.env.ARK_TUTOR_MODEL || process.env.ARK_TEXT_MODEL || "",
    evaluationModel: process.env.ARK_EVALUATION_MODEL || process.env.ARK_REASONING_MODEL || process.env.ARK_TUTOR_MODEL || process.env.ARK_TEXT_MODEL || "",
    summaryModel: process.env.ARK_SUMMARY_MODEL || process.env.ARK_TUTOR_MODEL || process.env.ARK_TEXT_MODEL || "",
    asrModel: process.env.ARK_ASR_MODEL || "bigmodel",
    asrResourceId: process.env.ARK_ASR_RESOURCE_ID || "volc.bigasr.auc_turbo",
    ttsResourceId: process.env.ARK_TTS_RESOURCE_ID || "seed-tts-2.0",
    ttsSpeaker: process.env.ARK_TTS_SPEAKER || "zh_female_vv_uranus_bigtts",
    imageModel: process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-260128",
  };
}

function getPublicModelConfig() {
  const config = getModelConfig();
  return {
    arkBaseUrl: config.arkBaseUrl,
    modelRoles: {
      tutor: config.tutorModel,
      reasoning: config.reasoningModel,
      evaluation: config.evaluationModel,
      summary: config.summaryModel,
      asr: config.asrModel,
      tts: config.ttsResourceId,
      image: config.imageModel,
    },
    voice: {
      asrResourceId: config.asrResourceId,
      ttsResourceId: config.ttsResourceId,
      ttsSpeaker: config.ttsSpeaker,
    },
    configured: {
      arkApiKey: Boolean(process.env.ARK_API_KEY),
      speechApiKey: Boolean(getSpeechApiKey("ASR") || getSpeechApiKey("TTS")),
      tutor: Boolean(config.tutorModel),
      reasoning: Boolean(config.reasoningModel),
      evaluation: Boolean(config.evaluationModel),
      asr: Boolean(getSpeechApiKey("ASR")),
      tts: Boolean(getSpeechApiKey("TTS")),
      image: Boolean(config.imageModel && process.env.ARK_API_KEY),
    },
  };
}

function selectLearningModel(phase) {
  const config = getModelConfig();
  if (phase === "teachback" || phase === "repair") return config.evaluationModel;
  return config.reasoningModel || config.tutorModel;
}

function getSpeechApiKey(kind) {
  return (
    process.env[`ARK_${kind}_API_KEY`] ||
    process.env.ARK_SPEECH_API_KEY ||
    process.env.ARK_API_KEY ||
    ""
  );
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
  if (kind === "ASR") {
    headers["X-Api-Resource-Id"] = process.env.ARK_ASR_RESOURCE_ID || "volc.bigasr.auc_turbo";
    headers["X-Api-Sequence"] = "-1";
  } else {
    headers["X-Api-Resource-Id"] = process.env.ARK_TTS_RESOURCE_ID || "seed-tts-2.0";
    headers["X-Api-App-Key"] = process.env.ARK_TTS_APP_KEY || "aGjiRDfUWi";
    headers.Connection = "keep-alive";
  }
  return headers;
}

function stripDataUrl(value) {
  const text = String(value || "");
  const index = text.indexOf(",");
  return text.startsWith("data:") && index >= 0 ? text.slice(index + 1) : text;
}

function parseConcatenatedJson(raw) {
  const decoder = new JsonStreamDecoder(raw);
  return decoder.parse();
}

class JsonStreamDecoder {
  constructor(raw) {
    this.raw = String(raw || "");
    this.index = 0;
  }

  parse() {
    const items = [];
    while (this.index < this.raw.length) {
      this.skipWhitespace();
      if (this.index >= this.raw.length) break;
      const start = this.index;
      try {
        const end = this.findObjectEnd(start);
        items.push(JSON.parse(this.raw.slice(start, end)));
        this.index = end;
      } catch {
        break;
      }
    }
    return items;
  }

  skipWhitespace() {
    while (/\s/.test(this.raw[this.index] || "")) this.index += 1;
  }

  findObjectEnd(start) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < this.raw.length; i += 1) {
      const char = this.raw[i];
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
        if (depth === 0) return i + 1;
      }
    }
    throw new Error("Incomplete JSON object");
  }
}

async function serveStatic(pathname, response, headOnly) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const normalized = normalize(decodeURIComponent(cleanPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, normalized);

  if (!filePath.startsWith(root)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  if (!existsSync(filePath)) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  const ext = extname(filePath);
  response.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });

  if (!headOnly) {
    response.end(await readFile(filePath));
  } else {
    response.end();
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function loadDotEnv() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;

  const content = await readFile(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = rest.join("=").replace(/^['"]|['"]$/g, "");
    }
  }
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

function extractJsonObject(content) {
  const text = String(content || "").trim();
  if (text.startsWith("{") && text.endsWith("}")) return text;
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : "{}";
}
