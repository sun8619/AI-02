import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import {
  DependencyStrength,
  ErrorTag,
  MasteryDimension,
  TeachingAction,
  makeDependency,
} from "./knowledge-model.js";
import { pilotKnowledgeModules } from "./pilot-curriculum.js";

const direct = MasteryDimension.DIRECT;
const variant = MasteryDimension.VARIANT;
const reasoning = MasteryDimension.REASONING;

const questionBankLessonAliases = {
  "G1V1-U5-KP01": "g1a-carry-add-20",
  "G1V2-U5-KP01": "renminbi-conversion",
  "G1V2-U5-KP02": "g1b-simple-shopping",
  "G2V1-U4-KP01": "g2a-multiply-meaning",
  "G2V2-U2-KP01": "g2b-division-meaning",
};

const questionBank = loadQuestionBank();

export const generatedKnowledgeModules = createGeneratedModules(questionBank.points || []);
export const allKnowledgeModules = mergePilotAndGenerated(pilotKnowledgeModules, generatedKnowledgeModules);

function loadQuestionBank() {
  const filename = fileURLToPath(new URL("./grade1-2-question-bank.js", import.meta.url));
  const source = readFileSync(filename, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return context.window.gradeOneTwoQuestionBank || { points: [] };
}

function createGeneratedModules(points) {
  const moduleMap = new Map();

  for (const point of points) {
    const gradeTerm = normalizeGradeTerm(point.grade || point.volume);
    const unitNo = Number(point.unitNo) || 99;
    const moduleId = `qb-${slug(gradeTerm)}-u${unitNo}`;
    if (!moduleMap.has(moduleId)) {
      moduleMap.set(moduleId, {
        id: moduleId,
        grade_term: gradeTerm,
        module_name: point.unit || `${gradeTerm} 第${unitNo}单元`,
        textbook_order: unitNo,
        points: [],
      });
    }
    moduleMap.get(moduleId).points.push(createGeneratedPoint(point));
  }

  return Array.from(moduleMap.values()).sort((a, b) => {
    if (a.grade_term !== b.grade_term) return a.grade_term.localeCompare(b.grade_term, "zh-Hans-CN");
    return a.textbook_order - b.textbook_order;
  });
}

function createGeneratedPoint(point) {
  const questions = uniqueQuestions([normalizeQuestion(point.typicalQuestion), ...(point.questions || []).map(normalizeQuestion)].filter(Boolean));
  const primary = questions[0] || normalizeQuestion(point.typicalQuestion) || {};
  const pointId = questionBankLessonAliases[point.id] || normalizeId(point.id || point.title);
  const family = inferFamily(point, primary);
  const steps = createFamilySteps(family, point, primary);
  const atoms = steps.map((step, index) => createAtom(pointId, step, index, steps));

  return {
    id: pointId,
    lesson_ids: unique([point.id, pointId, point.title, point.node, point.lesson].map(normalizeIdOrText)),
    point_name: point.node || point.title || "数学知识点",
    child_title: point.title || point.node || "数学知识点",
    entry_question: toChildPrompt(primary.prompt || point.description || ""),
    atoms,
    assessment_templates: createAssessments(pointId, family, questions, atoms, point),
    remediation_rules: atoms.map((atom, index) => ({
      id: `${atom.id}-repair`,
      error_tag: index === 0 ? ErrorTag.LANGUAGE_MISREAD : ErrorTag.PROCESS_DROP,
      target_atom_id: atom.id,
      strategy: atom.repair_prompt || "把当前小台阶再拆小一点。",
    })),
    feynman_prompt: {
      id: `${pointId}-feynman`,
      child_prompt: `你来当小老师，讲讲「${point.title || point.node}」：先看什么，再怎么做，为什么这样做。`,
      required_signals: createFeynmanSignals(family, point, primary),
    },
    generated_from_question_bank: true,
    source_question_bank_id: point.id,
    teaching_family: family,
  };
}

function createAtom(pointId, step, index, steps) {
  const id = `${pointId}-atom-${index + 1}-${slug(step.label)}`;
  return {
    id,
    atom_name: step.label,
    can_do_statement: step.canDo,
    teach_prompt: step.teach,
    repair_prompt: step.repair,
    no_response_prompt: step.noResponse,
    return_prompt: step.returnPrompt,
    repeat_sentence: step.repeatSentence || "",
    check_keywords: step.keywords,
    assessment_targets: step.keywords,
    common_error_tags: step.errorTags || [ErrorTag.PROCESS_DROP, ErrorTag.EXPRESSION_WEAK],
    dependencies: index === 0 ? [] : [makeDependency(`${pointId}-atom-${index}-${slug(steps[index - 1].label)}`, DependencyStrength.STRONG, "先稳住前一个小台阶。")],
    accepts_final_answer: Boolean(step.acceptsFinal || index >= steps.length - 2),
    is_entry: index === 0,
    teaching_actions: step.actions || [TeachingAction.PROMPT, TeachingAction.MICRO_PRACTICE],
  };
}

function createFamilySteps(family, point, question) {
  const title = point.title || point.node || "这个知识点";
  const prompt = toChildPrompt(question.prompt || point.description || "");
  const answer = cleanAnswer(question.answer || "");
  const explanation = String(question.explanation || "").replace(/。+$/, "");
  const sourceSteps = normalizeList(point.substeps || point.microSteps).filter((step) => !/换个|换一道|当小老师|复述|讲一遍/.test(step));
  const familyText = normalizeText(`${title} ${prompt} ${explanation} ${point.description || ""}`);
  const common = {
    read: makeStep("看清题目", `先看这题：${prompt}。题目让我们求什么？`, ["题目", "求什么", "问什么", "看清"], `我们只先看题。你可以说：题目问什么。`),
    answer: makeStep("说出答案", `这一小步算完后，答案是多少？`, answerKeywords(question), `先别急，先把这一步的答案说出来。${answer ? `可以说：${answer}。` : ""}`, { acceptsFinal: true }),
    reason: makeStep("说清为什么", "把刚才的方法说成一句话：我先看题目，再按小台阶做，因为这样不会漏。", ["因为", "所以", "先", "再", "方法", "不会漏"], "如果说不出来，老师先示范半句：因为……", { isReason: true }),
  };

  const familySteps = {
    money: [
      makeStep("看清元角分", `先看钱的单位。题里有元、角，还是分？`, ["元", "角", "分", "人民币", "单位"], "先不算答案，先找看到的单位。"),
      makeStep("记住换算关系", "先记住：1元=10角，1角=10分。你可以先说出关键数。", ["1元", "10角", "1角", "10分", "十"], "1元能换成10个1角，1角能换成10个1分。"),
      makeStep("先换成同一种单位", "遇到不同单位，先换成同一种单位。现在要先换成什么单位？", ["同一种单位", "换成角", "换成分", "单位不同"], "元和角不能直接拼在一起，先换成同一种单位。"),
      makeStep("再算出结果", "换好单位后，再把剩下的数合起来。答案是多少？", answerKeywords(question), `只看最后一步。${answer ? `这题最后是${answer}。` : ""}`, { acceptsFinal: true }),
      makeStep("说清为什么先换单位", "用一句话说原因：为什么要先换成同一种单位？", ["单位不同", "先换", "同一种单位", "因为"], "元、角、分单位不同，不能直接合起来，先换成同一种单位。", { isReason: true }),
    ],
    compare: [
      makeStep("看清两边", "先看左边是什么，右边是什么。先把两边各是多少说清楚。", ["左边", "右边", "两边", "多少"]),
      makeStep("比较大小", "再比一比，哪边大、哪边小，还是一样大？", ["大", "小", "一样", "相等", "多", "少"]),
      makeStep("填合适符号", "现在填大于号、小于号，还是等号？", answerKeywords(question).concat(["大于", "小于", "等于", ">", "<", "="]), "先看两边，再选符号。", { acceptsFinal: true }),
      makeStep("说清比较方法", "你怎么比较出来的？说一句小方法。", ["一一对应", "数", "比", "大", "小", "高位"], "可以说：我先看两边，再比较大小。", { isReason: true }),
    ],
    count: [
      makeStep("按顺序数", "先说怎么数才不会漏也不会重复。", ["按顺序", "一个一个", "不漏", "不重复", "做记号"]),
      makeStep("说最后一个数", "数到最后一个时，最后说出的数是几？", answerKeywords(question).concat(["最后", "总数"])),
      makeStep("说总数", "所以一共有几个？", answerKeywords(question), "答案要说总数，可以带上单位。", { acceptsFinal: true }),
      makeStep("说清为什么", "为什么最后一个数就是总数？", ["最后一个数", "总数", "一共", "数完"], "可以说：按顺序数完，最后一个数就是总数。", { isReason: true }),
    ],
    composition: [
      makeStep("看总数", "先看总数是多少。", extractNumbers(question.prompt).map(String).concat(["总数"])),
      makeStep("看已知部分", "再看已经知道的一部分是多少。", ["一部分", "已知", "已经有"]),
      makeStep("找另一部分", "另一部分是几？", answerKeywords(question), "可以用合起来检查。", { acceptsFinal: true }),
      makeStep("合起来检查", "为什么这样分是对的？", ["合起来", "加起来", "总数不变", "检查"], "可以说：两部分合起来还是总数。", { isReason: true }),
    ],
    ordinal: [
      makeStep("先定方向", "先说从左边开始数，还是从右边开始数。", ["从左", "从右", "左边", "右边", "方向"]),
      makeStep("找到第几个", "再找题目说的第几个。第几个说的是位置。", ["第几个", "位置", "第", ...extractNumbers(question.prompt).map(String)]),
      makeStep("只数问的那一边", "如果题目问前面或后面，就只数那一边。答案是几？", answerKeywords(question), "先别数全部，只数题目问的那一边。", { acceptsFinal: true }),
      makeStep("说清第几个和几个", "为什么第几个不是一共有几个？", ["第几个", "位置", "一共有", "前面", "后面"], "可以说：第几个说的是位置，不是总数。", { isReason: true }),
    ],
    pattern: [
      makeStep("看相邻两个", "先看前后两个数或图形是怎么变的。", ["相邻", "前后", "规律", "变化"]),
      makeStep("说出每次怎么变", "每次是多了、少了，还是按同样图形重复？", ["每次", "多", "少", "加", "减", "重复", "同样"]),
      makeStep("按规律补下一个", "按同样规律，下一个应该填什么？", answerKeywords(question), "先照同样规律接着填。", { acceptsFinal: true }),
      makeStep("说清规律", "你发现的规律是什么？", ["规律", "每次", "接着", "多", "少", "重复"], "可以说：我先看怎么变，再按同样规律填。", { isReason: true }),
    ],
    calculation: [
      makeStep("看运算符号", "先看这题是加、减、乘，还是除。", ["加", "减", "乘", "除", "+", "-", "×", "÷"]),
      makeStep("只算一步", "只做当前这一步，先算什么？", ["先算", "第一步", "口算", "口诀"]),
      makeStep("说出结果", "算完结果是多少？", answerKeywords(question), "先把这一步算出来的结果说出来。", { acceptsFinal: true }),
      makeStep("说清怎么算", "你是怎么算出来的？", ["先", "再", "凑十", "口诀", "合起来", "去掉"], "可以说：我先看符号，再算结果。", { isReason: true }),
    ],
    application: [
      makeStep("看问题问什么", "先看最后问的是什么，是一共、还剩、找回，还是每份？", ["一共", "还剩", "找回", "每份", "问什么"]),
      makeStep("找有用条件", "再找题里给了哪两个有用的数。", extractNumbers(question.prompt).map(String).concat(["条件", "两个数"])),
      makeStep("选方法", "根据问题，应该用加、减、乘，还是除？", ["加", "减", "乘", "除", "加法", "减法", "乘法", "除法"]),
      makeStep("算出答案", "最后答案是多少？", answerKeywords(question), "先按选好的方法算。", { acceptsFinal: true }),
      makeStep("说清原因", "为什么用这个方法？说一句原因。", ["因为", "所以", "一共", "还剩", "找回", "平均", "同样多"], "可以说：因为题目问……所以用……", { isReason: true }),
    ],
    multiplication: [
      makeStep("看每份几个", "先看每组同样多吗？每组有几个？", ["每组", "每份", "同样多", "几个"]),
      makeStep("看有几组", "再数一共有几组。", ["几组", "几个", "行", "列"]),
      makeStep("说几个几", "合起来说，这是几个几？", ["几个几", "组", "每组"]),
      makeStep("列式或结果", "可以列乘法式，也可以说总数。", answerKeywords(question).concat(["×", "乘", "口诀"]), "几个几可以用乘法表示。", { acceptsFinal: true }),
      makeStep("说清乘法意思", "为什么能用乘法？", ["同样多", "几个几", "每组", "一共", "乘法"], "可以说：每组同样多，所以用乘法。", { isReason: true }),
    ],
    division: [
      makeStep("看是不是平均分", "先看是不是平均分，每份要一样多吗？", ["平均分", "每份", "一样多", "同样多"]),
      makeStep("看总数和份数", "再看一共有多少，要分成几份，或每份几个。", extractNumbers(question.prompt).map(String).concat(["总数", "份数", "每份"])),
      makeStep("说出每份或份数", "平均分以后，答案是多少？", answerKeywords(question), "平均分题要看每份或份数。", { acceptsFinal: true }),
      makeStep("说清除法意思", "为什么能用除法？", ["平均分", "每份", "份数", "除法", "同样多"], "可以说：因为是平均分，所以用除法。", { isReason: true }),
    ],
    time: [
      makeStep("先看时针", "先看短短的时针，它指向几？", ["时针", "短针", "几时"]),
      makeStep("再看分针", "再看长长的分针，它指向哪里？", ["分针", "长针", "12", "6", "几分"]),
      makeStep("合起来说时间", "合起来是几时几分？", answerKeywords(question), "先时针，再分针。", { acceptsFinal: true }),
      makeStep("说清看钟方法", "看钟面时为什么先看时针再看分针？", ["时针", "分针", "先", "再"], "可以说：先看时针定几时，再看分针定几分。", { isReason: true }),
    ],
    measure: [
      makeStep("先看单位", "先看题里用的是什么单位。", ["厘米", "米", "克", "千克", "单位"]),
      makeStep("联系生活或刻度", "再想它是长短、轻重，还是角的大小。", ["长", "短", "轻", "重", "刻度", "角"]),
      makeStep("带单位回答", "答案是多少？记得带单位。", answerKeywords(question).concat(["厘米", "米", "克", "千克"]), "数字后面要带单位，答案才完整。", { acceptsFinal: true }),
      makeStep("说清为什么", "为什么选这个单位或这样量？", ["因为", "单位", "生活", "刻度", "轻", "重"], "可以说：因为这个物体……所以用……", { isReason: true }),
    ],
    placeValue: [
      makeStep("先看数位", "先从高位看起，看到哪些数位？", ["个位", "十位", "百位", "千位", "高位"]),
      makeStep("按数位读写或拆", "每个数位上分别是几？", answerKeywords(question).concat(["读作", "写作", "几个十", "几个百"])),
      makeStep("检查0的位置", "如果中间有0，要不要读出来或写出来？", ["0", "零", "中间", "末尾"]),
      makeStep("说出答案", "现在把答案完整说出来。", answerKeywords(question), "按数位说完整。", { acceptsFinal: true }),
      makeStep("说清位值", "为什么要按数位看？", ["数位", "个位", "十位", "百位", "千位", "0", "零"], "可以说：同一个数字在不同数位表示不同大小。", { isReason: true }),
    ],
    shape: [
      makeStep("看图形特征", "先说它最明显的样子。", ["平", "方", "圆", "滚", "面", "边", "角", "对称"]),
      makeStep("说出名称或判断", "根据这个特征，答案是什么？", answerKeywords(question).concat(["长方体", "正方体", "圆柱", "球", "长方形", "正方形", "三角形", "圆", "对", "错"]), "先看特征再判断。", { acceptsFinal: true }),
      makeStep("说清一个理由", "你为什么这样认？说一个明显特征。", ["因为", "特征", "面", "边", "角", "会滚", "对称"], "可以说：因为它有……", { isReason: true }),
    ],
    data: [
      makeStep("看分类或表头", "先看按什么分，或表里每一行表示什么。", ["分类", "表", "记录", "一行", "一列"]),
      makeStep("读出数量", "从表里读出来，答案是多少？", answerKeywords(question), "先找到对应那一行或那一列。", { acceptsFinal: true }),
      makeStep("说清从哪里看出", "你是从哪里看出这个答案的？", ["表", "记录", "最多", "最少", "合计", "一行", "一列"], "可以说：我从……这一行看出来。", { isReason: true }),
    ],
    logic: [
      makeStep("记住条件", "先说题目已经告诉了我们哪一个条件。", ["条件", "已知", "告诉", "不是", "是"]),
      makeStep("排除不可能", "把不可能的先排除掉。", ["排除", "不可能", "不是", "划掉"]),
      makeStep("说剩下答案", "剩下谁或哪一种可能？", answerKeywords(question), "先排除，再看剩下。", { acceptsFinal: true }),
      makeStep("说清理由", "你为什么这样判断？", ["因为", "所以", "排除", "不是", "剩下"], "可以说：因为……不是……所以剩下……", { isReason: true }),
    ],
  };

  if (family === "measure" && /角的|角大小|几个角|直角|锐角|钝角|顶点|两条边/.test(familyText)) {
    return [
      makeStep("找顶点", "先找角尖尖的顶点在哪里。", ["顶点", "尖尖的点"]),
      makeStep("找两条边", "再找从顶点伸出去的两条边。", ["两条边", "边", "张开"]),
      makeStep("判断角", "根据顶点和两条边，答案是什么？", answerKeywords(question).concat(["角", "直角", "锐角", "钝角"]), "先看清顶点和两条边。", { acceptsFinal: true }),
      makeStep("说清角的特征", "为什么这样判断？说一个角的特征。", ["顶点", "两条边", "张开", "因为"], "可以说：角有一个顶点和两条边。", { isReason: true }),
    ];
  }

  const selected = familySteps[family] || [
    common.read,
    makeStep(sourceSteps[0] || "只做当前小台阶", `我们只做一步：${sourceSteps[0] || "先看题目" }。你先说一个词也可以。`, ["先", "再", "一步"]),
    common.answer,
    common.reason,
  ];

  return selected.map((step, index) => ({
    ...step,
    canDo: step.canDo || `孩子能完成「${title}」的第${index + 1}个小台阶：${step.label}。`,
    teach: step.teach || `我们学「${title}」。${step.prompt || ""}`,
    noResponse: step.noResponse || `没关系。老师先示范：${step.repeatSentence || step.prompt || step.label}。你先说一个关键词也可以。`,
    repair: step.repair || `我们把「${step.label}」再拆小一点。${step.prompt || ""}`,
  }));
}

function makeStep(label, teach, keywords = [], repair = "", options = {}) {
  const repeatSentence = options.isReason ? options.repeatSentence || teach.replace(/^老师先说一句，你跟着说一遍：?/, "").replace(/^把刚才的方法说成一句话：?/, "") : options.repeatSentence || "";
  return {
    label,
    teach,
    repair,
    noResponse: options.noResponse || `没关系。先听老师说：${repeatSentence || teach}`,
    returnPrompt: options.returnPrompt || `我们先回到这一小步：${label}。`,
    repeatSentence,
    keywords: unique([label, ...keywords].map(String)),
    acceptsFinal: Boolean(options.acceptsFinal),
    errorTags: options.errorTags || [ErrorTag.PROCESS_DROP, ErrorTag.CALCULATION_SLIP, ErrorTag.EXPRESSION_WEAK],
    actions: options.actions,
  };
}

function createAssessments(pointId, family, questions, atoms, point) {
  const usable = questions.length ? questions : [normalizeQuestion(point.typicalQuestion)].filter(Boolean);
  const templates = usable.slice(0, 4).map((question, index) => {
    const dimension = index === 0 ? direct : variant;
    return makeQuestionTemplate(pointId, question, dimension, atoms, index + 1);
  });
  const reasonAtom = atoms.find((atom) => /为什么|原因|说清/.test(atom.atom_name)) || atoms.at(-1);
  templates.push({
    id: `${pointId}-reason-1`,
    dimension: reasoning,
    prompt: reasonPromptForFamily(family, point),
    expected_keywords: createFeynmanSignals(family, point, usable[0]).concat(["因为", "所以", "先", "再"]),
    expected: {},
    primary_atom_id: reasonAtom?.id || atoms.at(-1)?.id,
    secondary_atom_ids: atoms.map((atom) => atom.id).filter((id) => id !== reasonAtom?.id),
  });
  return templates;
}

function makeQuestionTemplate(pointId, question, dimension, atoms, index) {
  const solveAtom = atoms.find((atom) => atom.accepts_final_answer) || atoms.at(-2) || atoms.at(-1);
  return {
    id: `${pointId}-q${index}`,
    dimension,
    prompt: toChildPrompt(question.prompt),
    expected_keywords: answerKeywords(question),
    expected: inferExpected(question),
    primary_atom_id: solveAtom?.id,
    secondary_atom_ids: atoms.map((atom) => atom.id).filter((id) => id !== solveAtom?.id),
  };
}

function inferExpected(question) {
  const prompt = normalizeText(question.prompt);
  const answer = normalizeText(question.answer);
  const numbers = extractNumbers(question.answer);
  if (/元|角|分/.test(`${prompt}${answer}`)) {
    const money = parseMoneyAnswer(question.answer);
    if (money.totalJiao) return { kind: "money_jiao", totalJiao: money.totalJiao };
    if (Number.isFinite(money.yuan) && Number.isFinite(money.jiao)) return { kind: "money_decompose", yuan: money.yuan, jiao: money.jiao, totalJiao: money.yuan * 10 + money.jiao };
    if (Number.isFinite(money.yuan)) return { kind: "money_yuan", yuan: money.yuan };
  }
  if (numbers.length === 1) return { kind: "number", value: numbers[0] };
  return {};
}

function parseMoneyAnswer(answer) {
  const text = normalizeText(answer);
  const yuan = Number((text.match(/(\d+)元/) || [])[1]);
  const jiao = Number((text.match(/(\d+)角/) || [])[1]);
  const totalJiao = text.includes("角") && !text.includes("元") && Number.isFinite(jiao) ? jiao : 0;
  return { yuan, jiao, totalJiao };
}

function reasonPromptForFamily(family, point) {
  const title = point.title || point.node || "这题";
  const prompts = {
    money: "为什么遇到元、角、分时，要先换成同一种单位？",
    compare: "你是怎么比较大小的？",
    count: "为什么按顺序数能知道总数？",
    composition: "为什么两部分合起来要等于总数？",
    ordinal: "做第几个这类题时，为什么要先看从哪边数？",
    pattern: "找规律时，你先看什么，再怎么接着填？",
    multiplication: "为什么同样多的几组可以用乘法？",
    division: "为什么平均分可以用除法？",
    application: "为什么这道题要用你选的方法？",
    time: "看钟面时，你先看什么，再看什么？",
    measure: "为什么要带单位回答？",
    placeValue: "为什么要按数位来读、写或拆数？",
    logic: "你是怎么一步一步排除的？",
  };
  return prompts[family] || `你怎么做「${title}」这类题？说一句方法。`;
}

function createFeynmanSignals(family, point, question) {
  const title = point.title || point.node || "";
  const base = {
    money: ["单位不同", "先换成同一种单位", "1元等于10角", "带单位"],
    compare: ["先看两边", "比较大小", "填符号", "大于小于等于"],
    count: ["按顺序数", "不漏不重复", "最后一个数", "总数"],
    composition: ["先看总数", "看已知部分", "找另一部分", "合起来检查"],
    ordinal: ["先看方向", "第几个是位置", "前面后面", "不是总数"],
    pattern: ["相邻两个", "每次怎么变", "同样规律", "接着填"],
    calculation: ["看运算符号", "先算一步", "说结果", "检查"],
    application: ["看问题", "找条件", "选方法", "算结果"],
    multiplication: ["同样多", "每组几个", "有几组", "几个几"],
    division: ["平均分", "总数", "份数", "每份"],
    time: ["时针", "分针", "几时", "几分"],
    measure: ["单位", "估计", "带单位", "生活"],
    placeValue: ["数位", "高位", "0", "位值"],
    shape: ["特征", "面", "边", "角"],
    data: ["看表", "分类", "数量", "从哪里看出"],
    logic: ["条件", "排除", "剩下", "因为"],
  }[family] || ["先看题目", "只做一步", "说答案", "说原因"];
  return unique([...base, ...normalizeList(point.masterySignals).slice(0, 2), ...answerKeywords(question).slice(0, 2), title]);
}

function inferFamily(point, question) {
  const text = normalizeText(`${point.title} ${point.node} ${point.lesson} ${point.description} ${question?.type} ${question?.prompt} ${question?.explanation}`);
  const visualType = point.visualType || "";
  if (/钟|时间|时针|分针|几时/.test(text)) return "time";
  if (/厘米|米|克|千克|质量|长度|角的/.test(text) || ["ruler", "mass", "angle"].includes(visualType)) return "measure";
  if (/图形|长方体|正方体|圆柱|球|长方形|正方形|三角形|圆|对称|平移|旋转/.test(text)) return "shape";
  if (/分类|统计|读表|记录表|表格|最多|最少/.test(text)) return "data";
  if (/推理|排除|不是|可能|一定/.test(text)) return "logic";
  if (isMoneyText(text)) return "money";
  if (/除法|平均分|每份/.test(text) || visualType === "sharing") return "division";
  if (/乘法|几个几|同样多|口诀/.test(text) || visualType === "array") return "multiplication";
  if (/比较|大小|大于|小于|等于|符号/.test(text) || visualType === "compare") return "compare";
  if (/数一数|一共有几个|总数/.test(text) || visualType === "count") return "count";
  if (/分成|组成/.test(text)) return "composition";
  if (/第几个|第\d+|从左|从右|前面|后面/.test(text)) return "ordinal";
  if (/规律|接着/.test(text)) return "pattern";
  if (/数位|读作|写作|个千|个百|个十|个位|十位|百位|千位/.test(text)) return "placeValue";
  if (/应用题|一共|还剩|用去|飞走|又得到|买/.test(text)) return "application";
  if (/计算|加法|减法|口算|连加|连减|[+\-＋－×÷]/.test(text)) return "calculation";
  return "generic";
}

function isMoneyText(text) {
  return (
    /人民币|钱|购物|找零|找回|付了|应找|价格|买|卖|元/.test(text) ||
    /\d+角/.test(text) ||
    /\d+分(?!成|类|钟|钟表|针|析|清|别|组|份)/.test(text)
  );
}

function mergePilotAndGenerated(pilotModules, generatedModules) {
  const pilotLessonIds = new Set();
  for (const module of pilotModules) {
    for (const point of module.points || []) {
      pilotLessonIds.add(point.id);
      for (const lessonId of point.lesson_ids || []) pilotLessonIds.add(lessonId);
    }
  }

  const filteredGenerated = generatedModules
    .map((module) => ({
      ...module,
      points: (module.points || []).filter((point) => !pilotLessonIds.has(point.id) && !(point.lesson_ids || []).some((lessonId) => pilotLessonIds.has(lessonId))),
    }))
    .filter((module) => module.points.length);

  return [...pilotModules, ...filteredGenerated];
}

function normalizeQuestion(question) {
  if (!question || typeof question !== "object") return null;
  const prompt = String(question.prompt || "").trim();
  if (!prompt) return null;
  return {
    id: String(question.id || prompt).trim(),
    type: question.type || "",
    prompt,
    answer: String(question.answer || "").trim(),
    explanation: String(question.explanation || "").trim(),
    answerKeywords: normalizeList(question.answerKeywords, [question.answer]),
  };
}

function answerKeywords(question) {
  return unique([
    ...(question?.answerKeywords || []),
    cleanAnswer(question?.answer || ""),
    ...extractNumbers(question?.answer || "").flatMap((number) => [String(number), numberToChinese(number)]),
  ].map(String).filter(Boolean));
}

function toChildPrompt(prompt) {
  const text = String(prompt || "").trim().replace(/。+$/, "");
  if (!text) return "";
  return text
    .replace(/^填空[:：]\s*/, "")
    .replace(/_{2,}/g, "多少")
    .replace(/____/g, "多少") + (/[？?]$/.test(text) ? "" : "？");
}

function cleanAnswer(answer) {
  return String(answer || "").trim().replace(/[，,、]\s*/g, "，");
}

function normalizeList(items, fallback = []) {
  const source = Array.isArray(items) ? items : fallback;
  return unique(source.map((item) => String(item || "").trim()).filter(Boolean));
}

function uniqueQuestions(questions) {
  const seen = new Set();
  return questions.filter((question) => {
    const key = question.id || question.prompt;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeGradeTerm(value) {
  const text = String(value || "");
  if (text.includes("一年级下")) return "一年级下";
  if (text.includes("二年级上")) return "二年级上";
  if (text.includes("二年级下")) return "二年级下";
  return "一年级上";
}

function normalizeId(value) {
  return slug(String(value || "knowledge-point").toLowerCase());
}

function normalizeIdOrText(value) {
  const text = String(value || "").trim();
  return /^[a-z0-9_-]+$/i.test(text) ? text : normalizeId(text);
}

function slug(value) {
  const text = String(value || "")
    .toLowerCase()
    .replace(/一年级/g, "g1")
    .replace(/二年级/g, "g2")
    .replace(/上/g, "a")
    .replace(/下/g, "b")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return text || "item";
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/两/g, "二");
}

function extractNumbers(text) {
  return Array.from(String(text || "").matchAll(/\d+/g)).map((match) => Number(match[0])).filter(Number.isFinite);
}

function numberToChinese(value) {
  const number = Number(value);
  const map = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (!Number.isFinite(number) || number < 0 || number > 99) return String(value);
  if (number <= 10) return map[number];
  if (number < 20) return `十${map[number - 10]}`;
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  return `${map[tens]}十${ones ? map[ones] : ""}`;
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}
