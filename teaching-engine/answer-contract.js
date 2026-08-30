(function (root) {
  const digits = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  function number(token) {
    if (/^\d+$/.test(token)) return Number(token);
    if (!/[十百千万]/.test(token)) return Number([...token].map(c => digits[c]).join(""));
    let total = 0, current = 0;
    for (const c of token) {
      if (Object.hasOwn(digits, c)) current = digits[c];
      else if (c === "万") { total = (total + current) * 10000; current = 0; }
      else { total += (current || 1) * ({ 十: 10, 百: 100, 千: 1000 }[c]); current = 0; }
    }
    return total + current;
  }
  function clean(value) {
    return String(value || "").trim().toLowerCase()
      .replace(/^(?:一共有|一共|总共|共有|共|我觉得|我认为|答案是|应该是|就是|还剩|剩下|有|是(?!的))/, "")
      .replace(/乘以|乘/g, "×").replace(/除以|除/g, "÷").replace(/加/g, "+").replace(/减/g, "-")
      .replace(/等于/g, "=").replace(/大于号?|大鱼号?/g, ">").replace(/小于号?|小鱼号?/g, "<").replace(/等号/g, "=")
      .replace(/([零一二两三四五六七八九十百千万]+)千克/g, (_,amount)=>`${number(amount)}千克`)
      .replace(/[零一二两三四五六七八九十百千万]+/g, (token, offset, source) => /角形|边形/.test(source.slice(offset + token.length, offset + token.length + 2)) || (token === "千" && source[offset+1] === "克") || (source[offset-1] === "个" && /^[一十百千]$/.test(token)) ? token : String(number(token)))
      .replace(/^(?:我觉得|我认为|我选|选|答案是|应该是|就是|是(?!的))/, "")
      .replace(/，|、/g, ",")
      .replace(/[\s。.!！?？“”"：:]/g, "");
  }
  function canonical(value) {
    const text = clean(value);
    const synonyms = { 正确: "对", 是的: "对", 没错: "对", 不对: "错", 错误: "错", 不正确: "错", 错了: "错", 不够减: "不够", 不能直接减: "不够", 够减: "够", 可以直接减: "够", 圆形: "圆", 正方形的: "正方形", 三角形的: "三角形", 左: "左边", 右: "右边", 左边大: "左边", 右边大: "右边", 左边多: "左边", 右边多: "右边" };
    return synonyms[text] || text;
  }
  function choices(question) {
    if (Array.isArray(question?.choices)) return question.choices.map(({label,text}) => ({label:String(label),text:String(text)}));
    const text = String(question?.prompt ?? question ?? "");
    // Legacy/generated prompts only. Authored questions store choices explicitly.
    const labeled = [...text.matchAll(/([A-D])[.．、]\s*(.*?)(?=[A-D][.．、]|$)/gs)];
    if (labeled.length) return labeled.map(m => ({ label: m[1], text: m[2].trim().replace(/[。；]$/, "") }));
    const list = text.match(/(?:可填：|请在[“"])(.*?)(?:[”"]中|。|$)/);
    return list?.[1].includes("/") ? list[1].split("/").map((text, i) => ({ label: String.fromCharCode(65 + i), text: text.trim() })) : [];
  }
  function choicePrompt(stem, options) {
    return `${String(stem || "").trim()}${options.map(x => `${x.label}. ${x.text}`).join(" ")}`;
  }
  function equalAnswer(input, expected) {
    const text = canonical(String(input).replace(/^[A-D][.．、]\s*/i, "")), target = canonical(expected).replace(/^[a-d][.．、]/, "");
    if (!text || !target) return false;
    if (text === target) return true;
    if (target.includes("或")) return target.split("或").some(part => equalAnswer(input, part));
    // A negative or uncertain sentence must not pass by containing the right word.
    if (/不是|不等|不选|不知道|不确定|也许|或者|还是|不是|不够|不对/.test(text)) return false;
    const scalar = target.match(/^(\d+)((?:元|角|分|厘米|米|千克|克|小时|分钟|时|个|支|本|张|朵|只|人|辆|条|颗|种|盒|盘|段|袋|束|把|根|棵|笔|块)?[^\d]*)$/);
    if (scalar && !/[，,、；;×÷+\-]/.test(String(expected)) && !/更多|最|多得|少得|一些/.test(target)) {
      const unit = scalar[2].match(/^(元|角|分|厘米|米|千克|克|小时|分钟|时|个|支|本|张|朵|只|人|辆|条|颗|种|盒|盘|段|袋|束|把|根|棵|笔|块)/)?.[0] || "";
      if (text === scalar[1] || (unit && text === scalar[1]+unit)) return true;
      const numbers = text.match(/\d+/g) || [];
      const expectedNumber = target.match(/^\d+/)?.[0];
      if (numbers.length !== 1 || numbers[0] !== expectedNumber) return false;
      const units = /千克|厘米|分钟|小时|元|角(?!形)|分|米|克|时/;
      const actualUnit = text.match(units)?.[0], targetUnit = target.match(units)?.[0];
      if (actualUnit && targetUnit && actualUnit !== targetUnit) return false;
      if (unit && /[个支本张朵只人辆条颗种盒盘段袋束把根棵笔块]/.test(unit) && text.match(/^\d+(.+)$/)?.[1] && ![unit,target.slice(scalar[1].length)].includes(text.match(/^\d+(.+)$/)[1])) return false;
      return /^(?:共|一共|共有|总共|结果|答案|还剩|剩下|剩|有|是|=)?\d+(?:元|角|分|厘米|米|千克|克|小时|分钟|时|个|支|本|张|朵|只|人|辆|条|颗|种|盒|盘|段|袋|束|把|根|棵|笔)?$/.test(text);
    }
    return false;
  }
  function matches(input, answers) {
    const values = (answers || []).map(String).filter(Boolean);
    const numeric = values.filter(x => /^\d/.test(clean(x)));
    // Unit-only and generic feature keywords are not answers to numeric questions.
    const candidates = numeric.length ? values.filter(x => /\d/.test(clean(x)) || /左|右|一样|相等|大于|小于|够|不够/.test(x)) : values;
    return candidates.some(answer => equalAnswer(input, answer));
  }
  function whole(input, question) {
    const options = choices(question);
    const rawExpected = String(question?.answer || "");
    let expected = options.find(x=>x.label.toLowerCase()===rawExpected.toLowerCase())?.text || rawExpected.replace(/^[A-D][.．、]\s*/, "");
    if(/^\d+$/.test(expected)) {
      const unit=[...String(question?.prompt || "").matchAll(/(?:_{2,}|多少|几|\(\s*\)|（\s*）)\s*(千克|厘米|分钟|元|角|分|米|克|个|支|本|人|辆|棵)/g)].at(-1)?.[1];
      if(unit) expected+=unit;
    }
    const option = options.find(x => canonical(x.text) === canonical(expected));
    if (option && clean(input) === option.label.toLowerCase()) return true;
    const labeledInput=String(input).trim().match(/^(?:我选|选)?\s*([A-D])(?:[.．、\s]+)(.+)$/i);
    if(labeledInput && options.length) return Boolean(option && labeledInput[1].toUpperCase()===option.label && canonical(labeledInput[2])===canonical(option.text));
    const text = canonical(input), target = canonical(expected);
    if(/(?:列|写出|填写|乘法).*算式/.test(question?.prompt||"")) {
      if(target.split("或").some(equation=>equation.includes("=") && text===equation.split("=")[0])) return true;
    }
    if(/哪边大|哪边多/.test(question?.prompt||"")) {
      const side=text.match(/^(左边|右边)(?:的|是)?(?:更大|大|更多|多)?[,]?(\d+)?(?:个)?$/);
      const alternatives=target.split("或");
      if(side && alternatives.some(x=>canonical(x)===side[1]) && (!side[2] || alternatives.includes(side[2])))return true;
    }
    if (/^[<>=]$/.test(target)) {
      const operands=String(question?.prompt||"").match(/(\d+)\s*[□_]\s*(\d+)/);
      if(operands && text===`${operands[1]}${target}${operands[2]}`) return true;
    }
    if(/\|[^|\n]+\|\s*\d+\s*\|/.test(question?.prompt||"") && !/不|或|还是/.test(text)) {
      const compact=value=>value.replace(/更多|最多|最少|较多|一共|共有|比|多|少|人数|数量|个|人|支|本|,/g,"");
      if(compact(text)===compact(target)) return true;
    }
    const moneyValue = value => {
      const parts = [...value.matchAll(/(\d+)(元|角|分)/g)];
      return parts.length && parts.map(m=>m[0]).join("")===value ? parts.reduce((sum,m)=>sum+Number(m[1])*({元:100,角:10,分:1}[m[2]]),0) : null;
    };
    const inputMoney=moneyValue(text), expectedMoney=moneyValue(target);
    if (inputMoney !== null && expectedMoney !== null) return inputMoney === expectedMoney;
    if (/^\d{1,2}:\d{2}$/.test(expected)) {
      const [h,m]=expected.split(":").map(Number);
      const spoken=text.match(/^(\d+)(?:点|时)(?:(\d+)(?:分)?|(半)|(整))?$/);
      if(spoken) return +spoken[1]===h && (spoken[3] ? 30 : +(spoken[2] || 0))===m;
    }
    if (equalAnswer(input, expected)) return true;
    if (target.includes("或")) return target.split("或").some(x => whole(input, { answer: x }));
    // Multi-blank answers are ordered, and repeated zeros cannot be dropped.
    const targetNumbers = target.match(/\d+/g) || [];
    const actualNumbers = text.match(/\d+/g) || [];
    if (targetNumbers.length > 1 && !/[×÷+\-]/.test(target) && !/不|或|还是/.test(text)) {
      if (targetNumbers.join(",") !== actualNumbers.join(",")) return false;
      const targetWords = target.replace(/\d+|个十|个一|个百|个千|还剩|余|[，,、…]/g, "");
      return !targetWords || targetWords === text.replace(/\d+|个十|个一|个百|个千|还剩|余|[，,、…]/g, "");
    }
    return false;
  }
  root.LezhiAnswers = { number, clean, choices, choicePrompt, matches, whole };
})(window);
