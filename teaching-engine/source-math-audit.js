import assert from "node:assert/strict";
import vm from "node:vm";
import {loadChildRuntime} from "./runtime-test-harness.js";
const r=loadChildRuntime();
const questions=r.evaluate('lessons.flatMap(l=>getLessonQuestionBank(l))');
const checked=new Set(), failures=[];
function verify(q,actual,expected) {checked.add(q.id);try{assert.deepEqual(actual,expected);}catch{failures.push(`${q.id}: computed ${JSON.stringify(actual)} / key ${JSON.stringify(expected)}`);}}
for(const q of questions) {
  const prompt=String(q.prompt), answer=String(q.answer);
  const equation=prompt.match(/^(?:计算[：:]|口算[：:])?([\d+×÷()（）\s-]+)=_{2,}/);
  if(equation) {
    const expression=equation[1].replace(/×/g,"*").replace(/÷/g,"/").replace(/（/g,"(").replace(/）/g,")");
    if(/^[\d+*/()\s-]+$/.test(expression)) {
      if(answer.includes("……")) {
        const [a,b]=equation[1].split("÷").map(Number);
        verify(q,[Math.floor(a/b),a%b],answer.split("……").map(Number));
      } else verify(q,vm.runInNewContext(expression,{}, {timeout:50}),Number(answer));
    }
  }
  const compare=prompt.match(/(\d+)\s*□\s*(\d+)/);
  if(compare) verify(q,+compare[1] > +compare[2] ? ">" : +compare[1] < +compare[2] ? "<" : "=",answer);
  const composition=prompt.match(/把(\d+)分成(\d+)和/);
  if(composition) verify(q,+composition[1]-composition[2],Number(answer));
  const units={元:100,角:10,分:1,千克:1000,克:1,米:100,厘米:1};
  const conversion=prompt.match(/(?:填空[：:]\s*)?((?:\d+\s*(?:千克|厘米|元|角|分|米|克)\s*)+)(?:等于多少|=|是几)(千克|厘米|元|角|分|米|克)?/);
  if(conversion) {
    const total=[...conversion[1].matchAll(/(\d+)\s*(千克|厘米|元|角|分|米|克)/g)].reduce((s,m)=>s+(+m[1])*units[m[2]],0);
    const targets=conversion[2] ? [conversion[2]] : [...prompt.slice((conversion.index||0)+conversion[0].length).matchAll(/_{2,}(千克|厘米|元|角|分|米|克)/g)].map(m=>m[1]);
    const values=(answer.match(/\d+/g)||[]).map(Number);
    if(targets.length && targets.length===values.length) {
      if((prompt.match(/=/g)||[]).length>1) targets.forEach((unit,i)=>verify(q,total,values[i]*units[unit]));
      else verify(q,total,values.reduce((s,n,i)=>s+n*units[targets[i]],0));
    }
  }
}
console.log(`Independently recomputed ${checked.size}/${questions.length} source answer keys (arithmetic, comparisons, composition, conversions). Other semantic questions require teacher review, not a guessed quality score.`);
if(failures.length){console.error(failures.join("\n"));process.exitCode=1;}
