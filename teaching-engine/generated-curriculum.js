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

const modelPromptOpeners = [
  "老师先把图和题连起来",
  "我们先看清这一小步",
  "先不急着猜答案",
  "这一步先听老师示范",
];

const childTryClosers = [
  "你再用自己的话接一句。",
  "请先说图里正在看的那个数。",
  "说不完整也没关系，先跟着老师说这一句。",
  "这一轮只回答图里正在看哪一部分。",
];

const askRepairs = [
  "先把整题放一边，只看眼前这一步。",
  "把眼睛放回题目里，先说你看到的一个数或一个词。",
  "先别猜答案，先说当前这一步在问什么。",
  "老师把问题缩小一点，请只回答眼前这一问。",
];

const noResponseHints = [
  "没关系，我们先把问题变小。",
  "先不急着答完整。",
  "老师先把图和题目再连起来。",
  "这一步卡住很正常，老师先示范一句。",
];

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
      makeStep("再算出结果", "换好单位后，再把剩下的数合起来。答案是多少？", answerKeywords(question), "只看最后一步，把答案说出来，记得带单位。", { acceptsFinal: true }),
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

  const selected = createTeacherLikeFamilySteps(family, { point, question, prompt, answer, explanation, sourceSteps, common, familyText }) || familySteps[family] || [
    common.read,
    makeStep(sourceSteps[0] || "只做当前小台阶", `我们只做一步：${sourceSteps[0] || "先看题目" }。如果不会，先跟着老师说这一小句。`, ["先", "再", "一步"]),
    common.answer,
    common.reason,
  ];

  return selected.map((step, index) => ({
    ...step,
    canDo: step.canDo || `孩子能完成「${title}」的第${index + 1}个小台阶：${step.label}。`,
    teach: step.teach || `我们学「${title}」。${step.prompt || ""}`,
    noResponse: step.noResponse || makeNoResponsePrompt(step, title),
    repair: step.repair || makeRepairPrompt(step, title),
  }));
}

