import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {loadChildRuntime} from "./runtime-test-harness.js";

const r=loadChildRuntime();
const coverage=r.evaluate(`(() => {
  let steps=0,frames=0,max=0;const errors=[],topics=[];
  for(let i=0;i<lessons.length;i++) {
    changeLesson("audit",i);const lesson=currentLesson();
    const row={id:lesson.sourceQuestionBankId,title:lesson.node,curriculumLayers:lesson.knowledgeLayers.length,sourceSubsteps:lesson.substeps.length,questions:0,boundSteps:0,explanationVersions:0,maxSegmentChars:0};topics.push(row);
    for(const q of getLessonQuestionBank(lesson)) {
      row.questions++;
      activateLessonQuestion(lesson,q);
      createGuidedSteps(lesson).forEach((_,j)=>{
        const plan=createGuidedStepPlan(lesson,j);steps++;row.boundSteps++;
        for(let a=0;a<3;a++) {
          row.explanationVersions++;
          const repair=createMicrostepExplanation(lesson,plan,a),parts=LezhiCoach.repairParts(lesson,plan,repair,a);
          const lecture=parts.filter(p=>p.kind==="explain").map(p=>p.text).join("");
          const source=LezhiCoach.worked(plan,a)||LezhiCoach.explanation(lesson,plan,a);
          if(lecture.replace(/\\s/g,"")!==source.replace(/\\s/g,""))errors.push(q.id+": explanation lost content");
          if(!parts.filter(p=>p.kind==="check").map(p=>p.text).join("").replace(/\\s/g,"").endsWith(repair.checkPrompt.replace(/\\s/g,"")))errors.push(q.id+": missing answer target");
          if(parts[0].kind!=="explain" || parts.at(-1).kind!=="check")errors.push(q.id+": mixed teaching/check order");
          for(const part of parts){frames++;max=Math.max(max,part.text.length);row.maxSegmentChars=Math.max(row.maxSegmentChars,part.text.length);if(part.text.length>60)errors.push(q.id+": long segment "+part.text.length);}
        }
      });
    }
  }
  return {steps,frames,max,topics,errors};
})()`);
assert.deepEqual(Array.from(coverage.errors),[]);
assert.equal(coverage.steps,668);
assert.equal(coverage.topics.reduce((n,t)=>n+t.sourceSubsteps,0),294);
console.log(`PASS v97: ${coverage.steps} bound steps x 3 explanations, ${coverage.frames} intact segments, longest ${coverage.max} characters`);

const money=r.evaluate(`(() => {
  const cases=[["这题里有2元，2元是几角？",1],["先看3元。3元等于多少分？",1],["2元3角等于多少角？",2],["2元和2元一共是多少钱？",2],["有2元，另外2元，换成角是多少角？",2],["有2元，另有3角，换成角是多少角？",2]];
  return cases.map(([prompt,count])=>({prompt,count,actual:(LezhiQuestionVisuals.render({question:{prompt,answer:"20角"},family:"money",mode:"hint"}).match(/class="math-money-amount"/g)||[]).length}));
})()`);
for(const row of money)assert.equal(row.actual,row.count,row.prompt);
console.log("PASS v97: money conversion references do not duplicate a repeated premise; distinct additive amounts retained");

const routes=r.evaluate(`(() => {
  speakCurrentMessage=()=>{prepareTeacherTurn();};
  const errors=[];let checked=0;
  for(let i=0;i<lessons.length;i++) {
    changeLesson("audit",i);const lesson=currentLesson();
    for(const q of getLessonQuestionBank(lesson)) {
      activateLessonQuestion(lesson,q);const count=createGuidedSteps(lesson).length;
      for(let j=0;j<count;j++) {
        activateLessonQuestion(lesson,q);state.initialWholeQuestion=false;state.assessmentMode=false;state.completedSteps=j;state.phase="guiding";
        teachCurrentMicrostepAndRecheck(lesson,createGuidedStepPlan(lesson,j),"","typed","audit",0);
        if(currentTeacherFrame()?.kind!=="explain")errors.push(q.id+": lecture not presented");
        const visual=createActiveVisualLesson(lesson),family=state.teacherTurn.family;
        if(visual.activeQuestion.prompt!==state.teacherTurn.exampleQuestion.prompt)errors.push(q.id+": unrelated example");
        if(["time","data","measure"].includes(family)&&visual.activeQuestion.visualPrompt!==q.prompt)errors.push(q.id+": source visual context lost");
        if(!LezhiQuestionVisuals.render({question:visual.activeQuestion,family,mode:"hint"}))errors.push(q.id+": missing example visual");
        advanceTeacherPart(true);
        if(currentTeacherFrame()?.kind!=="check")errors.push(q.id+": check not reachable");
        handleChildInput(state.remediationCheck.answer,"typed");checked++;
        if(state.remediationCheck)errors.push(q.id+": segmented check did not advance");
      }
    }
  }
  return {checked,errors};
})()`);
assert.deepEqual(Array.from(routes.errors),[]);
assert.equal(routes.checked,668);
console.log("PASS v97: all 668 segmented lecture -> independent check -> correct reply routes, retaining time/table/ruler source context");

