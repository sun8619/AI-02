import {
  MasteryDimension,
  TeachingState,
  createKnowledgeGraph,
  getEntryAtom,
  getPointAtoms,
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

const reports = points.map(simulatePoint);
const failedReports = reports.filter((item) => item.failures.length);
const summary = {
  modules: allKnowledgeModules.length,
  knowledgePoints: points.length,
  completedPaths: reports.filter((item) => item.completed).length,
  failedPaths: failedReports.length,
  averageTurns: Math.round(average(reports.map((item) => item.turns)) * 10) / 10,
  maxTurns: Math.max(...reports.map((item) => item.turns)),
  pathReadiness: Math.round(percent(reports, (item) => item.completed && item.failures.length === 0)),
  failureSamples: failedReports.slice(0, 12).map((item) => ({
    id: item.id,
    title: item.title,
    grade: item.grade,
    family: item.family,
    failures: item.failures,
  })),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  printHumanSummary(summary);
}

function simulatePoint(point) {
  const lesson = makeSyntheticLesson(point);
  const atoms = getPointAtoms(graph, point.id);
  const failures = [];
  const messages = [];
  let session = null;
  let result = null;
  let turns = 0;

  const noResponse = runTeachingTurn({ graph, lesson, childText: "", session, inputType: "audit" });
  assertRepair(noResponse, failures, "空白输入不应推进");
  collectMessage(messages, noResponse);

  const offTopic = runTeachingTurn({ graph, lesson, childText: "我想吃冰淇淋", session, inputType: "audit" });
  assertRepair(offTopic, failures, "跑题输入不应推进");
  collectMessage(messages, offTopic);

  for (let guard = 0; guard < Math.max(8, atoms.length + 3); guard += 1) {
    const currentAtom = graph.atomById.get(session?.current_atom_id) || getEntryAtom(graph, point.id);
    if (!currentAtom) {
      failures.push("没有可进入的小台阶");
      break;
    }
    result = runTeachingTurn({
      graph,
      lesson,
      childText: answerForAtom(currentAtom),
      session,
      inputType: "audit",
    });
    turns += 1;
    collectMessage(messages, result);
    if (!result) {
      failures.push(`正确回答「${currentAtom.atom_name}」后没有返回结果`);
      break;
    }
    if (result.nextPhase === "repair") {
      failures.push(`正确回答「${currentAtom.atom_name}」后仍进入补救`);
      break;
    }
    session = result.engineSession;
    if (session?.current_state === TeachingState.PRACTICE_SET) break;
  }

  if (session?.current_state !== TeachingState.PRACTICE_SET) {
    failures.push("走完小台阶后没有进入掌握检验");
  }

  const assessments = getAssessmentPlan(point);
  for (let index = 0; index < assessments.length && session?.current_state === TeachingState.PRACTICE_SET; index += 1) {
    const template = assessments[session.assessment_index] || assessments[index];
    const wrongProbe = runTeachingTurn({
      graph,
      lesson,
      childText: "我想玩游戏",
      session,
      inputType: "audit",
    });
    assertRepair(wrongProbe, failures, `第${index + 1}道检验题跑题不应推进`);
    collectMessage(messages, wrongProbe);

    result = runTeachingTurn({
      graph,
      lesson,
      childText: answerForAssessment(template),
      session,
      inputType: "audit",
    });
    turns += 1;
    collectMessage(messages, result);
    if (!result) {
      failures.push(`第${index + 1}道检验题正确回答后没有返回结果`);
      break;
    }
    if (result.nextPhase === "repair") {
      failures.push(`第${index + 1}道检验题正确回答后仍进入补救`);
      break;
    }
    session = result.engineSession;
  }

  if (session?.current_state !== TeachingState.FEYNMAN_EXPLAIN && session?.current_state !== TeachingState.MASTERED) {
    failures.push("通过检验题后没有进入讲给老师听");
  }

  if (session?.current_state === TeachingState.FEYNMAN_EXPLAIN) {
    const weakTeachback = runTeachingTurn({ graph, lesson, childText: "好的", session, inputType: "audit" });
    assertRepair(weakTeachback, failures, "费曼复述里敷衍回答不应过关");
    collectMessage(messages, weakTeachback);

    result = runTeachingTurn({
      graph,
      lesson,
      childText: answerForTeachback(point),
      session,
      inputType: "audit",
    });
    turns += 1;
    collectMessage(messages, result);
    session = result?.engineSession || session;
  }

  if (session?.current_state !== TeachingState.MASTERED) {
    failures.push("完整路径没有到达掌握状态");
  }

  const messageFailures = scoreMessages(messages);
  failures.push(...messageFailures);

  return {
    id: point.id,
    title: point.child_title || point.point_name || point.id,
    grade: point.grade_term,
    family: point.teaching_family || "generic",
    turns,
    completed: session?.current_state === TeachingState.MASTERED,
    failures: unique(failures),
  };
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

function assertRepair(result, failures, label) {
  if (!result) {
    failures.push(`${label}：没有返回结果`);
    return;
  }
  if (["guiding", "teachback", "summary"].includes(result.nextPhase)) {
    failures.push(`${label}：被推进到了 ${result.nextPhase}`);
  }
}

function collectMessage(messages, result) {
  if (result?.aiMessage) messages.push(String(result.aiMessage));
}

function scoreMessages(messages) {
  const failures = [];
  const combined = messages.join("\n");
  const blocked = [
    /现在只练一句/g,
    /你说半句也可以/g,
    /老师把方法句放在这里/g,
    /你先跟老师说一句/g,
    /老师先说结果/g,
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
  if (countPatternHits(combined, blocked)) failures.push("路径中出现机械模板或直接给答案话术");
  const tooLong = messages.filter((message) => compact(message).length > 150).length;
  if (tooLong) failures.push(`有 ${tooLong} 条老师回复过长`);
  return failures;
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

function printHumanSummary(data) {
  console.log("乐之老师真实路径体检");
  console.log(`- 知识点：${data.knowledgePoints}`);
  console.log(`- 完成路径：${data.completedPaths}/${data.knowledgePoints}`);
  console.log(`- 路径就绪度：${data.pathReadiness}`);
  console.log(`- 平均轮数：${data.averageTurns}`);
  if (data.failureSamples.length) {
    console.log("- 需要处理：");
    for (const item of data.failureSamples) {
      console.log(`  - ${item.grade} ${item.title}: ${item.failures.join("；")}`);
    }
  }
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

function percent(items, predicate) {
  return Math.round((items.filter(predicate).length / Math.max(items.length, 1)) * 100);
}

function compact(text) {
  return String(text || "").replace(/\s+/g, "");
}

function unique(items) {
  return Array.from(new Set((items || []).filter(Boolean)));
}
