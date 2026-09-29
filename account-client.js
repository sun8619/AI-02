(() => {
  const state = { session: null, mode: "login", error: "", busy: false, recoveryCode: "", managerOpen: false, ready: false };
  let rerenderApp = () => {};

  async function start(options = {}) {
    if (!globalThis.document?.body) return;
    rerenderApp = options.rerender || rerenderApp;
    await refreshSession();
    if (state.session?.authenticated) await loadHistory();
    state.ready = true;
    renderLayer();
  }

  async function refreshSession() {
    try {
      state.session = await request("/api/auth/session", { method: "GET" });
    } catch {
      state.session = { authenticated: false };
      state.error = "暂时无法连接账户服务，请稍后刷新。";
    }
  }

  async function loadHistory() {
    if (!state.session.currentChildId) {
      window.LezhiHistory?.setRemoteHistory?.([]);
      return;
    }
    try {
      const payload = await request("/api/account/history", { method: "GET" });
      window.LezhiHistory?.setRemoteHistory?.(payload.history || []);
    } catch {
      window.LezhiHistory?.setRemoteHistory?.([]);
    }
    rerenderApp();
  }

  async function recordHistory(entry) {
    if (!state.session?.authenticated || !state.session.currentChildId) return false;
    try {
      await request("/api/account/history", { method: "POST", body: entry });
      return true;
    } catch { return false; }
  }

  async function clearHistory() {
    if (!state.session?.authenticated || !state.session.currentChildId) return false;
    try {
      await request("/api/account/history", { method: "DELETE" });
      return true;
    } catch { return false; }
  }

  async function setDailyGoal(value) {
    if (!state.session?.authenticated || !state.session.currentChildId) return 10;
    const next = [5, 10, 15, 20].includes(Number(value)) ? Number(value) : 10;
    const child = currentChild();
    if (child) child.dailyGoal = next;
    try { await request("/api/account/daily-goal", { method: "POST", body: { value: next } }); } catch {}
    return next;
  }

  function currentChild() {
    return state.session?.account?.children?.find((child) => child.id === state.session.currentChildId) || null;
  }

  function childBadgeHtml() {
    const child = currentChild();
    return child ? `<span class="active-child-badge" aria-label="当前学习档案：${escapeAttr(child.name)}"><span class="account-chip-dot" aria-hidden="true"></span>${escapeText(child.name)}</span>` : "";
  }

  function topbarHtml() {
    if (!state.session?.authenticated) return "";
    const child = currentChild();
    return `<button class="btn btn-soft account-chip" data-action="account-center" aria-label="账户与孩子档案"><span class="account-chip-dot" aria-hidden="true"></span><span>${escapeText(child?.name || "选择孩子")}</span></button>`;
  }

  function openManager() {
    state.managerOpen = true;
    state.error = "";
    renderLayer();
  }

  function renderLayer() {
    let layer = document.querySelector("#account-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "account-layer";
      document.body.append(layer);
    }
    const authenticated = Boolean(state.session?.authenticated);
    document.body.classList.toggle("account-locked", !authenticated || !state.session.currentChildId);
    if (state.recoveryCode) layer.innerHTML = renderRecoveryCode();
    else if (!authenticated) layer.innerHTML = renderAuth();
    else if (!state.session.currentChildId || state.managerOpen) layer.innerHTML = renderManager(!state.session.currentChildId);
    else layer.innerHTML = "";
    bindLayer(layer);
  }

  function renderAuth() {
    if (state.recoveryCode) return renderRecoveryCode();
    const isLogin = state.mode === "login";
    const isRegister = state.mode === "register";
    return `<div class="account-gate" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <section class="account-panel">
        <div class="account-identity"><span class="account-number-mark">1·2·3</span><span><strong>乐之老师</strong><small>家长账户</small></span></div>
        <h1 id="account-title">${isLogin ? "欢迎回来" : isRegister ? "创建家长账号" : "用找回码重设密码"}</h1>
        <p class="account-lead">${isLogin ? "选择孩子，继续今天的学习。" : isRegister ? "创建账号，开始学习。" : "输入用户名、找回码和新密码。"}</p>
        <div class="account-tabs" role="tablist">
          <button type="button" data-account-mode="login" class="${isLogin ? "is-active" : ""}">登录</button>
          <button type="button" data-account-mode="register" class="${isRegister ? "is-active" : ""}">注册</button>
          <button type="button" data-account-mode="recover" class="${state.mode === "recover" ? "is-active" : ""}">找回密码</button>
        </div>
        <form data-account-form="${state.mode}" class="account-form">
          ${state.mode === "recover" ? `<label>用户名<input name="username" autocomplete="username" minlength="4" maxlength="32" pattern="[A-Za-z][A-Za-z0-9_]{3,31}" required placeholder="注册时的用户名"></label><label>找回码<input name="recoveryCode" autocomplete="off" required placeholder="XXXXXX-XXXXXX-XXXXXXXX"></label>` : state.mode !== "recover" ? `<label>用户名<input name="username" autocomplete="username" minlength="4" maxlength="32" pattern="[A-Za-z][A-Za-z0-9_]{3,31}" required placeholder="字母开头，4—32位"></label>` : ""}
          ${isRegister ? `<label>孩子称呼<input name="childName" maxlength="20" required placeholder="例如：乐乐"></label>` : ""}
          <label>${state.mode === "recover" ? "新密码" : "密码"}<input name="password" type="password" autocomplete="${isLogin ? "current-password" : "new-password"}" minlength="10" maxlength="72" required placeholder="至少10位，包含字母和数字"></label>
          ${!isLogin ? `<label>确认密码<input name="confirmPassword" type="password" autocomplete="new-password" minlength="10" maxlength="72" required></label>` : ""}
          ${state.error ? `<p class="account-error" role="alert">${escapeText(state.error)}</p>` : ""}
          <button class="btn btn-primary account-submit" type="submit" ${state.busy ? "disabled" : ""}>${state.busy ? "请稍候…" : isLogin ? "登录并选择孩子" : isRegister ? "创建账号" : "重设密码"}</button>
        </form>
      </section>
    </div>`;
  }

  function renderRecoveryCode() {
    return `<div class="account-gate" role="dialog" aria-modal="true" aria-labelledby="recovery-title"><section class="account-panel recovery-panel">
      <span class="account-number-mark">安全备份</span><h1 id="recovery-title">请保存这组找回码</h1>
      <p class="account-lead">请妥善保存。忘记密码时需要使用这组找回码。</p>
      <output class="recovery-code">${escapeText(state.recoveryCode)}</output>
      <button type="button" class="btn btn-soft" data-copy-recovery>复制找回码</button>
      <label class="recovery-confirm"><input type="checkbox" data-recovery-saved> 我已经把找回码保存在安全的地方</label>
      <button type="button" class="btn btn-primary account-submit" data-finish-recovery disabled>进入乐之老师</button>
    </section></div>`;
  }

  function renderManager(required) {
    const account = state.session.account;
    const children = account.children || [];
    return `<div class="account-gate ${required ? "" : "is-modal"}" role="dialog" aria-modal="true" aria-labelledby="profile-title"><section class="account-panel account-manager">
      <div class="account-manager-head"><div><span class="account-number-mark">孩子档案</span><h1 id="profile-title">${required ? "先创建一个孩子档案" : "账户与孩子档案"}</h1><p>${escapeText(account.username)}</p></div>${required ? "" : `<button type="button" class="account-close" data-close-manager aria-label="关闭">×</button>`}</div>
      <div class="child-profile-list">${children.length ? children.map((child) => `<article class="child-profile ${child.id === state.session.currentChildId ? "is-active" : ""}"><button type="button" data-select-child="${child.id}"><span class="child-avatar">${escapeText(child.name.slice(0, 1))}</span><span><strong>${escapeText(child.name)}</strong><small>${child.id === state.session.currentChildId ? "当前学习档案" : "切换到这个档案"}</small></span></button><div><button type="button" data-rename-child="${child.id}" data-name="${escapeAttr(child.name)}">改名</button><button type="button" data-delete-child="${child.id}">删除</button></div></article>`).join("") : `<p class="account-empty">创建一个孩子档案后即可开始学习。</p>`}</div>
      <form data-account-form="child" class="child-create"><label>新孩子称呼<input name="name" maxlength="20" required placeholder="例如：乐乐"></label><button class="btn btn-primary" type="submit">创建档案</button></form>
      ${state.error ? `<p class="account-error" role="alert">${escapeText(state.error)}</p>` : ""}
      <div class="account-manager-footer"><span>学习前请确认选择了正确的孩子</span><button type="button" data-account-logout>退出登录</button></div>
    </section></div>`;
  }

  function bindLayer(layer) {
    layer.querySelectorAll("[data-account-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.accountMode; state.error = ""; renderLayer(); }));
    layer.querySelector('[data-account-form="login"]')?.addEventListener("submit", (event) => submitAuth(event, "/api/auth/login"));
    layer.querySelector('[data-account-form="register"]')?.addEventListener("submit", (event) => submitAuth(event, "/api/auth/register"));
    layer.querySelector('[data-account-form="recover"]')?.addEventListener("submit", (event) => submitAuth(event, "/api/auth/recover"));
    layer.querySelector('[data-account-form="child"]')?.addEventListener("submit", createChild);
    layer.querySelector("[data-recovery-saved]")?.addEventListener("change", (event) => { const button = layer.querySelector("[data-finish-recovery]"); if (button) button.disabled = !event.target.checked; });
    layer.querySelector("[data-finish-recovery]")?.addEventListener("click", () => { state.recoveryCode = ""; location.reload(); });
    layer.querySelector("[data-copy-recovery]")?.addEventListener("click", async () => { await navigator.clipboard.writeText(state.recoveryCode); state.error = ""; });
    layer.querySelector("[data-close-manager]")?.addEventListener("click", () => { state.managerOpen = false; renderLayer(); });
    layer.querySelector("[data-account-logout]")?.addEventListener("click", logout);
    layer.querySelectorAll("[data-select-child]").forEach((button) => button.addEventListener("click", () => selectChild(button.dataset.selectChild)));
    layer.querySelectorAll("[data-rename-child]").forEach((button) => button.addEventListener("click", () => renameChild(button.dataset.renameChild, button.dataset.name)));
    layer.querySelectorAll("[data-delete-child]").forEach((button) => button.addEventListener("click", () => deleteChild(button.dataset.deleteChild)));
  }

  async function submitAuth(event, endpoint) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    if (body.confirmPassword !== undefined && body.password !== body.confirmPassword) { state.error = "两次输入的密码不一致。"; return renderLayer(); }
    delete body.confirmPassword;
    state.busy = true; state.error = ""; renderLayer();
    try {
      const payload = await request(endpoint, { method: "POST", body });
      state.session = payload;
      if (payload.recoveryCode) { state.recoveryCode = payload.recoveryCode; state.busy = false; return renderLayer(); }
      location.reload();
    } catch (error) { state.error = error.message; state.busy = false; renderLayer(); }
  }

  async function createChild(event) {
    event.preventDefault(); state.error = "";
    try {
      const payload = await request("/api/account/children", { method: "POST", body: Object.fromEntries(new FormData(event.currentTarget)) });
      state.session.account.children.push(payload.child); state.session.currentChildId = payload.currentChildId; location.reload();
    } catch (error) { state.error = error.message; renderLayer(); }
  }

  async function selectChild(childId) {
    try { await request("/api/account/active-child", { method: "POST", body: { childId } }); location.reload(); }
    catch (error) { state.error = error.message; renderLayer(); }
  }

  async function renameChild(childId, oldName) {
    const name = prompt("新的孩子称呼", oldName || "");
    if (name === null) return;
    try { const payload = await request(`/api/account/children/${childId}`, { method: "PATCH", body: { name } }); const child = state.session.account.children.find((item) => item.id === childId); if (child) child.name = payload.child.name; renderLayer(); rerenderApp(); }
    catch (error) { state.error = error.message; renderLayer(); }
  }

  async function deleteChild(childId) {
    if (!confirm("删除这个孩子档案及其全部学习记录？此操作无法撤销。")) return;
    try { const payload = await request(`/api/account/children/${childId}`, { method: "DELETE" }); state.session.account.children = state.session.account.children.filter((item) => item.id !== childId); state.session.currentChildId = payload.currentChildId; if (!payload.currentChildId) state.managerOpen = true; else await loadHistory(); renderLayer(); rerenderApp(); }
    catch (error) { state.error = error.message; renderLayer(); }
  }

  async function logout() {
    try { await request("/api/auth/logout", { method: "POST" }); } catch {}
    state.session = { authenticated: false }; state.managerOpen = false; window.LezhiHistory?.setRemoteHistory?.([]); renderLayer();
  }

  async function request(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (state.session?.csrfToken && options.method && options.method !== "GET") headers["X-Lezhi-CSRF"] = state.session.csrfToken;
    const response = await fetch(url, { method: options.method || "GET", headers, credentials: "same-origin", body: options.body === undefined ? undefined : JSON.stringify(options.body) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "请求没有完成，请稍后再试。");
    return payload;
  }

  function escapeText(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escapeAttr(value) { return escapeText(value).replace(/"/g, "&quot;"); }

  window.LezhiAccount = { start, recordHistory, clearHistory, setDailyGoal, topbarHtml, childBadgeHtml, openManager, currentChild, session: () => state.session, ready: () => state.ready };
})();
