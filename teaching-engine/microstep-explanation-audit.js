import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("./microstep-explanation-library.js", import.meta.url), "utf8");
const profileSource = fs.readFileSync(new URL("./microstep-quality-profiles.js", import.meta.url), "utf8");
const overlaySource = fs.readFileSync(new URL("./knowledge-point-teaching-overlays.js", import.meta.url), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(profileSource, context, { filename: "microstep-quality-profiles.js" });
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
    validateNoAnswerLeak(entry, `${family}[${attempt}]`);
    validateNoForeignStockExample(entry, `${family}[${attempt}]`);
  }
}

let microstepCount = 0;
const qualityProfileIds = new Set();
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
    if (!entry.qualityProfileMatched) failures.push(`${point.id} 的小台阶“${label}”仍在使用旧通用模板`);
    if (entry.qualityProfileId) qualityProfileIds.add(entry.qualityProfileId);
    if (!String(entry.checkPrompt || "").trim()) failures.push(`${point.id} 的小台阶“${label}”没有讲后检测题`);
    if (String(entry.explanation || "").length > 80) failures.push(`${point.id} 的小台阶“${label}”讲解过长`);
    if (String(entry.demonstration || "").length > 50) failures.push(`${point.id} 的小台阶“${label}”示范过长`);
    if (String(entry.checkPrompt || "").length > 35) failures.push(`${point.id} 的小台阶“${label}”讲后检查题过长`);
    if (String(entry.responseInstruction || "").length > 40) failures.push(`${point.id} 的小台阶“${label}”回答指令过长`);
    if (/再想想|认真看|仔细想|换一种方法/.test(String(entry.explanation || ""))) {
      failures.push(`${point.id} 的小台阶“${label}”仍是空泛提醒，不是实质讲解`);
    }
    validateNoAnswerLeak(entry, `${point.id} 的小台阶“${label}”`);
    validateNoForeignStockExample(entry, `${point.id} 的小台阶“${label}”`);
    validateMicrostepAlignment(entry, `${point.id} 的小台阶“${label}”`);
  }
}

if (qualityProfileIds.size < 100) {
  failures.push(`课程小台阶只使用了 ${qualityProfileIds.size} 套专属讲解，存在过度复用风险`);
}

const compareObserve = api.create({ family: "compare", lesson: { id: "compare-a" }, question: { id: "a" }, plan: { label: "先看清两边" } });
const compareSymbol = api.create({ family: "compare", lesson: { id: "compare-b" }, question: { id: "b" }, plan: { label: "填比较符号" } });
if (compareObserve.checkPrompt === compareSymbol.checkPrompt) failures.push("大小比较的观察小步和填符号小步仍在使用同一检测题");

const moneyRelation = api.create({ family: "money", lesson: { id: "money-a" }, question: { id: "a" }, plan: { label: "知道1元=10角" } });
const moneyConvert = api.create({ family: "money", lesson: { id: "money-b" }, question: { id: "b" }, plan: { label: "把元换成角" } });
if (moneyRelation.checkPrompt === moneyConvert.checkPrompt) failures.push("人民币单位关系和单位换算小步仍在使用同一检测题");
if (/1元等于多少角/.test(moneyRelation.checkPrompt) || /10角/.test(moneyRelation.responseInstruction)) {
  failures.push("人民币单位关系讲解仍把示范答案带进了下一道检查题或回答指令");
}

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

const angleVertexAndSides = api.create({
  family: "angle",
  lesson: { id: "angle-runtime", problem: "找出角的顶点和两条边。" },
  question: { id: "angle-runtime-question", prompt: "先找这个角的顶点和两条边。" },
  plan: { label: "找顶点和边" },
});
if (!angleVertexAndSides.qualityProfileMatched) {
  failures.push("角的运行时小步“找顶点和边”没有命中专属讲法");
}
if (!/顶点/.test(angleVertexAndSides.checkPrompt) || !/边/.test(angleVertexAndSides.checkPrompt)) {
  failures.push("角的运行时小步没有继续检查顶点和边");
}
validateMicrostepAlignment(angleVertexAndSides, "角的运行时小步“找顶点和边”");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`讲解库审计通过：${requiredFamilies.length} 类知识，${microstepCount} 个课程小台阶，${qualityProfileIds.size} 套专属讲解，${checked} 组轮换讲解与近迁移检查。`);

function validateNoAnswerLeak(entry, label) {
  const instruction = String(entry?.responseInstruction || "");
  if (!instruction || hasBalancedChoices(instruction)) return;
  const normalizedInstruction = compact(instruction);
  const leaked = (entry?.answerKeywords || []).find((keyword) => {
    const answer = compact(keyword);
    return answer && !/^[<>=+\-×÷]$/.test(answer) && normalizedInstruction.includes(answer);
  });
  if (leaked) failures.push(`${label} 的回答指令直接泄露答案“${leaked}”`);
}

function validateNoForeignStockExample(entry, label) {
  const family = String(entry?.family || "");
  const text = `${entry?.explanation || ""} ${entry?.demonstration || ""}`;
  if (family !== "compare" && family !== "comparisonDifference" && /苹果和梨|一一配对比较/.test(text)) {
    failures.push(`${label} 混入了大小比较专属的苹果和梨例子`);
  }
}

function validateMicrostepAlignment(entry, label) {
  const step = String(entry?.originalStepLabel || "");
  const check = String(entry?.checkPrompt || "");
  const instruction = String(entry?.responseInstruction || "");
  const teachingText = `${entry?.explanation || ""} ${entry?.demonstration || ""} ${check} ${instruction}`;
  if (/说清|为什么|理由|依据|哪里看出/.test(step) && !/为什么|原因|依据|因为|哪里看出|怎样|如何|顺序|方法/.test(check)) {
    failures.push(`${label} 讲的是说理，但讲后检测只要求数字或结论`);
  }
  if (/带单位回答/.test(step) && !/单位|厘米|米|克|千克|只|辆|本|支|朵/.test(`${check}${instruction}`)) {
    failures.push(`${label} 没有检查完整的带单位回答`);
  }
  if (
    entry?.family === "measure"
    && /人民币|(?:\d+|[一二三四五六七八九十百]+)元|(?:\d+|[一二三四五六七八九十百]+)角/.test(`${entry.explanation} ${entry.demonstration} ${check}`)
  ) {
    failures.push(`${label} 混入了人民币换算内容`);
  }
  if (entry?.family === "angle" && /正方形|三角形是什么图形|有3条边|图形名字/.test(teachingText)) {
    failures.push(`${label} 用平面图形名称代替了角的教学`);
  }
}

function hasBalancedChoices(instruction) {
  return [
    /左边.*右边|右边.*左边/,
    /[“\"]要[”\"].*[“\"]不要[”\"]|[“\"]不要[”\"].*[“\"]要[”\"]|要或不要/,
    /[“\"]够[”\"].*[“\"]不够[”\"]|[“\"]不够[”\"].*[“\"]够[”\"]|够或不够/,
    /加法.*减法|减法.*加法/,
    /大于号.*小于号|小于号.*大于号/,
    /数量.*位置|位置.*数量/,
    /长度.*质量|质量.*长度/,
    /平移.*旋转|旋转.*平移/,
    /能.*不能|不能.*能/,
    /可以.*不可以|不可以.*可以/,
    /是.*不是|不是.*是/,
    /[“\"]对[”\"].*[“\"]错[”\"]|[“\"]错[”\"].*[“\"]对[”\"]|对或错/,
  ].some((pattern) => pattern.test(String(instruction || "")));
}

function compact(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}
