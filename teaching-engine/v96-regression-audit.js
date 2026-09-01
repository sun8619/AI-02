import assert from "node:assert/strict";
import {loadChildRuntime} from "./runtime-test-harness.js";

const runtime=loadChildRuntime();

const history=runtime.evaluate(`(() => {
  changeLesson("audit",defaultLessonIndex);LezhiHistory.clear();
  state.sessionId="active-session";state.sessionStartedAt=Date.now()-301000;state.lastStudentText="二十九";state.responseTimesMs=[4000,6000];state.historyRecorded=false;
  saveLearningSession(false);
  const first=LezhiHistory.read();
  state.passedQuestionIds=[currentLesson().activeQuestion.id];state.teachingState="MASTERED";state.phase="summary";
  saveLearningSession(true);
  const final=LezhiHistory.read();
  return {first,final,html:renderLearningHistory()};
})()`);
assert.equal(history.first.length,1,"active session must be visible before lesson completion");
assert.ok(history.first[0].seconds>=300,"active duration must use the elapsed session time");
assert.equal(history.final.length,1,"same session must update instead of creating duplicates");
assert.equal(history.final[0].outcome,"passed");
assert.match(history.html,/今天 5分/);
assert.match(history.html,/平均响应5秒/);
assert.match(history.html,/42个知识点状态/);
console.log("PASS v96 history: active duration is visible and the completed session upserts in place");

const coaching=runtime.evaluate(`(() => {
  const errors=[];
  for(const [channel,submit] of [
    ["typed",text=>handleChildInput(text,"typed")],
    ["voice",text=>processVoiceTranscript(text,{confidence:.99,durationMs:1200,rms:.02,totalFrames:20,voicedRatio:.8})],
  ]) for(const [index,text] of ["我太笨了","我怎么总错","我生气了","我讨厌你"].entries()) {
    changeLesson("audit",index);const before=JSON.stringify({passed:state.passedQuestionIds,assisted:state.assistedQuestionIds,evidence:state.evidence,step:state.completedSteps,mastery:state.mastery});
    submit(text);
    const after=JSON.stringify({passed:state.passedQuestionIds,assisted:state.assistedQuestionIds,evidence:state.evidence,step:state.completedSteps,mastery:state.mastery});
    if(before!==after)errors.push(channel+":"+text+": changed learning evidence");
    if(!state.coach.choices)errors.push(channel+":"+text+": no child-safe choice");
    if(!/换一道简单的|先休息/.test(state.aiMessage))errors.push(channel+":"+text+": response does not release pressure");
  }

  changeLesson("audit",defaultLessonIndex);let d=coachMemory().difficulty;
  const first=currentLesson().activeQuestion.id;noteDifficulty("success");
  activateLessonQuestion(currentLesson(),getAssessmentQuestionCandidates(currentLesson()).find(q=>q.id!==first));noteDifficulty("success");
  if(d.level!==1 || d.changes.length!==1)errors.push("two independent answers did not raise one level");
  const third=getAssessmentQuestionCandidates(currentLesson()).find(q=>!d.lastAdjustmentKey.endsWith(q.id));activateLessonQuestion(currentLesson(),third);noteDifficulty("wrong");noteDifficulty("wrong");
  if(d.level!==0 || d.changes.length!==2)errors.push("wrong answer did not lower exactly one level");

  const easy={id:"easy",prompt:"计算：1+1",answer:"2"},hard={id:"hard",prompt:"计算：123+456+789+100",answer:"1468"};
  if(LezhiCoach.select([hard,easy],{passed:1,level:-2,seed:1}).id!=="easy")errors.push("low level did not prefer simple question");
  if(LezhiCoach.select([hard,easy],{passed:1,level:2,seed:1}).id!=="hard")errors.push("high level did not prefer complex question");
  return errors;
})()`);
assert.deepEqual(Array.from(coaching),[]);
console.log("PASS v96 coaching: negative emotion is safe and difficulty changes are bounded, explicit and testable");

const counts=runtime.evaluate(`(() => {
  let effective=0;for(const lesson of lessons)for(const question of getLessonQuestionBank(lesson)){activateLessonQuestion(lesson,question);effective+=createGuidedSteps(lesson).length;}
  return {topics:lessons.length,skeleton:lessons.reduce((sum,lesson)=>sum+(lesson.knowledgeLayers?.length || 0),0),questions:lessons.reduce((sum,lesson)=>sum+getLessonQuestionBank(lesson).length,0),effective};
})()`);
assert.equal(counts.topics,42);assert.equal(counts.skeleton,210);assert.equal(counts.questions,462);assert.equal(counts.effective,668);
console.log("PASS v96 definitions: 42 topics, 210 curriculum nodes, 462 questions and 668 question-bound steps");
