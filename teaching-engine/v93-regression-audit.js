import assert from "node:assert/strict";
import {loadChildRuntime} from "./runtime-test-harness.js";

const r=loadChildRuntime();
const nonAnswers=[
  "今天天气很好","外面下雨了","妈妈在哪里","爸爸回来了","我想去公园","我想吃饭","我肚子饿了","我要喝水","我有点累了","我想睡觉",
  "我的书包呢","小猫真可爱","我要看动画片","这是什么声音","门铃响了","等一下妈妈","我有一个妹妹","今天星期天","我七岁了","我喜欢蓝色",
  "老师你几岁","我家有三个人","我有十个玩具","二十个小朋友在玩","我的狗跑了","明天要下雨","我不喜欢下雨","我会唱歌","我的名字叫笑笑","妈妈叫我了",
  "我想听音乐","我去拿水杯","刚才有人敲门","今天太阳很大","妹妹好小呀","我的声音很小","我喜欢大海","这是我的手机","手机快没电了","我说了一句话",
  "我不会游泳","不知道妈妈在哪","我的下一个生日","电视上有提示","一二三麦克风","声音太小了","嗯","啊","这个","那个","我觉得","因为","所以","答案是","多少","几角",
];
r.context.auditNonAnswers=nonAnswers;
const inputs=r.evaluate(`(() => {
  const errors=[];let contracts=0,classifications=0,protectedTurns=0;
  const snapshot=()=>JSON.stringify({id:currentLesson().activeQuestion.id,phase:state.phase,steps:state.completedSteps,mastery:state.mastery,teaching:state.teachingState,help:state.visualHelpActive,repair:state.remediationCheck,evidence:state.evidence,passed:state.passedQuestionIds,assisted:state.assistedQuestionIds,parents:state.parentSignals,last:state.lastStudentText});
  const check=(q,tag)=>{
    contracts++;
    for(const text of auditNonAnswers) {
      classifications++;
      if(LezhiAnswers.classify(text,q).kind==="answer") errors.push(q.id+": irrelevant classified as answer: "+text);
      if(assessVoiceTranscript(text,{confidence:.98},{answerQuestion:q,prompt:q.prompt,expectedType:"open",expectedAnswers:[q.answer]}).status==="accept")errors.push(q.id+": irrelevant voice accepted: "+text);
    }
    if(LezhiAnswers.classify(q.answer,q).kind!=="answer")errors.push(q.id+": valid answer rejected");
    for(const text of ["今天天气很好","我不会游泳","我家有三个人","因为"]) {
      const before=snapshot();handleChildInput(text,"typed");protectedTurns++;
      if(before!==snapshot())errors.push(tag+": keyboard changed learning: "+text);
      processVoiceTranscript(text,{confidence:.98});protectedTurns++;
      if(before!==snapshot())errors.push(tag+": voice changed learning: "+text);
      evaluateLocally(text,"typed");protectedTurns++;
      if(before!==snapshot())errors.push(tag+": evaluator changed learning: "+text);
    }
  };
  for(let i=0;i<lessons.length;i++) for(const q of getLessonQuestionBank(lessons[i])) {
    changeLesson("audit",i);const l=currentLesson();activateLessonQuestion(l,q);check(currentAnswerQuestion(),q.id+":whole");
    state.initialWholeQuestion=false;state.assessmentMode=true;state.phase="assessment";check(currentAnswerQuestion(),q.id+":assessment");
    state.assessmentMode=false;state.phase="guiding";
    for(const [index,p] of createGuidedSteps(l).entries()) {
      state.completedSteps=index;state.remediationCheck=null;state.visualHelpActive=true;
      check(currentAnswerQuestion(),q.id+":step"+index);
    }
    state.completedSteps=0;state.visualHelpActive=false;
    teachCurrentMicrostepAndRecheck(l,createGuidedStepPlan(l,0),"老师讲这一步。","typed","请求讲解");
    if(!state.remediationCheck)errors.push(q.id+": no repair fixture");
    else check(currentAnswerQuestion(),q.id+":repair");
  }
  return {contracts,classifications,protectedTurns,errors:errors.slice(0,100)};
})()`);
assert.deepEqual(Array.from(inputs.errors),[]);
console.log(`PASS v93 input contract: ${nonAnswers.length} unrelated/partial phrases, ${inputs.contracts} active contracts, ${inputs.classifications} classifications in BOTH channels; ${inputs.protectedTurns} protected live-router turns`);

const choices=r.evaluate(`(() => {
  const errors=[];let count=0;
  const degrees={T:90,V01:45,V02:125,V04:65,V05:140,V07:90},views={T:"front",V01:"side",V02:"top",V04:"top",V05:"side",V07:"front",V08:"top"};
  for(const l of lessons)for(const q of getLessonQuestionBank(l)) {
    if(!q.visualModel)continue;count++;
    const family=inferActiveQuestionFamily(l,q),variant=q.id.split("-").at(-1);
    if(family==="angle" && q.visualModel.degrees!==degrees[variant])errors.push(q.id+": wrong angle");
    if(family==="observation" && q.visualModel.view!==views[variant])errors.push(q.id+": wrong view");
    const expected=family==="angle" ? q.visualModel.degrees===90 ? "直角" : q.visualModel.degrees<90 ? "锐角" : "钝角" : {front:"正面",side:"侧面",top:"上面"}[q.visualModel.view];
    if(q.answer!==expected)errors.push(q.id+": source answer disagrees with drawing");
    for(const mode of ["question","hint"]) {
      const html=LezhiQuestionVisuals.render({question:q,family,mode});
      if((html.match(/data-visual-choice=/g)||[]).length!==q.choices.length)errors.push(q.id+": missing choices");
      if(/undefined|NaN|is-correct/.test(html))errors.push(q.id+": invalid or answer-revealing figure");
      for(const choice of q.choices)if(!html.includes('data-visual-choice="'+choice.label+'"'))errors.push(q.id+": missing label");
    }
  }
  return {count,errors};
})()`);
assert.equal(choices.count,13);assert.deepEqual(Array.from(choices.errors),[]);
console.log("PASS v93 visual models: 13 source-grounded candidate diagrams, independently checked angles/views and no answer highlighting");

r.evaluate(`changeLesson("audit",defaultLessonIndex);LezhiHistory.clear();handleChildInput("今天天气很好","typed");processVoiceTranscript("我不会游泳",{confidence:.99});changeLesson("audit",1);`);
assert.equal(r.evaluate("LezhiHistory.read().length"),0,"chatter-only visit is not a failed learning session");
r.evaluate(`for(let i=0;i<10;i++)LezhiHistory.record({topic:"fixture",title:"fixture",seconds:20,completed:false});`);
assert.equal(r.evaluate("LezhiHistory.summary(7).seconds"),200);
assert.equal(r.evaluate("LezhiHistory.duration(LezhiHistory.summary(7).seconds)"),"3分20秒");
assert.equal(r.evaluate("LezhiHistory.duration(20)"),"20秒");assert.equal(r.evaluate("LezhiHistory.duration(.3)"),"少于1秒");
r.evaluate("LezhiHistory.clear()");
console.log("PASS v93 history: no chatter-only evidence, seconds accumulated before display, sub-minute duration retained");
