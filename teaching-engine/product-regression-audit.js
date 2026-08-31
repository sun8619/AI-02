import assert from "node:assert/strict";
import { loadChildRuntime } from "./runtime-test-harness.js";

const runtime = loadChildRuntime();
const failures = [];
let checked = 0;
function check(name, fn) {
  checked++;
  try { fn(); console.log(`PASS ${name}`); }
  catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message}`); }
}
check("default topic is money conversion", () => {
  assert.equal(runtime.evaluate("currentLesson().sourceQuestionBankId"), "G1V2-U5-KP01");
});
check("shape alternatives are not all correct", () => {
  const result = runtime.evaluate(`(() => {
    const lesson = lessons.find(x => x.sourceQuestionBankId === "G1V2-U1-KP01");
    const question = getLessonQuestionBank(lesson).find(x => /有3条边/.test(x.prompt));
    const plan = createShapeGuidedSteps(lesson, question)[1];
    return ["三角形", "圆", "正方形", "不是三角形"].map(x => matchesGuidedKeywords(x, plan.answerKeywords));
  })()`);
  assert.deepEqual(Array.from(result), [true, false, false, false]);
});
check("ruler endpoints stay in measurement", () => {
  assert.equal(runtime.evaluate(`inferQuestionTeachingFamily({node:"长度单位"}, {prompt:"左端对着2厘米，右端对着7厘米，长多少厘米？", explanation:"7-2=5",answer:"5厘米"})`), "measure");
});
check("no corners is a shape question", () => {
  assert.equal(runtime.evaluate(`inferQuestionTeachingFamily({node:"认识图形"}, {prompt:"圆、三角形、长方形中，没有角的是____。",answer:"圆"})`), "shape");
});
check("ASR never repairs a numeric answer using the expected value", () => {
  const result = runtime.evaluate(`assessVoiceTranscript("二十九", {confidence:.95}, {expectedType:"number", expectedAnswers:["20角"], prompt:"2元是几角？",lessonName:"人民币换算"})`);
  assert.notEqual(result.submitText, "二十角");
});

check("all source answers accepted; mutated numbers and negations rejected", () => {
  const result=runtime.evaluate(`(() => {
    const errors=[]; let count=0;
    for(const l of lessons) for(const q of getLessonQuestionBank(l)) {
      count++;
      if(!matchesWholeQuestionAnswer(q.answer,q,l)) errors.push(q.id+": answer rejected");
      const wrong=/\\d/.test(q.answer) ? q.answer.replace(/\\d+/,n=>String(+n+101)) : "不是"+q.answer;
      if(matchesWholeQuestionAnswer(wrong,q,l)) errors.push(q.id+": wrong answer accepted");
      if(matchesWholeQuestionAnswer("不知道",q,l)) errors.push(q.id+": help accepted");
    }
    return {count,errors};
  })()`);
  assert.equal(result.count,462);
  assert.deepEqual(Array.from(result.errors),[]);
});
check("ordered multi-answer and money/time equivalents", () => {
  const cases=[
    ["5，0，4，0","4，0，5，0",false], ["4，0，5","4，0，5，0",false],
    ["4，0，5，0","4，0，5，0",true], ["七角","0元7角",true],
    ["40，50","4，0，5，0",false],
    ["二十元","20角",false], ["八点五分","8:05",true],
    ["九点半","9:30",true], ["三角形","B. 三角形",true],
  ];
  for(const [input,answer,expected] of cases) assert.equal(runtime.evaluate(`matchesWholeQuestionAnswer(${JSON.stringify(input)}, {answer:${JSON.stringify(answer)}}, {})`),expected,`${input} / ${answer}`);
});
check("all lessons begin with whole question, no forced first microstep",()=>{
  const result=runtime.evaluate(`lessons.map((l,i)=>{changeLesson("test",i);return isWholeQuestionTurn() && getCurrentVisualPlan(l).prompt===childFacingPrompt(l.activeQuestion.prompt);}).every(Boolean)`);
  assert.equal(result,true);
});
check("helped question does not count as independent mastery",()=>{
  const result=runtime.evaluate(`(() => {
    changeLesson("test",defaultLessonIndex); startWholeQuestionAssessment(currentLesson(),"typed");
    state.assessmentQuestionInRepair=true;
    completeQuestionBankRound(currentLesson(),"typed");
    return state.passedQuestionIds.length;
  })()`);
  assert.equal(result,0);
});
check("repeated inability ends with review, not mastery",()=>{
  const result=runtime.evaluate(`(() => {
    changeLesson("test",defaultLessonIndex);
    evaluateQuestionBankAttempt("我不会","typed");
    for(let i=0;i<3;i++) evaluateRemediationCheck("我不会","typed");
    return state.teachingState;
  })()`);
  assert.equal(result,"REVIEW_LATER");
});

check("every actual microstep retains an explicit answer contract",()=>{
  const errors=runtime.evaluate(`(() => {
    const errors=[];
    for(const l of lessons) for(const q of getLessonQuestionBank(l)) {
      activateLessonQuestion(l,q,0);
      for(const p of createGuidedSteps(l)) {
        if(!p.answerQuestion || !p.prompt || !p.teacherHint || p.isReason) errors.push(q.id+":"+p.label);
        else if(!matchesWholeQuestionAnswer(p.answerQuestion.answer,p.answerQuestion,l)) errors.push(q.id+": step answer rejected "+p.label);
      }
    }
    return errors;
  })()`);
  assert.deepEqual(Array.from(errors),[]);
});
check("all 462 whole-answer submissions advance; wrong answers start teaching",()=>{
  const errors=runtime.evaluate(`(() => {
    const errors=[];
    for(let i=0;i<lessons.length;i++) for(const q of getLessonQuestionBank(lessons[i])) {
      changeLesson("audit",i); const l=currentLesson(); activateLessonQuestion(l,q,0);
      evaluateQuestionBankAttempt(q.answer,"typed");
      if(!state.assessmentMode || state.remediationCheck) errors.push(q.id+": valid answer did not advance");
      changeLesson("audit",i); activateLessonQuestion(l,q,0);
      const wrong = /\\d/.test(q.answer) ? q.answer.replace(/\\d+/,n=>String(+n+101)) : q.choices?.find(c=>!LezhiAnswers.whole(c.text,q))?.text || (q.answer==="对" ? "错" : q.answer==="错" ? "对" : "99999");
      evaluateQuestionBankAttempt(wrong,"typed");
      const r=state.remediationCheck;
      if(!r || !r.checkPrompt || !r.explanation) errors.push(q.id+": no remedial teaching");
      else {
        const input=r.answerQuestion?.answer || r.answer;
        if(r.answerQuestion && !matchesWholeQuestionAnswer(input,r.answerQuestion,l)) errors.push(q.id+": invalid check answer");
        const before=r.id; evaluateRemediationCheck(input,"typed");
        if(state.remediationCheck?.id===before) errors.push(q.id+": remedial answer stuck");
      }
    }
    return errors;
  })()`);
  assert.deepEqual(Array.from(errors),[]);
});
check("all 42 lessons finish bounded independent practice",()=>{
  const errors=runtime.evaluate(`(() => {
    const errors=[];
    for(let i=0;i<lessons.length;i++) {
      changeLesson("audit",i);
      for(let turn=0;turn<6 && state.phase!=="summary";turn++) evaluateQuestionBankAttempt(currentLesson().activeQuestion.answer,"typed");
      if(state.teachingState!=="MASTERED") errors.push(lessons[i].id);
    }
    return errors;
  })()`);
  assert.deepEqual(Array.from(errors),[]);
});
check("natural numeric answers keep nouns optional without accepting different nouns",()=>{
  for(const [input,answer,expected] of [["五","5个苹果",true],["五个","5个苹果",true],["五个梨","5个苹果",false],["一共五个苹果","5个苹果",true],["二十人香蕉","20人，苹果",false],["二十人","20人，苹果",false],["是的","对",true]]) {
    assert.equal(runtime.evaluate(`LezhiAnswers.whole(${JSON.stringify(input)},{answer:${JSON.stringify(answer)}})`),expected,`${input}/${answer}`);
  }
});

check("uncertain ASR is checked without grading; clear wrong answers still reach teaching",()=>{
  const context={expectedType:"number",expectedAnswers:["20角"],prompt:"2元是几角？",lessonName:"人民币换算"};
  for(const [text,confidence,status] of [["二十角",.25,"confirm"],["二十脚",.25,"confirm"],["二十角",.95,"accept"],["九角",.95,"accept"],["今天天气不错",.95,"retry"],["嗯",.95,"retry"],["二十九",.95,"clarify"],["我不知道",.3,"accept"]]) {
    const result=runtime.evaluate(`assessVoiceTranscript(${JSON.stringify(text)},{confidence:${confidence}},${JSON.stringify(context)})`);
    assert.equal(result.status,status,text);
  }
  assert.equal(runtime.evaluate(`assessVoiceTranscript("右边",{confidence:.96},{expectedType:"choice",prompt:"哪边大？"}).status`),"accept");
});
check("old speech recognition cannot submit to a new lesson",()=>{
  assert.equal(runtime.evaluate(`(() => {const old=voiceGeneration;changeLesson("audit",defaultLessonIndex);const before=state.aiMessage;processVoiceTranscript("九角",{generation:old});return state.aiMessage===before;})()`),true);
});
check("physical units and number-place words are not confused with numerals",()=>{
  for(const [input,question,expected] of [["2300米",{prompt:"2千克300克是几克？",answer:"2300"},false],["二千克",{prompt:"2000克是几千克？",answer:"2"},true],["4个十8个一",{answer:"4，8"},true],["3小于5",{prompt:"3 □ 5",answer:"<"},true],["5大于3",{prompt:"3 □ 5",answer:"<"},false]]) assert.equal(runtime.evaluate(`LezhiAnswers.whole(${JSON.stringify(input)},${JSON.stringify(question)})`),expected,input);
});
check("every microstep rejects changed answers and binds its own follow-up question",()=>{
  const errors=runtime.evaluate(`(() => {
    const errors=[];
    for(const l of lessons)for(const q of getLessonQuestionBank(l)) {
      activateLessonQuestion(l,q,0);
      for(const p of createGuidedSteps(l)) {
        if(matchesWholeQuestionAnswer("99999",p.answerQuestion,l))errors.push(q.id+": wrong microstep accepted");
        const repair=createMicrostepExplanation(l,p,0);
        if(!repair.answerQuestion || !repair.checkPrompt || !repair.explanation)errors.push(q.id+": legacy remedial fallback "+p.label);
        if(repair.answerQuestion && !matchesWholeQuestionAnswer(repair.answerQuestion.answer,repair.answerQuestion,l))errors.push(q.id+": follow-up answer invalid "+p.label);
        if(/元|角|分/.test(q.prompt) && /苹果和梨|一一配对比较/.test(repair.explanation))errors.push(q.id+": unrelated comparison explanation");
      }
    }
    return errors;
  })()`);
  assert.deepEqual(Array.from(errors),[]);
});
check("learning history excludes recordings and separates assistance from independent work",()=>{
  runtime.evaluate('LezhiHistory.clear(); LezhiHistory.record({topic:"test",title:"test",passed:false,independent:1,assisted:2,transcript:"secret",audio:"secret",voice:{accepted:1,uncertain:2}})');
  const rows=runtime.evaluate('LezhiHistory.read()');
  assert.equal(rows.length,1);assert.equal(rows[0].outcome,"review");assert.equal(rows[0].assisted,2);
  assert.equal(JSON.stringify(rows).includes("secret"),false);
  assert.equal(runtime.evaluate('LezhiHistory.due().length'),1);
});

check("generated arithmetic follow-ups have independent results and stay in basic fact ranges",()=>{
  const cases=runtime.evaluate(`(() => {
    const cases=[];
    for(const l of lessons)for(const q of getLessonQuestionBank(l)) {
      activateLessonQuestion(l,q,0);
      for(const p of createGuidedSteps(l))for(let attempt=0;attempt<3;attempt++) {
        if(p.transferKind!=="arithmetic")continue;
        const c=createMicrostepExplanation(l,p,attempt);
        cases.push({id:q.id,original:p.transferData,question:c.answerQuestion});
      }
    }
    return cases;
  })()`);
  for(const {id,original,question} of cases) {
    const m=question.prompt.match(/^(\d+)([+\-×÷])(\d+)等于几/);
    assert.ok(m,id+": no arithmetic follow-up");
    const a=+m[1],b=+m[3],op=m[2];
    const result=op==="+" ? a+b : op==="-" ? a-b : op==="×" ? a*b : a/b;
    assert.equal(Number(question.answer),result,id);
    if(/^G1V1-U[12]/.test(id)) {
      const cap=id.startsWith("G1V1-U1") ? 5 : 10;
      assert.ok(Math.max(a,b,result)<=cap && result>=0,id+": out of grade range");
    }
    if(original.op==="×" && original.a<=9 && original.b<=9)assert.ok(a<=9 && b<=9,id+": outside multiplication table");
  }
});
check("visual hints expose relevant structure, not an unrelated fixed picture",()=>{
  const render=(family,prompt,mode="hint",answer="")=>runtime.evaluate(`LezhiQuestionVisuals.render({family:${JSON.stringify(family)},question:{prompt:${JSON.stringify(prompt)},answer:${JSON.stringify(answer)}},mode:${JSON.stringify(mode)}})`);
  assert.match(render("compare","左边3，右边5，哪边大？"),/math-pair-row/);
  assert.match(render("composition","把5分成2和几？"),/已分出 2/);
  assert.match(render("time","短针指着8，长针指向12。长针表示几分？"),/<svg/);
  assert.match(render("timeDuration","8:20开始，8:55结束，经过几分？"),/同一小时/);
  assert.match(render("timeDuration","8:40开始，9:10结束，经过几分？"),/下一个整时/);
  assert.notEqual(render("shape","正方体"),render("shape","长方体"));
  assert.match(render("measure","左端对着2厘米，右端对着7厘米，长多少厘米？"),/数间隔/);
});

if (failures.length) process.exitCode = 1;
console.log(`${checked-failures.length}/${checked} product regression checks passed`);
