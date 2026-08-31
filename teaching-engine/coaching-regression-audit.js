import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {loadChildRuntime} from "./runtime-test-harness.js";

const r=loadChildRuntime();
const coverage=r.evaluate(`(() => {
  const errors=[],topics=[],samples=[];let questions=0,steps=0,explanations=0,maxSpeech=0,compositeAmounts=0;
  for(let index=0;index<lessons.length;index++) {
    changeLesson("audit",index);
    const lesson=currentLesson(),profile=LezhiCoach.profile(lesson),row={id:lesson.sourceQuestionBankId,title:lesson.node,questions:0,steps:0,forms:[]};
    if(!profile || profile.strategies.length!==3 || new Set(profile.strategies).size!==3)errors.push(row.id+": missing authored methods");
    const bank=getLessonQuestionBank(lesson),forms=new Set();
    for(const question of bank) {
      activateLessonQuestion(lesson,question);state.initialWholeQuestion=false;state.remediationCheck=null;
      questions++;row.questions++;forms.add(LezhiCoach.signature(question));
      const opening=LezhiCoach.task(lesson,coachQuestion(question),{},"start",LezhiAnswers.multipart(question)?.instruction || "");
      if(/undefined|NaN|_{2,}|[（(]\\s*[）)]/.test(opening))errors.push(question.id+": malformed opening");
      createGuidedSteps(lesson).forEach((_,stepIndex)=>{
        const plan=createGuidedStepPlan(lesson,stepIndex),versions=[];steps++;row.steps++;
        for(let attempt=0;attempt<3;attempt++) {
          const check=createMicrostepExplanation(lesson,plan,attempt),explanation=LezhiCoach.explanation(lesson,plan,attempt);
          const speech=LezhiCoach.repair(lesson,plan,check,attempt,{});explanations++;versions.push(explanation);maxSpeech=Math.max(maxSpeech,speech.length);
          if(!speech.endsWith(check.checkPrompt) || !/[？?]/.test(check.checkPrompt))errors.push(question.id+": ambiguous response target");
          if(/undefined|NaN|_{2,}|[（(]\\s*[）)]/.test(speech))errors.push(question.id+": malformed explanation");
          if(/只说[“「]\\d|跟我(?:读|说)|背下来|整题检验|小笨|粗心|真聪明|这么简单/.test(speech))errors.push(question.id+": unsuitable wording");
          if(check.answerQuestion && !LezhiAnswers.whole(check.answer,check.answerQuestion))errors.push(question.id+": remedial answer contract mismatch");
          const amount=plan.prompt.match(/^(\\d+)元(\\d+)角换成角是多少角/);
          if(attempt===1 && amount) {
            compositeAmounts++;
            if(!explanation.endsWith("合起来是"+(Number(amount[1])*10+Number(amount[2]))+"角。"))errors.push(question.id+": worked amount omitted original jiao");
          }
          if(attempt===0 && stepIndex===0)samples.push({topic:row.id,questionId:question.id,opening,explanation,check:check.checkPrompt});
        }
        if(new Set(versions).size<2)errors.push(question.id+": repeated explanations");
      });
    }
    row.forms=[...forms];topics.push(row);
    // A successful session should sample unseen forms, not march through the bank.
    let previous=bank[0],asked=[previous.id],types=new Set([LezhiCoach.signature(previous)]);
    for(let passed=1;passed<=3;passed++) {
      const next=LezhiCoach.select(bank,{asked,current:previous,passed,seed:123});
      if(!next || asked.includes(next.id))errors.push(row.id+": repeated or missing practice");
      else {asked.push(next.id);types.add(LezhiCoach.signature(next));previous=next;}
    }
    if(forms.size>1 && types.size<2)errors.push(row.id+": no representation variation");
  }
  return {topics,questions,steps,explanations,maxSpeech,compositeAmounts,samples,errors};
})()`);
assert.equal(coverage.topics.length,42);
assert.equal(coverage.questions,462);
assert.equal(coverage.compositeAmounts,5);
assert.deepEqual(Array.from(coverage.errors),[]);
console.log(`PASS authored coaching: 42 topics, ${coverage.questions} questions, ${coverage.steps} steps, ${coverage.explanations} bound explanations; longest full turn ${coverage.maxSpeech} characters`);

