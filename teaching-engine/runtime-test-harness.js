import vm from "node:vm";
import { readFileSync } from "node:fs";

// Exercise the scripts actually loaded by the child page, not the separate demo engine.
export function loadChildRuntime({ audio = false, overrides = {} } = {}) {
  const root = new URL("../", import.meta.url);
  const element = {
    innerHTML: "", textContent: "", dataset: {}, style: {}, children: [],
    classList: { add() {}, remove() {}, toggle() {} },
    querySelectorAll: () => [], querySelector: () => null,
    addEventListener() {}, setAttribute() {}, focus() {},
  };
  const storage = new Map();
  const context = vm.createContext({
    console, URL, AbortController, structuredClone,
    setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0,
    document: { querySelector: () => element, querySelectorAll: () => [], addEventListener() {} },
    navigator: {}, location: { hostname: "localhost", protocol: "https:", search: "" },
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {}, innerWidth: 1440, innerHeight: 900,
    fetch: async () => { throw new Error("Network is not allowed in runtime assertions"); },
    ...overrides,
  });
  context.window = context;
  const html = readFileSync(new URL("index.html", root), "utf8");
  for (const match of html.matchAll(/<script src="\.\/([^"?]+)(?:\?[^"]*)?"/g)) {
    vm.runInContext(readFileSync(new URL(match[1], root), "utf8"), context, { filename: match[1] });
  }
  // No audio or external services in deterministic state-transition tests.
  if (!audio) vm.runInContext("speakCurrentMessage = () => {};", context);
  return { context, evaluate: (source) => vm.runInContext(source, context), html: () => element.innerHTML };
}
