import { createHash, randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { normalizeUsername, validateChildName, validatePassword, validateRecoveryCode } from "./account-store.mjs";

const SESSION_COOKIE = "lezhi_session";
const DAY = 86_400_000;

export class AccountApi {
  constructor(store, options = {}) {
    this.store = store;
    this.sessions = new Map();
    this.rate = new Map();
    this.sessionTtlMs = Number(options.sessionTtlMs || 30 * DAY);
    this.sessionFile = join(options.dataDirectory || store.directory, "sessions.json");
    this.persistQueue = Promise.resolve();
  }

  async init() {
    if (!existsSync(this.sessionFile)) return;
    try {
      const rows = JSON.parse(await readFile(this.sessionFile, "utf8"));
      for (const session of Array.isArray(rows) ? rows : []) {
        if (session?.key && session?.accountId && session.expiresAt > Date.now()) this.sessions.set(session.key, session);
      }
    } catch {}
  }

  matches(pathname) {
    return pathname.startsWith("/api/auth/") || pathname.startsWith("/api/account/");
  }

  async handle(request, response, url, helpers) {
    const { sendJson, readJsonBody, clientKey } = helpers;
    if (!this.matches(url.pathname)) return false;
    const send = (status, payload, headers = {}) => sendJson(response, status, payload, headers);

    if (request.method === "GET" && url.pathname === "/api/auth/session") {
      const session = this.getSession(request);
      if (!session) return send(200, { authenticated: false }), true;
      const account = this.store.getAccount(session.accountId);
      if (!account) {
        this.sessions.delete(session.key);
        return send(200, { authenticated: false }, { "Set-Cookie": clearCookie(request) }), true;
      }
      if (session.childId && !account.children.some((child) => child.id === session.childId)) session.childId = "";
      return send(200, sessionPayload(account, session)), true;
    }

    if (request.method === "GET" && url.pathname === "/api/account/history") {
      const session = this.requireSession(request, send);
      if (!session) return true;
      if (!session.childId) return send(409, { error: "No child selected", message: "请先创建并选择孩子档案。" }), true;
      const history = this.store.history(session.accountId, session.childId);
      return history ? (send(200, { history }), true) : (send(404, { error: "Child not found" }), true);
    }

    if (request.method !== "POST" && request.method !== "PATCH" && request.method !== "DELETE") {
      return send(405, { error: "Method not allowed" }), true;
    }
    if (!sameOrigin(request)) return send(403, { error: "Forbidden", message: "请求来源无法验证。" }), true;
    if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
      return send(415, { error: "Content-Type must be application/json" }), true;
    }

    if (url.pathname === "/api/auth/register" && request.method === "POST") {
      if (!this.limit(`register:${clientKey(request)}`, 60 * 60_000, 8)) return sendLimited(send), true;
      const body = await readJsonBody(request, 16_384);
      const username = normalizeUsername(body.username);
      const password = validatePassword(body.password);
      const childName = body.childName ? validateChildName(body.childName) : "";
      const result = await this.store.createAccount({ username, password, childName });
      if (result.conflict) return send(409, { error: "Username unavailable", message: "这个用户名已经被使用。" }), true;
      const session = await this.createSession(result.account.id, result.account.children[0]?.id || "");
      return send(201, { ...sessionPayload(result.account, session), recoveryCode: result.recoveryCode }, { "Set-Cookie": sessionCookie(request, session.cookieToken, this.sessionTtlMs) }), true;
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      if (!this.limit(`login:${clientKey(request)}`, 15 * 60_000, 12)) return sendLimited(send), true;
      const body = await readJsonBody(request, 16_384);
      const account = await this.store.verifyPassword(body.username, String(body.password || ""));
      if (!account) return send(401, { error: "Invalid credentials", message: "用户名或密码不正确。" }), true;
      const session = this.createSession(account.id, account.children[0]?.id || "");
      return send(200, sessionPayload(account, session), { "Set-Cookie": sessionCookie(request, session.cookieToken, this.sessionTtlMs) }), true;
    }

    if (url.pathname === "/api/auth/recover" && request.method === "POST") {
      if (!this.limit(`recover:${clientKey(request)}`, 60 * 60_000, 6)) return sendLimited(send), true;
      const body = await readJsonBody(request, 16_384);
      const result = await this.store.resetPassword({ username: normalizeUsername(body.username), recoveryCode: validateRecoveryCode(body.recoveryCode), password: validatePassword(body.password) });
      if (!result) return send(401, { error: "Invalid recovery", message: "用户名或找回码不正确。" }), true;
      this.revokeAccountSessions(result.account.id);
      const session = await this.createSession(result.account.id, result.account.children[0]?.id || "");
      return send(200, { ...sessionPayload(result.account, session), recoveryCode: result.recoveryCode }, { "Set-Cookie": sessionCookie(request, session.cookieToken, this.sessionTtlMs) }), true;
    }

    const session = this.requireSession(request, send);
    if (!session) return true;
    if (!csrfMatches(request, session)) return send(403, { error: "CSRF check failed", message: "页面已过期，请刷新后重试。" }), true;

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      this.sessions.delete(session.key);
      await this.persistSessions();
      return send(200, { ok: true }, { "Set-Cookie": clearCookie(request) }), true;
    }

    if (url.pathname === "/api/account/children" && request.method === "POST") {
      const body = await readJsonBody(request, 16_384);
      const result = await this.store.createChild(session.accountId, validateChildName(body.name));
      if (result.limit) return send(409, { error: "Child limit", message: "一个家长账号最多创建8个孩子档案。" }), true;
      session.childId ||= result.child.id;
      await this.persistSessions();
      return send(201, { child: result.child, currentChildId: session.childId }), true;
    }

    const childMatch = url.pathname.match(/^\/api\/account\/children\/([0-9a-f-]{36})$/i);
    if (childMatch && request.method === "PATCH") {
      const body = await readJsonBody(request, 16_384);
      const child = await this.store.renameChild(session.accountId, childMatch[1], validateChildName(body.name));
      return child ? (send(200, { child }), true) : (send(404, { error: "Child not found" }), true);
    }
    if (childMatch && request.method === "DELETE") {
      const removed = await this.store.deleteChild(session.accountId, childMatch[1]);
      if (!removed) return send(404, { error: "Child not found" }), true;
      if (session.childId === childMatch[1]) session.childId = this.store.getAccount(session.accountId)?.children[0]?.id || "";
      await this.persistSessions();
      return send(200, { ok: true, currentChildId: session.childId }), true;
    }

    if (url.pathname === "/api/account/daily-goal" && request.method === "POST") {
      if (!session.childId) return send(409, { error: "No child selected", message: "请先选择孩子档案。" }), true;
      const body = await readJsonBody(request, 16_384);
      const child = await this.store.setDailyGoal(session.accountId, session.childId, body.value);
      return child ? (send(200, { child }), true) : (send(404, { error: "Child not found" }), true);
    }

    if (url.pathname === "/api/account/active-child" && request.method === "POST") {
      const body = await readJsonBody(request, 16_384);
      const child = this.store.getChild(session.accountId, String(body.childId || ""));
      if (!child) return send(404, { error: "Child not found" }), true;
      session.childId = child.id;
      await this.persistSessions();
      return send(200, { currentChildId: child.id, child }), true;
    }

    if (url.pathname === "/api/account/history") {
      if (!session.childId) return send(409, { error: "No child selected", message: "请先创建并选择孩子档案。" }), true;
      if (request.method === "POST") {
        const body = await readJsonBody(request, 64_000);
        const entry = sanitizeHistory(body);
        await this.store.recordHistory(session.accountId, session.childId, entry);
        return send(201, { entry }), true;
      }
      if (request.method === "DELETE") {
        await this.store.clearHistory(session.accountId, session.childId);
        return send(200, { ok: true }), true;
      }
    }

    return send(404, { error: "Not found" }), true;
  }

  getSession(request) {
    this.cleanup();
    const token = parseCookies(request.headers.cookie || "")[SESSION_COOKIE] || "";
    const key = sessionKey(token);
    const session = this.sessions.get(key);
    if (!session || session.expiresAt <= Date.now()) return null;
    session.expiresAt = Date.now() + this.sessionTtlMs;
    return session;
  }

  requireSession(request, send) {
    const session = this.getSession(request);
    if (!session) send(401, { error: "Authentication required", message: "请先登录。" }, { "Set-Cookie": clearCookie(request) });
    return session;
  }

  async createSession(accountId, childId) {
    const cookieToken = randomBytes(32).toString("base64url");
    const key = sessionKey(cookieToken);
    const session = { key, cookieToken, accountId, childId, csrfToken: randomBytes(24).toString("base64url"), expiresAt: Date.now() + this.sessionTtlMs };
    this.sessions.set(key, session);
    await this.persistSessions();
    return session;
  }

  revokeAccountSessions(accountId) {
    for (const [id, session] of this.sessions) if (session.accountId === accountId) this.sessions.delete(id);
    void this.persistSessions();
  }

  persistSessions() {
    const task = this.persistQueue.then(async () => {
      const temporary = `${this.sessionFile}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
      const persisted = [...this.sessions.values()].map(({ cookieToken: _cookieToken, ...session }) => session);
      await writeFile(temporary, `${JSON.stringify(persisted)}\n`, { mode: 0o600 });
      await rename(temporary, this.sessionFile);
    });
    this.persistQueue = task.catch(() => {});
    return task;
  }

  limit(key, windowMs, max) {
    const now = Date.now();
    const bucket = this.rate.get(key);
    const current = !bucket || bucket.resetAt <= now ? { count: 0, resetAt: now + windowMs } : bucket;
    current.count += 1;
    this.rate.set(key, current);
    return current.count <= max;
  }

  cleanup() {
    const now = Date.now();
    for (const [id, session] of this.sessions) if (session.expiresAt <= now) this.sessions.delete(id);
    for (const [key, bucket] of this.rate) if (bucket.resetAt <= now) this.rate.delete(key);
  }
}

function sessionPayload(account, session) {
  return { authenticated: true, account, currentChildId: session.childId || "", csrfToken: session.csrfToken };
}
function normalize(value) {
  const username = String(value || "").trim().toLowerCase();
  if (!/^[a-z][a-z0-9_]{3,31}$/.test(username)) throw invalid("用户名需以字母开头，使用4—32位字母、数字或下划线。", "username");
  return username;
}
function validatePasswordValue(value) {
  const password = String(value || "");
  if (password.length < 10 || password.length > 72 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) throw invalid("密码需为10—72位，并同时包含字母和数字。", "password");
  return password;
}
function validateChildNameValue(value) {
  const name = String(value || "").trim();
  if (!name || name.length > 20 || /[\u0000-\u001f\u007f<>]/.test(name)) throw invalid("孩子称呼需为1—20个字符。", "childName");
  return name;
}
function validateRecovery(value) {
  const code = String(value || "").trim().toUpperCase().replace(/\s/g, "");
  if (!/^[A-Z0-9-]{12,24}$/.test(code)) throw invalid("找回码格式不正确。", "recoveryCode");
  return code;
}
function invalid(message, field) {
  const error = new Error(message); error.code = "INVALID_INPUT"; error.field = field; return error;
}
function sanitizeHistory(input) {
  const text = (value, max) => String(value || "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
  const number = (value, max) => Math.min(max, Math.max(0, Number(value) || 0));
  const sessionId = text(input.sessionId, 80).replace(/[^a-zA-Z0-9_-]/g, "");
  return {
    sessionId, topic: text(input.topic, 120), title: text(input.title, 100), volume: text(input.volume, 40), at: Date.now(),
    outcome: ["passed", "incomplete", "review"].includes(input.outcome) ? input.outcome : "review",
    independent: number(input.independent, 100), assisted: number(input.assisted, 100), seconds: number(input.seconds, 3600),
    voice: { accepted: number(input.voice?.accepted, 1000), uncertain: number(input.voice?.uncertain, 1000) },
    response: { count: number(input.response?.count, 1000), totalMs: number(input.response?.totalMs, 3_600_000) },
    difficulty: { level: Math.max(-2, Math.min(2, Number(input.difficulty?.level) || 0)), changes: number(input.difficulty?.changes, 100) },
  };
}
function parseCookies(value) {
  return Object.fromEntries(String(value).split(";").map((part) => part.trim().split("=")).filter(([key, val]) => key && val).map(([key, val]) => [key, decodeURIComponent(val)]));
}
function sameOrigin(request) {
  const origin = String(request.headers.origin || "");
  if (!origin) return false;
  try {
    const host = String(request.headers["x-forwarded-host"] || request.headers.host || "").split(",")[0].trim().toLowerCase();
    return new URL(origin).host.toLowerCase() === host;
  } catch { return false; }
}
function csrfMatches(request, session) {
  const value = String(request.headers["x-lezhi-csrf"] || "");
  return value && value.length === session.csrfToken.length && value === session.csrfToken;
}
function sessionKey(value) {
  return createHash("sha256").update(String(value || "")).digest("hex");
}
function sessionCookie(request, id, ttl) {
  const secure = isHttps(request) ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(ttl / 1000)}${secure}`;
}
function clearCookie(request) {
  const secure = isHttps(request) ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}
function isHttps(request) {
  return String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https" || Boolean(request.socket?.encrypted);
}
function sendLimited(send) {
  return send(429, { error: "Too many requests", message: "尝试次数较多，请稍后再试。" }, { "Retry-After": "900" });
}