function createTeacherLikeFamilySteps(family, context) {
  const { point, question, prompt, answer, sourceSteps, familyText } = context;
  const answerWords = answerKeywords(question);
  const numbers = extractNumbers(prompt).map(String);
  const title = point.title || point.node || "这个知识点";
  const finalStep = (label = "说出结果", teach = "这一轮只算当前这一步，结果是多少？", extra = []) =>
    teacherAskStep(label, ensureChildAnswerTarget(teach), answerWords.concat(extra), {
      acceptsFinal: true,
      repair: makeFinalRepairPrompt(label, teach),
      noResponse: makeFinalNoResponsePrompt(label, teach),
    });
  const reasonStep = (label, repeat, extra = []) =>
    teacherModelStep(label, "会算以后，还要能说出为什么。我们把理由说短一点。", repeat, ["因为", "所以", "先", "再", ...extra], { isReason: true });

  if (family === "calculation") return createCalculationTeacherSteps(context, finalStep, reasonStep);
  if (family === "compare") return createCompareTeacherSteps(context, finalStep, reasonStep);
  if (family === "placeValue") return createPlaceValueTeacherSteps(context, finalStep, reasonStep);
  if (family === "mixedCalculation") return createMixedCalculationTeacherSteps(context, finalStep, reasonStep);
  if (family === "shape") return createShapeTeacherSteps(context, finalStep, reasonStep);
  if (family === "data") return createDataTeacherSteps(context, finalStep, reasonStep);
  if (family === "measure") return createMeasureTeacherSteps(question, familyText, finalStep, reasonStep);
  if (family === "angle") return createMeasureTeacherSteps(question, familyText, finalStep, reasonStep);

  const families = {
    money: [
      teacherModelStep("认清元角分", "钱的题先不急着算，要先看单位。元、角、分不是同一种单位。", "先看单位", ["元", "角", "分", "单位", "人民币"]),
      teacherModelStep("记单位关系", "最常用的关系是：1元可以换成10角，1角可以换成10分。", "1元等于10角，1角等于10分", ["1元", "10角", "1角", "10分", "十"]),
      teacherModelStep("换成同一种单位", "如果题里有元又有角，就先把元换成角；有角又有分，就先把角换成分。", "先换成同一种单位", ["同一种单位", "换成角", "换成分", "单位不同"]),
      finalStep("算当前结果", "现在单位一样了，只算当前这一步，答案是多少？", ["带单位", "结果"]),
      reasonStep("说清为什么先换单位", "因为单位不同，不能直接算，要先换成同一种单位。", ["单位不同", "换单位", "同一种单位"]),
    ],
    moneyApplication: [
      teacherModelStep("看购物关系", "购物题先看三件事：商品多少钱、付了多少钱、问一共还是找回。", "先看价格和付的钱", ["价格", "付了", "找回", "一共", "购物"]),
      teacherModelStep("先统一单位", "如果钱里有元也有角，先统一成角，再做加减。", "先把元换成角", ["元", "角", "同一种单位", "换成角"]),
      teacherModelStep("看故事动作", "买东西找回，意思是从付的钱里拿走商品的钱。", "找回用付的钱减价钱", ["找回", "付的钱", "价钱", "减", "剩下"]),
      finalStep("算出找回或总钱数", "这一轮只算这个小结果：应该是多少？", ["找回", "一共", "带单位"]),
      reasonStep("说清购物方法", "因为找回是付的钱里剩下的部分，所以用付的钱减价钱。", ["找回", "付的钱", "价钱", "剩下"]),
    ],
    compare: [
      teacherModelStep("看清两边", "比较题先不填符号，先分别看左边和右边。", "先看左边，再看右边", ["左边", "右边", "两边"]),
      teacherModelStep("找比较方法", "小数可以数一数；图形可以一一配对；大数先看高位。", "用数数或配对比较", ["数数", "一一对应", "配对", "高位", "比较"]),
      teacherAskStep("说哪边大", "先说判断：哪边大、哪边小，还是一样大？", ["左边大", "右边大", "一样大", "相等", "大", "小"]),
      finalStep("填比较符号", "最后再填大于号、小于号或等号。该填什么？", [">", "<", "=", "大于", "小于", "等于"]),
      reasonStep("说清比较方法", "我先看两边，再用数数或配对比较，所以能选出符号。", ["比较", "符号", "两边"]),
    ],
    count: [
      teacherModelStep("确定怎么数", "数图形时先定一个顺序，可以从左到右，也可以从上到下。", "按顺序数", ["按顺序", "从左到右", "从上到下"]),
      teacherModelStep("防止漏和重", "每数一个就在心里做个小记号，这样不漏也不重复。", "数过的做记号", ["做记号", "不漏", "不重复"]),
      teacherAskStep("说最后一个数", "数到最后一个时，最后说出的数是几？", answerWords.concat(["最后", "总数"])),
      finalStep("说一共有多少", "最后一个数就是总数，所以一共有多少？", ["一共", "总数"]),
      reasonStep("说清数数方法", "因为按顺序数完，最后一个数就是一共有多少。", ["按顺序", "最后一个数", "总数"]),
    ],
    composition: [
      teacherModelStep("先看总数", "分与合的题先找总数，总数就像一个大盒子。", "先看总数", ["总数", "合起来", ...numbers]),
      teacherModelStep("看已知部分", "再看已经放进去的一部分是多少。", "再看已知的一部分", ["已知", "一部分", ...numbers]),
      finalStep("找另一部分", "另一部分是多少？可以想：几和已知部分合起来等于总数。", ["另一部分", "合起来"]),
      reasonStep("合起来检查", "因为两部分合起来，必须还是原来的总数。", ["两部分", "合起来", "总数不变"]),
    ],
    ordinal: [
      teacherModelStep("先定方向", "第几个这类题最怕方向反了，所以先看从哪边数。", "先看从哪边数", ["从左", "从右", "方向"]),
      teacherModelStep("分清第几个和几个", "第几个说的是位置，一共有几个说的是总数。", "第几个是位置", ["第几个", "位置", "总数"]),
      finalStep("只数题目问的部分", "如果问前面或后面，就只数那一边。答案是多少？", ["前面", "后面", "位置"]),
      reasonStep("说清位置方法", "因为第几个表示位置，所以要先看方向，再数到指定位置。", ["方向", "位置", "第几个"]),
    ],
    pattern: [
      teacherModelStep("看前后变化", "找规律先看相邻两个，不要只盯最后一个。", "先看相邻两个", ["相邻", "前后", "变化"]),
      teacherAskStep("说每次怎么变", "每次是多了、少了，还是图形重复？先说变化。", ["多", "少", "加", "减", "重复", "每次"]),
      finalStep("按同样规律补", "照同样的变化接着填，下一个是什么？", ["接着", "下一个", "规律"]),
      reasonStep("说清规律", "我先看相邻两个怎么变，再照同样规律接着填。", ["相邻", "同样规律", "接着填"]),
    ],
    concreteAddition: [
      teacherModelStep("看合起来", "加法通常表示两部分合起来。", "加法是合起来", ["合起来", "一共", "加法"]),
      teacherModelStep("看两部分", "先看第一部分，再看又来或另一部分。", "先看两部分", ["第一部分", "另一部分", ...numbers]),
      finalStep("算一共", "把两部分合起来，一共是多少？", ["一共", "合起来"]),
      reasonStep("说清加法意思", "因为题目是把两部分合起来，所以用加法。", ["加法", "合起来", "一共"]),
    ],
    concreteSubtraction: [
      teacherModelStep("看去掉或剩下", "减法常常表示拿走、去掉、用去以后还剩。", "减法是去掉后剩下", ["拿走", "去掉", "还剩", "减法"]),
      teacherModelStep("看原来和拿走", "先看原来有多少，再看拿走或少了多少。", "先看原来，再看拿走", ["原来", "拿走", "少了", ...numbers]),
      finalStep("算还剩", "从原来的里面去掉拿走的，还剩多少？", ["还剩", "剩下"]),
      reasonStep("说清减法意思", "因为题目是去掉后求剩下，所以用减法。", ["减法", "去掉", "剩下"]),
    ],
    makeTenAdd: [
      teacherModelStep("找快到10的数", "凑十法不是硬算，先看哪个数离10最近。", "先找快到10的数", ["凑十", "快到10", "差几"]),
      teacherAskStep("说还差几", "它还差几就到10？只说这个数。", ["还差", "到10", "差几", "1", "2", "3", "4"]),
      teacherModelStep("拆另一个数", "把另一个数拆成两块：一块拿去凑10，一块留着。", "先凑成10，再加剩下的", ["拆", "凑成10", "剩下"]),
      finalStep("算出结果", "10加剩下的数，结果是多少？", ["10", "剩下", "结果"]),
      reasonStep("说清凑十法", "因为10好算，所以先凑成10，再加剩下的数。", ["凑十", "10好算", "剩下"]),
    ],
    breakTenSubtract: [
      teacherModelStep("看个位够不够", "十几减几时，如果个位不够减，就向10借一步。", "个位不够减就破十", ["个位", "不够减", "破十"]),
      teacherModelStep("拆成10和几", "把十几拆成10和几，先用10去减。", "先把十几拆成10和几", ["拆成10", "十几", "10"]),
      teacherModelStep("减完加回来", "10减完以后，别忘了把原来个位上的几加回来。", "减完再加个位", ["加回来", "个位", "剩下"]),
      finalStep("算出结果", "按破十法走完：先用10去减，再加回个位上的数。最后结果是多少？", ["结果", "破十", "加回"]),
      reasonStep("说清破十法", "因为个位不够减，所以先破十，再把个位加回来。", ["破十", "个位不够", "加回来"]),
    ],
    mixedCalculation: [
      teacherModelStep("看有几步", "连加连减和混合题，不要跳着算，先看有几步。", "先看有几步", ["几步", "连加", "连减", "混合"]),
      teacherModelStep("从左往右", "一年级常见连算，先从左往右做第一步。", "先算第一步", ["从左往右", "第一步", "中间结果"]),
      teacherAskStep("记中间结果", "第一步算完，中间结果是多少？", ["中间结果", "第一步", ...numbers]),
      finalStep("再算下一步", "带着中间结果再算下一步，最后是多少？", ["最后", "结果"]),
      reasonStep("说清顺序", "因为有好几步，所以要先算第一步，记住中间结果，再算下一步。", ["先", "再", "中间结果"]),
    ],
    application: [
      teacherModelStep("先看问题", "解决问题先不乱算，先看最后问什么。", "先看问题问什么", ["问什么", "问题", "求什么"]),
      teacherModelStep("找故事动作", "再看故事动作：合起来、拿走、相差、同样多，动作决定方法。", "先说故事动作", ["合起来", "拿走", "相差", "同样多", "故事"]),
      teacherAskStep("说关系句", "把故事说成一句关系：是合起来，还是去掉后剩下？", ["合起来", "去掉", "剩下", "相差", "几个几", "平均分"]),
      finalStep("算并带单位", "关系说清后再算，答案是多少？别忘了带单位。", ["单位", "答案"]),
      reasonStep("说清为什么这样算", "因为我先看问题，再看故事动作，所以知道用什么方法。", ["问题", "故事动作", "方法"]),
    ],
    comparisonDifference: [
      teacherModelStep("先看谁多谁少", "求多多少或少多少，先找谁多、谁少。", "先看谁多谁少", ["多", "少", "相差"]),
      teacherModelStep("用大数减小数", "求相差多少，就是把多出来的一段找出来。", "用大数减小数", ["大数", "小数", "减"]),
      finalStep("算出相差", "这一轮只算相差多少，答案是多少？", ["相差", "多多少", "少多少"]),
      reasonStep("说清相差方法", "因为求的是两边差多少，所以用大数减小数。", ["相差", "大数减小数"]),
    ],
    arrangement: [
      teacherModelStep("固定一种", "搭配题不能乱数，要先固定一种选择。", "先固定一种", ["固定", "搭配", "排列"]),
      teacherModelStep("依次搭配", "固定一种后，再把另一类一个一个配完。", "再依次搭配", ["依次", "一个一个", "不漏"]),
      finalStep("数出总种数", "全部配完后，一共有多少种？", ["种", "总数", "搭配"]),
      reasonStep("说清不重不漏", "因为按顺序固定再搭配，所以不容易重复也不容易漏。", ["顺序", "不重", "不漏"]),
    ],
    observation: [
      teacherModelStep("先站位置", "观察物体先想自己站在哪里：正面、侧面还是上面。", "先看从哪里观察", ["正面", "侧面", "上面", "观察"]),
      teacherModelStep("看关键特征", "再看能看到哪些关键特征，比如门、窗、面或边。", "再看关键特征", ["特征", "面", "边", "看到"]),
      finalStep("选看到的图", "根据位置和特征，应该选哪一幅图？", ["正面", "侧面", "上面", "图"]),
      reasonStep("说清观察理由", "因为站的位置不同，看到的面和特征也不同。", ["位置", "看到", "特征"]),
    ],
    timeDuration: [
      teacherModelStep("找开始和结束", "经过时间先找开始时间和结束时间。", "先找开始和结束", ["开始", "结束", "经过"]),
      teacherModelStep("看中间走了多久", "从开始走到结束，中间经过了多少时间。", "再看经过多久", ["经过", "多久", "小时", "分"]),
      finalStep("说经过时间", "从开始时间数到结束时间，数到的这一段就是经过时间。现在经过了多久？", ["经过", "小时", "分钟"]),
      reasonStep("说清经过时间方法", "因为经过时间看的是开始到结束中间走了多久。", ["开始", "结束", "经过"]),
    ],
    remainderDivision: [
      teacherModelStep("先尽量分满", "有余数的除法先尽量平均分满。", "先尽量分满", ["余数", "平均分", "分满"]),
      teacherModelStep("看还剩几个", "分满以后，剩下不够再分一份的，就是余数。", "剩下的是余数", ["剩下", "余数"]),
      finalStep("说商和余数", "现在说商是多少，余数是多少。", ["商", "余数"]),
      reasonStep("检查余数", "余数必须比除数小，才说明已经尽量分满。", ["余数", "除数", "小"]),
    ],
    remainderApplication: [
      teacherModelStep("先算商和余数", "余数应用题先算能分满几份，还剩几个。", "先算商和余数", ["商", "余数", "剩下"]),
      teacherModelStep("回到生活判断", "再回到生活里看：剩下的要不要再占一份。", "看剩下的要不要再加一份", ["生活", "加一份", "至少", "最多"]),
      finalStep("说实际答案", "根据生活意思，最后答案是多少？", ["至少", "最多", "加一", "去尾"]),
      reasonStep("说清进一或去尾", "因为剩下的在生活里有时还要一份，有时不能算一整份。", ["进一", "去尾", "生活"]),
    ],
    multiplication: [
      teacherModelStep("看同样多", "乘法不是随便用，先看每组是不是同样多。", "每组同样多才能用乘法", ["同样多", "每组", "乘法"]),
      teacherAskStep("说每组几个", "每组有几个？先只说每组的个数。", ["每组", "每份", "几个", ...numbers]),
      teacherAskStep("说有几组", "这样的同样多的小组一共有几组？可以数行，也可以数列。", ["几组", "组数", "行", "列", ...numbers]),
      teacherAskStep("说几个几", "合起来说，这是几个几？", ["几个几", "组", "每组"]),
      finalStep("列式或说总数", "几个几可以写成乘法。结果是多少？", ["乘", "×", "口诀", "总数"]),
      reasonStep("说清乘法意思", "因为每组同样多，有几个这样的组，所以可以用乘法。", ["同样多", "几个几", "乘法"]),
    ],
    division: [
      teacherModelStep("看平均分", "除法先看是不是平均分，平均分就是每份一样多。", "每份一样多叫平均分", ["平均分", "每份", "一样多"]),
      teacherAskStep("看总数", "一共有多少？先说总数。", ["总数", "一共", ...numbers]),
      teacherAskStep("看分法", "题目是告诉分成几份，还是每份几个？", ["分成几份", "每份几个", "份数", "每份"]),
      teacherAskStep("看问题问什么", "最后问的是每份几个，还是可以分几份？", ["每份", "几份", "问什么"]),
      finalStep("说出每份或份数", "按平均分的意思，答案是多少？", ["每份", "份数", "平均分"]),
      reasonStep("说清除法意思", "因为是平均分，所以用总数按份数或每份数来分。", ["平均分", "总数", "份数", "每份"]),
    ],
    time: [
      teacherModelStep("先看时针", "看钟面先看短针，短针决定几时。", "先看时针定几时", ["时针", "短针", "几时"]),
      teacherModelStep("再看分针", "再看长针，分针决定几分。", "再看分针定几分", ["分针", "长针", "几分"]),
      finalStep("合起来说时间", "把几时和几分合起来说，时间是多少？", ["几时", "几分", "半时"]),
      reasonStep("说清看钟方法", "因为时针看几时，分针看几分，所以先时针再分针。", ["时针", "分针", "先", "再"]),
    ],
    placeValue: [
      teacherModelStep("先看数位", "读写数和拆数都先看数位，个位、十位、百位表示的大小不一样。", "先看数位", ["个位", "十位", "百位", "千位", "数位"]),
      teacherModelStep("从高位开始", "多位数一般从高位看起，一个数位一个数位来。", "从高位开始看", ["高位", "从高位", "数位"]),
      teacherAskStep("说每个数位", "每个数位上分别是几？", ["个位", "十位", "百位", "千位", "几个十", "几个百"]),
      finalStep("读写或拆完整", "现在把答案完整说出来。", ["读作", "写作", "组成", "几个"]),
      reasonStep("说清位值", "因为同一个数字在不同数位，表示的大小不同。", ["数位", "位值", "大小不同"]),
    ],
    shape: [
      teacherModelStep("看明显特征", "认图形不要只看像不像，要说出明显特征。", "先看特征", ["特征", "图形"]),
      teacherAskStep("找边角面", "它有什么边、角、面，或者会不会滚？", ["边", "角", "面", "会滚", "平平的"]),
      finalStep("说名称或判断", "根据特征，答案是什么？", ["长方体", "正方体", "圆柱", "球", "长方形", "正方形", "三角形", "圆"]),
      reasonStep("说清图形理由", "因为我看到了图形的边、角、面这些特征，所以能判断。", ["特征", "边", "角", "面"]),
    ],
    data: [
      teacherModelStep("看分类标准", "统计题先看按什么分类，别急着报数。", "先看按什么分类", ["分类", "标准", "统计"]),
      teacherAskStep("看行列或记录", "对应的一行、一列或记录在哪里？", ["一行", "一列", "记录", "表"]),
      finalStep("读出数量", "从表里读出来，答案是多少？", ["数量", "最多", "最少", "合计"]),
      reasonStep("说清从哪里看出", "因为我先找到对应的记录，再读数量，所以知道答案。", ["记录", "表", "数量"]),
    ],
    logic: [
      teacherModelStep("先记条件", "推理题先记住条件，不要直接猜。", "先看已知条件", ["条件", "已知", "告诉"]),
      teacherModelStep("排除不可能", "把不符合条件的先排除掉。", "先排除不可能", ["排除", "不可能", "不是"]),
      finalStep("看剩下答案", "排除以后，剩下谁或哪种可能？", ["剩下", "可能", "一定"]),
      reasonStep("说清推理理由", "因为我按条件排除了不可能的，剩下的就是答案。", ["条件", "排除", "剩下"]),
    ],
    generic: [
      teacherModelStep("先看题目", `我们学「${title}」时先不急，先看题目问什么。`, "先看题目问什么", ["题目", "问什么"]),
      teacherModelStep("只做一步", `如果一下子不会做，就只做一个小台阶：${sourceSteps[0] || "先找关键信息"}。`, sourceSteps[0] || "先找关键信息", ["小台阶", "关键信息"]),
      finalStep("说当前答案", "当前这一步完成后，答案是什么？", ["答案"]),
      reasonStep("说清方法", "我先看题目，再一步一步做，所以不会漏。", ["先", "再", "一步一步"]),
    ],
  };

  return families[family] || null;
}

