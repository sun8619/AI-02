(function attachQuestionFamilyGuard(root) {
  const chineseNumber = "0-9零一二三四五六七八九十百两";
  const explicitClockCue = /钟面|时针|分针|短针|长针|整时|半时|时刻|几点|几时|读钟|看钟|拨钟|认识时间/;
  const durationCue = /经过时间|经过了|用了多久|用时|多长时间|开始时间|结束时间|从.*到/;
  const hourMinutePattern = new RegExp(`[${chineseNumber}]+\\s*(?:时|点)(?:\\s*[${chineseNumber}]+\\s*分)?`);
  const minuteQuantityPattern = new RegExp(`[${chineseNumber}]+\\s*(?:分钟|分)`);

  function normalize(value) {
    return String(value || "").replace(/\s+/g, "");
  }

  function isClockTimeTeachingText(questionText = "", pointText = "") {
    const question = normalize(questionText);
    const point = normalize(pointText);
    const combined = `${question}${point}`;

    if (/元|角|人民币|纸币|硬币/.test(combined)) return false;
    if (explicitClockCue.test(combined)) return true;
    const hasTimeDomain = /时间|钟|时针|分针|时刻|整时|半时|几点|几时|分钟|小时/.test(combined);
    if (hasTimeDomain && hourMinutePattern.test(question)) return true;

    return hasTimeDomain && (durationCue.test(combined) || minuteQuantityPattern.test(question));
  }

  function detectSpecializedArithmeticFamily(promptText = "", detailText = "") {
    const rawPrompt = normalize(promptText);
    const prompt = rawPrompt
      .replace(/[＋﹢]/g, "+")
      .replace(/[－—–−﹣]/g, "-")
      .replace(/[×xX]/g, "*")
      .replace(/[÷]/g, "/");
    const detail = normalize(detailText);
    // Choice lists also use “/”. It is an arithmetic operator only when it is
    // between two numbers.
    const operators = [
      ...(rawPrompt.match(/[+＋\-－×xX*÷]/g) || []),
      ...(rawPrompt.match(/(?<=\d)\/(?=\d)/g) || []),
    ];

    if (operators.length >= 2 || /连加|连减|加减混合|混合运算|乘加|乘减|小括号/.test(prompt)) {
      return "mixedCalculation";
    }

    const match = prompt.match(/(\d+)\s*([+\-])\s*(\d+)/);
    if (match) {
      const left = Number(match[1]);
      const operator = match[2];
      const right = Number(match[3]);
      if (operator === "+" && left > 0 && right > 0 && left < 10 && right < 10 && left + right > 10) {
        return "makeTenAdd";
      }
      if (operator === "-" && left >= 11 && left <= 19 && right > left % 10 && right < 10) {
        return "breakTenSubtract";
      }
    }

    if (/凑十|进位加法|先凑成10/.test(`${prompt}${detail}`)) return "makeTenAdd";
    if (/破十|退位减法|借十|十几减/.test(`${prompt}${detail}`)) return "breakTenSubtract";
    return "";
  }

  function detectConcreteOperationFamily(promptText = "") {
    const prompt = normalize(promptText);
    const hasAdditionCue = /又得到|又来|又有|又放|又添|增加|运来|开来|合起来|加起来|现在一共|一共有多少|共(?:有)?多少/.test(prompt);
    const hasSubtractionCue = /拿走|飞走|用去|卖出|卖掉|开走|吃掉|借出|去掉|少了|还剩|剩下/.test(prompt);

    // A multi-action story needs the general application path. Returning a
    // concrete family only when one relation is unambiguous keeps hints and
    // visuals from borrowing the opposite operation.
    if (hasAdditionCue && !hasSubtractionCue) return "concreteAddition";
    if (hasSubtractionCue && !hasAdditionCue) return "concreteSubtraction";
    return "";
  }

  root.LezhiQuestionFamilyGuard = Object.freeze({
    isClockTimeTeachingText,
    detectSpecializedArithmeticFamily,
    detectConcreteOperationFamily,
  });
})(globalThis);
