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

const familyNames = [...new Set(points.map((point) => point.teaching_family || "generic"))].sort();
const familyReports = familyNames.map((family) => scoreFamily(family));
const pointReports = points.map((point) => scorePoint(point));

const readyPoints = pointReports.filter((item) => item.level === "ready").length;
const needsWorkPoints = pointReports.filter((item) => item.level === "needs-work").length;
const weakPoints = pointReports.filter((item) => item.level === "weak").length;
const familyReady = familyReports.filter((item) => item.ready).length;
const overlayCoveredPoints = pointReports.filter((item) => item.hasOverlay).length;

const completion = Math.round(
  ((readyPoints / Math.max(pointReports.length, 1)) * 0.52 +
    (familyReady / Math.max(familyReports.length, 1)) * 0.22 +
    (overlayCoveredPoints / Math.max(pointReports.length, 1)) * 0.1 +
    (average(pointReports.map((item) => item.assessmentScore)) / 100) * 0.08 +
    (average(pointReports.map((item) => item.remediationScore)) / 100) * 0.08) *
    100,
);

const summary = {
  modules: allKnowledgeModules.length,
  knowledgePoints: points.length,
  teachingFamilies: familyNames.length,
  familyReady,
  overlayCoveredPoints,
  readyPoints,
  needsWorkPoints,
  weakPoints,
  teachingDataCompletion: completion,
  weakFamilies: familyReports.filter((item) => !item.ready).map((item) => ({ family: item.family, gaps: item.gaps })),
  weakestPoints: pointReports
    .filter((item) => item.level !== "ready")
    .sort((a, b) => a.score - b.score)
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      title: item.title,
      grade: item.grade,
      family: item.family,
      score: item.score,
      gaps: item.gaps,
    })),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  printHumanSummary(summary);
}

function scoreFamily(family) {
  const strategy = strategyApi?.getStrategy?.(family) || null;
  const gaps = [];
  if (!strategy) gaps.push("缺少知识类型策略");
  if ((strategy?.steps || []).length < 5) gaps.push("小台阶不足");
  if ((strategy?.teachingMethods || []).length < 3) gaps.push("讲法不足");
  if ((strategy?.diagnostics || []).length < 3) gaps.push("错误诊断不足");
  if ((strategy?.variants || []).length < 2) gaps.push("变式题规则不足");
  if (!strategy?.stuckHint) gaps.push("不会时提示不足");
  return { family, ready: gaps.length === 0, gaps };
}

function scorePoint(point) {
  const overlay = overlayApi?.getPointOverlay?.(point) || null;
  const family = overlay?.family || point.teaching_family || "generic";
  const strategy = strategyApi?.getStrategy?.(family) || null;
  const atoms = point.atoms || [];
  const assessments = point.assessment_templates || [];
  const remediationRules = point.remediation_rules || [];
  const feynmanSignals = point.feynman_prompt?.required_signals || [];
  const dimensions = new Set(assessments.map((item) => item.dimension));
  const gaps = [];
  let score = 0;

  if (family && strategy) score += 10;
  else gaps.push("缺少对应知识类型策略");

  if (overlay) score += 14;
  else gaps.push("缺少知识点专属教学覆盖");

  if ((atoms.length >= 4 || (overlay?.microSteps || []).length >= 5) && atoms.every((atom) => atom.prompt && atom.atom_name)) score += 16;
  else gaps.push("小台阶不足或缺少儿童提问");

  if (assessments.length >= 4 && dimensions.has("direct_problem") && dimensions.has("variant_problem") && dimensions.has("reasoning")) score += 16;
  else gaps.push("缺少直接题/变式题/说理题之一");

  if (remediationRules.length >= atoms.length) score += 10;
  else if (remediationRules.length >= 3) {
    score += 5;
    gaps.push("补救规则未覆盖每个小台阶");
  } else {
    gaps.push("补救规则不足");
  }

  if (feynmanSignals.length >= 4 && point.feynman_prompt?.child_prompt) score += 11;
  else gaps.push("费曼复述要求不足");

  if ((strategy?.diagnostics || []).length >= 3) score += 9;
  else gaps.push("错误诊断不够细");

  if ((strategy?.variants || []).length >= 3) score += 8;
  else gaps.push("变式规则不足");

  if ((strategy?.teachingMethods || []).length >= 3) score += 7;
  else gaps.push("讲法不足");

  if ((overlay?.teacherMoves || []).length >= 1 || (strategy?.stepBridge || []).length >= 2) score += 4;
  else gaps.push("老师追问动作不足");

  if ((point.lesson_ids || []).length && point.entry_question) score += 5;
  else gaps.push("入口题或知识点别名不足");

  const level = score >= 82 ? "ready" : score >= 66 ? "needs-work" : "weak";
  return {
    id: point.id,
    title: point.child_title || point.point_name,
    grade: point.grade_term,
    family,
    score,
    level,
    gaps,
    hasOverlay: Boolean(overlay),
    assessmentScore: assessments.length >= 4 && dimensions.has("direct_problem") && dimensions.has("variant_problem") && dimensions.has("reasoning") ? 100 : 55,
    remediationScore: remediationRules.length >= atoms.length ? 100 : remediationRules.length >= 3 ? 70 : 50,
  };
}

function loadBrowserGlobal(relativePath, globalName) {
  const filename = fileURLToPath(new URL(relativePath, rootUrl));
  const source = readFileSync(filename, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return context.window[globalName];
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function printHumanSummary(data) {
  console.log("乐之老师教学质量体检");
  console.log(`- 模块数：${data.modules}`);
  console.log(`- 核心知识点：${data.knowledgePoints}`);
  console.log(`- 知识类型：${data.teachingFamilies}`);
  console.log(`- 有专属教学覆盖的知识点：${data.overlayCoveredPoints}`);
  console.log(`- 达到当前标准的知识点：${data.readyPoints}`);
  console.log(`- 需要继续打磨的知识点：${data.needsWorkPoints}`);
  console.log(`- 明显薄弱的知识点：${data.weakPoints}`);
  console.log(`- 教学数据完成度估算：${data.teachingDataCompletion}%`);

  if (data.weakFamilies.length) {
    console.log("\n需要补强的知识类型：");
    for (const item of data.weakFamilies) {
      console.log(`- ${item.family}：${item.gaps.join("；")}`);
    }
  }

  if (data.weakestPoints.length) {
    console.log("\n优先打磨的知识点：");
    for (const item of data.weakestPoints) {
      console.log(`- ${item.grade} / ${item.title} / ${item.family} / ${item.score}分：${item.gaps.join("；")}`);
    }
  }
}
