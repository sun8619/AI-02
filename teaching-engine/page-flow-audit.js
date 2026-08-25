import {
  MasteryDimension,
  TeachingState,
  createKnowledgeGraph,
  getEntryAtom,
} from "./knowledge-model.js";
import { allKnowledgeModules } from "./generated-curriculum.js";
import { runTeachingTurn } from "./state-machine.js";

const graph = createKnowledgeGraph(allKnowledgeModules);
const points = allKnowledgeModules.flatMap((module) =>
  (module.points || []).map((point) => ({
    ...point,
    grade_term: module.grade_term,
    module_name: module.module_name,
  })),
);

const reports = points.map(auditPageFlow);
const readyReports = reports.filter((item) => item.level === "ready");
const needsWorkReports = reports.filter((item) => item.level === "needs-work");
const weakReports = reports.filter((item) => item.level === "weak");

const summary = {
  modules: allKnowledgeModules.length,
  knowledgePoints: points.length,
  readyPoints: readyReports.length,
  needsWorkPoints: needsWorkReports.length,
  weakPoints: weakReports.length,
  pageExperienceReadiness: Math.round(average(reports.map((item) => item.score))),
  averageClearPromptScore: Math.round(average(reports.map((item) => item.clearPromptScore))),
  averageNaturalnessScore: Math.round(average(reports.map((item) => item.naturalnessScore))),
  averageVisualSyncScore: Math.round(average(reports.map((item) => item.visualSyncScore))),
  averageAnswerLeakScore: Math.round(average(reports.map((item) => item.answerLeakScore))),
  averageKnowledgeBoundaryScore: Math.round(average(reports.map((item) => item.knowledgeBoundaryScore))),
  criticalFindings: collectCriticalFindings(reports),
    naturalnessFindings: reports
    .filter((item) => item.naturalnessScore < 90)
    .sort((a, b) => a.naturalnessScore - b.naturalnessScore)
    .slice(0, 10)
    .map((item) => ({
      id: item.id,
      title: item.title,
      family: item.family,
      naturalnessScore: item.naturalnessScore,
      gaps: item.gaps.filter((gap) => /机械|重复|过长/.test(gap)).slice(0, 4),
      repeatedOpeners: item.naturalnessDetails?.repeatedOpeners || [],
      repeatedFirstPhrases: item.naturalnessDetails?.repeatedFirstPhrases || [],
      longSamples: item.naturalnessDetails?.longSamples || [],
    })),
  weakestPoints: reports
    .filter((item) => item.level !== "ready")
    .sort((a, b) => a.score - b.score)
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      title: item.title,
      grade: item.grade,
      family: item.family,
      score: item.score,
      gaps: item.gaps.slice(0, 6),
    })),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  printHumanSummary(summary);
}

function auditPageFlow(point) {
  const lesson = makeSyntheticLesson(point);
  const events = [];
  const gaps = [];
  let session = null;

  capture(events, "starter", {
    message: makeStarterPrompt(point),
    currentStep: point.atoms?.[0]?.atom_name || point.entry_question || point.point_name,
    point,
    expected: null,
    requiresAnswer: true,
  });

  const noResponse = runTeachingTurn({ graph, lesson, childText: "", session, inputType: "audit" });
  captureResult(events, "no-response", noResponse, point, null, true);

  const offTopic = runTeachingTurn({ graph, lesson, childText: "我想玩游戏", session, inputType: "audit" });
  captureResult(events, "off-topic", offTopic, point, null, true);

  for (let guard = 0; guard < Math.max(8, (point.atoms || []).length + 3); guard += 1) {
    const currentAtom = graph.atomById.get(session?.current_atom_id) || getEntryAtom(graph, point.id);
    if (!currentAtom) {
      gaps.push("没有可进入的小台阶");
      break;
    }
    const result = runTeachingTurn({
      graph,
      lesson,
      childText: answerForAtom(currentAtom),
      session,
      inputType: "audit",
    });
    captureResult(events, `atom-${guard + 1}`, result, point, null, result?.nextPhase !== "summary");
    session = result?.engineSession || session;
    if (session?.current_state === TeachingState.PRACTICE_SET) break;
  }

  const assessments = getAssessmentPlan(point);
  for (let index = 0; index < assessments.length && session?.current_state === TeachingState.PRACTICE_SET; index += 1) {
    const template = assessments[session.assessment_index] || assessments[index];
    const wrongProbe = runTeachingTurn({ graph, lesson, childText: "我想换成画画", session, inputType: "audit" });
    captureResult(events, `assessment-${index + 1}-off-topic`, wrongProbe, point, template, true);

    const result = runTeachingTurn({
      graph,
      lesson,
      childText: answerForAssessment(template),
      session,
      inputType: "audit",
    });
    captureResult(events, `assessment-${index + 1}`, result, point, template, result?.nextPhase !== "summary");
    session = result?.engineSession || session;
  }

  if (session?.current_state !== TeachingState.MASTERED) gaps.push("老师归纳并通过整题检验后，页面没有走到掌握状态");

  const clearPrompt = scoreClearPrompts(events);
  const naturalness = scoreNaturalness(events);
  const visualSync = scoreVisualSync(events, point);
  const answerLeak = scoreAnswerLeak(events);
  const boundary = scoreKnowledgeBoundary(events, point);
  gaps.push(...clearPrompt.gaps, ...naturalness.gaps, ...visualSync.gaps, ...answerLeak.gaps, ...boundary.gaps);

  const score = Math.round(
    clearPrompt.score * 0.31 +
      naturalness.score * 0.26 +
      visualSync.score * 0.2 +
      answerLeak.score * 0.13 +
      boundary.score * 0.1,
  );

  const uniqueGaps = unique(gaps);
  const blockingGaps = uniqueGaps.filter((gap) => !/同一路径开头重复偏多/.test(gap));

  return {
    id: point.id,
    title: point.child_title || point.point_name || point.id,
    grade: point.grade_term,
    family: point.teaching_family || "generic",
    score,
    level: score >= 90 && blockingGaps.length === 0 ? "ready" : score >= 72 ? "needs-work" : "weak",
    clearPromptScore: clearPrompt.score,
    naturalnessScore: naturalness.score,
    visualSyncScore: visualSync.score,
    answerLeakScore: answerLeak.score,
    knowledgeBoundaryScore: boundary.score,
    gaps: uniqueGaps,
    blockingGaps,
    naturalnessDetails: naturalness.details,
  };
}

