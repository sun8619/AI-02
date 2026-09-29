import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const userFacingFiles = [
  "index.html",
  "boot.js",
  "account-client.js",
  "app.js",
  "teaching-engine/state-machine.js",
];
const sources = new Map(
  await Promise.all(
    userFacingFiles.map(async (file) => [file, await readFile(new URL(file, root), "utf8")]),
  ),
);

const failures = [];
const assertAbsent = (file, pattern, label) => {
  const source = sources.get(file) || "";
  if (pattern.test(source)) failures.push(`${file}: ${label}`);
};

const bannedCopy = [
  /孩子不用注册，也不需要提供手机号或邮箱/,
  /旧浏览器中的本机学习记录不会上传/,
  /不会上传，也不会合并/,
  /拍照入口已预留/,
  /程序精准绘制/,
  /程序辅助理解/,
  /AI\s*生活图/,
  /AI\s*情景图/,
  /AI\s*画生活例子/,
  /AI\s*正在画生活例子/,
  /真实模型/,
  /模型回复/,
  /系统判断不是简单答错/,
  /卡住链路/,
  /系统会记录孩子/,
  /语音直接采用率/,
  /AI Gateway/,
  /产品运营方.*补充/,
  /服务商留存规则/,
];

for (const [file] of sources) {
  for (const pattern of bannedCopy) assertAbsent(file, pattern, `出现禁止面向用户展示的文案 ${pattern}`);
}

for (const file of ["account-client.js", "app.js"]) {
  assertAbsent(file, /payload\.(?:detail|hint|error)\b/, "前端不得读取后台 detail、hint 或 error 详情");
}

assertAbsent("app.js", /data-action=["']camera["']|action\s*===\s*["']camera["']|icon\(["']camera["']\)/, "未完成的拍照功能不得展示入口");

if (failures.length) {
  throw new Error(`用户文案门禁失败：\n${failures.join("\n")}`);
}

console.log(`PASS user copy: ${userFacingFiles.length} 个用户界面文件未发现内部说明、占位入口或后台详情读取`);
