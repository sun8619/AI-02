import { readFileSync } from "node:fs";
import vm from "node:vm";

const rootUrl = new URL("./", import.meta.url);
const bank = loadBrowserGlobal("./grade1-2-question-bank.js", "gradeOneTwoQuestionBank");
const overlays = loadBrowserGlobal("./knowledge-point-teaching-overlays.js", "LezhiKnowledgePointOverlays");
const appSource = readFileSync(new URL("../app.js", rootUrl), "utf8");
const points = Array.isArray(bank?.points) ? bank.points : [];
const failures = [];
const warnings = [];
const questionIds = new Set();
let questionCount = 0;
let applicationCount = 0;
let arithmeticStoriesChecked = 0;

check(Boolean(bank), "题库无法加载");
check(Boolean(overlays), "知识点专门教学方案无法加载");
check(points.length === Number(bank?.stats?.pointCount), `知识点数量与题库统计不一致：${points.length}/${bank?.stats?.pointCount}`);
check(overlays?.list?.().length === points.length, `知识点专门教学方案数量不完整：${overlays?.list?.().length || 0}/${points.length}`);

for (const point of points) {
  const questions = Array.isArray(point.questions) ? point.questions : [];
  const pointOverlay = overlays?.getPointOverlay?.(point.id);
  check(Boolean(point.id && point.title && point.grade && point.unit), `知识点基础信息不完整：${point.id || point.title || "未知知识点"}`);
  check(questions.length > 0, `知识点没有题目：${point.id}`);
  check((point.microSteps || []).length >= 3, `知识点缺少可执行小台阶：${point.id}`);
  check(Boolean(pointOverlay), `知识点缺少专门教学方案：${point.id}`);
  check((pointOverlay?.microSteps || []).length >= 3, `知识点专门教学方案缺少小台阶：${point.id}`);
  check(Boolean(pointOverlay?.family && pointOverlay?.visualType), `知识点缺少教学类型或图示类型：${point.id}`);

  for (const question of questions) {
    questionCount += 1;
    const label = `${point.id}/${question.id || "未知题目"}`;
    check(Boolean(question.id), `题目缺少 id：${label}`);
    check(!questionIds.has(question.id), `题目 id 重复：${question.id}`);
    questionIds.add(question.id);
    check(Boolean(String(question.prompt || "").trim()), `题干为空：${label}`);
    check(Boolean(String(question.answer || "").trim()), `答案为空：${label}`);
    check(Boolean(String(question.explanation || "").trim()), `讲解为空：${label}`);
    check(Array.isArray(question.answerKeywords) && question.answerKeywords.length > 0, `答案关键词为空：${label}`);

    if (question.type === "应用题") {
      applicationCount += 1;
      if (!/[？?。]$/.test(String(question.prompt || "").trim())) warnings.push(`应用题结尾不清楚：${label}`);
      validateSimpleStory(question, label);
    }

    if (question.hasVisualMarkup) {
      check(/<svg[\s>]/.test(question.visualMarkup || ""), `图文题缺少有效 SVG：${label}`);
      check(!/<script[\s>]/i.test(question.visualMarkup || ""), `图文题包含脚本：${label}`);
    }
  }
}

