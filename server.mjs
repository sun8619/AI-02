import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile, realpath } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { WebSocket, WebSocketServer } from "ws";
import { createKnowledgeGraph } from "./teaching-engine/knowledge-model.js";
import { allKnowledgeModules } from "./teaching-engine/generated-curriculum.js";
import { runTeachingTurn } from "./teaching-engine/state-machine.js";
import "./teaching-engine/child-language.js";
import {readSpeechResponse} from "./teaching-engine/speech-request-lifecycle.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const release = JSON.parse(await readFile(join(root, "release.json"), "utf8"));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const teachingGraph = createKnowledgeGraph(allKnowledgeModules);

await loadDotEnv();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

const transientAudioFiles = new Map();
const transientAudioTtlMs = 5 * 60 * 1000;
const requestBuckets = new Map();
const activeRequests = new Map();
const activeRealtimeByIp = new Map();
const ttsCache = new Map();
const ttsCacheTtlMs = 5 * 60 * 1000;
const staticTopLevelAllowlist = new Set(["index.html", "boot.js", "app.js", "styles.css", "child-learning-stage.css", "robots.txt", "manifest.webmanifest"]);
const staticTeachingAllowlist = new Set([
  "grade1-2-question-bank.js",
  "grade1-2-knowledge-cards.js",
  "knowledge-point-teaching-overlays.js",
  "family-teaching-strategies.js",
  "microstep-quality-profiles.js",
  "microstep-explanation-library.js",
  "question-family-guard.js",
  "child-language.js",
  "learning-history.js",
  "answer-contract.js",
  "question-visuals.js",
  "learning-coach.js",
]);
const apiPolicies = {
  "/api/images/generations": { windowMs: 60_000, max: 3, concurrent: 1, globalMax: 30, globalConcurrent: 3 },
  "/api/learning/turn": { windowMs: 60_000, max: 30, concurrent: 4, globalMax: 300, globalConcurrent: 24 },
  "/api/speech/transcriptions": { windowMs: 60_000, max: 20, concurrent: 2, globalMax: 180, globalConcurrent: 12 },
  "/api/speech/synthesis": { windowMs: 60_000, max: 30, concurrent: 3, globalMax: 300, globalConcurrent: 18 },
};
const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data: https:; media-src 'self' data: blob:; connect-src 'self' https: wss:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const server = createServer(async (request, response) => {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  response.setHeader("X-Request-Id", requestId);
  applySecurityHeaders(response, request);
  response.on("finish", () => {
    logEvent("http_request", {
      requestId,
      method: request.method,
      path: safeRequestPath(request.url),
      status: response.statusCode,
      durationMs: Date.now() - startedAt,
      ip: clientKey(request),
    });
  });
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    const policy = request.method === "POST" ? apiPolicies[url.pathname] : null;
    if (policy && !String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
      sendJson(response, 415, { error: "Content-Type must be application/json" });
      return;
    }
    if (policy && !enterApiPolicy(request, response, url.pathname, policy)) return;
    try {
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
    } finally {
      if (policy) leaveApiPolicy(url.pathname, clientKey(request));
    }

    if (request.method === "GET" && url.pathname === "/api/models/config") {
      sendJson(response, 200, getPublicModelConfig());
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        app: "qibu-ai-learning-companion",
        release: release.id,
        ...getPublicModelConfig(),
      });
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/speech/audio/")) {
      serveTransientAudio(url.pathname, response);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    await serveStatic(url.pathname, response, request.method === "HEAD", url.searchParams.has("v"), request);
  } catch (error) {
    if(response.destroyed || response.writableEnded) return;
    const status = error.code === "REQUEST_TOO_LARGE" ? 413 : error.name === "AbortError" || error.code === "UPSTREAM_TIMEOUT" || error.code === "SPEECH_TIMEOUT" ? 504 : error.code === "INVALID_INPUT" ? 400 : 500;
    logEvent("request_error", { requestId, status, path: safeRequestPath(request.url), error: sanitizeMessage(error) });
    sendJson(response, status, { error: status === 413 ? "Request body too large" : status === 400 ? "Invalid request" : status === 504 ? "Upstream timeout" : "Local server error", detail: sanitizeMessage(error) });
  }
});

const realtimeVoiceServer = new WebSocketServer({ noServer: true, maxPayload: 1_200_000, clientTracking: true });

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  if (url.pathname !== "/api/realtime/voice" || !isAllowedOrigin(request) || !consumeRateLimit(`ws:${clientKey(request)}`, 60_000, 10)) {
    socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }
  const ip = clientKey(request);
  const active = activeRealtimeByIp.get(ip) || 0;
  if (active >= 2) {
    socket.write("HTTP/1.1 429 Too Many Requests\r\nRetry-After: 30\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }

  realtimeVoiceServer.handleUpgrade(request, socket, head, (websocket) => {
    activeRealtimeByIp.set(ip, active + 1);
    websocket.once("close", () => {
      const next = Math.max(0, (activeRealtimeByIp.get(ip) || 1) - 1);
      if (next) activeRealtimeByIp.set(ip, next);
      else activeRealtimeByIp.delete(ip);
    });
    realtimeVoiceServer.emit("connection", websocket, request);
  });
});

realtimeVoiceServer.on("connection", (websocket, request) => {
  handleRealtimeVoiceConnection(websocket, request);
});

server.listen(port, host, () => {
  const shownHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`乐之老师原型已启动：http://${shownHost}:${port}`);
});

