import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, "..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const profileSource = fs.readFileSync(path.join(currentDir, "microstep-quality-profiles.js"), "utf8");
const failures = [];

const measureStart = appSource.indexOf("function createMeasureGuidedSteps");
const measureEnd = appSource.indexOf("\nfunction ", measureStart + 1);
const measureSource = appSource.slice(measureStart, measureEnd > measureStart ? measureEnd : undefined);
const familyStart = appSource.indexOf("function inferQuestionTeachingFamily");
const familyEnd = appSource.indexOf("\nfunction parseTeachingArithmeticExpression", familyStart + 1);
const familySource = appSource.slice(familyStart, familyEnd > familyStart ? familyEnd : undefined);
const guidedStepStart = appSource.indexOf("function guidedStep");
const guidedStepEnd = appSource.indexOf("\nfunction ", guidedStepStart + 1);
const guidedStepSource = appSource.slice(guidedStepStart, guidedStepEnd > guidedStepStart ? guidedStepEnd : undefined);
const divisionStart = appSource.indexOf("function createRemainderDivisionGuidedSteps");
const divisionEnd = appSource.indexOf("\nfunction ", divisionStart + 1);
const divisionSource = appSource.slice(divisionStart, divisionEnd > divisionStart ? divisionEnd : undefined);
const answerShapeStart = appSource.indexOf("function createAnswerShapeInstruction");
const answerShapeEnd = appSource.indexOf("\nfunction ", answerShapeStart + 1);
const answerShapeSource = appSource.slice(answerShapeStart, answerShapeEnd > answerShapeStart ? answerShapeEnd : undefined);
const responseInstructionStart = appSource.indexOf("function createStepResponseInstruction");
const responseInstructionEnd = appSource.indexOf("\nfunction ", responseInstructionStart + 1);
const responseInstructionSource = appSource.slice(
  responseInstructionStart,
  responseInstructionEnd > responseInstructionStart ? responseInstructionEnd : undefined,
);
const typedRoutingSource = functionSource("createTypedGuidedSteps");
const motionSource = functionSource("createMotionGuidedSteps");
const logicSource = functionSource("createLogicGuidedSteps");
const mixedSource = functionSource("createMixedCalculationGuidedSteps");
const arithmeticChainSource = functionSource("parseArithmeticChain");
const thinHintSource = functionSource("isThinTeacherHint");