const paths=r.evaluate(`(() => {
  const errors=[];let turns=0;
  const evidence=()=>JSON.stringify({id:currentLesson().activeQuestion.id,steps:state.completedSteps,passed:state.passedQuestionIds,assisted:state.assistedQuestionIds,mastery:state.mastery,evidence:state.evidence,repair:state.remediationCheck});
  for(let index=0;index<lessons.length;index++) for(const channel of ["typed","voice"]) {
    changeLesson("audit",index);const before=evidence(),id=currentLesson().activeQuestion.id;
    const reply=text=>{if(channel==="voice")processVoiceTranscript(text,{confidence:.99,durationMs:1200,rms:.02,totalFrames:20,voicedRatio:.8});else handleChildInput(text,"typed");turns++;};
    for(const text of ["老师你是谁","学这个有什么用","我有点累了","今天的天气很好","我回来了","太无聊了"]) {
      reply(text);
      if(evidence()!==before)errors.push(id+": social input changed learning evidence: "+text);
      if(text==="我有点累了" && (!state.coach.paused || /[？?]/.test(state.aiMessage)))errors.push(id+": pause not respected");
      if(text==="我回来了" && (state.coach.paused || !state.aiMessage.includes(coachQuestion())))errors.push(id+": resume lost target");
      if(text==="太无聊了" && !state.coach.choices)errors.push(id+": no boredom choice");
    }
    reply("换一道简单的");
    if(currentLesson().activeQuestion.id===id || state.coach.choices || !isWholeQuestionTurn())errors.push(id+": change did not start an independent whole question");
    const messages=[];
    for(let i=0;i<6;i++){reply("我不会");messages.push(state.aiMessage);}
    if(state.teachingState!=="REVIEW_LATER" || !state.coach.choices || state.remediationCheck)errors.push(id+": endless repair after help limit");
    if(state.passedQuestionIds.length)errors.push(id+": helped answers counted as independent");
    if(new Set(messages.slice(0,3)).size<3)errors.push(id+": same help speech repeated");
  }
  return {turns,errors};
})()`);
assert.deepEqual(Array.from(paths.errors),[]);
console.log(`PASS ${paths.turns} typed/voice-router turns across all 42 topics: non-math safety, pause/resume, boredom choice and bounded repair`);

const transitions=r.evaluate(`(() => {
  const errors=[];let checked=0;
  for(let index=0;index<lessons.length;index++) {
    changeLesson("audit",index);const lesson=currentLesson();
    for(const question of getLessonQuestionBank(lesson)) {
      activateLessonQuestion(lesson,question);const count=createGuidedSteps(lesson).length;
      for(let step=0;step<count;step++) {
        activateLessonQuestion(lesson,question);state.initialWholeQuestion=false;state.assessmentMode=false;state.completedSteps=step;state.phase="guiding";
        teachCurrentMicrostepAndRecheck(lesson,createGuidedStepPlan(lesson,step),"","typed","audit",0);
        const check=state.remediationCheck.answerQuestion;
        if(question.visualModel && JSON.stringify(check.visualModel)===JSON.stringify(question.visualModel))errors.push(question.id+": picture did not change");
        if(question.visualModel && !check.visualModel)errors.push(question.id+": picture check lost model");
        handleChildInput(state.remediationCheck.answer,"typed");checked++;
        if(state.remediationCheck)errors.push(question.id+": correct remedial reply stuck");
      }
    }
  }
  return {checked,errors};
})()`);
assert.deepEqual(Array.from(transitions.errors),[]);
console.log(`PASS ${transitions.checked} correct remedial replies through the real input router, including changed visual models`);