function ensureChildAnswerTarget(teach) {
  const text = String(teach || "").trim();
  if (!text) return "这一小步要你回答一个数、一个单位，或一个关键词。";
  if (/如果问/.test(text)) return `${text} 现在只回答这个小问题。`;
  if (/[？?]|你|请|回答|填|比一比|数一数|看一看|想一想|说出|说一说|先说|只说|现在说|是多少|多少|几|该/.test(text)) return text;
  return `${text} 请接着说出这一小步的答案。`;
}

function createCalculationTeacherSteps(context, finalStep, reasonStep) {
  const { question, familyText } = context;
  const prompt = normalizeText(question.prompt || "");
  const allText = normalizeText(`${question.prompt || ""} ${question.explanation || ""} ${familyText || ""}`);
  const numbers = extractNumbers(prompt).map(String);
  const simpleAdd = String(prompt || "").match(/(\d+)\s*[+＋]\s*(\d+)/);
  const simpleSubtract = String(prompt || "").match(/(\d+)\s*[-－]\s*(\d+)/);

  if (/×|乘|口诀|几个几/.test(prompt)) {
    return [
      teacherModelStep("看几个几", "乘法题先想几个几，不要只背口诀。", "先想几个几", ["几个几", "乘法", "每组"]),
      teacherModelStep("用口诀帮忙", "知道几个几以后，再用乘法口诀帮忙算。", "先说口诀再算", ["口诀", "乘", "×"]),
      finalStep("说出积", "口诀用完，结果是多少？", ["积", "结果"]),
      reasonStep("说清乘法算法", "因为乘法表示几个相同的数相加，所以可以用口诀算。", ["几个几", "口诀", "相同"]),
    ];
  }
  if (/÷|除|平均分/.test(prompt)) {
    return [
      teacherModelStep("先看平均分", "除法题先看是不是平均分。", "每份一样多叫平均分", ["平均分", "每份"]),
      teacherModelStep("用乘法想除法", "不会直接除时，可以想几乘除数等于被除数。", "想乘法做除法", ["乘法", "除法", "想乘算除"]),
      finalStep("说出商", "现在商是多少？", ["商", "结果"]),
      reasonStep("说清除法算法", "因为除法和乘法有关系，所以可以想乘法来求商。", ["乘法", "除法", "求商"]),
    ];
  }
  if (/十几减|破十|退位|-\d/.test(prompt) && /1\d/.test(prompt)) {
    return createTeacherLikeFamilySteps("breakTenSubtract", { question, prompt, answer: cleanAnswer(question.answer || ""), point: {}, sourceSteps: [] });
  }

  if (simpleAdd && !isMakeTenText("", prompt)) {
    const a = Number(simpleAdd[1]);
    const b = Number(simpleAdd[2]);
    const bigger = Math.max(a, b);
    const smaller = Math.min(a, b);
    if (Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b >= 0 && a + b <= 10) {
      return [
        teacherModelStep("看加号意思", "加法不是先背答案，加号表示把两部分合起来。", "加法是合起来", ["加号", "加法", "合起来"]),
        teacherAskStep("说两部分", `这题的两部分是${a}和${b}。先只说两部分。`, [String(a), String(b), "两部分"]),
        teacherModelStep("接着数", `小数加法可以从较大的数${bigger}开始，接着数${smaller}下。`, `从${bigger}接着数${smaller}下`, ["接着数", String(bigger), String(smaller)]),
        finalStep("说出一共", "接着数完以后，一共是多少？", ["一共", "合起来"]),
        reasonStep("说清加法方法", "因为加法是把两部分合起来，所以可以接着数。", ["加法", "合起来", "接着数"]),
      ];
    }
  }

  if (simpleSubtract) {
    const a = Number(simpleSubtract[1]);
    const b = Number(simpleSubtract[2]);
    if (Number.isFinite(a) && Number.isFinite(b) && a >= b && a <= 20 && !isBreakTenText("", prompt)) {
      return [
        teacherModelStep("看减号意思", "减法不是先背答案，减号表示从原来的数里去掉一些。", "减法是去掉后剩下", ["减号", "减法", "去掉", "剩下"]),
        teacherAskStep("说原来和去掉", `这题原来是${a}，要去掉${b}。先只说原来和去掉。`, [String(a), String(b), "原来", "去掉"]),
        teacherModelStep("倒着数", `小数减法可以从${a}开始，倒着数${b}下。`, `从${a}倒着数${b}下`, ["倒着数", String(a), String(b)]),
        finalStep("说还剩多少", "倒着数完以后，还剩多少？", ["还剩", "剩下"]),
        reasonStep("说清减法方法", "因为减法是从原来的数里去掉一部分，所以可以倒着数。", ["减法", "去掉", "倒着数"]),
      ];
    }
  }

  if (/两位数|笔算|个位|十位|进1|进一|借1|退位/.test(allText)) {
    const isSubtract = /[-－]|减/.test(prompt);
    return [
      teacherModelStep("先对齐数位", "两位数加减法不能把位置看乱。个位和个位算，十位和十位算。", "个位和个位算，十位和十位算", ["个位", "十位", "数位", "对齐"]),
      teacherAskStep("先算个位", isSubtract ? "先只看个位。个位够不够减？这一步是多少？" : "先只看个位。个位相加是多少？", ["个位", "够不够", "相加", "相减", ...numbers]),
      isSubtract
        ? teacherModelStep("不够就借一", "如果个位不够减，就从十位借1个十，变成10个一来减。", "个位不够减，就向十位借1", ["借1", "退位", "10个一", "个位不够"])
        : teacherModelStep("满十要进一", "如果个位相加满10，就向十位进1，个位只写剩下的数。", "个位满十向十位进1", ["满十", "进1", "个位", "十位"]),
      teacherAskStep("再算十位", "个位处理好，再算十位。十位这一步是多少？", ["十位", "进1", "借1", ...numbers]),
      finalStep("说完整结果", "个位和十位都算完，把结果完整说出来。", ["结果", "完整"]),
      reasonStep("说清笔算顺序", isSubtract ? "因为个位不够减要先借1，再算个位和十位。" : "因为个位满十要先进1，再算十位。", ["个位", "十位", "进1", "借1"]),
    ];
  }

  if (/整十|几个十|十位.*变|个十/.test(allText)) {
    return [
      teacherModelStep("把整十看成几个十", "整十数计算时，可以先把30看成3个十、20看成2个十。", "先看有几个十", ["几个十", "整十", "十位"]),
      teacherAskStep("先算十的个数", "只算几个十加几个十，或者几个十减几个十，得到几个十？", ["几个十", "加", "减", ...numbers]),
      finalStep("换回普通数", "几个十想清楚后，再说成普通的数，答案是多少？", ["十", "答案"]),
      reasonStep("说清整十算法", "因为整十数可以看成几个十，所以先算十的个数。", ["几个十", "整十"]),
    ];
  }

  if (isMakeTenText("", prompt)) {
    return createTeacherLikeFamilySteps("makeTenAdd", { question, prompt, answer: cleanAnswer(question.answer || ""), point: {}, sourceSteps: [] });
  }

  return [
    teacherModelStep("看符号意思", "计算题先看符号：加表示合起来，减表示去掉或相差。", "先看加号还是减号", ["加", "减", "符号", "合起来", "去掉"]),
    teacherModelStep("选一个小方法", "小数可以接着数，也可以用分与合；接近10时再用凑十或破十。", "选一个小方法再算", ["数一数", "分与合", "凑十", "破十"]),
    finalStep("算出结果", "用这个小方法算，结果是多少？", ["结果"]),
    reasonStep("说清怎么算", "我先看符号，再选小方法，最后算出结果。", ["符号", "方法", "结果"]),
  ];
}

