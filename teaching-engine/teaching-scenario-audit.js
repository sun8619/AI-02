import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { allKnowledgeModules } from "./generated-curriculum.js";

const rootUrl = new URL("./", import.meta.url);
const strategyApi = loadBrowserGlobal("./family-teaching-strategies.js", "LezhiTeachingStrategies");
const overlayApi = loadBrowserGlobal("./knowledge-point-teaching-overlays.js", "LezhiKnowledgePointOverlays");

const points = allKnowledgeModules.flatMap((module) =>
  (module.points || []).map((point) => ({
    ...point,
    grade_term: module.grade_term,
    module_name: module.module_name,
  })),
);

const reports = points.map(scoreScenarioPoint);
const readyPoints = reports.filter((item) => item.level === "ready").length;
const needsWorkPoints = reports.filter((item) => item.level === "needs-work").length;
const weakPoints = reports.filter((item) => item.level === "weak").length;
const criticalFindings = reports.flatMap((item) =>
  item.critical.map((finding) => ({
    id: item.id,
    title: item.title,
    family: item.family,
    finding,
  })),
);

const summary = {
  modules: allKnowledgeModules.length,
  knowledgePoints: points.length,
  readyPoints,
  needsWorkPoints,
  weakPoints,
  scenarioReadiness: Math.round(average(reports.map((item) => item.score))),
  criticalFindings: criticalFindings.slice(0, 20),
  routeCoverage: {
    correctAdvance: percent(reports, (item) => item.routes.correctAdvance),
    wrongRepair: percent(reports, (item) => item.routes.wrongRepair),
    cannotAnswerScaffold: percent(reports, (item) => item.routes.cannotAnswerScaffold),
    offTopicRecovery: percent(reports, (item) => item.routes.offTopicRecovery),
    variantPractice: percent(reports, (item) => item.routes.variantPractice),
    teacherSummary: percent(reports, (item) => item.routes.teacherSummary),
    wholeQuestionChecks: percent(reports, (item) => item.routes.wholeQuestionChecks),
  },
  weakestPoints: reports
    .filter((item) => item.level !== "ready" || item.critical.length)
    .sort((a, b) => a.score - b.score || b.critical.length - a.critical.length)
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      title: item.title,
      grade: item.grade,
      family: item.family,
      score: item.score,
      critical: item.critical,
      gaps: item.gaps,
    })),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  printHumanSummary(summary);
}

function scoreScenarioPoint(point) {
  const overlay = overlayApi?.getPointOverlay?.(point) || null;
  const family = overlay?.family || point.teaching_family || "generic";
  const strategy = strategyApi?.getStrategy?.(family) || strategyApi?.getStrategy?.("generic") || {};
  const atoms = point.atoms || [];
  const assessments = point.assessment_templates || [];
  const atomTexts = atoms.flatMap((atom) => [
    atom.atom_name,
    atom.teach_prompt,
    atom.repair_prompt,
    atom.no_response_prompt,
    atom.return_prompt,
  ]);
  const allText = atomTexts.map((item) => String(item || "")).join("\n");
  const dimensions = new Set(assessments.map((item) => item.dimension));
  const scoreParts = [];
  const gaps = [];
  const critical = [];

  addScore(scoreParts, scoreEntry(point, atoms, gaps), 11);
  addScore(scoreParts, scoreModelFirst(atoms, strategy, gaps), 12);
  addScore(scoreParts, scoreActionableSteps(atoms, gaps), 12);
  addScore(scoreParts, scoreSafeRepairs(allText, atoms, gaps, critical), 14);
  addScore(scoreParts, scoreDialogueRoutes(strategy, atoms, gaps, critical), 14);
  addScore(scoreParts, scoreVariants(assessments, strategy, gaps), 13);
  addScore(scoreParts, scoreSummaryAndWholeChecks(point, atoms, assessments, strategy, dimensions, gaps, critical), 12);
  addScore(scoreParts, scoreMasteryPace(strategy, assessments, gaps), 7);
  addScore(scoreParts, scoreVisualSupport(family, point, gaps), 5);

  const score = Math.round(scoreParts.reduce((sum, item) => sum + item, 0));
  const level = critical.length ? "needs-work" : score >= 86 ? "ready" : score >= 72 ? "needs-work" : "weak";
  return {
    id: point.id,
    title: point.child_title || point.point_name || point.id,
    grade: point.grade_term,
    family,
    score,
    level,
    critical,
    gaps,
    routes: {
      correctAdvance: atoms.length >= 4 && atoms.some((atom) => atom.accepts_final_answer),
      wrongRepair: atoms.every((atom) => hasUsefulRepair(atom)),
      cannotAnswerScaffold: atoms.every((atom) => hasCannotScaffold(atom)),
      offTopicRecovery: (strategy.dialogueMoves?.offTopic || []).length >= 2,
      variantPractice: assessments.filter((item) => item.dimension === "variant_problem").length >= 2 && (strategy.variants || []).length >= 2,
      teacherSummary: (strategy.teachingMethods || []).length >= 2 || atoms.filter((atom) => /方法|先|再|因为|所以/.test(atom.teach_prompt || "")).length >= 2,
      wholeQuestionChecks:
        assessments.some((item) => item.dimension === "direct_problem") &&
        assessments.filter((item) => item.dimension === "variant_problem").length >= 2,
    },
  };
}

