import {readFileSync, writeFileSync} from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

// Authoring migration: diagrams are authored facts, never inferred from the answer at runtime.
const path=new URL("./grade1-2-question-bank.js",import.meta.url),context=vm.createContext({window:{}});
for(const file of ["answer-contract.js","grade1-2-question-bank.js"]) vm.runInContext(readFileSync(new URL(file,import.meta.url),"utf8"),context);
const bank=context.window.gradeOneTwoQuestionBank,answers=context.window.LezhiAnswers;
const angles={T:90,V01:45,V02:125,V04:65,V05:140,V07:90};
const views={T:"front",V01:"side",V02:"top",V04:"top",V05:"side",V07:"front",V08:"top"};
let count=0;
for(const point of bank.points) for(const q of [point.typicalQuestion,...point.questions]) {
  const variant=q.id.split("-").at(-1);
  if(point.id==="G2V1-U3-KP01" && angles[variant]) {
    q.visualModel={kind:"angle",degrees:angles[variant]};
    q.stem="图中的角是哪一种角？";
    q.explanation="把两个角的顶点和一条边对齐，再比较另一条边张开的大小。直角像课桌的角；张口比它小的是锐角，比它大的是钝角。边画得长短不决定角的大小。";
  } else if(point.id==="G2V1-U5-KP01" && views[variant]) {
    q.visualModel={kind:"observation",object:"door-box",view:views[variant]};
    q.stem="这是从小屋的哪个方向看到的？";
    q.explanation="先找小屋的门在哪一面。站在门前能看到门，换到窄窄的一侧就看不到门；从上方往下看，只看到屋顶。把看到的样子和这几个方向对一对。";
  } else continue;
  q.prompt=answers.choicePrompt(q.stem,q.choices);
  assert.equal(q.choices.filter(c=>answers.whole(c.text,q)).length,1,q.id);
  count++;
}
bank.version=6;
if(process.argv.includes("--write"))writeFileSync(path,`// User-provided curriculum; reviewed source data. See docs/v93-remediation-plan.md.\n(function () {\n  window.gradeOneTwoQuestionBank = ${JSON.stringify(bank)};\n})();\n`);
console.log(`${count} records (including duplicated typical records) reviewed; ${process.argv.includes("--write") ? "written" : "dry run"}.`);
