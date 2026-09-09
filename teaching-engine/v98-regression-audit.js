import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {loadChildRuntime} from "./runtime-test-harness.js";

const runtime=loadChildRuntime();
const result=runtime.evaluate(`(() => {
  speakCurrentMessage=()=>{prepareTeacherTurn();};
  const errors=[],topics=[];let interruptions=0,checks=0;
  const evidence=()=>JSON.stringify({passed:state.passedQuestionIds,steps:state.completedSteps,mastery:state.mastery,history:state.evidence});
  for(let i=0;i<lessons.length;i++) {
    changeLesson("audit",i);const lesson=currentLesson(),row={id:lesson.sourceQuestionBankId,steps:0,interruptions:0};topics.push(row);
    for(const question of getLessonQuestionBank(lesson)) {
      activateLessonQuestion(lesson,question);const count=createGuidedSteps(lesson).length;
      for(let j=0;j<count;j++) {
        row.steps++;
        for(const action of ["pause","redirect","identity","visual","sad","check-pause"]) {
          activateLessonQuestion(lesson,question);resumeCoaching();state.initialWholeQuestion=false;state.assessmentMode=false;state.completedSteps=j;state.phase="guiding";state.visualHelpActive=false;
          teachCurrentMicrostepAndRecheck(lesson,createGuidedStepPlan(lesson,j),"","typed","audit",0);
          if(action==="check-pause") advanceTeacherPart(true);
          const turn=state.teacherTurn,index=turn.index,before=evidence(),visible=createActiveVisualLesson(lesson).activeQuestion.prompt;
          if(action==="pause" || action==="check-pause") {
            handleChildInput("我想喝水","typed");
            if(!state.coach.paused || currentTeacherFrame())errors.push(question.id+": pause still speaking lecture");
          } else if(action==="visual") showCurrentStepVisual();
          else handleChildInput({redirect:"今天天气真好",identity:"老师你是谁",sad:"我太笨了"}[action],"typed");
          if(createActiveVisualLesson(lesson).activeQuestion.prompt!==visible)errors.push(question.id+": "+action+" changed diagram");
          if(action!=="visual" && evidence()!==before)errors.push(question.id+": "+action+" changed learning evidence");
          if(action!=="check-pause" && currentAnswerQuestion().prompt!==turn.exampleQuestion.prompt)errors.push(question.id+": unseen check became ASR context");
          if(action!=="check-pause") {
            const voice=createVoiceRecognitionContext();
            if(voice.prompt!==turn.exampleQuestion.prompt || !voice.expectedAnswers.includes(turn.exampleQuestion.answer))errors.push(question.id+": voice answer expectations leaked from future check");
          }
          if(action==="pause" || action==="check-pause" || action==="sad") handleChildInput("我准备好了","typed");
          else resumeTeacherTurn();
          if(state.teacherTurn!==turn || turn.index!==index || !currentTeacherFrame())errors.push(question.id+": "+action+" lost explanation position");
          if(action!=="check-pause")advanceTeacherPart(true);
          handleChildInput(state.remediationCheck.answer,"typed");
          if(state.remediationCheck)errors.push(question.id+": "+action+" correct check stuck");
          interruptions++;row.interruptions++;checks++;
        }
      }
    }
  }
  changeLesson("audit",defaultLessonIndex);handleChildInput("我不会","typed");handleChildInput("先休息","typed");
  state.typedDraft="还没说完";state.emptyInputNotice=true;
  handleChildInput("换一道简单的","typed");
  if(state.teacherTurn || state.typedDraft || state.emptyInputNotice || !isWholeQuestionTurn())errors.push("changed question retained stale lecture/draft");
  if(resumeTeacherTurn())errors.push("old lecture restored after changing question");
  return {topics,interruptions,checks,errors};
})()`);
assert.deepEqual(Array.from(result.errors),[]);
assert.equal(result.interruptions,668*6);
console.log(`PASS v98: ${result.interruptions} interruptions and resumed checks across every bound step; original diagram, ASR context, progress and question drafts`);

const played=[],settle=()=>new Promise(resolve=>setImmediate(resolve));
class AudioStub {
  async play(){played.push(this);this.onplay?.();}
  pause(){this.paused=true;}
  removeAttribute(){}
  load(){}
}
const audio=loadChildRuntime({audio:true,overrides:{Audio:AudioStub,fetch:async()=>({ok:true,json:async()=>({audioBase64:"test"})})}});
audio.evaluate('changeLesson("audit",defaultLessonIndex);handleChildInput("我不会","typed");');await settle();
const oldEnded=played.at(-1).onended;
audio.evaluate('handleChildInput("今天天气真好","typed")');await settle();
const asideEnded=played.at(-1).onended;
oldEnded();await settle();
assert.equal(audio.evaluate('state.teacherTurn.interrupted'),true,"stale audio must not resume the lecture");
asideEnded();await settle();
assert.equal(audio.evaluate('currentTeacherFrame().kind'),"explain");
assert.equal(audio.evaluate('state.teacherTurn.index'),0);
audio.evaluate('handleChildInput("我想喝水","typed")');await settle();
played.at(-1).onended();await settle();
assert.equal(audio.evaluate('state.coach.paused'),true);
assert.equal(audio.evaluate('currentTeacherFrame()'),null);
audio.evaluate('handleChildInput("我准备好了","typed")');await settle();
assert.equal(audio.evaluate('currentTeacherFrame().kind'),"explain");
audio.evaluate('handleChildInput("我太笨了","typed")');await settle();
played.at(-1).onended();await settle();
assert.equal(audio.evaluate('state.coach.choices'),true,"emotion choice must not automatically restart work");
audio.evaluate('changeLesson("audit",0)');await settle();
asideEnded();await settle();
assert.equal(audio.evaluate('state.teacherTurn'),null,"late aside cannot revive another topic");
audio.evaluate('stopTeacherSpeech()');
console.log("PASS v98: controlled playback aside/resume, stale completion, real pause and emotion choice boundaries");
mkdirSync(new URL("../output/coaching/",import.meta.url),{recursive:true});
writeFileSync(new URL("../output/coaching/v98-interruptions.json",import.meta.url),JSON.stringify(result,null,2)+"\n");