function createCompareTeacherSteps(context, finalStep, reasonStep) {
  const { question, familyText } = context;
  const allText = normalizeText(`${question.prompt || ""} ${question.explanation || ""} ${familyText || ""}`);
  const isBigNumber = /万以内|千|百|十位|个位|高位|最高位|\d{3,}/.test(allText);
  if (isBigNumber) {
    return [
      teacherModelStep("先看数位", "大数比较不要从后面看，要先看位数和最高位。", "先看位数和最高位", ["数位", "最高位", "位数", "高位"]),
      teacherAskStep("比较最高位", "先只看最高位，左边和右边谁更大？", ["最高位", "左边", "右边", "大", "小"]),
      teacherAskStep("再看下一位", "如果最高位一样，再看下一位。这里需要看哪一位？", ["下一位", "百位", "十位", "个位"]),
      finalStep("填比较符号", "确定谁大以后，再填大于号、小于号或等号。该填什么？", [">", "<", "=", "大于", "小于", "等于"]),
      reasonStep("说清高位比较", "因为高位表示的数更大，所以比较大数要从高位开始。", ["高位", "数位", "比较"]),
    ];
  }
  return [
    teacherModelStep("看清两边", "比较题先不填符号，先分别看左边和右边。", "先看左边，再看右边", ["左边", "右边", "两边"]),
    teacherModelStep("找比较方法", "小数可以数一数；图形可以一一配对。", "用数数或配对比较", ["数数", "一一对应", "配对", "比较"]),
    teacherAskStep("说哪边大", "先说判断：哪边大、哪边小，还是一样大？", ["左边大", "右边大", "一样大", "相等", "大", "小"]),
    finalStep("填比较符号", "最后再填大于号、小于号或等号。该填什么？", [">", "<", "=", "大于", "小于", "等于"]),
    reasonStep("说清比较方法", "我先看两边，再用数数或配对比较，所以能选出符号。", ["比较", "符号", "两边"]),
  ];
}