function handleRealtimeVoiceConnection(client) {
  let asrSession = null;
  let receivedAudioBytes = 0;
  let started = false;
  const maxAudioBytes = Number(process.env.REALTIME_MAX_AUDIO_BYTES || 640_000);
  const connectionTimer = setTimeout(() => {
    sendRealtime(client, { type: "error", message: "这次录音时间有点长，请重新说一遍。" });
    client.close(1008, "voice session timeout");
  }, Number(process.env.REALTIME_MAX_CONNECTION_MS || 15_000));

  client.on("message", async (raw) => {
    let message;
    try {
      const messageText = String(raw);
      if (Buffer.byteLength(messageText) > 1_150_000) throw new Error("Realtime message too large");
      message = JSON.parse(messageText);
    } catch {
      sendRealtime(client, { type: "error", message: "语音通道收到的消息格式不对。" });
      client.close(1008, "invalid message");
      return;
    }

    try {
      if (message.type === "start") {
        if (started) throw new Error("Realtime session already started");
        started = true;
        asrSession = new StreamingAsrSession(client, normalizeAsrContext(message.context));
        await asrSession.start();
        return;
      }

      if (message.type === "audio") {
        const audio = decodeRealtimeAudio(message.audioBase64);
        receivedAudioBytes += audio.length;
        if (receivedAudioBytes > maxAudioBytes) throw new Error("Realtime audio too large");
        if (audio.length && asrSession) asrSession.sendAudio(audio, false);
        return;
      }

      if (message.type === "stop") {
        const audio = decodeRealtimeAudio(message.audioBase64);
        receivedAudioBytes += audio.length;
        if (receivedAudioBytes > maxAudioBytes) throw new Error("Realtime audio too large");
        if (asrSession) asrSession.finish(audio.length ? audio : null);
        return;
      }
      throw new Error("Unsupported realtime message type");
    } catch (error) {
      sendRealtime(client, {
        type: "error",
        message: /too large|already started|Unsupported/.test(String(error?.message)) ? "这次语音数据不符合要求，请重新说一遍。" : "实时语音识别没有接通，已切回备用识别。",
        detail: sanitizeMessage(error),
      });
      if (/too large|already started|Unsupported/.test(String(error?.message))) client.close(1008, "voice policy violation");
    }
  });

  client.on("close", () => {
    clearTimeout(connectionTimer);
    if (asrSession) asrSession.close();
  });

  client.on("error", () => {
    clearTimeout(connectionTimer);
    if (asrSession) asrSession.close();
  });
}

class StreamingAsrSession {
  constructor(client, context = {}) {
    this.client = client;
    this.upstream = null;
    this.ready = false;
    this.closed = false;
    this.lastTranscript = "";
    this.finalSent = false;
    this.pendingAudio = [];
    this.pendingAudioBytes = 0;
    this.finalTimer = null;
    this.context = context;
    this.confidence = null;
    this.utteranceCount = 0;
  }

  async start() {
    const apiKey = getSpeechApiKey("ASR");
    if (!apiKey) throw new Error("Missing ASR key");

    const connectId = crypto.randomUUID();
    const headers = buildStreamingSpeechHeaders("ASR", apiKey, {
      connectId,
      resourceId: getStreamingAsrResourceId(),
    });
    const upstreamUrl = process.env.ARK_ASR_STREAM_URL || "wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async";

    this.upstream = new WebSocket(upstreamUrl, { headers });
    this.upstream.binaryType = "nodebuffer";
    this.upstream.on("open", () => {
      this.ready = true;
      this.upstream.send(buildAsrFullRequestPacket(createStreamingAsrPayload(this.context)));
      sendRealtime(this.client, { type: "ready", mode: "volc-stream-asr", connectId });
      while (this.pendingAudio.length) {
        const packet = this.pendingAudio.shift();
        this.pendingAudioBytes = Math.max(0, this.pendingAudioBytes - packet.length);
        this.upstream.send(packet);
      }
    });
    this.upstream.on("message", (data) => this.handleUpstreamMessage(Buffer.from(data)));
    this.upstream.on("error", (error) => {
      sendRealtime(this.client, {
        type: "error",
        message: "火山流式语音识别连接失败。",
        detail: sanitizeMessage(error),
      });
    });
    this.upstream.on("close", () => {
      this.closed = true;
      if (!this.finalSent && this.lastTranscript) {
        this.sendFinal(this.lastTranscript);
      }
    });
  }

  sendAudio(audio, isLast) {
    if (this.closed) return;
    const packet = buildAsrAudioPacket(audio, isLast);
    if (this.ready && this.upstream?.readyState === WebSocket.OPEN) {
      this.upstream.send(packet);
    } else {
      this.pendingAudioBytes += packet.length;
      if (this.pendingAudio.length >= 32 || this.pendingAudioBytes > 750_000) {
        throw new Error("Realtime pending audio too large");
      }
      this.pendingAudio.push(packet);
    }
  }

  finish(finalAudio) {
    if (this.closed) return;
    this.sendAudio(finalAudio || Buffer.alloc(0), true);
    this.finalTimer = setTimeout(() => {
      if (!this.finalSent) this.sendFinal(this.lastTranscript);
      this.close();
    }, Number(process.env.ARK_ASR_STREAM_FINAL_TIMEOUT_MS || 5500));
  }

  handleUpstreamMessage(buffer) {
    let packet;
    try {
      packet = parseAsrPacket(buffer);
    } catch (error) {
      sendRealtime(this.client, {
        type: "error",
        message: "火山流式识别返回内容无法解析。",
        detail: sanitizeMessage(error),
      });
      return;
    }
    if (packet.error) {
      sendRealtime(this.client, {
        type: "error",
        message: "火山流式识别返回错误。",
        detail: packet.error,
      });
      return;
    }

    const transcript = extractAsrTranscript(packet.payload);
    const confidence = extractAsrConfidence(packet.payload);
    if (confidence !== null) this.confidence = confidence;
    this.utteranceCount = Math.max(this.utteranceCount, extractAsrUtteranceCount(packet.payload));
    if (transcript) {
      this.lastTranscript = transcript;
      sendRealtime(this.client, { type: "partial", transcript });
    }

    if (packet.isFinal) {
      this.sendFinal(transcript || this.lastTranscript);
      this.close();
    }
  }

  sendFinal(transcript) {
    if (this.finalSent) return;
    this.finalSent = true;
    if (this.finalTimer) clearTimeout(this.finalTimer);
    sendRealtime(this.client, {
      type: "final",
      transcript: String(transcript || "").trim(),
      confidence: this.confidence,
      utteranceCount: this.utteranceCount,
    });
  }

  close() {
    this.closed = true;
    if (this.finalTimer) clearTimeout(this.finalTimer);
    if (this.upstream && this.upstream.readyState < WebSocket.CLOSING) this.upstream.close();
  }
}