function scoreEntry(point, atoms, gaps) {
  let score = 1;
  const entry = String(point.entry_question || "");
  const first = atoms[0] || {};
  if (!entry || entry.length < 6) {
    gaps.push("入口题不清楚");
    score -= 0.35;
  }
  if (!isChildActionable(entry) && !/[？?]/.test(entry)) {
    gaps.push("入口题缺少孩子可回答动作");
    score -= 0.25;
  }
  if (!first.teach_prompt || !isChildActionable(first.teach_prompt)) {
    gaps.push("第一个小台阶不够明确");
    score -= 0.3;
  }
  return clamp01(score);
}

function scoreModelFirst(atoms, strategy, gaps) {
  let score = 1;
  const modelCount = atoms.filter((atom) => isModelFirst(atom.teach_prompt) || isModelFirst(atom.no_response_prompt)).length;
  const methodCount = atoms.filter((atom) => /方法|表示|因为|所以|先|再|换|凑|破|平均|数位|单位|特征/.test(atom.teach_prompt || "")).length;
  if (modelCount < Math.min(2, atoms.length)) {
    gaps.push("答不上来时的示范不足");
    score -= 0.35;
  }
  if (methodCount < Math.min(3, atoms.length)) {
    gaps.push("讲法偏少，容易变成只问答案");
    score -= 0.3;
  }
  if (!strategy.stuckHint) {
    gaps.push("缺少该知识类型的兜底讲法");
    score -= 0.2;
  }
  return clamp01(score);
}

function scoreActionableSteps(atoms, gaps) {
  let score = 1;
  const actionable = atoms.filter((atom) => isChildActionable(atom.teach_prompt)).length;
  const longPrompts = atoms.filter((atom) => compact(atom.teach_prompt).length > 120).length;
  const ratio = actionable / Math.max(atoms.length, 1);
  if (ratio < 0.72) {
    gaps.push("部分小台阶孩子不知道答什么");
    score -= (0.72 - ratio) * 0.75;
  }
  if (longPrompts) {
    gaps.push("部分老师话术过长");
    score -= Math.min(0.2, longPrompts * 0.04);
  }
  if (atoms.length < 4) {
    gaps.push("小台阶少于4个，拆解不够");
    score -= 0.25;
  }
  return clamp01(score);
}

