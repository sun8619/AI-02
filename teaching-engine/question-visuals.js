(function (root) {
  const escape = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const svg = (body, label) => `<svg class="lesson-svg contract-svg" viewBox="0 0 520 240" role="img" aria-label="${escape(label)}">${body}</svg>`;
  const dots = count => Array.from({ length: Math.max(0, Math.min(100, count)) }, () => '<i class="math-dot"></i>').join("");
  const text = (x, y, value, attrs = "") => `<text x="${x}" y="${y}" ${attrs}>${escape(value)}</text>`;
  const placeTable = (values) => `<table class="math-place-table"><thead><tr><th>数</th>${["千位","百位","十位","个位"].map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${values.map(n=>`<tr><th>${n}</th>${[1000,100,10,1].map(scale=>`<td>${n>=scale ? Math.floor(n/scale)%10 : ""}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const shape = (name, x, hint) => {
    const style = `fill="#dcf3e9" stroke="${hint ? "#157860" : "#345768"}" stroke-width="3"`;
    let drawing = "";
    if (name === "三角形") drawing = `<path d="M${x} 52l42 84h-84Z" ${style}/>`;
    else if (name === "圆" || name === "圆形" || name === "球") drawing = `<circle cx="${x}" cy="96" r="38" ${style}/>${name === "球" ? `<ellipse cx="${x}" cy="96" rx="38" ry="12" fill="none" stroke="#345768" stroke-dasharray="4 4"/>` : ""}`;
    else if (name === "圆柱") drawing = `<path d="M${x-32} 68v62c0 20 64 20 64 0V68" ${style}/><ellipse cx="${x}" cy="68" rx="32" ry="12" ${style}/>`;
    else if (/体/.test(name)) {
      const width = name === "正方体" ? 58 : 78, height = name === "正方体" ? 58 : 42;
      const left = x - width / 2;
      drawing = `<path d="M${left} 78h${width}v${height}h-${width}z M${left} 78l16-16h${width}l-16 16m16-16v${height}l-16 16" ${style}/>`;
    }
    else if (name === "平行四边形") drawing = `<path d="M${x-25} 64h68l-18 70h-68Z" ${style}/>`;
    else drawing = `<rect x="${x-42}" y="62" width="84" height="${name === "正方形" ? 84 : 62}" ${style}/>`;
    return drawing + text(x, 190, name, 'text-anchor="middle"');
  };
  function diagram({ question, family, mode }) {
    const prompt = String(question?.visualPrompt || question?.prompt || "");
    const hint = mode === "hint" || mode === "step" || mode === "solution";
    const numbers = [...prompt.matchAll(/\d+/g)].map(m => Number(m[0]));
    if (family === "placeValue" && numbers.length && !/^(对|错)$/.test(question.answer || "")) {
      const pieces=[...prompt.matchAll(/(\d+)个([一十百千])/g)];
      if(pieces.length) return `<div class="math-groups">${pieces.map(m=>`<div class="math-group"><strong>${m[1]}个${m[2]}</strong></div>`).join("")}${hint ? '<p>把每一部分放在它自己的数位，没有的数位写0。</p>' : ""}</div>`;
      const n=numbers.find(n=>n>=10 && n<=9999);
      if(n) return `<div class="math-place">${placeTable([n])}${hint ? '<p>从右往左看：个位、十位、百位、千位。</p>' : ""}</div>`;
    }
    if (family === "ordinal") {
      const row=prompt.match(/一排有(\d+).*?第(\d+)/);
      if(row && +row[1]<=10) return `<div class="math-ordinal"><p>从左边开始看 →</p><div class="math-groups">${Array.from({length:+row[1]},(_,i)=>`<div class="math-position">${i+1===+row[2] ? '<strong>小明</strong>' : '<span aria-hidden="true">·</span>'}<i class="math-dot"></i></div>`).join("")}</div>${hint ? '<p>找“前面有几个”时，不把小明自己算进去。</p>' : ""}</div>`;
      const after=prompt.match(/(\d+)后面/);
      if(after) return `<div class="math-sequence"><span>${+after[1]-1}</span><span>${after[1]}</span><span>?</span></div>`;
    }
    if (family === "count" || question.visualCount) {
      const count=question.visualCount || Number.parseInt(question.answer,10);
      if(Number.isInteger(count) && count>=0 && count<=20) return `<div class="math-quantity"><p>${escape((prompt.match(/几个(.+?)？/) || [])[1] || "数一数")}</p><div class="math-count-set">${dots(count)}</div>${hint ? '<p>按顺序点一个、数一个，不漏数，也不重复数。</p>' : ""}</div>`;
    }
    if (family === "compare" && numbers.length >= 2 && !/^(对|错)$/.test(question.answer || "")) {
      if (hint) {
        const [a,b] = numbers;
        if (Math.max(a,b)<=10) return `<div class="math-pairing"><div class="math-pair-labels"><span>左边 ${a}</span><span>右边 ${b}</span></div>${Array.from({length:Math.max(a,b)},(_,i)=>`<div class="math-pair-row"><span>${i<a ? '<i class="math-dot"></i>' : ''}</span><span>${i<Math.min(a,b) ? '↔' : ''}</span><span>${i<b ? '<i class="math-dot"></i>' : ''}</span></div>`).join("")}<p>一个对一个配好，看看哪边还有没配上的。</p></div>`;
        return `<div class="math-place">${placeTable([a,b])}<p>先比位数；位数相同，从最高位起一位一位比。</p></div>`;
      }
      return `<div class="math-compare">${numbers.slice(0,2).map((n,i)=>`<div><span>${i ? "右边" : "左边"}</span><strong>${n}</strong>${n<=10 ? `<div class="math-count-set">${dots(n)}</div>` : ""}</div>`).join("")}</div>`;
    }
    if (family === "composition" && /分成/.test(prompt) && numbers.length >= 2 && numbers[0]<=20) {
      if (hint) return `<div class="math-composition"><strong>总数 ${numbers[0]}</strong><div class="math-groups"><div class="math-group is-emphasized">${dots(numbers[1])}<span>已分出 ${numbers[1]}</span></div><div class="math-group">${dots(numbers[0]-numbers[1])}<span>还剩几个？</span></div></div><p>两部分合起来，仍然是原来的总数。</p></div>`;
      return `<div class="math-composition"><strong>总数 ${numbers[0]}</strong><div class="math-count-set">${dots(numbers[0])}</div><div class="math-parts"><span>一部分 ${numbers[1]}</span><span>另一部分 ?</span></div></div>`;
    }
    if (["calculation","mixedCalculation","concreteAddition","concreteSubtraction","makeTenAdd","breakTenSubtract","application","comparisonDifference"].includes(family)) {
      const arithmetic=(prompt.match(/[（(]?\d+[\d\s+＋\-－×÷*()（）]+\d+[）)]?/) || [])[0];
      const example = arithmetic || (String(question.explanation || "").match(/\d+\s*[+\-×÷]\s*\d+/) || [])[0];
      if (example) {
        const values=[...example.matchAll(/\d+/g)].map(m=>+m[0]);
        const op=(example.match(/[+\-×÷]/)||[])[0];
        if(hint && values.length===2) {
          const [a,b]=values;
          if(op==="+" && a<10 && b<10 && a+b>10) {
            const need=10-a;
            return `<div class="math-calculation"><strong>${a} + ${b} = ?</strong><div class="math-ten-frame">${Array.from({length:10},(_,i)=>`<i class="math-dot ${i>=a ? "from-other" : ""}"></i>`).join("")}</div><p>从${b}里面拿${need}个，先和${a}凑成10。</p><div class="math-count-set">${dots(b-need)}</div><p>再把剩下的加上。</p></div>`;
          }
          if(op==="-" && a<=20 && a>=b) {
            return `<div class="math-calculation"><strong>${a} − ${b} = ?</strong><div class="math-count-set">${Array.from({length:a},(_,i)=>`<i class="math-dot ${i>=a-b ? "is-taken" : ""}"></i>`).join("")}</div><p>${a>10 && b>a%10 ? `把${a}看成10和${a-10}。从10里去掉${b}，再合上剩下的一部分。` : `从${a}个中划去${b}个，看还留下几个。`}</p></div>`;
          }
          if(/[+\-]/.test(op) && a>=10 && a<100 && b<100) {
            const regroup=op==="+" ? a%10+b%10>=10 : a%10<b%10;
            return `<div class="math-calculation"><strong>${a} ${op} ${b} = ?</strong>${placeTable([a,b])}<p>相同数位对齐，先算个位。</p>${regroup ? `<p>${op==="+" ? "个位满10，向十位进1。" : "个位不够减，从十位退1，换成10个一。"}</p>` : '<p>再算十位。</p>'}</div>`;
          }
        }
        const drawing = values.length===2 && values.every(n=>n<=20) && /[+\-]/.test(op || "") ? `<div class="math-groups"><div class="math-group">${dots(values[0])}</div><span class="math-join">${op}</span><div class="math-group">${dots(values[1])}</div></div>` : "";
        return `<div class="math-calculation"><strong>${escape(example)} = ?</strong>${drawing}${hint ? '<p>先算当前这一步，再把结果放回原题。</p>' : ""}</div>`;
      }
    }
    if (family === "shape") {
      const names = [...new Set(prompt.match(/长方体|正方体|圆柱|球(?=体|[，。\sD]|$)|平行四边形|三角形|长方形|正方形|圆形|圆(?!柱|面|圆)/g) || [])].slice(0, 4);
      if (names.length) return svg(names.map((name, i) => shape(name, (i + .5) * 500 / names.length + 10, hint)).join(""), prompt);
    }
    if (family === "pattern") {
      const sequence = prompt.replace(/^.*?[:：]/, "").match(/\d+|[△○■●□☆]|_{2,}/g) || [];
      if (sequence.length) return `<div class="math-sequence ${hint ? "math-sequence-hint" : ""}">${sequence.map(value => `<span>${escape(value.startsWith("_") ? "?" : value)}</span>`).join("")}</div>`;
    }
    if (family === "measure") {
      const ends = prompt.match(/左端.*?(\d+)厘米.*?右端.*?(\d+)厘米/);
      if (ends) {
        const a = +ends[1], b = +ends[2], max = Math.max(10, b), scale = 440 / max;
        return svg(`<line x1="40" y1="140" x2="480" y2="140" stroke="#345768" stroke-width="3"/>${Array.from({length:max+1}, (_,i) => `<line x1="${40+i*scale}" x2="${40+i*scale}" y1="130" y2="150" stroke="#345768"/>${text(40+i*scale,175,i,'text-anchor="middle"')}`).join("")}<line x1="${40+a*scale}" x2="${40+b*scale}" y1="95" y2="95" stroke="#198667" stroke-width="8"/>${hint ? Array.from({length:b-a},(_,i)=>`<rect x="${40+(a+i)*scale+2}" y="106" width="${scale-4}" height="16" fill="${i%2 ? "#99c7e5" : "#b8e3cf"}"/>`).join("") : ""}${text(260,218,hint ? "数间隔，不数刻度线" : "两个端点之间有几厘米？",'text-anchor="middle"')}`, prompt);
      }
      const segment=prompt.match(/长(\d+)厘米的线段/);
      if(segment) return diagram({question:{...question,prompt:`线段左端对着0厘米，右端对着${segment[1]}厘米。`,visualPrompt:""},family,mode});
      const units=[...prompt.split("=")[0].matchAll(/(\d+)(千克|厘米|米|克)/g)];
      if(units.length) return `<div class="math-quantity"><div class="math-groups">${units.map(m=>`<strong>${m[1]}${m[2]}</strong>`).join('<span>+</span>')}<span>→ ?</span></div>${hint ? `<p>${/千克|克/.test(prompt) ? "1千克等于1000克；满1000克的部分可以换成千克。" : "1米等于100厘米；满100厘米的部分可以换成米。"}</p>` : ""}</div>`;
    }
    if (family === "data") {
      const rows = [...prompt.matchAll(/\|\s*([^|\n]+)\s*\|\s*(\d+)\s*\|/g)].map(m => ({label:m[1].trim(),value:+m[2]}));
      if (rows.length) {
        const max = Math.max(...rows.map(x=>x.value),1);
        return `<div class="math-data">${rows.map(row => `<div class="math-data-row"><span>${escape(row.label)}</span><div><i style="width:${row.value / max * 100}%"></i></div><strong>${row.value}</strong></div>`).join("")}${hint ? `<p>${/对应的数量/.test(prompt) ? '找到问题中的类别，沿着这一行看右边的数，不要看成上下另一行。' : /多多少/.test(prompt) ? '先把每一类的名字和数量对应好。较多数减较少数，才能知道多几个。' : '把各项人数合起来，求总人数；再比较每项数字，找出最多的一项。'}</p>` : ""}</div>`;
      }
    }
    if (["time", "timeDuration"].includes(family)) {
      const clockTimes = [...prompt.matchAll(/(\d{1,2}):(\d{2})/g)].map(m=>[+m[1],+m[2]]);
      const hour = prompt.match(/(?:短针|时针)(?:正对|指向|指着|在|刚过)(\d+)/), minute = prompt.match(/(?:长针|分针)指向(\d+)/);
      if (!clockTimes.length && hour && minute) clockTimes.push([+hour[1], (+minute[1] % 12)*5]);
      if (clockTimes.length) return `<div class="math-clocks">${clockTimes.slice(0,3).map(([h,m]) => {
        const hAngle=(h%12+m/60)*Math.PI/6, mAngle=m*Math.PI/30;
        return `<svg viewBox="0 0 200 210" role="img" aria-label="钟面"><circle cx="100" cy="100" r="82" fill="#fff" stroke="#345768" stroke-width="3"/>${Array.from({length:12},(_,i)=>text(100+66*Math.sin((i+1)*Math.PI/6),105-66*Math.cos((i+1)*Math.PI/6),i+1,'text-anchor="middle"')).join("")}<line x1="100" y1="100" x2="${100+43*Math.sin(hAngle)}" y2="${100-43*Math.cos(hAngle)}" stroke="#198667" stroke-width="7" stroke-linecap="round"/><line x1="100" y1="100" x2="${100+62*Math.sin(mAngle)}" y2="${100-62*Math.cos(mAngle)}" stroke="#477db0" stroke-width="4" stroke-linecap="round"/></svg>`;
      }).join("")}</div>${hint ? `<p>${family === "timeDuration" ? (clockTimes[0][0]===clockTimes[1]?.[0] ? '开始和结束在同一小时内，数分针从开始到结束走了几分。' : '先从开始数到下一个整时，再数整时到结束。钟面上一整圈是60分。') : /较早|最早|先后/.test(prompt) ? '先比几时；几时相同，再比几分。' : '短针指几时：还没到下一个数，就读前面的时数。长针看几分：一大格是5分。'}</p>` : ""}`;
    }
    if (family === "angle" && !/^判断对错/.test(prompt)) {
      const description = prompt.split("可填")[0];
      const degree = /比直角大|更开/.test(description) ? 125 : /比直角小/.test(description) ? 45 : 90;
      const rad=degree*Math.PI/180;
      return svg(`<path d="M400 175H210L${210+145*Math.cos(rad)} ${175-145*Math.sin(rad)}" fill="none" stroke="#345768" stroke-width="6"/>${hint ? '<path d="M210 140h35v35" fill="none" stroke="#cd851a" stroke-width="3" stroke-dasharray="4 3"/>' : ""}${text(260,225,hint ? "和直角比张口大小" : "观察这个角",'text-anchor="middle"')}`,prompt);
    }
    if (family === "multiplication") {
      const same=prompt.match(/(\d+)个(\d+)相加/), boxes=prompt.match(/有(\d+)[^，]*[，,]每[^\d]*(\d+)/), expr=prompt.match(/(\d+)[×*](\d+)/);
      const pair=same||boxes||expr;
      if(pair && +pair[1]<=10 && +pair[2]<=10) return `<div class="math-groups">${Array.from({length:+pair[1]},()=>`<div class="math-group ${hint ? "is-emphasized" : ""}">${dots(+pair[2])}</div>`).join("")}</div>`;
    }
    if (["division","remainderDivision","remainderApplication"].includes(family) && numbers.length >=2 && !/判断/.test(prompt)) {
      const total=numbers[0], divisor=numbers[1];
      if (total<=100 && divisor>0 && divisor<=10) {
        const shares=/平均分给|平均分成/.test(prompt),groups=shares ? divisor : Math.floor(total/divisor),each=shares ? Math.floor(total/divisor) : divisor,remainder=total%divisor;
        const content=hint ? `<div class="math-groups">${Array.from({length:groups},()=>`<div class="math-group is-emphasized">${dots(each)}</div>`).join("")}</div>${remainder ? `<p>还没有分进组里的：</p><div class="math-count-set">${dots(remainder)}</div>` : ""}` : `<div class="math-count-set">${dots(total)}</div>`;
        return `<div class="math-quantity">${content}<p>${escape(shares ? `平均分成${divisor}份，每份几个？` : `每${divisor}个一组，可以分几组？`)}</p></div>`;
      }
    }
    if (family === "money" && !/对错|比.*多|一共多少钱/.test(prompt)) {
      const left = prompt.split(/等于|是几|=|换成/)[0].replace(/^.*?填空[:：]/, "");
      const quantities = [...left.matchAll(/(\d+)\s*(元|角|分)/g)].filter(m=>+m[1]>0);
      const target=[...prompt.matchAll(/(?:多少|几|_{2,})\s*(元|角|分)/g)].at(-1)?.[1];
      const relation={元角:"每1元可以换10角",元分:"每1元可以换100分",角分:"每1角可以换10分",角元:"每10角可以换1元",分角:"每10分可以换1角",分元:"每100分可以换1元"};
      if (quantities.length) return `<div class="math-money">${quantities.map(m=>`<div class="math-money-amount">${+m[1]<=5 ? Array.from({length:+m[1]},()=>`<i class="${m[2]==="元" ? "math-note" : "math-coin"}">1${m[2]}</i>`).join("") : ""}<strong>${m[1]}${m[2]}</strong>${hint ? `<span>${relation[m[2]+target] || "这部分单位不用变，先留着。"}</span>` : ""}</div>`).join('<span class="math-join">+</span>')}<span class="math-join">→</span><strong>?</strong></div>`;
    }
    if (family === "moneyApplication" || (family === "money" && /一共多少钱/.test(prompt))) {
      const paid=prompt.match(/(?:付了?|付给)(\d+元(?:\d+角)?|\d+角)/);
      const amount=prompt.match(/\d+元(?:\d+角)?|\d+角/g)||[];
      if(paid && amount.length>=2) {
        const value=s=>[...s.matchAll(/(\d+)(元|角)/g)].reduce((sum,m)=>sum+(+m[1])*(m[2]==="元" ? 10 : 1),0);
        const cost=amount[0],max=Math.max(value(cost),value(paid[1]));
        return `<div class="math-data">${[["价钱",cost],["付的钱",paid[1]]].map(([label,money])=>`<p>${label}：${money}</p><div class="math-cost-bar" style="width:${value(money)/max*100}%"></div>`).join("")}${hint ? '<p>先换成同一种单位。付的钱减去价钱，剩下的才是找回的钱。</p>' : ""}</div>`;
      }
      if(amount.length) return `<div class="math-calculation"><div class="math-groups">${amount.map(m=>`<strong>${m}</strong>`).join('<span>+</span>')}<span>= ?</span></div>${hint ? '<p>先把钱都换成角，再合起来。</p>' : ""}</div>`;
    }
    if (family === "arrangement") {
      const numbersTask=prompt.match(/用数字([\d、]+)组成/);
      if(numbersTask) return `<div class="math-quantity"><p>可用数字：${escape(numbersTask[1])}</p><div class="math-parts"><span>十位：?</span><span>个位：?</span></div>${hint ? '<p>先固定一个十位，从剩下的数字里轮流选个位，再换十位。</p>' : ""}</div>`;
      if(numbers.length>=2 && numbers[0]<=5 && numbers[1]<=5) return svg(`${Array.from({length:numbers[0]},(_,i)=>text(110,45+i*32,`第${i+1}种`)).join("")}${Array.from({length:numbers[1]},(_,i)=>text(340,45+i*32,`第${i+1}种`)).join("")}${hint ? Array.from({length:numbers[1]},(_,i)=>`<path d="M185 40L325 ${40+i*32}" stroke="#3e8871" stroke-width="2"/>`).join("") : ""}${text(260,225,"每边各选一种，怎样不重复、不遗漏？",'text-anchor="middle"')}`,prompt);
    }
    if (family === "motion" && hint) {
      if(/风车|时钟|旋转/.test(prompt)) return svg('<g class="math-rotate"><path d="M260 110l-18-70h36z M260 110l70-18v36z M260 110l18 70h-36z M260 110l-70 18V92z" fill="#79b8b2" stroke="#345768" stroke-width="2"/></g><circle cx="260" cy="110" r="6" fill="#345768"/>'+text(260,218,"中心位置不变，观察周围部分怎样动。",'text-anchor="middle"'),prompt);
      if(/平移|电梯|推拉窗|抽屉/.test(prompt)) return svg('<path d="M100 150H430m-15-10l15 10-15 10" stroke="#b67a15" fill="none"/><g class="math-translate"><path d="M110 70h70v65h-70z m14 18h40m-40 18h40" fill="#d2eee3" stroke="#345768" stroke-width="3"/></g>'+text(260,210,"移动前后，比较大小和朝向。",'text-anchor="middle"'),prompt);
      const skew=/平行四边形/.test(prompt), circle=/圆/.test(prompt);
      return svg((circle ? '<circle cx="260" cy="105" r="65" fill="#d2eee3" stroke="#345768" stroke-width="3"/>' : `<path d="M${skew?210:180} 45h160l${skew?-60:0} 120H${skew?150:180}Z" fill="#d2eee3" stroke="#345768" stroke-width="3"/>`)+'<path d="M260 25v165" stroke="#b67a15" stroke-width="3" stroke-dasharray="7 6"/>'+text(260,220,"沿虚线试着对折，两边能完全重合吗？",'text-anchor="middle"'),prompt);
    }
    if (family === "logic" || family === "observation" || family === "motion" || /^(对|错)$/.test(question?.answer || "")) {
      const clauses=prompt.replace(/^判断对错[:：]/,"").split(/[。；]|已知[:：]/).filter(Boolean);
      return `<ol class="math-conditions ${hint ? "is-emphasized" : ""}">${clauses.map(clause=>`<li>${escape(clause)}</li>`).join("")}</ol>`;
    }
    // An unsupported picture must not silently become a fixed, unrelated diagram.
    const written=escape(prompt).replace(/\n/g,"<br>");
    return `<div class="math-givens">${hint ? written.replace(/\d+|[一二三四五六七八九十百千零]{2,}|多得多|多一些/g,word=>`<mark>${word}</mark>`) : written}</div>`;
  }
  function render(payload) {
    const body=diagram(payload);
    return body ? `<div class="question-model-visual" data-question-id="${escape(payload.question?.id)}" data-family="${escape(payload.family)}" data-mode="${escape(payload.mode)}">${body}</div>` : "";
  }
  root.LezhiQuestionVisuals = { render };
})(window);
