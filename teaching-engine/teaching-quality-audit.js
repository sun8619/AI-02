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
const naturalnessScore = Math.round(average(pointReports.map((item) => item.naturalnessScore)));
const answerabilityScore = Math.round(average(pointReports.map((item) => item.answerabilityScore)));
const templatePhraseHits = pointReports.reduce((sum, item) => sum + item.templatePhraseHits, 0);
const answerLeakHits = pointReports.reduce((sum, item) => sum + item.answerLeakHits, 0);

const completion = Math.round(
  ((readyPoints / Math.max(pointReports.length, 1)) * 0.46 +
    (familyReady / Math.max(familyReports.length, 1)) * 0.22 +
    (overlayCoveredPoints / Math.max(pointReports.length, 1)) * 0.1 +
    (average(pointReports.map((item) => item.assessmentScore)) / 100) * 0.08 +
    (average(pointReports.map((item) => item.remediationScore)) / 100) * 0.08 +
    (naturalnessScore / 100) * 0.04 +
    (answerabilityScore / 100) * 0.02) *
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
  naturalnessScore,
  answerabilityScore,
  templatePhraseHits,
  answerLeakHits,
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
  const naturalness = scoreNaturalness(point, atoms);
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

  if (naturalness.score < 82) gaps.push(...naturalness.gaps);
  score = Math.max(0, score - naturalness.penalty);

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
    naturalnessScore: naturalness.score,
    answerabilityScore: naturalness.answerabilityScore,
    templatePhraseHits: naturalness.templatePhraseHits,
    answerLeakHits: naturalness.answerLeakHits,
  };
}

function scoreNaturalness(point, atoms) {
  const prompts = atoms.flatMap((atom) => [
    atom.teach_prompt,
    atom.repair_prompt,
    atom.no_response_prompt,
    atom.return_prompt,
  ]).map((item) => String(item || ""));
  const allText = prompts.join("\n");
  const templatePatterns = [
    /你先跟老师说一句/g,
    /先说一个关键词也可以/g,
    /可以先照着老师说/g,
    /现在只练一句/g,
    /你说半句也可以/g,
    /老师把方法句放在这里/g,
    /老师先说结果/g,
    /这题最后要得到/g,
    /老师先铺路/g,
    /大题缩小/g,
    /只说这个意思/g,
    /先说关键词/g,
    /答案会算只是第一层/g,
    /这一点先不猜/g,
    /把题和图连起来看/g,
    /听完后，请用自己的话说/g,
    /你现在只说/g,
    /你现在先说/g,
    /先说一个词/g,
    /先抓住关键词/g,
    /先说一个关键词/g,
    /先抓住这句/g,
    /看图时先抓/g,
    /这一轮回答/g,
    /这一步先回答这一点/g,
    /这一小步要你接着回答/g,
    /你只要跟着说/g,
    /先说一个也可以/g,
    /你不用自己编/g,
    /第一步该看什么/g,
    /说一个你记住的词/g,
  ];
  const leakPatterns = [
    /老师先说结果/g,
    /这题最后是/g,
    /可以说：\s*[^。！？\n]{1,12}[。！？]/g,
    /照着老师说：\s*[^。！？\n]{1,12}[。！？]/g,
  ];
  const templatePhraseHits = countPatternHits(allText, templatePatterns);
  const answerLeakHits = countPatternHits(allText, leakPatterns);
  const modelSteps = atoms.filter((atom) => /先|方法|因为|表示|看|找|换|凑|破|平均|数位|单位/.test(atom.teach_prompt || "")).length;
  const questionSteps = atoms.filter((atom) => /多少|几|哪|什么|为什么|吗|？|\?/.test(atom.teach_prompt || "")).length;
  const reasonSteps = atoms.filter((atom) => /为什么|原因|说清|因为/.test(atom.atom_name || atom.teach_prompt || "")).length;
  const answerability = scoreAnswerability(atoms);

  let score = 100;
  const gaps = [];
  if (templatePhraseHits > 0) {
    score -= Math.min(24, templatePhraseHits * 4);
    gaps.push("仍有机械模板话术");
  }
  if (answerLeakHits > 0) {
    score -= Math.min(30, answerLeakHits * 10);
    gaps.push("不会时可能提前泄露答案");
  }
  if (modelSteps < 2) {
    score -= 12;
    gaps.push("讲解示范不足");
  }
  if (questionSteps < 2) {
    score -= 10;
    gaps.push("追问互动不足");
  }
  if (reasonSteps < 1) {
    score -= 10;
    gaps.push("缺少说理环节");
  }
  if (answerability.score < 82) {
    score -= Math.min(16, Math.round((82 - answerability.score) * 0.35));
    gaps.push(...answerability.gaps);
  }
  return {
    score: Math.max(0, score),
    penalty: Math.max(0, 100 - score) * 0.18,
    gaps,
    answerabilityScore: answerability.score,
    templatePhraseHits,
    answerLeakHits,
  };
}

function scoreAnswerability(atoms) {
  const teachPrompts = atoms.map((atom) => String(atom.teach_prompt || "")).filter(Boolean);
  if (!teachPrompts.length) return { score: 55, gaps: ["缺少儿童可回答提问"] };
  const clearActionPattern = /多少|几|哪|什么|为什么|吗|？|\?|说|回答|填|选|找|看|比|算|读|讲|判断|指出|写|圈|数/;
  const modelOnlyPattern = /老师先|先听老师|老师带你|老师示范|老师把/;
  const clearCount = teachPrompts.filter((text) => clearActionPattern.test(text) || modelOnlyPattern.test(text)).length;
  const tooLongCount = teachPrompts.filter((text) => normalizeForLength(text).length > 96).length;
  const vagueCount = teachPrompts.filter((text) => /认识[^。！？!?]{0,18}$|理解[^。！？!?]{0,18}$|掌握[^。！？!?]{0,18}$/.test(normalizeForLength(text))).length;
  const clearRatio = clearCount / teachPrompts.length;
  let score = 100;
  const gaps = [];
  if (clearRatio < 0.72) {
    score -= Math.round((0.72 - clearRatio) * 60);
    gaps.push("部分提问不够明确，孩子可能不知道答什么");
  }
  if (tooLongCount > 0) {
    score -= Math.min(18, tooLongCount * 3);
    gaps.push("部分老师话术过长");
  }
  if (vagueCount > 0) {
    score -= Math.min(12, vagueCount * 4);
    gaps.push("部分小台阶只写知识名，缺少可回答动作");
  }
  return { score: Math.max(0, score), gaps };
}

function normalizeForLength(text) {
  return String(text || "").replace(/\s+/g, "");
}

function countPatternHits(text, patterns) {
  return patterns.reduce((sum, pattern) => sum + ((String(text || "").match(pattern) || []).length), 0);
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
  console.log(`- 话术自然度估算：${data.naturalnessScore}%`);
  console.log(`- 儿童可回答度估算：${data.answerabilityScore}%`);
  console.log(`- 机械模板命中：${data.templatePhraseHits}`);
  console.log(`- 疑似提前泄露答案命中：${data.answerLeakHits}`);
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
