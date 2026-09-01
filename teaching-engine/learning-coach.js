(function installLearningCoach(root) {
  // These are topic-specific cues, not replacement questions or answer keys.
  const rows = [
    ["G1V1-U1-KP01", "来比一比，谁多谁少。", "每边点一个，配成一对。", "数过的做个记号，不漏掉也不重复。", "换个位置摆，数量不会跟着变。", "分东西时，就能看看是不是一样多。"],
    ["G1V1-U1-KP02", "来给小数量分个家。", "总数先留在心里，再看分出去多少。", "把已知的一部分摆好，再一个个补回总数。", "把两部分合回去，看看总数有没有变。", "把东西分到两个盒子里，就会用到分与合。"],
    ["G1V1-U1-KP03", "看看数量发生了什么变化。", "先想这些东西是合在一起，还是拿走一些。", "可以用手指表示原来的数量，再照题目添上或收起。", "把算式放回刚才的动作里检查。", "添东西、拿东西，都可以用加减法算。"],
    ["G1V1-U2-KP01", "来找数字的邻居和伙伴。", "看清是问数字的位置，还是问它的两部分。", "数序可以接着数；分与合可以补回总数。", "从另一头检查，看看顺序或总数有没有变。", "排队找位置、把东西分组，都用得到。"],
    ["G1V1-U2-KP02", "这次让数字走几步。", "加就添上，减就拿走。连算一次做一步。", "把每一步得到的数量留下，再接着做下一步。", "沿着题目的顺序再走一遍，别把中间结果丢了。", "东西先增加又减少，也能算清最后有多少。"],
    ["G1V1-U2-KP03", "来算清这件小事。", "先想题里发生了什么，别急着挑运算符号。", "把原来、变化后这两种情况分开想。", "把结果放回故事，看看是求全部还是求剩下。", "生活里的数量变化，可以画出来再算。"],
    ["G1V1-U3-KP01", "来找物体的形状线索。", "看看有没有平平的面，再看弯曲的面。", "想一想能不能滚动，但只会滚还不能确定形状。", "把每个面都想一遍，不只看正对着的这一面。", "整理盒子、搭积木时能认出不同的形状。"],
    ["G1V1-U4-KP01", "来把这些东西数清楚。", "十个一捆，先看整捆，再看零散的。", "十位记几捆，个位记剩下几根。", "把十位表示的数量和个位合起来检查。", "东西多起来，按十个一组数更容易。"],
    ["G1V1-U4-KP02", "这次不急着数，先看看数字。", "先看有没有一个十，再看多出的几个。", "把十和一分开比较或计算。", "把结果放回数序里，看看大小合不合理。", "比较和计算稍大一点的数量，会更有把握。"],
    ["G1V1-U5-KP01", "来试试先凑成十。", "看哪个数快到十，还缺多少。", "从另一个数里挪一些，先填满十格。", "挪过的不能再加一次，只加留下的。", "接近十的两个数量合起来，可以少数几次。"],
    ["G1V2-U1-KP01", "来认一认这些平面图形。", "沿轮廓走一圈，看看直边和拐角。", "把相似的图形放在一起，比较边和角。", "转个方向再看，图形的特点不变。", "拼图和折纸时，就能认出这些形状。"],
    ["G1V2-U2-KP01", "这次试试把十拆开。", "个位不够拿走时，可以从一个十里拿。", "先把十几分成十和几，减完再合起来。", "也可以想：减去的数再加几，能回到原数。", "十几样东西拿走一些，不用全部重新数。"],
    ["G1V2-U2-KP02", "这次找找多出来的部分。", "先把两边一样多的部分配好。", "多出来、没有配上的，才是相差的数量。", "让少的一边补上差，看看能不能变得一样多。", "比谁多几个、少几个，就看相差的部分。"],
    ["G1V2-U3-KP01", "来当一次分类小帮手。", "先看按什么来分，颜色和形状别混用。", "每样东西只进符合要求的一组，再读这一组的数量。", "换个标准可以重新分，但同一次要用同一标准。", "整理玩具和文具时，可以自己定分类标准。"],
    ["G1V2-U4-KP01", "看看数字怎样记下数量。", "十位放几个十，个位放几个一。", "整捆和零散的分开放，再对应到数位。", "读出来后，再按数位写回去检查。", "用两个数字，就能记下一大把东西。"],
    ["G1V2-U4-KP02", "来比较，也估一估。", "比较先看十位，一样时再看个位。", "估计时找一个熟悉的整十数作参照。", "差得近还是远，要看数量，不只看图摆得长短。", "不必每次都数完，也能大致判断谁多。"],
    ["G1V2-U5-KP01", "来当一次零钱小管家。", "先看要换成元、角还是分。", "每一份大单位，都换成同样多的小单位。", "倒回来核对：这些零钱能换回原来的钱吗。", "买东西时，能看懂不同的钱表示多少。"],
    ["G1V2-U5-KP02", "来帮忙把钱算清楚。", "先分清物品的价钱和付出的钱。", "单位不同先换好，再想付出的钱里还剩多少。", "把花掉的和找回的合起来，应该是付出的钱。", "自己买东西时，就能检查找零。"],
    ["G1V2-U6-KP01", "看看这次变的是哪一位。", "几个十和几个十算，几个一和几个一算。", "整捆与零散的分开处理，别加到不同数位上。", "算完把十和一合起来，再看看数量的变化。", "一包一包、一个一个的东西都能一起算。"],
    ["G1V2-U7-KP01", "来找这一排里的小秘密。", "先找重复的一组，或相邻数字怎么变。", "用同一种变化试两处，别只猜下一项。", "把猜到的规律放回整排，处处都合适才行。", "看图案、排节目顺序，都能发现规律。"],
    ["G2V1-U1-KP01", "来做一次长度小测量。", "看物体从哪条刻度开始，到哪条结束。", "长度是两端之间的距离，不一定是右端的数。", "单位先看清，米和厘米不能当成一样大。", "量文具、比较长短时，能读懂尺子。"],
    ["G2V1-U2-KP01", "来把每一位算稳。", "相同数位对齐，从个位开始算。", "个位满十要带给十位，不够减要拆一个十。", "检查十位有没有把进来或拆走的那个十算进去。", "大一些的加减法，也可以一步一步算清楚。"],
    ["G2V1-U2-KP02", "来把几次变化连起来。", "每次先做当前这一步，留下中间结果。", "比较前，先把要比较的两边分别算清。", "回到题目，检查最后问的是什么数量。", "数量接连变化时，也能算清最后的情况。"],
    ["G2V1-U3-KP01", "来观察角张开了多大。", "看两条边张开的大小，不看边画得多长。", "用直角作参照，比较开口比它大还是小。", "只拉长边，开口没有变，角的大小就没变。", "书角、窗角里，都能找到角。"],
    ["G2V1-U4-KP01", "来发现几组一样多。", "先看每组一样多吗，再数有几组。", "几个相同的数连加，可以写成乘法。", "用连加检查乘法，不要把两个乘数直接相加。", "成盒、成排的东西，可以一组一组数。"],
    ["G2V1-U4-KP02", "看看整组外面还有什么。", "先找到一样多的整组。", "整组用乘法，再处理多出来或缺少的部分。", "把整组和零散部分都检查一遍，别重复算。", "有些排满、有些没排满的东西，也能一起算。"],
    ["G2V1-U5-KP01", "换个方向，看看能看到什么。", "先找观察的人站在哪边。", "只想从这个方向看得到的面，挡住的不能算。", "换到另外一边看，轮廓可能就不同了。", "看玩具和搭积木时，可以从不同方向观察。"],
    ["G2V1-U6-KP01", "试试用熟悉的口诀帮忙。", "忘了一句，可以从邻近的口诀接着想。", "少一组就减一组，多一组就加一组。", "交换两个乘数，积不变，也能帮助检查。", "成组的数量变大，也不用一个一个数。"],
    ["G2V1-U7-KP01", "来看看钟面在告诉我们什么。", "短针走过哪个数字，就是几时多。", "长针每走一个大格是五分钟。", "短针在十二和一之间，是十二时多，不是一时。", "读懂钟，就能安排自己的时间。"],
    ["G2V1-U7-KP02", "来看看这段时间走了多久。", "先找到开始和结束两个时刻。", "跨过整点时，可以分成两段来数。", "把两段时间合起来，检查有没有漏掉一段。", "等车、做活动时，能算出过了多久。"],
    ["G2V1-U8-KP01", "来找不重复、不遗漏的搭配。", "先固定一个，再换另一个。", "这一组搭配找完，再换下一组。", "按顺序检查，有没有少一种或重复一种。", "搭配衣服、安排顺序时，都用得上。"],
    ["G2V2-U1-KP01", "来从记录里找发现。", "先找到要读的类别，再找对应的数量。", "一共要合起来，相差要比较两边。", "回到对应的行或列，检查有没有读串。", "做个小调查，就能用记录来回答问题。"],
    ["G2V2-U2-KP01", "试试怎样分得一样多。", "平均分，每一份要一样多。", "可以一份一份轮着分，或者按每组数量圈起来。", "每份的数量和份数相乘，应当回到总数。", "分享东西时，就能看看每人分到多少。"],
    ["G2V2-U2-KP02", "来用乘法找除法的答案。", "想除数乘几，能得到总数。", "不熟悉时，一组一组加到总数。", "找到商后，再乘回去检查。", "知道总数和每份数，就能找到份数。"],
    ["G2V2-U3-KP01", "来看看图形是怎样变化的。", "看方向有没有变，还是绕着固定点转。", "对称要看沿一条线对折后能否完全重合。", "移动、转动、对折，是不同的动作。", "抽屉、指针和折纸里，都有这些变化。"],
    ["G2V2-U5-KP01", "这次先找该算的那一部分。", "先看括号，再看乘除。", "没有括号又只有加减，或只有乘除，才从左算。", "先算的结果要放回原位置，剩下的继续算。", "一道题里有几种运算，也能有条理地算。"],
    ["G2V2-U6-KP01", "来看看能分满几份，还剩多少。", "先找不超过总数的完整几组。", "总数减去已经分掉的，才是剩下的。", "剩下的必须不够再装一整组。", "分东西分不完时，能说清整份和剩余。"],
    ["G2V2-U6-KP02", "来替剩下的部分想个办法。", "先算完整几份，再看题目要安排什么。", "人都要坐下，剩下的人也要有位置。", "如果只问能做成的整份，不够一份的就不能算。", "需要几个容器和能做几件东西，处理剩余的方法不同。"],
    ["G2V2-U7-KP01", "来认清大数里的每个位置。", "从右边起是个、十、百、千位。", "哪一位没有，要写零占住位置。", "中间连续的零只读一次，末尾的零不读。", "用数位就能读写更大的数量。"],
    ["G2V2-U7-KP02", "大数也可以一位一位看。", "先比位数，同样多再从高位开始比。", "整千和整百计算，要先认清数的单位。", "高位不同就能分大小，不用被后面的数字带走。", "比较大数量时，不需要从一开始数。"],
    ["G2V2-U8-KP01", "来看看轻重该怎么表示。", "较轻的物品常用克，较重的常用千克。", "一千克等于一千个一克，也就是1000克。", "看清秤上的单位，再比较或计算。", "称食物和看包装上的质量，都用得到。"],
    ["G2V2-U9-KP01", "来当一次线索小侦探。", "先抓住已经确定的条件。", "把不可能的划掉，再找剩下的可能。", "得到答案后，每一条条件都要符合。", "有几条线索时，可以按顺序慢慢推出来。"],
  ];
  const profiles = Object.fromEntries(rows.map(([id,hook,cue,model,check,purpose]) => [id,Object.freeze({id,hook,strategies:[cue,model,check],purpose})]));
  const tidy = text => String(text || "").replace(/\s+/g," ").trim();
  const profile = lesson => profiles[lesson?.sourceQuestionBankId];
  const hash = text => Array.from(String(text)).reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,17);

  function fresh(memory, key, choices) {
    memory.counts ||= {};
    const index = memory.counts[key] || 0;
    memory.counts[key] = index + 1;
    return choices[index % choices.length];
  }

  function intent(input) {
    const t = tidy(input).replace(/[，。！？?!\s]/g,"").replace(/^(?:乐之老师|老师)[，：:]?/,"");
    if (/^(?:(?:我|我们)?(?:想|要|想要|先|去|有点|好|太|已经))*(?:喝水|喝口水|上厕所|去厕所|吃饭|休息|休息一下|休息一会|停一下|暂停|累了|困了|饿了|肚子饿了|想睡觉|睡觉|不想学了|不想做了|不想继续了|不想做这个题|不学了|不做了|不玩了|今天先到这里)(?:了|吧|好吗)?$/.test(t)) return "pause";
    if (/^(?:我)?(?:回来了|回来啦|准备好了|继续|继续做|继续学|接着做|接着学|开始吧)$/.test(t)) return "resume";
    if (/^(?:我觉得|我|这题|这个|数学)?(?:太|好|有点)?(?:无聊|没意思|不好玩|讨厌数学|不喜欢数学)(?:了|啊)?$/.test(t)) return "bored";
    if (/^(?:我)?(?:太笨了|是不是很笨|怎么总是做错|怎么总错|总是不会|学不好数学|做不到|不行|好难过)(?:了|啊)?$/.test(t)) return "sad";
    if (/^(?:我)?(?:生气了|好生气|讨厌你|你烦死了|别说了|不要再说了|不想听了)(?:啊|吧)?$/.test(t)) return "angry";
    if (/^(?:你|老师)?(?:是谁|叫什么|叫什么名字|几岁|多大|是人吗|是真人吗|是机器人吗|喜欢什么)(?:呀|呢|啊)?$/.test(t)) return "identity";
    if (/^(?:我们|我)?(?:为什么要学|学这个有什么用|学这个干嘛|这有什么用|有什么用)(?:呢|呀)?$/.test(t)) return "purpose";
    if (/^(?:我)?(?:想|要|想要)?(?:换一道|换一题|换道题|换题|换个问法|简单一点|来道简单的|换个简单的|换一道简单的)(?:题|吧)?$/.test(t)) return "change";
    if (/^(?:我|这题|这个|这道题)?(?:还是|真的|完全)?(?:不会|不懂|没懂|没听懂|不知道|听不懂|看不懂|学不会|太难了|好难|算不出来|答不上来)(?:了|呀)?$/.test(t)) return "help";
    if (/^(?:声音太小了|没听见|没听清|听不见|再说一遍|再听一遍|重听|你说什么)$/.test(t)) return "repeat";
    if (/^(?:妈妈叫我了|爸爸叫我了|等一下妈妈|我去拿水杯)$/.test(t)) return "pause";
    if (/^(?:外面下雨了|外面很吵|电视在响|刚才有人敲门|这是什么声音|我的声音很小|今天吃什么)$/.test(t)) return "distraction";
    return "";
  }

  function social(kind, lesson, question, memory) {
    const p=profile(lesson), target=tidy(question);
    if(kind==="pause") return "好，我们先停在这里。准备好了再回来，不用着急。";
    if(kind==="bored") return "不想一直这样做也没关系。换一道简单的，还是先休息？";
    if(kind==="sad") return "不是你不行，是这一步还没找到合适的办法。换一道简单的，还是先休息？";
    if(kind==="angry") return "我听到你现在很烦。我们先停一下，不追着做题。想换一道简单的，还是先休息？";
    if(kind==="identity") return `我是乐之老师，是陪你学数学的AI。${target}`;
    if(kind==="purpose") return `${p?.purpose || "数学可以帮我们把数量和形状想清楚。"}${target}`;
    if(kind==="distraction") return `可以先处理身边的事，我等你。准备好再看：${target}`;
    return `${fresh(memory,"redirect",["我听到了。我们接着看这一问：","这句我还没明白。我们先看看题目：","题目还在这里，我们接着试试："])}${target}`;
  }

  function task(lesson, prompt, memory, kind="start", instruction="", previous=null, current=null) {
    const p=profile(lesson);
    let lead=kind==="start" ? p?.hook || "来试试这一题。" : fresh(memory,"task",["换成这一题，你来试试。","这次看看这个变化。","再给你一道不同的。"]);
    if(kind!=="start" && previous && current && signature(previous)!==signature(current)) {
      const leads={judgement:"这次判断一句话对不对。",story:"换成这件生活中的事，你来想想。",inverse:"这回倒过来，找缺少的数。", "picture-choice":"这次看看图，选出合适的。",choice:"这次从几个答案里选一个。"};
      lead=leads[signature(current)] || lead;
    }
    return [lead,prompt,instruction].filter(Boolean).join(" ");
  }

  function feedback(memory, assisted=false) {
    return fresh(memory,assisted ? "supported" : "success",assisted
      ? ["刚才我们一起弄明白了。","这题已经一起完成了。","我们把刚才卡住的地方走通了。"]
      : ["这题你自己算对了。","对，这次也找到了答案。","这个结果对了。"]);
  }

  // Describe a worked step using its own operands, never operands from the next check.
  function worked(plan, attempt) {
    const d=plan?.transferData, k=plan?.transferKind;
    if(k==="to-ten" && d) return attempt===2 ? `${10-d.big}和${d.big}合起来是10。用10减去${d.big}，也能找到缺的${10-d.big}。` : `十个位置已经占了${d.big}个，还有${10-d.big}个空位。再补${10-d.big}个就满10了。`;
    if(k==="place" && d) {
      const digit=Math.floor(d.n/d.scale)%10,place=d.place==="一" ? "个" : d.place;
      return attempt===2 ? `${d.n}的${place}位写着${digit}，这一位表示${digit*d.scale}。不是把整个数都写在这一位。` : `从右往左数第${Math.log10(d.scale)+1}位，就是${place}位。${d.n}这里写着${digit}，表示${digit}个${d.place}。`;
    }
    if(k==="clock-hour" && d) return `短针${d.m ? `已经走过${d.h}，还没到${d.h%12+1}` : `正指着${d.h}`}，所以是${d.h}时${d.m ? "多" : ""}。${d.h===12 ? "十二后面才是一，不能选较小的数。" : ""}`;
    if(k==="clock-minute" && d) return d.m===0 ? "长针指着12，是新的一小时开始，分钟从0算起。" : `从12走到长针的位置，有${d.m/5}个大格。每格5分钟，${Array.from({length:d.m/5},(_,i)=>(i+1)*5).join("、")}，一共${d.m}分钟。`;
    if(k==="table-row" && d) {
      const row=d.rows.find(row=>row.label===d.label);
      if(row) return `先找到“${row.label}”，手指沿着这一行移到数量栏，对着的数是${row.value}。别跳到上下两行。`;
    }
    if(k==="quotient" && d) {
      const groups=Math.floor(d.a/d.b),used=groups*d.b;
      return `${d.a}个按每${d.b}个一组，${groups}组用了${used}个，还剩${d.a-used}个。剩下的不够${d.b}个，就不能再分满一组。`;
    }
    if(k==="arithmetic" && d) {
      const {a,b,op}=d;
      if(op==="+" && a<10 && b<10 && a+b>10) {
        const big=Math.max(a,b),small=Math.min(a,b),need=10-big;
        return attempt%2 ? `把${small}分成${need}和${small-need}。${big}先加${need}凑到10，再加${small-need}，就是${a+b}。` : `${big}差${need}到10。从${small}里挪${need}过去，剩${small-need}。10加${small-need}是${a+b}。`;
      }
      if(op==="-" && a>10 && a<20 && a%10<b && b<10) return attempt%2 ? `倒着想：${b}加${a-b}能回到${a}，所以${a}减${b}是${a-b}。` : `把${a}拆成10和${a-10}。10减${b}是${10-b}，再加${a-10}，得到${a-b}。`;
      if(op==="+" || op==="-") {
        const result=op==="+" ? a+b : a-b;
        if(attempt===2) return op==="+" ? `用减法检查：${result}拿走${b}，回到${a}。所以${a}加${b}是${result}。` : `用加法检查：剩下的${result}加回拿走的${b}，正好是${a}。`;
        if(a<10 && b>0 && b<=5) return `从${a}开始，${op==="+" ? "接着" : "倒着"}数${b}个：${Array.from({length:b},(_,i)=>op==="+" ? a+i+1 : a-i-1).join("、")}。结果是${result}。`;
        if(a>=10 && a<100 && b<100) return `${a}里面有${Math.floor(a/10)}个十和${a%10}个一。${op==="+" ? "添上" : "拿走"}${b}，十和一分开算，再合起来是${result}。`;
      }
      if(op==="×" && a>0 && b>0) return attempt===2 ? `${a}组、每组${b}个，和${b}组、每组${a}个一样多，都是${a*b}。` : `先想${Math.max(0,a-1)}组${b}个是${(a-1)*b}，再添一组${b}个，就是${a*b}。`;
      if(op==="÷" && b>0 && a%b===0) return attempt===2 ? `把每份${a/b}和${b}份乘回去，正好得到${a}。` : `想${b}乘几是${a}。${b}乘${a/b}是${a}，所以${a}除以${b}是${a/b}。`;
    }
    if(k==="composition" && d) return attempt===2 ? `把${d.part}和${d.total-d.part}合起来，正好回到${d.total}，总数没有变。` : `${d.total}里已经分出${d.part}，从${d.part}补到${d.total}还要${d.total-d.part}，这就是另一部分。`;
    if(k==="compare" && d && Math.max(d.a,d.b)<=20) return `左边${d.a}，右边${d.b}。先配好${Math.min(d.a,d.b)}对，${d.a===d.b ? "两边都没有剩下，所以一样多" : (d.a>d.b ? "左边" : "右边")+"还剩"+Math.abs(d.a-d.b)+"个，所以这一边多"}。`;
    const unit=tidy(plan?.prompt).match(/(\d+)\s*(元|角|米|千克).*?(?:几|多少)\s*(角|分|厘米|克)/);
    if(unit) {
      // Composite amounts must retain every part, including the smaller unit.
      if (/元|角/.test(unit[2]) && /角|分/.test(unit[3]) && root.parseMoneyQuestion) {
        const money=root.parseMoneyQuestion({prompt:plan.prompt,answer:plan.answerQuestion?.answer});
        const factor={元:100,角:10,分:1},target=unit[3];
        const parts=[{value:money?.yuan,unit:"元"},{value:money?.jiao,unit:"角"},{value:money?.fen,unit:"分"}].filter(part=>part.value>0);
        if(parts.length>1) {
          const values=parts.map(part=>part.value*factor[part.unit]/factor[target]),total=values.reduce((a,b)=>a+b,0);
          if(attempt===2) return `把${total}${target}分成${values.map(value=>`${value}${target}`).join("和")}。${parts.map((part,i)=>part.unit===target ? `${part.value}${target}不变` : `${values[i]}${target}换回${part.value}${part.unit}`).join("，")}，和原来的钱一样多。`;
          return `${parts.map((part,i)=>part.unit===target ? `${i ? "再加" : "先看"}原来的${part.value}${target}` : `${part.value}${part.unit}换成${values[i]}${target}`).join("，")}，合起来是${total}${target}。`;
        }
      }
      const scale={元角:10,元分:100,角分:10,米厘米:100,千克克:1000}[unit[2]+unit[3]],n=+unit[1];
      if(scale && n<=10) return attempt===2 ? `${n*scale}${unit[3]}，每${scale}${unit[3]}换回1${unit[2]}，能换回${n}${unit[2]}。` : `${n}${unit[2]}是${n}份${scale}${unit[3]}${n>1 && n<=4 ? "："+Array(n).fill(scale).join("加") : ""}，合起来是${n*scale}${unit[3]}。`;
    }
    return "";
  }

  function cues(lesson, plan) {
    const p=profile(lesson);
    let strategies=p?.strategies;
    const family=lesson?.activeQuestionFamily;
    const focused={
      ordinal:["先认准从哪边开始数。","数到第几个，表示的是位置。","问前面有几人时，不包括他自己。"],
      count:["点一个，就说一个数。","数过的做个记号，再数下一个。","最后说的数，就是这一堆的总数。"],
      concreteAddition:["把题里的两部分放在一起。","从已经有的数量往后接着数。","合起来后，再拿走一部分能回到另一部分。"],
      concreteSubtraction:["从原来的数量里拿走一些。","先看拿走多少，再数留下的。","留下的和拿走的合起来，应当是原来的数量。"],
    };
    if(focused[family]) strategies=focused[family];
    const source=String(plan?.answerQuestion?.prompt || lesson?.activeQuestion?.prompt || "");
    if(family==="motion") {
      if(/对称|对折/.test(source)) strategies=["想一想沿着中间的线对折。","两边能够完全重合，才是轴对称。","一边多出或少了一块，就不能完全重合。"];
      else if(/平移/.test(source)) strategies=["看物体有没有改变朝向。","平移只是换位置，不改变形状、大小和朝向。","如果绕着一个点转了方向，就不是平移。"];
      else if(/旋转/.test(source)) strategies=["先找有没有固定不动的点。","物体绕着这个点转动，叫旋转。","只沿一个方向搬过去、没有转动，是平移。"];
    }
    if(plan?.transferKind==="clock-hour") strategies=["先只看短针。","沿钟面方向，看短针刚刚走过谁。","没到下一个数字，就还不能算下一时。"];
    if(plan?.transferKind==="clock-minute") strategies=["这一步只看长针。","从12出发，每大格数5分钟。","长针一圈60分钟，回到12又从0算。"];
    if(plan?.transferKind==="table-row") strategies=["先找到题目说的这一行。","把类别和它旁边的数量对起来。","读完沿原路看回来，确认没读到别的类别。"];
    if(plan?.transferKind==="place") strategies=["一个数字的位置，决定它表示多少。","从右往左找准要问的数位。","看的是这一位，不是整个数。"];
    if(/\d+\s*(元|角|米|千克).*?(?:几|多少)\s*(角|分|厘米|克)/.test(plan?.prompt || "")) strategies=["先认清要换成什么单位。","每一份大单位，都换成同样多的小单位。","再换回原单位，看看是否和原来一样多。"];
    if(family==="composition") strategies=["总数不变，先看已经分出多少。","把这一部分补回总数，就能找到缺少的部分。","把两部分合起来，应该回到原来的总数。"];
    if(/用符号表示|填比较符号/.test(plan?.label || "")) strategies=["先比较大小，再选符号。","开口朝大数，尖尖朝小数。","两边一样大，就用等号。"];
    return strategies || ["先把这一小步想清楚。"];
  }

  function patternExplanation(source, attempt) {
    const symbols=source.match(/[△○●■]/g),names={"△":"三角形","○":"圆","●":"圆","■":"正方形"};
    if(symbols) {
      const size=[1,2,3].find(size=>symbols.length>=size*2 && symbols.every((s,i)=>s===symbols[i%size]));
      if(size) return `把${symbols.slice(0,size).map(s=>names[s]).join("、")}看作一组。${attempt===2 ? "一组结束后，又从这一组的第一个开始。" : "这组一直按同样的顺序重复。"}下一处轮到${names[symbols[symbols.length%size]]}。`;
    }
    const n=(source.match(/\d+/g)||[]).map(Number),delta=n[1]-n[0];
    if(n.length>=3 && n.every((v,i)=>!i || v-n[i-1]===delta)) return `从${n[0]}到${n[1]}${delta>0 ? "加" : "减"}${Math.abs(delta)}，从${n[1]}到${n[2]}也一样。下一步继续${delta>0 ? "加" : "减"}${Math.abs(delta)}，${n.at(-1)}就变成${n.at(-1)+delta}。`;
    return "";
  }

  function explanation(lesson, plan, attempt=0) {
    const hint=tidy(plan?.teacherHint || plan?.answerQuestion?.explanation);
    const concrete=lesson?.activeQuestionFamily==="pattern" ? patternExplanation(lesson.activeQuestion.prompt,attempt) : attempt>0 ? worked(plan,attempt) : "";
    const cue=cues(lesson,plan)[Math.min(attempt,2)] || "先把这一小步想清楚。";
    // Do not truncate a mathematical condition or the question to meet a character quota.
    return [cue,concrete || hint].filter(Boolean).join(" ");
  }

  function repair(lesson, plan, remediation, attempt, memory) {
    const lead=fresh(memory,"help",["我来讲刚才卡住的这一步。","我们把刚才这一点慢慢想清楚。","这次换个角度看刚才这一步。"]);
    return `${lead} ${explanation(lesson,plan,attempt)} 现在看这道小题：${remediation.checkPrompt}`;
  }

  function signature(q) {
    const t=tidy(q.prompt);
    if(q.visualModel) return "picture-choice";
    if(q.choices?.length) return "choice";
    if(/^(对|错)$/.test(q.answer)) return "judgement";
    if(root.LezhiAnswers?.multipart(q)) return "multipart";
    if(/先|原来|买|付|找回|每|平均|至少|最多|还剩|可以.*(?:人|辆|件)/.test(t)) return "story";
    if(/____/.test(t.split(/[=＝]/)[0])) return "inverse";
    return "direct";
  }

  // Remediation stays on the same small skill; broad topic membership is not enough.
  function skill(q,family) {
    const t=String(q?.prompt || "");
    if(q?.visualModel) return q.visualModel.kind;
    if(family==="pattern") return /[△○●■]/.test(t) ? "repeated-shapes" : "number-pattern";
    if(family==="arrangement") return /两位数/.test(t) ? "ordered-digits" : "pairing";
    if(family==="shape" && /三角形|正方形|长方形|圆/.test(t) && !/立体|圆柱|正方体|长方体|球/.test(t)) return /拼|剪|七巧板/.test(t) ? "shape-composition" : "shape-properties";
    if(family==="angle") return /顶点/.test(t) ? "angle-parts" : "angle-size";
    return family;
  }

  function complexity(q) {
    const nums=(String(q.prompt).match(/\d+/g)||[]).map(Number);
    return (root.LezhiAnswers?.multipart(q) ? 3 : 0) + (nums.length>3 ? 2 : 0) + (signature(q)==="story" ? 1 : 0) + Math.min(3,Math.floor(Math.log10(Math.max(1,...nums))));
  }

  function target(prompt,family) {
    const full=tidy(prompt);
    if(family!=="logic") return full;
    const question=full.match(/(?:请问|那么|问：)[^。！？]*[？?]$/);
    return question ? question[0] : full;
  }

  function select(bank, {asked=[],current,passed=0,assisted=false,level=0,seed=0}={}) {
    const seen=new Set(asked), candidates=bank.filter(q=>!seen.has(q.id||q.prompt));
    const previous=signature(current || {}),wantVariation=!assisted && passed>0;
    const targetLevel=Math.max(-2,Math.min(2,Number(level)||0));
    return candidates.sort((a,b)=> {
      const score=q=>{
        const variation=wantVariation && signature(q)!==previous ? -3 : 0;
        const weight=assisted || targetLevel<0 || !passed ? 2 : targetLevel>0 ? -1.2 : .3;
        return variation+complexity(q)*weight;
      };
      return score(a)-score(b) || hash(a.id+seed)-hash(b.id+seed);
    })[0] || null;
  }

  root.LezhiCoach=Object.freeze({profiles,profile,intent,social,task,feedback,cues,explanation,repair,worked,signature,skill,complexity,select,fresh,target});
})(globalThis);
