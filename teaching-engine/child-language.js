(function installLezhiChildLanguage(root) {
  const numberPattern = "[0-9一二两三四五六七八九十百千万]+";
  const unitPattern = "元|角|分|个|只|本|张|支|盒|辆|棵|朵|颗|块|厘米|米|时|分钟";
  const pairedBlankPattern = "(?:[（(]\\s*(?:_{1,}|□)?\\s*[）)]|_{2,})";

  function naturalizeQuestion(input, options = {}) {
    const forSpeech = Boolean(options.forSpeech);
    let text = String(input || "")
      .replace(/\s+/g, " ")
      .replace(/在口里/g, "在□里")
      .trim();
    if (!text) return "";

    text = text.replace(
      new RegExp(`(${numberPattern})\\s*(元|角|分)\\s*(?:是|等于|[=＝])\\s*(?:${pairedBlankPattern}|□)\\s*(元|角|分)`, "g"),
      "$1$2是几$3",
    );
    text = text.replace(
      new RegExp(`([0-9一二两三四五六七八九十百千万元角分+＋\\-－×xX*÷/\\s]+)\\s*[=＝]\\s*${pairedBlankPattern}\\s*(${unitPattern})`, "g"),
      (_, expression, unit) => `${expression.trim()}等于几${unit}`,
    );
    text = text.replace(
      new RegExp(`([=＝])\\s*${pairedBlankPattern}(?=\\s*(?:[？?。！，,]|$))`, "g"),
      "$1多少",
    );
    text = text.replace(new RegExp(`${pairedBlankPattern}(?=\\s*(?:${unitPattern}))`, "g"), "几");
    text = text.replace(new RegExp(pairedBlankPattern, "g"), "几");

    const spokenNumber = "[0-9一二两三四五六七八九十百千万几多少]+";
    const spokenQuantity = `${spokenNumber}(?:元|角|分|个|只|本|张|支|盒|辆|棵|朵|颗|块|厘米|米|时|分钟)?`;
    text = text
      .replace(new RegExp(`(${spokenQuantity})\\s*[+＋]\\s*(${spokenQuantity})`, "g"), "$1加$2")
      .replace(new RegExp(`(${spokenQuantity})\\s*[\\-－]\\s*(${spokenQuantity})`, "g"), "$1减$2")
      .replace(new RegExp(`(${spokenQuantity})\\s*[×xX*]\\s*(${spokenQuantity})`, "g"), "$1乘$2")
      .replace(new RegExp(`(${spokenQuantity})\\s*÷\\s*(${spokenQuantity})`, "g"), "$1除以$2");

    if (forSpeech) {
      text = text
        .replace(new RegExp(`(${numberPattern})\\s*□\\s*(${numberPattern})`, "g"), "$1和$2之间填什么符号")
        .replace(/[=＝]/g, "等于")
        .replace(/□/g, "空格");
    }

    return text.replace(/\s+/g, " ").trim();
  }

  function toSpokenText(input) {
    const prepared = String(input || "")
      .replace(/2\/3/g, "三分之二")
      .replace(/3\/4/g, "四分之三")
      .replace(/1\/2/g, "二分之一")
      .replace(/1\/3/g, "三分之一")
      .replace(/1\/4/g, "四分之一")
      .replace(/AI/g, "老师");
    return naturalizeQuestion(prepared, { forSpeech: true })
      .replace(/L1/g, "第一小步")
      .replace(/L2/g, "第二小步")
      .replace(/L3/g, "第三小步")
      .replace(/\s+/g, " ")
      .trim();
  }

  root.LezhiChildLanguage = Object.freeze({ naturalizeQuestion, toSpokenText });
})(globalThis);