assert(measureStart >= 0, "缺少测量题的小步路由");
assert(/isLengthConversion/.test(measureSource), "长度单位换算没有独立路由");
assert(/记住1米=100厘米/.test(measureSource), "长度换算没有先讲1米=100厘米");
assert(/isMassConversion/.test(measureSource), "质量单位换算没有独立路由");
assert(/记住1千克=1000克/.test(measureSource), "质量换算没有先讲1千克=1000克");
assert(
  measureSource.indexOf("if (isLengthConversion)") < measureSource.indexOf("找起点"),
  "长度换算会先落入尺子读数讲解",
);
assert(
  measureSource.indexOf("if (isMassConversion)") < measureSource.indexOf("先想轻重"),
  "质量换算会先落入轻重估计讲解",
);
assert(!/\["1000",\s*"一千",\s*"1000克",\s*"一千克"\]/.test(measureSource), "把“一千克”误当成1000克的正确回答");
assert(!/"三千克"/.test(profileSource), "把“三千克”误当成3000克的正确回答");
assert(/function renderUnitConversionSvg/.test(appSource), "缺少单位换算专用图示");
assert(/function detectMeasureUnitConversion/.test(appSource), "缺少统一的单位换算题型判断");
assert(/measureConversionKind/.test(familySource), "题型分类没有优先识别单位换算");
assert(
  familySource.indexOf("if (measureConversionKind)") < familySource.indexOf('if (overlayFamily === "application")'),
  "单位换算仍可能先落入应用题分类",
);
assert(/2千克300克/.test(appSource), "缺少复合质量单位换算回归样例");
assert(/isLengthConversion[\s\S]{0,240}renderUnitConversionSvg/.test(appSource), "长度换算仍可能显示普通尺子");
assert(/largeUnit:\s*"米"[\s\S]{0,160}relationCount:\s*100/.test(appSource), "长度换算图没有绑定1米=100厘米");
assert(/isMassConversion[\s\S]{0,240}renderUnitConversionSvg/.test(appSource), "质量换算仍可能显示普通天平");
assert(/largeUnit:\s*"千克"[\s\S]{0,160}relationCount:\s*1000/.test(appSource), "质量换算图没有绑定1千克=1000克");
assert(/responseInstruction:\s*options\.responseInstruction/.test(guidedStepSource), "小台阶没有传递明确作答指令");
assert(
  /String\(normalizedStep\.responseInstruction[\s\S]{0,120}\|\| createStepResponseInstruction/.test(appSource),
  "课程专属作答指令仍会被通用推断覆盖",
);
assert(/题里说每份是\$\{divisor\}个。现在只回答：每份几个/.test(divisionSource), "有余数除法首步仍混合多个回答目标");
assert(/responseInstruction:\s*"这次只说每份几个"/.test(divisionSource), "有余数除法首步缺少明确作答格式");
assert(
  answerShapeSource.indexOf("每份(?:是|有|几个)") < answerShapeSource.indexOf("总数(?:是|有|多少)"),
  "除法作答目标仍可能把‘每份几个’误判成‘总数多少’",
);
assert(
  /请只回答\|现在回答\|现在只回答/.test(appSource),
  "老师消息渲染层没有把‘请只回答’识别为明确作答指令，可能重复追加同一句提问",
);
assert(/够不够[\s\S]{0,120}是，还是不是/.test(responseInstructionSource), "判断题仍可能被要求回答一个数");
assert(/开始时间[\s\S]{0,80}请只说开始时间/.test(responseInstructionSource), "开始时间题缺少明确回答格式");
assert(/结束时间[\s\S]{0,80}请只说结束时间/.test(responseInstructionSource), "结束时间题缺少明确回答格式");
assert(/先看数位[\s\S]{0,120}从高位到低位说出数位名称/.test(responseInstructionSource), "数位题仍可能只让孩子说一个数");
assert(/看分类标准[\s\S]{0,120}分类标准，或要看的行、列/.test(responseInstructionSource), "分类题没有说清回答分类标准还是行列");
assert(/排除不可能[\s\S]{0,120}要排除的人、物品或选项/.test(responseInstructionSource), "推理题没有说清要回答哪个对象");
assert(/和直角比[\s\S]{0,120}更小、一样大，还是更大/.test(responseInstructionSource), "角的比较题回答格式不明确");
assert(/选择方向[\s\S]{0,120}正面、侧面，还是上面/.test(responseInstructionSource), "观察物体题回答方向不明确");
assert(/补下一个[\s\S]{0,120}下一个数或图形/.test(responseInstructionSource), "找规律题回答目标不明确");
assert(/根据刚才的条件，题目里哪个人、物品或选项不能选/.test(appSource), "推理题仍使用无法作答的‘把不可能的排除掉’");
assert(/题目是按颜色、形状、种类中的哪一种来分/.test(appSource), "分类题仍使用含糊的‘先看按什么分’");
assert(familySource.indexOf('return "motion"') < familySource.indexOf('return "shape"'), "图形运动仍可能先落入普通图形讲解");
assert(familySource.indexOf('return "pattern"') < familySource.indexOf('return "shape"'), "图形规律仍可能先落入普通图形讲解");
assert(!/text\.includes\("不是"\)/.test(functionSource("isLogicQuestion")), "普通题里出现‘不是’仍会被误判成推理题");
assert(/family === "motion"[\s\S]{0,100}createMotionGuidedSteps/.test(typedRoutingSource), "图形运动没有走专属小台阶");
assert(/family === "pattern"[\s\S]{0,100}createPatternGuidedSteps/.test(typedRoutingSource), "找规律没有走专属小台阶");
assert(/family === "shape"[\s\S]{0,100}createShapeGuidedSteps/.test(typedRoutingSource), "普通图形没有走专属小台阶");
assert(/family === "logic"[\s\S]{0,100}createLogicGuidedSteps/.test(typedRoutingSource), "推理题没有走专属小台阶");
assert(/直直地移动[\s\S]{0,120}平移/.test(motionSource), "平移讲解没有说明直直移动且朝向不变");
assert(/绕着一个固定点转动[\s\S]{0,80}旋转/.test(motionSource), "旋转讲解没有说明绕固定点转动");
assert(/对折后[\s\S]{0,80}完全重合[\s\S]{0,80}轴对称/.test(motionSource), "轴对称讲解没有说明对折完全重合");
assert(/explicitAnswerMotion/.test(motionSource), "图形运动没有优先根据标准答案确定运动类型");
assert(/motionTypeFromText/.test(motionSource), "图形运动没有从题干断言和讲解中提取准确运动类型");
assert(/normalizedPrompt/.test(motionSource), "图形运动仍可能把题干、答案和讲解混在一起误判");
assert(/observationKeywords/.test(motionSource), "图形运动观察步仍可能接受另一种运动方式作为正确答案");
assert(!/answerKeywords\.concat\(motionKeywords\)/.test(motionSource), "图形运动名称步仍会把三个运动名称都判为正确");
assert(/请只说：平移、旋转，还是轴对称/.test(motionSource), "图形运动没有明确告诉孩子回答哪三个选项");
assert(/rule\("motion", "motion-observe"/.test(profileSource), "图形运动观察步没有专属讲解质量档案");
assert(/rule\("motion", "motion-symmetry"/.test(profileSource), "轴对称观察步没有专属讲解质量档案");
assert(/rule\("motion", "motion-name"/.test(profileSource), "图形运动名称步没有专属讲解质量档案");
assert(/rule\("motion", "motion-reason"/.test(profileSource), "图形运动说理步没有专属讲解质量档案");
assert(/请只说最后剩下的人、物品或选项/.test(logicSource), "推理题最后一步没有说清回答对象");
assert(/createArithmeticExpressionScaffold\(chain\.first/.test(mixedSource), "混合运算第一步仍只报等式，没有讲计算方法");
assert(/createArithmeticExpressionScaffold\(chain\.second/.test(mixedSource), "混合运算第二步仍只报等式，没有讲计算方法");
assert(/firstPriority === secondPriority \? "同级运算从左往右"/.test(arithmeticChainSource), "同级运算和不同级运算仍共用错误顺序话术");
assert(/你可以先说[^\n]*\$/.test(thinHintSource) || /replace\(\/你可以先说/.test(thinHintSource), "教师提示判薄规则没有保留去掉回答模板后的具体讲解");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("教学小步路由审计通过：单位换算、图形运动、推理、混合运算和回答目标已正确分流。");

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function functionSource(name) {
  const start = appSource.indexOf(`function ${name}`);
  if (start < 0) return "";
  const end = appSource.indexOf("\nfunction ", start + 1);
  return appSource.slice(start, end > start ? end : undefined);
}
