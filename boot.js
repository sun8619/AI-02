(() => {
  let failed = false;
  const showBootFailure = () => {
    if (failed) return;
    failed = true;
    const root = document.getElementById("app");
    if (!root || root.children.length) return;
    root.innerHTML = `
      <main class="boot-failure">
        <section>
          <h1>页面没有加载完整</h1>
          <p>请点一下重新加载。仍然打不开时，请告诉家长联系乐之老师处理。</p>
          <button type="button" data-boot-reload>重新加载</button>
        </section>
      </main>`;
    root.querySelector("[data-boot-reload]")?.addEventListener("click", () => location.reload());
  };
  window.addEventListener("error", showBootFailure, true);
  window.setTimeout(() => {
    const root = document.getElementById("app");
    if (!root || !root.children.length) showBootFailure();
  }, 8000);
})();