function sendRealtime(client, payload) {
  if (client.readyState !== WebSocket.OPEN) return;
  client.send(JSON.stringify(payload));
}

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
  const prompt = validateText(input.prompt, "prompt", 1200, { required: true });
  const size = ["1K", "2K"].includes(String(input.size || "")) ? String(input.size) : "2K";

  const upstreamPayload = {
    model: process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-260128",
    prompt,
    sequential_image_generation: "disabled",
    response_format: "url",
    size,
    stream: false,
    watermark: input.watermark ?? true,
  };

  const upstreamResponse = await fetchWithTimeout("https://ark.cn-beijing.volces.com/api/v3/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(upstreamPayload),
  }, Number(process.env.ARK_IMAGE_TIMEOUT_MS || 30_000), response);

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
  const allowedPhases = new Set(["guiding", "teachback", "repair", "summary", "assessment"]);
  const phase = allowedPhases.has(String(input.phase || "")) ? String(input.phase) : "guiding";
  const model = selectLearningModel(phase);
  const userText = validateText(input.text, "text", 300, { required: true });
  const context = validateText(input.context, "context", 2400);
  const step = validateText(input.step, "step", 240);
  const lesson = input.lesson && typeof input.lesson === "object" && !Array.isArray(input.lesson) ? input.lesson : {};
  if (JSON.stringify(lesson).length > 80_000 || JSON.stringify(input.engineSession || {}).length > 20_000) {
    const error = new Error("lesson or engineSession is too large");
    error.code = "INVALID_INPUT";
    throw error;
  }
  const engineTurn = runTeachingTurn({
    graph: teachingGraph,
    lesson,
    childText: userText,
    session: input.engineSession,
    inputType: input.inputType || "text",
  });
  const lessonProblem = String(lesson.problem || "比较 2/3 和 3/4 哪个大？");
  const lessonTextbook = String(lesson.textbook || "人教版 三年级上册 分数的初步认识");
  const lessonNode = String(lesson.node || "异分母分数比较");
  const lessonName = String(lesson.lessonName || "");
  const currentQuestion = lesson.currentQuestion && typeof lesson.currentQuestion === "object" ? lesson.currentQuestion : null;
  const questionBankSample = Array.isArray(lesson.questionBankSample) ? lesson.questionBankSample.slice(0, 6) : [];

  if (!userText) {
    sendJson(response, 400, { error: "Missing text" });
    return;
  }

  if (engineTurn) {
    sendJson(response, 200, engineTurn);
    return;
  }

  if (!apiKey || !model) {
    sendJson(response, 200, {
      mode: "mock",
      message: "本地模拟 AI 已接管。部署后配置 ARK_API_KEY 和对应教学模型，就会使用火山 Ark 真实模型。",
      nextPhase: "mock",
    });
    return;
  }

  const payload = {
    model: selectLearningModel(phase),
    messages: [
      {
        role: "system",
        content: [
          "你是乐之老师，面向小学低年级孩子的中文 AI 语音陪练老师。",
          "你要像真人老师一样说话：短句、自然、温和，避免播报内部判断和长篇分析。",
          "你使用启发式教学，不直接代答；每次只推进一个很小的台阶。",
          "先判断孩子是否卡在前置知识；如果是，先补前置知识，不要硬往后讲。",
          "孩子说想换知识点、换题、学习另一个内容时，要尊重孩子意图，不要把它套进当前题继续讲。",
          "如果孩子回答和当前题目无关，要温和拉回当前小问题，不能当作正确答案。",
          "如果孩子只答出结果但没说原因，要先追问一句“为什么”，不要直接标记完全掌握。",
          "如果孩子已经答对并能说出原因，再邀请孩子当小老师讲一遍。",
          "如果孩子讲不清，不批评，换一种讲法：画图、生活类比、举例或更小步骤。",
          "必须围绕 currentQuestion 提问和判断；currentQuestion 为空时才使用 problem。",
          "questionBankSample 只用于换题或举例，不要把题库内容一次展示给孩子。",
          "不要提前把当前题完整答案和完整推理都说出来。优先只问一个孩子能回答的小问题。",
          "优先参考 lesson.substeps、lesson.masterySignals 和 lesson.diagnosticFocus 判断下一步，不要把整个知识点一次讲完。",
          "孩子只说无关内容、寒暄或不完整词语时，要先拉回当前小问题，不要默认答对。",
          "每次 aiMessage 只包含老师要对孩子说的话，最多 80 个汉字，优先问一个小问题。",
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
          lessonName,
          knowledgeNode: lessonNode,
          prerequisites: Array.isArray(lesson.prerequisites) ? lesson.prerequisites : [],
          microSteps: Array.isArray(lesson.microSteps) ? lesson.microSteps : [],
          commonGaps: Array.isArray(lesson.commonGaps) ? lesson.commonGaps : [],
          knowledgeLayers: Array.isArray(lesson.knowledgeLayers) ? lesson.knowledgeLayers : [],
          substeps: Array.isArray(lesson.substeps) ? lesson.substeps : [],
          masterySignals: Array.isArray(lesson.masterySignals) ? lesson.masterySignals : [],
          diagnosticFocus: Array.isArray(lesson.diagnosticFocus) ? lesson.diagnosticFocus : [],
          answerSignals: lesson.answerSignals || {},
          teachingStrategies: Array.isArray(lesson.teachingStrategies) ? lesson.teachingStrategies : [],
          currentQuestion,
          questionBankSample,
          questionBankStats: lesson.questionBankStats || null,
          variationRules: Array.isArray(lesson.variationRules) ? lesson.variationRules : [],
          teachingMethods: Array.isArray(lesson.teachingMethods) ? lesson.teachingMethods : [],
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
  const upstream = await fetchWithTimeout(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  }, Number(process.env.ARK_TEXT_TIMEOUT_MS || 15_000), response);

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
  const audioData = validateAudioData(input.audioData);
  const audioUrl = "";
  const mimeType = validateAudioMimeType(input.mimeType, audioData);
  const context = normalizeAsrContext(input.context);
  const apiKey = getSpeechApiKey("ASR");

  if (!audioData) {
    sendJson(response, 400, { error: "Missing audioData" });
    return;
  }

  if (!apiKey) {
    sendJson(response, 200, {
      mode: "mock",
      transcript: "",
      message: "未配置语音识别 Key，请让孩子再说一次或改用键盘输入。",
    });
    return;
  }

  const resourceId = process.env.ARK_ASR_RESOURCE_ID || "volc.bigasr.auc_turbo";
  const asrUrl = process.env.ARK_ASR_URL || "";
  if (resourceId === "volc.seedasr.auc" || asrUrl.includes("/submit")) {
    await handleSpeechTranscriptionSubmitQuery({
      request,
      response,
      apiKey,
      audioData,
      audioUrl,
      mimeType,
      resourceId,
      context,
    });
    return;
  }

  const legacy = getLegacySpeechCredentials("ASR");
  const payload = {
    user: { uid: process.env.ARK_ASR_UID || legacy.appId || "qibu-child" },
    audio: audioUrl ? { url: audioUrl } : { data: stripDataUrl(audioData) },
    request: applyAsrContext({
      model_name: process.env.ARK_ASR_MODEL || "bigmodel",
      enable_itn: true,
      enable_punc: true,
      show_utterances: true,
    }, context),
  };

  const upstream = await fetchWithTimeout(process.env.ARK_ASR_URL || "https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash", {
    method: "POST",
    headers: buildSpeechHeaders("ASR", apiKey),
    body: JSON.stringify(payload),
  }, Number(process.env.ARK_ASR_TIMEOUT_MS || 15_000), response);

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
    confidence: extractAsrConfidence(upstreamPayload),
    utteranceCount: extractAsrUtteranceCount(upstreamPayload),
  });
}

