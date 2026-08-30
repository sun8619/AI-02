import assert from "node:assert/strict";
import {EventEmitter} from "node:events";
import {loadChildRuntime} from "./runtime-test-harness.js";
import {readSpeechResponse} from "./speech-request-lifecycle.js";

const r=loadChildRuntime();
const choices=r.evaluate(`(() => {
  const errors=[];let questions=0,submissions=0;
  for(let i=0;i<lessons.length;i++) for(const q of getLessonQuestionBank(lessons[i])) {
    if(!q.choices.length) continue;
    questions++;
    const labels=q.choices.map(c=>c.label);
    if(labels.join("")!=="ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0,labels.length)) errors.push(q.id+": unordered labels");
    if(q.choices.filter(c=>LezhiAnswers.whole(c.text,q)).length!==1)errors.push(q.id+": not exactly one correct option");
    for(const choice of q.choices) for(const entry of [choice.label,choice.text,choice.label+". "+choice.text]) {
      changeLesson("audit",i);activateLessonQuestion(currentLesson(),q);
      const expected=LezhiAnswers.whole(choice.text,q);
      if(LezhiAnswers.whole(entry,q)!==expected)errors.push(q.id+": entry mismatch "+entry);
      handleChildInput(entry,"typed");submissions++;
      if(expected!==Boolean(state.assessmentMode && !state.remediationCheck))errors.push(q.id+": routing mismatch "+entry);
      const v=createActiveVisualLesson(currentLesson()),current=state.remediationCheck?.answerQuestion || currentLesson().activeQuestion;
      const buttons=renderAnswerChoices();
      for(const c of current.choices || []) if(!buttons.includes('data-choice-label="'+c.label+'"'))errors.push(q.id+": button missing "+c.label);
      if(inferActiveQuestionFamily(v)==="shape" && v.activeQuestion.choices?.length) for(const mode of ["question","hint"]) {
        const html=LezhiQuestionVisuals.render({question:v.activeQuestion,family:"shape",mode});
        if((html.match(/data-visual-choice=/g)||[]).length!==v.activeQuestion.choices.length)errors.push(q.id+": picture option count");
        for(const c of v.activeQuestion.choices) if(!html.includes('data-visual-choice="'+c.label+'"'))errors.push(q.id+": picture missing "+c.label);
      }
    }
  }
  return {questions,submissions,errors};
})()`);
assert.equal(choices.questions,26);
assert.deepEqual(Array.from(choices.errors),[]);
assert.equal(r.evaluate(`LezhiAnswers.choices("题目？A. 圆B. 三角形C. 正方形").length`),3);
assert.equal(r.evaluate(`LezhiAnswers.whole("C. 圆",{prompt:"题目？A. 圆B. 三角形C. 正方形",answer:"A. 圆"})`),false);
console.log(`PASS ${choices.questions} structured choice questions, ${choices.submissions} labeled/text input paths and consistent remedial pictures`);

const visual=r.evaluate(`(() => {
  const errors=[],hidden=[];let total=0,available=0;
  for(let i=0;i<lessons.length;i++) {changeLesson("audit",i);const l=currentLesson();
    for(const q of getLessonQuestionBank(l)) {
      activateLessonQuestion(l,q);state.initialWholeQuestion=false;state.remediationCheck=null;
      createGuidedSteps(l).forEach((p,index)=>{
        state.completedSteps=index;state.visualHelpActive=false;
        const v=createActiveVisualLesson(l),payload={question:v.activeQuestion,family:inferActiveQuestionFamily(v)};
        const help=LezhiQuestionVisuals.help(payload),normal=LezhiQuestionVisuals.render({...payload,mode:"question"}),hint=LezhiQuestionVisuals.render({...payload,mode:"hint"});total++;
        if(/NaN|undefined/.test(normal+hint))errors.push(q.id+": invalid visual");
        if(help) {
          available++;
          if(normal.replace(/data-mode="[^"]*"/g,"")===hint.replace(/data-mode="[^"]*"/g,""))errors.push(q.id+": state-only hint");
          if(!renderKidHelpButtons().includes('data-action="show-visual"'))errors.push(q.id+": missing useful hint");
          if(getVisualRevealMode(l)!=="question")errors.push(q.id+": hint already exposed without request");
        } else {
          hidden.push({id:q.id,step:p.label,prompt:p.prompt});
          if(renderKidHelpButtons().includes('data-action="show-visual"'))errors.push(q.id+": useless help still visible");
        }
      });
    }
  }
  return {total,available,hidden,errors};
})()`);
assert.deepEqual(Array.from(visual.errors),[]);
console.log(`PASS ${visual.total} bound steps: ${visual.available} hint contracts, ${visual.hidden.length} no-op entries hidden`);
if(process.argv.includes("--inventory"))console.log(JSON.stringify(visual.hidden,null,2));

const history=r.evaluate(`(() => {
  const day=86400000,now=Date.now(),base={topic:"t",title:"题",independent:3,assisted:0,voice:{accepted:1,uncertain:1},seconds:90};
  const rows=[{...base,at:now-10*day,outcome:"passed"},{...base,at:now-3*day,outcome:"review",assisted:3},{...base,at:now-day,outcome:"passed"},{...base,at:now-day+5000,outcome:"passed"}];
  const t=LezhiHistory.trends(rows)[0];
  return {delayed:t.delayedCount,passed:t.delayedPassed,status:t.status,voice:t.current.voice};
})()`);
assert.equal(history.delayed,2,"same-day repetition is not another delayed test");assert.equal(history.passed,1);assert.equal(history.status,"隔日复测通过");assert.equal(history.voice,50);
r.evaluate(`LezhiHistory.clear();changeLesson("audit",defaultLessonIndex);changeLesson("audit",0);`);
assert.equal(r.evaluate("LezhiHistory.read().length"),0,"entering a lesson is not a failed learning session");
r.evaluate(`LezhiHistory.record({topic:"a",title:"a",completed:false,passed:false});`);
assert.equal(r.evaluate("LezhiHistory.read()[0].outcome"),"incomplete");
console.log("PASS history: no phantom failures, unfinished sessions, delayed retests and honest voice metric");

let signal;
const response=new EventEmitter();
const waitForAbort=(_url,options)=>new Promise((resolve,reject)=>{signal=options.signal;signal.addEventListener("abort",()=>reject(Object.assign(new Error(),{name:"AbortError"})),{once:true});});
const closed=readSpeechResponse("test",{},response,{fetcher:waitForAbort});
response.emit("close");await assert.rejects(closed,{name:"AbortError"});assert.equal(signal.aborted,true);assert.equal(response.listenerCount("close"),0);
await assert.rejects(readSpeechResponse("test",{},response,{timeoutMs:10,fetcher:waitForAbort}),{code:"SPEECH_TIMEOUT"});
const result=await readSpeechResponse("test",{},response,{fetcher:async()=>({text:async()=>"audio"})});assert.equal(result.raw,"audio");assert.equal(response.listenerCount("close"),0);
await assert.rejects(readSpeechResponse("test",{},response,{timeoutMs:10,fetcher:async(_url,options)=>({text:()=>waitForAbort(_url,options)})}),{code:"SPEECH_TIMEOUT"});
assert.equal(response.listenerCount("close"),0);
console.log("PASS upstream synthesis: disconnect, fetch/body deadlines and listener cleanup");