function createPlaceValueTeacherSteps(context, finalStep, reasonStep) {
  const { question, familyText } = context;
  const allText = normalizeText(`${question.prompt || ""} ${question.explanation || ""} ${familyText || ""}`);
  if (/个千|个百|个十|个一|里面有|组成/.test(allText)) {
    return [
      teacherModelStep("先看每个位置", "数位题先看每个数字站在哪个位置。位置不同，意思就不同。", "先看每个数字的位置", ["位置", "数位", "个位", "十位", "百位", "千位"]),
      teacherAskStep("说高位有几个", "先从高位说起：有几个千、几个百或几个十？", ["千", "百", "十", "高位"]),
      teacherAskStep("说个位有几个", "再看个位，个位上有几个一？", ["个位", "几个一", "一"]),
      finalStep("完整说组成", "现在把组成完整说出来。", ["组成", "几个十", "几个一", "几个百", "几个千"]),
      reasonStep("说清数位意思", "因为数字在哪一位，就表示几个那样的单位。", ["数位", "表示", "几个"]),
    ];
  }
  return [
    teacherModelStep("先看数位", "读写数和拆数都先看数位，个位、十位、百位表示的大小不一样。", "先看数位", ["个位", "十位", "百位", "千位", "数位"]),
    teacherModelStep("从高位开始", "多位数一般从高位看起，一个数位一个数位来。", "从高位开始看", ["高位", "从高位", "数位"]),
    teacherAskStep("说每个数位", "每个数位上分别是几？", ["个位", "十位", "百位", "千位", "几个十", "几个百"]),
    finalStep("读写或拆完整", "现在把答案完整说出来。", ["读作", "写作", "组成", "几个"]),
    reasonStep("说清位值", "因为同一个数字在不同数位，表示的大小不同。", ["数位", "位值", "大小不同"]),
  ];
}

function createMixedCalculationTeacherSteps(context, finalStep, reasonStep) {
  const { question, familyText } = context;
  const allText = normalizeText(`${question.prompt || ""} ${question.explanation || ""} ${familyText || ""}`);
  const hasMulDivAndAddSub = /[×÷]/.test(allText) && /[+\-＋－]/.test(allText);
  if (hasMulDivAndAddSub || /乘加|乘减|两级混合|先乘除/.test(allText)) {
    return [
      teacherModelStep("先找乘除", "混合运算里如果有乘除又有加减，先不要从左往右，先找乘法或除法。", "先算乘除，再算加减", ["乘除", "加减", "先算", "混合运算"]),
      teacherAskStep("先算乘除这一步", "先算乘法或除法那一步，得到多少？", ["乘法", "除法", "中间结果"]),
      teacherModelStep("放回原式", "乘除算完，要把这个中间结果放回原来的式子里，再继续算。", "把中间结果放回去", ["中间结果", "放回", "原式"]),
      finalStep("再算加减", "现在再算剩下的加法或减法，最后是多少？", ["最后", "结果"]),
      reasonStep("说清混合顺序", "因为混合运算要先乘除、后加减，所以不能只从左往右算。", ["先乘除", "后加减", "顺序"]),
    ];
  }
  return [
    teacherModelStep("看有几步", "连加连减题不要跳着算，先看有几步。", "先看有几步", ["几步", "连加", "连减"]),
    teacherModelStep("从左往右", "只有加减同级运算时，通常从左往右做第一步。", "先算第一步", ["从左往右", "第一步", "中间结果"]),
    teacherAskStep("记中间结果", "第一步算完，中间结果是多少？", ["中间结果", "第一步"]),
    finalStep("再算下一步", "带着中间结果再算下一步，最后是多少？", ["最后", "结果"]),
    reasonStep("说清顺序", "因为有好几步，所以要先算第一步，记住中间结果，再算下一步。", ["先", "再", "中间结果"]),
  ];
}

