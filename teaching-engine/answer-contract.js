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
      .replace(/[零一二两三四五六七八九十百千万]+/g, (token, offset, source) => {
        if (/角形|边形/.test(source.slice(offset + token.length, offset + token.length + 2)) || (token === "千" && source[offset+1] === "克")) return token;
        // In "四个千零个百", 千 is a place label, while 零 starts the next count.
        if (source[offset-1] === "个" && /^[一十百千]/.test(token)) return token[0] + (token.length > 1 ? String(number(token.slice(1))) : "");
        return String(number(token));
      })
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
  function multipart(question) {
    const prompt = String(question?.prompt || "");
    const blanks = [...prompt.matchAll(/_{2,}|[（(]\s*[）)]/g)];
    const answers = String(question?.answer ?? "").split(/[,，、]|…+/).map(x => x.trim()).filter(Boolean);
    const categories = [...prompt.matchAll(/\|\s*([^|\n]+)\s*\|\s*\d+\s*\|/g)].map(m=>m[1].trim());
    if (answers.length === 2 && categories.length) {
      let slots;
      if (/哪一类更多.*多多少/.test(prompt)) slots = [
        {label:"哪一类",unit:"",kind:"category",categories,ask:"哪一类更多？",expected:answers[0].replace(/更多$/, "")},
        {label:"多几个",unit:"个",ask:"多几个？",expected:(answers[1].match(/\d+/)?.[0] || "") + "个"},
      ];
      if (/一共调查.*票数最多/.test(prompt)) slots = [
        {label:"总人数",unit:"人",ask:"一共调查了多少人？",expected:answers[0]},
        {label:"哪一项",unit:"",kind:"category",categories,ask:"票数最多的是哪一项？",expected:answers[1]},
      ];
      if (slots) return {slots,prompt,instruction:"两个问题都要回答，可以一次说一个。"};
    }
    if (answers.length === 2 && /最多.+还剩/.test(prompt)) {
      const units = [...prompt.matchAll(/(?:几|多少)(段|束|袋|米|个)/g)].map(m=>m[1]);
      if (units.length === 2) {
        const slots = units.map((unit,i)=>({label:i ? "余下" : unit,unit,ask:i ? `还剩几${unit}？` : `${prompt.match(/最多[^，,？?]+/)?.[0]}？`,expected:(answers[i].match(/\d+/)?.[0] || "")+unit}));
        return {slots,prompt,instruction:"说出能分成多少、还剩多少，可以分开回答。"};
      }
    }
    if (blanks.length < 2) return null;
    if (answers.length !== blanks.length) return null;
    const slots = blanks.map((blank, i) => {
      const before = prompt.slice(0, blank.index), after = prompt.slice(blank.index + blank[0].length);
      const unit = after.match(/^\s*(个[千百十一]|个顶点|条边|千克|厘米|元|角|分|米|克)/)?.[1] || "";
      let label = unit, ask = unit ? `有几${unit}？` : `第${i + 1}个答案是几？`;
      if (/较大的数是$/.test(before)) { label = "较大的数"; ask = "哪个数大？"; }
      else if (/较小的数是$/.test(before)) { label = "较小的数"; ask = "哪个数小？"; }
      else if (/除数是$/.test(before)) { label = "除数"; ask = "除数是几？"; }
      else if (/余数是$/.test(before)) { label = "余数"; ask = "余数是几？"; }
      else if (/÷.*=_{2,}…+/.test(prompt)) { label = i ? "余数" : "商"; ask = `${label}是几？`; }
      else if (/用乘法表示/.test(prompt)) { label = i ? "结果" : "算式"; ask = i ? "结果是几？" : "乘法算式是什么？"; }
      else if (/按顺序填数/.test(prompt)) { label = `第${i + 1}个数`; ask = `接下来的第${i + 1}个数是几？`; }
      else if (/把.+填在合适/.test(prompt)) { label = `第${i + 1}个空`; ask = `${before.match(/\d+[+\-]$/)?.[0] || ""}几${after.match(/^=\d+/)?.[0] || ""}？`; }
      if (/^(元|角|分|千克|厘米|米|克)$/.test(unit)) ask = `${prompt.split(/[=＝]/)[0]}是几${unit}？`;
      const expected = /^\d+$/.test(answers[i]) && unit ? answers[i] + unit : answers[i];
      return {label, unit, ask, expected};
    });
    return {slots, prompt, instruction: `请分别说出${slots.map(s => s.unit ? "几" + s.unit : s.label).join("、")}。可以分开回答。`};
  }
  function readParts(input, contract, previous = {}) {
    if (!contract) return null;
    const {slots, prompt} = contract;
    // Parse the child's words independently of the answer key. Units/labels assign
    // slots; unlabeled results follow question order, retaining previous replies.
    let value = clean(String(input).replace(/还剩|剩下/g,"余下").replace(/(?<=[\d零一二两三四五六七八九十百千万])\s+(?=[\d零一二两三四五六七八九十百千万])/g, ","));
    const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const given = prompt.match(/^(\d+(?:元|角|分|千克|厘米|米|克))[=＝]/)?.[1];
    if (given) value = value.replace(new RegExp(`^${escape(given)}(?:=|是)`), "");
    const place = prompt.match(/^(\d+)(?:里面有|是由)/)?.[1];
    if (place) value = value.replace(new RegExp(`^${place}(?:里面有|是由)`), "").replace(/组成的$/, "");
    if (/^一个角有/.test(prompt)) value = value.replace(/^1个角有/, "");
    const division = prompt.match(/^(?:计算[:：])?\s*(\d+÷\d+)=_{2,}…/);
    if (division) value = value.replace(new RegExp(`^${escape(division[1])}(?:=|是)`), "");
    const equations = [...prompt.matchAll(/(\d+)([+\-])_{2,}=(\d+)/g)];
    if (equations.length === slots.length) equations.forEach((m,i) => {
      value = value.replace(new RegExp(`${m[1]}${escape(m[2])}(\\d+)=${m[3]}(?=$|[,;；和])`, "g"), (_,n) => `${slots[i].label}是${n}`);
    });
    const aliases = slots.flatMap((slot, i) => {
      const names = [slot.label, slot.unit];
      if (slot.label === "较大的数") names.push("大的数", "大的", "大数", "比较大", "大");
      if (slot.label === "较小的数") names.push("小的数", "小的", "小数", "比较小", "小");
      if (slot.label === "余数") names.push("余");
      if (slot.label === "哪一项") names.push("最多的", "票数最多的");
      if (/^个[千百十一]$/.test(slot.unit)) names.push(slot.unit[1] + "位");
      if (slot.unit === "个顶点") names.push("顶点");
      if (slot.unit === "条边") names.push("边");
      return names.filter(Boolean).map(name => ({name:clean(name), i})).filter(a=>a.name);
    }).sort((a,b) => b.name.length - a.name.length);
    const values = {...previous}, supplied = {};
    let count = 0;
    while (value) {
      value = value.replace(/^(?:[,;；=]|和|与|及|还有|又|是|有|…)+/, "");
      if (slots.some(s=>s.kind === "category")) value = value.replace(/^(?:多|调查了|1共|共|总共)+/, "");
      if (!value) break;
      if (given) value = value.replace(new RegExp(`^${escape(given)}(?:=|是)`), "");
      const prefix = aliases.find(a => value.startsWith(a.name));
      if (prefix) value = value.slice(prefix.name.length).replace(/^(?:是|有|=)/, "");
      const categoryIndex = slots.findIndex(s => s.kind === "category");
      const category = slots[categoryIndex]?.categories.find(name=>value.startsWith(clean(name)));
      if (category) {
        if (prefix && prefix.i !== categoryIndex) return null;
        if (supplied[categoryIndex] !== undefined && supplied[categoryIndex] !== category) return null;
        values[categoryIndex]=category;supplied[categoryIndex]=category;count++;
        value=value.slice(clean(category).length).replace(/^(?:更多|最多)/,"");
        continue;
      }
      const amount = value.match(/^\d+(?:[×÷+\-]\d+)?/);
      if (!amount) return null;
      value = value.slice(amount[0].length);
      const suffix = aliases.find(a => value.startsWith(a.name) && !(/^(余|余数|商)$/.test(a.name) && /^\d/.test(value.slice(a.name.length))));
      if (suffix) value = value.slice(suffix.name.length);
      if (prefix && suffix && prefix.i !== suffix.i) return null;
      const index = prefix?.i ?? suffix?.i ?? slots.findIndex((s,i) => s.kind !== "category" && values[i] === undefined);
      if (index < 0) return null;
      let unit = slots[index].unit;
      // An unexpected explicit unit is retained so it cannot pass as a bare number.
      if (!suffix) {
        const otherUnit = value.match(/^(千克|厘米|元|角|分|米|克|个)/)?.[0];
        if (otherUnit) { unit = otherUnit; value = value.slice(otherUnit.length); }
      }
      const result = amount[0] + unit;
      if (supplied[index] !== undefined && supplied[index] !== result) return null;
      supplied[index] = result;
      values[index] = result;
      count++;
    }
    if (!count) return null;
    return {values, complete:slots.every((_,i) => values[i] !== undefined)};
  }
  function partsMatch(parts, contract) {
    return Boolean(parts?.complete && contract.slots.every((slot,i) => {
      if (equalAnswer(parts.values[i], slot.expected)) return true;
      const product = slot.expected.match(/^(\d+)×(\d+)$/);
      return product && parts.values[i] === `${product[2]}×${product[1]}`;
    }));
  }
  function whole(input, question) {
    const contract = multipart(question);
    if (contract) return partsMatch(readParts(input, contract), contract);
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
  function classify(input, question = {}) {
    const value = clean(input), prompt = String(question.prompt || "");
    const result = (kind, shape) => ({kind, shape});
    if (!value || /^(嗯+|啊+|哦+|呃+|额+|好|好的|这个|那个|我觉得|我认为|因为|所以|答案|不知道怎么说)$/.test(value)) return result("partial", "empty");
    const options = choices(question);
    if (whole(input, question)) return result("answer", "complete");
    const parts = readParts(input, multipart(question));
    if (parts) return result("answer", parts.complete ? "multiple" : "multiple-part");
    if (options.length) {
      if (/^[a-d](?:[.．、,]?|.+)$/.test(value) && options.some(c => c.label.toLowerCase() === value[0])) {
        const tail = value.slice(1).replace(/^[.．、,]/, "");
        if (!tail || options.some(c => canonical(c.text) === canonical(tail))) return result("answer", "choice");
      }
      if (options.some(c => canonical(c.text) === canonical(value))) return result("answer", "choice");
    }
    const expected = clean(question.answer || "");
    if (/\d/.test(expected) && value.replace(/\d+/g,"#") === expected.replace(/\d+/g,"#")) return result("answer", "structured");
    const boolean = /^(对|错|正确|错误|是|不是|是的|不对|不正确|没错|可以|不可以|能|不能|够|不够|够减|不够减)$/;
    if (boolean.test(value)) return result("answer", "judgement");
    if (/^(?:左|右)(?:边|面)?(?:的)?(?:更)?(?:大|小|多|少)?$|^(?:一样|同样)(?:多|大)?$|^相等$|^[<>=△○■●□☆]$/.test(value)) return result("answer", "relation");

    // Validate the entire utterance, not the occurrence of a digit or one math word.
    // This is answer relevance, not correctness: different numbers/units still reach teaching.
    const numeric = value.replace(/^(?:结果|总数|总人数|一共有|1共有|1共|共|共有|总共|还剩|剩下|剩|有|是|第|=)/, "")
      .replace(/(?:个顶点|条边|个十|个一|个百|个千|千克|厘米|毫米|千米|分钟|小时|余数|余|还剩|元|角|分|米|克|时|点|半|整|个|支|本|张|朵|只|人|辆|条|颗|种|盒|盘|段|袋|束|把|根|棵|笔|块|份|组|次|票|顶|件)/g, "")
      .replace(/和|与|及|…/g, ",");
    if (/\d/.test(value) && /^[\d,;:×÷+\-*=<>（）()]+$/.test(numeric)) {
      const count = (value.match(/\d+/g) || []).length;
      const needed = (expected.match(/\d+/g) || []).length;
      if (needed > 1 && count < needed && !/[×÷+\-=]/.test(expected) && /[,，]|____.*____/.test(String(question.answer) + prompt)) return result("partial", "multiple");
      return result("answer", "number");
    }
    const words = /^(?:长方体|正方体|圆柱|球|平行四边形|三角形|圆形|圆|长方形|正方形|直角|锐角|钝角|正面|侧面|上面|顶面|前面|后面|左面|右面|底面|平移|旋转|轴对称|终点|起点|十位|个位|百位|千位|多得多|少得多|多一些|少一些|不拿|加法|减法|乘法|除法)$/;
    if (words.test(value)) return result("answer", "category");
    const categories = [...prompt.matchAll(/\|\s*([^|\n]+)\s*\|\s*\d+\s*\|/g)].map(m => clean(m[1]));
    const entities = [...new Set([...categories, ...(prompt.match(/小[明红华刚丽亮军芳强]|红球|蓝球|蓝旗|红旗|蓝笔|红笔|语文|数学|科学|体育|甲|乙|丙|丁|猫|狗/g) || [])])];
    for (const entity of entities) {
      if (value === entity) return result(expected.includes(",") ? "partial" : "answer", "category");
      const remainder = value.replaceAll(entity, "").replace(/更多|最多|最少|多|少|人数|数量|一共|1共|共|共有|是|比|人|个|票|支|本|[,，]/g, "");
      if (/\d/.test(remainder) && /^\d+$/.test(remainder)) return result("answer", "data");
    }
    // These tasks ask for a construction/method, not a memorized sentence.
    if (/关键要点|为什么|怎么|方法|怎样/.test(prompt) && /刻度|数位|凑十|破十|退位|进位|平均|单位|比较|对齐|间隔/.test(value)) {
      const relevant = /从|先|再|把|用|到|0|刻度|数位|厘米|米|量|起|终|点|凑十|破十|退位|进位|平均|单位|比较|对齐|间隔|开始|结束|分成|换成|算|加|减|乘|除|因为|所以|和|与|个|十|百|千|一|\d|[,，+=×÷-]/g;
      if (!value.replace(relevant, "")) return result("answer", "method");
    }
    if (/^(?:不是|不选|不等于|不等|也许|可能|或者|还是)/.test(String(input).trim()) || /^(?:是|答案是)?(?:几|多少|元|角|分|厘米|千克|个|大于|小于)$/.test(value)) return result("partial", "uncertain");
    return result("unrelated", "none");
  }
  root.LezhiAnswers = { number, clean, choices, choicePrompt, matches, whole, classify, multipart, readParts, partsMatch };
})(window);
