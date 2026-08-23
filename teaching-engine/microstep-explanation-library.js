(function () {
  const SOURCES = ["moe-2022-math-standard", "pep-primary-math-pedagogy", "pep-new-textbook-intro"];

  function item(data) {
    return {
      visualType: "generic",
      responseInstruction: "只说答案就可以。",
      checks: [],
      ...data,
    };
  }

  const library = {
    count: item({
      visualType: "count",
      explanation: "数东西时，要让每个东西只配一个数。可以从左边开始，点一个数一个，数过的就不再数。最后说出的数，就是一共有几个。",
      demonstration: "比如有4块积木，点着说1、2、3、4，最后说到4，所以一共有4块。",
      checks: [
        ["图里有5颗星，一个一个点数，一共有几颗？", ["5", "五", "5颗", "五颗"]],
        ["图里有3支铅笔，从左往右数，一共有几支？", ["3", "三", "3支", "三支"]],
      ],
    }),
    compare: item({
      visualType: "compare",
      explanation: "比较两边时，先分别说清左边和右边有多少，再看谁多。也可以把两边一个对一个配起来，哪边还有剩下，哪边就多。",
      demonstration: "比如左边2个，右边4个。配掉2对后，右边还剩2个，所以右边大。",
      checks: [
        ["左边有4个，右边有2个。哪边大？", ["左边", "左", "左边大", "4"]],
        ["左边是3，右边是5。哪边大？", ["右边", "右", "右边大", "5", "五"]],
      ],
    }),
    ordinal: item({
      visualType: "position",
      explanation: "第几个说的是位置，所以第一件事是定方向：从左数，还是从右数。方向定好，再从1开始一个一个数到那个位置。",
      demonstration: "比如从左数第3个，就从最左边开始说第1、第2、第3，停下来的那个就是答案。",
      checks: [
        ["5个小朋友排队，从左数，小明在第2个。小明是第几个？", ["2", "二", "第2", "第二"]],
        ["从右边开始数，星星在第3个。星星是第几个？", ["3", "三", "第3", "第三"]],
      ],
    }),
    composition: item({
      visualType: "ten-frame",
      explanation: "分与合先看总数，总数不能变。知道总数和其中一部分，就想还差几个能合回总数。",
      demonstration: "比如5分成2和几。已经有2，再补3就回到5，所以另一部分是3。",
      checks: [
        ["6可以分成2和几？", ["4", "四"]],
        ["7可以分成3和几？", ["4", "四"]],
      ],
    }),
    concreteAddition: item({
      visualType: "count",
      explanation: "加法表示把两部分合起来。先找第一部分，再找第二部分，最后把它们放在一起数一共。",
      demonstration: "桌上原来有3个苹果，又放来2个。把3和2合起来，3加2等于5。",
      checks: [
        ["盒里有2个球，又放进3个，现在一共有几个？", ["5", "五", "5个", "五个"]],
        ["树上有4只鸟，又飞来2只，一共有几只？", ["6", "六", "6只", "六只"]],
      ],
    }),
    concreteSubtraction: item({
      visualType: "count",
      explanation: "减法表示从原来的一些里面拿走一部分，看看还剩多少。先说原来有多少，再划掉拿走的，最后数剩下的。",
      demonstration: "原来有6块饼干，吃掉2块。划掉2块后还剩4块，所以6减2等于4。",
      checks: [
        ["原来有7支笔，拿走3支，还剩几支？", ["4", "四", "4支", "四支"]],
        ["盘里有5个橘子，吃掉2个，还剩几个？", ["3", "三", "3个", "三个"]],
      ],
    }),
    calculation: item({
      visualType: "number-line",
      explanation: "计算前先看清运算符号和数字。加法可以往后接着数，减法可以往前倒着数；数字变大时，再选择凑十、破十或按数位算。",
      demonstration: "比如6加3，从6后面接着数3个：7、8、9，所以结果是9。",
      checks: [
        ["7加2等于多少？", ["9", "九"]],
        ["8减3等于多少？", ["5", "五"]],
      ],
    }),
    makeTenAdd: item({
      visualType: "ten-frame",
      explanation: "进位加法可以先凑成10。先看哪个数快到10、还差几，再从另一个数里拿出这几个补满10，最后加剩下的。",
      demonstration: "9加4，9差1到10，就把4分成1和3。先算9加1等于10，再算10加3等于13。",
      checks: [
        ["8加5，先拿出几给8凑成10？", ["2", "二"]],
        ["9加6，先拿出几给9凑成10？", ["1", "一"]],
      ],
    }),
    breakTenSubtract: item({
      visualType: "ten-frame",
      explanation: "十几减几时，如果个位不够减，就把十几看成10和几。先用10去减，再把原来留下的几个加回来。",
      demonstration: "13减9，把13看成10和3。10减9等于1，再加3，得到4。",
      checks: [
        ["12减8，用破十法先算10减8等于几？", ["2", "二"]],
        ["14减9，把14拆成10和几？", ["4", "四"]],
      ],
    }),
    mixedCalculation: item({
      visualType: "number-line",
      explanation: "多步算式不能一口气乱算。先看有没有括号，有括号先算括号；没有括号时，有乘除先算乘除，只有同一级才从左往右。",
      demonstration: "2加3乘4，要先算3乘4等于12，再算2加12。",
      checks: [
        ["5加2乘3，第一步先算什么？", ["2乘3", "2×3", "二乘三", "乘法"]],
        ["8减2加1，只有加减，应该从哪边开始？", ["左边", "从左", "左"]],
      ],
    }),
    application: item({
      visualType: "logic",
      explanation: "解决问题先读最后一句，弄清题目到底要找什么。再圈出和这个问题有关的数字，最后才判断是合起来还是拿走。",
      demonstration: "停车场原来4辆，又来3辆，问现在一共几辆。问题是一共，所以把4和3合起来。",
      checks: [
        ["篮子里有5个苹果，又放进2个，问一共有几个。应该用加法还是减法？", ["加法", "加", "+"]],
        ["原来有8只气球，飞走3只，问还剩几只。应该用什么运算？", ["减法", "减", "-"]],
      ],
    }),
    money: item({
      visualType: "money",
      explanation: "元、角、分是不同单位，不能把数字直接放在一起算。先记住1元等于10角、1角等于10分，再把它们换成同一种单位。",
      demonstration: "2元就是2个10角，也就是20角。2元4角就是20角再加4角，等于24角。",
      checks: [
        ["3元等于多少角？", ["30", "三十", "30角", "三十角"]],
        ["2元6角等于多少角？", ["26", "二十六", "26角", "二十六角"]],
      ],
    }),
    moneyApplication: item({
      visualType: "money",
      explanation: "购物题先分清三件事：商品多少钱、付了多少钱、问的是不是找回。找回的钱是付出后剩下的，所以用付的钱减商品价格；元角不同要先统一单位。",
      demonstration: "练习本2元4角，付3元。先把3元换成30角，再用30角减24角，找回6角。",
      checks: [
        ["一支笔2元，付5元，应找回几元？", ["3", "三", "3元", "三元"]],
        ["橡皮3元，付5元，找回多少钱？", ["2", "二", "2元", "二元"]],
      ],
    }),
    multiplication: item({
      visualType: "array",
      explanation: "乘法先看是不是每组同样多。先说每组几个，再说有几组，这就是几个几，最后才用乘法和口诀求一共。",
      demonstration: "每盘3个苹果，有4盘，就是4个3，可以写成3乘4等于12。",
      checks: [
        ["每组2个，有5组，是几个2？", ["5个2", "五个二", "5组", "五组"]],
        ["每盒彩笔4支，有3盒，一共有几支？", ["12", "十二", "12支", "十二支"]],
      ],
    }),
    division: item({
      visualType: "sharing",
      explanation: "平均分就是每份要一样多。可以一个一个轮流分，直到分完，再看每份有几个，或者能分成几份。",
      demonstration: "12块糖平均分给3个人，一个一个轮流分，最后每人4块，所以12除以3等于4。",
      checks: [
        ["8个苹果平均放进2个盘子，每盘几个？", ["4", "四", "4个", "四个"]],
        ["10颗糖，每人2颗，可以分给几人？", ["5", "五", "5人", "五人"]],
      ],
    }),
    time: item({
      visualType: "clock",
      explanation: "看钟面先分清两根针。短针告诉我们几时，长针指向12表示整时，指向6表示半时。",
      demonstration: "短针指向3，长针指向12，就是3时。",
      checks: [
        ["短针指向5，长针指向12，是几时？", ["5", "五", "5时", "五时"]],
        ["短针在7和8中间，长针指向6，是7时几分？", ["30", "三十", "30分", "三十分"]],
      ],
    }),
    measure: item({
      visualType: "ruler",
      explanation: "选单位先看要量的是什么，再想它大约有多大。小物体长度常用厘米，较长距离用米；轻的东西常用克，较重的用千克。",
      demonstration: "铅笔盒的长度适合用厘米，教室的长度适合用米。",
      checks: [
        ["量一支铅笔的长度，用厘米还是米？", ["厘米"]],
        ["一袋大米的质量，用克还是千克？", ["千克"]],
      ],
    }),
    placeValue: item({
      visualType: "place-value",
      explanation: "数字站的位置不同，表示的大小就不同。十位上的数表示几个十，个位上的数表示几个一。",
      demonstration: "34里，3在十位，表示3个十；4在个位，表示4个一。",
      checks: [
        ["52里面，5表示几个十？", ["5", "五", "5个十", "五个十"]],
        ["47里面，个位上的数是几？", ["7", "七"]],
      ],
    }),
    shape: item({
      visualType: "shape",
      explanation: "判断图形不能只看它摆放的方向，要看稳定的特征。平面图形看边和角，立体图形看有几个面、面是什么形状。",
      demonstration: "一个正方形转斜了，还是有4条一样长的边和4个直角，所以仍是正方形。",
      checks: [
        ["有3条边、3个角的平面图形是什么？", ["三角形"]],
        ["四条边一样长、四个角都是直角，是什么图形？", ["正方形"]],
      ],
    }),
    data: item({
      visualType: "data",
      explanation: "看统计图或表格，先找清楚每一类对应哪一行哪一列，再读数量。问一共就合起来，问相差就用大数减小数。",
      demonstration: "苹果有5个，梨有3个。问一共就是5加3；问苹果比梨多几个，就是5减3。",
      checks: [
        ["表里小猫有6只，小狗有4只。小猫比小狗多几只？", ["2", "二", "2只", "两只"]],
        ["红花3朵，黄花5朵，一共有几朵？", ["8", "八", "8朵", "八朵"]],
      ],
    }),
    logic: item({
      visualType: "logic",
      explanation: "推理题不要靠猜。先找到最确定的条件，把不可能的选项划掉，再用剩下的条件检查。",
      demonstration: "小明不是第一名，也不是第三名，只有三个人参加，所以小明只能是第二名。",
      checks: [
        ["小红不在左边，也不在中间，她在哪里？", ["右边", "右"]],
        ["三个盒子里，小球不在1号也不在3号，小球在哪个盒子？", ["2", "二", "2号", "二号"]],
      ],
    }),
    pattern: item({
      visualType: "pattern",
      explanation: "找规律先看相邻两个怎么变，或者先圈出重复的一组。找到变化方法后，再按同样的方法接下去。",
      demonstration: "2、4、6，每次都加2，所以下一个数是8。",
      checks: [
        ["1、3、5，后面一个数是多少？", ["7", "七"]],
        ["红、蓝、红、蓝，接下来是什么颜色？", ["红", "红色"]],
      ],
    }),
    comparisonDifference: item({
      visualType: "compare",
      explanation: "求多多少或少多少，先判断谁多谁少，再把两边一一配对。配完后多出来的，就是相差多少，也可以用大数减小数。",
      demonstration: "小明有7本书，小红有4本。配掉4本后还多3本，所以7减4等于3。",
      checks: [
        ["8比5多几？", ["3", "三"]],
        ["小军有6支笔，小兰有2支，小军比小兰多几支？", ["4", "四", "4支", "四支"]],
      ],
    }),
    arrangement: item({
      visualType: "logic",
      explanation: "搭配问题要按顺序，才不会漏也不会重复。可以先固定一种，再让另一种逐个搭配，做完再换。",
      demonstration: "2件上衣和3条裤子，先固定第一件上衣配3条裤子，再换第二件上衣，也配3条。",
      checks: [
        ["2顶帽子和2条围巾，一共有几种不同搭配？", ["4", "四", "4种", "四种"]],
        ["1件上衣和3条裤子，一共有几种搭配？", ["3", "三", "3种", "三种"]],
      ],
    }),
    observation: item({
      visualType: "position",
      explanation: "观察物体先想自己站在哪里，再找那个方向能看到的关键特征。同一个物体，站的位置变了，看到的样子也会变。",
      demonstration: "从杯子正面能看到杯身和杯柄在一边，从上面主要看到杯口的圆。",
      checks: [
        ["从上面看一个圆柱，最像什么平面图形？", ["圆", "圆形"]],
        ["想看桌子的桌面形状，应该从上面还是下面看？", ["上面", "从上面"]],
      ],
    }),
    timeDuration: item({
      visualType: "clock",
      explanation: "经过时间先找开始时刻和结束时刻，再沿着钟面或时间线往前走，数一共走了多久。",
      demonstration: "2时开始，4时结束，从2走到3是一小时，从3走到4又一小时，一共2小时。",
      checks: [
        ["3时开始，5时结束，经过几小时？", ["2", "二", "2小时", "两小时"]],
        ["8时开始，9时结束，经过多久？", ["1", "一", "1小时", "一小时"]],
      ],
    }),
    angle: item({
      visualType: "angle",
      explanation: "角有一个顶点和两条边。角的大小看两条边张开的大小，不看边画得多长；可以拿三角尺的直角来比。",
      demonstration: "比直角张口小的是锐角，比直角张口大的是钝角。",
      checks: [
        ["一个角比直角小，它是什么角？", ["锐角"]],
        ["一个角比直角大，它是什么角？", ["钝角"]],
      ],
    }),
    remainderDivision: item({
      visualType: "sharing",
      explanation: "有余数的除法先尽量平均分。看最多能分满几份，再数剩下几个；剩下的数一定要比除数小。",
      demonstration: "14个苹果，每盘放4个，能放满3盘，还剩2个，所以14除以4等于3余2。",
      checks: [
        ["11个球，每盒放3个，能放满几盒，还剩几个？", ["3余2", "三余二", "3盒剩2个"]],
        ["9块糖，每人2块，可以分给几人，还剩几块？", ["4余1", "四余一", "4人剩1块"]],
      ],
    }),
    remainderApplication: item({
      visualType: "sharing",
      explanation: "有余数的生活题要看剩下的东西还需不需要再占一份。装人、装物时剩一点也要再用一个容器；按完整组计算时，剩下的不算一整组。",
      demonstration: "13人每车坐4人，3辆只能坐12人，还有1人，所以需要4辆车。",
      checks: [
        ["10个小朋友，每桌坐4人，至少需要几张桌子？", ["3", "三", "3张", "三张"]],
        ["17个球，每盒装5个，至少需要几个盒子？", ["4", "四", "4个", "四个"]],
      ],
    }),
    generic: item({
      visualType: "generic",
      explanation: "先别急着猜答案。我们只看当前这一小步：先读清问题，再找和问题有关的条件，最后只做一个动作。",
      demonstration: "老师会先示范同类小题，再让你用同样的方法试一道数字变过的小题。",
      checks: [["这一步开始前，应该先看题目问什么，还是先随便算？", ["看题目问什么", "先看问题", "看问题"]]],
    }),
  };

  function stepRule(data) {
    return {
      families: [],
      match: /$a/,
      responseInstruction: "只说答案就可以。",
      ...data,
    };
  }

  // These rules narrow a family explanation to the exact action where the
  // child is stuck. The family entry remains the fallback for uncommon steps.
  const stepRules = [
    stepRule({
      families: ["count"],
      match: /起点|从左|从右|按顺序/,
      explanation: "数东西先选一个固定起点。可以从最左边开始，按同一个方向往后数，中途不要跳来跳去。",
      demonstration: "4颗星排成一行，就从最左边开始说1、2、3、4。",
      checks: [["5支笔排成一行，从哪一边开始都可以吗？只说要不要固定一个方向。", ["要", "需要", "要固定", "固定方向"]]],
      responseInstruction: "只说“要固定方向”就可以。",
    }),
    stepRule({
      families: ["count"],
      match: /一物一数|一个物体配一个数|不漏|不重|做记号/,
      explanation: "每碰到一个物体只说一个数。数过的做个小记号，就不会漏掉，也不会再数一次。",
      demonstration: "点第1块积木说1，点第2块说2；已经点过的积木不回头再数。",
      checks: [["数一堆散开的纽扣时，数过的要不要做记号？", ["要", "需要", "要做记号"]]],
      responseInstruction: "只说“要”或“不要”。",
    }),
    stepRule({
      families: ["count"],
      match: /最后一个数|总数/,
      explanation: "一个物体配一个数，全部数完时，最后说出的那个数就表示一共有多少。",
      demonstration: "点着4个球说1、2、3、4，最后说到4，所以总数是4。",
      checks: [["点着6颗星数到6，最后的6表示什么？", ["总数", "一共有6个", "6个", "六个"]]],
      responseInstruction: "只说“总数”或“一共有6个”。",
    }),
    stepRule({
      families: ["compare", "comparisonDifference"],
      match: /看清两边|数清两边|谁大谁小|较大较小|谁多谁少/,
      explanation: "先分别说清两边各有多少，再比较。数大的那边更多；如果不好看，就让两边一个对一个配起来。",
      demonstration: "左边3个，右边5个，5比3大，所以右边更多。",
      checks: [["左边有6个，右边有4个。哪边多？", ["左边", "左", "左边多", "6"]]],
      responseInstruction: "只说“左边”或“右边”。",
    }),
    stepRule({
      families: ["compare", "comparisonDifference"],
      match: /配对|一一对应|剩下|多出/,
      explanation: "把两边一个对一个连起来。配成一对的先不看，哪边还有没配上的，哪边就多；剩下几个就多几个。",
      demonstration: "5个圆和3个方块配对，配完3对后圆还剩2个，所以圆多2个。",
      checks: [["7朵红花和5朵黄花一一配对，红花会剩几朵？", ["2", "二", "2朵", "两朵"]]],
      responseInstruction: "只说剩下几朵。",
    }),
    stepRule({
      families: ["compare", "placeValue"],
      match: /填.*符号|比较符号|大于号|小于号|等号/,
      explanation: "先确定谁大，再选符号。符号张开的口朝大数，尖尖朝小数；两边一样大时用等号。",
      demonstration: "4比2大，所以4和2中间填大于号。",
      checks: [["6和3中间填什么符号？", ["大于号", ">", "大于"]], ["2和5中间填什么符号？", ["小于号", "<", "小于"]]],
      responseInstruction: "只说“大于号”“小于号”或“等号”。",
    }),
    stepRule({
      families: ["ordinal", "observation"],
      match: /方向|从哪边|前后|左右/,
      explanation: "位置会随着数的方向改变，所以要先听清从左、从右、从前还是从后，再开始数。",
      demonstration: "同一颗星，从左数可能是第2个，从右数可能不是第2个。",
      checks: [["题目说“从右数第3个”，应该从哪边开始数？", ["右边", "右", "从右边"]]],
      responseInstruction: "只说开始的方向。",
    }),
    stepRule({
      families: ["ordinal"],
      match: /第几个|几个|位置|一共有/,
      explanation: "“几个”问数量，“第几个”问位置。找位置时，要从规定的方向把第1、第2、第3依次数出来。",
      demonstration: "有5个人，小明从左数排第2；5是总人数，2是小明的位置。",
      checks: [["小红从左数排第4。这里的4表示数量还是位置？", ["位置", "第4个的位置", "位置数"]]],
      responseInstruction: "只说“数量”或“位置”。",
    }),
    stepRule({
      families: ["composition"],
      match: /总数/,
      explanation: "分与合里的总数是全部，分开以后两部分变了，但全部没有变。先把总数圈出来。",
      demonstration: "把5分成2和3，2和3是两部分，5一直是总数。",
      checks: [["把6分成1和5，哪个数是总数？", ["6", "六"]]],
      responseInstruction: "只说总数。",
    }),
    stepRule({
      families: ["composition"],
      match: /已知.*部分|还差|补到|另一部分/,
      explanation: "总数和一部分已经知道，就想还缺多少能补回总数。可以从已知部分接着数到总数。",
      demonstration: "7分成3和几，从3接着数4、5、6、7，一共补4个，所以另一部分是4。",
      checks: [["8分成5和几？", ["3", "三"]]],
      responseInstruction: "只说缺少的数。",
    }),
    stepRule({
      families: ["concreteAddition"],
      match: /第一部分|第二部分|又来|合起来|一共|加法/,
      explanation: "看到“又来、放进、合起来、一共”，先找两部分，再把两部分合在一起，所以用加法。",
      demonstration: "原来3只，又来2只，就是把3和2合起来，3加2等于5。",
      checks: [["盒里2个球，又放进4个。求一共，用加法还是减法？", ["加法", "加", "+"]]],
      responseInstruction: "只说“加法”或“减法”。",
    }),
    stepRule({
      families: ["concreteSubtraction"],
      match: /原来|拿走|飞走|吃掉|还剩|减法/,
      explanation: "看到“拿走、飞走、用掉、还剩”，先说原来有多少，再去掉减少的部分，所以用减法。",
      demonstration: "原来6个，拿走2个，去掉2个后剩4个，6减2等于4。",
      checks: [["原来有7支笔，用掉3支。求还剩，用加法还是减法？", ["减法", "减", "-"]]],
      responseInstruction: "只说“加法”或“减法”。",
    }),
    stepRule({
      families: ["calculation"],
      match: /运算符号|加号|减号|乘号|除号/,
      explanation: "先看运算符号再动手。加号表示合起来，减号表示去掉或比较，乘号表示几个同样多，除号表示平均分或按份分。",
      demonstration: "7减2里是减号，所以从7里面去掉2。",
      checks: [["8加3里是什么运算？", ["加法", "加"]]],
      responseInstruction: "只说运算名称。",
    }),
    stepRule({
      families: ["makeTenAdd"],
      match: /差几到10|快到10|凑成10/,
      explanation: "凑十先找最接近10的数，再看它还差几。把这几个从另一个数里拿出来补满10。",
      demonstration: "8还差2到10，所以8加5时先从5里拿2给8。",
      checks: [["9还差几到10？", ["1", "一"]]],
      responseInstruction: "只说还差几。",
    }),
    stepRule({
      families: ["makeTenAdd"],
      match: /拆另一个数|拆数|剩下/,
      explanation: "拿出凑十需要的数后，另一个数还会剩下一部分。凑成10以后，别忘了再加这部分。",
      demonstration: "8加5，把5拆成2和3，8加2成10，再加剩下的3，得到13。",
      checks: [["8加6，先拿2凑十，6还剩几？", ["4", "四"]]],
      responseInstruction: "只说剩下的数。",
    }),
    stepRule({
      families: ["breakTenSubtract"],
      match: /个位够不够|够减|能不能直接减/,
      explanation: "先只比较个位和要减的数。个位比要减的数小，就不够直接减，需要向10借一步；先不用继续计算。",
      demonstration: "13减8时，个位3比8小，所以3不够减8。",
      checks: [["12减7，个位2够减7吗？", ["不够", "不够减", "不能", "不能直接减"]]],
      responseInstruction: "只说“够”或“不够”。",
    }),
    stepRule({
      families: ["breakTenSubtract"],
      match: /拆成10和几|破十|拆十几/,
      explanation: "个位不够减时，把十几拆成10和个位上的几。先把拆出来的个位数说清，再用10去减。",
      demonstration: "13减8，把13看成10和3。这里拆出来的个位数是3。",
      checks: [["14减9，要把14拆成10和几？", ["4", "四"]]],
      responseInstruction: "只说拆出的个位数。",
    }),
    stepRule({
      families: ["breakTenSubtract"],
      match: /先用10去减|加回个位|想加算减/,
      explanation: "先算10减去减数，再把原来留着的个位数加回来。也可以想“几加减数等于被减数”来检查。",
      demonstration: "13减8，10减8等于2，再加原来的3，得到5。",
      checks: [["12减7，先算10减7等于几？", ["3", "三"]]],
      responseInstruction: "只说这一步的结果。",
    }),
    stepRule({
      families: ["mixedCalculation"],
      match: /顺序|先算|第一步|括号|乘除|从左到右/,
      explanation: "先看有没有括号，有括号先算括号；没有括号时，有乘除先算乘除，只有同一级运算才从左往右。",
      demonstration: "2加3乘4要先算3乘4，不是先算2加3。",
      checks: [["6加2乘3，第一步先算什么？", ["2乘3", "二乘三", "乘法", "2×3"]]],
      responseInstruction: "只说第一步算什么。",
    }),
    stepRule({
      families: ["application", "moneyApplication", "remainderApplication"],
      match: /最后.*问|问题|求什么|问什么/,
      explanation: "应用题先读最后一句，因为它告诉我们要找什么。先把问题用短话说出来，再去找有用的条件。",
      demonstration: "“现在一共有多少辆”是在问总数；“还剩多少”是在问剩下的数量。",
      checks: [["题目最后问“还剩几本”，它要找总数还是剩下的数量？", ["剩下", "剩下的数量", "还剩多少"]]],
      responseInstruction: "只说题目要找什么。",
    }),
    stepRule({
      families: ["application"],
      match: /第一个条件|第一个已知|原来有多少|原来.*几|原来或第一部分/,
      explanation: "先不计算。第一个条件通常告诉我们故事开始时有多少，或者第一部分有多少。要把数字和它的单位一起说清楚。",
      demonstration: "停车场原来有4辆车，又来3辆。第一个条件是原来有4辆车，不是又来的3辆车。",
      checks: [["盒子原来有2个球，又放进4个。第一个条件是多少？", ["2", "二", "2个", "二个", "2个球", "二个球"]]],
      responseInstruction: "只说第一个条件，带上单位更好。",
    }),
    stepRule({
      families: ["application"],
      match: /第二个条件|又来多少|又有多少|增加了多少|拿走多少|飞走多少|又来或拿走/,
      explanation: "第二个条件告诉我们后来发生了什么：可能又增加了一部分，也可能拿走了一部分。先说清这个变化的数量，再判断用加法还是减法。",
      demonstration: "停车场原来有4辆车，又来3辆。第二个条件是又来3辆车。",
      checks: [["盒子原来有2个球，又放进4个。第二个条件是多少？", ["4", "四", "4个", "四个", "4个球", "四个球"]]],
      responseInstruction: "只说第二个条件，带上单位更好。",
    }),
    stepRule({
      families: ["application", "moneyApplication", "remainderApplication"],
      match: /条件|有用数字|圈出|商品.*钱|付了.*钱/,
      explanation: "只找能帮助回答问题的条件。先说每个数字表示什么，不要看到数字就马上计算。",
      demonstration: "问停车场现在一共几辆，需要“原来4辆”和“又来3辆”这两个条件。",
      checks: [["问买东西找回多少，需要知道商品价格和什么？", ["付了多少钱", "付的钱", "付款"]]],
      responseInstruction: "只说还需要哪个条件。",
    }),
    stepRule({
      families: ["money", "moneyApplication"],
      match: /1元.*10角|元角分|单位关系|认识元角分/,
      explanation: "元、角、分是不同单位。要先记住1元等于10角，1角等于10分，换算时单位和数字要一起说。",
      demonstration: "1元不是1角，而是10角；2元就是2个10角，也就是20角。",
      checks: [["1元等于多少角？", ["10", "十", "10角", "十角"]]],
      responseInstruction: "只说“10角”。",
    }),
    stepRule({
      families: ["money", "moneyApplication"],
      match: /把元换成角|统一单位|先整元|换成同一单位/,
      explanation: "元和角不能直接混着算。先把整元换成角：几元就是几个10角，然后再继续计算。",
      demonstration: "3元就是3个10角，所以3元等于30角。",
      checks: [["4元等于多少角？", ["40", "四十", "40角", "四十角"]]],
      responseInstruction: "只说一共多少角。",
    }),
    stepRule({
      families: ["money"],
      match: /再加原来的几角|几元几角|零角/,
      explanation: "整元换成角以后，原来题目里的几角还在，要把它再加上，不能漏掉。",
      demonstration: "2元4角先变成20角，再加4角，得到24角。",
      checks: [["3元5角等于多少角？", ["35", "三十五", "35角", "三十五角"]]],
      responseInstruction: "只说一共多少角。",
    }),
    stepRule({
      families: ["moneyApplication"],
      match: /找回|付.*减|价钱|够不够/,
      explanation: "找回的钱是付出以后剩下的钱，所以先确认付的钱够，再用付的钱减商品价格。元角不同要先统一单位。",
      demonstration: "商品3元，付5元，5减3等于2，所以找回2元。",
      checks: [["商品4元，付6元，应找回几元？", ["2", "二", "2元", "二元"]]],
      responseInstruction: "只说找回多少钱。",
    }),
    stepRule({
      families: ["multiplication"],
      match: /每组|一组|有几组|组数|几个几/,
      explanation: "乘法先确认每组同样多。先说一组有几个，再数有几组，就能说成“几个几”。",
      demonstration: "每盘3个，有4盘，就是4个3。",
      checks: [["每组2个，有5组，是几个2？", ["5个2", "五个二"]]],
      responseInstruction: "只说“几个几”。",
    }),
    stepRule({
      families: ["multiplication"],
      match: /口诀|算总数|乘法表示|列乘法/,
      explanation: "找到“几个几”后再写乘法。两个乘数分别表示每组数和组数，口诀帮助快速算出总数。",
      demonstration: "4个3可以写3乘4，用三四十二算出一共12个。",
      checks: [["每组4个，有3组，一共有几个？", ["12", "十二", "12个", "十二个"]]],
      responseInstruction: "只说总数。",
    }),
    stepRule({
      families: ["division", "remainderDivision", "remainderApplication"],
      match: /平均分|分成几份|每份几个|总数|份数/,
      explanation: "先看总数，再分清题目给的是“分成几份”还是“每份几个”。平均分要求每份一样多。",
      demonstration: "12个平均分成3份，3是份数；每份4个，4是每份数。",
      checks: [["8个苹果平均分成2份，每份几个？", ["4", "四", "4个", "四个"]]],
      responseInstruction: "只说每份几个。",
    }),
    stepRule({
      families: ["remainderDivision"],
      match: /余数|剩下|分满|比除数小/,
      explanation: "先尽量分满整份，再数没法组成一整份的剩余。余数必须比每份要放的数小，否则还能继续分。",
      demonstration: "11个球每盒3个，装满3盒用9个，剩2个，所以是3余2。",
      checks: [["10个糖每人3个，能分给几人，还剩几个？", ["3余1", "三余一", "3人剩1个"]]],
      responseInstruction: "只说“几余几”。",
    }),
    stepRule({
      families: ["remainderApplication"],
      match: /至少|需要.*容器|再占一份|进一/,
      explanation: "生活题里即使只剩一个人或一件物品，也还需要一个座位或容器，所以有剩余时要再加一份。",
      demonstration: "13人每车坐4人，3辆只坐12人，剩1人还要一辆，所以共4辆。",
      checks: [["10人每桌坐4人，至少要几张桌子？", ["3", "三", "3张", "三张"]]],
      responseInstruction: "只说至少需要几张。",
    }),
    stepRule({
      families: ["placeValue"],
      match: /十位|个位|几个十|几个一|数位/,
      explanation: "十位上的1表示一个十，个位上的1表示一个一。读两位数时先说十位，再说个位。",
      demonstration: "34里3在十位，表示3个十；4在个位，表示4个一。",
      checks: [["52里面，5表示几个十？", ["5", "五", "5个十", "五个十"]]],
      responseInstruction: "只说几个十。",
    }),
    stepRule({
      families: ["placeValue", "compare"],
      match: /先比十位|十位相同|高位|再比个位/,
      explanation: "比较两位数从最高位开始。先比十位，十位大的数就大；十位相同，才继续比个位。",
      demonstration: "47和42十位都是4，再比个位，7比2大，所以47大。",
      checks: [["53和58谁大？", ["58", "五十八"]]],
      responseInstruction: "只说较大的数。",
    }),
    stepRule({
      families: ["time", "timeDuration"],
      match: /短针|长针|整时|半时|钟面/,
      explanation: "看钟面先认针：短针看几时，长针看几分。长针指12是整时，指6是30分。",
      demonstration: "短针指3，长针指12，就是3时。",
      checks: [["短针指5，长针指12，是几时？", ["5", "五", "5时", "五时"]]],
      responseInstruction: "只说几时。",
    }),
    stepRule({
      families: ["timeDuration"],
      match: /开始|结束|经过|时间线/,
      explanation: "先找开始时刻和结束时刻，再沿时间线从开始往结束走，走了多少就是经过时间。",
      demonstration: "2时开始，5时结束，从2走到5，一共经过3小时。",
      checks: [["4时开始，6时结束，经过几小时？", ["2", "二", "2小时", "两小时"]]],
      responseInstruction: "只说经过几小时。",
    }),
    stepRule({
      families: ["measure"],
      match: /选.*单位|厘米|米|克|千克|单位感/,
      explanation: "先看要量的是长度还是质量，再想物体大约多大。小长度常用厘米，较长距离用米；轻物用克，较重物用千克。",
      demonstration: "铅笔长约15厘米，不会是15米。",
      checks: [["量教室的长度，用厘米还是米更合适？", ["米"]]],
      responseInstruction: "只说单位。",
    }),
    stepRule({
      families: ["measure"],
      match: /0刻度|起点|尺子|读刻度/,
      explanation: "用尺量长度时，一端要对准0刻度，再读另一端指向的刻度；没有对准0时，要用终点刻度减起点刻度。",
      demonstration: "铅笔从0到8厘米，长度就是8厘米。",
      checks: [["物体从2厘米刻度到7厘米刻度，长几厘米？", ["5", "五", "5厘米", "五厘米"]]],
      responseInstruction: "只说长度。",
    }),
    stepRule({
      families: ["shape", "angle"],
      match: /边|角|顶点|张开|直角|图形名字/,
      explanation: "判断图形要看稳定特征，不看它转了方向。图形看边和角；角的大小看张口，不看边画得长不长。",
      demonstration: "正方形转斜后仍有4条一样长的边和4个直角，所以还是正方形。",
      checks: [["有3条边、3个角的图形是什么？", ["三角形"]]],
      responseInstruction: "只说图形名字。",
    }),
    stepRule({
      families: ["data"],
      match: /行|列|分类|每一类|读.*数量|表格/,
      explanation: "先找到类别对应的行或列，再沿着它读数量。不要把旁边一行的数据拿过来。",
      demonstration: "要看苹果数量，就先找到“苹果”那一行，再读它后面的数。",
      checks: [["要查小狗有几只，先找“小狗”对应的什么？", ["行", "那一行", "一行"]]],
      responseInstruction: "只说“行”或“列”。",
    }),
    stepRule({
      families: ["data"],
      match: /一共|多几|少几|最多|最少|比较/,
      explanation: "问一共就把两类合起来；问多几或少几，就用较大的数量减较小的数量。",
      demonstration: "苹果5个、梨3个，问一共用5加3；问苹果多几个用5减3。",
      checks: [["红花6朵，黄花4朵。红花比黄花多几朵？", ["2", "二", "2朵", "两朵"]]],
      responseInstruction: "只说多几朵。",
    }),
    stepRule({
      families: ["pattern"],
      match: /重复|一组|每次怎么变|规律|下一个/,
      explanation: "先圈出重复的一整组，或比较相邻两项每次怎样变化，再按同样的方法接下去。",
      demonstration: "红、蓝、红、蓝，重复的一组是红蓝，所以下一个是红。",
      checks: [["圆、三角、圆、三角，下一项是什么？", ["圆", "圆形"]]],
      responseInstruction: "只说下一项。",
    }),
    stepRule({
      families: ["logic", "arrangement"],
      match: /固定|按顺序|不漏|不重|排除|不可能|搭配/,
      explanation: "不要靠猜。搭配时先固定一种，再让另一种逐个配；推理时先划掉不可能，剩下的再检查。",
      demonstration: "2件上衣和2条裤子，先固定第一件上衣配2条，再换第二件上衣。",
      checks: [["2顶帽子和3条围巾，一共有几种搭配？", ["6", "六", "6种", "六种"]]],
      responseInstruction: "只说有几种。",
    }),
    stepRule({
      families: ["observation"],
      match: /站在哪里|正面|侧面|上面|看到/,
      explanation: "先确定观察者站在哪里，再找从这个方向能看到的关键面。同一个物体换方向，看到的样子会变。",
      demonstration: "从杯子上面主要看到圆形杯口，从正面能看到杯身。",
      checks: [["想看桌面的形状，应该从上面还是侧面看？", ["上面", "从上面"]]],
      responseInstruction: "只说观察方向。",
    }),
    stepRule({
      families: ["calculation"],
      match: /故事动作|又来|合起来|拿走|飞走|看图列式/,
      explanation: "先把图或故事说成一个动作。合起来、又来用加法；拿走、飞走用减法，然后再把动作写成算式。",
      demonstration: "原来4只，又来2只，是合起来，所以写4加2。",
      checks: [["原来有6个，拿走2个。应该写加法还是减法？", ["减法", "减", "-"]]],
      responseInstruction: "只说“加法”或“减法”。",
    }),
    stepRule({
      families: ["calculation"],
      match: /接着数|倒着数|数轴/,
      explanation: "加法可以从较大的数后面接着数，减法可以从被减数往前倒着数。起点不算作跳的第一步。",
      demonstration: "6加2，从6后面数7、8，所以结果是8。",
      checks: [["7减2，从7往前数两步，得到几？", ["5", "五"]]],
      responseInstruction: "只说结果。",
    }),
    stepRule({
      families: ["calculation"],
      match: /个位对个位|十位对十位|数位对齐/,
      explanation: "笔算时相同数位要站成一列：个位和个位对齐，十位和十位对齐，再从个位算起。",
      demonstration: "算34加25时，4和5对齐，3和2对齐。",
      checks: [["算46加12时，6应该和2对齐，还是和1对齐？", ["2", "和2", "2对齐"]]],
      responseInstruction: "只说和哪个数字对齐。",
    }),
    stepRule({
      families: ["calculation"],
      match: /满十.*进一|进位|不够.*退一|借一|退位/,
      explanation: "个位相加满10，就把10个一换成1个十送到十位；个位不够减，就从十位借1个十换成10个一。",
      demonstration: "28加5，个位8加5等于13，写3并向十位进1。",
      checks: [["个位7加6等于13，要不要向十位进1？", ["要", "需要", "要进1"]]],
      responseInstruction: "只说“要”或“不要”。",
    }),
    stepRule({
      families: ["calculation"],
      match: /几个十|整十|十位.*算|个位不变/,
      explanation: "整十数可以先看有几个十。3个十加2个十是5个十，所以30加20等于50，结果里的0不能漏。",
      demonstration: "60减20，就是6个十减2个十，剩4个十，也就是40。",
      checks: [["40加30等于几个十？", ["7", "七", "7个十", "七个十"]]],
      responseInstruction: "只说几个十。",
    }),
    stepRule({
      families: ["calculation", "mixedCalculation", "multiplication", "division"],
      match: /只算一小步|中间结果|再算第二步|放回原式|再算加减|写.*结果|算出积|写商/,
      explanation: "一次只算当前这一小步，把中间结果清楚地记下来，再放回原题继续，不能跳过步骤。",
      demonstration: "8加2再减3，先算8加2等于10，记住10，再算10减3。",
      checks: [["6加4再减2，第一步6加4的中间结果是多少？", ["10", "十"]]],
      responseInstruction: "只说当前这一步的结果。",
    }),
    stepRule({
      families: ["shape"],
      match: /整体外形|能不能滚|立体|面|生活例子/,
      explanation: "认立体图形要摸一摸它的面，再试试能不能滚。平平的面能贴住桌面，弯曲的面可以滚动。",
      demonstration: "球没有平面，向各个方向都能滚；正方体有平面，能稳稳放住。",
      checks: [["球和正方体，哪个能向各个方向滚？", ["球"]]],
      responseInstruction: "只说图形名字。",
    }),
    stepRule({
      families: ["shape"],
      match: /拼组|平移|旋转|移动前后|现象/,
      explanation: "平移是整个图形沿一个方向移动，方向没有转；旋转是图形绕一个点转动。移动后图形的形状和大小不变。",
      demonstration: "推拉抽屉主要是平移，转动风车是旋转。",
      checks: [["转动钟表指针是平移还是旋转？", ["旋转"]]],
      responseInstruction: "只说“平移”或“旋转”。",
    }),
    stepRule({
      families: ["placeValue"],
      match: /合成|读写|读数|写数|0.*占位|千位|每个数字表示/,
      explanation: "从最高位往右读写，每个数字站在哪一位，就表示几个这样的计数单位；中间没有这个单位时，0要留下占位。",
      demonstration: "305里的3表示3个百，0表示没有十但要占住十位，5表示5个一。",
      checks: [["407里的0站在什么位？", ["十位"]]],
      responseInstruction: "只说数位名称。",
    }),
    stepRule({
      families: ["compare"],
      match: /先看十位|先看位数|位数|比较理由/,
      explanation: "比较数的大小，位数多的数通常更大；位数相同就从最高位开始，一位一位往后比。",
      demonstration: "98是两位数，102是三位数，所以102大；47和42再从十位、个位比较。",
      checks: [["99和103谁大？", ["103", "一百零三"]]],
      responseInstruction: "只说较大的数。",
    }),
    stepRule({
      families: ["money"],
      match: /1角.*10分|角.*分/,
      explanation: "角和分也是不同单位。1角等于10分，所以几角就是几个10分。",
      demonstration: "3角就是3个10分，也就是30分。",
      checks: [["4角等于多少分？", ["40", "四十", "40分", "四十分"]]],
      responseInstruction: "只说一共多少分。",
    }),
    stepRule({
      families: ["moneyApplication", "measure"],
      match: /换回|换成同一单位|带单位回答/,
      explanation: "计算前先统一单位，算完再按题目要求换回合适的单位，并把单位一起说出来。",
      demonstration: "26角可以说成2元6角；答案不能只说26而不说单位。",
      checks: [["35角可以说成几元几角？", ["3元5角", "三元五角"]]],
      responseInstruction: "只说“几元几角”。",
    }),
    stepRule({
      families: ["data"],
      match: /调查项目|票数|哪里看出|数据证据/,
      explanation: "回答统计问题要指着对应项目和数量说，不能只凭感觉。先读项目，再读它后面的数据。",
      demonstration: "表里“苹果”后面写5，就能说苹果有5个。",
      checks: [["表里“小猫”后面写6。小猫有几只？", ["6", "六", "6只", "六只"]]],
      responseInstruction: "只说数量。",
    }),
    stepRule({
      families: ["arrangement"],
      match: /第一类|第二类|每一种.*配|乘法.*种数/,
      explanation: "先固定第一类的一种，让它和第二类的每一种都配一次，再换下一种。每一种都配全，就不漏不重。",
      demonstration: "2件上衣、3条裤子，每件上衣都能配3条裤子，共2乘3等于6种。",
      checks: [["3顶帽子和2条围巾，一共有几种搭配？", ["6", "六", "6种", "六种"]]],
      responseInstruction: "只说有几种。",
    }),
    stepRule({
      families: ["division"],
      match: /每份同样多|除数|口诀|几乘|验算/,
      explanation: "除法是在平均分。除数告诉我们分成几份或每份几个；求商时可以想“几乘除数等于被除数”，再用乘法检查。",
      demonstration: "12除以3，想3乘4等于12，所以商是4。",
      checks: [["15除以3，想3乘几等于15？", ["5", "五"]]],
      responseInstruction: "只说商。",
    }),
    stepRule({
      families: ["remainderDivision", "remainderApplication"],
      match: /最多能分|能装满|还剩几个|剩下.*人|要不要再加/,
      explanation: "先用乘法找到不超过总数的最大整组，再用总数减去已经分掉的，得到剩余。生活题还要判断剩余是否需要再占一份。",
      demonstration: "14个每组4个，4乘3等于12，最多3组，还剩2个。",
      checks: [["17个每组5个，最多能装满几组？", ["3", "三", "3组", "三组"]]],
      responseInstruction: "只说能装满几组。",
    }),
    stepRule({
      families: ["time"],
      match: /合起来读|电子时间|读时间/,
      explanation: "先读短针表示的小时，再读长针表示的分钟，合起来说“几时几分”；电子时间小时和分钟用冒号隔开。",
      demonstration: "短针过3，长针指2表示10分，合起来是3时10分，写作3:10。",
      checks: [["5时30分写成电子时间是什么？", ["5:30", "05:30", "五点三十"]]],
      responseInstruction: "只说电子时间。",
    }),
    stepRule({
      families: ["timeDuration"],
      match: /跨小时|分段|带分/,
      explanation: "跨小时可以先走到下一个整时，再从整时走到结束。两段时间加起来就是经过时间。",
      demonstration: "3:50到4:10，先到4:00走10分，再走10分，共20分。",
      checks: [["2:50到3:10经过多少分？", ["20", "二十", "20分", "二十分"]]],
      responseInstruction: "只说经过多少分。",
    }),
    stepRule({
      families: ["measure"],
      match: /长度|重量|质量/,
      explanation: "先判断题目在量长度还是质量。长度用厘米、米，质量用克、千克，单位要和物体大小相配。",
      demonstration: "桌面多长是长度问题，一袋米多重是质量问题。",
      checks: [["问西瓜有多重，是量长度还是质量？", ["质量", "重量"]]],
      responseInstruction: "只说“长度”或“质量”。",
    }),
    stepRule({
      families: ["logic"],
      match: /第一条条件|下一条条件|剩下谁|可能|排除/,
      explanation: "每读一条条件，就划掉一个不可能；不要一次把所有条件混在一起。最后用剩下的答案再检查每条条件。",
      demonstration: "小球不在1号，也不在3号，三个盒子里只剩2号可能。",
      checks: [["小红不在左边，也不在中间，她只能在哪里？", ["右边", "右"]]],
      responseInstruction: "只说剩下的位置。",
    }),
    stepRule({
      families: ["application"],
      match: /判断加减|带单位回答/,
      explanation: "先根据故事动作判断加减：合起来用加法，拿走或求相差用减法。算完要看问题问的是人、只、辆还是别的，把单位一起说出来。",
      demonstration: "原来4辆又来2辆，求一共用加法，答案说6辆。",
      checks: [["原来7只，飞走3只，求还剩。用什么运算？", ["减法", "减", "-"]]],
      responseInstruction: "只说运算名称。",
    }),
    stepRule({
      families: ["comparisonDifference"],
      match: /大数减小数|多多少|少多少/,
      explanation: "求多多少或少多少，不是求一共。先找大数和小数，一一配对后多出的数量，就是大数减小数的结果。",
      demonstration: "7本和4本比，配掉4本后多3本，所以7减4等于3。",
      checks: [["9比6多几？", ["3", "三"]]],
      responseInstruction: "只说相差的数。",
    }),
    stepRule({
      families: ["compare"],
      match: /估一估|接近几十/,
      explanation: "估计接近几十，要看这个数离前后两个整十谁更近。个位小于5更接近前一个整十，个位大于或等于5更接近后一个整十。",
      demonstration: "42离40只差2，离50差8，所以42更接近40。",
      checks: [["67更接近60还是70？", ["70", "七十"]]],
      responseInstruction: "只说更接近的整十数。",
    }),
    stepRule({
      families: ["mixedCalculation"],
      match: /看有几步|几个几|多出的部分/,
      explanation: "先数清题目有几步，再把相同的部分看成几个几；如果还有多出或少掉的一部分，先算成组的，再处理这部分。",
      demonstration: "3组每组4个，另有2个，先算3乘4等于12，再加2。",
      checks: [["2组每组5个，另有3个，第一步先算什么？", ["2乘5", "二乘五", "乘法", "2×5"]]],
      responseInstruction: "只说第一步算什么。",
    }),
    stepRule({
      families: ["observation"],
      match: /站的位置|关键特征|哪里看出/,
      explanation: "先说观察者站的位置，再找这个方向独有的特征。回答时用“我从哪里看，看到什么”这一短句说明证据。",
      demonstration: "我从上面看，主要看到杯口的圆，所以这是上视图。",
      checks: [["看到杯子的圆形杯口，最可能是从哪里看？", ["上面", "从上面"]]],
      responseInstruction: "只说观察方向。",
    }),
    stepRule({
      families: [],
      match: /换|再试|举生活例子|自己续|换顺序|换情境|换数字|换一个/,
      explanation: "这一步要换数字、图或情境再试，方法不变。先说出刚才的方法，再把它用到新题里。",
      demonstration: "刚才用一一配对比较，换成苹果和梨后还是先配对，不靠图摆得长短来猜。",
    }),
    stepRule({
      families: ["angle"],
      match: /锐角|钝角|和直角比/,
      explanation: "把角和三角尺上的直角比。张口比直角小的是锐角，比直角大的是钝角，一样大就是直角。",
      demonstration: "一个角的张口只到直角里面，它比直角小，所以是锐角。",
      checks: [["一个角比直角大，它是什么角？", ["钝角"]]],
      responseInstruction: "只说角的名字。",
    }),
    stepRule({
      families: [],
      match: /检查|验证|合起来检查|换回.*检查/,
      explanation: "检查不是重做一遍，而是用相反动作或估一估看看答案是否合理。加法可用减法查，减法可用加法查。",
      demonstration: "7减3等于4，可以用4加3等于7来检查。",
      checks: [["要检查8减5等于3，可以算3加几等于8？", ["5", "五"]]],
      responseInstruction: "只说缺少的数。",
    }),
    stepRule({
      families: [],
      match: /说清|解释|为什么|原因|当小老师|讲一遍|复述/,
      explanation: "讲方法时不用背长句，只说“先看什么，再做什么，因为这样能解决什么”。",
      demonstration: "比如比较大小可以说：先数清两边，再看谁多，所以右边大。",
      checks: [["跟着说这一句：先看问题，再找条件。老师问：第一步先看什么？", ["问题", "先看问题", "题目问什么"]]],
      responseInstruction: "只说“先看问题”。",
    }),
  ];

  function normalize(value) {
    return String(value || "").replace(/\s+/g, "").toLowerCase();
  }

  function hash(value) {
    const source = String(value || "");
    let result = 0;
    for (let index = 0; index < source.length; index += 1) result = (result * 31 + source.charCodeAt(index)) >>> 0;
    return result;
  }

  function findStepRule(family, payload) {
    const text = normalize(
      [
        payload?.plan?.label,
        payload?.plan?.prompt,
        payload?.plan?.teacherHint,
        payload?.plan?.responseInstruction,
        payload?.plan?.repeatSentence,
      ]
        .filter(Boolean)
        .join("|"),
    );
    return stepRules.find((rule) => (!rule.families.length || rule.families.includes(family)) && rule.match.test(text)) || null;
  }

  function create(payload) {
    const family = library[payload?.family] ? payload.family : "generic";
    const definition = library[family];
    const focusedRule = findStepRule(family, payload);
    const effective = focusedRule ? { ...definition, ...focusedRule } : definition;
    const attempt = Math.max(0, Number(payload?.attempt) || 0);
    const key = `${payload?.lesson?.id || "lesson"}|${payload?.question?.id || payload?.question?.prompt || "question"}|${payload?.plan?.label || "step"}|${attempt}`;
    const checks = effective.checks?.length ? effective.checks : definition.checks.length ? definition.checks : library.generic.checks;
    const selected = checks[(hash(key) + attempt) % checks.length];
    const prompt = selected[0];
    const answerKeywords = selected[1];
    const title = payload?.plan?.label || "老师讲这一小步";
    return {
      id: `repair-${family}-${hash(key).toString(36)}`,
      family,
      title,
      explanation: effective.explanation,
      demonstration: effective.demonstration,
      checkPrompt: prompt,
      answerKeywords,
      answer: answerKeywords[0] || "",
      responseInstruction: effective.responseInstruction,
      visualType: effective.visualType || definition.visualType,
      sourceIds: SOURCES.slice(),
      originalQuestion: payload?.question?.prompt || payload?.lesson?.problem || "",
      originalStepLabel: payload?.plan?.label || "",
      stepRuleMatched: Boolean(focusedRule),
      attempt,
    };
  }

  function getFamilies() {
    return Object.keys(library);
  }

  function getStepRuleCount() {
    return stepRules.length;
  }

  window.LezhiMicrostepExplanations = { create, getFamilies, getStepRuleCount };
})();