function captureResult(events, stage, result, point, assessment = null, requiresAnswer = true) {
  if (!result) {
    capture(events, stage, {
      message: "",
      currentStep: "",
      point,
      assessment,
      expected: assessment?.expected || null,
      requiresAnswer,
    });
    return;
  }
  capture(events, stage, {
    message: result.aiMessage,
    currentStep: result.currentStep,
    point,
    assessment: result.assessment || assessment,
    expected: (result.assessment || assessment)?.expected || null,
    requiresAnswer,
  });
}

function capture(events, payloadStage, { message, currentStep, point, assessment, expected, requiresAnswer }) {
  events.push({
    stage: payloadStage,
    message: String(message || "").trim(),
    currentStep: String(currentStep || "").trim(),
    pointTitle: point.child_title || point.point_name || "",
    pointName: point.point_name || "",
    family: point.teaching_family || "generic",
    atomNames: (point.atoms || []).map((atom) => atom.atom_name || ""),
    assessmentPrompt: assessment?.prompt || "",
    assessmentDimension: assessment?.dimension || "",
    expected,
    requiresAnswer: Boolean(requiresAnswer),
  });
}

function makeStarterPrompt(point) {
  const firstAtom = (point.atoms || [])[0];
  return firstAtom?.teach_prompt || point.entry_question || `我们先看${point.child_title || point.point_name}。`;
}

function scoreClearPrompts(events) {
  const scored = events.filter((event) => event.requiresAnswer && event.message);
  const bad = scored.filter((event) => !hasClearAsk(event.message));
  const vague = scored.filter((event) => hasVagueOnlyAsk(event.message));
  let score = 100;
  score -= Math.min(46, bad.length * 8);
  score -= Math.min(24, vague.length * 4);
  return {
    score: Math.max(0, score),
    gaps: [
      ...bad.slice(0, 4).map((event) => `老师回复缺少明确回答目标：${shorten(event.message)}`),
      ...vague.slice(0, 3).map((event) => `老师回复目标偏泛：${shorten(event.message)}`),
    ],
  };
}

