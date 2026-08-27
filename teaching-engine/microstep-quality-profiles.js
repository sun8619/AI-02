(function () {
  function profile(data) {
    return {
      responseInstruction: "只说答案就可以。",
      ...data,
    };
  }

  function rule(family, id, match, data) {
    return { family, id, match, ...profile(data) };
  }

  // Each rule below is tied to a curriculum microstep. These profiles take
  // precedence over the older keyword fallbacks in the explanation library.
  const rules = [
    rule("compare", "compare-quantities", /先看清两边|用数序或配对比较|说谁大谁小|说较大较小/, {
      explanation: "比较前先把两边各有多少看清楚。数大的那边多；如果一眼看不清，就一个对一个配对，看哪边有剩下。",
      demonstration: "左边4个，右边6个。配完4对后右边还剩2个，所以右边多。",
      checks: [["左边有5个，右边有3个。哪边多？", ["左边", "左", "左边多"]]],
      responseInstruction: "只说“左边”或“右边”。",
    }),
    rule("compare", "compare-symbol", /填符号|填比较符号/, {
      explanation: "先判断谁大，再填符号。大于号和小于号张开的口都朝大数，尖尖朝小数；一样大用等号。",
      demonstration: "7比4大，所以7和4中间填大于号。",
      checks: [["3和8中间填什么符号？", ["小于号", "<", "小于"]]],
      responseInstruction: "只说“大于号”“小于号”或“等号”。",
    }),
    rule("compare", "compare-transfer", /换成图形数量再比|换两个数再比/, {
      explanation: "图形变了、数字变了，比较方法不变：先数清两边，再判断哪边多，最后才选符号。",
      demonstration: "5颗星和2个方块虽然不是同一种图形，也可以比较数量，5比2多。",
      checks: [["4个圆和6个三角形，哪边数量多？", ["三角形", "6个三角形", "右边"]]],
      responseInstruction: "只说数量多的那一种。",
    }),
    rule("compare", "compare-tens-ones", /先看十位|先比十位|十位相同再看个位|再比个位/, {
      explanation: "比较两位数先看十位。十位不同，十位大的数就大；十位相同，才继续比较个位。",
      demonstration: "47和43的十位都是4，再看个位，7比3大，所以47大。",
      checks: [["52和58的十位相同，接下来比较哪一位？", ["个位", "个"]]],
      responseInstruction: "只说数位名称。",
    }),
    rule("compare", "compare-estimate", /估一估接近几十/, {
      explanation: "看一个数接近哪个整十，要比较它离前后两个整十各差多少，差得少的就是更接近的。",
      demonstration: "43离40差3，离50差7，所以43更接近40。",
      checks: [["68更接近60还是70？", ["70", "七十"]]],
      responseInstruction: "只说更接近的整十数。",
    }),
    rule("compare", "compare-high-place", /先看位数|位数相同从高位比|高位不同直接判断|说比较理由/, {
      explanation: "大数比较先看位数；位数一样时，从最高位开始比。最高位一旦分出大小，后面的位就不用再比。",
      demonstration: "425和398都是三位数，百位4比3大，所以425大。",
      checks: [["612为什么比589大？", ["百位6比5大", "最高位6比5大", "百位大"]]],
      responseInstruction: "只说一句原因：先比较哪一位，谁更大。",
    }),

    rule("composition", "composition-total", /先看总数|先确定总数是6到10/, {
      explanation: "分与合的总数不能变。先把总数圈出来，后面找的两部分合起来必须正好回到它。",
      demonstration: "题目说“把7分成2和几”，总数是7，不是2。",
      checks: [["把8分成3和几，这里的总数是多少？", ["8", "八"]]],
      responseInstruction: "只说总数。",
    }),
    rule("composition", "composition-known-part", /看已知一部分/, {
      explanation: "总数确定后，再看题目已经给了哪一部分。已知部分先放好，不要把它当成总数。",
      demonstration: "6分成2和几，6是总数，已经知道的一部分是2。",
      checks: [["9分成4和几，已经知道的一部分是多少？", ["4", "四"]]],
      responseInstruction: "只说已知部分。",
    }),
    rule("composition", "composition-missing-part", /想还差几|补到总数/, {
      explanation: "知道总数和一部分，就从这部分往上补，补到总数用了几个，另一部分就是几。",
      demonstration: "8分成3和几，从3再补5个正好到8，所以另一部分是5。",
      checks: [["7分成2和几？", ["5", "五"]]],
      responseInstruction: "只说另一部分。",
    }),
    rule("composition", "composition-check", /合起来检查/, {
      explanation: "把找到的两部分重新合起来。合起来正好等于原来的总数，分法才正确。",
      demonstration: "8分成3和5，3加5正好等于8，所以检查通过。",
      checks: [["9分成4和5，合起来还是9吗？", ["是", "对", "还是9"]]],
      responseInstruction: "只说“是”或“不是”。",
    }),
    rule("composition", "composition-transfer", /换一种分法|换一个总数再分/, {
      explanation: "总数或已知部分换了，就重新用“补到总数”的方法，不用背上一题的答案。",
      demonstration: "刚才是7分成2和5，换成7分成3，就要重新想3还差4到7。",
      checks: [["把10分成6和几？", ["4", "四"]]],
      responseInstruction: "只说另一部分。",
    }),

    rule("calculation", "calculation-story-action", /先看故事动作|又来或合起来用加法|拿走或飞走用减法/, {
      explanation: "先看故事里的数量怎么变。又来、放进、合起来，数量变多，用加法；拿走、飞走、吃掉，数量变少，用减法。",
      demonstration: "原来4只鸟，又飞来2只，数量变多，所以用加法。",
      checks: [["原来有7个气球，飞走3个。用加法还是减法？", ["减法", "减", "-"]]],
      responseInstruction: "只说“加法”或“减法”。",
    }),
    rule("calculation", "calculation-picture-expression", /看图列式/, {
      explanation: "列式时先说图里发生了什么，再按这个动作写算式。合起来写加号，拿走写减号。",
      demonstration: "左边3个球，又放来2个球，可以列3加2。",
      checks: [["原来6块积木，拿走2块，可以列什么算式？", ["6-2", "6减2", "六减二"]]],
      responseInstruction: "只说算式，不用计算结果。",
    }),
    rule("calculation", "calculation-reason", /说清为什么这样算|用数位解释/, {
      explanation: "说原因时要把题里的动作或数位和运算连起来，不只重复答案。可以说“因为数量变多，所以用加法”，或“因为在算几个十，所以结果也是几个十”。",
      demonstration: "原来5个又来3个，求一共。因为两部分要合起来，所以用加法。",
      checks: [["原来8只，飞走2只，为什么用减法？", ["因为飞走后变少", "因为拿走一部分", "求还剩"]]],
      responseInstruction: "只说一句“因为……所以……”。",
    }),
    rule("calculation", "calculation-symbol-strategy", /先看加号还是减号|选接着数或倒着数/, {
      explanation: "先认清符号再选方向。加号表示往后接着数，减号表示往前倒着数。",
      demonstration: "7减2看到减号，就从7往前数两个：6、5。",
      checks: [["6加3应该接着数，还是倒着数？", ["接着数", "往后数"]]],
      responseInstruction: "只说“接着数”或“倒着数”。",
    }),
    rule("calculation", "calculation-one-step", /只算一小步|写出结果|换数字再算/, {
      explanation: "一次只算眼前这一小步。先看清符号和两个数，算完再检查有没有看错。",
      demonstration: "8加2只做这一小步，得到10。",
      checks: [["7加3等于多少？", ["10", "十"]]],
      responseInstruction: "只说结果。",
    }),
    rule("calculation", "calculation-inverse-check", /检查结果/, {
      explanation: "加法可以用减法检查，减法可以用加法检查。反过来能回到原来的数，答案才稳。",
      demonstration: "9减4等于5，可以用5加4等于9来检查。",
      checks: [["检查8减3等于5，可以算5加几等于8？", ["3", "三"]]],
      responseInstruction: "只说缺少的数。",
    }),
    rule("calculation", "calculation-whole-tens", /看十位是几个十|整十和整十先算十位|个位不变或一起算/, {
      explanation: "整十数先看有几个十。几个十和几个十相加减，先算“几个十”，最后把它写成整十数。",
      demonstration: "30加20是3个十加2个十，得到5个十，也就是50。",
      checks: [["60减20剩几个十？", ["4", "四", "4个十", "四个十"]]],
      responseInstruction: "只说剩几个十。",
    }),
    rule("calculation", "calculation-align", /个位对个位|十位对十位/, {
      explanation: "笔算先把相同数位对齐。个位和个位站一列，十位和十位站一列，再从个位算起。",
      demonstration: "34加25时，4和5对齐，3和2对齐。",
      checks: [["算46加12时，十位的4应该和哪个数字对齐？", ["1", "一", "和1对齐"]]],
      responseInstruction: "只说对齐的数字。",
    }),
    rule("calculation", "calculation-carry-borrow", /个位满十要进一|个位不够要退一/, {
      explanation: "个位相加满10，把10个一换成1个十，向十位进1；个位不够减，从十位退1个十，换成10个一再减。",
      demonstration: "28加5，个位8加5等于13，个位写3，并向十位进1。",
      checks: [["36加7，个位相加满10了吗？要不要进1？", ["要", "要进1", "满了"]]],
      responseInstruction: "只说“要进1”或“不用进1”。",
    }),

    rule("application", "application-question", /先读最后问什么/, {
      explanation: "应用题先读最后一句，只找它要我们求什么。还没看清问题时不要急着把数字相加减。",
      demonstration: "题目最后问“还剩几只”，要找的是剩下的数量。",
      checks: [["题目最后问“一共有多少辆”，要找什么？", ["一共有多少辆", "总数", "一共"]]],
      responseInstruction: "只说题目要求的数量。",
    }),
    rule("application", "application-condition-one", /找原来或第一部分/, {
      explanation: "看清问题后，先找第一个有用条件。它通常告诉我们原来有多少，或第一部分有多少。",
      demonstration: "“原来有4辆车，又来3辆”，第一个条件是原来有4辆。",
      checks: [["“原来有6本，又买2本”，第一个条件是多少本？", ["6", "六", "6本", "六本"]]],
      responseInstruction: "只说第一个条件里的数量。",
    }),
    rule("application", "application-condition-two", /找又来或拿走/, {
      explanation: "再找第二个有用条件，看它让数量增加还是减少。又来、买来会增加；拿走、用掉会减少。",
      demonstration: "“原来7个，吃掉2个”，第二个条件是吃掉2个，数量减少。",
      checks: [["“原来5只，又飞来3只”，第二个条件是多少只？", ["3", "三", "3只", "三只"]]],
      responseInstruction: "只说第二个条件里的数量。",
    }),
    rule("application", "application-operation", /判断加减/, {
      explanation: "把问题和数量变化连起来：求合起来的一共用加法；求拿走后剩下或相差多少用减法。",
      demonstration: "原来8个，拿走3个，求还剩，数量减少，所以用减法。",
      checks: [["原来4辆，又来5辆，求一共。用什么运算？", ["加法", "加", "+"]]],
      responseInstruction: "只说“加法”或“减法”。",
    }),
    rule("application", "application-unit", /带单位回答/, {
      explanation: "算出数字后要回到问题里看求的是什么，再把相应单位带上。问几辆就答“几辆”，不能只说一个数字。",
      demonstration: "4辆又来3辆，一共7辆，完整回答是“7辆”。",
      checks: [["5只小鸟又来2只，一共多少？请完整回答。", ["7只", "七只"]]],
      responseInstruction: "说出结果，并带上题目里的单位。",
    }),

    rule("shape", "shape-solid-form", /看整体外形|说图形名字/, {
      explanation: "认立体图形先看整体外形，再摸一摸它的面。不要只凭某一面像什么来猜。",
      demonstration: "球的表面都是弯的；正方体有6个平平的正方形面。",
      checks: [["表面都是弯的、能向各个方向滚，是什么图形？", ["球", "球体"]]],
      responseInstruction: "只说立体图形的名字。",
    }),
    rule("shape", "shape-solid-features", /找面和边|看能不能滚/, {
      explanation: "平平的面能贴住桌面，弯曲的面能滚。可以用“摸一摸、滚一滚”来区分立体图形。",
      demonstration: "圆柱有两个平面和一个曲面，横着能滚，竖着能站稳。",
      checks: [["正方体放在桌上能稳稳站住吗？", ["能", "可以", "能站住"]]],
      responseInstruction: "只说“能”或“不能”。",
    }),
    rule("shape", "shape-solid-life", /举生活例子/, {
      explanation: "找生活例子时，要看物体的稳定特征，不只看名字。球形物体像球，盒子常像长方体。",
      demonstration: "足球是球形，粉笔盒常是长方体。",
      checks: [["生活中哪个物体像圆柱？可以说一个。", ["水杯", "易拉罐", "电池", "柱子", "罐子"]]],
      responseInstruction: "只说一个生活物体。",
    }),
    rule("shape", "shape-plane-features", /数边|数角|说图形名字/, {
      explanation: "认平面图形要沿着边数一圈，再数角。摆放方向变了，边和角的数量不会变。",
      demonstration: "三角形有3条边、3个角，转斜后仍是三角形。",
      checks: [["一个平面图形有4条边、4个角，它可能是哪一类图形？", ["四边形", "正方形", "长方形"]]],
      responseInstruction: "只说图形名字。",
    }),
    rule("shape", "shape-compose", /看拼组后图形/, {
      explanation: "拼组后要看新的外轮廓，不要只盯着原来的小图形。沿最外面一圈看有几条边、几个角。",
      demonstration: "两个一样的正方形并排拼在一起，外轮廓是一个长方形。",
      checks: [["两个一样的正方形上下拼在一起，外轮廓像什么图形？", ["长方形"]]],
      responseInstruction: "只说拼成后的图形名字。",
    }),
    rule("shape", "shape-symmetry", /看是不是左右两边一样/, {
      explanation: "判断轴对称，可以沿中间折一折。左右两边能完全重合，就是轴对称。",
      demonstration: "一颗端正画出的爱心沿中线对折，两边能重合。",
      checks: [["一个正方形沿中线对折，两边能重合吗？", ["能", "可以", "能重合"]]],
      responseInstruction: "只说“能”或“不能”。",
    }),
    rule("motion", "motion-symmetry", /看是不是左右两边一样/, {
      explanation: "判断轴对称不能只凭看起来像不像。要先找到中间折线，想象沿它对折；两边每个部分都能完全重合，才是轴对称。",
      demonstration: "正方形沿中线对折，左右两边能完全重合，所以它是轴对称图形。",
      checks: [["正方形对折后，两边能重合吗？", ["能", "可以", "能重合"]]],
      responseInstruction: "只说“能”或“不能”。",
    }),
    rule("motion", "motion-observe", /看怎么动|看是平移还是旋转|找移动前后形状是否变/, {
      explanation: "先只看动作：沿直线换位置、朝向不变是平移；绕固定点转是旋转；沿一条线对折后两边重合是轴对称。",
      demonstration: "电梯门向两边直直打开，没有绕点转，所以是平移。",
      checks: [["推拉抽屉时，它是直直移动、绕点转，还是对折重合？", ["直直移动", "直线移动", "方向不变", "平移"]]],
      responseInstruction: "只说“直直移动”“绕点转”或“对折重合”。",
    }),
    rule("motion", "motion-name", /说运动名称|判断现象|判断说法/, {
      explanation: "把动作和名称对上：直直移动是平移，绕固定点转是旋转，对折能完全重合是轴对称。",
      demonstration: "钟表指针绕中心转动，所以它是旋转。",
      checks: [["推拉抽屉主要是平移还是旋转？", ["平移"]]],
      responseInstruction: "只说“平移”“旋转”或“轴对称”。",
    }),
    rule("motion", "motion-reason", /说一个依据|举生活例子/, {
      explanation: "说理由时抓一个动作证据：直直移动、绕固定点转，或者对折后能够重合。",
      demonstration: "风车是旋转，因为它绕着中心点转动。",
      checks: [["电梯门属于平移，依据是它怎样移动？", ["直直移动", "沿直线移动", "方向不变"]]],
      responseInstruction: "只说一个动作证据。",
    }),

    rule("placeValue", "place-tens", /先看十位|看十位/, {
      explanation: "十位上的数表示有几个十。先把成捆的十看清楚，再看零散的一个。",
      demonstration: "34的十位是3，表示3个十。",
      checks: [["57里十位上的5表示几个十？", ["5", "五", "5个十", "五个十"]]],
      responseInstruction: "只说几个十。",
    }),
    rule("placeValue", "place-ones", /再看个位|看个位/, {
      explanation: "个位上的数表示有几个一。看完十位后，再数没有捆起来的零散小棒。",
      demonstration: "34的个位是4，表示4个一。",
      checks: [["62里个位上的2表示几个一？", ["2", "二", "2个一", "两个一"]]],
      responseInstruction: "只说几个一。",
    }),
    rule("placeValue", "place-compose", /说几个十几个一|合成这个数/, {
      explanation: "把几个十和几个一合起来，就得到这个两位数。十位写几个十，个位写几个一。",
      demonstration: "1个十和6个一合起来是16。",
      checks: [["4个十和3个一合起来是多少？", ["43", "四十三"]]],
      responseInstruction: "只说合成的数。",
    }),
    rule("placeValue", "place-read-write", /读写这个数|换一个11到20的数|换一个两位数/, {
      explanation: "读数和写数都从高位开始。先读几个十，再读几个一；个位是0时只读整十。",
      demonstration: "数位表上十位是5、个位是8，写作58，读作五十八。",
      checks: [["十位是7、个位是2，这个数是多少？", ["72", "七十二"]]],
      responseInstruction: "只说这个数。",
    }),
    rule("placeValue", "place-large-number", /从千位开始看|百位十位个位依次看|0要占位|说每个数字表示什么/, {
      explanation: "四位数从千位开始读。每个数字表示几个对应的计数单位；中间没有某一位时，0要留着占位。",
      demonstration: "3042里，3表示3个千，0占住百位，4表示4个十，2表示2个一。",
      checks: [["5076里的0站在什么位？", ["百位", "百"]]],
      responseInstruction: "只说数位名称。",
    }),

    rule("makeTenAdd", "make-ten-target", /找快到10的数|说还差几到10/, {
      explanation: "凑十先找更接近10的数，再想它还差几到10。这个“差几”就是要从另一个加数里拿出的部分。",
      demonstration: "8加5里，8差2到10，所以先从5里拿出2。",
      checks: [["9加6里，9还差几到10？", ["1", "一"]]],
      responseInstruction: "只说还差几。",
    }),
    rule("makeTenAdd", "make-ten-split", /拆另一个数/, {
      explanation: "把另一个数拆成两部分：一部分正好补到10，另一部分留到下一步再加。",
      demonstration: "8加5，8差2，就把5拆成2和3。",
      checks: [["7加6要先凑十，6应该拆成3和几？", ["3", "三"]]],
      responseInstruction: "只说剩下的那一部分。",
    }),
    rule("makeTenAdd", "make-ten-complete", /先凑成10/, {
      explanation: "先把接近10的数和刚拆出的部分合起来，得到10。先完成这一步，不要同时算最后答案。",
      demonstration: "8加5里先算8加2等于10。",
      checks: [["7加6里，先算7加几等于10？", ["3", "三"]]],
      responseInstruction: "只说补给7的数。",
    }),
    rule("makeTenAdd", "make-ten-finish", /再加剩下/, {
      explanation: "凑成10后，再把拆数时剩下的部分加回来，才是原题的最后答案。",
      demonstration: "8加5，先到10，5里还剩3，再算10加3等于13。",
      checks: [["9加5，先凑成10后还剩4，最后等于多少？", ["14", "十四"]]],
      responseInstruction: "只说最后结果。",
    }),

    rule("breakTenSubtract", "break-ten-enough", /看个位够不够减/, {
      explanation: "先比较被减数的个位和减数。个位小于减数，就不够直接减，需要把一个十拆开。",
      demonstration: "13减8，个位3小于8，所以3不够减8。",
      checks: [["14减9，个位4够不够减9？", ["不够", "不够减"]]],
      responseInstruction: "只说“够”或“不够”。",
    }),
    rule("breakTenSubtract", "break-ten-split", /把十几拆成10和几/, {
      explanation: "个位不够减，就把十几分成10和个位上的几，保留这个个位，先用10去减。",
      demonstration: "14可以拆成10和4。",
      checks: [["12可以拆成10和几？", ["2", "二"]]],
      responseInstruction: "只说另一部分。",
    }),
    rule("breakTenSubtract", "break-ten-subtract", /先用10去减/, {
      explanation: "先只算10减去减数，原来个位上的几暂时放在一边，下一步再加回来。",
      demonstration: "13减8，先算10减8等于2。",
      checks: [["15减7，用破十法先算10减7等于几？", ["3", "三"]]],
      responseInstruction: "只说这一步的结果。",
    }),
    rule("breakTenSubtract", "break-ten-add-back", /加回个位/, {
      explanation: "10减完后，还要把被减数原来的个位加回来。漏掉它，算的就不是原来的十几。",
      demonstration: "13减8，10减8等于2，再加原来的3，得到5。",
      checks: [["14减8，10减8等于2，再加原来的4，最后是多少？", ["6", "六"]]],
      responseInstruction: "只说最后结果。",
    }),
    rule("breakTenSubtract", "break-ten-check", /用想加算减检查/, {
      explanation: "减法可以想“差加减数能不能回到被减数”。能回去，答案就更可靠。",
      demonstration: "13减8等于5，因为5加8等于13。",
      checks: [["检查12减7等于5，可以算5加几等于12？", ["7", "七"]]],
      responseInstruction: "只说缺少的数。",
    }),

    rule("comparisonDifference", "difference-identify", /先找谁多谁少/, {
      explanation: "求多多少或少多少，先判断哪一个数量大、哪一个数量小，不能一看到两个数就相加。",
      demonstration: "小明8本，小红5本，先知道小明多、小红少。",
      checks: [["7朵红花和4朵黄花，谁多？", ["红花", "7朵红花"]]],
      responseInstruction: "只说多的那一种。",
    }),
    rule("comparisonDifference", "difference-pair", /用一一配对看多出的/, {
      explanation: "让两个数量一个对一个配对。配完后，大的一边没配上的部分，就是多出来的数量。",
      demonstration: "7和4配完4对，还剩3，所以多3。",
      checks: [["8个圆和6个方块配对后，圆剩几个？", ["2", "二", "2个", "两个"]]],
      responseInstruction: "只说剩下几个。",
    }),
    rule("comparisonDifference", "difference-subtract", /用大数减小数|说多多少或少多少/, {
      explanation: "配对后多出的数量也可以用大数减小数来算。最后要按问题说“多几”或“少几”。",
      demonstration: "9比5多多少，用9减5等于4，所以多4。",
      checks: [["8比3多多少？", ["5", "五", "多5"]]],
      responseInstruction: "只说相差多少。",
    }),
    rule("comparisonDifference", "difference-transfer", /换情境再比/, {
      explanation: "物品换了，求相差的方法不变：先找大数和小数，再用大数减小数。",
      demonstration: "书本可以比较，花朵、人数也可以用同样方法比较。",
      checks: [["小军有6支笔，小兰有2支，小军多几支？", ["4", "四", "4支", "四支"]]],
      responseInstruction: "只说相差几支。",
    }),

    rule("data", "data-category", /看分类标准|看调查项目/, {
      explanation: "读统计表先看每一行或每一列代表什么项目。项目没找准，后面的数量就会读错。",
      demonstration: "“苹果”这一行记录的是苹果数量，不能读成梨的数量。",
      checks: [["要找小猫有几只，应该先找到表里的哪个项目？", ["小猫", "小猫这一项", "小猫这一行"]]],
      responseInstruction: "只说要找的项目名称。",
    }),
    rule("data", "data-read", /读每一类数量|读每项票数/, {
      explanation: "找到项目后，沿着同一行或同一列读到数量。眼睛不要跳到旁边的项目。",
      demonstration: "“苹果”后面写5，就表示苹果有5个。",
      checks: [["表里“小狗”后面写4，小狗有几只？", ["4", "四", "4只", "四只"]]],
      responseInstruction: "只说数量。",
    }),
    rule("data", "data-compare", /比较多少|求多几或少几|找最多最少/, {
      explanation: "比较统计数据，先读出两个数量。问谁最多就直接比大小；问多几或少几，就用大数减小数。",
      demonstration: "苹果6个、梨4个，苹果多；多出的数量是6减4等于2。",
      checks: [["小猫7只，小狗5只，小猫多几只？", ["2", "二", "2只", "两只"]]],
      responseInstruction: "只说相差的数量。",
    }),
    rule("data", "data-total", /求一共就相加/, {
      explanation: "问几类合起来一共有多少，就把这些类别的数量相加。不能用最多的一类代替总数。",
      demonstration: "红花3朵、黄花4朵，一共是3加4等于7朵。",
      checks: [["苹果5个、梨2个，一共有几个水果？", ["7", "七", "7个", "七个"]]],
      responseInstruction: "只说总数。",
    }),
    rule("data", "data-evidence", /说从表里哪里看出|说表格依据/, {
      explanation: "回答依据时，要同时说项目和它对应的数量，不能只说“我看出来了”。",
      demonstration: "我看“苹果”这一项是6，“梨”这一项是4，所以苹果更多。",
      checks: [["表里红花8朵、黄花5朵。为什么说红花多？", ["因为8比5大", "红花8朵黄花5朵", "8大于5"]]],
      responseInstruction: "只说一句“因为……所以……”。",
    }),

    rule("money", "money-recognize", /认识元角分/, {
      explanation: "元、角、分都是钱的单位，但大小不同。读钱数时，数字后面的单位不能漏。",
      demonstration: "“2元”和“2角”的数字都是2，表示的钱数却不同。",
      checks: [["一枚硬币上写“5角”，它的单位是什么？", ["角"]]],
      responseInstruction: "只说单位名称。",
    }),
    rule("money", "money-yuan-jiao", /知道1元=10角/, {
      explanation: "1元可以换成10个1角，所以1元等于10角。几元就是几个10角。",
      demonstration: "2元是2个10角，也就是20角。",
      checks: [["4元等于多少角？", ["40", "四十", "40角", "四十角"]]],
      responseInstruction: "只说一共多少角。",
    }),
    rule("money", "money-jiao-fen", /知道1角=10分/, {
      explanation: "1角可以换成10个1分，所以1角等于10分。几角就是几个10分。",
      demonstration: "3角是3个10分，也就是30分。",
      checks: [["5角等于多少分？", ["50", "五十", "50分", "五十分"]]],
      responseInstruction: "只说一共多少分。",
    }),
    rule("money", "money-convert-yuan", /把元换成角/, {
      explanation: "把元换成角，就看有几个元，每1元换成10角。可以用元数乘10。",
      demonstration: "3元是3个10角，所以是30角。",
      checks: [["6元等于多少角？", ["60", "六十", "60角", "六十角"]]],
      responseInstruction: "只说一共多少角。",
    }),
    rule("money", "money-add-jiao", /再加原来的几角/, {
      explanation: "整元换成角后，还要加上题目原来就有的几角。这个零角不能漏。",
      demonstration: "2元4角先换成20角，再加4角，得到24角。",
      checks: [["3元6角等于多少角？", ["36", "三十六", "36角", "三十六角"]]],
      responseInstruction: "只说一共多少角。",
    }),
    rule("money", "money-reason-unit", /说清为什么先换单位/, {
      explanation: "元和角不是同一种单位，不能把数字直接相加。先换成同一种单位，数字才表示同样大小的钱。",
      demonstration: "2元和5角不能直接写成7角，要先把2元换成20角。",
      checks: [["为什么1元8角不能直接算成9角？", ["元和角单位不同", "要先把元换成角", "单位不一样"]]],
      responseInstruction: "只说一句原因。",
    }),

    rule("moneyApplication", "shopping-price", /看商品多少钱/, {
      explanation: "购物题先找到价格。价格是商品本身要花的钱，不是顾客拿出来的钱。",
      demonstration: "本子2元4角，付3元，商品价格是2元4角。",
      checks: [["铅笔1元5角，付2元。商品多少钱？", ["1元5角", "一元五角"]]],
      responseInstruction: "只说商品价格。",
    }),
    rule("moneyApplication", "shopping-paid", /看付了多少钱/, {
      explanation: "再找到实际付出的钱。它通常比价格多，找回的钱就从这里面剩下来。",
      demonstration: "本子2元4角，付3元，付出的是3元。",
      checks: [["橡皮1元，付5元。付了多少钱？", ["5元", "五元"]]],
      responseInstruction: "只说付出的钱。",
    }),
    rule("moneyApplication", "shopping-unify", /先统一单位/, {
      explanation: "价格和付出单位不同时，先全部换成元或全部换成角，不能把元和角直接相减。",
      demonstration: "付3元、价格2元4角，可以先把3元换成30角。",
      checks: [["付4元，价格3元2角。把4元换成多少角？", ["40", "四十", "40角", "四十角"]]],
      responseInstruction: "只说换成多少角。",
    }),
    rule("moneyApplication", "shopping-change", /用付的钱减价钱/, {
      explanation: "找回的钱是付出以后剩下的，所以用“付的钱减商品价格”，顺序不能反。",
      demonstration: "付30角，商品24角，找回30减24等于6角。",
      checks: [["商品3元，付5元，应找回多少？", ["2元", "二元", "2", "二"]]],
      responseInstruction: "只说找回多少钱。",
    }),
    rule("moneyApplication", "shopping-answer", /换回元角回答/, {
      explanation: "算出多少角后，按题目习惯换回几元几角，并把单位说完整。10角可以换成1元。",
      demonstration: "找回16角，可以说成1元6角。",
      checks: [["找回25角，可以说成几元几角？", ["2元5角", "二元五角"]]],
      responseInstruction: "只说“几元几角”。",
    }),
    rule("moneyApplication", "shopping-reason", /说清找回是剩下/, {
      explanation: "找回不是两笔钱合起来，而是从付出的钱里扣掉价格后剩下的部分，所以用减法。",
      demonstration: "付5元，花了3元，手里剩2元，这2元就是找回的钱。",
      checks: [["为什么找零钱用付的钱减价格？", ["因为找回是剩下的钱", "付出后减掉花掉的", "求剩下"]]],
      responseInstruction: "只说一句原因。",
    }),

    rule("pattern", "pattern-unit", /先找重复的一组/, {
      explanation: "重复规律要先圈出最短的一组，后面会把这一组一次次重复。不要只看最后一个。",
      demonstration: "红、蓝、红、蓝，最短重复组是“红、蓝”。",
      checks: [["圆、方、圆、方，最短重复组是什么？", ["圆方", "圆和方", "圆、方"]]],
      responseInstruction: "只说最短重复组。",
    }),
    rule("pattern", "pattern-change", /说每次怎么变/, {
      explanation: "数字规律要比较相邻两项，看看每次增加几或减少几，不能只猜下一个数。",
      demonstration: "2、5、8，相邻两项都加3，所以规律是每次加3。",
      checks: [["10、8、6、4，每次怎么变？", ["减2", "每次减2", "少2"]]],
      responseInstruction: "只说每次增加或减少几。",
    }),
    rule("pattern", "pattern-next", /按同样规律补下一个|自己续一个/, {
      explanation: "找到重复组或变化量后，就把同一个方法再做一次，得到下一项。",
      demonstration: "3、6、9每次加3，下一项就是12。",
      checks: [["4、7、10，下一项是多少？", ["13", "十三"]]],
      responseInstruction: "只说下一项。",
    }),
    rule("pattern", "pattern-check", /检查前后一致/, {
      explanation: "从开头逐项检查，每一次变化都要符合刚找到的规律。只看最后两项还不够。",
      demonstration: "2、4、6、8每次都加2，所以前后一致。",
      checks: [["3、6、9、12每次都加3吗？", ["是", "对", "是的"]]],
      responseInstruction: "只说“是”或“不是”。",
    }),

    rule("measure", "measure-length-kind", /看量的是长度/, {
      explanation: "先判断题目是不是在问物体有多长、多高或多远。这些都是长度问题。",
      demonstration: "问课桌有多长，是在量长度。",
      checks: [["问门有多高，是量长度还是质量？", ["长度"]]],
      responseInstruction: "只说“长度”或“质量”。",
    }),
    rule("measure", "measure-length-unit", /选厘米或米/, {
      explanation: "较短的小物体常用厘米，较长的房间、道路常用米。要让单位和物体大小合适。",
      demonstration: "铅笔长约15厘米，教室长约8米。",
      checks: [["量一张课桌的长度，用厘米还是米更合适？", ["厘米"]]],
      responseInstruction: "只说“厘米”或“米”。",
    }),
    rule("measure", "measure-meter-relation", /记住1米=100厘米/, {
      explanation: "1米正好等于100厘米。把米换成厘米，每1米都换成100厘米。",
      demonstration: "2米是2个100厘米，也就是200厘米。",
      checks: [["3米等于多少厘米？", ["300", "三百", "300厘米", "三百厘米"]]],
      responseInstruction: "只说一共多少厘米。",
    }),
    rule("measure", "measure-length-convert", /换成同一单位|带单位回答/, {
      explanation: "长度相加减或比较前，要先换成同一种长度单位。算完后按问题带上厘米或米。",
      demonstration: "1米20厘米可以先写成100厘米加20厘米，也就是120厘米。",
      checks: [["1米30厘米等于多少厘米？", ["130", "一百三十", "130厘米", "一百三十厘米"]]],
      responseInstruction: "只说结果，并带上长度单位。",
    }),
    rule("measure", "measure-weight-kind", /看量的是重量/, {
      explanation: "问物体有多重，是质量问题，不是长度问题。先分清量什么，再选单位。",
      demonstration: "问西瓜有多重，是量质量。",
      checks: [["问一袋米有多重，是量长度还是质量？", ["质量", "重量"]]],
      responseInstruction: "只说“长度”或“质量”。",
    }),
    rule("measure", "measure-weight-unit", /选克或千克/, {
      explanation: "较轻的小物品常用克，较重的物品常用千克。先估一估物体大约多重。",
      demonstration: "一枚硬币约几克，一袋大米常用千克。",
      checks: [["一个西瓜的质量用克还是千克更合适？", ["千克"]]],
      responseInstruction: "只说“克”或“千克”。",
    }),
    rule("measure", "measure-kilogram-relation", /记住1千克=1000克|先换成克/, {
      explanation: "1千克等于1000克。把千克换成克，每1千克都换成1000克。",
      demonstration: "2千克是2个1000克，也就是2000克。",
      checks: [["3千克等于多少克？", ["3000", "三千", "3000克"]]],
      responseInstruction: "只说一共多少克。",
    }),

    rule("mixedCalculation", "mixed-two-step-reason", /说清先后顺序/, {
      explanation: "连加、连减和加减混合，要沿着数量变化的顺序从左往右算。前一步的结果，是后一步的新起点。",
      demonstration: "8加2再减3，先算8加2，因为要先知道增加后的数量，才能接着减3。",
      checks: [["为什么8加2再减3要先算8加2？", ["因为要从左往右", "因为先增加再减少", "因为前一步结果是后一步起点", "从左往右"]]],
      responseInstruction: "请用一句话说明为什么先算前一步。",
    }),
    rule("mixedCalculation", "mixed-two-step-order", /看有几步|先算第一步|记住中间结果|再算第二步/, {
      explanation: "连加、连减或加减混合要从左往右，一步一步算。先把第一步结果记住，再和后面的数继续算。",
      demonstration: "8加2再减3，先算8加2等于10，再算10减3。",
      checks: [["6加4再减2，第一步的结果是多少？", ["10", "十"]]],
      responseInstruction: "只说第一步的结果。",
    }),
    rule("mixedCalculation", "mixed-mul-reason", /说清为什么先乘/, {
      explanation: "乘加、乘减里，乘法表示同样多的几组。要先算出这些整组一共有多少，再处理多出来或少掉的部分。",
      demonstration: "3组每组4个，另有2个，要先算3乘4，因为先要知道3整组共有多少。",
      checks: [["3组每组4个，另有2个，为什么先算3乘4？", ["因为先算整组", "因为先算3组有多少", "因为乘法表示3个4", "先知道整组有多少"]]],
      responseInstruction: "请用一句话说明为什么先算乘法。",
    }),
    rule("mixedCalculation", "mixed-mul-extra", /先看几个几|先算乘法部分|再加或减多出的部分|写最终结果/, {
      explanation: "乘加、乘减先把同样多的几组算成乘法，再处理多出或少掉的部分。这样不会把“每组几个”和“额外几个”混在一起。",
      demonstration: "3组每组4个，另有2个，先算3乘4等于12，再加2等于14。",
      checks: [["2组每组5个，另有3个，一共多少？", ["13", "十三"]]],
      responseInstruction: "只说最后结果。",
    }),
    rule("mixedCalculation", "mixed-operation-reason", /说清运算顺序/, {
      explanation: "没有括号的混合运算要先乘除、后加减。说顺序时，要指出先算哪一部分，再算哪一部分。",
      demonstration: "2加3乘4，先算3乘4，再算2加12。",
      checks: [["5加2乘3按什么顺序算？", ["先算2乘3再算5加6", "先乘后加", "先算乘法再算加法"]]],
      responseInstruction: "请说完整顺序：先算什么，再算什么。",
    }),
    rule("mixedCalculation", "mixed-operation-order", /先看有没有乘除|先算乘除部分|把中间结果放回原式|再算加减/, {
      explanation: "没有括号的混合运算，先算乘除，再算加减。算出的中间结果要放回原式，不能跳着算。",
      demonstration: "2加3乘4，先算3乘4等于12，再算2加12。",
      checks: [["5加2乘3，第一步先算什么？", ["2乘3", "二乘三", "2×3", "乘法"]]],
      responseInstruction: "只说第一步算什么。",
    }),

    rule("angle", "angle-vertex-and-sides", /找顶点和边|顶点和两条边/, {
      explanation: "角由一个顶点和两条边组成。两条边从同一个顶点向两个方向伸出去。",
      demonstration: "把两根小棒的一端碰在一起，碰到的地方是顶点，两根小棒表示两条边。",
      checks: [["一个角有几个顶点、几条边？", ["1个顶点2条边", "一个顶点两条边", "1个顶点和2条边", "一个顶点和两条边"]]],
      responseInstruction: "请按“几个顶点、几条边”回答。",
    }),
    rule("angle", "angle-vertex", /找角的顶点/, {
      explanation: "两条边相交的那个点叫角的顶点。一个角只有一个顶点。",
      demonstration: "把两根小棒的一端碰在一起，碰到的点就是顶点。",
      checks: [["角的两条边相交的点叫什么？", ["顶点", "角的顶点"]]],
      responseInstruction: "只说名称。",
    }),
    rule("angle", "angle-sides", /找两条边/, {
      explanation: "从顶点向两个方向伸出去的两条直线叫角的边。边画长或画短，不会改变角的大小。",
      demonstration: "同一个张口，把两条边延长，角还是原来那么大。",
      checks: [["一个角有几条边？", ["2", "二", "两条", "2条"]]],
      responseInstruction: "只说有几条边。",
    }),
    rule("angle", "angle-opening", /看张开大小/, {
      explanation: "角的大小看两条边张开的程度，不看边有多长。张口越大，角越大。",
      demonstration: "两把扇子边长一样，打开得更宽的那把形成的角更大。",
      checks: [["判断角的大小，看边长还是看张口？", ["张口", "张开大小", "张口大小"]]],
      responseInstruction: "只说“边长”或“张口”。",
    }),
    rule("angle", "angle-right-compare", /和直角比|说锐角直角钝角/, {
      explanation: "用三角尺的直角来比：比直角小的是锐角，和直角一样大的是直角，比直角大的是钝角。",
      demonstration: "一个角的张口比直角小，所以它是锐角。",
      checks: [["一个角比直角大，它是什么角？", ["钝角"]]],
      responseInstruction: "只说角的名字。",
    }),

    rule("multiplication", "multiply-group-size", /看每组有几个|说几个几/, {
      explanation: "乘法情境先看每一组是不是同样多，再说每组有几个。每组数和组数不能说反。",
      demonstration: "4盘苹果，每盘3个，每组有3个。",
      checks: [["5盒彩笔，每盒2支。每组有几支？", ["2", "二", "2支", "两支"]]],
      responseInstruction: "只说每组有几个。",
    }),
    rule("multiplication", "multiply-group-count", /看有几组/, {
      explanation: "每组同样多以后，再数一共有几组。组数告诉我们这个相同的数出现了几次。",
      demonstration: "4盘苹果就是4组。",
      checks: [["每袋3个球，一共有6袋。有几组？", ["6", "六", "6组", "六组"]]],
      responseInstruction: "只说有几组。",
    }),
    rule("multiplication", "multiply-meaning", /说成几个几/, {
      explanation: "把“每组几个”和“有几组”合起来说成“几个几”。前面说组数，后面说每组数。",
      demonstration: "4盘，每盘3个，就是4个3。",
      checks: [["5盒，每盒2支，可以说成几个几？", ["5个2", "五个二"]]],
      responseInstruction: "只说“几个几”。",
    }),
    rule("multiplication", "multiply-expression", /列乘法|列乘法式/, {
      explanation: "几个几可以写成乘法。每组数乘组数，或组数乘每组数，积相同。",
      demonstration: "4个3可以写成3乘4，也可以写成4乘3。",
      checks: [["5个2可以列成什么乘法算式？", ["2×5", "5×2", "2乘5", "5乘2"]]],
      responseInstruction: "只说一个乘法算式，不用算结果。",
    }),
    rule("multiplication", "multiply-fact", /用口诀算|找对应口诀|算出积|换顺序也能算/, {
      explanation: "算乘法时，先让两个因数对应到一句口诀。交换两个因数，积不变，可以用同一句口诀。",
      demonstration: "6乘7想“六七四十二”，所以积是42；7乘6也是42。",
      checks: [["8乘7等于多少？", ["56", "五十六"]]],
      responseInstruction: "只说积。",
    }),

    rule("observation", "observe-position", /先确定站的位置|选正面侧面上面/, {
      explanation: "同一个物体从不同位置看，样子会变。先确定自己站在正面、侧面还是上面，再选对应的图。",
      demonstration: "从杯子上面看，主要看到圆形杯口。",
      checks: [["想看清桌面的形状，应该从哪个方向看？", ["上面", "从上面"]]],
      responseInstruction: "只说观察方向。",
    }),
    rule("observation", "observe-feature", /看能看到的面|找关键特征/, {
      explanation: "确定方向后，找这个方向最明显的特征，例如能看到哪个面、把手在左还是右。",
      demonstration: "从杯子侧面看，能看到杯身和旁边的杯柄。",
      checks: [["看到圆形杯口，最可能是从哪里看？", ["上面", "从上面"]]],
      responseInstruction: "只说观察方向。",
    }),
    rule("observation", "observe-evidence", /说从哪里看出来/, {
      explanation: "说明理由时要把方向和证据连起来，说“我从哪里看，看到什么特征”。",
      demonstration: "我从上面看，看到圆形杯口，所以这是上视图。",
      checks: [["为什么这张图是杯子的上视图？", ["因为看到圆形杯口", "从上面看到杯口", "看到杯口"]]],
      responseInstruction: "只说一句你看到了什么特征。",
    }),

    rule("time", "time-hour", /先看短针定几时/, {
      explanation: "先看短针。短针指向几或刚过几，就表示现在是几时；这一步先不看分钟。",
      demonstration: "短针刚过4，说明是4时多。",
      checks: [["短针刚过6，现在是几时多？", ["6", "六", "6时", "六时"]]],
      responseInstruction: "只说几时。",
    }),
    rule("time", "time-minute", /再看长针数几分/, {
      explanation: "长针走一大格是5分。从12开始，指向数字几，就用几乘5得到分钟。",
      demonstration: "长针指向4，4个5分是20分。",
      checks: [["长针指向7，表示多少分？", ["35", "三十五", "35分", "三十五分"]]],
      responseInstruction: "只说多少分。",
    }),
    rule("time", "time-read", /合起来读时间|换钟面再读/, {
      explanation: "把短针读出的小时和长针读出的分钟合起来，按“几时几分”说完整。",
      demonstration: "短针过3，长针指2表示10分，合起来是3时10分。",
      checks: [["短针过5，长针指6，是什么时间？", ["5时30分", "五时三十分", "5点30分"]]],
      responseInstruction: "只说完整时间。",
    }),
    rule("time", "time-digital", /写成电子时间/, {
      explanation: "电子时间用冒号隔开小时和分钟。分钟不到10时，前面要补0。",
      demonstration: "8时5分写作8:05，不能写成8:5。",
      checks: [["6时8分写成电子时间是什么？", ["6:08", "06:08"]]],
      responseInstruction: "只说电子时间。",
    }),

    rule("timeDuration", "duration-start", /找开始时间/, {
      explanation: "经过时间有两个时刻。先圈出事情开始的时刻，它是时间线的起点。",
      demonstration: "3:20开始、4:00结束，开始时刻是3:20。",
      checks: [["8:10开始，9:00结束。开始时刻是什么？", ["8:10", "八时十分"]]],
      responseInstruction: "只说开始时刻。",
    }),
    rule("timeDuration", "duration-end", /找结束时间/, {
      explanation: "再圈出结束时刻。经过多久，就是从开始时刻走到结束时刻一共走了多少时间。",
      demonstration: "3:20开始、4:00结束，结束时刻是4:00。",
      checks: [["7:30开始，8:15结束。结束时刻是什么？", ["8:15", "八时十五分"]]],
      responseInstruction: "只说结束时刻。",
    }),
    rule("timeDuration", "duration-same-hour", /先算同一小时内经过几分/, {
      explanation: "如果开始和结束在同一小时，就用结束的分钟减开始的分钟。",
      demonstration: "3:10到3:40，40减10等于30，所以经过30分。",
      checks: [["5:20到5:50经过多少分？", ["30", "三十", "30分", "三十分"]]],
      responseInstruction: "只说经过多少分。",
    }),
    rule("timeDuration", "duration-cross-hour", /跨小时就分段/, {
      explanation: "跨小时先走到下一个整时，再从整时走到结束，两段时间加起来。",
      demonstration: "3:50到4:10，先走10分到4:00，再走10分，共20分。",
      checks: [["2:45到3:15经过多少分？", ["30", "三十", "30分", "三十分"]]],
      responseInstruction: "只说经过多少分。",
    }),
    rule("timeDuration", "duration-unit", /带分回答/, {
      explanation: "经过时间的结果要带上“分”或“小时”，不要只说数字，也不要说成一个时刻。",
      demonstration: "从2:10到2:30经过20分，答案是“20分”。",
      checks: [["从6:00到7:00经过多久？", ["1小时", "一小时", "60分", "六十分"]]],
      responseInstruction: "说出时长，并带上时间单位。",
    }),

    rule("arrangement", "arrange-first", /先看第一类有几种/, {
      explanation: "搭配题先数第一类有几种选择，把它们按顺序排好，后面逐个固定。",
      demonstration: "有2件上衣，第一类就有2种选择。",
      checks: [["有3顶帽子和2条围巾，第一类帽子有几种？", ["3", "三", "3种", "三种"]]],
      responseInstruction: "只说第一类有几种。",
    }),
    rule("arrangement", "arrange-second", /再看第二类有几种/, {
      explanation: "再数第二类有几种。第一类每一种都要和第二类的每一种配一次。",
      demonstration: "2件上衣、3条裤子，第二类有3种裤子。",
      checks: [["2顶帽子和4条围巾，第二类有几种？", ["4", "四", "4种", "四种"]]],
      responseInstruction: "只说第二类有几种。",
    }),
    rule("arrangement", "arrange-reason", /说清不漏不重复/, {
      explanation: "不漏不重复的关键，是按固定顺序搭配。先固定第一类的一种，把第二类逐个配完，再换下一种。",
      demonstration: "先固定红帽子配完每条围巾，再换蓝帽子。因为顺序固定，所以不会漏也不会重复。",
      checks: [["怎样搭配才不会漏也不会重复？", ["先固定一种再逐个配", "按顺序搭配", "一种一种配完再换"]]],
      responseInstruction: "请用一句话说出怎样按顺序搭配。",
    }),
    rule("arrangement", "arrange-systematic", /每一种都配一遍/, {
      explanation: "先固定第一类的一种，和第二类逐个搭配；配完再换下一种。这样有固定顺序，才不会漏也不会重复。",
      demonstration: "先固定红帽子配每条围巾，再固定蓝帽子配每条围巾。",
      checks: [["怎样搭配才不漏不重复？", ["先固定一种再逐个配", "按顺序搭配", "每一种都配一遍"]]],
      responseInstruction: "只说一句搭配方法。",
    }),
    rule("arrangement", "arrange-count", /用乘法算种数/, {
      explanation: "第一类有几种，第二类每种都能配那么多次，可以用两类的种数相乘求总搭配数。",
      demonstration: "2件上衣和3条裤子有2乘3等于6种搭配。",
      checks: [["3顶帽子和2条围巾有几种搭配？", ["6", "六", "6种", "六种"]]],
      responseInstruction: "只说总搭配数。",
    }),

    rule("division", "divide-average", /看是不是平均分|每份同样多/, {
      explanation: "平均分要求每份同样多。可以一个一个轮流分，直到分完，再检查每份数量是否相等。",
      demonstration: "8个苹果分2盘，每盘放4个，两盘一样多。",
      checks: [["8个球分成两份，一份3个、一份5个，是平均分吗？", ["不是", "不对", "不是平均分"]]],
      responseInstruction: "只说“是”或“不是”。",
    }),
    rule("division", "divide-total-parts", /看总数|看分成几份/, {
      explanation: "先分清总数和份数。总数是所有物品的数量，份数是要平均分成几组。",
      demonstration: "12块糖平均分给3人，总数是12，份数是3。",
      checks: [["15个球平均放进5个盒子，总数是多少？", ["15", "十五"]]],
      responseInstruction: "只说总数。",
    }),
    rule("division", "divide-fact", /看除数是几|想几的口诀|找几乘除数等于被除数/, {
      explanation: "求商可以想乘法：除数乘几正好等于被除数，这个几就是商。",
      demonstration: "18除以3，想3乘6等于18，所以商是6。",
      checks: [["20除以4，想4乘几等于20？", ["5", "五"]]],
      responseInstruction: "只说缺少的数。",
    }),
    rule("division", "divide-quotient", /写商/, {
      explanation: "找到“除数乘几等于被除数”后，把这个几写在商的位置。商表示每份几个或能分成几份。",
      demonstration: "12除以3等于4，商是4。",
      checks: [["16除以4的商是多少？", ["4", "四"]]],
      responseInstruction: "只说商。",
    }),
    rule("division", "divide-check", /用乘法检查|用乘法验算/, {
      explanation: "没有余数的除法可以用商乘除数检查。乘回去等于被除数，答案就对。",
      demonstration: "15除以3等于5，用5乘3等于15检查。",
      checks: [["检查18除以3等于6，可以算6乘几？", ["3", "三"]]],
      responseInstruction: "只说缺少的乘数。",
    }),

    rule("remainderDivision", "remainder-givens", /看总数和每份几个/, {
      explanation: "先找总数和每份几个。每份数就是除数，决定一组要拿走多少。",
      demonstration: "14个球，每盒4个，总数14，每份4。",
      checks: [["17块糖，每袋5块。每份几个？", ["5", "五", "5个", "五个"]]],
      responseInstruction: "只说每份几个。",
    }),
    rule("remainderDivision", "remainder-full-groups", /找最多能分几份/, {
      explanation: "用乘法找不超过总数的最大整组。再多一组会超过，就停在这里。",
      demonstration: "14个每组4个，4乘3是12，4乘4是16超过14，所以最多3组。",
      checks: [["17个每组5个，最多能分几组？", ["3", "三", "3组", "三组"]]],
      responseInstruction: "只说最多几组。",
    }),
    rule("remainderDivision", "remainder-left", /算还剩几个/, {
      explanation: "先算整组一共用了多少，再用总数减去已经用掉的，得到余数。",
      demonstration: "14个分3组，每组4个，用了12个，还剩14减12等于2个。",
      checks: [["17个每组5个，装满3组用了15个，还剩几个？", ["2", "二", "2个", "两个"]]],
      responseInstruction: "只说还剩几个。",
    }),
    rule("remainderDivision", "remainder-limit", /余数要比除数小/, {
      explanation: "余数必须比除数小。余数如果还能装满一组，就说明刚才的商还不够大。",
      demonstration: "除数是4时，余数只能是0、1、2或3，不能是4。",
      checks: [["除数是5，余数可以是6吗？", ["不可以", "不能", "不行"]]],
      responseInstruction: "只说“可以”或“不可以”。",
    }),
    rule("remainderDivision", "remainder-write", /写商和余数/, {
      explanation: "结果要先写能分成的整组数，再写剩下的余数，读作“商余余数”。",
      demonstration: "14除以4能分3组剩2，写成3余2。",
      checks: [["11除以3能分3组剩2，结果怎么说？", ["3余2", "三余二"]]],
      responseInstruction: "只说“几余几”。",
    }),

    rule("remainderApplication", "remainder-app-full", /先算能装满几份/, {
      explanation: "生活题也先算能装满多少整份，找到商和余数，再判断余下的人或物怎么办。",
      demonstration: "13人每车4人，先知道能坐满3车，还剩1人。",
      checks: [["17个球每盒5个，能装满几盒？", ["3", "三", "3盒", "三盒"]]],
      responseInstruction: "只说能装满几份。",
    }),
    rule("remainderApplication", "remainder-app-left", /看剩下还有没有人或物/, {
      explanation: "算完整份后一定要看余数。余数表示还有人或物没有安排，不能当作没有。",
      demonstration: "13人每车4人，剩下1人，这1人仍然需要坐车。",
      checks: [["10人每桌4人，坐满2桌后还剩几人？", ["2", "二", "2人", "两人"]]],
      responseInstruction: "只说还剩几人。",
    }),
    rule("remainderApplication", "remainder-app-decision", /判断要不要再加一份|区分进一和去尾/, {
      explanation: "看余下的东西是否必须被装下。装人、装物时只要还有剩余，就要再加一个容器；只算完整组时，剩余不算一组。",
      demonstration: "13人每车4人，3车还剩1人，所以要再加1车，共4车。",
      checks: [["10人每桌4人，至少要几张桌子？", ["3", "三", "3张", "三张"]]],
      responseInstruction: "只说最后需要几份。",
    }),
    rule("remainderApplication", "remainder-app-reason", /说清生活理由/, {
      explanation: "说理由时要指出余下的人或物是否还需要安排。不是只背“加一”，而是说明为什么要加或不加。",
      demonstration: "还剩1个人也要坐车，所以必须再加1辆。",
      checks: [["装人时还剩2人，为什么要再加一辆车？", ["因为剩下的人也要坐车", "还有2人没安排", "人不能留下"]]],
      responseInstruction: "只说一句生活中的原因。",
    }),

    rule("logic", "logic-first", /读第一条条件/, {
      explanation: "推理时一次只读一条条件，把它直接排除的不可能选项划掉，不要同时猜答案。",
      demonstration: "小球不在1号，先只划掉1号。",
      checks: [["条件是“小红不在左边”，先划掉哪个位置？", ["左边", "左"]]],
      responseInstruction: "只说先排除的位置。",
    }),
    rule("logic", "logic-eliminate", /划掉不可能/, {
      explanation: "条件明确说“不在”或“不可能”的选项要划掉。划掉的是不符合条件的，不是你喜欢的答案。",
      demonstration: "“不是红色”就先排除红色。",
      checks: [["“小球不在2号盒”，应该先排除几号？", ["2", "二", "2号", "二号"]]],
      responseInstruction: "只说要排除的选项。",
    }),
    rule("logic", "logic-next", /读下一条条件|看剩下谁可能/, {
      explanation: "处理完第一条，再读下一条继续排除。最后没有被排除的选项才可能是答案。",
      demonstration: "不在1号，也不在3号，三个盒子里只剩2号可能。",
      checks: [["不在左边，也不在中间，剩下哪里可能？", ["右边", "右"]]],
      responseInstruction: "只说剩下的选项。",
    }),
    rule("logic", "logic-check", /检查全部条件/, {
      explanation: "得到答案后，把它放回每一条条件检查。每条都符合才算完成，只符合一条还不够。",
      demonstration: "选2号后检查：它不是1号，也不是3号，两条都符合。",
      checks: [["不在左边也不在中间，选右边符合全部条件吗？", ["符合", "是", "对"]]],
      responseInstruction: "只说“符合”或“不符合”。",
    }),
  ];

  function normalize(value) {
    return String(value || "").replace(/\s+/g, "");
  }

  function resolve(family, label) {
    const text = normalize(label);
    const found = rules.find((entry) => entry.family === family && entry.match.test(text));
    return found ? { ...found, qualityProfileMatched: true } : null;
  }

  function getRuleIds() {
    return rules.map((entry) => entry.id);
  }

  window.LezhiMicrostepQualityProfiles = { resolve, getRuleIds };
})();