const played=[];
class TestAudio {
  async play(){played.push(this);this.onplay?.();}
  pause(){this.paused=true;}
  removeAttribute(){}
  load(){}
}
const live=loadChildRuntime({audio:true,overrides:{Audio:TestAudio,
  fetch:async()=>({ok:true,json:async()=>({audioBase64:"test",format:"mp3"})}),
}});
const settled=()=>new Promise(resolve=>setImmediate(resolve));
live.evaluate('changeLesson("audit",defaultLessonIndex);handleChildInput("我不会","typed");');
await settled();
assert.equal(live.evaluate('currentTeacherFrame().kind'),"explain");
assert.equal(live.evaluate('createActiveVisualLesson(currentLesson()).activeQuestion.prompt===state.teacherTurn.exampleQuestion.prompt'),true);
assert.equal(live.evaluate('currentPromptTelemetryKey()'),"");
const before=live.evaluate('state.teacherTurn.index');
const oldAudio=played.at(-1),oldEnded=oldAudio.onended;
oldAudio.onended();await settled();
assert.equal(live.evaluate('state.teacherTurn.index'),before+1);
oldEnded();await settled();
assert.equal(live.evaluate('state.teacherTurn.index'),before+1,"stale end must not advance again");
live.evaluate('advanceTeacherPart(true)');await settled();
assert.equal(live.evaluate('currentTeacherFrame().kind'),"check");
assert.equal(live.evaluate('createActiveVisualLesson(currentLesson()).activeQuestion.prompt===state.remediationCheck.answerQuestion.prompt'),true);
live.evaluate('handleChildInput(state.remediationCheck.answer,"typed")');await settled();
assert.equal(live.evaluate('Boolean(state.remediationCheck)'),false);

live.evaluate('changeLesson("audit",defaultLessonIndex);handleChildInput("我不会","typed");');await settled();
const interrupted=played.at(-1);
live.evaluate('handleChildInput("我想喝水","typed")');await settled();
const pausedMessage=live.evaluate('state.aiMessage');
interrupted.onended();await settled();
assert.equal(interrupted.paused,true);
assert.equal(live.evaluate('state.aiMessage'),pausedMessage);
assert.equal(live.evaluate('currentTeacherFrame()'),null,"pause must not resume the lecture");
live.evaluate('changeLesson("audit",0)');await settled();
interrupted.onended();await settled();
assert.equal(live.evaluate('state.teacherTurn'),null,"old lesson audio cannot restore a frame");
live.context.Audio=class extends TestAudio {async play(){throw Object.assign(new Error(),{name:"NotAllowedError"});}};
live.evaluate('changeLesson("audit",defaultLessonIndex);handleChildInput("我不会","typed");');await settled();
assert.equal(live.evaluate('currentTeacherFrame().kind'),"explain");
assert.equal(live.evaluate('renderTeacherTurnControls().includes("teacher-try")'),true);
live.evaluate('advanceTeacherPart(true)');await settled();
assert.equal(live.evaluate('currentTeacherFrame().kind'),"check","blocked audio must not block learning");
live.evaluate('stopTeacherSpeech()');
console.log("PASS v97: automatic speech segments, original example/check visuals, stale playback, pause, topic switch and autoplay-blocked manual continuation");
const output=new URL("../output/coaching/",import.meta.url);mkdirSync(output,{recursive:true});
writeFileSync(new URL("v97-coverage.json",output),JSON.stringify({release:"v97-20260907",coverage,segmentedCheckRoutes:routes.checked},null,2)+"\n");