check(questionCount === Number(bank?.stats?.questionCount), `题目数量与题库统计不一致：${questionCount}/${bank?.stats?.questionCount}`);
check(!appSource.includes("题目到底要我们求一共有多少"), "应用题仍包含无法作答的同义反问");
check(appSource.includes("const questionPromptText = normalizeText"), "知识类型仍可能被答案或讲解文字污染");
check(!appSource.includes("lesson.sourceQuestionFamily = questionFamily"), "切题时仍会覆盖知识点原始类型");
check(/function renderKidCurrentProblem\(/.test(appSource), "孩子端没有固定显示当前完整题目");
check(/function ensureTeacherMessageHasAnswerTarget\(/.test(appSource), "老师话术缺少明确回答目标保护");
check(/function createStepResponseInstruction\(/.test(appSource), "小台阶缺少统一回答格式");
check(/visualContextKey/.test(appSource), "图示没有绑定当前题目上下文");
check(/function inferActiveQuestionFamily[\s\S]*?inferQuestionTeachingFamily[\s\S]*?return knownFamily/.test(appSource), "当前题目的知识类型没有优先于知识点大类");
check(/function renderApplicationStorySvg\(/.test(appSource), "应用题缺少按当前数字绘图的图示");
check(/function findNumericUnitVoiceCorrection\(/.test(appSource), "语音缺少数字和单位的语境纠错");
check(/function renderVoiceConfirmation\(\)\s*\{\s*return "";\s*\}/.test(appSource), "语音仍会逐次弹出确认框");
check(!/return\s*\{\s*status:\s*"confirm"/.test(extractFunction(appSource, "assessVoiceTranscript")), "语音评估仍可能进入逐次确认");
check(/const DEFAULT_LESSON_SOURCE_ID = "G1V2-U5-KP01"/.test(appSource), "默认入口没有固定到元角分换算");
check(/detectConcreteOperationFamily/.test(appSource), "应用题没有按当前题干绑定加法或减法故事关系");
check(/function sanitizeMicrostepExplanation\(/.test(appSource), "讲后检查缺少防泄题和跨知识点内容保护");
check(
  /const revealAnswer = shouldRevealFinalVisualAnswer\(getVisualRevealMode\(lesson\)\);/.test(appSource),
  "人民币当前题图仍可能在孩子作答前直接显示答案",
);

const report = {
  knowledgePoints: points.length,
  questions: questionCount,
  applicationQuestions: applicationCount,
  arithmeticStoriesChecked,
  failures,
  warnings,
  passed: failures.length === 0,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`运行完整性检查：${points.length} 个知识点，${questionCount} 道题，${applicationCount} 道应用题。`);
  console.log(`已核对 ${arithmeticStoriesChecked} 道可直接验算的加减故事题。`);
  if (warnings.length) console.log(`提醒 ${warnings.length} 条：\n- ${warnings.slice(0, 12).join("\n- ")}`);
  if (failures.length) console.error(`失败 ${failures.length} 条：\n- ${failures.join("\n- ")}`);
  else console.log("关键检查全部通过。\n");
}

if (failures.length) process.exitCode = 1;

function validateSimpleStory(question, label) {
  const prompt = String(question.prompt || "");
  const answer = firstNumber(question.answer);
  if (!Number.isFinite(answer)) return;

  const addition = prompt.match(/原来有\s*(\d+)[^，。]*[，,。].*?(?:又得到|又来了|又有|增加了|又运来|又开来)\s*(\d+).*?(?:一共|现在有)/);
  if (addition) {
    arithmeticStoriesChecked += 1;
    const expected = Number(addition[1]) + Number(addition[2]);
    check(answer === expected, `加法故事题答案不一致：${label}，应为 ${expected}，实际为 ${answer}`);
    return;
  }

  const subtraction = prompt.match(/原来有\s*(\d+)[^，。]*[，,。].*?(?:拿走|飞走|用去|卖出|开走|吃掉|借出)(?:了)?\s*(\d+).*?(?:还剩|剩下)/);
  if (subtraction) {
    arithmeticStoriesChecked += 1;
    const expected = Number(subtraction[1]) - Number(subtraction[2]);
    check(answer === expected, `减法故事题答案不一致：${label}，应为 ${expected}，实际为 ${answer}`);
  }
}

function firstNumber(value) {
  const match = String(value || "").match(/-?\d+/);
  return match ? Number(match[0]) : Number.NaN;
}

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) return "";
  const next = source.indexOf("\nfunction ", start + 10);
  return source.slice(start, next < 0 ? source.length : next);
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function loadBrowserGlobal(relativePath, globalName) {
  const source = readFileSync(new URL(relativePath, rootUrl), "utf8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: relativePath });
  return context.window[globalName];
}
