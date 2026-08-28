import "./child-language.js";
import { allKnowledgeModules } from "./generated-curriculum.js";

const { naturalizeQuestion, toSpokenText } = globalThis.LezhiChildLanguage;

const checks = [
  [naturalizeQuestion("2元是（ ）角？"), "2元是几角？", "人民币填空应改成自然问句"],
  [naturalizeQuestion("3角等于（ ）分？"), "3角是几分？", "角分换算应改成自然问句"],
  [toSpokenText("20角-4角=（ ）角？"), "20角减4角是几角？", "带单位算式应口语化"],
  [toSpokenText("8+（ ）=10"), "8加几等于10", "未知数算式应口语化"],
  [toSpokenText("3 □ 5"), "3和5之间填什么符号", "比较题不得朗读空格符号"],
  [naturalizeQuestion("把5分成2和（ ）。"), "把5分成2和几。", "数的组成应改成可回答问句"],
];

const failures = checks.filter(([actual, expected]) => actual !== expected);

const spokenPromptFailures = [];
let auditedPromptCount = 0;

function auditPrompts(value, path = "root") {
  if (typeof value === "string") {
    if (!/(prompt|question|teach|repair|noResponse|returnPrompt|entry_question)/i.test(path)) return;
    auditedPromptCount += 1;
    const spoken = toSpokenText(value);
    if (/[（(]\s*[）)]|_{2,}|□/.test(spoken)) {
      spokenPromptFailures.push({ path, original: value, spoken });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => auditPrompts(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => auditPrompts(item, `${path}.${key}`));
  }
}

auditPrompts(allKnowledgeModules);

if (failures.length) {
  failures.forEach(([actual, expected, label]) => {
    console.error(`FAIL ${label}\n  expected: ${expected}\n  actual:   ${actual}`);
  });
  process.exit(1);
}

if (spokenPromptFailures.length) {
  spokenPromptFailures.slice(0, 20).forEach(({ path, original, spoken }) => {
    console.error(`FAIL 课程文案仍含不可朗读的纸面空格\n  path: ${path}\n  original: ${original}\n  spoken: ${spoken}`);
  });
  console.error(`Spoken prompt audit found ${spokenPromptFailures.length} unsafe prompts.`);
  process.exit(1);
}

console.log(`Spoken prompt audit passed: ${checks.length} representative forms and ${auditedPromptCount} curriculum prompts.`);
