import {readFileSync, writeFileSync} from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

// Authoring migration, not a second runtime source of question data.
const path=new URL("./grade1-2-question-bank.js",import.meta.url);
const context=vm.createContext({window:{}});
for(const file of ["answer-contract.js","grade1-2-question-bank.js"]) vm.runInContext(readFileSync(new URL(file,import.meta.url),"utf8"),context);
const bank=context.window.gradeOneTwoQuestionBank, answers=context.window.LezhiAnswers;
const ids=new Set();
for(const point of bank.points) for(const q of [point.typicalQuestion,...point.questions]) {
  const choices=answers.choices(q);
  if(!choices.length) continue;
  q.stem=q.stem || q.prompt.replace(/[A-D][.．、][\s\S]*$/,"").replace(/可填：[\s\S]*$/,"").trim();
  q.choices=choices;
  q.prompt=answers.choicePrompt(q.stem,choices);
  assert.equal(new Set(choices.map(c=>c.label)).size,choices.length,q.id);
  assert.equal(choices.filter(c=>answers.whole(c.text,q)).length,1,q.id);
  ids.add(q.id);
}
bank.version=5;
if(process.argv.includes("--write")) writeFileSync(path,`// User-provided curriculum; reviewed source data. See docs/v92-remediation-plan.md.\n(function () {\n  window.gradeOneTwoQuestionBank = ${JSON.stringify(bank)};\n})();\n`);
console.log(`${ids.size} choice questions checked; ${process.argv.includes("--write") ? "written" : "dry run"}.`);
