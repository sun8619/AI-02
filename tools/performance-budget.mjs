import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const failures = [];
const assert = (value, message) => { if (!value) failures.push(message); };

const scripts = [...html.matchAll(/<script\b([^>]*)\bsrc="\.\/([^"?]+)(?:\?[^"]*)?"[^>]*><\/script>/g)].map((match) => ({ attrs: match[1], path: match[2] }));
const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="\.\/([^"?]+)(?:\?[^"]*)?"/g)].map((match) => match[1]);
const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const imagePaths = [...appSource.matchAll(/\.\/assets\/([^"?]+\.(?:png|webp|avif|jpe?g))/gi)].map((match) => `assets/${match[1]}`);
const paths = [...new Set([...scripts.map((item) => item.path), ...styles, ...imagePaths])];
let compressedBytes = 0;
const assets = [];
for (const path of paths) {
  const data = await readFile(new URL(`../${path}`, import.meta.url));
  const transferBytes = /\.(?:js|css|html|json|svg)$/i.test(path) ? gzipSync(data, { level: 6 }).length : data.length;
  compressedBytes += transferBytes;
  assets.push({ path, sourceBytes: data.length, transferBytes });
}

assert(scripts.length >= 1 && scripts.every((item) => /\bdefer\b/.test(item.attrs)), "every external script must use defer");
assert(imagePaths.length === 2 && imagePaths.every((path) => path.endsWith(".webp")), "teacher artwork must use two WebP files");
for (const path of imagePaths) {
  const size = (await stat(new URL(`../${path}`, import.meta.url))).size;
  assert(size <= 100_000, `${path} exceeds 100 KB (${size})`);
}
assert(!/lezhi-teacher[^"']+\.png/i.test(appSource), "application still references the old PNG teacher artwork");
assert(compressedBytes <= 600_000, `estimated initial transfer exceeds 600 KB (${compressedBytes})`);
assert(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), "inline script blocks are not allowed by the CSP");

if (failures.length) throw new Error(failures.join("\n"));
console.log(JSON.stringify({ status: "pass", compressedBytes, budgetBytes: 600_000, resources: assets.length, scripts: scripts.length, images: imagePaths }, null, 2));
