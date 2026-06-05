export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    response.status(500).json({
      error: "Missing ARK_API_KEY",
      detail: "请先在部署平台环境变量里配置 ARK_API_KEY。",
    });
    return;
  }

  const input = request.body || {};
  const prompt = String(input.prompt || "").trim();
  if (!prompt) {
    response.status(400).json({ error: "Missing prompt" });
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

  try {
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
      response.status(upstreamResponse.status).json({
        error: "Image generation failed",
        detail: summarizeUpstreamError(payload),
      });
      return;
    }

    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      error: "Image request failed",
      detail: sanitizeMessage(error),
    });
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
