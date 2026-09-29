import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { join } from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const DAY = 86_400_000;
const MAX_CHILDREN = 8;
const MAX_HISTORY = 200;

export class AccountStore {
  constructor(directory) {
    this.directory = directory;
    this.file = join(directory, "accounts.json");
    this.data = { version: 1, accounts: [] };
    this.queue = Promise.resolve();
  }

  async init() {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    if (!existsSync(this.file)) {
      await this.persist();
      return;
    }
    const parsed = JSON.parse(await readFile(this.file, "utf8"));
    if (parsed?.version !== 1 || !Array.isArray(parsed.accounts)) throw new Error("Unsupported account data format");
    this.data = parsed;
    this.pruneHistory();
  }

  async createAccount({ username, password, childName }) {
    const normalized = normalizeUsername(username);
    const recoveryCode = createRecoveryCode();
    const passwordRecord = await hashSecret(password);
    const recoveryRecord = await hashSecret(recoveryCode);
    return this.write(async () => {
      if (this.data.accounts.some((account) => account.username === normalized)) return { conflict: true };
      const accountId = randomUUID();
      const account = {
        id: accountId,
        username: normalized,
        displayUsername: String(username).trim(),
        password: passwordRecord,
        recovery: recoveryRecord,
        children: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      if (childName) account.children.push(createChild(childName));
      this.data.accounts.push(account);
      return { account: publicAccount(account), recoveryCode };
    });
  }

  async verifyPassword(username, password) {
    const account = this.findByUsername(username);
    if (!account || !(await verifySecret(password, account.password))) return null;
    return publicAccount(account);
  }

  async resetPassword({ username, recoveryCode, password }) {
    return this.write(async () => {
      const account = this.findByUsername(username);
      if (!account || !(await verifySecret(recoveryCode, account.recovery))) return null;
      const nextRecoveryCode = createRecoveryCode();
      account.password = await hashSecret(password);
      account.recovery = await hashSecret(nextRecoveryCode);
      account.updatedAt = Date.now();
      return { account: publicAccount(account), recoveryCode: nextRecoveryCode };
    });
  }

  getAccount(accountId) {
    const account = this.data.accounts.find((item) => item.id === accountId);
    return account ? publicAccount(account) : null;
  }

  getChild(accountId, childId) {
    const account = this.data.accounts.find((item) => item.id === accountId);
    const child = account?.children.find((item) => item.id === childId);
    return child ? publicChild(child) : null;
  }

  async createChild(accountId, name) {
    return this.write(async () => {
      const account = this.requireAccount(accountId);
      if (account.children.length >= MAX_CHILDREN) return { limit: true };
      const child = createChild(name);
      account.children.push(child);
      account.updatedAt = Date.now();
      return { child: publicChild(child) };
    });
  }

  async renameChild(accountId, childId, name) {
    return this.write(async () => {
      const account = this.requireAccount(accountId);
      const child = account.children.find((item) => item.id === childId);
      if (!child) return null;
      child.name = String(name).trim();
      child.updatedAt = Date.now();
      account.updatedAt = Date.now();
      return publicChild(child);
    });
  }

  async deleteChild(accountId, childId) {
    return this.write(async () => {
      const account = this.requireAccount(accountId);
      const index = account.children.findIndex((item) => item.id === childId);
      if (index < 0) return false;
      account.children.splice(index, 1);
      account.updatedAt = Date.now();
      return true;
    });
  }

  history(accountId, childId) {
    const account = this.data.accounts.find((item) => item.id === accountId);
    const child = account?.children.find((item) => item.id === childId);
    if (!child) return null;
    const cutoff = Date.now() - 90 * DAY;
    return (child.history || []).filter((row) => row.at >= cutoff).slice(-MAX_HISTORY).map(clone);
  }

  async recordHistory(accountId, childId, entry) {
    return this.write(async () => {
      const account = this.requireAccount(accountId);
      const child = account.children.find((item) => item.id === childId);
      if (!child) return null;
      child.history ||= [];
      const index = entry.sessionId ? child.history.findIndex((item) => item.sessionId === entry.sessionId) : -1;
      if (index >= 0) child.history[index] = { ...child.history[index], ...entry, at: child.history[index].at || entry.at };
      else child.history.push(entry);
      child.history = child.history.filter((row) => row.at >= Date.now() - 90 * DAY).slice(-MAX_HISTORY);
      child.updatedAt = Date.now();
      account.updatedAt = Date.now();
      return clone(entry);
    });
  }

  async setDailyGoal(accountId, childId, value) {
    return this.write(async () => {
      const account = this.requireAccount(accountId);
      const child = account.children.find((item) => item.id === childId);
      if (!child) return null;
      child.dailyGoal = [5, 10, 15, 20].includes(Number(value)) ? Number(value) : 10;
      child.updatedAt = Date.now();
      account.updatedAt = Date.now();
      return publicChild(child);
    });
  }

  async clearHistory(accountId, childId) {
    return this.write(async () => {
      const account = this.requireAccount(accountId);
      const child = account.children.find((item) => item.id === childId);
      if (!child) return false;
      child.history = [];
      child.updatedAt = Date.now();
      account.updatedAt = Date.now();
      return true;
    });
  }

  findByUsername(username) {
    let normalized = "";
    try { normalized = normalizeUsername(username); } catch { return null; }
    return this.data.accounts.find((account) => account.username === normalized) || null;
  }

  requireAccount(accountId) {
    const account = this.data.accounts.find((item) => item.id === accountId);
    if (!account) throw new Error("Account not found");
    return account;
  }

  pruneHistory() {
    const cutoff = Date.now() - 90 * DAY;
    for (const account of this.data.accounts) {
      account.children ||= [];
      for (const child of account.children) child.history = (child.history || []).filter((row) => row?.at >= cutoff).slice(-MAX_HISTORY);
    }
  }

  async write(operation) {
    const task = this.queue.then(async () => {
      const result = await operation();
      await this.persist();
      return result;
    });
    this.queue = task.catch(() => {});
    return task;
  }

  async persist() {
    const temporary = `${this.file}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
    await writeFile(temporary, `${JSON.stringify(this.data, null, 2)}\n`, { mode: 0o600 });
    await rename(temporary, this.file);
  }
}

export function normalizeUsername(value) {
  const username = String(value || "").trim().toLowerCase();
  if (!/^[a-z][a-z0-9_]{3,31}$/.test(username)) throw invalid("用户名需以字母开头，使用4—32位字母、数字或下划线。", "username");
  return username;
}

export function validatePassword(value) {
  const password = String(value || "");
  if (password.length < 10 || password.length > 72 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw invalid("密码需为10—72位，并同时包含字母和数字。", "password");
  }
  return password;
}

export function validateChildName(value) {
  const name = String(value || "").trim();
  if (!name || name.length > 20 || /[\u0000-\u001f\u007f<>]/.test(name)) throw invalid("孩子称呼需为1—20个字符。", "childName");
  return name;
}

export function validateRecoveryCode(value) {
  const code = String(value || "").trim().toUpperCase().replace(/\s/g, "");
  if (!/^[A-Z0-9-]{12,24}$/.test(code)) throw invalid("找回码格式不正确。", "recoveryCode");
  return code;
}

function createChild(name) {
  const now = Date.now();
  return { id: randomUUID(), name: String(name).trim(), dailyGoal: 10, history: [], createdAt: now, updatedAt: now };
}

function publicAccount(account) {
  return { id: account.id, username: account.displayUsername || account.username, children: account.children.map(publicChild), createdAt: account.createdAt };
}

function publicChild(child) {
  return { id: child.id, name: child.name, dailyGoal: [5, 10, 15, 20].includes(Number(child.dailyGoal)) ? Number(child.dailyGoal) : 10, createdAt: child.createdAt, updatedAt: child.updatedAt };
}

async function hashSecret(secret) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(String(secret), salt, 64, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return { algorithm: "scrypt-v1", salt, hash: Buffer.from(derived).toString("hex") };
}

async function verifySecret(secret, record) {
  if (!record?.salt || !record?.hash || record.algorithm !== "scrypt-v1") return false;
  const derived = Buffer.from(await scrypt(String(secret), record.salt, 64, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }));
  const expected = Buffer.from(record.hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

function createRecoveryCode() {
  const raw = randomBytes(10).toString("hex").toUpperCase();
  return `${raw.slice(0, 6)}-${raw.slice(6, 12)}-${raw.slice(12, 20)}`;
}

function invalid(message, field) {
  const error = new Error(message);
  error.code = "INVALID_INPUT";
  error.field = field;
  return error;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
