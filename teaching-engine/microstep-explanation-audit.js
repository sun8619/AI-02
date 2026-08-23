import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("./microstep-explanation-library.js", import.meta.url), "utf8");
const overlaySource = fs.readFileSync(new URL("./knowledge-point-teaching-overlays.js", import.meta.url), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context, { filename: "microstep-explanation-library.js" });
vm.runInContext(overlaySource, context, { filename: "knowledge-point-teaching-overlays.js" });

const api = context.window.LezhiMicrostepExplanations;
if (!api?.create || !api?.getFamilies) throw new Error("讲解库没有正确导出 create/getFamilies");
if (!context.window.LezhiKnowledgePointOverlays?.list) throw new Error("知识点小台阶数据没有正确加载");

const requiredFamilies = [
  "count",
  "compare",
  "ordinal",
  "composition",
  "concreteAddition",
  "concreteSubtraction",
  "calculation",
  "makeTenAdd",
  "breakTenSubtract",
  "mixedCalculation",
  "application",
  "money",
  "moneyApplication",
  "multiplication",
  "division",
  "time",
  "measure",
  "placeValue",
  "shape",
  "data",
  "logic",
  "pattern",
  "comparisonDifference",
  "arrangement",
  "observation",
  "timeDuration",
  "angle",
  "remainderDivision",
  "remainderApplication",
  "generic",
];

const actualFamilies = new Set(api.getFamilies());
const missingFamilies = requiredFamilies.filter((family) => !actualFamilies.has(family));
if (missingFamilies.length) throw new Error(`讲解库缺少知识类型：${missingFamilies.join("、")}`);

const failures = [];
let checked = 0;

for (const family of requiredFamilies) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const entry = api.create({
      family,
      attempt,
      lesson: { id: `audit-${family}`, problem: "审计题目" },
      question: { id: `audit-question-${family}`, prompt: "审计题目" },
      plan: { label: "审计小步" },
    });
    checked += 1;

    const requiredText = ["explanation", "demonstration", "checkPrompt", "responseInstruction", "visualType"];
    for (const field of requiredText) {
      if (!String(entry?.[field] || "").trim()) failures.push(`${family}[${attempt}] 缺少 ${field}`);
    }
    if (!Array.isArray(entry?.answerKeywords) || !entry.answerKeywords.length) {
      failures.push(`${family}[${attempt}] 缺少检查题答案关键词`);
    }
    if (!/[？?]/.test(String(entry?.checkPrompt || ""))) {
      failures.push(`${family}[${attempt}] 检查题不是明确问句`);
    }
    if (!/(只说|回答|说出)/.test(String(entry?.responseInstruction || ""))) {
      failures.push(`${family}[${attempt}] 没有告诉孩子怎样回答`);
    }
    if (String(entry?.explanation || "").length > 150) {
      failures.push(`${family}[${attempt}] 讲解超过低年级单轮长度上限`);
    }
  }
}

let microstepCount = 0;
for (const point of context.window.LezhiKnowledgePointOverlays.list()) {
  for (const label of point.microSteps || []) {
    microstepCount += 1;
    const entry = api.create({
      family: point.family,
      attempt: 0,
      lesson: { id: point.id, problem: "小台阶覆盖审计" },
      question: { id: `${point.id}-question`, prompt: "小台阶覆盖审计" },
      plan: { label },
    });
    if (!entry.stepRuleMatched) failures.push(`${point.id} 的小台阶“${label}”没有精确讲法`);
    if (!String(entry.checkPrompt || "").trim()) failures.push(`${point.id} 的小台阶“${label}”没有讲后检测题`);
  }
}

const compareObserve = api.create({ family: "compare", lesson: { id: "compare-a" }, question: { id: "a" }, plan: { label: "先看清两边" } });
const compareSymbol = api.create({ family: "compare", lesson: { id: "compare-b" }, question: { id: "b" }, plan: { label: "填比较符号" } });
if (compareObserve.checkPrompt === compareSymbol.checkPrompt) failures.push("大小比较的观察小步和填符号小步仍在使用同一检测题");

const moneyRelation = api.create({ family: "money", lesson: { id: "money-a" }, question: { id: "a" }, plan: { label: "知道1元=10角" } });
const moneyConvert = api.create({ family: "money", lesson: { id: "money-b" }, question: { id: "b" }, plan: { label: "把元换成角" } });
if (moneyRelation.checkPrompt === moneyConvert.checkPrompt) failures.push("人民币单位关系和单位换算小步仍在使用同一检测题");

const applicationFirstCondition = api.create({
  family: "application",
  lesson: { id: "application-first", problem: "停车场原来有4辆车，又开来5辆车，现在一共有多少辆车？" },
  question: { id: "application-first-question", prompt: "先找第一个条件" },
  plan: { label: "找第一个条件" },
});
if (!/第一个条件|原来/.test(applicationFirstCondition.checkPrompt)) {
  failures.push("应用题读第一个条件后，检查题没有继续检查同一个阅读小步");
}
if (/加法|减法|用什么运算/.test(applicationFirstCondition.checkPrompt)) {
  failures.push("应用题读条件时提前跳到了选择运算");
}

const breakTenEnough = api.create({
  family: "breakTenSubtract",
  lesson: { id: "break-ten-enough", problem: "13-5等于多少？" },
  question: { id: "break-ten-enough-question", prompt: "先看个位够不够减" },
  plan: { label: "看个位够不够" },
});
if (!/够|不够/.test(breakTenEnough.checkPrompt) || !/够|不够/.test(breakTenEnough.responseInstruction)) {
  failures.push("破十法第一步没有让孩子明确回答够或不够");
}
if (/拆成10和/.test(breakTenEnough.checkPrompt)) {
  failures.push("破十法第一步还没检查清楚，就提前跳到了拆数");
}

const breakTenSplit = api.create({
  family: "breakTenSubtract",
  lesson: { id: "break-ten-split", problem: "14-9等于多少？" },
  question: { id: "break-ten-split-question", prompt: "把14拆成10和几" },
  plan: { label: "拆成10和几" },
});
if (!/10和几|拆成/.test(breakTenSplit.checkPrompt)) {
  failures.push("破十法拆数小步没有检查孩子会不会拆成10和几");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`讲解库审计通过：${requiredFamilies.length} 类知识，${microstepCount} 个课程小台阶，${checked} 组轮换讲解与近迁移检查。`);