function createShapeTeacherSteps(context, finalStep, reasonStep) {
  const { question, familyText } = context;
  const allText = normalizeText(`${question.prompt || ""} ${question.explanation || ""} ${familyText || ""}`);
  if (/平移|旋转|轴对称|对称/.test(allText)) {
    return [
      teacherModelStep("先看运动方式", "图形运动先分清三种：平移是直直移动，旋转是绕一个点转，轴对称是对折能重合。", "先分清平移、旋转和对称", ["平移", "旋转", "对称", "运动"]),
      teacherAskStep("找动作关键词", "这道题里的动作更像直直移动、绕点转，还是对折重合？", ["直直移动", "绕点转", "对折", "重合"]),
      finalStep("说判断结果", "根据动作特征，判断结果是什么？", ["平移", "旋转", "轴对称", "对", "错"]),
      reasonStep("说清运动理由", "因为平移不转方向，旋转绕点转，轴对称能对折重合，所以要看动作特征。", ["平移", "旋转", "对称", "特征"]),
    ];
  }
  if (/长方体|正方体|圆柱|球|立体/.test(allText)) {
    return [
      teacherModelStep("先摸一摸特征", "立体图形要看面是不是平、能不能滚、是不是到处圆。", "先看能不能滚和面是什么样", ["立体", "面", "滚", "圆"]),
      teacherAskStep("说一个明显特征", "这道题里最明显的特征是什么？可以只说“会滚”或“平平的”。", ["会滚", "平平的", "圆圆的", "面"]),
      finalStep("说图形名称", "根据这个特征，它是什么图形？", ["长方体", "正方体", "圆柱", "球"]),
      reasonStep("说清判断理由", "因为图形的面和能不能滚不同，所以可以用特征来判断。", ["特征", "面", "滚"]),
    ];
  }
  return [
    teacherModelStep("先看边和角", "平面图形先看边有几条、角有几个，圆没有直直的边。", "先看边和角", ["边", "角", "圆", "平面图形"]),
    teacherAskStep("数边或角", "先数边或角，有几条边、几个角？", ["边", "角", "几条", "几个"]),
    finalStep("说图形名称", "根据边和角，答案是什么？", ["长方形", "正方形", "三角形", "圆"]),
    reasonStep("说清图形特征", "因为不同图形的边和角不同，所以先看特征再判断。", ["边", "角", "特征"]),
  ];
}

function createDataTeacherSteps(context, finalStep, reasonStep) {
  const { question, familyText } = context;
  const allText = normalizeText(`${question.prompt || ""} ${question.explanation || ""} ${familyText || ""}`);
  const steps = [
    teacherModelStep("先看分类标准", "统计题先看按什么分类，比如水果、颜色或项目。", "先看按什么分类", ["分类", "标准", "项目"]),
    teacherAskStep("逐行读数量", "一行一行看，每一类有多少？请先说表里的一个数量。", ["一行", "数量", "票数", "记录"]),
  ];
  if (/一共|合计|总数/.test(allText)) {
    steps.push(teacherAskStep("先求总数", "如果问一共，就把每一类数量合起来。现在一共是多少？", ["一共", "合计", "总数"]));
  }
  if (/最多|最少|更多|更少/.test(allText)) {
    steps.push(teacherAskStep("找最多最少", "如果问哪类更多或最多，就先找到数量大的那一类。", ["最多", "最少", "更多", "数量大"]));
  }
  if (/多多少|少多少|相差/.test(allText)) {
    steps.push(teacherModelStep("再算相差", "问多多少时，要用大的数量减小的数量。", "多多少用大数减小数", ["多多少", "相差", "大数减小数"]));
  }
  steps.push(
    finalStep("回答统计问题", "最后按题目问法，把答案说完整。", ["数量", "最多", "最少", "一共", "相差"]),
    reasonStep("说清读表方法", "因为表格要按分类逐行看，所以先找项目，再读数量。", ["分类", "项目", "数量"])
  );
  return steps;
}

function createMeasureTeacherSteps(question, familyText, finalStep, reasonStep) {
  if (/角的|角大小|几个角|直角|锐角|钝角|顶点|两条边/.test(familyText)) {
    return [
      teacherModelStep("找顶点", "角有一个尖尖的点，先找顶点。", "先找顶点", ["顶点", "尖尖的点"]),
      teacherModelStep("找两条边", "从顶点伸出去的两条线，就是角的两条边。", "再找两条边", ["两条边", "边", "张开"]),
      finalStep("判断角", "根据顶点和两条边，答案是什么？", ["角", "直角", "锐角", "钝角"]),
      reasonStep("说清角的特征", "因为角有一个顶点和两条边，所以要先找这两个特征。", ["顶点", "两条边", "特征"]),
    ];
  }
  if (/米|厘米/.test(familyText) && /=|等于|换算/.test(familyText)) {
    return [
      teacherModelStep("先看长度单位", "长度单位换算先看是米和厘米。1米等于100厘米。", "1米等于100厘米", ["米", "厘米", "100"]),
      teacherAskStep("把米换成厘米", "先只把几米换成多少厘米。是多少？", ["米", "厘米", "100"]),
      finalStep("带厘米回答", "换好以后，把答案带上厘米说完整。", ["厘米", "答案"]),
      reasonStep("说清长度换算", "因为1米等于100厘米，所以几米就是几个100厘米。", ["1米", "100厘米", "几个100"]),
    ];
  }
  if (/千克|克/.test(familyText) && /=|等于|换算/.test(familyText)) {
    return [
      teacherModelStep("先看质量单位", "质量单位换算先看千克和克。1千克等于1000克。", "1千克等于1000克", ["千克", "克", "1000"]),
      teacherAskStep("把千克换成克", "先只把几千克换成多少克。是多少？", ["千克", "克", "1000"]),
      finalStep("再加剩下的克", "如果题里还有几克，再加上，答案是多少？", ["克", "答案"]),
      reasonStep("说清质量换算", "因为1千克等于1000克，所以先换成克再相加。", ["1千克", "1000克", "换成克"]),
    ];
  }
  return [
    teacherModelStep("先看单位", "测量题先看单位，长度常用厘米和米，质量常用克和千克。", "先看单位", ["厘米", "米", "克", "千克", "单位"]),
    teacherModelStep("联系生活大小", "再想生活里这个东西大不大、长不长、重不重。", "联系生活想单位", ["生活", "长", "短", "重", "轻"]),
    finalStep("带单位回答", "答案是多少？记得带单位。", ["单位", "厘米", "米", "克", "千克"]),
    reasonStep("说清单位选择", "因为不同东西要用合适单位，所以答案要带单位。", ["单位", "合适", "带单位"]),
  ];
}

function makeNoResponsePrompt(step, title) {
  const label = step?.label || "这一小步";
  const repeat = cleanPromptSentence(step?.repeatSentence || step?.prompt || label);
  const head = pick(noResponseHints, `${title}-${label}`);
  if (repeat && repeat !== label) return `${head} 乐之老师把句子变短：${repeat}。你可以跟着说一遍，也可以换自己的话。`;
  return `${head} 先看「${label}」，说一个你看见的数、单位或关键词。`;
}

function makeRepairPrompt(step, title) {
  const label = step?.label || "这一小步";
  const teach = cleanPromptSentence(step?.prompt || step?.teach || "");
  const head = pick(askRepairs, `${title}-${label}`);
  if (teach && teach !== label) return `${head} 乐之老师把问题缩小：${teach} 这一轮只答眼前这一问。`;
  return `${head} 这一轮只看「${label}」这一点。`;
}

function makeFinalRepairPrompt(label, teach) {
  const prompt = cleanPromptSentence(teach);
  if (/答案|结果|多少|几/.test(prompt)) {
    return `先别急着报整题答案。回到方法：先说你算到的中间数，或者说“我先看什么”。`;
  }
  return `最后一步卡住时，不直接猜。先把上一步的中间结果说出来，再接着算。`;
}

function makeFinalNoResponsePrompt(label, teach) {
  const prompt = cleanPromptSentence(teach);
  return `没关系，先不报答案。我们只看最后一步：${prompt || label} 你可以先说“我先算……”`;
}

function cleanPromptSentence(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[。！？.!?]+$/, "");
}

function pick(items, key) {
  const text = String(key || "");
  const index = Array.from(text).reduce((sum, char) => sum + char.codePointAt(0), 0) % items.length;
  return items[index];
}