function scoreNaturalness(events) {
  const messages = events.map((event) => event.message).filter(Boolean);
  const combined = messages.join("\n");
  const banned = [
    /你先跟老师说一句/g,
    /现在只练一句/g,
    /你说半句也可以/g,
    /老师把方法句放在这里/g,
    /老师先说结果/g,
    /这题最后是/g,
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
  const templateHits = countPatternHits(combined, banned);
  const longMessages = messages.filter((message) => compact(message).length > 190);
  const firstPhrases = messages.map(firstPhrase).filter(Boolean);
  const repeatedFirstPhrases = countRepeated(firstPhrases);
  const openerPhrases = messages.map((message) => compact(message).slice(0, 12)).filter(Boolean);
  const repeatedOpeners = countRepeated(openerPhrases);
  let score = 100;
  score -= Math.min(40, templateHits * 8);
  score -= Math.min(20, repeatedFirstPhrases * 4);
  score -= Math.min(18, repeatedOpeners * 3);
  score -= Math.min(16, longMessages.length * 4);
  return {
    score: Math.max(0, score),
    gaps: [
      ...(templateHits ? [`出现 ${templateHits} 处机械或泄题模板话术`] : []),
      ...(repeatedFirstPhrases >= 2 ? [`同一路径开头重复偏多：${repeatedFirstPhrases} 处`] : []),
      ...(longMessages.length ? [`有 ${longMessages.length} 条老师回复过长`] : []),
    ],
    details: {
      repeatedFirstPhrases: topRepeated(firstPhrases).slice(0, 3),
      repeatedOpeners: topRepeated(openerPhrases).slice(0, 3),
      longSamples: longMessages.slice(0, 2).map((message) => shorten(message, 80)),
    },
  };
}

function scoreVisualSync(events, point) {
  const pointTokens = tokensForVisual(point.child_title || point.point_name || "");
  const atomTokens = tokensForVisual((point.atoms || []).map((atom) => atom.atom_name).join(" "));
  const stepEvents = events.filter((event) => event.currentStep);
  const weak = stepEvents.filter((event) => {
    const text = `${event.currentStep} ${event.assessmentPrompt}`;
    return !containsAnyToken(text, pointTokens) && !containsAnyToken(text, atomTokens) && !/小台阶|闯关|重讲|回到|完成|老师|再讲一次|拆小|分与合/.test(text);
  });
  const stale = stepEvents.filter((event, index) => {
    if (index === 0) return false;
    const prev = stepEvents[index - 1];
    return compact(prev.currentStep) === compact(event.currentStep) && compact(prev.message) !== compact(event.message);
  });
  let score = 100;
  score -= Math.min(24, weak.length * 6);
  score -= Math.min(24, stale.length * 8);
  return {
    score: Math.max(0, score),
    gaps: [
      ...weak.slice(0, 3).map((event) => `图示同步线索偏弱：${event.currentStep}`),
      ...(stale.length ? [`连续互动里 currentStep 没有变化 ${stale.length} 次`] : []),
    ],
  };
}

function scoreAnswerLeak(events) {
  const risky = events.filter((event) => {
    if (![MasteryDimension.DIRECT, MasteryDimension.VARIANT].includes(event.assessmentDimension)) return false;
    const answerTokens = expectedAnswerTokens(event.expected);
    if (!answerTokens.length) return false;
    const teacherScaffold = removeAssessmentPrompt(event.message, event.assessmentPrompt);
    return answerTokens.some((token) => token && containsExpectedAnswer(teacherScaffold, token, event.expected));
  });
  let score = 100 - Math.min(60, risky.length * 15);
  return {
    score: Math.max(0, score),
    gaps: risky.slice(0, 4).map((event) => `检验题提示疑似提前出现答案：${shorten(event.message)}`),
  };
}

function removeAssessmentPrompt(message, prompt) {
  const text = String(message || "");
  const assessment = String(prompt || "").trim();
  if (!assessment) return text;
  return text.replace(assessment, "本轮检验题");
}

function scoreKnowledgeBoundary(events, point) {
  const family = point.teaching_family || "";
  const combinedEvents = events
    .map((event) => `${event.message} ${event.currentStep} ${event.assessmentPrompt}`)
    .join("\n")
    .replace(/小角度|角度|直角|锐角|钝角/g, "");
  const leaks = [];
  if (family === "composition") {
    const matches = combinedEvents.match(/人民币|元|角|找回|找零|价钱|付的钱|购物/g) || [];
    if (matches.length) leaks.push(`分与合路径混入人民币词：${unique(matches).slice(0, 4).join("、")}`);
  }
  if (family === "money" || family === "moneyApplication") {
    const matches = combinedEvents.match(/时针|分针|钟面|直角|锐角|钝角|统计表|第几个/g) || [];
    if (matches.length) leaks.push(`人民币路径混入其他知识点词：${unique(matches).slice(0, 4).join("、")}`);
  }
  if (family === "time" || family === "timeDuration") {
    const matches = combinedEvents.match(/元|角|人民币|找回|找零|购物/g) || [];
    if (matches.length) leaks.push(`时间路径混入人民币词：${unique(matches).slice(0, 4).join("、")}`);
  }
  return {
    score: leaks.length ? 55 : 100,
    gaps: leaks,
  };
}

function hasClearAsk(message) {
  const text = String(message || "");
  return (
    /[？?]/.test(text) ||
    /你可以|你先|你现在|你不用|你别|你来|你接|你试|请|说出|说一说|告诉|回答|填|算|数一数|比一比|看一看|想一想|先看|先说|再说|然后说|先判断|先找|只回答|只看|接一句|接这半句|接着说|跟着说|跟着读|跟读|试着说|只要说|只说|现在说|这一轮回答|这一轮说|用自己的话说|说一个|说成/.test(text)
  );
}

function hasVagueOnlyAsk(message) {
  const text = String(message || "");
  return (
    /你先说第一步该看什么[？?]?$/.test(text) ||
    /先说一个词也可以/.test(text) ||
    /先说一个词/.test(text) ||
    /先抓住关键词/.test(text) ||
    /先说一个关键词/.test(text) ||
    /先抓住这句/.test(text) ||
    /看图时先抓/.test(text) ||
    /这一轮回答/.test(text) ||
    /这一步先回答这一点/.test(text) ||
    /这一小步要你接着回答/.test(text) ||
    /你只要跟着说/.test(text) ||
    /先说一个也可以/.test(text) ||
    /你不用自己编/.test(text) ||
    /说一个你记住的词/.test(text)
  );
}

function expectedAnswerTokens(expected = {}) {
  if (!expected || !expected.kind) return [];
  if (expected.kind === "number") return [`${expected.value}`];
  if (expected.kind === "money_jiao") return [`${expected.totalJiao}角`];
  if (expected.kind === "money_yuan") return [`${expected.yuan}元`];
  if (expected.kind === "money_decompose") return [`${expected.yuan}元${expected.jiao}角`];
  if (expected.kind === "repeat_add") return [Array.from({ length: expected.count }, () => expected.addend).join("+")];
  if (expected.kind === "groups_of") return [`${expected.count}个${expected.each}`];
  return [];
}

function containsExpectedAnswer(message, token, expected = {}) {
  const text = stripNonAnswerNumbers(String(message || ""));
  const rawToken = String(token || "");
  if (!rawToken) return false;
  if (expected?.kind === "number" && /^\d+$/.test(rawToken)) {
    return new RegExp(`(^|[^\\d])${escapeRegExp(rawToken)}([^\\d]|$)`).test(text);
  }
  return compact(text).includes(compact(rawToken));
}

function stripNonAnswerNumbers(message) {
  return String(message || "")
    .replace(/第\s*\d+\s*(?:小?题|关|步)/g, "本轮")
    .replace(/\d+\s*[+＋\-－×xX*÷/]\s*\d+/g, "算式")
    .replace(/比如[:：]?\s*\d+\s*(元|角|分|个|只|本|支|米|厘米|克|千克)?/g, "比如");
}

function escapeRegExp(text) {
  return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeSyntheticLesson(point) {
  const assessments = point.assessment_templates || [];
  const answerKeywords = unique([
    ...assessments.flatMap((item) => item.expected_keywords || []),
    ...assessments.map((item) => answerForAssessment(item)),
  ]);
  const attemptKeywords = unique((point.atoms || []).flatMap((atom) => atom.check_keywords || atom.assessment_targets || []));
  const whyKeywords = unique([
    ...(point.feynman_prompt?.required_signals || []),
    ...assessments.filter((item) => item.dimension === MasteryDimension.REASONING).flatMap((item) => item.expected_keywords || []),
  ]);
  return {
    id: point.id,
    node: point.child_title || point.point_name,
    lessonName: point.point_name,
    answerSignals: {
      answerKeywords,
      attemptKeywords,
      whyKeywords,
      resultKeywords: answerKeywords,
    },
  };
}

function getAssessmentPlan(point) {
  const templates = point?.assessment_templates || [];
  if (templates.length <= 4) return templates;
  const plan = [];
  const add = (template) => {
    if (template && !plan.some((item) => item.id === template.id)) plan.push(template);
  };
  const direct = templates.filter((item) => item.dimension === MasteryDimension.DIRECT);
  const variant = templates.filter((item) => item.dimension === MasteryDimension.VARIANT);
  const reasoning = templates.filter((item) => item.dimension === MasteryDimension.REASONING);
  add(direct[0]);
  add(variant[0] || direct[1]);
  add(variant.find((item) => item.primary_atom_id !== plan[1]?.primary_atom_id) || variant[1]);
  add(reasoning[0]);
  for (const template of templates) {
    if (plan.length >= 4) break;
    add(template);
  }
  return plan.slice(0, 4);
}

function answerForAtom(atom) {
  return (
    atom?.repeatSentence ||
    atom?.check_keywords?.[0] ||
    atom?.assessment_targets?.[0] ||
    atom?.can_do_statement ||
    atom?.atom_name ||
    "我先看这一步"
  );
}

function answerForAssessment(template = {}) {
  const expected = template.expected || {};
  if (template.dimension === MasteryDimension.REASONING) {
    const signals = unique((template.expected_keywords || []).filter(isUsefulReasoningKeyword)).slice(0, 3);
    if (signals.length) return `因为${signals.join("，")}，所以这样做。`;
    return "因为要先看题目，再一步一步说方法。";
  }
  if (expected.kind === "number") return `${expected.value}`;
  if (expected.kind === "money_jiao") return `${expected.totalJiao}角`;
  if (expected.kind === "money_yuan") return `${expected.yuan}元`;
  if (expected.kind === "money_decompose") return `${expected.yuan}元${expected.jiao}角`;
  if (expected.kind === "repeat_add") return Array.from({ length: expected.count }, () => expected.addend).join("+");
  if (expected.kind === "groups_of") return `${expected.count}个${expected.each}`;
  return template.expected_keywords?.[0] || "我先看题目，再说方法";
}

function isUsefulReasoningKeyword(keyword) {
  const text = compact(keyword);
  if (!text || ["因为", "所以", "先", "再", "<", ">", "=", "对", "错"].includes(text)) return false;
  if (text.includes("能独立") || text.includes("换数字")) return false;
  return text.length >= 2 || /\d/.test(text);
}

function answerForTeachback(point) {
  const signals = point.feynman_prompt?.required_signals || [];
  if (signals.length) return signals.join("，所以");
  const atoms = point.atoms || [];
  return atoms.map((atom) => atom.atom_name).join("，然后") || "我先看题目，再一步一步说原因";
}

function collectCriticalFindings(items) {
  return items
    .filter((item) => item.score < 72 || item.gaps.some((gap) => /提前出现答案|缺少明确回答目标|没有走到掌握/.test(gap)))
    .slice(0, 12)
    .map((item) => ({ id: item.id, title: item.title, score: item.score, gaps: item.gaps.slice(0, 4) }));
}

function printHumanSummary(data) {
  console.log("乐之老师页面体验体检");
  console.log(`- 知识点：${data.knowledgePoints}`);
  console.log(`- 页面体验就绪度：${data.pageExperienceReadiness}`);
  console.log(`- 清楚提问：${data.averageClearPromptScore}`);
  console.log(`- 自然度：${data.averageNaturalnessScore}`);
  console.log(`- 图示同步：${data.averageVisualSyncScore}`);
  console.log(`- 防泄题：${data.averageAnswerLeakScore}`);
  console.log(`- 知识边界：${data.averageKnowledgeBoundaryScore}`);
  if (data.criticalFindings.length) {
    console.log("- 重点问题：");
    for (const item of data.criticalFindings) {
      console.log(`  - ${item.title}: ${item.gaps.join("；")}`);
    }
  }
}

function tokensForVisual(text) {
  return unique(
    String(text || "")
      .split(/[：:，,。！？?、\s·（）()【】\[\]「」]/)
      .map((item) => compact(item))
      .filter((item) => item.length >= 2 && !/第?\d+|小台阶|知识点|认识|解决|简单/.test(item)),
  );
}

function containsAnyToken(text, tokens) {
  const compactText = compact(text);
  return (tokens || []).some((token) => token && compactText.includes(compact(token)));
}

function firstPhrase(message) {
  return compact(String(message || "").split(/[。！？?]/)[0]).slice(0, 16);
}

function countRepeated(items) {
  const counts = new Map();
  for (const item of items) counts.set(item, (counts.get(item) || 0) + 1);
  return Array.from(counts.values()).filter((count) => count > 1).reduce((sum, count) => sum + count - 1, 0);
}

function topRepeated(items) {
  const counts = new Map();
  for (const item of items) counts.set(item, (counts.get(item) || 0) + 1);
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([text, count]) => ({ text, count }));
}

function countPatternHits(text, patterns) {
  return patterns.reduce((sum, pattern) => {
    const matches = String(text || "").match(pattern);
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function average(values) {
  const list = values.filter((value) => Number.isFinite(value));
  return list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 0;
}

function shorten(text, length = 44) {
  const compacted = String(text || "").replace(/\s+/g, " ").trim();
  return compacted.length > length ? `${compacted.slice(0, length)}...` : compacted;
}

function compact(text) {
  return String(text || "").replace(/\s+/g, "");
}

function unique(items) {
  return Array.from(new Set((items || []).filter(Boolean)));
}
