import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { WebSocket } from "ws";

const root = new URL("../", import.meta.url);
const probe = createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["server.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: String(port),
    ARK_API_KEY: "",
    ARK_ASR_API_KEY: "",
    ARK_TTS_API_KEY: "",
    ACCOUNT_DATA_DIR: await (async()=>{const {mkdtemp}=await import("node:fs/promises");const {join}=await import("node:path");const {tmpdir}=await import("node:os");return mkdtemp(join(tmpdir(),"lezhi-security-"));})(),
    API_RATE_LIMIT_MULTIPLIER: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error("security test server exited before readiness");
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!ready) throw new Error("security test server readiness timeout");

  for (const path of ["/.env", "/package.json", "/package-lock.json", "/tools/update-server.sh", "/release.json", "/account-store.mjs", "/account-api.mjs", "/data/accounts/accounts.json", "/data/accounts/sessions.json", "/teaching-engine/app.js", "/docs/README.md", "/%2e%2e/package.json"]) {
    const response = await fetch(`${base}${path}`);
    assert(response.status === 404 || response.status === 400, `${path} exposed with status ${response.status}`);
  }

  const html = await fetch(`${base}/`);
  assert(html.status === 200, `home status ${html.status}`);
  assert(html.headers.get("cache-control") === "no-cache", `home cache ${html.headers.get("cache-control")}`);
  assert(Boolean(html.headers.get("content-security-policy")), "missing CSP");
  assert(html.headers.get("x-content-type-options") === "nosniff", "missing nosniff");
  assert(html.headers.get("x-frame-options") === "DENY", "missing frame denial");
  assert(html.headers.get("referrer-policy") === "no-referrer", "missing referrer policy");
  assert(Boolean(html.headers.get("permissions-policy")), "missing permissions policy");

  const staticAsset = await fetch(`${base}/app.js?v=98`, { headers: { "accept-encoding": "gzip" } });
  assert(staticAsset.status === 200, `app.js status ${staticAsset.status}`);
  assert(/immutable/.test(staticAsset.headers.get("cache-control") || ""), `app.js cache ${staticAsset.headers.get("cache-control")}`);
  assert(staticAsset.headers.get("content-encoding") === "gzip", `app.js encoding ${staticAsset.headers.get("content-encoding")}`);

  const healthPayload = await (await fetch(`${base}/api/health`)).json();
  assert(!("modelRoles" in healthPayload) && !("voice" in healthPayload) && !("arkBaseUrl" in healthPayload) && !("hasApiKey" in healthPayload), "health endpoint exposed provider implementation details");
  const robots = await fetch(`${base}/robots.txt`);
  assert(robots.status === 200 && /Disallow:\s*\//.test(await robots.text()), "private preview robots policy missing");
  const manifest = await fetch(`${base}/manifest.webmanifest?v=1`);
  assert(manifest.status === 200, `manifest status ${manifest.status}`);

  const register = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ username: "security_parent", password: "securitypass123", childName: "测试孩子" }),
  });
  const registerPayload = await register.json();
  const authCookie = register.headers.get("set-cookie")?.split(";")[0] || "";
  const authHeaders = { "content-type": "application/json", origin: base, cookie: authCookie, "x-lezhi-csrf": registerPayload.csrfToken };
  assert(register.status === 201 && authCookie && registerPayload.csrfToken, "security test account registration failed");
  const guestProtected = await fetch(`${base}/api/learning/turn`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "1" }) });
  assert(guestProtected.status === 401, `guest protected API status ${guestProtected.status}`);

  const invalidText = await fetch(`${base}/api/learning/turn`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ text: "x".repeat(301) }),
  });
  const invalidPayload = await invalidText.json();
  assert(invalidText.status === 400, `long text status ${invalidText.status}`);
  assert(!("detail" in invalidPayload) && !("hint" in invalidPayload) && !("logId" in invalidPayload), "invalid request exposed internal diagnostics");

  const remoteAudio = await fetch(`${base}/api/speech/transcriptions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ audioUrl: "http://127.0.0.1/private" }),
  });
  assert(remoteAudio.status === 400, `remote audio accepted with status ${remoteAudio.status}`);

  const imageUnavailable = await fetch(`${base}/api/images/generations`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ prompt: "画一个苹果", size: "1K" }),
  });
  const imageUnavailablePayload = await imageUnavailable.json();
  assert(imageUnavailable.status === 503, `unconfigured image status ${imageUnavailable.status}`);
  assert(!("detail" in imageUnavailablePayload) && !("hint" in imageUnavailablePayload) && !("logId" in imageUnavailablePayload), "image response exposed internal diagnostics");
  assert(!/ARK|Key|环境变量|配置|模型|供应商|火山|日志/i.test(JSON.stringify(imageUnavailablePayload)), "image response exposed implementation wording");

  const voiceUnavailable = await fetch(`${base}/api/speech/synthesis`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ text: "我们来学习数学" }),
  });
  const voiceUnavailablePayload = await voiceUnavailable.json();
  assert(voiceUnavailable.status === 503, `unconfigured voice status ${voiceUnavailable.status}`);
  assert(!("detail" in voiceUnavailablePayload) && !("hint" in voiceUnavailablePayload) && !("logId" in voiceUnavailablePayload), "voice response exposed internal diagnostics");
  assert(!/ARK|Key|环境变量|配置|模型|供应商|火山|日志/i.test(JSON.stringify(voiceUnavailablePayload)), "voice response exposed implementation wording");

  const speechUnavailable = await fetch(`${base}/api/speech/transcriptions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ audioData: "data:audio/wav;base64,UklGRg==", mimeType: "audio/wav" }),
  });
  const speechUnavailablePayload = await speechUnavailable.json();
  assert(speechUnavailable.status === 200 && speechUnavailablePayload.mode === "mock", `unconfigured speech status ${speechUnavailable.status}`);
  assert(!("detail" in speechUnavailablePayload) && !("hint" in speechUnavailablePayload) && !("logId" in speechUnavailablePayload), "speech response exposed internal diagnostics");
  assert(!/ARK|Key|环境变量|配置|模型|供应商|火山|日志/i.test(JSON.stringify(speechUnavailablePayload)), "speech response exposed implementation wording");

  const oversized = await fetch(`${base}/api/learning/turn`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ text: "a", padding: "x".repeat(1_050_000) }),
  });
  assert(oversized.status === 413, `oversized body status ${oversized.status}`);

  let limited = false;
  for (let index = 0; index < 32; index += 1) {
    const response = await fetch(`${base}/api/learning/turn`, {
      method: "POST",
      headers: { ...authHeaders, "x-forwarded-for": "203.0.113.11" },
      body: JSON.stringify({ text: "" }),
    });
    if (response.status === 429) {
      limited = true;
      break;
    }
  }
  assert(limited, "HTTP rate limit did not return 429");

  const maliciousOriginStatus = await new Promise((resolve) => {
    const socket = new WebSocket(`ws://127.0.0.1:${port}/api/realtime/voice`, { origin: "https://evil.example", headers: { cookie: authCookie } });
    socket.once("open", () => {
      socket.close();
      resolve(101);
    });
    socket.once("unexpected-response", (_request, response) => resolve(response.statusCode));
    socket.once("error", () => resolve(0));
  });
  assert(maliciousOriginStatus === 403, `malicious websocket origin status ${maliciousOriginStatus}`);

  const validOriginOpened = await new Promise((resolve) => {
    const socket = new WebSocket(`ws://127.0.0.1:${port}/api/realtime/voice`, { origin: base, headers: { cookie: authCookie } });
    socket.once("open", () => {
      socket.close();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
  assert(validOriginOpened, "same-origin websocket did not open");

  if (failures.length) throw new Error(failures.join("\n"));
  console.log("PASS security: static allowlist, headers, cache, input limits, safe error payloads, rate limits and websocket origin policy");
} finally {
  if (child.exitCode === null) {
    child.kill();
    await once(child, "exit");
  }
}
