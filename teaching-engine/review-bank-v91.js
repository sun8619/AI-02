import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

// Mechanical, repeatable source-data migration; not a runtime patch layer.
const path = new URL("./grade1-2-question-bank.js", import.meta.url);
const context = vm.createContext({ window: {} });
vm.runInContext(readFileSync(path, "utf8"), context);
const bank = context.window.gradeOneTwoQuestionBank;
const revisions = {
  "G1V1-U1-KP01-V05": {prompt:"一排有5个小朋友，从左往右数，小明是第2个。小明前面有几个小朋友？",answer:"1",explanation:"第2个的前面只有第1个，所以有1个小朋友。"},
  "G1V1-U1-KP01-V06": {prompt:"看图数一数，图中一共有几个苹果？",answer:"5个",explanation:"按顺序一个一个数，共有5个苹果。",visualCount:5,hasVisualMarkup:false,visualMarkup:""},
  "G1V1-U1-KP01-V08": {prompt:"一排有5个小朋友，从左往右数，小明是第5个。小明前面有几个小朋友？",answer:"4",explanation:"第5个前面有第1、2、3、4个，一共有4个。"},
  "G1V1-U3-KP01-T": {prompt:"观察图形特征：整个表面都是弯曲的，没有平平的面，向各个方向都容易滚动。是哪种图形？A. 长方体 B. 正方体 C. 圆柱 D. 球",answer:"球",explanation:"球没有平平的面，可以朝各个方向滚；圆柱有两个平平的圆面，立起来可以放稳。"},
  "G1V1-U3-KP01-V03": { prompt: "判断对错：长方体和正方体平放在桌面上，都不容易滚动。", answer: "对", explanation: "它们与桌面接触的是平平的面，可以放稳；这里说的是在平桌面上自然滚动，不是用力翻动。" },
  "G1V1-U3-KP01-V04": { prompt: "一个立体图形有6个面，相对的面相同，长、宽、高不全相等。它是长方体还是正方体？", answer: "长方体", explanation: "有6个面，相对的面相同，但不是6个完全一样大的正方形，所以是长方体。" },
  "G1V2-U1-KP01-V02": { prompt: "把两个完全一样的等腰直角三角形，沿最长的边拼在一起，没有重叠或空隙。拼成什么图形？可填：正方形 / 长方形 / 三角形。", answer: "正方形", explanation: "最长的两条边拼在里面；外面留下4条一样长的边和4个直角，拼成正方形。" },
  "G1V2-U1-KP01-V08": { prompt: "把一个正方形沿对角线剪成两个三角形，再沿剪开的边拼回去。得到什么图形？可填：正方形 / 长方形 / 圆。", answer: "正方形", explanation: "两块沿原来的剪口拼回，恢复成原来的正方形。" },
  "G1V2-U4-KP02-V06": { prompt: "98颗珠子和10颗珠子相比，是多一些还是多得多？", answer: "多得多", explanation: "98接近100，而10很少，两者相差很大，用多得多来描述更合适。" },
  "G2V1-U5-KP01-V07": { prompt: "一间玩具小屋，门画在正面，两侧没有门。看到门时，你看到的是哪个方向？可填：正面 / 侧面 / 上面。", answer: "正面", explanation: "门是这间小屋正面的特征。看到门，就确定看的是正面，不是只凭宽窄猜方向。" },
  "G2V2-U9-KP01-V03": { prompt: "小兰、小青、小红三人比赛，名次不同。小兰是第三，小青是第一，那么第二是谁？", answer: "小红", explanation: "第一是小青，第三是小兰；剩下第二名，只能是小红。" },
  "G2V2-U9-KP01-V08": { prompt: "甲、乙、丙各做一种不同的值日工作：扫地、擦桌子、浇花。甲不扫地，乙擦桌子，那么谁扫地？", answer: "丙", explanation: "扫地的不是甲，乙已确定擦桌子，排除甲乙后只剩丙。" },
};
let count = 0;
const followUps={
  "G1V1-U1-KP01-V10":{prompt:"判断对错：2比4大。",answer:"错"},
  "G1V1-U2-KP03-V06":{prompt:"桌上有2本书，又放来3本，求现在有几本，可以用2加3吗？回答对或错。",answer:"对"},
  "G1V2-U2-KP02-V02":{prompt:"红花5朵，黄花3朵。求红花比黄花多几朵，可以算5减3吗？回答对或错。",answer:"对"},
  "G1V2-U4-KP01-V03":{prompt:"89后面的一个数是几？",answer:"90"},
  "G2V1-U2-KP02-V03":{prompt:"竖式计算36加7时，把7写在6的下面，对吗？",answer:"对"},
  "G2V1-U4-KP01-V03":{prompt:"判断对错：2加2加2可以写成3乘2。",answer:"对"},
  "G2V1-U6-KP01-V10":{prompt:"判断对错：求8乘8，可以用口诀八八六十四。",answer:"对"},
  "G2V2-U2-KP02-V10":{prompt:"判断对错：因为5乘8等于40，所以40除以5等于8。",answer:"对"},
  "G2V2-U3-KP01-V10":{prompt:"推拉窗沿直线向右移动，没有转动。这是平移还是旋转？",answer:"平移"},
};
for (const point of bank.points) {
  for (const q of [point.typicalQuestion, ...(point.questions || [])].filter(Boolean)) {
    const revision = revisions[q.id];
    if(followUps[q.id]) q.followUp=followUps[q.id];
    if (revision) { Object.assign(q, revision, { answerKeywords: [revision.answer] }); count++; }
    if (point.id === "G2V1-U7-KP01" && /时针刚过/.test(q.prompt)) {
      const m = String(q.answer).match(/^(\d+):(\d+)$/);
      if (m) {
        const hour = +m[1], minute = +m[2];
        q.prompt = `钟面上，短针${minute === 0 ? `正对${hour}` : `在${hour}和${hour === 12 ? 1 : hour + 1}之间`}，长针指向${minute / 5 || 12}。现在是几时几分？`;
        count++;
      }
    }
    if (point.id === "G2V2-U1-KP01" && /最喜欢的水果/.test(q.prompt)) {
      if (/跳绳|篮球/.test(q.prompt)) q.prompt = q.prompt.replace("水果", "运动");
      if (/语文/.test(q.prompt)) q.prompt = q.prompt.replace("水果", "课程");
    }
    if (point.id === "G1V2-U5-KP01") q.prompt = q.prompt.replace(/=\d+角/, "=____角");
    delete q.teachingFamily;
  }
}
bank.version = 4;
if (process.argv.includes("--write")) {
  writeFileSync(path, `// User-provided curriculum, reviewed source data. See docs/v91-remediation-plan.md.\n(function () {\n  window.gradeOneTwoQuestionBank = ${JSON.stringify(bank)};\n})();\n`);
}
console.log(`Reviewed ${count} source entries; ${process.argv.includes("--write") ? "written" : "dry run"}.`);