async function handleSpeechTranscriptionSubmitQuery({ request, response, apiKey, audioData, audioUrl, mimeType, resourceId, context }) {
  const taskId = crypto.randomUUID();
  const externalAudioUrl = audioUrl || createTransientAudioUrl(request, audioData, mimeType);
  const payload = {
    user: { uid: process.env.ARK_ASR_UID || "qibu-child" },
    audio: {
      url: externalAudioUrl,
      format: inferAudioFormat(mimeType, audioData, externalAudioUrl),
      codec: "raw",
      rate: 16000,
      bits: 16,
      channel: 1,
    },
    request: applyAsrContext({
      model_name: process.env.ARK_ASR_MODEL || "bigmodel",
      enable_itn: true,
      enable_punc: true,
      enable_ddc: false,
      enable_speaker_info: false,
      enable_channel_split: false,
      show_utterances: true,
      vad_segment: false,
      sensitive_words_filter: "",
    }, context),
  };

  const submitUrl = process.env.ARK_ASR_SUBMIT_URL || process.env.ARK_ASR_URL || "https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit";
  const queryUrl = process.env.ARK_ASR_QUERY_URL || submitUrl.replace(/\/submit$/, "/query");
  const submit = await fetchWithTimeout(submitUrl, {
    method: "POST",
    headers: buildSpeechHeaders("ASR", apiKey, { requestId: taskId, resourceId }),
    body: JSON.stringify(payload),
  }, Number(process.env.ARK_ASR_TIMEOUT_MS || 15_000), response);
  const submitStatus = submit.headers.get("X-Api-Status-Code");
  if (!submit.ok || (submitStatus && submitStatus !== "20000000")) {
    const submitPayload = await submit.json().catch(async () => ({ message: await submit.text().catch(() => "") }));
    sendJson(response, 502, {
      error: "ASR submit failed",
      detail: submit.headers.get("X-Api-Message") || summarizeUpstreamError(submitPayload),
      logId: submit.headers.get("X-Tt-Logid") || "",
    });
    return;
  }

  let lastPayload = {};
  let lastStatus = "";
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await wait(attempt === 0 ? 250 : attempt < 4 ? 450 : 900);
    const query = await fetchWithTimeout(queryUrl, {
      method: "POST",
      headers: buildSpeechHeaders("ASR", apiKey, { requestId: taskId, resourceId }),
      body: "{}",
    }, Number(process.env.ARK_ASR_TIMEOUT_MS || 15_000), response);
    lastStatus = query.headers.get("X-Api-Status-Code") || "";
    lastPayload = await query.json().catch(async () => ({ message: await query.text().catch(() => "") }));

    if (!query.ok) {
      sendJson(response, 502, {
        error: "ASR query failed",
        detail: query.headers.get("X-Api-Message") || summarizeUpstreamError(lastPayload),
        logId: query.headers.get("X-Tt-Logid") || "",
      });
      return;
    }

    if (lastStatus === "20000000" || lastPayload?.result?.text) {
      sendJson(response, 200, {
        mode: "ark-asr",
        transcript: lastPayload?.result?.text || "",
        utterances: lastPayload?.result?.utterances || [],
        duration: lastPayload?.audio_info?.duration || lastPayload?.result?.additions?.duration || 0,
        confidence: extractAsrConfidence(lastPayload),
        utteranceCount: extractAsrUtteranceCount(lastPayload),
      });
      return;
    }

    if (lastStatus && lastStatus !== "20000001" && lastStatus !== "20000002") {
      sendJson(response, 502, {
        error: "ASR failed",
        detail: query.headers.get("X-Api-Message") || summarizeUpstreamError(lastPayload),
        logId: query.headers.get("X-Tt-Logid") || "",
      });
      return;
    }
  }

  sendJson(response, 504, {
    error: "ASR timeout",
    detail: `语音识别仍在处理中，最后状态：${lastStatus || "unknown"}`,
    lastPayload,
  });
}

