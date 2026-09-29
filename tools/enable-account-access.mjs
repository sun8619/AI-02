#!/usr/bin/env node
import { copyFile, mkdir, readFile, readdir, realpath, rename, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const action = process.argv[2];
const backupDir = process.argv[3];
if (!new Set(["apply", "rollback"]).has(action) || !backupDir) {
  console.error("usage: enable-account-access.mjs {apply|rollback} <backup-dir>");
  process.exit(2);
}
const manifestPath = join(backupDir, "manifest.json");

if (action === "rollback") {
  let manifest = [];
  try { manifest = JSON.parse(await readFile(manifestPath, "utf8")); } catch { process.exit(0); }
  for (const item of manifest) await copyFile(join(backupDir, item.backup), item.path);
  console.log(`Restored ${manifest.length} Nginx configuration file(s).`);
  process.exit(0);
}

await mkdir(backupDir, { recursive: true, mode: 0o700 });
const candidates = [];
for (const directory of ["/etc/nginx/sites-enabled", "/etc/nginx/conf.d"]) {
  let entries = [];
  try { entries = await readdir(directory, { withFileTypes: true }); } catch { continue; }
  for (const entry of entries) {
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    const target = await realpath(join(directory, entry.name));
    if (!candidates.includes(target)) candidates.push(target);
  }
}

const manifest = [];
const changes = [];
for (const path of candidates) {
  const source = await readFile(path, "utf8");
  let output = "";
  let cursor = 0;
  let changed = false;
  for (const range of serverBlocks(source)) {
    output += source.slice(cursor, range.start);
    const block = source.slice(range.start, range.end);
    const matchesHost = /\bserver_name\s+[^;]*\bsunlezhi\.top\b[^;]*;/i.test(block);
    const matchesPreview = /\bauth_basic\s+(?:"Lezhi private preview"|'Lezhi private preview'|Lezhi\s+private\s+preview)\s*;/i.test(block);
    if (matchesHost && matchesPreview) {
      let updated = block
        .replace(/^[ \t]*auth_basic\s+(?:"Lezhi private preview"|'Lezhi private preview'|Lezhi\s+private\s+preview)\s*;[^\n]*(?:\n|$)/gim, "")
        .replace(/^[ \t]*auth_basic_user_file\s+[^;]+;[^\n]*(?:\n|$)/gim, "");
      if (!/^[ \t]*auth_basic\s+off\s*;/im.test(updated)) updated = updated.replace(/\{/, "{\n    auth_basic off;");
      output += updated;
      changed ||= updated !== block;
    } else output += block;
    cursor = range.end;
  }
  output += source.slice(cursor);
  if (!changed) continue;
  const backup = `${String(manifest.length + 1).padStart(2, "0")}-${basename(path)}`;
  await copyFile(path, join(backupDir, backup));
  manifest.push({ path, backup });
  changes.push({ path, output });
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
for (const { path, output } of changes) {
  const temporary = `${path}.ai02-account-${process.pid}.tmp`;
  await copyFile(path, temporary);
  await writeFile(temporary, output);
  await rename(temporary, path);
}
console.log(manifest.length ? `Removed preview Basic Auth from ${manifest.length} sunlezhi.top configuration file(s).` : "No matching preview Basic Auth remained.");

function serverBlocks(text) {
  const ranges = [];
  const pattern = /\bserver\s*\{/g;
  for (let match; (match = pattern.exec(text)); ) {
    const open = text.indexOf("{", match.index);
    let depth = 0, quote = "", escaped = false, comment = false;
    for (let index = open; index < text.length; index += 1) {
      const char = text[index];
      if (comment) { if (char === "\n") comment = false; continue; }
      if (quote) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === quote) quote = ""; continue; }
      if (char === "#") { comment = true; continue; }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char === "{") depth += 1;
      if (char === "}" && --depth === 0) { ranges.push({ start: match.index, end: index + 1 }); pattern.lastIndex = index + 1; break; }
    }
  }
  return ranges;
}