function scoreSafeRepairs(allText, atoms, gaps, critical) {
  let score = 1;
  const leakPatterns = [/这题最后是(?!多少)/g, /老师先说结果/g, /这题答案是(?!多少)/g, /最后答案是(?!多少)/g, /所以答案是(?!多少)/g];
  const templatePatterns = [
    /现在只练一句/g,
    /你说半句也可以/g,
    /老师把方法句放在这里/g,
    /你先跟老师说一句/g,
    /先抓住这句/g,
    /看图时先抓/g,
    /这一轮回答/g,
    /这一步先回答这一点/g,
    /这一小步要你接着回答/g,
    /你只要跟着说/g,
    /先说一个也可以/g,
  ];
  const leakHits = countPatternHits(allText, leakPatterns);
  const templateHits = countPatternHits(allText, templatePatterns);
  const weakRepairs = atoms.filter((atom) => !hasUsefulRepair(atom)).length;
  if (leakHits) {
    critical.push("补救话术疑似提前给答案");
    score -= Math.min(0.55, leakHits * 0.18);
  }
  if (templateHits) {
    gaps.push("补救或示范里仍有机械重复句式");
    score -= Math.min(0.3, templateHits * 0.04);
  }
  if (weakRepairs) {
    gaps.push("部分错误路径没有给当前缺口提示");
    score -= Math.min(0.35, weakRepairs * 0.08);
  }
  return clamp01(score);
}

function scoreDialogueRoutes(strategy, atoms, gaps, critical) {
  let score = 1;
  const moves = strategy.dialogueMoves || {};
  const routeChecks = [
    ["advance", "答对后推进话术不足"],
    ["repair", "答错后补救话术不足"],
    ["offTopic", "跑题拉回话术不足"],
    ["cannotAnswer", "不会答时示范话术不足"],
  ];
  for (const [key, message] of routeChecks) {
    if ((moves[key] || []).length < 2) {
      gaps.push(message);
      score -= 0.12;
    }
  }
  if (!atoms.some((atom) => atom.accepts_final_answer)) {
    critical.push("没有明确的作答完成点");
    score -= 0.25;
  }
  return clamp01(score);
}

function scoreVariants(assessments, strategy, gaps) {
  let score = 1;
  const variants = assessments.filter((item) => item.dimension === "variant_problem");
  if (variants.length < 2) {
    gaps.push("变式题少于2道");
    score -= 0.35;
  }
  if ((strategy.variants || []).length < 2) {
    gaps.push("知识类型缺少变式规则");
    score -= 0.25;
  }
  if (!assessments.some((item) => item.dimension === "direct_problem")) {
    gaps.push("缺少直接题");
    score -= 0.2;
  }
  return clamp01(score);
}

function scoreSummaryAndWholeChecks(point, atoms, assessments, strategy, dimensions, gaps, critical) {
  let score = 1;
  const directQuestions = assessments.filter((item) => item.dimension === "direct_problem");
  const variantQuestions = assessments.filter((item) => item.dimension === "variant_problem");
  const summarySources = [
    ...(strategy.teachingMethods || []),
    ...atoms.map((atom) => atom.teach_prompt || ""),
  ].filter((text) => /方法|先|再|因为|所以|换|凑|拆|平均|数位|单位/.test(text));
  if (!summarySources.length) {
    critical.push("缺少老师归纳讲法");
    score -= 0.35;
  }
  if (!directQuestions.length) {
    critical.push("缺少整题直接检验");
    score -= 0.35;
  }
  if (variantQuestions.length < 2) {
    gaps.push("整题变式检验少于2道");
    score -= 0.18;
  }
  if (dimensions.has("reasoning") && !atoms.some((atom) => /为什么|原因|说清|因为/.test(`${atom.atom_name || ""}${atom.teach_prompt || ""}`))) {
    gaps.push("说理材料存在，但缺少老师示范讲法");
    score -= 0.1;
  }
  return clamp01(score);
}

function scoreMasteryPace(strategy, assessments, gaps) {
  let score = 1;
  const target = Number(strategy.targetPassCount) || 0;
  if (target < 3 || target > 5) {
    gaps.push("同一知识点练习轮数不合理");
    score -= 0.28;
  }
  if (assessments.length < 4) {
    gaps.push("题型证据不足，难以确认掌握");
    score -= 0.25;
  }
  return clamp01(score);
}