function teacherModelStep(label, explain, repeatSentence, keywords = [], options = {}) {
  const repeat = String(repeatSentence || label).trim().replace(/[。！？.!?]+$/, "");
  const opener = pick(modelPromptOpeners, `${label}-${repeat}`);
  const teachingLine = createModelTeachingLine(label, explain, repeat, `${label}-${repeat}-${explain}`);
  return makeStep(
    label,
    teachingLine || `${opener}：${explain} 请跟着说：${repeat}。`,
    unique([...keywords, ...phraseKeywords(repeat)]),
    options.repair || createModelRepairLine(label, explain, repeat),
    {
      ...options,
      repeatSentence: repeat,
      noResponse: options.noResponse || createModelNoResponseLine(label, explain, repeat),
    }
  );
}

function createModelTeachingLine(label, explain, repeat, key) {
  const cleanExplain = cleanPromptSentence(explain);
  const cleanRepeat = cleanPromptSentence(repeat);
  const variants = [
    `先看一个小方法：${cleanExplain} 接下来你说：${cleanRepeat}。`,
    `${cleanExplain} 这一句很关键，请说：${cleanRepeat}。`,
    `${cleanExplain} 现在只回答这一句：${cleanRepeat}。`,
    `看图时先看这一点：${cleanExplain} 请跟着说：${cleanRepeat}。`,
    `${cleanExplain} 如果还不熟，先跟着读：${cleanRepeat}。`,
    `乐之老师给一个小提示：${cleanExplain} 请接着说：${cleanRepeat}。`,
    `先把眼睛放到这一步：${cleanExplain} 请回答：${cleanRepeat}。`,
    `这一小步不难，先看方法：${cleanExplain} 请说成：${cleanRepeat}。`,
    `先别急着算完整题。${cleanExplain} 你先答：${cleanRepeat}。`,
    `把这一步看清：${cleanExplain} 然后说：${cleanRepeat}。`,
    `我们换成更短的话：${cleanExplain} 请说：${cleanRepeat}。`,
    `先听一半，再由你接上。${cleanExplain} 请接着说：${cleanRepeat}。`,
  ];
  return pick(variants, key);
}

function createModelRepairLine(label, explain, repeat) {
  const cleanExplain = cleanPromptSentence(explain);
  const cleanRepeat = cleanPromptSentence(repeat);
  const keywords = phraseKeywords(cleanRepeat).slice(0, 2).join("、") || cleanRepeat;
  const variants = [
    `${cleanExplain} 不用一次说完整，请先说：${keywords}。`,
    `刚才差一点连到方法上。再看这句：${cleanRepeat}。`,
    `乐之老师把问题缩小：${cleanExplain} 你说「${keywords}」也可以。`,
    `先别急着报整题答案，回到这一步：${cleanRepeat}。`,
  ];
  return pick(variants, `${label}-${repeat}-repair`);
}

function createModelNoResponseLine(label, explain, repeat) {
  const cleanExplain = cleanPromptSentence(explain);
  const cleanRepeat = cleanPromptSentence(repeat);
  const variants = [
    `没关系，这一步乐之老师带一半。${cleanExplain} 请跟着说：“${cleanRepeat}”。`,
    `卡住没关系。先听方法：${cleanExplain} 然后只回答眼前这一句：“${cleanRepeat}”。`,
    `我们先不答整题，只把这句放稳。请跟着说：${cleanRepeat}。`,
    `这一步可以先跟读。乐之老师说：“${cleanRepeat}”。请你跟着读一遍。`,
    `乐之老师把话变短：${cleanRepeat}。请跟着说：${cleanRepeat}。`,
    `先不用想完整句。${cleanExplain} 请跟着老师说：“${cleanRepeat}”。`,
  ];
  return pick(variants, `${label}-${repeat}-no-response`);
}

function teacherAskStep(label, teach, keywords = [], options = {}) {
  const childTeach = ensureChildAnswerTarget(teach);
  return makeStep(
    label,
    childTeach,
    unique([label, ...keywords]),
    options.repair || makeAskRepairPrompt(label, childTeach),
    {
      ...options,
      noResponse: options.noResponse || makeAskNoResponsePrompt(label, childTeach),
    }
  );
}

function makeAskRepairPrompt(label, teach) {
  const prompt = cleanPromptSentence(teach);
  const head = pick(askRepairs, `${label}-${prompt}`);
  if (/为什么|原因/.test(prompt)) return `${head} 可以先用“因为……”开头，说一个小原因。`;
  if (/哪边|谁大|谁小|比较/.test(prompt)) return `${head} 先分别说左边和右边，再说哪边大。`;
  if (/单位|元|角|分|厘米|米|克|千克/.test(prompt)) return `${head} 先只说单位或单位关系。`;
  if (/先算|中间|第一步/.test(prompt)) return `${head} 只算第一步，不用管后面。`;
  return `${head} 你可以只回答一个数、一个单位，或一个关键词。`;
}

function makeAskNoResponsePrompt(label, teach) {
  const prompt = cleanPromptSentence(teach);
  const head = pick(noResponseHints, `${prompt}-${label}`);
  if (/多少|几/.test(prompt)) return `${head} 先把题里的两个数找出来，再说你想先算哪一个。`;
  if (/为什么|原因/.test(prompt)) return `${head} 先说“因为”，后面接一个你看到的理由。`;
  return `${head} 先看图中对应的位置，请先说一个数、单位或图里的词。`;
}

