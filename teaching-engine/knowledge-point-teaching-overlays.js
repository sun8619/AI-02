(function () {
  const sharedMastery = [
    "能独立做一道直接题",
    "换数字或情境后还能做",
    "能说出关键原因",
    "能用自己的话讲一遍",
  ];

  function overlay(data) {
    return {
      targetPassCount: 4,
      microSteps: [],
      commonGaps: [],
      masterySignals: sharedMastery,
      teachingMethods: [],
      variationRules: [],
      diagnostics: [],
      teacherMoves: [],
      initialContext: "",
      teachingGoal: "",
      ...data,
    };
  }

  const points = {
    "G1V1-U1-KP01": overlay({
      family: "compare",
      visualType: "compare",
      microSteps: ["先看清两边", "用数序或配对比较", "说谁大谁小", "填符号", "换成图形数量再比"],
      teachingMethods: ["一一配对", "数序比较", "开口朝大数", "先说话再写符号"],
      commonGaps: ["只看摆得长不长", "大于号小于号方向反", "只写符号不说谁大"],
      variationRules: ["数字比较", "物体数量比较", "同样数量不同摆法", "等号比较"],
      teacherMoves: ["先让孩子只说哪边大", "符号错时只讲开口朝大数", "换一张图确认不是背符号"],
    }),
    "G1V1-U1-KP02": overlay({
      family: "composition",
      visualType: "ten-frame",
      microSteps: ["先看总数", "看已知一部分", "想还差几", "合起来检查", "换一种分法"],
      teachingMethods: ["摆两堆", "补到总数", "分合卡片", "交换两部分"],
      commonGaps: ["忘记总数", "把两部分相加后不检查", "只背分成不理解"],
      variationRules: ["给左边求右边", "给右边求左边", "看图说分合", "用分合帮加减法"],
    }),
    "G1V1-U1-KP03": overlay({
      family: "calculation",
      visualType: "ten-frame",
      microSteps: ["先看故事动作", "又来或合起来用加法", "拿走或飞走用减法", "看图列式", "说清为什么这样算"],
      teachingMethods: ["故事动作判断加减", "看图列式", "接着数或倒着数", "带单位回答"],
      commonGaps: ["只看数字乱加减", "把拿走当合起来", "会算但说不清为什么用加法或减法"],
      variationRules: ["合起来求一共", "拿走求还剩", "看图列式", "换生活物品判断加减"],
    }),
    "G1V1-U2-KP01": overlay({
      family: "composition",
      visualType: "ten-frame",
      microSteps: ["先确定总数是6到10", "看已知一部分", "补到总数", "合起来检查", "换一个总数再分"],
      teachingMethods: ["十框分合", "小棒分两堆", "补数", "互换两部分"],
      commonGaps: ["总数和部分混淆", "10的分合不熟", "不会用合起来检查"],
      variationRules: ["6到10不同总数", "看图分合", "填空分合", "用分合做加减"],
    }),
    "G1V1-U2-KP02": overlay({
      family: "calculation",
      visualType: "number-line",
      microSteps: ["先看加号还是减号", "选接着数或倒着数", "只算一小步", "检查结果", "换数字再算"],
      teachingMethods: ["接着数", "倒着数", "数轴跳格", "分合口算"],
      commonGaps: ["看错加减号", "数数起点错", "连算时忘记中间数"],
      variationRules: ["10以内加法", "10以内减法", "连加连减", "看图列式"],
    }),
    "G1V1-U2-KP03": overlay({
      family: "application",
      visualType: "ten-frame",
      microSteps: ["先读最后问什么", "找原来或第一部分", "找又来或拿走", "判断加减", "带单位回答"],
      teachingMethods: ["读题找问题", "圈有用数字", "故事动作判断加减", "带单位检查"],
      commonGaps: ["没看最后问什么", "见两个数就乱加", "会算但不会解释为什么用加减"],
      variationRules: ["一共问题", "还剩问题", "多一步但只问第一关系", "换生活物品"],
    }),
    "G1V1-U3-KP01": overlay({
      family: "shape",
      visualType: "shape",
      microSteps: ["看整体外形", "找面和边", "看能不能滚", "说图形名字", "举生活例子"],
      teachingMethods: ["摸一摸面", "滚一滚", "找生活物体", "按特征分类"],
      commonGaps: ["只凭像不像", "圆柱和球混淆", "长方体正方体混淆"],
      variationRules: ["实物辨认", "旋转后辨认", "按能滚不能滚分类", "说一个特征"],
    }),
    "G1V1-U4-KP01": overlay({
      family: "placeValue",
      visualType: "place-value",
      microSteps: ["先看十位", "再看个位", "说几个十几个一", "合成这个数", "换一个11到20的数"],
      teachingMethods: ["一捆十根小棒", "数位表", "十和一分开说", "摆小棒再读数"],
      commonGaps: ["十位个位说反", "把16说成6个十1个一", "只读数不懂位值"],
      variationRules: ["说组成", "看小棒写数", "读数写数", "比较11到20"],
    }),
    "G1V1-U4-KP02": overlay({
      family: "compare",
      visualType: "place-value",
      microSteps: ["先看十位", "十位相同再看个位", "说谁大谁小", "填比较符号", "换两个数再比"],
      teachingMethods: ["数位比较", "数序比较", "高位优先", "先语言后符号"],
      commonGaps: ["只看个位", "14和19只看4和9", "符号方向反"],
      variationRules: ["十位相同比个位", "十位不同先比十位", "较大较小填空", "符号比较"],
    }),
    "G1V1-U5-KP01": overlay({
      family: "makeTenAdd",
      visualType: "ten-frame",
      microSteps: ["找快到10的数", "说还差几到10", "拆另一个数", "先凑成10", "再加剩下"],
      teachingMethods: ["凑十法", "拆数", "十框补满", "十加几"],
      commonGaps: ["不会拆另一个数", "凑成10后忘记剩下", "只背答案不说凑十"],
      variationRules: ["9加几", "8加几", "看十框凑十", "换成生活故事"],
    }),
    "G1V2-U1-KP01": overlay({
      family: "shape",
      visualType: "shape",
      microSteps: ["数边", "数角", "说图形名字", "看拼组后图形", "举生活例子"],
      teachingMethods: ["边角特征", "描边", "拼一拼", "旋转观察"],
      commonGaps: ["圆也去数边", "正方形长方形混淆", "图形旋转后认不出"],
      variationRules: ["按边数认图形", "按角数认图形", "图形拼组", "生活图形"],
    }),
    "G1V2-U2-KP01": overlay({
      family: "breakTenSubtract",
      visualType: "ten-frame",
      microSteps: ["看个位够不够减", "把十几拆成10和几", "先用10去减", "加回个位", "用想加算减检查"],
      teachingMethods: ["破十法", "想加算减", "小棒拆捆", "十框退位"],
      commonGaps: ["个位不够还硬减", "10减完忘记加回个位", "把减数和被减数弄反"],
      variationRules: ["十几减9", "十几减8或7", "想加算减", "生活拿走题"],
    }),
    "G1V2-U2-KP02": overlay({
      family: "comparisonDifference",
      visualType: "compare",
      microSteps: ["先找谁多谁少", "用一一配对看多出的", "用大数减小数", "说多多少或少多少", "换情境再比"],
      teachingMethods: ["一一配对", "大数减小数", "差多少", "比较句"],
      commonGaps: ["把两个数量相加", "不知道多多少要用减法", "只说谁多不说多几"],
      variationRules: ["多多少", "少多少", "同样多后剩几", "换水果花朵人数"],
    }),
    "G1V2-U3-KP01": overlay({
      family: "data",
      visualType: "data",
      microSteps: ["看分类标准", "读每一类数量", "比较多少", "求多几或少几", "说从表里哪里看出"],
      teachingMethods: ["表格定位", "读数量", "最多最少", "数据证据"],
      commonGaps: ["看错行列", "只凭感觉说多", "多多少忘记相减"],
      variationRules: ["读表回答", "最多最少", "一共多少", "多多少少多少"],
    }),
    "G1V2-U4-KP01": overlay({
      family: "placeValue",
      visualType: "place-value",
      microSteps: ["看十位", "看个位", "说几个十几个一", "读写这个数", "换一个两位数"],
      teachingMethods: ["数位表", "小棒捆", "十位个位", "读写互换"],
      commonGaps: ["十位个位颠倒", "0占位不理解", "把48读成四八"],
      variationRules: ["组成", "读作写作", "数位填空", "看图写数"],
    }),
    "G1V2-U4-KP02": overlay({
      family: "compare",
      visualType: "place-value",
      microSteps: ["先比十位", "十位相同再比个位", "说较大较小", "填符号", "估一估接近几十"],
      teachingMethods: ["高位优先", "数位比较", "数轴位置", "估整十"],
      commonGaps: ["只比个位", "较大较小写反", "不会说为什么"],
      variationRules: ["两位数比较", "接近几十", "按从小到大排", "符号填空"],
    }),
    "G1V2-U5-KP01": overlay({
      family: "money",
      visualType: "money",
      microSteps: ["认识元角分", "知道1元=10角", "知道1角=10分", "把元换成角", "再加原来的几角", "说清为什么先换单位"],
      teachingMethods: ["人民币实物", "单位换算", "先整元后零角", "统一单位"],
      commonGaps: ["把元直接当角", "漏加原来的几角", "把35角说成35元"],
      variationRules: ["几元几角换成角", "角换成分", "角换回元角", "生活付钱说法"],
    }),
    "G1V2-U5-KP02": overlay({
      family: "moneyApplication",
      visualType: "money",
      microSteps: ["看商品多少钱", "看付了多少钱", "先统一单位", "用付的钱减价钱", "换回元角回答", "说清找回是剩下"],
      teachingMethods: ["购物情境", "付出-价格=找回", "统一单位", "够不够检查"],
      commonGaps: ["价格和付出混淆", "用加法找零", "元角混着减"],
      variationRules: ["问够不够", "问找回多少", "换商品价格", "换付出的钱"],
    }),
    "G1V2-U6-KP01": overlay({
      family: "calculation",
      visualType: "place-value",
      microSteps: ["看十位是几个十", "整十和整十先算十位", "个位不变或一起算", "写出结果", "用数位解释"],
      teachingMethods: ["几个十相加减", "数位表", "整十口算", "拆成十和一"],
      commonGaps: ["30+20写成5", "十位个位混算", "忘记结果后面的0"],
      variationRules: ["整十加整十", "整十减整十", "两位数加整十", "两位数减整十"],
    }),
    "G1V2-U7-KP01": overlay({
      family: "pattern",
      visualType: "pattern",
      microSteps: ["先找重复的一组", "说每次怎么变", "按同样规律补下一个", "检查前后一致", "自己续一个"],
      teachingMethods: ["圈重复单位", "相邻变化", "颜色形状数量规律", "续两项检查"],
      commonGaps: ["只看最后一个", "找不到重复单位", "换规律后还用旧规律"],
      variationRules: ["图形规律", "数字规律", "颜色规律", "自己编规律"],
    }),
    "G2V1-U1-KP01": overlay({
      family: "measure",
      visualType: "ruler",
      microSteps: ["看量的是长度", "选厘米或米", "记住1米=100厘米", "换成同一单位", "带单位回答"],
      teachingMethods: ["单位感", "尺子和米尺", "1米=100厘米", "生活物体估计"],
      commonGaps: ["米厘米混淆", "忘记乘100", "答案不带单位"],
      variationRules: ["米换厘米", "厘米换米厘米", "估计物体长度", "尺子读刻度"],
    }),
    "G2V1-U2-KP01": overlay({
      family: "calculation",
      visualType: "place-value",
      microSteps: ["个位对个位", "十位对十位", "个位满十要进一", "个位不够要退一", "检查结果"],
      teachingMethods: ["竖式对位", "进位加", "退位减", "数位检查"],
      commonGaps: ["数位没对齐", "忘记进位", "退位后十位没减1"],
      variationRules: ["不进位加", "进位加", "不退位减", "退位减"],
    }),
    "G2V1-U2-KP02": overlay({
      family: "mixedCalculation",
      visualType: "number-line",
      microSteps: ["看有几步", "先算第一步", "记住中间结果", "再算第二步", "说清先后顺序"],
      teachingMethods: ["一步一算", "中间结果", "从左到右", "数量变化图"],
      commonGaps: ["跳着算", "中间结果丢了", "只算第一步就停"],
      variationRules: ["连加", "连减", "加减混合", "带比较的两步题"],
    }),
    "G2V1-U3-KP01": overlay({
      family: "angle",
      visualType: "angle",
      microSteps: ["找角的顶点", "找两条边", "看张开大小", "和直角比", "说锐角直角钝角"],
      teachingMethods: ["角的顶点和边", "三角尺比直角", "张口大小", "边长不影响角大小"],
      commonGaps: ["看边长判断角大小", "找不到顶点", "锐角钝角混淆"],
      variationRules: ["认直角", "比直角小是锐角", "比直角大是钝角", "生活中的角"],
    }),
    "G2V1-U4-KP01": overlay({
      family: "multiplication",
      visualType: "array",
      microSteps: ["看每组有几个", "看有几组", "说成几个几", "列乘法", "用口诀算"],
      teachingMethods: ["几个几", "同数连加", "阵列图", "乘法口诀"],
      commonGaps: ["组数和每组数混淆", "不是同样多也用乘法", "口诀和算式对不上"],
      variationRules: ["几个几转乘法", "乘法转同数连加", "阵列图", "口诀求积"],
    }),
    "G2V1-U4-KP02": overlay({
      family: "mixedCalculation",
      visualType: "array",
      microSteps: ["先看几个几", "先算乘法部分", "再加或减多出的部分", "写最终结果", "说清为什么先乘"],
      teachingMethods: ["乘加乘减", "阵列补缺", "先乘后加减", "多出少掉的部分"],
      commonGaps: ["先加再乘", "忘记多出的2", "把乘法意义说不清"],
      variationRules: ["乘加", "乘减", "阵列多几个", "阵列少几个"],
    }),
    "G2V1-U5-KP01": overlay({
      family: "observation",
      visualType: "position",
      microSteps: ["先确定站的位置", "看能看到的面", "找关键特征", "选正面侧面上面", "说从哪里看出来"],
      teachingMethods: ["换方向观察", "关键特征", "正侧上三视图", "拿实物转一转"],
      commonGaps: ["把自己想象的位置弄反", "只看一个小图案", "正面侧面混淆"],
      variationRules: ["正面判断", "侧面判断", "上面判断", "换物体再观察"],
    }),
    "G2V1-U6-KP01": overlay({
      family: "multiplication",
      visualType: "array",
      microSteps: ["说几个几", "列乘法式", "找对应口诀", "算出积", "换顺序也能算"],
      teachingMethods: ["口诀意义", "同数连加", "阵列图", "交换因数"],
      commonGaps: ["口诀背错", "7个8和8个7不敢互换", "只背结果不说几个几"],
      variationRules: ["7的口诀", "8的口诀", "9的口诀", "口诀填空"],
    }),
    "G2V1-U7-KP01": overlay({
      family: "time",
      visualType: "clock",
      microSteps: ["先看短针定几时", "再看长针数几分", "合起来读时间", "写成电子时间", "换钟面再读"],
      teachingMethods: ["短针看时", "长针看分", "一大格5分", "补0写法"],
      commonGaps: ["时针分针看反", "8:05写成8:5", "刚过几时判断错"],
      variationRules: ["整时", "半时", "几时几分", "电子时间互写"],
    }),
    "G2V1-U7-KP02": overlay({
      family: "timeDuration",
      visualType: "clock",
      microSteps: ["找开始时间", "找结束时间", "先算同一小时内经过几分", "跨小时就分段", "带分回答"],
      teachingMethods: ["时间线", "分段到整时", "结束减开始", "钟面走了多少"],
      commonGaps: ["把结束时间当经过时间", "跨小时不会分段", "分钟相减方向反"],
      variationRules: ["同小时经过时间", "跨小时经过时间", "给开始和经过求结束", "按先后排序"],
    }),
    "G2V1-U8-KP01": overlay({
      family: "arrangement",
      visualType: "array",
      microSteps: ["先看第一类有几种", "再看第二类有几种", "每一种都配一遍", "用乘法算种数", "说清不漏不重复"],
      teachingMethods: ["列表法", "连线法", "有序搭配", "乘法计数"],
      commonGaps: ["漏掉搭配", "重复数同一种搭配", "只用加法2+3"],
      variationRules: ["衣裤搭配", "早餐搭配", "路线搭配", "先列表再乘法"],
    }),
    "G2V2-U1-KP01": overlay({
      family: "data",
      visualType: "data",
      microSteps: ["看调查项目", "读每项票数", "求一共就相加", "找最多最少", "说表格依据"],
      teachingMethods: ["读统计表", "逐项相加", "最多最少", "数据证据"],
      commonGaps: ["漏加一项", "票数最多看反", "只说答案不说从表里看"],
      variationRules: ["一共人数", "最多最少", "相差多少", "根据表提问题"],
    }),
    "G2V2-U2-KP01": overlay({
      family: "division",
      visualType: "sharing",
      microSteps: ["看是不是平均分", "看总数", "看分成几份", "每份同样多", "用乘法检查"],
      teachingMethods: ["平均分", "摆一摆", "每份一样多", "乘除互检"],
      commonGaps: ["分得不一样多", "份数和每份数混淆", "不会用乘法检查"],
      variationRules: ["平均分给几人", "每份几个", "分成几份", "看图列除法"],
    }),
    "G2V2-U2-KP02": overlay({
      family: "division",
      visualType: "sharing",
      microSteps: ["看除数是几", "想几的口诀", "找几乘除数等于被除数", "写商", "用乘法验算"],
      teachingMethods: ["用口诀求商", "想乘法算除法", "乘除互逆", "验算"],
      commonGaps: ["把乘法口诀直接写成积", "除数被除数看反", "不会用乘法检查"],
      variationRules: ["用口诀求商", "乘法验算", "除法填空", "平均分情境"],
    }),
    "G2V2-U3-KP01": overlay({
      family: "shape",
      visualType: "shape",
      microSteps: ["看是不是左右两边一样", "看是平移还是旋转", "找移动前后形状是否变", "判断现象", "举生活例子"],
      teachingMethods: ["对折看轴对称", "平移不转方向", "旋转绕点转", "生活动作分类"],
      commonGaps: ["平移旋转混淆", "只看移动了就说平移", "轴对称只看好看不好看"],
      variationRules: ["轴对称判断", "平移判断", "旋转判断", "生活现象分类"],
    }),
    "G2V2-U5-KP01": overlay({
      family: "mixedCalculation",
      visualType: "number-line",
      microSteps: ["先看有没有乘除", "先算乘除部分", "把中间结果放回原式", "再算加减", "说清运算顺序"],
      teachingMethods: ["先乘除后加减", "圈第一步", "中间结果代回", "一步一写"],
      commonGaps: ["从左到右直接算18-6", "中间结果没放回", "只说答案不说先算什么"],
      variationRules: ["乘加", "乘减", "除加", "除减"],
    }),
    "G2V2-U6-KP01": overlay({
      family: "remainderDivision",
      visualType: "sharing",
      microSteps: ["看总数和每份几个", "找最多能分几份", "算还剩几个", "余数要比除数小", "写商和余数"],
      teachingMethods: ["有余数除法", "口诀找最大倍数", "剩下就是余数", "余数小于除数"],
      commonGaps: ["余数比除数还大", "商少1或多1", "把余数漏掉"],
      variationRules: ["直接竖式", "看图分一分", "写商余数", "用乘加验算"],
    }),
    "G2V2-U6-KP02": overlay({
      family: "remainderApplication",
      visualType: "sharing",
      microSteps: ["先算能装满几份", "看剩下还有没有人或物", "判断要不要再加一份", "区分进一和去尾", "说清生活理由"],
      teachingMethods: ["进一法", "去尾法", "余数在生活里的意义", "先算再判断"],
      commonGaps: ["有余数就直接写商", "不知道什么时候加1", "进一法去尾法混淆"],
      variationRules: ["坐船用进一", "装盒剩下不满一盒用去尾", "买票够不够", "最多至少题"],
    }),
    "G2V2-U7-KP01": overlay({
      family: "placeValue",
      visualType: "place-value",
      microSteps: ["从千位开始看", "百位十位个位依次看", "0要占位", "读写这个数", "说每个数字表示什么"],
      teachingMethods: ["数位顺序表", "千百十个", "0占位", "位值解释"],
      commonGaps: ["0漏读漏写", "数位顺序错", "把数字大小和位值混淆"],
      variationRules: ["组成填空", "读作写作", "数位表", "用算盘或计数器表示"],
    }),
    "G2V2-U7-KP02": overlay({
      family: "compare",
      visualType: "place-value",
      microSteps: ["先看位数", "位数相同从高位比", "高位不同直接判断", "填符号", "说比较理由"],
      teachingMethods: ["高位优先", "逐位比较", "数位表", "符号开口朝大数"],
      commonGaps: ["只看末尾数字", "3080和2809比个位", "符号方向反"],
      variationRules: ["万以内比较", "按大小排序", "近似整百整千", "口算整百整千加减"],
    }),
    "G2V2-U8-KP01": overlay({
      family: "measure",
      visualType: "mass",
      microSteps: ["看量的是重量", "选克或千克", "记住1千克=1000克", "先换成克", "带单位回答"],
      teachingMethods: ["质量单位感", "1千克=1000克", "生活估测", "单位换算"],
      commonGaps: ["克千克混淆", "忘记乘1000", "生活估测离谱"],
      variationRules: ["千克换克", "克换千克克", "估计物品重量", "比较轻重"],
    }),
    "G2V2-U9-KP01": overlay({
      family: "logic",
      visualType: "logic",
      microSteps: ["读第一条条件", "划掉不可能", "读下一条条件", "看剩下谁可能", "检查全部条件"],
      teachingMethods: ["排除法", "条件表", "逐条打勾", "可能和一定"],
      commonGaps: ["直接猜", "漏看一个条件", "排除后不检查"],
      variationRules: ["谁拿什么", "座位推理", "颜色推理", "条件表推理"],
    }),
  };

  const aliases = {
    "g1a-add-9-plus": "G1V1-U5-KP01",
    "g1a-carry-add-20": "G1V1-U5-KP01",
    "g1b-money-convert-yuan-jiao": "G1V2-U5-KP01",
    "renminbi-conversion": "G1V2-U5-KP01",
    "g1b-simple-shopping-change": "G1V2-U5-KP02",
    "g1b-simple-shopping": "G1V2-U5-KP02",
    "g2a-multiply-several-groups": "G2V1-U4-KP01",
    "g2a-multiply-meaning": "G2V1-U4-KP01",
  };

  function getPointIdCandidates(pointOrId) {
    if (typeof pointOrId === "string") return [pointOrId];
    const candidates = [
      pointOrId?.id,
      pointOrId?.sourceQuestionBankId,
      pointOrId?.sourceQuestionId,
      pointOrId?.questionBankStats?.sourceId,
      ...(pointOrId?.lesson_ids || []),
      ...(pointOrId?.lessonIds || []),
    ].filter(Boolean);
    return candidates.flatMap((id) => (aliases[id] ? [id, aliases[id]] : [id]));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getPointOverlay(pointOrId) {
    for (const id of getPointIdCandidates(pointOrId)) {
      if (points[id]) return clone(points[id]);
    }
    return null;
  }

  function list() {
    return Object.entries(points).map(([id, value]) => ({ id, ...clone(value) }));
  }

  window.LezhiKnowledgePointOverlays = {
    version: 1,
    points,
    getPointOverlay,
    list,
  };
})();