const details=r.evaluate(`(() => {
  const errors=[];
  changeLesson("audit",16);
  for(const bad of ["我不会游泳","我不知道妈妈在哪里","二十角","不是十角"])if(LezhiCoach.intent(bad))errors.push("false intent: "+bad);
  processVoiceTranscript("我想喝水",{confidence:.99,rms:.0001,durationMs:1000});
  if(state.coach.paused)errors.push("weak voice executed command");
  handleChildInput("我想喝水","typed");state.coach.pauseStartedAt=Date.now()-60000;
  handleChildInput("我回来了","typed");if(state.coach.pausedMs<60000)errors.push("pause duration not accumulated");
  handleChildInput("先休息","typed");handleChildInput(currentLesson().activeQuestion.answer,"typed");
  if(state.coach.paused || !state.assessmentMode)errors.push("answer failed to resume");
  for(let i=0;i<12;i++)handleChildInput("换一道简单的","typed");
  if(!state.coach.paused || state.assessmentAskedQuestionIds.length>7)errors.push("unbounded skipped questions");

  changeLesson("audit",16);const visited=new Set([currentLesson().activeQuestion.id]);
  for(let i=0;i<6;i++) {
    const before=currentLesson().activeQuestion.id;
    state.assessmentAskedQuestionIds=[...visited];
    handleChildInput("换一道简单的","typed");visited.add(currentLesson().activeQuestion.id);
    if(currentLesson().activeQuestion.id===before || state.coach.paused)errors.push("duplicate history exhausted question limit early");
  }
  handleChildInput("换一道简单的","typed");
  if(visited.size!==7 || !state.coach.paused || new Set(state.coach.skipped).size!==state.coach.skipped.length)errors.push("question limit must count distinct questions");

  changeLesson("audit",16);
  for(let i=0;i<6;i++)handleChildInput("我不会","typed");
  const reviewed=currentLesson().activeQuestion.id;
  handleChildInput("先休息","typed");handleChildInput("我准备好了","typed");
  if(state.phase==="summary" || state.coach.paused || !isWholeQuestionTurn() || currentLesson().activeQuestion.id===reviewed)errors.push("resume returned to a closed review question");

  changeLesson("audit",16);activateLessonQuestion(currentLesson(),getLessonQuestionBank(currentLesson()).find(q=>q.id.endsWith("V03")));
  state.assessmentMode=true;state.initialWholeQuestion=false;state.phase="assessment";
  handleChildInput("一百分","typed");const pending=pendingMultipartPrompt();
  handleChildInput("先休息","typed");handleChildInput("我回来了","typed");
  if(pendingMultipartPrompt()!==pending || !state.aiMessage.includes(pending))errors.push("pause lost multipart slot");
  handleChildInput("十角","typed");if(!state.passedQuestionIds.includes("G1V2-U5-KP01-V03"))errors.push("multipart did not complete after pause");

  changeLesson("audit",19);handleChildInput("我不会","typed");
  if(!/一组/.test(state.aiMessage) || /图形.*多少/.test(coachQuestion()))errors.push("pattern still lacks grouping or asks numeric result");
  changeLesson("audit",0);handleChildInput("我不会","typed");if(/最高位/.test(state.aiMessage))errors.push("small quantity uses place-value jargon");
  for(const [prompt,result] of [["1元3角换成角是多少角？",13],["2元4角换成角是多少角？",24],["1元2角5分是多少分？",125]]) {
    const unit=prompt.endsWith("分？") ? "分" : "角";
    const speech=LezhiCoach.worked({prompt,answerQuestion:{answer:result+unit}},1);
    if(!speech.endsWith("合起来是"+result+unit+"。"))errors.push("composite amount lost smaller unit: "+prompt);
  }
  return errors;
})()`);
assert.deepEqual(Array.from(details),[]);
console.log("PASS edge cases: weak audio, false help keywords, paused time, skipped-question limit, direct resume, multipart preservation and age-appropriate wording");

const output=new URL("../output/coaching/",import.meta.url);mkdirSync(output,{recursive:true});
writeFileSync(new URL("v95-coverage.json",output),JSON.stringify({coverage,paths,transitions},null,2));