async function handleSpeechSynthesis(request, response) {
  const input = await readJsonBody(request);
  const text = naturalizeSpeechText(validateText(input.text, "text", 500, { required: true }));
  const format = process.env.ARK_TTS_FORMAT || "mp3";
  const cacheKey = createHash("sha256").update(JSON.stringify({text,format,speaker:process.env.ARK_TTS_SPEAKER || "zh_female_vv_uranus_bigtts",rate:process.env.ARK_TTS_SPEECH_RATE || "-4",loudness:process.env.ARK_TTS_LOUDNESS_RATE || "2"})).digest("hex");
  const cached = ttsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    logEvent("tts_cache_hit", { bytes: cached.payload.audioBase64.length });
    sendJson(response, 200, cached.payload);
    return;
  }
  if (cached) ttsCache.delete(cacheKey);
  const apiKey = getSpeechApiKey("TTS");
  if (!apiKey) {
    sendJson(response, 503, {
      error: "TTS not configured",
      message: "未配置火山豆包语音合成 Key，已停止使用浏览器机械朗读。",
      hint: "请在服务器环境变量里配置 ARK_TTS_API_KEY 或 ARK_SPEECH_API_KEY，并确认 ARK_TTS_RESOURCE_ID 与 ARK_TTS_SPEAKER 有权限。",
    });
    return;
  }
  if (!text) {
    sendJson(response, 400, { error: "Missing text" });
    return;
  }

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

  const {upstream,raw} = await readSpeechResponse(process.env.ARK_TTS_URL || "https://openspeech.bytedance.com/api/v3/tts/unidirectional", {
    method: "POST",
    headers: buildSpeechHeaders("TTS", apiKey),
    body: JSON.stringify(payload),
  }, response);
  if (!upstream.ok) {
    const hint = createTtsErrorHint(raw);
    sendJson(response, 502, {
      error: "TTS failed",
      detail: raw.slice(0, 500),
      hint,
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
      hint: createTtsErrorHint(raw),
      logId: upstream.headers.get("X-Tt-Logid") || "",
    });
    return;
  }

  const audioBase64 = chunks.join("");
  const responsePayload = {
    mode: "ark-tts",
    format,
    audioBase64,
    audioDataUrl: `data:audio/${format};base64,${audioBase64}`,
    logId: upstream.headers.get("X-Tt-Logid") || "",
  };
  if (audioBase64.length <= 2_000_000) {
    if (ttsCache.size >= 20) ttsCache.delete(ttsCache.keys().next().value);
    ttsCache.set(cacheKey, { payload: responsePayload, expiresAt: Date.now() + ttsCacheTtlMs });
  }
  sendJson(response, 200, responsePayload);
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
    asrStreamResourceId: getStreamingAsrResourceId(),
    ttsResourceId: process.env.ARK_TTS_RESOURCE_ID || "seed-tts-2.0",
    ttsSpeaker: process.env.ARK_TTS_SPEAKER || "zh_female_vv_uranus_bigtts",
    imageModel: process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-260128",
  };
}

