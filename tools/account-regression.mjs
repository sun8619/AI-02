import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const root = new URL("../", import.meta.url);
const dataDir = await mkdtemp(join(tmpdir(), "lezhi-account-test-"));
const probe = createServer(); probe.listen(0, "127.0.0.1"); await once(probe, "listening");
const port = probe.address().port; await new Promise((resolve) => probe.close(resolve));
const base = `http://127.0.0.1:${port}`;
let server;
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

async function start() {
  server = spawn(process.execPath, ["server.mjs"], { cwd: root, env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), ACCOUNT_DATA_DIR: dataDir, ARK_API_KEY: "", ARK_ASR_API_KEY: "", ARK_TTS_API_KEY: "" }, stdio: "ignore" });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(`${base}/api/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Account test server readiness timeout");
}
async function stop() { if (server?.exitCode === null) { server.kill(); await once(server, "exit"); } }
async function api(path, { method = "GET", body, cookie = "", csrf = "" } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  if (csrf) headers["x-lezhi-csrf"] = csrf;
  if (method !== "GET") headers.origin = base;
  const response = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: "manual" });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload, cookie: response.headers.get("set-cookie")?.split(";")[0] || cookie };
}

try {
  await start();
  const guestModel = await api("/api/learning/turn", { method: "POST", body: { text: "1" } });
  assert(guestModel.status === 401, `guest model status ${guestModel.status}`);
  const badOrigin = await fetch(`${base}/api/auth/register`, { method: "POST", headers: { "content-type": "application/json", origin: "https://evil.example" }, body: JSON.stringify({ username: "parent1", password: "securepass123", childName: "乐乐" }) });
  assert(badOrigin.status === 403, `bad origin register status ${badOrigin.status}`);

  const a = await api("/api/auth/register", { method: "POST", body: { username: "parent1", password: "securepass123", childName: "乐乐" } });
  assert(a.status === 201 && a.payload.authenticated && a.payload.recoveryCode, `register A failed ${a.status}`);
  const csrfA = a.payload.csrfToken;
  const childA = a.payload.currentChildId;
  const duplicate = await api("/api/auth/register", { method: "POST", body: { username: "parent1", password: "securepass123", childName: "另一个" } });
  assert(duplicate.status === 409, `duplicate status ${duplicate.status}`);
  const weak = await api("/api/auth/register", { method: "POST", body: { username: "parent2", password: "short", childName: "小朋友" } });
  assert(weak.status === 400, `weak password status ${weak.status}`);

  const historyRow = { sessionId: "s1", topic: "g1-u1", title: "比大小", volume: "一年级", outcome: "passed", independent: 2, assisted: 0, seconds: 70 };
  const recordA = await api("/api/account/history", { method: "POST", cookie: a.cookie, csrf: csrfA, body: historyRow });
  assert(recordA.status === 201, `record A status ${recordA.status}`);
  const historyA = await api("/api/account/history", { cookie: a.cookie });
  assert(historyA.payload.history?.length === 1 && historyA.payload.history[0].topic === "g1-u1", "A history missing");

  const child2 = await api("/api/account/children", { method: "POST", cookie: a.cookie, csrf: csrfA, body: { name: "安安" } });
  assert(child2.status === 201, `child create status ${child2.status}`);
  const switch2 = await api("/api/account/active-child", { method: "POST", cookie: a.cookie, csrf: csrfA, body: { childId: child2.payload.child.id } });
  assert(switch2.status === 200, `child switch status ${switch2.status}`);
  const emptyHistory = await api("/api/account/history", { cookie: a.cookie });
  assert(emptyHistory.payload.history?.length === 0, "child histories not isolated");

  const b = await api("/api/auth/register", { method: "POST", body: { username: "parentb", password: "securepass456", childName: "贝贝" } });
  assert(b.status === 201, `register B failed ${b.status}`);
  const crossDelete = await api(`/api/account/children/${childA}`, { method: "DELETE", cookie: b.cookie, csrf: b.payload.csrfToken, body: {} });
  assert(crossDelete.status === 404, `cross-account child access status ${crossDelete.status}`);
  const csrfFail = await api("/api/account/children", { method: "POST", cookie: a.cookie, body: { name: "越权" } });
  assert(csrfFail.status === 403, `missing csrf status ${csrfFail.status}`);

  await stop(); await start();
  const restored = await api("/api/auth/session", { cookie: a.cookie });
  assert(restored.payload.authenticated && restored.payload.currentChildId === child2.payload.child.id, "session did not survive restart");

  const stored = JSON.parse(await readFile(join(dataDir, "accounts.json"), "utf8"));
  const text = JSON.stringify(stored);
  assert(!text.includes("securepass123") && !text.includes(a.payload.recoveryCode), "plaintext secret stored");
  const sessionsText = await readFile(join(dataDir, "sessions.json"), "utf8");
  assert(!sessionsText.includes(a.cookie.split("=")[1]), "raw session token stored");
  const recovered = await api("/api/auth/recover", { method: "POST", body: { username: "parent1", recoveryCode: a.payload.recoveryCode, password: "newsecure789" } });
  assert(recovered.status === 200 && recovered.payload.recoveryCode !== a.payload.recoveryCode, `recovery failed ${recovered.status}`);
  const oldPassword = await api("/api/auth/login", { method: "POST", body: { username: "parent1", password: "securepass123" } });
  const newPassword = await api("/api/auth/login", { method: "POST", body: { username: "parent1", password: "newsecure789" } });
  assert(oldPassword.status === 401 && newPassword.status === 200, "password reset behavior invalid");

  if (failures.length) throw new Error(failures.join("\n"));
  console.log("PASS account: registration, authentication, CSRF, persistent sessions, recovery and account/child isolation");
} finally {
  await stop();
  await rm(dataDir, { recursive: true, force: true });
}
