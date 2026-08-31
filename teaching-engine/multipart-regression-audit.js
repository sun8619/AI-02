import assert from "node:assert/strict";
import {loadChildRuntime} from "./runtime-test-harness.js";

const r = loadChildRuntime();
const coverage = r.evaluate(`(() => {
  const failures=[];let questions=0,turns=0;
  for (const [index,lesson] of lessons.entries()) for (const question of getLessonQuestionBank(lesson)) {
    if(!/[,，、…]/.test(question.answer)) continue;
    const contract=LezhiAnswers.multipart(question);questions++;
    if(!contract) {failures.push(question.id+": missing multipart contract");continue;}
    if(/_{2,}|[（(]\\s*[）)]/.test(childFacingPrompt(question.prompt))) failures.push(question.id+": unspoken blank");
    if(!LezhiAnswers.whole(question.answer,question)) failures.push(question.id+": source rejected");
    const wrong=contract.slots.map(s=>s.expected).join("，").replace(/\\d+/,n=>String(Number(n)+1));
    if(LezhiAnswers.whole(wrong,question)) failures.push(question.id+": changed value accepted");
    for(const channel of ["typed","voice"]) {
      changeLesson("audit",index);activateLessonQuestion(currentLesson(),question);
      state.initialWholeQuestion=false;state.assessmentMode=true;state.phase="assessment";state.assessmentTargetCount=3;
      const before=JSON.stringify({passed:state.passedQuestionIds,assisted:state.assistedQuestionIds,evidence:state.evidence,repair:state.remediationCheck});
      for(const [i,slot] of contract.slots.entries()) {
        if(channel==="voice")processVoiceTranscript(slot.expected,{confidence:.99});
        else handleChildInput(slot.expected,"typed");
        turns++;
        if(i<contract.slots.length-1) {
          if(currentLesson().activeQuestion.id!==question.id)failures.push(question.id+": advanced on partial");
          if(!pendingMultipartPrompt().includes("？"))failures.push(question.id+": missing follow-up question");
          const after=JSON.stringify({passed:state.passedQuestionIds,assisted:state.assistedQuestionIds,evidence:state.evidence,repair:state.remediationCheck});
          if(before!==after)failures.push(question.id+": partial reply graded");
        }
      }
      if(!state.passedQuestionIds.includes(question.id))failures.push(question.id+": "+channel+" did not advance");
      if(state.multipartAnswer)failures.push(question.id+": partial state survived completion");
    }
  }
  return {questions,turns,failures};
})()`);
assert.deepEqual(Array.from(coverage.failures),[]);
assert.equal(coverage.questions,57);
console.log(`PASS multipart: ${coverage.questions} source questions, ${coverage.turns} typed/voice-router replies; partials neither graded nor counted as mastery`);

r.evaluate(`function multipartFixture(){changeLesson("audit",16);activateLessonQuestion(currentLesson(),getLessonQuestionBank(currentLesson()).find(q=>q.id.endsWith("V03")));state.initialWholeQuestion=false;state.assessmentMode=true;state.phase="assessment";state.assessmentTargetCount=3;}`);
r.evaluate("multipartFixture()");
for(const text of ["十角一百分","十角等于一百分","一元等于十角等于一百分","一元是十角，一元是一百分","一百分，十角","10 100"]) {
  r.context.reply=text;
  assert.equal(r.evaluate("LezhiAnswers.whole(reply,currentAnswerQuestion())"),true,text);
}
for(const text of ["100角10分","10元100分","十角九十分","一百分","一元","不是十角一百分","十角还是一百分","十角一百分还有20分","二元等于十角等于一百分"]) {
  r.context.reply=text;
  assert.equal(r.evaluate("LezhiAnswers.whole(reply,currentAnswerQuestion())"),false,text);
}
r.evaluate('processVoiceTranscript("一百分",{confidence:.99})');
assert.equal(r.evaluate("pendingMultipartPrompt()"),"1元是几角？");
assert.equal(r.evaluate("createVoiceRecognitionContext().prompt"),"1元是几角？");
assert.ok(r.html().includes("又等于多少分"),"original full question remains visible");
assert.ok(!r.html().includes("这次只说：几分"));
r.evaluate('processVoiceTranscript("一百分",{confidence:.99});handleChildInput("今天天气很好","typed")');
assert.equal(r.evaluate("pendingMultipartPrompt()"),"1元是几角？");
assert.ok(!r.evaluate("state.aiMessage").includes("请分别"),"do not ask for already collected results after an unrelated reply");
r.evaluate('processVoiceTranscript("今天天气很好",{confidence:.99})');
assert.ok(!r.evaluate("state.aiMessage").includes("请分别"));
assert.ok(r.evaluate("state.aiMessage").includes("只补这一项"));
r.evaluate('processVoiceTranscript("十角",{confidence:.99})');
assert.ok(r.evaluate('state.passedQuestionIds.includes("G1V2-U5-KP01-V03")'));
r.evaluate('multipartFixture();handleChildInput("十角","typed");processVoiceTranscript("九十分",{confidence:.99})');
assert.equal(r.evaluate("state.passedQuestionIds.length"),0);
assert.ok(r.evaluate("Boolean(state.remediationCheck)"),"clear wrong answer starts teaching");
assert.equal(r.evaluate("state.multipartAnswer"),null);
r.evaluate('multipartFixture();handleChildInput("十角","typed");changeLesson("audit",1)');
assert.equal(r.evaluate("state.multipartAnswer"),null);
r.evaluate('multipartFixture();handleChildInput("一百分","typed");activateLessonQuestion(currentLesson(),currentLesson().activeQuestion)');
assert.equal(r.evaluate("state.multipartAnswer"),null,"even restarting same question clears collected replies");
console.log("PASS money: natural sentences, both answer orders, wrong units, negation, duplicate replies, irrelevant speech, wrong-answer repair and context reset");

const sentences = [
  ["G1V1-U1-KP02-V06", "二加三等于五，五减二等于三"],
  ["G1V1-U4-KP01-T", "十六里面有一个十和六个一"],
  ["G1V1-U4-KP02-T", "十九大，十四小"],
  ["G2V1-U3-KP01-V10", "一个角有一个顶点和两条边"],
  ["G2V1-U4-KP01-T", "四乘三等于十二"],
  ["G2V2-U6-KP01-T", "十七除以五等于三余二"],
  ["G2V2-U7-KP01-T", "四千零五十里面有四个千零个百五个十零个一"],
  ["G2V2-U8-KP01-V10", "两千五百克等于两千克五百克"],
  ["G1V2-U3-KP01-T", "红球更多，多两个"],
  ["G2V2-U1-KP01-T", "苹果最多，一共二十人"],
  ["G2V2-U6-KP02-V01", "还剩两米，五段"],
];
for (const [id, text] of sentences) {
  r.context.caseId=id;r.context.reply=text;
  assert.equal(r.evaluate("LezhiAnswers.whole(reply,lessons.flatMap(getLessonQuestionBank).find(q=>q.id===caseId))"),true,text);
}
console.log("PASS natural multipart sentences across composition, place value, comparison, geometry, multiplication, remainders and mass");