function getPublicModelConfig() {
  const config = getModelConfig();
  return {
    configured: {
      tutor: Boolean(config.tutorModel && process.env.ARK_API_KEY),
      reasoning: Boolean(config.reasoningModel && process.env.ARK_API_KEY),
      evaluation: Boolean(config.evaluationModel && process.env.ARK_API_KEY),
      summary: Boolean(config.summaryModel && process.env.ARK_API_KEY),
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
  const explicitKey = process.env[`ARK_${kind}_API_KEY`] || process.env.ARK_SPEECH_API_KEY || "";
  if (explicitKey) return explicitKey;
  if (hasLegacySpeechCredentials(kind)) return "legacy-speech-credentials";
  return process.env.ARK_API_KEY || "";
}

function buildSpeechHeaders(kind, apiKey, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-Api-Request-Id": options.requestId || crypto.randomUUID(),
  };
  const legacy = getLegacySpeechCredentials(kind);
  if (apiKey !== "legacy-speech-credentials") {
    headers["X-Api-Key"] = apiKey;
  } else if (legacy.appId && legacy.accessKey) {
    headers["X-Api-App-Id"] = legacy.appId;
    headers["X-Api-App-Key"] = legacy.appId;
    headers["X-Api-Access-Key"] = legacy.accessKey;
  }
  if (kind === "ASR") {
    headers["X-Api-Resource-Id"] = options.resourceId || process.env.ARK_ASR_RESOURCE_ID || "volc.bigasr.auc_turbo";
    headers["X-Api-Sequence"] = "-1";
  } else {
    headers["X-Api-Resource-Id"] = process.env.ARK_TTS_RESOURCE_ID || "seed-tts-2.0";
    headers.Connection = "keep-alive";
  }
  return headers;
}

function buildStreamingSpeechHeaders(kind, apiKey, options = {}) {
  const headers = {
    "X-Api-Connect-Id": options.connectId || crypto.randomUUID(),
    "X-Api-Resource-Id":
      options.resourceId ||
      (kind === "ASR" ? getStreamingAsrResourceId() : process.env.ARK_TTS_RESOURCE_ID || "seed-tts-2.0"),
  };
  const legacy = getLegacySpeechCredentials(kind);
  if (apiKey !== "legacy-speech-credentials") {
    headers["X-Api-Key"] = apiKey;
  } else if (legacy.appId && legacy.accessKey) {
    headers["X-Api-App-Key"] = legacy.appId;
    headers["X-Api-Access-Key"] = legacy.accessKey;
  }
  return headers;
}

function getStreamingAsrResourceId() {
  const explicit = process.env.ARK_ASR_STREAM_RESOURCE_ID || "";
  if (explicit) return explicit;
  const configured = process.env.ARK_ASR_RESOURCE_ID || "";
  if (configured.includes(".sauc.")) return configured;
  return "volc.seedasr.sauc.duration";
}

function createStreamingAsrPayload(context = {}) {
  return {
    user: { uid: process.env.ARK_ASR_UID || "qibu-child" },
    audio: {
      format: "pcm",
      codec: "raw",
      rate: 16000,
      bits: 16,
      channel: 1,
    },
    request: applyAsrContext({
      model_name: process.env.ARK_ASR_MODEL || "bigmodel",
      enable_itn: true,
      enable_punc: true,
      enable_ddc: false,
      show_utterances: true,
      enable_nonstream: process.env.ARK_ASR_STREAM_ENABLE_NONSTREAM !== "false",
      end_window_size: Number(process.env.ARK_ASR_STREAM_END_WINDOW_MS || 800),
    }, normalizeAsrContext(context)),
  };
}

function normalizeAsrContext(value) {
  const input = value && typeof value === "object" ? value : {};
  const cleanText = (item, maxLength) => String(item || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength);
  const hotwords = Array.from(
    new Set(
      (Array.isArray(input.hotwords) ? input.hotwords : [])
        .map((item) => cleanText(item, 9).replace(/[，。！？、；：,.!?;:\s]/g, ""))
        .filter((item) => item.length >= 2 && item.length <= 9),
    ),
  ).slice(0, 30);
  return {
    lessonId: cleanText(input.lessonId, 80),
    questionId: cleanText(input.questionId, 80),
    lessonName: cleanText(input.lessonName, 48),
    stepLabel: cleanText(input.stepLabel, 48),
    prompt: cleanText(input.prompt, 180),
    expectedType: cleanText(input.expectedType, 24),
    hotwords,
  };
}

function applyAsrContext(requestOptions, context = {}) {
  const request = { ...requestOptions };
  const safeContext = normalizeAsrContext(context);
  if (safeContext.hotwords.length) {
    request.context = JSON.stringify({
      hotwords: safeContext.hotwords.map((word) => ({ word })),
    });
  }

  const boostingTableId = String(process.env.ARK_ASR_BOOSTING_TABLE_ID || "").trim();
  const boostingTableName = String(process.env.ARK_ASR_BOOSTING_TABLE_NAME || "").trim();
  if (boostingTableId || boostingTableName) {
    request.corpus = {
      ...(boostingTableId ? { boosting_table_id: boostingTableId } : {}),
      ...(boostingTableName ? { boosting_table_name: boostingTableName } : {}),
    };
  }
  return request;
}

function buildAsrFullRequestPacket(payload) {
  const compressed = gzipSync(Buffer.from(JSON.stringify(payload)));
  return Buffer.concat([Buffer.from([0x11, 0x10, 0x11, 0x00]), uint32be(compressed.length), compressed]);
}

function buildAsrAudioPacket(audio, isLast) {
  const compressed = gzipSync(Buffer.from(audio || ""));
  return Buffer.concat([Buffer.from([0x11, isLast ? 0x22 : 0x20, 0x01, 0x00]), uint32be(compressed.length), compressed]);
}

function parseAsrPacket(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 8) return { error: "empty ASR packet" };
  const headerSize = (buffer[0] & 0x0f) * 4;
  const messageType = buffer[1] >> 4;
  const flags = buffer[1] & 0x0f;
  const serialization = buffer[2] >> 4;
  const compression = buffer[2] & 0x0f;
  let offset = headerSize;

  if (messageType === 0x0f) {
    const code = buffer.length >= offset + 4 ? buffer.readInt32BE(offset) : 0;
    offset += 4;
    const size = buffer.length >= offset + 4 ? buffer.readUInt32BE(offset) : 0;
    offset += 4;
    return { error: buffer.slice(offset, offset + size).toString("utf8") || `ASR protocol error ${code}` };
  }

  let sequence = 0;
  if (flags === 0x01 || flags === 0x03) {
    sequence = buffer.readInt32BE(offset);
    offset += 4;
  }

  const payloadSize = buffer.readUInt32BE(offset);
  offset += 4;
  let payloadBuffer = buffer.slice(offset, offset + payloadSize);
  if (compression === 0x01 && payloadBuffer.length) payloadBuffer = gunzipSync(payloadBuffer);

  let payload = payloadBuffer;
  if (serialization === 0x01) {
    payload = JSON.parse(payloadBuffer.toString("utf8") || "{}");
  }

  return {
    messageType,
    flags,
    sequence,
    payload,
    isFinal: flags === 0x02 || flags === 0x03 || sequence < 0,
  };
}

function extractAsrTranscript(payload) {
  const result = payload?.result || payload;
  const text = result?.text || "";
  if (text) return String(text).trim();
  const utterances = Array.isArray(result?.utterances) ? result.utterances : [];
  return utterances.map((item) => item?.text || "").join("").trim();
}

function extractAsrConfidence(payload) {
  const result = payload?.result || payload || {};
  const candidates = [];
  const collect = (value) => {
    let confidence = Number(value);
    if (!Number.isFinite(confidence) || confidence <= 0) return;
    if (confidence > 1 && confidence <= 100) confidence /= 100;
    if (confidence > 0 && confidence <= 1) candidates.push(confidence);
  };

  collect(result.confidence);
  const utterances = Array.isArray(result.utterances) ? result.utterances : [];
  utterances.forEach((utterance) => {
    collect(utterance?.confidence);
    (Array.isArray(utterance?.words) ? utterance.words : []).forEach((word) => collect(word?.confidence));
  });
  if (!candidates.length) return null;
  return Number((candidates.reduce((sum, value) => sum + value, 0) / candidates.length).toFixed(4));
}

function extractAsrUtteranceCount(payload) {
  const result = payload?.result || payload || {};
  return Array.isArray(result.utterances) ? result.utterances.filter((item) => String(item?.text || "").trim()).length : 0;
}

function uint32be(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0, 0);
  return buffer;
}

function getLegacySpeechCredentials(kind) {
  return {
    appId: process.env[`ARK_${kind}_APP_ID`] || process.env.ARK_SPEECH_APP_ID || "",
    accessKey: process.env[`ARK_${kind}_ACCESS_KEY`] || process.env.ARK_SPEECH_ACCESS_KEY || "",
  };
}

function hasLegacySpeechCredentials(kind) {
  const legacy = getLegacySpeechCredentials(kind);
  return Boolean(legacy.appId && legacy.accessKey);
}

function stripDataUrl(value) {
  const text = String(value || "");
  const index = text.indexOf(",");
  return text.startsWith("data:") && index >= 0 ? text.slice(index + 1) : text;
}

function createTransientAudioUrl(request, audioData, mimeType) {
  cleanupTransientAudioFiles();
  const id = crypto.randomUUID();
  const buffer = Buffer.from(stripDataUrl(audioData), "base64");
  transientAudioFiles.set(id, {
    buffer,
    mimeType: normalizeAudioMimeType(mimeType, audioData),
    expiresAt: Date.now() + transientAudioTtlMs,
  });
  const baseUrl = getPublicBaseUrl(request);
  return `${baseUrl}/api/speech/audio/${id}`;
}

