export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ARK_API_KEY;
  const input = request.body || {};
  const phase = String(input.phase || "guiding");
  const model = selectLearningModel(phase);
  if (!apiKey || !model) {
    response.status(200).json({
      mode: "mock",
      message: "本地模拟 AI 已接管。配置 ARK_API_KEY 和对应教学模型后，会使用火山 Ark 真实模型。",
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
    response.status(400).json({ error: "Missing text" });
    return;
  }

  const payload = {
    model,
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

  try {
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
      response.status(502).json({
        error: "Ark chat failed",
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
        evidenceText: "Ark 返回了非 JSON 回复，已做保守处理。",
        bestStrategy: "拆步骤",
      };
    }

    response.status(200).json({
      mode: "ark",
      ...parsed,
    });
  } catch (error) {
    response.status(500).json({
      error: "Ark chat request failed",
      detail: sanitizeMessage(error),
    });
  }
}

function selectLearningModel(phase) {
  const tutorModel = process.env.ARK_TUTOR_MODEL || process.env.ARK_TEXT_MODEL || "";
  const reasoningModel = process.env.ARK_REASONING_MODEL || tutorModel;
  const evaluationModel = process.env.ARK_EVALUATION_MODEL || reasoningModel;
  if (phase === "teachback" || phase === "repair") return evaluationModel;
  return reasoningModel;
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

function extractJsonObject(content) {
  const text = String(content || "").trim();
  if (text.startsWith("{") && text.endsWith("}")) return text;
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : "{}";
}
