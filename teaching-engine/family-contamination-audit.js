import vm from "node:vm";
import { readFileSync } from "node:fs";

const baseUrl = new URL("./", import.meta.url);
const bank = loadBrowserGlobal("./grade1-2-question-bank.js", "gradeOneTwoQuestionBank");
const overlays = loadBrowserGlobal("./knowledge-point-teaching-overlays.js", "LezhiKnowledgePointOverlays");
const guard = loadBrowserGlobal("./question-family-guard.js", "LezhiQuestionFamilyGuard");
const failures = [];
let checked = 0;

const arithmeticGuardCases = [
  ["9+4等于多少？", "把4分成1和3，先凑成10。", "makeTenAdd"],
  ["13-5等于多少？", "把13分成10和3。", "breakTenSubtract"],
  ["8-2+3等于多少？", "从左往右算。", "mixedCalculation"],
  ["5分成2和几？", "数的组成。", ""],
];

for (const [prompt, detail, expected] of arithmeticGuardCases) {
  const actual = guard?.detectSpecializedArithmeticFamily?.(prompt, detail) || "";
  if (actual !== expected) {
    failures.push(`算式分类 ${prompt}: 期望 ${expected || "通用规则"}，实际 ${actual || "通用规则"}`);
  }
}

for (const point of bank?.points || []) {
  const pointText = `${point.title || ""} ${point.node || ""} ${point.lesson || ""}`;
  const expectedFamily = overlays?.getPointOverlay?.(point.id)?.family || "";
  for (const question of point.questions || []) {
    checked += 1;
    const questionText = `${question.type || ""} ${question.prompt || ""} ${question.explanation || ""} ${question.answer || ""}`;
    const looksLikeTime = guard?.isClockTimeTeachingText?.(questionText, pointText);
    if (looksLikeTime && !["time", "timeDuration"].includes(expectedFamily)) {
      failures.push(`${point.id}/${question.id}: 非时间知识点被时间规则命中`);
    }
    if (/分成|拆成|分解/.test(questionText) && looksLikeTime && !/钟面|时针|分针|时间|分钟|时刻|几点|几时/.test(questionText)) {
      failures.push(`${point.id}/${question.id}: “分成”被误当作时间单位`);
    }
  }
}

if (failures.length) {
  console.error(`知识类型污染审计失败 ${failures.length} 项：\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`知识类型污染审计通过：逐题检查 ${checked} 道题，并验证凑十、破十、混合运算不会被“分成”串成数的组成。`);
}

function loadBrowserGlobal(relativePath, globalName) {
  const code = readFileSync(new URL(relativePath, baseUrl), "utf8");
  const context = { window: {}, globalThis: {} };
  context.window = context.globalThis;
  vm.createContext(context);
  vm.runInContext(code, context, { filename: relativePath });
  return context.globalThis[globalName];
}