function serveTransientAudio(pathname, response) {
  cleanupTransientAudioFiles();
  const id = pathname.split("/").pop();
  const item = transientAudioFiles.get(id);
  if (!item) {
    sendJson(response, 404, { error: "Audio not found" });
    return;
  }
  response.writeHead(200, {
    "Content-Type": item.mimeType || "audio/wav",
    "Content-Length": item.buffer.length,
    "Cache-Control": "no-store",
  });
  response.end(item.buffer);
}

function cleanupTransientAudioFiles() {
  const now = Date.now();
  for (const [id, item] of transientAudioFiles.entries()) {
    if (!item || item.expiresAt <= now) transientAudioFiles.delete(id);
  }
}

function getPublicBaseUrl(request) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  const proto = String(request.headers["x-forwarded-proto"] || "http").split(",")[0].trim() || "http";
  const host = String(request.headers["x-forwarded-host"] || request.headers.host || "").split(",")[0].trim();
  return `${proto}://${host}`;
}

function normalizeAudioMimeType(mimeType, audioData) {
  const fromDataUrl = String(audioData || "").match(/^data:([^;,]+)/)?.[1] || "";
  return String(mimeType || fromDataUrl || "audio/wav").split(";")[0] || "audio/wav";
}

function inferAudioFormat(mimeType, audioData, audioUrl) {
  const normalized = normalizeAudioMimeType(mimeType, audioData).toLowerCase();
  if (normalized.includes("mpeg") || normalized.includes("mp3")) return "mp3";
  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("wav") || normalized.includes("wave")) return "wav";
  const ext = String(audioUrl || "").split("?")[0].split(".").pop()?.toLowerCase();
  if (["mp3", "ogg", "wav"].includes(ext)) return ext;
  return "wav";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function applySecurityHeaders(response, request) {
  Object.entries(securityHeaders).forEach(([name, value]) => response.setHeader(name, value));
  const proto = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  if (proto === "https" || request.socket?.encrypted) {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

function safeRequestPath(value) {
  try {
    return new URL(value || "/", "http://localhost").pathname.slice(0, 300);
  } catch {
    return "/invalid";
  }
}

function clientKey(request) {
  const remote = String(request.socket?.remoteAddress || "unknown").replace(/^::ffff:/, "").slice(0, 120);
  const trustedProxy = remote === "127.0.0.1" || remote === "::1";
  const forwarded = String(request.headers["x-forwarded-for"] || "").split(",").map((item) => item.trim()).filter(Boolean);
  const raw = trustedProxy ? String(request.headers["x-real-ip"] || "").trim() || forwarded.at(-1) || remote : remote;
  return createHash("sha256").update(`${process.env.RATE_LIMIT_SALT || "lezhi-local"}:${raw}`).digest("hex").slice(0, 16);
}

function consumeRateLimit(key, windowMs, max) {
  const now = Date.now();
  const previous = requestBuckets.get(key);
  const bucket = !previous || previous.resetAt <= now ? { count: 0, resetAt: now + windowMs } : previous;
  bucket.count += 1;
  requestBuckets.set(key, bucket);
  if (requestBuckets.size > 5000) {
    for (const [itemKey, item] of requestBuckets.entries()) {
      if (item.resetAt <= now) requestBuckets.delete(itemKey);
    }
  }
  return bucket.count <= max;
}

function enterApiPolicy(request, response, pathname, policy) {
  const ip = clientKey(request);
  const multiplier = Math.max(0.1, Number(process.env.API_RATE_LIMIT_MULTIPLIER || 1));
  const key = `${pathname}:${ip}`;
  const globalKey = `${pathname}:global`;
  if (!consumeRateLimit(key, policy.windowMs, Math.max(1, Math.floor(multiplier * policy.max))) || !consumeRateLimit(globalKey, policy.windowMs, Math.max(1, Math.floor(multiplier * policy.globalMax)))) {
    response.setHeader("Retry-After", String(Math.ceil(policy.windowMs / 1000)));
    logEvent("rate_limited", { path: pathname, ip });
    sendJson(response, 429, { error: "Too many requests", message: "请求有点多，请稍后再试。" });
    return false;
  }
  const activeKey = `${pathname}:${ip}`;
  const globalActiveKey = `${pathname}:global`;
  const active = activeRequests.get(activeKey) || 0;
  const globalActive = activeRequests.get(globalActiveKey) || 0;
  if (active >= policy.concurrent || globalActive >= policy.globalConcurrent) {
    response.setHeader("Retry-After", "2");
    logEvent("concurrency_limited", { path: pathname, ip, active, globalActive });
    sendJson(response, 429, { error: "Too many concurrent requests", message: "老师正在处理上一条，请稍等一下。" });
    return false;
  }
  activeRequests.set(activeKey, active + 1);
  activeRequests.set(globalActiveKey, globalActive + 1);
  return true;
}

function leaveApiPolicy(pathname, ip) {
  for (const key of [`${pathname}:${ip}`, `${pathname}:global`]) {
    const next = Math.max(0, (activeRequests.get(key) || 1) - 1);
    if (next) activeRequests.set(key, next);
    else activeRequests.delete(key);
  }
}

function isAllowedOrigin(request) {
  const origin = String(request.headers.origin || "").trim();
  if (!origin) return process.env.ALLOW_ORIGINLESS_WS === "true";
  try {
    const parsed = new URL(origin);
    const requestHost = String(request.headers["x-forwarded-host"] || request.headers.host || "").split(",")[0].trim().toLowerCase();
    const configured = String(process.env.ALLOWED_ORIGINS || process.env.PUBLIC_BASE_URL || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => new URL(item).origin);
    return parsed.host.toLowerCase() === requestHost || configured.includes(parsed.origin);
  } catch {
    return false;
  }
}

function decodeRealtimeAudio(value) {
  const text = String(value || "");
  if (!text) return Buffer.alloc(0);
  if (text.length > 1_100_000 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text) || text.length % 4 !== 0) {
    throw new Error("Realtime audio too large or invalid");
  }
  return Buffer.from(text, "base64");
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 15_000, response = null) {
  const controller = new AbortController();
  let timedOut = false;
  const onClose = () => controller.abort();
  response?.once?.("close", onClose);
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    if (response?.destroyed) controller.abort();
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (timedOut) {
      const timeoutError = new Error("Upstream request timed out");
      timeoutError.code = "UPSTREAM_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
    response?.off?.("close", onClose);
  }
}

function validateAudioData(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length > 950_000 || !/^data:audio\/(?:wav|wave|webm|ogg|mpeg|mp3)(?:;[^,]*)?;base64,[A-Za-z0-9+/\r\n]+={0,2}$/i.test(text)) {
    const error = new Error("audioData must be a supported audio data URL below the size limit");
    error.code = "INVALID_INPUT";
    throw error;
  }
  return text;
}