function scoreVisualSupport(family, point, gaps) {
  const visualFamilies = new Set([
    "count",
    "compare",
    "money",
    "moneyApplication",
    "makeTenAdd",
    "breakTenSubtract",
    "multiplication",
    "division",
    "time",
    "measure",
    "placeValue",
    "shape",
    "data",
  ]);
  if (visualFamilies.has(family)) return 1;
  if (family === "generic") {
    gaps.push("未能推断专属图示类型");
    return 0.75;
  }
  return 0.9;
}

function hasUsefulRepair(atom) {
  const text = String(atom?.repair_prompt || "");
  return /先|再|看|找|说|想|算|换|凑|破|平均|数位|单位|因为|方法|关键词|补/.test(text) && !/这题最后是(?!多少)|最后答案是(?!多少)|这题答案是(?!多少)|所以答案是(?!多少)/.test(text);
}

function hasCannotScaffold(atom) {
  const text = String(atom?.no_response_prompt || "");
  return /没关系|不会|老师|示范|先|听|跟|关键词|方法|看/.test(text) && !/这题最后是(?!多少)|最后答案是(?!多少)|这题答案是(?!多少)|所以答案是(?!多少)/.test(text);
}

function isModelFirst(text) {
  return /老师先|老师带|先听|示范|讲清楚|先把|跟读|带着走|不用自己编/.test(String(text || ""));
}

function isChildActionable(text) {
  return /多少|几|哪|什么|为什么|吗|？|\?|说|回答|填|选|找|看|比|算|读|讲|判断|指出|写|圈|数|换|拆|凑|分/.test(String(text || ""));
}

function addScore(parts, ratio, weight) {
  parts.push(clamp01(ratio) * weight);
}

function countPatternHits(text, patterns) {
  return patterns.reduce((sum, pattern) => sum + ((String(text || "").match(pattern) || []).length), 0);
}

function compact(text) {
  return String(text || "").replace(/\s+/g, "");
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percent(items, predicate) {
  if (!items.length) return 0;
  return Math.round((items.filter(predicate).length / items.length) * 100);
}

function loadBrowserGlobal(relativePath, globalName) {
  const filename = fileURLToPath(new URL(relativePath, rootUrl));
  const source = readFileSync(filename, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return context.window[globalName];
}

function printHumanSummary(data) {
  console.log("乐之老师学习路径抽测");
  console.log(`- 模块数：${data.modules}`);
  console.log(`- 核心知识点：${data.knowledgePoints}`);
  console.log(`- 路径就绪知识点：${data.readyPoints}`);
  console.log(`- 需要继续打磨：${data.needsWorkPoints}`);
  console.log(`- 明显薄弱：${data.weakPoints}`);
  console.log(`- 路径就绪度估算：${data.scenarioReadiness}%`);
  console.log(`- 答对推进覆盖：${data.routeCoverage.correctAdvance}%`);
  console.log(`- 答错补救覆盖：${data.routeCoverage.wrongRepair}%`);
  console.log(`- 不会答示范覆盖：${data.routeCoverage.cannotAnswerScaffold}%`);
  console.log(`- 跑题拉回覆盖：${data.routeCoverage.offTopicRecovery}%`);
  console.log(`- 变式练习覆盖：${data.routeCoverage.variantPractice}%`);
  console.log(`- 老师归纳覆盖：${data.routeCoverage.teacherSummary}%`);
  console.log(`- 整题检验覆盖：${data.routeCoverage.wholeQuestionChecks}%`);

  if (data.criticalFindings.length) {
    console.log("\n优先修复的关键问题：");
    for (const item of data.criticalFindings.slice(0, 12)) {
      console.log(`- ${item.title} / ${item.family}：${item.finding}`);
    }
  }

  if (data.weakestPoints.length) {
    console.log("\n优先抽测知识点：");
    for (const item of data.weakestPoints) {
      console.log(`- ${item.grade} / ${item.title} / ${item.family} / ${item.score}分：${[...item.critical, ...item.gaps].join("；")}`);
    }
  }
}