function phraseKeywords(phrase) {
  return String(phrase || "")
    .split(/[，,。；;、：:\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function makeStep(label, teach, keywords = [], repair = "", options = {}) {
  const repeatSentence = options.isReason
    ? options.repeatSentence ||
      teach
        .replace(/^老师先说一句，你跟着说一遍：?/, "")
        .replace(/^把刚才的方法说成一句话：?/, "")
        .replace(/^先把方法补成一句话：?/, "")
    : options.repeatSentence || "";
  return {
    label,
    teach,
    repair,
    noResponse: options.noResponse || `没关系。先听老师说：${repeatSentence || teach}`,
    returnPrompt: options.returnPrompt || `我们先回到这一小步：${label}。请先回答这一问。`,
    repeatSentence,
    keywords: unique([label, ...keywords].map(String)),
    acceptsFinal: Boolean(options.acceptsFinal),
    errorTags: options.errorTags || [ErrorTag.PROCESS_DROP, ErrorTag.CALCULATION_SLIP, ErrorTag.EXPRESSION_WEAK],
    actions: options.actions,
  };
}

function createAssessments(pointId, family, questions, atoms, point) {
  const primary = questions[0] || normalizeQuestion(point.typicalQuestion);
  const sameFamilyQuestions = uniqueQuestions((questions || []).filter((question, index) => index === 0 || inferFamily(point, question) === family));
  const usable = sameFamilyQuestions.length ? sameFamilyQuestions : [primary].filter(Boolean);
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
    moneyApplication: "购物找零时，为什么要用付的钱减商品价格？",
    compare: "你是怎么比较大小的？",
    count: "为什么按顺序数能知道总数？",
    composition: "为什么两部分合起来要等于总数？",
    ordinal: "做第几个这类题时，为什么要先看从哪边数？",
    pattern: "找规律时，你先看什么，再怎么接着填？",
    multiplication: "为什么同样多的几组可以用乘法？",
    division: "为什么平均分可以用除法？",
    application: "为什么这道题要用你选的方法？",
    comparisonDifference: "为什么求相差要用大数减小数？",
    arrangement: "搭配题怎样数才不会重复也不会漏？",
    observation: "观察物体时，为什么要先看自己站在哪里？",
    timeDuration: "求经过时间时，为什么要找开始和结束？",
    angle: "认角时，为什么要先找顶点和两条边？",
    remainderDivision: "为什么余数必须比除数小？",
    remainderApplication: "有余数解决问题时，为什么要回到生活里判断？",
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
    moneyApplication: ["价格", "付的钱", "找回", "先换单位", "付的钱减价钱"],
    compare: ["先看两边", "比较大小", "填符号", "大于小于等于"],
    count: ["按顺序数", "不漏不重复", "最后一个数", "总数"],
    composition: ["先看总数", "看已知部分", "找另一部分", "合起来检查"],
    ordinal: ["先看方向", "第几个是位置", "前面后面", "不是总数"],
    pattern: ["相邻两个", "每次怎么变", "同样规律", "接着填"],
    calculation: ["看运算符号", "先算一步", "说结果", "检查"],
    application: ["看问题", "找条件", "选方法", "算结果"],
    comparisonDifference: ["谁多谁少", "相差", "大数减小数", "带单位"],
    arrangement: ["固定一种", "依次搭配", "不重不漏", "总种数"],
    observation: ["观察位置", "关键特征", "看到的面", "选择图"],
    timeDuration: ["开始时间", "结束时间", "经过多久", "时间段"],
    angle: ["顶点", "两条边", "张开大小", "角的特征"],
    remainderDivision: ["商", "余数", "尽量分满", "余数比除数小"],
    remainderApplication: ["商和余数", "剩下", "进一法", "去尾法"],
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
  const promptText = normalizeText(`${question?.type || ""} ${question?.prompt || ""}`);
  const titleText = normalizeText(`${point.title || ""} ${point.node || ""} ${point.lesson || ""}`);
  const visualType = point.visualType || "";
  if (/钟|时间|时针|分针|几时/.test(text)) {
    if (/经过.*时间|从.*开始.*结束|到.*结束|多长时间/.test(text)) return "timeDuration";
    return "time";
  }
  if (isMoneyApplicationText(text)) return "moneyApplication";
  if (isMoneyText(text)) return "money";
  if (/分类|统计|读表|记录表|表格|类别|票数|调查/.test(text)) return "data";
  if (/有余数|余数/.test(text)) {
    if (/至少|最多|船|车|盒|箱|装|坐|租|买票|够不够|进一|去尾/.test(text)) return "remainderApplication";
    return "remainderDivision";
  }
  if (/进一法|去尾法|至少需要|最多可以|每条船|每辆车|每盒|每箱/.test(text)) return "remainderApplication";
  if (/搭配|排列|组合|不同搭配|多少种|路线/.test(text)) return "arrangement";
  if (/观察物体|正面|侧面|上面|从.*看|看到的是/.test(text)) return "observation";
  if (/角的|角大小|几个角|直角|锐角|钝角|顶点|两条边|张开/.test(text)) return "angle";
  if (/规律|接着|按规律/.test(text)) return "pattern";
  if (/图形|长方体|正方体|圆柱|球|长方形|正方形|三角形|圆|对称|平移|旋转/.test(text)) return "shape";
  if (/推理|排除|不是|可能|一定/.test(text)) return "logic";
  if (/比.*多多少|比.*少多少|多多少|少多少|相差/.test(text)) return "comparisonDifference";
  if (/连加|连减|加减混合|混合运算|乘加|乘减|小括号/.test(text) && expressionOperatorCount(promptText) >= 2) return "mixedCalculation";
  if (expressionOperatorCount(promptText) >= 2) return "mixedCalculation";
  if (/÷|求商/.test(promptText) || /表内除法|平均分|每份|用乘法口诀求商/.test(titleText) || visualType === "sharing") return "division";
  if (/[×]/.test(promptText) || /乘法|几个几|同样多|口诀/.test(titleText) || visualType === "array") return "multiplication";
  if (isMakeTenText(titleText, promptText)) return "makeTenAdd";
  if (isBreakTenText(titleText, promptText)) return "breakTenSubtract";
  if (/第几个|第\d+|从左|从右|前面|后面/.test(promptText)) return "ordinal";
  if (/比较|大小|大于|小于|等于|符号|较大的数|较小的数|□/.test(promptText) || /比较|大小比较/.test(titleText) || visualType === "compare") {
    if (!/比.*多多少|比.*少多少|多多少|少多少|相差/.test(text)) return "compare";
  }
  if (/计算|加法|减法|口算|[+\-＋－×÷]/.test(promptText)) return "calculation";
  if (/数位|读作|写作|个千|个百|个十|几个十|个一|个位|十位|百位|千位|里面有/.test(text)) return "placeValue";
  if (/分成|组成/.test(text) && !/数位|个千|个百|个十|个一|里面有/.test(text)) return "composition";
  if (/厘米|米|克|千克|质量|长度/.test(text) || ["ruler", "mass"].includes(visualType)) return "measure";
  if (/合起来|一共|又来|又有|又得到|加起来/.test(promptText)) return "concreteAddition";
  if (/拿走|去掉|还剩|飞走|用去|少了/.test(promptText)) return "concreteSubtraction";
  if (/数一数|一共有几个|总数/.test(text) || visualType === "count") return "count";
  if (/第几个|第\d+|从左|从右|前面|后面/.test(text)) return "ordinal";
  if (/应用题|一共|还剩|用去|飞走|又得到|买/.test(text)) return "application";
  return "generic";
}

function expressionOperatorCount(text) {
  const expression = String(text || "").match(/\d+\s*[+\-＋－×÷]\s*\d+(?:\s*[+\-＋－×÷]\s*\d+)*/);
  if (!expression) return 0;
  return (expression[0].match(/[+\-＋－×÷]/g) || []).length;
}

function isMakeTenText(titleText, promptText) {
  if (/凑十|20以内.*进位/.test(`${titleText} ${promptText}`)) return true;
  const match = String(promptText || "").match(/(\d+)\s*[+＋]\s*(\d+)/);
  if (!match) return false;
  const a = Number(match[1]);
  const b = Number(match[2]);
  return a > 0 && b > 0 && a < 10 && b < 10 && a + b > 10 && Math.max(a, b) >= 6;
}

function isBreakTenText(titleText, promptText) {
  if (/(1\d)\s*[-－]\s*(\d+)/.test(promptText)) return true;
  return /十几减|破十|退位/.test(`${titleText} ${promptText}`) && /[-－]|减/.test(promptText);
}

function isMoneyText(text) {
  return (
    /人民币|钱|购物|找零|找回|付了|应找|价格|买|卖|元/.test(text) ||
    /\d+角/.test(text) ||
    /\d+分(?!成|类|钟|钟表|针|析|清|别|组|份)/.test(text)
  );
}

function isMoneyApplicationText(text) {
  return (
    /人民币|钱|购物|找零|找回|付了|应找|价格|买|卖|元|角|分/.test(text) &&
    /购物|找零|找回|付了|应找|价格|买|卖|一本|一支|一个|一盒彩笔|练习本|铅笔|橡皮/.test(text) &&
    /找回|找零|应找|付了|还剩|够不够|买/.test(text)
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