function validateAudioMimeType(value, audioData) {
  const fromData = String(audioData || "").match(/^data:([^;,]+)/i)?.[1] || "";
  const mime = String(value || fromData || "audio/wav").split(";")[0].toLowerCase();
  if (!new Set(["audio/wav", "audio/wave", "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp3"]).has(mime)) {
    const error = new Error("Unsupported audio MIME type");
    error.code = "INVALID_INPUT";
    throw error;
  }
  return mime;
}

function validateText(value, name, maxLength, { required = false } = {}) {
  const text = String(value || "").trim();
  if ((required && !text) || text.length > maxLength || /[\u0000\u000b\u000c\u007f]/.test(text)) {
    const error = new Error(`${name} must be ${required ? "non-empty and " : ""}no longer than ${maxLength} characters`);
    error.code = "INVALID_INPUT";
    throw error;
  }
  return text;
}

function logEvent(type, payload = {}) {
  const safe = JSON.parse(JSON.stringify(payload, (_key, value) => {
    if (typeof value !== "string") return value;
    return value.replace(/Bearer\s+[\w.-]+/gi, "Bearer [hidden]").slice(0, 500);
  }));
  console.log(JSON.stringify({ ts: new Date().toISOString(), type, ...safe }));
}

function isAllowedStaticPath(relativePath) {
  if (staticTopLevelAllowlist.has(relativePath)) return true;
  if (relativePath.startsWith("assets/")) return /\.(?:png|jpe?g|webp|avif|svg)$/i.test(relativePath);
  if (relativePath.startsWith("teaching-engine/")) {
    const name = relativePath.slice("teaching-engine/".length);
    return !name.includes("/") && staticTeachingAllowlist.has(name);
  }
  return false;
}

async function serveStatic(pathname, response, headOnly, versioned = false, request = null) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  } catch {
    sendJson(response, 400, { error: "Invalid path" });
    return;
  }
  const normalized = normalize(decoded).replace(/^[/\\]+/, "");
  const filePath = join(root, normalized);
  const relativePath = relative(root, filePath).replaceAll("\\", "/");

  if (!relativePath || relativePath.startsWith("../") || !isAllowedStaticPath(relativePath)) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  if (!existsSync(filePath)) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }
  const resolvedRoot = await realpath(root);
  const resolvedFile = await realpath(filePath);
  if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(`${resolvedRoot}/`)) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  const ext = extname(filePath);
  const immutable = relativePath !== "index.html" && versioned;
  const raw = await readFile(filePath);
  const canGzip = /\.(?:html|css|js|json|svg)$/i.test(ext) && raw.length >= 1024 && /(?:^|,)\s*gzip\s*(?:,|$)/i.test(String(request?.headers?.["accept-encoding"] || ""));
  const body = canGzip ? gzipSync(raw, { level: 6 }) : raw;
  response.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Content-Length": body.length,
    "Cache-Control": relativePath === "index.html" ? "no-cache" : immutable ? "public, max-age=31536000, immutable" : "public, max-age=3600",
    ...(canGzip ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}),
  });

  if (!headOnly) response.end(body);
  else response.end();
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let settled = false;
    const limit = Number(process.env.MAX_JSON_BODY_BYTES || 1_000_000);
    const rejectOnce = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    request.on("data", (chunk) => {
      if (settled) return;
      body += chunk;
      if (Buffer.byteLength(body) > limit) {
        const error = new Error("Request body too large");
        error.code = "REQUEST_TOO_LARGE";
        rejectOnce(error);
        request.resume();
      }
    });
    request.on("end", () => {
      if (settled) return;
      try {
        const parsed = body ? JSON.parse(body) : {};
        settled = true;
        resolve(parsed);
      } catch {
        const error = new Error("Invalid JSON body");
        error.code = "INVALID_INPUT";
        rejectOnce(error);
      }
    });
    request.on("error", rejectOnce);
    request.on("aborted", () => rejectOnce(new Error("Client aborted request")));
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

function createTtsErrorHint(raw) {
  const text = String(raw || "");
  if (/requested resource not granted|resource.*not granted|not granted/i.test(text)) {
    return "火山语音合成资源没有授权。请检查 ARK_TTS_RESOURCE_ID 和 ARK_TTS_SPEAKER 是否是当前 Key 已开通的资源。";
  }
  if (/unauthorized|forbidden|invalid.*key|api.?key/i.test(text)) {
    return "火山语音合成 Key 无效或没有权限。请检查 ARK_TTS_API_KEY 或 ARK_SPEECH_API_KEY。";
  }
  if (/speaker|voice/i.test(text)) {
    return "音色参数可能不可用。请在火山语音合成控制台确认 ARK_TTS_SPEAKER。";
  }
  return "豆包语音合成接口返回异常。请检查 TTS Key、资源 ID、音色 ID、额度和火山控制台权限。";
}

function sanitizeMessage(error) {
  return String(error?.message || error || "Unknown error").replace(/Bearer\s+[\w.-]+/g, "Bearer [hidden]");
}

function naturalizeSpeechText(text) {
  const prepared = String(text || "")
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
    .replace(/[：:]/g, "，");
  const naturalized = globalThis.LezhiChildLanguage?.toSpokenText?.(prepared) || prepared;
  return naturalized
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
