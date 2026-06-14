const icons = {
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a3.5 3.5 0 0 0-3.5 3.5v5a3.5 3.5 0 0 0 7 0v-5A3.5 3.5 0 0 0 12 3Z"/><path d="M19 11.5a7 7 0 0 1-14 0"/><path d="M12 18.5V22"/></svg>',
  keyboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h.01"/><path d="M11 9h.01"/><path d="M15 9h.01"/><path d="M17 13h.01"/><path d="M13 13h.01"/><path d="M9 13h.01"/><path d="M7 17h10"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z"/><circle cx="12" cy="13" r="3"/></svg>',
  parent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H21"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H21v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.2-3.2a2 2 0 0 0-2.8 0L6 21"/></svg>',
  light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.2 14.4A6 6 0 1 1 15.8 14c-.8.6-1.1 1.3-1.2 2H9.5c-.1-.7-.5-1.3-1.3-1.6Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2.9 6.2 6.8.8-5 4.7 1.3 6.7-6-3.3-6 3.3 1.3-6.7-5-4.7 6.8-.8L12 2Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
};

const USE_BROWSER_SPEECH_RECOGNITION = false;
const USE_REALTIME_ASR = true;
const MAX_RECORDING_MS = 9000;
const REALTIME_ASR_CHUNK_BYTES = 6400;

const customLessons = [
  {
    id: "fraction-compare",
    subject: "数学",
    edition: "人教版",
    grade: "三年级上册",
    unit: "分数的初步认识",
    lesson: "分数大小比较",
    node: "异分母分数比较",
    problem: "比较 2/3 和 3/4 哪个大？",
    initialContext: "分母不一样，先不要急着比分子。",
    initialMessage: "我们只看一件事：要不要把它们变成同样的小份？",
    initialStep: "小台阶 1：先看分母",
    stepHint: "分母不一样时，先不要急着比分子，要想办法让它们能比较。",
    teachbackPrompt: "这次换你当小老师，讲给我听：为什么 3/4 比 2/3 大？",
    repairPrompt: "我们看着图慢慢说：为什么 9 小格比 8 小格多？",
    doneMessage: "你讲清楚了。你不是只说答案，还说出了为什么。",
    prerequisites: ["认识分数", "知道分母表示平均分成几份", "同分母分数比较"],
    microSteps: ["先看分母", "变成能比较的样子", "说出为什么 3/4 更大"],
    commonGaps: ["直接比分子", "不知道为什么要通分", "会算但讲不清"],
    strategies: [
      {
        key: "step",
        label: "拆步骤",
        childLabel: "小台阶讲法",
        message: "我们只做一步：先看分母。分母不一样，就不能直接比分子。",
        guidance: "下一步，只看一件事：要不要把它们变成同样的小份？",
      },
      {
        key: "visual",
        label: "画图",
        childLabel: "看图讲法",
        message: "看图说：三分之二是 8 小格，四分之三是 9 小格。9 小格更多。",
        guidance: "看一看，8 小格和 9 小格，谁更多？",
      },
      {
        key: "story",
        label: "生活类比",
        childLabel: "饼干讲法",
        message: "想成两块一样大的饼干。要比较吃了多少，就先切成一样细的小份。",
        guidance: "切成一样细之后，谁拿到的小份更多？",
      },
      {
        key: "example",
        label: "换例子",
        childLabel: "换个例子",
        message: "换个更小的例子：比较 1/2 和 2/3，也要先让每一小份一样大。",
        guidance: "如果都切成 6 小份，1/2 是几份？2/3 是几份？",
      },
    ],
    answer: {
      attemptKeywords: ["通分", "十二", "12", "一样", "同样", "小格"],
      answerKeywords: ["3/4", "四分之三", "三分之四"],
      conceptKeywords: ["分母", "不同", "不一样"],
      whyKeywords: ["不能直接", "一样大", "同样", "能比较", "通分"],
      ownWordsKeywords: ["小格", "涂", "切", "饼干"],
      resultKeywords: ["9", "九", "更多", "更大", "四分之三", "3/4"],
    },
    visualType: "fraction",
    visualLabel: "程序精准绘制",
    visualTitle: "把它们都变成 12 小格",
    visualCardTitle: "AI 生活图",
    visualCardHint: "需要时再画“饼干切小份”的例子。",
    imagePrompt: [
      "为低年级小学生生成一张帮助理解分数比较的生活情景图。",
      "画面：两块一样大的圆形饼干或蛋糕放在浅色桌面上，左边切成 3 份并涂 2 份，右边切成 4 份并涂 3 份。",
      "目的：帮助孩子理解 2/3 和 3/4 的大小比较。",
      "要求：儿童教育插图风格，画面干净，主体清楚，不要复杂小字，不要真实品牌，不要错误数学符号。",
    ],
    generatedCaption: "这张图用于生活类比；真正的分数比例以上面的程序图为准。",
    summary: "比较 2/3 和 3/4 时，分母不一样，不能直接比分子。可以先变成同样的小份，再比较谁更多。",
    explainSummary: "孩子已经能说出“分母不同要先通分，再比较 8/12 和 9/12”。",
    nextSuggestion: "明天再练 1 道分母不同的分数比较题，并让孩子继续当小老师讲一遍。",
    simulated: {
      guiding: "要通分，三分之二是十二分之八，四分之三是十二分之九，所以四分之三大。",
      teachback: "分母不一样，不能直接比分子。先都变成十二小格，三分之二是八个小格，四分之三是九个小格，所以四分之三更大。",
      repair: "要先让每一小份一样大，再看谁涂的小格更多。四分之三是九格，比八格多。",
    },
  },
  {
    id: "rectangle-perimeter",
    subject: "数学",
    edition: "人教版",
    grade: "三年级上册",
    unit: "长方形和正方形",
    lesson: "周长",
    node: "长方形周长",
    problem: "长方形长 5 米、宽 3 米，周长是多少？",
    initialContext: "周长就是沿着边走一整圈。",
    initialMessage: "我们先找一找：这个长方形一圈有几条边？",
    initialStep: "小台阶 1：找到一圈",
    stepHint: "周长不是只加长和宽，而是把外面一整圈的边都加起来。",
    teachbackPrompt: "你当小老师讲一遍：为什么要算 5+3+5+3？",
    repairPrompt: "看着图沿外边走一圈：哪两条是 5 米？哪两条是 3 米？",
    doneMessage: "讲得清楚。你说出了周长是一整圈，所以四条边都要算。",
    prerequisites: ["认识长方形", "会做两位数以内加法", "理解一圈的意思"],
    microSteps: ["找到长和宽", "沿外边走一圈", "把四条边相加"],
    commonGaps: ["只算 5+3", "忘记有两条长和两条宽", "会算但说不出周长是一圈"],
    strategies: [
      {
        key: "step",
        label: "拆步骤",
        childLabel: "小台阶讲法",
        message: "先不算式子。用手指沿着外边走一圈，这一圈才叫周长。",
        guidance: "这一圈里，有几条边要算进去？",
      },
      {
        key: "visual",
        label: "画图",
        childLabel: "看图讲法",
        message: "看图：上边 5 米，下边也是 5 米；左边 3 米，右边也是 3 米。",
        guidance: "四条边合起来，是不是 5+3+5+3？",
      },
      {
        key: "story",
        label: "生活类比",
        childLabel: "跑步讲法",
        message: "想象你绕操场边线跑一整圈，不是只跑一条长边和一条短边。",
        guidance: "一整圈要经过几条边？",
      },
      {
        key: "example",
        label: "换例子",
        childLabel: "换个例子",
        message: "换成更小的长方形：长 4 米、宽 2 米，也要算四条边。",
        guidance: "4+2+4+2 等于多少？",
      },
    ],
    answer: {
      attemptKeywords: ["16", "十六", "5+3+5+3", "两条长", "两条宽", "一圈", "四条边"],
      answerKeywords: ["16", "十六", "十六米"],
      conceptKeywords: ["周长", "一圈", "四条边", "外边"],
      whyKeywords: ["两条长", "两条宽", "四条", "都要算", "绕一圈", "一整圈"],
      ownWordsKeywords: ["走一圈", "绕一圈", "外面", "边线"],
      resultKeywords: ["16", "十六", "十六米"],
    },
    visualType: "perimeter",
    visualLabel: "程序精准绘制",
    visualTitle: "沿外边走一整圈",
    visualCardTitle: "AI 情景图",
    visualCardHint: "需要时可以画“绕小花园走一圈”的例子。",
    imagePrompt: [
      "为低年级小学生生成一张帮助理解长方形周长的生活情景图。",
      "画面：一个长方形小花园，孩子沿着外边走一整圈，长边标 5 米，短边标 3 米。",
      "要求：儿童教育插图风格，干净清楚，不要复杂小字，不要品牌。",
    ],
    generatedCaption: "这张图帮助孩子理解“周长是一整圈”，具体算式以程序图为准。",
    summary: "长方形周长是外面一整圈的长度。长 5 米、宽 3 米，要算 5+3+5+3，所以是 16 米。",
    explainSummary: "孩子已经能说出周长是一整圈，长和宽都各有两条。",
    nextSuggestion: "下次换一个长方形尺寸，让孩子先沿图说一圈，再写算式。",
    simulated: {
      guiding: "周长是一圈，所以要算四条边，五加三加五加三等于十六米。",
      teachback: "因为周长是沿着外边走一整圈。长方形有两条长边、两条宽边，所以是五加三加五加三，等于十六米。",
      repair: "不是只算长和宽，要把外面一整圈都算上，所以四条边都要加。",
    },
  },
  {
    id: "elapsed-time",
    subject: "数学",
    edition: "人教版",
    grade: "三年级上册",
    unit: "时、分、秒",
    lesson: "经过时间",
    node: "开始时间加经过时间",
    problem: "3:20 开始读书，读了 25 分钟，结束是几点？",
    initialContext: "先找开始时间，再往后数经过的分钟。",
    initialMessage: "我们先从 3:20 出发，往后走 25 分钟。会走到几点？",
    initialStep: "小台阶 1：找到开始时间",
    stepHint: "先看从几点开始，再把经过的分钟加上去；没有跨过整点时，分钟直接相加。",
    teachbackPrompt: "你来当小老师讲一遍：为什么 3:20 加 25 分钟是 3:45？",
    repairPrompt: "看着时间线说：从 20 分往后数 25 分，会到 45 分。",
    doneMessage: "讲清楚了。你说出了从开始时间往后数，不是随便猜一个时间。",
    prerequisites: ["会读钟面", "知道 1 小时等于 60 分钟", "会做 20+25"],
    microSteps: ["找到 3:20", "往后加 25 分钟", "确认没有跨过 4 点"],
    commonGaps: ["把开始时间和经过时间混在一起", "忘记分钟满 60 才进 1 小时", "只报答案讲不出过程"],
    strategies: [
      {
        key: "step",
        label: "拆步骤",
        childLabel: "小台阶讲法",
        message: "先不看答案，只看开始时间：现在是 3 点 20 分。",
        guidance: "20 分再往后数 25 分，会到几分？",
      },
      {
        key: "visual",
        label: "画图",
        childLabel: "时间线讲法",
        message: "看时间线：从 3:20 往右走 25 分钟，停在 3:45。",
        guidance: "从 20 分走到 45 分，中间走了多少分钟？",
      },
      {
        key: "story",
        label: "生活类比",
        childLabel: "读书讲法",
        message: "想象你 3:20 开始读书，读了 25 分钟，就是钟面上的分针往前走 25 小格。",
        guidance: "分针从 20 走 25 小格，会到 45。",
      },
      {
        key: "example",
        label: "换例子",
        childLabel: "换个例子",
        message: "换成 2:10 开始，读 15 分钟，就是 10 分往后加 15 分。",
        guidance: "10+15 是多少？结束是几点？",
      },
    ],
    answer: {
      attemptKeywords: ["3:45", "三点四十五", "45", "四十五", "25分钟", "往后"],
      answerKeywords: ["3:45", "三点四十五", "三点45", "45分"],
      conceptKeywords: ["开始", "往后", "经过", "加"],
      whyKeywords: ["20加25", "二十加二十五", "没有跨过", "不到60", "往后数"],
      ownWordsKeywords: ["时间线", "分针", "走", "读书"],
      resultKeywords: ["3:45", "三点四十五", "45", "四十五"],
    },
    visualType: "time",
    visualLabel: "程序精准绘制",
    visualTitle: "从 3:20 往后走 25 分钟",
    visualCardTitle: "AI 情景图",
    visualCardHint: "需要时可以画“读书计时”的生活例子。",
    imagePrompt: [
      "为低年级小学生生成一张帮助理解经过时间的生活情景图。",
      "画面：孩子 3:20 开始读书，旁边有小钟表和 25 分钟计时提示，结束指向 3:45。",
      "要求：儿童教育插图风格，干净清楚，不要复杂小字，不要品牌。",
    ],
    generatedCaption: "这张图帮助孩子把时间题放进生活场景，具体计算以时间线为准。",
    summary: "从 3:20 开始，往后加 25 分钟。20+25=45，没有到 60 分，所以结束时间是 3:45。",
    explainSummary: "孩子已经能说出从开始时间往后数 25 分钟，并说明没有跨过整点。",
    nextSuggestion: "下次练一个会跨过整点的经过时间题，让孩子继续讲过程。",
    simulated: {
      guiding: "从三点二十往后加二十五分钟，二十加二十五等于四十五，所以是三点四十五。",
      teachback: "因为开始时间是三点二十，要往后数二十五分钟。二十加二十五是四十五，没有到六十，所以结束是三点四十五。",
      repair: "看时间线，从二十分走到四十五分，就是走了二十五分钟。",
    },
  },
  {
    id: "renminbi-conversion",
    subject: "数学",
    edition: "人教版",
    grade: "一年级下册",
    unit: "认识人民币",
    lesson: "人民币换算",
    node: "元角分换算",
    problem: "3 元 5 角等于多少角？",
    initialContext: "先记住一个规则：1 元等于 10 角。",
    initialMessage: "我们先只看 1 元。1 元可以换成多少角？",
    initialStep: "小台阶 1：1 元等于 10 角",
    stepHint: "遇到元和角在一起，先把几元换成几十角，再加上原来的几角。",
    teachbackPrompt: "你来当小老师讲一遍：为什么 3 元 5 角是 35 角？",
    repairPrompt: "看着图慢慢说：1 元是 10 角，3 张 1 元就是几个 10 角？",
    doneMessage: "讲清楚了。你说出了先把元换成角，再把角加上。",
    prerequisites: ["认识 1 元和 1 角", "知道 10 个 1 角是 1 元", "会做 30+5"],
    microSteps: ["记住 1 元=10 角", "把 3 元换成 30 角", "再加 5 角得到 35 角"],
    commonGaps: ["把 3 元直接当 3 角", "忘记 1 元等于 10 角", "会写答案但讲不清先换再加"],
    strategies: [
      {
        key: "step",
        label: "拆步骤",
        childLabel: "小台阶讲法",
        message: "先不急着算 3 元 5 角。只看 3 元：1 元是 10 角，3 元就是 30 角。",
        guidance: "3 元换成 30 角以后，再加上几角？",
      },
      {
        key: "visual",
        label: "画图",
        childLabel: "看钱讲法",
        message: "看图：一张 1 元能换 10 个 1 角。3 张 1 元就是 30 个 1 角，再加 5 角。",
        guidance: "30 角再加 5 角，一共是多少角？",
      },
      {
        key: "story",
        label: "生活类比",
        childLabel: "买东西讲法",
        message: "想象买文具时，把 1 元都换成 1 角硬币。3 元换成 30 个 1 角，再放进 5 个 1 角。",
        guidance: "篮子里一共有多少个 1 角？",
      },
      {
        key: "example",
        label: "换例子",
        childLabel: "换个例子",
        message: "换成 2 元 4 角：2 元先换成 20 角，再加 4 角。",
        guidance: "20 角加 4 角是多少角？",
      },
    ],
    answer: {
      attemptKeywords: ["35", "三十五", "30", "三十", "1元10角", "一元十角", "换成角"],
      answerKeywords: ["35", "三十五", "35角", "三十五角"],
      conceptKeywords: ["1元", "一元", "10角", "十角", "元", "角"],
      whyKeywords: ["1元等于10角", "一元等于十角", "3元是30角", "三元是三十角", "再加5角"],
      ownWordsKeywords: ["换钱", "硬币", "买东西", "先换", "再加"],
      resultKeywords: ["35", "三十五", "三十五角"],
    },
    visualType: "money",
    visualLabel: "程序精准绘制",
    visualTitle: "先把元换成角，再相加",
    visualCardTitle: "AI 生活图",
    visualCardHint: "需要时可以画“买文具换零钱”的生活例子。",
    imagePrompt: [
      "为低年级小学生生成一张帮助理解人民币元角换算的生活情景图。",
      "画面：孩子在文具店买铅笔，把 3 元 5 角换成很多 1 角硬币来数。",
      "要求：儿童教育插图风格，干净清楚，不要复杂小字，不要真实品牌，不要真实货币细节。",
    ],
    generatedCaption: "这张图帮助孩子把人民币换算放进生活场景，具体换算以上面的程序图为准。",
    summary: "1 元等于 10 角，所以 3 元等于 30 角。3 元 5 角就是 30 角加 5 角，等于 35 角。",
    explainSummary: "孩子已经能说出先把元换成角，再把已有的角加上。",
    nextSuggestion: "下次练 2 元 8 角、4 元 6 角这类题，让孩子继续讲换算过程。",
    simulated: {
      guiding: "一元等于十角，三元就是三十角，再加五角，所以是三十五角。",
      teachback: "因为一元可以换成十角，三元就是三十角。三十角再加五角，一共是三十五角。",
      repair: "先把三元换成三个十角，也就是三十角，再数上五角。",
    },
  },
];

const legacyCurriculumBlueprints = [
  {
    id: "g1a-count-objects",
    grade: "一年级上册",
    unit: "准备课",
    lesson: "数一数",
    node: "按顺序点数物体",
    problem: "图上有 6 个苹果，应该怎样数才不漏也不重复？",
    microSteps: ["一个一个指着数", "每数一个就做记号", "说出最后一个数就是总数"],
    commonGaps: ["跳着数漏掉物体", "重复数同一个物体", "不知道最后一个数表示总数"],
    keywords: ["数一数", "点数", "总数", "几个", "不漏", "不重复", "苹果"],
    visualType: "count",
    answerKeywords: ["6", "六", "一个一个", "指着数"],
  },
  {
    id: "g1a-compare-quantity",
    grade: "一年级上册",
    unit: "准备课",
    lesson: "比多少",
    node: "一一对应比较多少",
    problem: "5 只小兔和 4 根胡萝卜，谁多谁少？",
    microSteps: ["把小兔和胡萝卜一一配对", "看谁剩下", "说出谁多谁少"],
    commonGaps: ["只看摆得长短", "不会一一配对", "把多和少说反"],
    keywords: ["比多少", "多", "少", "一一对应", "小兔", "胡萝卜"],
    visualType: "compare",
    answerKeywords: ["小兔多", "胡萝卜少", "5", "4"],
  },
  {
    id: "g1a-position",
    grade: "一年级上册",
    unit: "位置",
    lesson: "上下前后左右",
    node: "用方位词描述位置",
    problem: "小熊在小猫的左边，小狗在小猫的右边，谁在中间？",
    microSteps: ["先找到参照物", "分清左和右", "用一句完整的话说位置"],
    commonGaps: ["没有先找参照物", "左右混淆", "只说物体不说位置关系"],
    keywords: ["位置", "上下", "前后", "左右", "左边", "右边", "中间"],
    visualType: "position",
    answerKeywords: ["小猫", "中间"],
  },
  {
    id: "g1a-numbers-1-5",
    grade: "一年级上册",
    unit: "1-5 的认识和加减法",
    lesson: "1-5 的认识",
    node: "1-5 的数数、读写和大小",
    problem: "3 和 5 比，哪个数更大？",
    microSteps: ["按顺序数 1 到 5", "在数线上找到 3 和 5", "越往后数越大"],
    commonGaps: ["只记形状不理解数量", "数序不稳", "比较大小时看数字形状"],
    keywords: ["1-5", "一到五", "比大小", "数序", "3", "5"],
    visualType: "number-line",
    answerKeywords: ["5", "五", "更大", "后面"],
  },
  {
    id: "g1a-ordinal",
    grade: "一年级上册",
    unit: "1-5 的认识和加减法",
    lesson: "几和第几",
    node: "区分数量几和顺序第几",
    problem: "一排有 5 个小朋友，从左数第 3 个是什么意思？",
    microSteps: ["先确定从哪边开始", "按顺序数到第 3 个", "区分一共有几个和第几个"],
    commonGaps: ["把第 3 个理解成 3 个", "忘记从哪边开始数", "左右方向改变后答案不变"],
    keywords: ["几和第几", "第几", "第3", "顺序", "从左数", "从右数"],
    visualType: "position",
    answerKeywords: ["第三个", "第3个", "一个人", "不是三个"],
  },
  {
    id: "g1a-decompose-5",
    grade: "一年级上册",
    unit: "1-5 的认识和加减法",
    lesson: "分与合",
    node: "5 以内数的组成",
    problem: "5 可以分成 2 和几？",
    microSteps: ["先摆出 5 个圆片", "拿走 2 个", "数剩下几个"],
    commonGaps: ["只背分合不理解数量", "漏掉互换关系", "分成后总数变了"],
    keywords: ["分与合", "组成", "分成", "5可以分成", "合起来"],
    visualType: "ten-frame",
    answerKeywords: ["3", "三", "2和3"],
  },
  {
    id: "g1a-add-within-5",
    grade: "一年级上册",
    unit: "1-5 的认识和加减法",
    lesson: "5 以内加法",
    node: "用合起来理解加法",
    problem: "2 个红圆片和 3 个蓝圆片合起来是几个？",
    microSteps: ["看清两部分", "把两部分合起来", "用加法式子表示"],
    commonGaps: ["不知道加法表示合起来", "漏数其中一部分", "只写答案不说过程"],
    keywords: ["5以内加法", "加法", "合起来", "一共", "2+3"],
    visualType: "ten-frame",
    answerKeywords: ["5", "五", "2+3", "合起来"],
  },
  {
    id: "g1a-subtract-within-5",
    grade: "一年级上册",
    unit: "1-5 的认识和加减法",
    lesson: "5 以内减法",
    node: "用拿走理解减法",
    problem: "5 个圆片拿走 2 个，还剩几个？",
    microSteps: ["先摆出 5 个", "拿走 2 个", "数剩下几个"],
    commonGaps: ["把减法看成合起来", "拿走后还数原来的总数", "不会用剩下说减法"],
    keywords: ["5以内减法", "减法", "拿走", "还剩", "5-2"],
    visualType: "ten-frame",
    answerKeywords: ["3", "三", "5-2", "还剩"],
  },
  {
    id: "g1a-zero",
    grade: "一年级上册",
    unit: "1-5 的认识和加减法",
    lesson: "0 的认识",
    node: "0 表示没有和有关计算",
    problem: "盘子里有 3 个桃，吃掉 3 个，还剩几个？",
    microSteps: ["先看原来有几个", "再看拿走几个", "没有剩下就是 0"],
    commonGaps: ["不知道 0 可以做答案", "把 0 当成空白", "3-3 误算成 3"],
    keywords: ["0", "零", "没有", "一个也没有", "3-3"],
    visualType: "ten-frame",
    answerKeywords: ["0", "零", "没有"],
  },
  {
    id: "g1a-solid-shapes",
    grade: "一年级上册",
    unit: "认识图形（一）",
    lesson: "立体图形",
    node: "认识长方体、正方体、圆柱和球",
    problem: "足球更像球，铅笔盒更像什么图形？",
    microSteps: ["先看物体外形", "和学过的立体图形比较", "说出像哪一种"],
    commonGaps: ["把平面图形和立体图形混淆", "只看颜色不看形状", "不会举生活例子"],
    keywords: ["长方体", "正方体", "圆柱", "球", "立体图形", "图形一"],
    visualType: "shape",
    answerKeywords: ["长方体", "铅笔盒"],
  },
  {
    id: "g1a-numbers-6-10",
    grade: "一年级上册",
    unit: "6-10 的认识和加减法",
    lesson: "6-10 的认识",
    node: "6-10 的数数、顺序和大小",
    problem: "8 和 10 比，哪个更大？",
    microSteps: ["按顺序数到 10", "在数线上找 8 和 10", "越往后数越大"],
    commonGaps: ["8、9、10 顺序不稳", "不会从任意数接着数", "比较大小靠猜"],
    keywords: ["6-10", "六到十", "数序", "比大小", "8", "10"],
    visualType: "number-line",
    answerKeywords: ["10", "十", "更大", "后面"],
  },
  {
    id: "g1a-add-subtract-10",
    grade: "一年级上册",
    unit: "6-10 的认识和加减法",
    lesson: "10 以内加减法",
    node: "10 以内加法和减法",
    problem: "7 + 2 等于几？可以怎样想？",
    microSteps: ["先找到 7", "往后数 2 个", "停在哪个数就是答案"],
    commonGaps: ["数手指时多一或少一", "加减号看错", "不会说出用数数或分合来想"],
    keywords: ["10以内", "加减法", "7+2", "往后数", "分合"],
    visualType: "number-line",
    answerKeywords: ["9", "九", "往后数"],
  },
  {
    id: "g1a-continuous-add-subtract",
    grade: "一年级上册",
    unit: "6-10 的认识和加减法",
    lesson: "连加连减和加减混合",
    node: "按顺序计算连加连减",
    problem: "3 + 2 + 4 应该先算哪一步？",
    microSteps: ["从左到右看算式", "先算 3+2", "把结果再和 4 相加"],
    commonGaps: ["跳着算后面的数", "忘记中间结果", "看到三个数就乱加或乱减"],
    keywords: ["连加", "连减", "加减混合", "从左到右", "3+2+4"],
    visualType: "arithmetic",
    answerKeywords: ["先算3+2", "先算三加二", "5", "再加4"],
  },
  {
    id: "g1a-numbers-11-20",
    grade: "一年级上册",
    unit: "11-20 各数的认识",
    lesson: "11-20 的认识",
    node: "十和几个一组成十几",
    problem: "15 里面有几个十和几个一？",
    microSteps: ["先看十位上的 1", "再看个位上的 5", "说成 1 个十和 5 个一"],
    commonGaps: ["把 15 读写成 51", "不知道十位和个位", "不会用十和一解释"],
    keywords: ["11-20", "十几", "十位", "个位", "1个十", "几个一"],
    visualType: "place-value",
    answerKeywords: ["1个十", "一个十", "5个一", "五个一"],
  },
  {
    id: "g1a-teen-add-subtract",
    grade: "一年级上册",
    unit: "11-20 各数的认识",
    lesson: "十几加几和相应减法",
    node: "十几加几、十几减几",
    problem: "13 + 2 等于几？",
    microSteps: ["13 里面有 1 个十和 3 个一", "只把个位 3 加 2", "十位不变得到 15"],
    commonGaps: ["十位和个位混加", "不会把十几拆成十和几", "加完个位忘记十"],
    keywords: ["十几加几", "十几减几", "13+2", "个位", "十位"],
    visualType: "place-value",
    answerKeywords: ["15", "十五", "3加2"],
  },
  {
    id: "g1a-clock-hour",
    grade: "一年级上册",
    unit: "认识钟表",
    lesson: "认识整时",
    node: "看钟面读整时",
    problem: "分针指着 12，时针指着 7，是几时？",
    microSteps: ["先看分针是不是指 12", "再看时针指向几", "说成几时"],
    commonGaps: ["先看错时针和分针", "分针指 12 仍读成 12 时", "不会用生活时间说"],
    keywords: ["认识钟表", "整时", "几时", "分针", "时针", "钟表"],
    visualType: "clock",
    answerKeywords: ["7时", "七时", "7点", "七点"],
  },
  {
    id: "g1a-carry-add-20",
    grade: "一年级上册",
    unit: "20 以内的进位加法",
    lesson: "进位加法",
    node: "凑十法计算 20 以内进位加法",
    problem: "9 + 4 怎样算更快？",
    microSteps: ["先把 9 凑成 10", "从 4 里拿出 1", "10 再加剩下的 3"],
    commonGaps: ["不会拆第二个数", "忘记凑十后还剩几个", "只背答案不理解进位"],
    keywords: ["20以内进位加法", "进位加法", "凑十", "9加几", "9+4"],
    visualType: "ten-frame",
    answerKeywords: ["13", "十三", "凑十", "10加3"],
  },
  {
    id: "g1b-plane-shapes",
    grade: "一年级下册",
    unit: "认识图形（二）",
    lesson: "平面图形",
    node: "认识长方形、正方形、三角形、圆和平行四边形",
    problem: "硬币的面更像什么图形？",
    microSteps: ["看物体的一个面", "和学过的平面图形比较", "说出图形名称"],
    commonGaps: ["把立体物体和一个面混在一起", "正方形和长方形混淆", "只看大小不看形状"],
    keywords: ["认识图形二", "平面图形", "长方形", "正方形", "三角形", "圆"],
    visualType: "shape",
    answerKeywords: ["圆", "圆形"],
  },
  {
    id: "g1b-plane-shape-compose",
    grade: "一年级下册",
    unit: "认识图形（二）",
    lesson: "图形拼组",
    node: "用平面图形拼组新图形",
    problem: "两个一样的三角形可以拼成什么图形？",
    microSteps: ["先看两个三角形是否一样", "试着把边贴在一起", "观察拼出的新图形"],
    commonGaps: ["只认单个图形不会组合", "拼组后不会说新图形", "图形旋转后认不出来"],
    keywords: ["拼组", "拼图形", "两个三角形", "平面图形"],
    visualType: "shape",
    answerKeywords: ["正方形", "长方形", "平行四边形", "三角形"],
  },
  {
    id: "g1b-borrow-subtract-20",
    grade: "一年级下册",
    unit: "20 以内的退位减法",
    lesson: "十几减 9",
    node: "破十法计算十几减 9",
    problem: "13 - 9 怎样算？",
    microSteps: ["把 13 看成 10 和 3", "先算 10-9", "再把 1 和 3 合起来"],
    commonGaps: ["不知道为什么要破十", "10-9 后忘记加个位", "把 13-9 误算成 9-3"],
    keywords: ["退位减法", "十几减9", "破十", "13-9"],
    visualType: "ten-frame",
    answerKeywords: ["4", "四", "破十", "10减9"],
  },
  {
    id: "g1b-subtract-20-general",
    grade: "一年级下册",
    unit: "20 以内的退位减法",
    lesson: "十几减几",
    node: "十几减 8、7、6、5、4、3、2",
    problem: "15 - 7 可以怎样想？",
    microSteps: ["把 15 分成 10 和 5", "先算 10-7", "再加上剩下的 5"],
    commonGaps: ["退位后漏加个位", "不会选择破十或想加算减", "只背答案不稳定"],
    keywords: ["十几减几", "15-7", "破十法", "想加算减"],
    visualType: "ten-frame",
    answerKeywords: ["8", "八", "10减7", "3加5"],
  },
  {
    id: "g1b-classify",
    grade: "一年级下册",
    unit: "分类与整理",
    lesson: "分类",
    node: "按一个标准分类",
    problem: "一堆扣子可以按颜色分，也可以按形状分，先要确定什么？",
    microSteps: ["先选一个分类标准", "按这个标准分组", "数一数每组有多少"],
    commonGaps: ["同时按两个标准导致混乱", "分类标准说不清", "分完不会整理数量"],
    keywords: ["分类", "整理", "标准", "按颜色", "按形状"],
    visualType: "data",
    answerKeywords: ["标准", "分类标准", "先确定"],
  },
  {
    id: "g1b-numbers-100",
    grade: "一年级下册",
    unit: "100 以内数的认识",
    lesson: "100 以内数数和读写",
    node: "100 以内数的组成、读写和数位",
    problem: "46 里面有几个十和几个一？",
    microSteps: ["看十位上的 4", "看个位上的 6", "说成 4 个十和 6 个一"],
    commonGaps: ["读写两位数时颠倒", "不理解十位表示几个十", "整十数个位写漏 0"],
    keywords: ["100以内数", "读写", "数位", "十位", "个位", "46"],
    visualType: "place-value",
    answerKeywords: ["4个十", "四个十", "6个一", "六个一"],
  },
  {
    id: "g1b-compare-100",
    grade: "一年级下册",
    unit: "100 以内数的认识",
    lesson: "100 以内数的大小比较",
    node: "比较两位数大小",
    problem: "46 和 64 哪个数更大？",
    microSteps: ["先比十位", "十位大的数就大", "十位一样再比个位"],
    commonGaps: ["只看个位数字大小", "不会先比十位", "多一些少一些表达不清"],
    keywords: ["100以内", "比较大小", "多一些", "少一些", "46", "64"],
    visualType: "place-value",
    answerKeywords: ["64", "六十四", "十位"],
  },
  {
    id: "renminbi-conversion",
    grade: "一年级下册",
    unit: "认识人民币",
    lesson: "人民币换算",
    node: "元角分换算",
    problem: "3 元 5 角等于多少角？",
    microSteps: ["记住 1 元=10 角", "把 3 元换成 30 角", "再加 5 角得到 35 角"],
    commonGaps: ["把 3 元直接当 3 角", "忘记 1 元等于 10 角", "会写答案但讲不清先换再加"],
    keywords: ["人民币", "元角分", "元和角", "换算", "钱", "买东西"],
    visualType: "money",
    answerKeywords: ["35", "三十五", "35角", "1元10角"],
  },
  {
    id: "g1b-simple-shopping",
    grade: "一年级下册",
    unit: "认识人民币",
    lesson: "简单购物",
    node: "用人民币解决简单购物问题",
    problem: "一本本子 4 元，付 5 元，应找回多少钱？",
    initialContext: "购物找钱先分清商品价格和付出去的钱。",
    initialMessage: "我们先只看价格：一本本子要多少钱？",
    initialStep: "小台阶 1：看清商品价格",
    stepHint: "先看商品价格，再看付了多少钱，最后用付的钱减去价格。",
    microSteps: ["看清商品价格", "看清付了多少钱", "用付的钱减去价格"],
    commonGaps: ["分不清付出和找回", "把价格和找回相加", "单位元角混用"],
    keywords: ["购物", "找钱", "付钱", "价格", "人民币"],
    visualType: "money",
    answerKeywords: ["1元", "一元", "找回"],
  },
  {
    id: "g1b-add-subtract-tens",
    grade: "一年级下册",
    unit: "100 以内的加法和减法（一）",
    lesson: "整十数加减整十数",
    node: "几十加减几十",
    problem: "30 + 40 等于多少？",
    microSteps: ["把 30 看成 3 个十", "把 40 看成 4 个十", "3 个十加 4 个十是 7 个十"],
    commonGaps: ["把 30+40 算成 7", "不理解几个十", "漏写个位 0"],
    keywords: ["整十数", "几十加几十", "30+40", "几个十"],
    visualType: "place-value",
    answerKeywords: ["70", "七十", "7个十"],
  },
  {
    id: "g1b-add-100-no-carry",
    grade: "一年级下册",
    unit: "100 以内的加法和减法（一）",
    lesson: "两位数加一位数、整十数",
    node: "100 以内不进位加法",
    problem: "34 + 5 等于多少？",
    microSteps: ["先看个位 4+5", "十位 3 不变", "合成 39"],
    commonGaps: ["个位和十位乱加", "加一位数时改了十位", "不会用数位解释"],
    keywords: ["两位数加一位数", "不进位加法", "34+5", "100以内加法"],
    visualType: "place-value",
    answerKeywords: ["39", "三十九", "4加5"],
  },
  {
    id: "g1b-subtract-100-no-borrow",
    grade: "一年级下册",
    unit: "100 以内的加法和减法（一）",
    lesson: "两位数减一位数、整十数",
    node: "100 以内不退位减法",
    problem: "46 - 3 等于多少？",
    microSteps: ["先看个位 6-3", "十位 4 不变", "合成 43"],
    commonGaps: ["从十位减一位数", "个位够减也去退位", "不会说十位为什么不变"],
    keywords: ["两位数减一位数", "不退位减法", "46-3", "100以内减法"],
    visualType: "place-value",
    answerKeywords: ["43", "四十三", "6减3"],
  },
  {
    id: "g1b-pattern",
    grade: "一年级下册",
    unit: "找规律",
    lesson: "图形和数的规律",
    node: "发现重复规律并接着排",
    problem: "红、蓝、红、蓝、红，下面应该是什么颜色？",
    microSteps: ["先找重复的一组", "看已经排到哪里", "按规律接着排"],
    commonGaps: ["只看最后一个", "找不到重复单位", "规律改变后还按旧规律"],
    keywords: ["找规律", "规律", "重复", "接着排", "红蓝"],
    visualType: "pattern",
    answerKeywords: ["蓝", "蓝色", "红蓝一组"],
  },
  {
    id: "g2a-length-unit",
    grade: "二年级上册",
    unit: "长度单位",
    lesson: "厘米和米",
    node: "认识厘米、米并选择合适单位",
    problem: "橡皮大约长 4 厘米，教室大约长 8 什么？",
    microSteps: ["先想物体有多长", "短的常用厘米", "长的常用米"],
    commonGaps: ["厘米和米乱用", "不会估计实际长度", "只看数字不看单位"],
    keywords: ["长度单位", "厘米", "米", "测量", "单位"],
    visualType: "ruler",
    answerKeywords: ["米", "8米", "教室长"],
  },
  {
    id: "g2a-line-segment",
    grade: "二年级上册",
    unit: "长度单位",
    lesson: "线段",
    node: "认识线段并测量长度",
    problem: "一条线段从 0 厘米到 6 厘米，它长多少厘米？",
    microSteps: ["看线段从哪里开始", "看线段到哪里结束", "结束刻度减开始刻度"],
    commonGaps: ["不从 0 开始时直接读终点", "线段和曲线混淆", "测量时尺子没对齐"],
    keywords: ["线段", "量一量", "厘米", "尺子", "0刻度"],
    visualType: "ruler",
    answerKeywords: ["6厘米", "六厘米", "6"],
  },
  {
    id: "g2a-add-100-carry",
    grade: "二年级上册",
    unit: "100 以内的加法和减法（二）",
    lesson: "两位数加两位数",
    node: "两位数加两位数进位加法",
    problem: "36 + 28 怎样列竖式？",
    microSteps: ["相同数位对齐", "先算个位 6+8", "个位满十向十位进 1"],
    commonGaps: ["数位没有对齐", "个位满十忘记进位", "先算十位导致进位漏掉"],
    keywords: ["两位数加两位数", "进位加法", "竖式", "36+28", "100以内加法二"],
    visualType: "place-value",
    answerKeywords: ["64", "六十四", "进1", "进位"],
  },
  {
    id: "g2a-subtract-100-borrow",
    grade: "二年级上册",
    unit: "100 以内的加法和减法（二）",
    lesson: "两位数减两位数",
    node: "两位数减两位数退位减法",
    problem: "52 - 27 怎样列竖式？",
    microSteps: ["相同数位对齐", "个位 2 不够减 7", "从十位退 1 作 10"],
    commonGaps: ["退位后十位忘记少 1", "个位不够减还硬减", "数位没有对齐"],
    keywords: ["两位数减两位数", "退位减法", "竖式", "52-27", "100以内减法二"],
    visualType: "place-value",
    answerKeywords: ["25", "二十五", "退位"],
  },
  {
    id: "g2a-add-subtract-mixed",
    grade: "二年级上册",
    unit: "100 以内的加法和减法（二）",
    lesson: "连加、连减和加减混合",
    node: "100 以内连加连减和加减混合",
    problem: "23 + 18 - 9 应该怎样算？",
    microSteps: ["从左往右算", "先算 23+18", "再用结果减 9"],
    commonGaps: ["跳过中间结果", "加减顺序混乱", "竖式转写时抄错数"],
    keywords: ["连加", "连减", "加减混合", "23+18-9", "从左往右"],
    visualType: "arithmetic",
    answerKeywords: ["32", "三十二", "先算23+18"],
  },
  {
    id: "g2a-angle",
    grade: "二年级上册",
    unit: "角的初步认识",
    lesson: "认识角",
    node: "认识角、直角、锐角和钝角",
    problem: "三角尺上的最大角通常是什么角？",
    microSteps: ["先找角的顶点", "再看两条边", "用三角尺比一比是不是直角"],
    commonGaps: ["把边长和角大小混淆", "只看开口方向", "不会用直角作标准比较"],
    keywords: ["角", "直角", "锐角", "钝角", "顶点", "边"],
    visualType: "angle",
    answerKeywords: ["直角", "最大角"],
  },
  {
    id: "g2a-multiply-meaning",
    grade: "二年级上册",
    unit: "表内乘法（一）",
    lesson: "乘法的初步认识",
    node: "几个相同加数可以用乘法表示",
    problem: "3 盘苹果，每盘 4 个，一共有几个？",
    microSteps: ["看每组是不是同样多", "数有几组", "用几乘几表示"],
    commonGaps: ["把不同加数也写乘法", "几组和每组几个说反", "只背口诀不懂意义"],
    keywords: ["乘法", "几个几", "相同加数", "3盘", "每盘4个"],
    visualType: "array",
    answerKeywords: ["12", "十二", "3个4", "3乘4", "4乘3"],
  },
  {
    id: "g2a-multiply-2-6",
    grade: "二年级上册",
    unit: "表内乘法（一）",
    lesson: "2-6 的乘法口诀",
    node: "用 2-6 的乘法口诀求积",
    problem: "6 × 4 可以用哪句口诀？",
    microSteps: ["看乘法算式里的两个数", "找到对应口诀", "说出积是多少"],
    commonGaps: ["口诀背串", "乘号两边数字看漏", "会背口诀但不会用到题里"],
    keywords: ["2-6乘法口诀", "乘法口诀", "6×4", "四六"],
    visualType: "array",
    answerKeywords: ["四六二十四", "24", "二十四"],
  },
  {
    id: "g2a-observe-object",
    grade: "二年级上册",
    unit: "观察物体（一）",
    lesson: "从不同位置观察物体",
    node: "判断前后左右看到的形状",
    problem: "同一个杯子，从正面和侧面看到的样子一定一样吗？",
    microSteps: ["先确定观察位置", "想象眼睛看到哪一面", "比较不同位置的样子"],
    commonGaps: ["以为同一物体看到的都一样", "分不清正面侧面后面", "不会把看到的图和位置对应"],
    keywords: ["观察物体", "正面", "侧面", "后面", "不同位置"],
    visualType: "position",
    answerKeywords: ["不一定", "不一样", "位置不同"],
  },
  {
    id: "g2a-multiply-7-9",
    grade: "二年级上册",
    unit: "表内乘法（二）",
    lesson: "7-9 的乘法口诀",
    node: "用 7-9 的乘法口诀求积",
    problem: "8 × 7 可以用哪句口诀？",
    microSteps: ["看两个因数 8 和 7", "找到七八口诀", "说出结果 56"],
    commonGaps: ["7、8、9 口诀容易背混", "只会顺背不会取用", "不会用互换关系"],
    keywords: ["7-9乘法口诀", "七八", "8×7", "表内乘法二"],
    visualType: "array",
    answerKeywords: ["七八五十六", "56", "五十六"],
  },
  {
    id: "g2a-read-time-minute",
    grade: "二年级上册",
    unit: "认识时间",
    lesson: "认识几时几分",
    node: "看钟面读几时几分",
    problem: "时针过了 3，分针指着 6，是几时几分？",
    microSteps: ["先看时针过了几", "再看分针指向几小格", "合起来读几时几分"],
    commonGaps: ["分针指 6 读成 6 分", "时针接近下一个数就读错", "不知道 1 大格是 5 分"],
    keywords: ["认识时间", "几时几分", "分针", "时针", "5分5分数"],
    visualType: "clock",
    answerKeywords: ["3:30", "三点半", "三时三十分", "3时30分"],
  },
  {
    id: "g2a-combination",
    grade: "二年级上册",
    unit: "数学广角",
    lesson: "搭配（一）",
    node: "简单排列和搭配",
    problem: "红、黄两件上衣和黑、蓝两条裤子，可以搭配几套？",
    microSteps: ["先选一件上衣", "分别搭配每条裤子", "再换另一件上衣"],
    commonGaps: ["漏搭配", "重复数同一套", "没有按顺序列举"],
    keywords: ["搭配", "排列", "组合", "数学广角", "几套"],
    visualType: "logic",
    answerKeywords: ["4", "四", "4套"],
  },
  {
    id: "g2b-data-collection",
    grade: "二年级下册",
    unit: "数据收集整理",
    lesson: "调查和统计表",
    node: "收集数据并用统计表整理",
    problem: "调查同学喜欢的水果，第一步应该做什么？",
    microSteps: ["先确定调查问题", "逐个记录数据", "整理成表再比较"],
    commonGaps: ["没确定问题就统计", "记录时漏人或重复", "看表时只看第一行"],
    keywords: ["数据收集", "统计表", "调查", "整理数据"],
    visualType: "data",
    answerKeywords: ["确定问题", "调查问题", "记录"],
  },
  {
    id: "g2b-average-share",
    grade: "二年级下册",
    unit: "表内除法（一）",
    lesson: "平均分",
    node: "理解平均分",
    problem: "12 个苹果平均分给 3 个小朋友，每人几个？",
    microSteps: ["看总数 12", "看平均分成 3 份", "每份同样多"],
    commonGaps: ["每份不一样也当平均分", "总数和份数混淆", "不会用摆一摆理解"],
    keywords: ["平均分", "每份同样多", "12个", "3个小朋友"],
    visualType: "sharing",
    answerKeywords: ["4", "四", "每人4个"],
  },
  {
    id: "g2b-division-meaning",
    grade: "二年级下册",
    unit: "表内除法（一）",
    lesson: "除法的初步认识",
    node: "用除法表示平均分",
    problem: "12 个苹果平均分给 3 人，可以写成什么除法算式？",
    microSteps: ["总数写在除号前", "平均分成几份写在除号后", "结果表示每份几个"],
    commonGaps: ["除号前后写反", "不知道商表示什么", "把平均分和随便分混淆"],
    keywords: ["除法", "除号", "12÷3", "平均分"],
    visualType: "sharing",
    answerKeywords: ["12÷3=4", "12除以3等于4", "4"],
  },
  {
    id: "g2b-division-2-6",
    grade: "二年级下册",
    unit: "表内除法（一）",
    lesson: "用 2-6 乘法口诀求商",
    node: "用乘法口诀求除法的商",
    problem: "18 ÷ 3 可以想哪句口诀？",
    microSteps: ["看除数 3", "想三几十八", "找到几就是商"],
    commonGaps: ["不知道用哪句口诀", "把商和除数说反", "只背乘法不迁移到除法"],
    keywords: ["用口诀求商", "18÷3", "三几十八", "表内除法"],
    visualType: "sharing",
    answerKeywords: ["三六十八", "6", "六"],
  },
  {
    id: "g2b-shape-motion",
    grade: "二年级下册",
    unit: "图形的运动（一）",
    lesson: "轴对称、平移和旋转",
    node: "辨认轴对称、平移、旋转现象",
    problem: "电梯上下移动，是平移还是旋转？",
    microSteps: ["看图形有没有转圈", "位置变了但方向不变是平移", "绕一点转动是旋转"],
    commonGaps: ["把移动都叫旋转", "轴对称和平移混淆", "只看距离不看方向"],
    keywords: ["图形运动", "轴对称", "平移", "旋转", "电梯"],
    visualType: "motion",
    answerKeywords: ["平移", "方向不变"],
  },
  {
    id: "g2b-division-7-9",
    grade: "二年级下册",
    unit: "表内除法（二）",
    lesson: "用 7-9 的乘法口诀求商",
    node: "用 7-9 口诀求除法的商",
    problem: "56 ÷ 8 可以想哪句口诀？",
    microSteps: ["看除数 8", "想八几五十六", "找到 7 就是商"],
    commonGaps: ["7、8、9 口诀不熟", "除数和商位置混淆", "不会从乘法反推除法"],
    keywords: ["表内除法二", "56÷8", "八几五十六", "口诀求商"],
    visualType: "sharing",
    answerKeywords: ["七八五十六", "7", "七"],
  },
  {
    id: "g2b-mixed-operations",
    grade: "二年级下册",
    unit: "混合运算",
    lesson: "没有括号和有括号的混合运算",
    node: "按运算顺序计算混合算式",
    problem: "18 + 12 ÷ 3 应该先算什么？",
    microSteps: ["先看有没有括号", "没有括号先算乘除", "再算加减"],
    commonGaps: ["完全从左到右算", "看到加号就先加", "有括号时忘记先算括号"],
    keywords: ["混合运算", "运算顺序", "先乘除后加减", "括号"],
    visualType: "arithmetic",
    answerKeywords: ["先算12÷3", "先算除法", "乘除"],
  },
  {
    id: "g2b-remainder-division",
    grade: "二年级下册",
    unit: "有余数的除法",
    lesson: "有余数除法",
    node: "理解余数和余数小于除数",
    problem: "14 个苹果，每 4 个装一盘，可以装几盘，还剩几个？",
    microSteps: ["先按每 4 个分一组", "看能分成几组", "剩下不够一组的就是余数"],
    commonGaps: ["余数比除数还大", "把剩下的也算成一组", "不会把商和余数放回情境"],
    keywords: ["有余数", "余数", "14÷4", "还剩", "每4个"],
    visualType: "sharing",
    answerKeywords: ["3盘", "三盘", "剩2个", "余2"],
  },
  {
    id: "g2b-numbers-10000",
    grade: "二年级下册",
    unit: "万以内数的认识",
    lesson: "千以内、万以内数",
    node: "万以内数的读写和数位",
    problem: "3050 应该怎样读？",
    microSteps: ["从高位读起", "中间有 0 要按规则读", "末尾的 0 不读"],
    commonGaps: ["中间 0 读漏或多读", "数位顺序不清", "写数时漏占位 0"],
    keywords: ["万以内数", "读数", "写数", "数位", "3050"],
    visualType: "place-value",
    answerKeywords: ["三千零五十", "零五十"],
  },
  {
    id: "g2b-compare-10000",
    grade: "二年级下册",
    unit: "万以内数的认识",
    lesson: "万以内数的大小比较和近似数",
    node: "比较万以内数并估计近似数",
    problem: "3280 和 3820 哪个数更大？",
    microSteps: ["先比千位", "千位相同再比百位", "百位大的数更大"],
    commonGaps: ["只看个位或十位", "位数相同不会从高位比", "近似数和准确数混淆"],
    keywords: ["万以内比较", "近似数", "3280", "3820", "高位"],
    visualType: "place-value",
    answerKeywords: ["3820", "百位", "8大于2"],
  },
  {
    id: "g2b-gram-kilogram",
    grade: "二年级下册",
    unit: "克和千克",
    lesson: "质量单位",
    node: "认识克、千克并估计质量",
    problem: "一个西瓜大约重 3 什么？",
    microSteps: ["先想物体轻还是重", "轻小物体常用克", "较重物体常用千克"],
    commonGaps: ["克和千克乱用", "只看数字不看物体", "不会联系生活估计"],
    keywords: ["克", "千克", "质量单位", "重量", "估计"],
    visualType: "mass",
    answerKeywords: ["千克", "3千克"],
  },
  {
    id: "g2b-reasoning",
    grade: "二年级下册",
    unit: "数学广角",
    lesson: "推理",
    node: "用排除法做简单推理",
    problem: "小明不是第一名，小红也不是第一名，三个人里谁可能是第一名？",
    microSteps: ["先记录已知条件", "把不可能的划掉", "看剩下谁可能"],
    commonGaps: ["不记录条件只靠猜", "没有排除不可能项", "把可能和一定混淆"],
    keywords: ["推理", "排除法", "可能", "一定", "数学广角"],
    visualType: "logic",
    answerKeywords: ["剩下的人", "排除", "可能"],
  },
];

const questionBankLessonAliases = {
  "G1V1-U5-KP01": "g1a-carry-add-20",
  "G1V2-U5-KP01": "renminbi-conversion",
  "G1V2-U5-KP02": "g1b-simple-shopping",
  "G2V1-U4-KP01": "g2a-multiply-meaning",
  "G2V2-U2-KP01": "g2b-division-meaning",
};

const questionBankBlueprints = buildQuestionBankBlueprints(window.gradeOneTwoQuestionBank);
const baseCurriculumBlueprints = questionBankBlueprints.length ? questionBankBlueprints : legacyCurriculumBlueprints;
const curriculumBlueprints = mergeCurriculumBlueprints(
  Array.isArray(window.gradeOneTwoKnowledgeCards) ? window.gradeOneTwoKnowledgeCards : [],
  baseCurriculumBlueprints,
);

const lessons = buildLessonCatalog();

function buildQuestionBankBlueprints(bank) {
  const points = Array.isArray(bank?.points) ? bank.points : [];
  return points.map((point) => {
    const questions = normalizeLessonQuestions(point.questions || []);
    const typical = normalizeQuestion(point.typicalQuestion) || questions[0] || null;
    const primaryQuestion = typical || questions[0] || null;
    const id = questionBankLessonAliases[point.id] || point.id.toLowerCase();
    const microSteps = normalizeTextList(point.microSteps || point.substeps, [
      "先读懂题目在问什么",
      "只做当前小台阶",
      "说出答案和原因",
    ]);
    const questionAnswerKeywords = primaryQuestion?.answerKeywords || [];
    return {
      id,
      sourceQuestionBankId: point.id,
      subject: "数学",
      edition: "人教版",
      grade: point.grade || point.volume || "",
      unit: point.unit || "",
      lesson: point.lesson || point.title || point.node || "",
      node: point.node || point.title || point.lesson || "",
      problem: primaryQuestion?.prompt || point.description || point.title || "",
      initialContext: point.description || `${point.title || "这个知识点"} 从一道小题开始。`,
      initialMessage: `我们先学「${point.title || point.node}」。先看这一题：${primaryQuestion?.prompt || point.description || ""}`,
      initialStep: `小台阶 1：${microSteps[0]}`,
      stepHint: point.description || microSteps[0],
      microSteps,
      commonGaps: normalizeTextList(point.commonGaps, ["只报答案不说原因", "漏看题目条件", "换题后不稳"]),
      keywords: normalizeTextList(point.keywords, [point.title, point.unit]).concat(point.questionTypes || []),
      answerKeywords: uniqueKeywords(questionAnswerKeywords.concat(point.answerKeywords || [])),
      masterySignals: normalizeTextList(point.masterySignals, ["能做直接题", "能做变式题", "能说出原因", "能讲给老师听"]),
      diagnosticFocus: normalizeTextList(point.commonGaps, []),
      substeps: normalizeTextList(point.substeps || point.microSteps, microSteps),
      visualType: point.visualType || "generic",
      questionBank: questions,
      useQuestionBankTutor: true,
      activeQuestionId: primaryQuestion?.id || "",
      questionCursor: Math.max(0, questions.findIndex((question) => question.id === primaryQuestion?.id)),
      questionTypes: point.questionTypes || [],
      variationRules: point.variationRules || [],
      teachingMethods: point.teachingMethods || [],
      questionBankStats: {
        sourceId: point.id,
        questionCount: Number(point.questionCount || questions.length),
        typicalCount: questions.filter((question) => question.kind === "typical").length,
        variantCount: questions.filter((question) => question.kind === "variant").length,
      },
    };
  });
}

function normalizeLessonQuestions(questions) {
  return (Array.isArray(questions) ? questions : [])
    .map(normalizeQuestion)
    .filter(Boolean);
}

function normalizeQuestion(question) {
  if (!question || typeof question !== "object") return null;
  const prompt = String(question.prompt || "").trim();
  if (!prompt) return null;
  return {
    id: String(question.id || prompt).trim(),
    kind: question.kind || "variant",
    title: question.title || "",
    type: question.type || "",
    prompt,
    answer: String(question.answer || "").trim(),
    explanation: String(question.explanation || "").trim(),
    answerKeywords: normalizeTextList(question.answerKeywords, [question.answer]).filter(Boolean),
    hasVisualMarkup: Boolean(question.hasVisualMarkup && question.visualMarkup),
    visualMarkup: String(question.visualMarkup || "").trim(),
  };
}

function normalizeTextList(items, fallback = []) {
  const source = Array.isArray(items) ? items : fallback;
  return uniqueKeywords(source.map((item) => String(item || "").trim()).filter(Boolean));
}

function buildLessonCatalog() {
  const customById = new Map(customLessons.map((lesson) => [lesson.id, lesson]));
  const generated = curriculumBlueprints.map((spec) => {
    const custom = customById.get(spec.id);
    const generatedLesson = createCurriculumLesson(spec);
    return custom
      ? mergeCustomLessonWithCurriculum(custom, generatedLesson, spec)
      : generatedLesson;
  });
  const generatedIds = new Set(generated.map((lesson) => lesson.id));
  return generated.concat(customLessons.filter((lesson) => !generatedIds.has(lesson.id)));
}

function mergeCustomLessonWithCurriculum(custom, generatedLesson, spec) {
  return {
    ...generatedLesson,
    ...custom,
    grade: generatedLesson.grade,
    unit: generatedLesson.unit,
    lesson: generatedLesson.lesson,
    node: generatedLesson.node,
    problem: generatedLesson.problem,
    activeQuestion: generatedLesson.activeQuestion,
    questionBank: generatedLesson.questionBank,
    useQuestionBankTutor: generatedLesson.useQuestionBankTutor,
    questionCursor: generatedLesson.questionCursor,
    questionBankStats: generatedLesson.questionBankStats,
    variationRules: generatedLesson.variationRules,
    teachingMethods: generatedLesson.teachingMethods,
    sourceQuestionBankId: generatedLesson.sourceQuestionBankId,
    initialContext: generatedLesson.initialContext,
    initialMessage: generatedLesson.initialMessage,
    initialStep: generatedLesson.initialStep,
    stepHint: generatedLesson.stepHint,
    teachbackPrompt: generatedLesson.teachbackPrompt,
    repairPrompt: generatedLesson.repairPrompt,
    doneMessage: generatedLesson.doneMessage,
    prerequisites: generatedLesson.prerequisites,
    microSteps: generatedLesson.microSteps,
    commonGaps: generatedLesson.commonGaps,
    knowledgeLayers: generatedLesson.knowledgeLayers,
    substeps: generatedLesson.substeps,
    masterySignals: generatedLesson.masterySignals,
    diagnosticFocus: generatedLesson.diagnosticFocus,
    strategies: generatedLesson.strategies,
    answer: generatedLesson.answer,
    visualType: generatedLesson.visualType,
    visualLabel: generatedLesson.visualLabel,
    visualTitle: generatedLesson.visualTitle,
    visualCardTitle: generatedLesson.visualCardTitle,
    visualCardHint: generatedLesson.visualCardHint,
    imagePrompt: generatedLesson.imagePrompt,
    generatedCaption: generatedLesson.generatedCaption,
    summary: generatedLesson.summary,
    explainSummary: generatedLesson.explainSummary,
    nextSuggestion: generatedLesson.nextSuggestion,
    simulated: generatedLesson.simulated,
    curriculumKeywords: spec.keywords,
  };
}

function mergeCurriculumBlueprints(overrides, fallback) {
  const byId = new Map(fallback.map((item) => [item.id, item]));
  for (const override of overrides) {
    if (!override?.id || !byId.has(override.id)) continue;
    byId.set(override.id, {
      ...byId.get(override.id),
      ...override,
      keywords: uniqueKeywords([...(byId.get(override.id).keywords || []), ...(override.keywords || [])]),
      answerKeywords: uniqueKeywords([...(byId.get(override.id).answerKeywords || []), ...(override.answerKeywords || [])]),
    });
  }
  return Array.from(byId.values());
}

function createCurriculumLesson(spec) {
  const strategies = createStrategiesForSpec(spec);
  const questionBank = normalizeLessonQuestions(spec.questionBank || spec.questions || []);
  const activeQuestion =
    questionBank.find((question) => question.id === spec.activeQuestionId) ||
    questionBank[Math.max(0, Number(spec.questionCursor || 0))] ||
    null;
  const problem = activeQuestion?.prompt || spec.problem;
  return {
    id: spec.id,
    subject: "数学",
    edition: "人教版",
    grade: spec.grade,
    unit: spec.unit,
    lesson: spec.lesson,
    node: spec.node,
    problem,
    activeQuestion,
    questionBank,
    useQuestionBankTutor: Boolean(spec.useQuestionBankTutor && questionBank.length),
    questionCursor: Math.max(0, questionBank.findIndex((question) => question.id === activeQuestion?.id)),
    questionBankStats: spec.questionBankStats || null,
    variationRules: spec.variationRules || [],
    teachingMethods: spec.teachingMethods || [],
    sourceQuestionBankId: spec.sourceQuestionBankId || "",
    initialContext: spec.initialContext || `${spec.node} 的学习从一个小问题开始。`,
    initialMessage: spec.initialMessage || `我们先学「${spec.node}」。先看这题：${problem}`,
    initialStep: spec.initialStep || `小台阶 1：${spec.microSteps[0]}`,
    stepHint: spec.stepHint || spec.microSteps[0],
    teachbackPrompt: `这次换你当小老师，讲给我听：${spec.node} 这题应该先想什么？`,
    repairPrompt: `没关系，我们换个更小的说法。先看图，再说：${spec.microSteps[0]}。`,
    doneMessage: "你讲清楚了。你不是只说答案，还说出了怎么想。",
    prerequisites: createPrerequisites(spec),
    microSteps: spec.microSteps,
    commonGaps: spec.commonGaps,
    knowledgeLayers: spec.knowledgeLayers || ["识别层", "理解层", "操作层", "表达层", "迁移层"],
    substeps: spec.substeps || spec.microSteps,
    masterySignals: spec.masterySignals || [],
    diagnosticFocus: spec.diagnosticFocus || spec.masterySignals || spec.commonGaps || [],
    strategies,
    answer: createAnswerRules(spec, activeQuestion),
    visualType: spec.visualType || "generic",
    visualLabel: "程序辅助理解",
    visualTitle: createVisualTitle(spec),
    visualCardTitle: "AI 生活图",
    visualCardHint: `需要时可以画一个“${spec.lesson}”的生活例子。`,
    imagePrompt: createImagePrompt({ ...spec, problem }),
    generatedCaption: "这张图用于生活类比；精确数量关系以上面的程序图为准。",
    summary: `${spec.node}：${spec.microSteps.join("，")}。`,
    explainSummary: `孩子能用自己的话说出「${spec.node}」的关键步骤。`,
    nextSuggestion: `下次换一道「${spec.node}」的题，让孩子继续先做再讲一遍。`,
    simulated: createSimulatedAnswers(spec),
    curriculumKeywords: spec.keywords,
  };
}

function createStrategiesForSpec(spec) {
  return [
    {
      key: "step",
      label: "拆步骤",
      childLabel: "小台阶讲法",
      message: `我们只做一步：${spec.microSteps[0]}。`,
      guidance: spec.microSteps[1] || spec.microSteps[0],
    },
    {
      key: "visual",
      label: "画图",
      childLabel: "看图讲法",
      message: `看图说一说：${spec.microSteps.slice(0, 2).join("，")}。`,
      guidance: spec.microSteps[2] || spec.microSteps[1] || spec.microSteps[0],
    },
    {
      key: "story",
      label: "生活类比",
      childLabel: "生活讲法",
      message: `把它想成生活里的小问题：${spec.problem}`,
      guidance: "先说你看到了什么，再说你怎么一步一步想。",
    },
    {
      key: "example",
      label: "换例子",
      childLabel: "换个例子",
      message: `我们换一道同类小题，还是用这三个台阶：${spec.microSteps.join("，")}。`,
      guidance: "你先讲第一步就可以。",
    },
  ];
}

function createPrerequisites(spec) {
  if (spec.prerequisites?.length) return spec.prerequisites;
  const gradeStart = spec.grade.includes("一年级") ? "会听懂题目里的数量关系" : "一年级相关数感和计算基础";
  return [gradeStart, "能按顺序观察题目条件", "愿意用一句话说出自己的想法"];
}

function createAnswerRules(spec, activeQuestion = null) {
  const activeAnswerKeywords = normalizeTextList(activeQuestion?.answerKeywords, []);
  const base = activeAnswerKeywords.length ? activeAnswerKeywords : spec.answerKeywords || [];
  const explanationKeywords = extractKeyPhrases(activeQuestion?.explanation || "");
  return {
    attemptKeywords: uniqueKeywords(explanationKeywords.concat(spec.microSteps, spec.masterySignals || [], spec.keywords || [])),
    answerKeywords: uniqueKeywords(base),
    conceptKeywords: uniqueKeywords([spec.node, spec.lesson, spec.unit].concat(spec.keywords || [])),
    whyKeywords: uniqueKeywords(explanationKeywords.concat(spec.microSteps, spec.masterySignals || [], ["因为", "所以", "先", "再", "最后"])),
    ownWordsKeywords: uniqueKeywords(["我想", "先", "再", "图上", "生活里", "可以"].concat(spec.keywords || [])),
    resultKeywords: uniqueKeywords(base.concat(explanationKeywords, spec.microSteps.slice(-1))),
  };
}

function extractKeyPhrases(text) {
  const value = String(text || "").replace(/[，。；、,.!?！？：:]/g, " ");
  return uniqueKeywords(
    value
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 2)
      .slice(0, 16),
  );
}

function createVisualTitle(spec) {
  if (spec.id === "g1b-simple-shopping") return "看价格、看付出，再找回";
  if (spec.visualType === "number-line") return "在数线上一步一步看";
  if (spec.visualType === "ten-frame") return "用十格图看数量变化";
  if (spec.visualType === "place-value") return "按数位拆开看";
  if (spec.visualType === "array") return "用几行几列看几个几";
  if (spec.visualType === "sharing") return "平均分给每一份";
  if (spec.visualType === "money") return "先把元换成角，再相加";
  if (spec.visualType === "clock") return "先看时针，再看分针";
  return "把题目拆成三个小台阶";
}

function createImagePrompt(spec) {
  if (spec.id === "g1b-simple-shopping") {
    return [
      "为小学一年级孩子生成一张帮助理解购物找钱的生活情景图。",
      "画面只表现：一本本子价格4元，孩子付5元，售货员找回1元。",
      "画面要像清楚的儿童教学插图，主体大、背景简单、颜色柔和。",
      "不要写复杂文字，不要写错误算式，不要真实品牌，不要真实货币细节，不要出现其他数学内容。",
    ];
  }
  return [
    "为小学低年级孩子生成一张帮助理解数学知识点的生活情景图。",
    `教材范围：人教版${spec.grade}${spec.unit}。`,
    `知识点：${spec.node}。`,
    `当前题目：${spec.problem}。`,
    "要求：儿童教育插图风格，主体清楚，画面干净，不要复杂小字，不要真实品牌，不要直接复刻教材插图。",
  ];
}

function createSimulatedAnswers(spec) {
  const answer = spec.answerKeywords?.[0] || spec.microSteps[spec.microSteps.length - 1] || "我知道了";
  return {
    guiding: `${spec.microSteps.join("，")}，所以答案是${answer}。`,
    teachback: `我先看题目，再一步一步想：${spec.microSteps.join("，")}。`,
    repair: `我可以看图说，先${spec.microSteps[0]}，再${spec.microSteps[1] || spec.microSteps[0]}。`,
  };
}

function uniqueKeywords(items) {
  return Array.from(new Set(items.filter(Boolean).map((item) => String(item))));
}

function createInitialEvidence(lesson) {
  return {
    type: "attempt",
    text: `孩子正在学习「${lesson.node}」。`,
    signal: "开始学习",
    strategy: "拆步骤",
  };
}

let state = {
  view: "child",
  lessonIndex: 0,
  phase: "guiding",
  recording: false,
  voiceStatus: "idle",
  showLessonPicker: false,
  showKeyboard: false,
  showVisual: true,
  strategyIndex: 0,
  mastery: 64,
  completedSteps: 0,
  todayQuestion: 2,
  transcript: "",
  lastStudentText: "",
  aiContext: lessons[0].initialContext,
  aiMessage: lessons[0].initialMessage,
  currentStep: lessons[0].initialStep,
  teachingState: "GUIDED_STEP",
  currentAtomName: "",
  engineSession: null,
  passedQuestionIds: [],
  parentSignals: null,
  feynmanStatus: "还没开始讲",
  canExplainWhy: false,
  canUseOwnWords: false,
  bestStrategy: lessons[0].strategies[0].label,
  imageJob: {
    status: "idle",
    url: "",
    message: "",
    lessonId: lessons[0].id,
    interactionKey: "",
  },
  evidence: [createInitialEvidence(lessons[0])],
};

let recordingSession = null;
let recognitionSession = null;
let realtimeVoiceSession = null;
let currentAudio = null;

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

function icon(name) {
  return icons[name] || "";
}

function currentLesson() {
  return lessons[state.lessonIndex] || lessons[0];
}

function lessonStrategy(index = state.strategyIndex) {
  const lesson = currentLesson();
  return lesson.strategies[index] || lesson.strategies[0];
}

function getLessonQuestionBank(lesson = currentLesson()) {
  return Array.isArray(lesson?.questionBank) ? lesson.questionBank.filter(Boolean) : [];
}

function getQuestionBankSample(lesson = currentLesson()) {
  return getLessonQuestionBank(lesson)
    .slice(0, 6)
    .map((question) => ({
      id: question.id,
      kind: question.kind,
      type: question.type,
      prompt: question.prompt,
      answer: question.answer,
      explanation: question.explanation,
      answerKeywords: question.answerKeywords,
    }));
}

function activateLessonQuestion(lesson, question, cursor = 0) {
  if (!lesson || !question) return false;
  lesson.activeQuestion = question;
  lesson.questionCursor = Math.max(0, cursor);
  lesson.problem = question.prompt;
  lesson.answer = createAnswerRules(lesson, question);
  lesson.visualTitle = createVisualTitle(lesson);
  lesson.imagePrompt = createImagePrompt(lesson);
  lesson.generatedCaption = question.explanation
    ? `这张图对应当前题：${question.explanation}`
    : "这张图用于生活类比；精确数量关系以上面的程序图为准。";
  return true;
}

function advanceLessonQuestion(reason = "换一道同类题") {
  const lesson = currentLesson();
  const bank = getLessonQuestionBank(lesson);
  if (bank.length <= 1) {
    toastMessage("这个知识点暂时没有更多同类题。");
    return false;
  }

  const nextCursor = ((Number(lesson.questionCursor) || 0) + 1) % bank.length;
  const nextQuestion = bank[nextCursor];
  activateLessonQuestion(lesson, nextQuestion, nextCursor);

  state.phase = "guiding";
  state.completedSteps = 0;
  state.mastery = Math.max(58, Math.min(state.mastery, 70));
  state.strategyIndex = 0;
  state.showVisual = true;
  state.showLessonPicker = false;
  state.lastStudentText = "";
  state.transcript = "";
  state.engineSession = null;
  state.teachingState = "GUIDED_STEP";
  state.currentAtomName = "";
  state.currentStep = `小台阶 1：${getLessonLadderSteps(lesson)[0] || lesson.microSteps[0] || "先读题"}`;
  state.aiContext = reason;
  state.aiMessage = `换一道同类题：${nextQuestion.prompt} 你先说第一步就行。`;
  resetGeneratedVisualForTurn();
  addEvidence("换同类题", `从题库切到：${nextQuestion.prompt}`, "变式练习");
  render();
  speakCurrentMessage();
  return true;
}

function render() {
  app.innerHTML = `
    <div class="app-shell ${state.view === "child" ? "is-child" : "is-parent"}">
      ${renderTopbar()}
      ${state.view === "parent" ? renderParentView() : state.view === "summary" ? renderSummaryView() : renderChildView()}
    </div>
  `;
  bindEvents();
}

function renderTopbar() {
  return `
    <header class="topbar">
      <button class="brand" data-action="child-home" aria-label="返回孩子学习页">
        <span class="brand-mark" aria-hidden="true">${renderMascotFace()}</span>
        <span>
          <strong>乐之老师</strong>
          <small>AI 语音陪练</small>
        </span>
      </button>
      <div class="topbar-actions">
        ${state.view !== "child" ? `<button class="btn btn-soft" data-action="child-home">${icon("mic")}孩子学习</button>` : ""}
        <button class="btn btn-soft" data-action="parent-view">${icon("parent")}家长</button>
      </div>
    </header>
  `;
}

function renderChildView() {
  const lesson = currentLesson();
  const actionButtons =
    state.phase === "teachback" || state.phase === "repair"
      ? [
          ["teach", "我来讲", "star"],
          ["cant-explain", "我讲不出来", "light"],
          ["show-visual", "再给我看图", "image"],
        ]
      : [
          ["dont-understand", "我没懂", "light"],
          ["repeat", "再说一遍", "repeat"],
          ["new-example", "换道题", "repeat"],
          ["change-lesson", "换知识点", "book"],
        ];

  return `
    <main class="child-stage">
      <section class="learning-scene" aria-label="孩子学习区">
        <div class="scene-left">
          ${renderKnowledgeSelector()}
          ${renderStepPanel()}
          ${renderInteractionPanel(actionButtons)}
        </div>

        <aside class="scene-right">
          ${renderVisualArea()}
        </aside>
      </section>
    </main>
  `;
}

function renderKnowledgeSelector() {
  const lesson = currentLesson();
  return `
    <section class="knowledge-select-panel">
      <button class="knowledge-current" data-action="toggle-lesson-picker" aria-expanded="${state.showLessonPicker ? "true" : "false"}">
        <span>${icon("book")}当前知识点</span>
        <strong>${escapeText(lesson.node)}</strong>
        <em>${escapeText(`${lesson.grade} · ${lesson.unit}`)}</em>
        <small>${escapeText(lesson.problem)}</small>
      </button>
      ${state.showLessonPicker ? renderLessonPicker() : ""}
    </section>
  `;
}

function renderLessonPicker() {
  const groups = groupLessonsByGrade();
  return `
    <div class="lesson-picker" role="listbox" aria-label="选择知识点">
      ${groups
        .map(
          (group) => `
            <section class="lesson-picker-group">
              <h3>${escapeText(group.grade)}</h3>
              <div>
                ${group.items
                  .map(
                    ({ lesson, index }) => `
                      <button class="lesson-option ${index === state.lessonIndex ? "is-current" : ""}" data-action="select-lesson" data-lesson-index="${index}">
                        <span>${escapeText(lesson.unit)}</span>
                        <strong>${escapeText(lesson.node)}</strong>
                        <small>${escapeText(lesson.problem)}</small>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </section>
          `,
        )
        .join("")}
    </div>
  `;
}

function groupLessonsByGrade() {
  const groups = [];
  const byGrade = new Map();
  lessons.forEach((lesson, index) => {
    if (!byGrade.has(lesson.grade)) {
      const group = { grade: lesson.grade, items: [] };
      byGrade.set(lesson.grade, group);
      groups.push(group);
    }
    byGrade.get(lesson.grade).items.push({ lesson, index });
  });
  return groups;
}

function renderStepPanel() {
  const lesson = currentLesson();
  const ladderSteps = getLessonLadderSteps(lesson);
  return `
    <section class="step-panel compact-panel">
      <div class="panel-head">
        <span>${icon("star")}小台阶</span>
        <strong>${escapeText(renderTeachingStageLabel())}</strong>
      </div>
      <h2>${escapeText(renderChildStepTitle(state.currentStep))}</h2>
      <p>${escapeText(renderStepHint())}</p>
      ${state.currentAtomName ? `<p class="atom-note">现在只看：${escapeText(state.currentAtomName)}</p>` : ""}
      <div class="step-ladder" aria-label="学习小台阶">
        ${ladderSteps
          .map(
            (step, index) => `
              <div class="ladder-step ${index < state.completedSteps ? "is-done" : ""} ${index === state.completedSteps ? "is-now" : ""}">
                <span>${index < state.completedSteps ? icon("check") : index + 1}</span>
                <em>${escapeText(step)}</em>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function getLessonLadderSteps(lesson) {
  const substeps = Array.isArray(lesson.substeps) ? lesson.substeps.filter(Boolean) : [];
  if (substeps.length > 3) return substeps;
  return Array.isArray(lesson.microSteps) ? lesson.microSteps : [];
}

function syncLadderProgress(payload = {}) {
  const lesson = currentLesson();
  const ladderSteps = getLessonLadderSteps(lesson);
  if (!ladderSteps.length) return;

  const teachingState = payload.teachingState || state.teachingState;
  const stageText = normalizeText(`${payload.currentStep || ""} ${state.currentStep || ""} ${payload.bestStrategy || ""} ${state.bestStrategy || ""}`);
  if (
    ["PRACTICE_SET", "FEYNMAN_EXPLAIN", "FEYNMAN_EVAL", "MASTERED"].includes(teachingState) ||
    state.phase === "summary" ||
    stageText.includes("闯关检验")
  ) {
    state.completedSteps = ladderSteps.length;
    return;
  }

  const activeIndex = findActiveLadderIndex(lesson, payload);
  if (activeIndex >= 0) {
    state.completedSteps = Math.max(0, Math.min(activeIndex, ladderSteps.length - 1));
  }
}

function findActiveLadderIndex(lesson, payload = {}) {
  const ladderSteps = getLessonLadderSteps(lesson);
  const source = normalizeText(
    [
      payload.currentAtomName,
      payload.currentStep,
      state.currentAtomName,
      state.currentStep,
      payload.aiMessage,
    ]
      .filter(Boolean)
      .join(" "),
  );
  if (!source) return -1;

  const mapped = findMappedLadderIndex(lesson, source);
  if (mapped >= 0) return mapped;

  return ladderSteps.findIndex((step) => {
    const normalizedStep = normalizeText(step);
    if (!normalizedStep) return false;
    return source.includes(normalizedStep) || normalizedStep.includes(source);
  });
}

function findMappedLadderIndex(lesson, source) {
  if (lesson.id === "renminbi-conversion") {
    if (source.includes("认识元和角") || source.includes("认识元角分")) return 0;
    if (source.includes("1元等于10角") || source.includes("一元等于十角")) return 1;
    if (source.includes("1角等于10分") || source.includes("一角等于十分")) return 2;
    if (source.includes("换成几十角") || source.includes("把元换成角")) return 3;
    if (source.includes("再加原来的几角") || source.includes("加原来的角")) return 4;
    if (source.includes("说清为什么") || source.includes("先换单位")) return 5;
  }

  if (lesson.id === "g1b-simple-shopping") {
    if (source.includes("看清商品价格") || source.includes("价格")) return 0;
    if (source.includes("看清付了多少钱") || source.includes("付")) return 1;
    if (source.includes("找回")) return 2;
    if (source.includes("减法")) return 3;
    if (source.includes("说清为什么")) return 4;
  }

  return -1;
}

function renderInteractionPanel(actionButtons) {
  return `
    <section class="interaction-panel">
      <div class="tutor-wrap">
        <div class="tutor-card">
          ${renderMascot()}
          <div class="speech-card">
            <div class="dialogue-card">
              <div class="dialogue-line teacher-line">
                <span>老师</span>
                <strong>${escapeText(state.aiMessage)}</strong>
              </div>
              ${
                state.lastStudentText
                  ? `<div class="dialogue-line student-line"><span>学生</span><p>${escapeText(state.lastStudentText)}</p></div>`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions" aria-label="求助按钮">
        ${actionButtons
          .map(
            ([action, label, iconName]) => `
              <button class="help-button" data-action="${action}">
                ${icon(iconName)}
                <span>${label}</span>
              </button>
            `,
          )
          .join("")}
      </div>

      ${renderVoiceDock()}
    </section>
  `;
}

function renderVisualArea() {
  return state.showVisual ? renderLearningVisual() : renderVisualPlaceholder();
}

function renderVisualPlaceholder() {
  return `
    <section class="visual-panel visual-placeholder">
      <div class="panel-head">
        <span>${icon("image")}图片区</span>
        <strong>按当前互动更新</strong>
      </div>
      <p>需要看图时，乐之老师会根据当前知识点和正在讲的小台阶显示图片。</p>
    </section>
  `;
}

function renderVoiceDock() {
  const locked = state.voiceStatus === "processing";
  return `
    <section class="voice-dock" aria-label="语音输入区">
      ${state.showKeyboard ? renderKeyboardComposer() : ""}
      <div class="dock-actions">
        <button class="dock-mini" data-action="camera" ${locked ? "disabled" : ""}>${icon("camera")}拍照</button>
        <button class="voice-button ${state.recording ? "is-recording" : ""} ${locked ? "is-processing" : ""}" data-action="voice" aria-label="${escapeText(renderVoiceButtonAriaLabel())}" ${locked ? "disabled" : ""}>
          ${icon("mic")}
          <span>${renderVoiceButtonLabel()}</span>
        </button>
        <button class="dock-mini" data-action="toggle-keyboard" ${locked ? "disabled" : ""}>${icon("keyboard")}键盘输入</button>
      </div>
      <p class="dock-note">${escapeText(renderDockNote())}</p>
    </section>
  `;
}

function renderVoiceButtonLabel() {
  if (state.recording) return "结束说话";
  if (state.voiceStatus === "processing") return "正在想";
  if (state.phase === "teachback") return "开始讲";
  return "开始说";
}

function renderVoiceButtonAriaLabel() {
  if (state.recording) return "点击结束说话";
  if (state.voiceStatus === "processing") return "老师正在思考";
  if (state.phase === "teachback") return "点击开始讲给老师听";
  return "点击开始说话";
}

function renderStepHint() {
  const lesson = currentLesson();
  if (state.teachingState === "PRACTICE_SET") return "现在不是新讲解，是小闯关。答错也没关系，老师会只补那一个小地方。";
  if (state.teachingState === "REMEDIATION_TEACH" || state.teachingState === "REMEDIATION_RECHECK") return "我们只补刚才没稳的小台阶，不会整章重来。";
  if (state.teachingState === "FALLBACK_PREREQUISITE") return "这是前置小台阶，补完会自动回到刚才的知识点。";
  if (state.teachingState === "FEYNMAN_EXPLAIN" || state.teachingState === "FEYNMAN_EVAL") return "你来当小老师，重点说先做什么、为什么这样做。";
  if (state.phase === "teachback") return "你已经会做这一步了。现在试着用自己的话讲给老师听。";
  if (state.phase === "repair") return "没关系，我们换一种讲法。先看图，再慢慢说。";
  if (state.phase === "summary") return "你能说出为什么，这个知识点就更稳了。";
  return lesson.stepHint;
}

function renderTeachingStageLabel() {
  const labels = {
    DIAGNOSE_ENTRY: "先看一看",
    TEACH_CONCEPT: "讲一讲",
    GUIDED_STEP: "小台阶",
    CHECK_UNDERSTANDING: "试一试",
    SPLIT_ATOM: "再小一步",
    FALLBACK_PREREQUISITE: "补一小步",
    PRACTICE_SET: "闯关检验",
    ERROR_ANALYSIS: "看哪里没稳",
    REMEDIATION_TEACH: "再看一遍",
    REMEDIATION_RECHECK: "再试一次",
    FEYNMAN_EXPLAIN: "当小老师",
    FEYNMAN_EVAL: "听你讲",
    MASTERED: "已掌握",
    EXIT_WITH_NEXT: "下一点",
  };
  return labels[state.teachingState] || currentLesson().unit;
}

function renderChildStepTitle(step) {
  return String(step || "")
    .replace(/^重讲：/, "再看一遍：")
    .replace(/^拆小：/, "再小一步：");
}

function renderDockNote() {
  if (state.voiceStatus === "processing") return "老师听到了，马上接着讲。";
  if (state.phase === "teachback") return "像小老师一样讲给老师听，说不完整也没关系。";
  if (state.phase === "repair") return "可以看着图说，不用一次讲完整。";
  if (state.phase === "summary") return "这一题已经完成，可以换知识点或去家长页看记录。";
  return "点一下开始说话，说完再点一下结束。也可以直接说“换知识点”。";
}

function renderKeyboardComposer() {
  const locked = state.voiceStatus === "processing";
  return `
    <form class="keyboard-composer" data-form="typed-answer">
      <input name="answer" autocomplete="off" placeholder="也可以打字，例如：我想换知识点" ${locked ? "disabled" : ""} />
      <button class="btn btn-primary" type="submit" ${locked ? "disabled" : ""}>发送</button>
    </form>
  `;
}

function renderLearningVisual() {
  const lesson = currentLesson();
  return `
    <div class="visual-panel">
      <div class="panel-head">
        <span>${icon("image")}看图想一想</span>
        <strong>${escapeText(lesson.activeQuestion?.visualMarkup ? "当前题图" : lesson.visualLabel)}</strong>
      </div>
      ${renderLessonSvg(lesson)}
      <p class="visual-turn-note">本轮题目：${escapeText(lesson.activeQuestion?.prompt || lesson.problem)}${state.currentAtomName ? ` · ${escapeText(state.currentAtomName)}` : ""}</p>
      <div class="ai-visual-card">
        <div>
          <strong>${escapeText(lesson.visualCardTitle)}</strong>
          <p>${escapeText(lesson.visualCardHint)}</p>
        </div>
        <button class="btn btn-primary" data-action="generate-story-image" ${state.imageJob.status === "loading" ? "disabled" : ""}>
          ${icon("image")}${state.imageJob.status === "loading" ? "正在画" : "AI 画生活例子"}
        </button>
      </div>
      ${renderGeneratedImage()}
    </div>
  `;
}

function renderLessonSvg(lesson) {
  if (lesson.activeQuestion?.visualMarkup) return renderQuestionVisualMarkup(lesson);
  if (lesson.id === "g1b-simple-shopping") return renderShoppingSvg(lesson);
  if (lesson.visualType === "money") return renderMoneySvg(lesson);
  if (lesson.visualType === "perimeter") return renderPerimeterSvg(lesson);
  if (lesson.visualType === "time") return renderTimeSvg(lesson);
  if (lesson.visualType === "clock") return renderClockSvg(lesson);
  if (lesson.visualType === "ten-frame") return renderTenFrameSvg(lesson);
  if (lesson.visualType === "number-line") return renderNumberLineSvg(lesson);
  if (lesson.visualType === "place-value") return renderPlaceValueSvg(lesson);
  if (lesson.visualType === "shape") return renderShapeSvg(lesson);
  if (lesson.visualType === "ruler") return renderRulerSvg(lesson);
  if (lesson.visualType === "angle") return renderAngleSvg(lesson);
  if (lesson.visualType === "array") return renderArraySvg(lesson);
  if (lesson.visualType === "sharing") return renderSharingSvg(lesson);
  if (lesson.visualType === "data") return renderDataSvg(lesson);
  if (lesson.visualType === "pattern") return renderPatternSvg(lesson);
  if (lesson.visualType === "motion") return renderMotionSvg(lesson);
  if (lesson.visualType === "mass") return renderMassSvg(lesson);
  if (lesson.visualType === "logic") return renderLogicSvg(lesson);
  if (lesson.visualType === "count" || lesson.visualType === "compare" || lesson.visualType === "position") {
    return renderPrimaryThinkingSvg(lesson);
  }
  if (lesson.visualType !== "fraction") return renderGenericStepSvg(lesson);
  return renderFractionSvg(lesson);
}

function renderQuestionVisualMarkup(lesson) {
  return `
    <div class="question-visual-markup" role="img" aria-label="${escapeAttr(lesson.activeQuestion?.prompt || lesson.node)}">
      ${lesson.activeQuestion.visualMarkup}
    </div>
  `;
}

function renderPrimaryThinkingSvg(lesson) {
  const labels = lesson.visualType === "compare" ? ["一一配对", "看谁剩下", "说多和少"] : lesson.microSteps;
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <g transform="translate(48 62)">
        ${[0, 1, 2, 3, 4, 5].map((item) => `<circle cx="${item * 46}" cy="22" r="15" fill="#65d6ad" stroke="#244056" stroke-width="3"/>`).join("")}
        ${[0, 1, 2, 3, 4].map((item) => `<rect x="${item * 46 - 15}" y="78" width="30" height="30" rx="8" fill="#4da3ff" stroke="#244056" stroke-width="3"/>`).join("")}
        <path d="M0 52h214" stroke="#ffb72b" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
      </g>
      <text x="58" y="184" class="svg-win">${escapeText((labels || []).slice(0, 3).join(" -> "))}</text>
    </svg>
  `;
}

function renderGenericStepSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      ${stepBlock(42, 68, "1", lesson.microSteps[0], "#65d6ad")}
      <path d="M168 100h42" stroke="#244056" stroke-width="4" stroke-linecap="round"/>
      <path d="m202 90 14 10-14 10" fill="none" stroke="#244056" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${stepBlock(226, 68, "2", lesson.microSteps[1] || "再看关系", "#4da3ff")}
      <path d="M352 100h42" stroke="#244056" stroke-width="4" stroke-linecap="round"/>
      <path d="m386 90 14 10-14 10" fill="none" stroke="#244056" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${stepBlock(410, 68, "3", lesson.microSteps[2] || "说出原因", "#ffd36a")}
      <text x="42" y="190" class="svg-win">${escapeText(lesson.node)}</text>
    </svg>
  `;
}

function stepBlock(x, y, number, label, color) {
  return `
    <rect x="${x}" y="${y}" width="126" height="72" rx="14" fill="${color}" stroke="#244056" stroke-width="3"/>
    <text x="${x + 18}" y="${y + 30}" class="svg-label">${number}</text>
    <text x="${x + 18}" y="${y + 56}" class="svg-note">${escapeText(shortSvgText(label, 8))}</text>
  `;
}

function renderTenFrameSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <g transform="translate(70 62)">
        ${Array.from({ length: 10 }, (_, index) => {
          const x = (index % 5) * 54;
          const y = Math.floor(index / 5) * 48;
          const filled = index < 7;
          return `<rect x="${x}" y="${y}" width="44" height="38" rx="9" fill="${filled ? "#65d6ad" : "#fff"}" stroke="#244056" stroke-width="3"/>`;
        }).join("")}
      </g>
      <path d="M366 90c34 0 54 18 54 42s-20 42-54 42" fill="none" stroke="#ffb72b" stroke-width="6" stroke-linecap="round"/>
      <text x="318" y="110" class="svg-note">${escapeText(shortSvgText(lesson.microSteps[0], 12))}</text>
      <text x="318" y="152" class="svg-win">${escapeText(shortSvgText(lesson.microSteps[1] || lesson.node, 12))}</text>
    </svg>
  `;
}

function renderNumberLineSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <line x1="54" y1="116" x2="462" y2="116" stroke="#244056" stroke-width="4" stroke-linecap="round"/>
      ${Array.from({ length: 11 }, (_, index) => {
        const x = 64 + index * 38;
        return `<line x1="${x}" y1="104" x2="${x}" y2="128" stroke="#244056" stroke-width="3"/><text x="${x - 6}" y="154" class="svg-label">${index}</text>`;
      }).join("")}
      <path d="M180 86c38-36 86-36 126 0" fill="none" stroke="#ffb72b" stroke-width="6" stroke-linecap="round"/>
      <path d="m292 78 18 10-20 8" fill="none" stroke="#ffb72b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="90" y="190" class="svg-win">${escapeText(shortSvgText(lesson.microSteps.join("，"), 26))}</text>
    </svg>
  `;
}

function renderPlaceValueSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      ${placeValueColumn(78, "千位", "#d9ecff")}
      ${placeValueColumn(174, "百位", "#eaf8f1")}
      ${placeValueColumn(270, "十位", "#fff4d8")}
      ${placeValueColumn(366, "个位", "#ffe8e3")}
      <text x="72" y="184" class="svg-win">${escapeText(shortSvgText(lesson.microSteps.join("，"), 28))}</text>
    </svg>
  `;
}

function placeValueColumn(x, label, color) {
  return `
    <rect x="${x}" y="64" width="78" height="90" rx="12" fill="${color}" stroke="#244056" stroke-width="3"/>
    <text x="${x + 16}" y="102" class="svg-label">${label}</text>
    <circle cx="${x + 39}" cy="130" r="10" fill="#65d6ad" stroke="#244056" stroke-width="2"/>
  `;
}

function renderShapeSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <rect x="64" y="72" width="90" height="64" rx="6" fill="#65d6ad" stroke="#244056" stroke-width="4"/>
      <rect x="190" y="72" width="66" height="66" rx="6" fill="#4da3ff" stroke="#244056" stroke-width="4"/>
      <circle cx="330" cy="106" r="36" fill="#ffd36a" stroke="#244056" stroke-width="4"/>
      <path d="M426 68 474 144H378Z" fill="#ff8f78" stroke="#244056" stroke-width="4"/>
      <text x="78" y="184" class="svg-win">${escapeText(shortSvgText(lesson.node, 26))}</text>
    </svg>
  `;
}

function renderRulerSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <rect x="58" y="82" width="398" height="54" rx="8" fill="#fff4d8" stroke="#244056" stroke-width="4"/>
      ${Array.from({ length: 11 }, (_, index) => {
        const x = 78 + index * 36;
        return `<line x1="${x}" y1="82" x2="${x}" y2="${index % 5 === 0 ? 126 : 112}" stroke="#244056" stroke-width="3"/><text x="${x - 5}" y="154" class="svg-label">${index}</text>`;
      }).join("")}
      <text x="94" y="190" class="svg-win">${escapeText(shortSvgText(lesson.microSteps[0], 24))}</text>
    </svg>
  `;
}

function renderAngleSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <path d="M150 150H320M150 150 260 64" fill="none" stroke="#244056" stroke-width="7" stroke-linecap="round"/>
      <path d="M190 150c0-34 16-58 44-78" fill="none" stroke="#ffb72b" stroke-width="6" stroke-linecap="round"/>
      <circle cx="150" cy="150" r="8" fill="#ff7d6e"/>
      <text x="330" y="96" class="svg-note">先找顶点和两条边</text>
      <text x="126" y="190" class="svg-win">${escapeText(shortSvgText(lesson.node, 22))}</text>
    </svg>
  `;
}

function renderArraySvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <g transform="translate(86 62)">
        ${Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 6 }, (_, col) => `<circle cx="${col * 38}" cy="${row * 32}" r="11" fill="#65d6ad" stroke="#244056" stroke-width="2"/>`).join(""),
        ).join("")}
      </g>
      <text x="330" y="98" class="svg-note">几组同样多</text>
      <text x="128" y="190" class="svg-win">${escapeText(shortSvgText(lesson.microSteps.join("，"), 24))}</text>
    </svg>
  `;
}

function renderSharingSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      ${sharePlate(84, "#d9ecff")}
      ${sharePlate(218, "#eaf8f1")}
      ${sharePlate(352, "#fff4d8")}
      <text x="118" y="186" class="svg-win">${escapeText(shortSvgText(lesson.microSteps.join("，"), 24))}</text>
    </svg>
  `;
}

function sharePlate(x, color) {
  return `
    <ellipse cx="${x}" cy="116" rx="48" ry="30" fill="${color}" stroke="#244056" stroke-width="3"/>
    <circle cx="${x - 18}" cy="110" r="8" fill="#ff8f78"/>
    <circle cx="${x + 2}" cy="122" r="8" fill="#65d6ad"/>
    <circle cx="${x + 22}" cy="110" r="8" fill="#ffd36a"/>
  `;
}

function renderDataSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <line x1="88" y1="162" x2="420" y2="162" stroke="#244056" stroke-width="4"/>
      ${bar(116, 112, 50, "#65d6ad")}
      ${bar(204, 82, 80, "#4da3ff")}
      ${bar(292, 132, 30, "#ffd36a")}
      <text x="94" y="192" class="svg-win">${escapeText(shortSvgText(lesson.microSteps.join("，"), 24))}</text>
    </svg>
  `;
}

function bar(x, y, height, color) {
  return `<rect x="${x}" y="${y}" width="46" height="${height}" rx="8" fill="${color}" stroke="#244056" stroke-width="3"/>`;
}

function renderPatternSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      ${Array.from({ length: 7 }, (_, index) => {
        const color = index % 2 === 0 ? "#ff8f78" : "#4da3ff";
        return `<circle cx="${82 + index * 56}" cy="108" r="23" fill="${color}" stroke="#244056" stroke-width="3"/>`;
      }).join("")}
      <text x="82" y="176" class="svg-win">找重复的一组，再接着排</text>
    </svg>
  `;
}

function renderMotionSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <rect x="74" y="82" width="78" height="54" rx="10" fill="#65d6ad" stroke="#244056" stroke-width="3"/>
      <path d="M178 110h116" stroke="#244056" stroke-width="5" stroke-linecap="round"/>
      <path d="m282 96 22 14-22 14" fill="none" stroke="#244056" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="328" y="82" width="78" height="54" rx="10" fill="#65d6ad" stroke="#244056" stroke-width="3"/>
      <path d="M438 80a38 38 0 1 1-10 42" fill="none" stroke="#ffb72b" stroke-width="6" stroke-linecap="round"/>
      <text x="82" y="184" class="svg-win">${escapeText(shortSvgText(lesson.node, 22))}</text>
    </svg>
  `;
}

function renderMassSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <line x1="260" y1="66" x2="260" y2="158" stroke="#244056" stroke-width="5"/>
      <line x1="160" y1="90" x2="360" y2="90" stroke="#244056" stroke-width="5"/>
      <path d="M126 90 92 150h68Z" fill="#d9ecff" stroke="#244056" stroke-width="3"/>
      <path d="M394 90 360 150h68Z" fill="#fff4d8" stroke="#244056" stroke-width="3"/>
      <text x="196" y="188" class="svg-win">轻的用克，重的用千克</text>
    </svg>
  `;
}

function renderLogicSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      ${logicCard(72, "条件")}
      ${logicCard(216, "排除")}
      ${logicCard(360, "剩下")}
      <text x="94" y="184" class="svg-win">${escapeText(shortSvgText(lesson.microSteps.join("，"), 24))}</text>
    </svg>
  `;
}

function logicCard(x, text) {
  return `<rect x="${x}" y="72" width="94" height="78" rx="14" fill="#eaf8f1" stroke="#244056" stroke-width="3"/><text x="${x + 18}" y="118" class="svg-label">${text}</text>`;
}

function renderClockSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <circle cx="178" cy="112" r="62" fill="#fff" stroke="#244056" stroke-width="5"/>
      <text x="170" y="68" class="svg-label">12</text>
      <text x="226" y="118" class="svg-label">3</text>
      <text x="174" y="168" class="svg-label">6</text>
      <text x="120" y="118" class="svg-label">9</text>
      <line x1="178" y1="112" x2="178" y2="70" stroke="#244056" stroke-width="5" stroke-linecap="round"/>
      <line x1="178" y1="112" x2="214" y2="112" stroke="#ff8f78" stroke-width="5" stroke-linecap="round"/>
      <text x="286" y="98" class="svg-note">先看时针</text>
      <text x="286" y="140" class="svg-win">再看分针</text>
    </svg>
  `;
}

function renderFractionSvg(lesson) {
  return `
    <svg class="lesson-svg fraction-svg" viewBox="0 0 520 214" role="img" aria-label="把三分之二和四分之三都变成十二小格比较">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      ${fractionBar(36, 54, 3, 2, "#5cc7a4", "2/3 = 8/12")}
      ${fractionBar(36, 132, 4, 3, "#4da3ff", "3/4 = 9/12")}
      <text x="370" y="92" class="svg-note">8 小格</text>
      <text x="370" y="170" class="svg-note">9 小格，更多</text>
      <path d="M432 140c28 0 42 9 42 24s-14 24-42 24" fill="none" stroke="#ffb72b" stroke-width="5" stroke-linecap="round"/>
      <text x="396" y="204" class="svg-win">所以 3/4 更大</text>
    </svg>
  `;
}

function renderPerimeterSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="长方形四条边组成周长">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <rect x="118" y="58" width="260" height="105" rx="8" fill="#eaf8f1" stroke="#244056" stroke-width="4"/>
      <path d="M130 54h238M382 70v82M368 168H130M112 152V70" fill="none" stroke="#ffb72b" stroke-width="7" stroke-linecap="round"/>
      <text x="220" y="52" class="svg-label">5 米</text>
      <text x="222" y="190" class="svg-label">5 米</text>
      <text x="64" y="116" class="svg-label">3 米</text>
      <text x="402" y="116" class="svg-label">3 米</text>
      <text x="118" y="204" class="svg-win">5 + 3 + 5 + 3 = 16 米</text>
    </svg>
  `;
}

function renderTimeSvg(lesson) {
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="从三点二十往后走二十五分钟到三点四十五">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <line x1="70" y1="116" x2="450" y2="116" stroke="#244056" stroke-width="4" stroke-linecap="round"/>
      <circle cx="120" cy="116" r="12" fill="#65d6ad" stroke="#244056" stroke-width="3"/>
      <circle cx="360" cy="116" r="12" fill="#4da3ff" stroke="#244056" stroke-width="3"/>
      <path d="M146 96c58-42 138-42 190 0" fill="none" stroke="#ffb72b" stroke-width="6" stroke-linecap="round"/>
      <path d="m340 88 18 10-20 8" fill="none" stroke="#ffb72b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="86" y="84" class="svg-label">3:20</text>
      <text x="324" y="84" class="svg-label">3:45</text>
      <text x="210" y="80" class="svg-note">+25 分钟</text>
      <text x="130" y="168" class="svg-win">20 + 25 = 45，没有跨过 4 点</text>
    </svg>
  `;
}

function renderMoneySvg(lesson) {
  const money = getMoneyVisualNumbers(lesson);
  if (money.decomposeJiao) return renderJiaoDecomposeSvg(lesson, money);
  const atom = normalizeText(state.currentAtomName || "");
  const step = normalizeText(state.currentStep || "");
  const isRate = atom.includes("1元等于10角") || step.includes("1元等于10角");
  const isConvert = atom.includes("换成几十角") || step.includes("换成几十角") || step.includes("先换整元");
  const isAdd = !money.isPureYuanQuestion && (atom.includes("再加") || step.includes("再加") || step.includes("闯关"));
  const title = isRate
    ? "先看：1 元能换成几个 1 角？"
    : isConvert || money.isPureYuanQuestion
      ? `先只换整元：${money.yuan} 元是几角？`
      : isAdd
        ? `再加原来的 ${money.jiao} 角`
        : lesson.visualTitle;
  const noteCount = isRate ? 1 : Math.max(1, Math.min(4, money.yuan));
  const coinCount = isRate ? 10 : isConvert || money.isPureYuanQuestion ? 0 : Math.max(0, Math.min(5, money.jiao));
  const leftText = isRate ? "1张1元" : `${money.yuan}张1元`;
  const middleText = isRate ? "可以换成" : isConvert || money.isPureYuanQuestion ? "先换成" : `${money.yuanJiao}角`;
  const rightText = isRate ? "几个1角？" : isConvert || money.isPureYuanQuestion ? "几角？" : "+";
  const promptText = isRate
    ? "1元 = ? 角"
    : money.isPureYuanQuestion || isConvert
      ? `${money.yuan}元 = ? 角`
      : `${money.yuanJiao}角 + ${money.jiao}角 = ?`;
  const coinGroup = coinCount
    ? `<g transform="translate(${isRate ? 244 : 312} ${isRate ? 62 : 104})">${renderMoneyCoins(coinCount)}</g>
      <text x="${isRate ? 282 : 326}" y="${isRate ? 158 : 156}" class="svg-note">${escapeText(isRate ? "10个1角" : `原来的${money.jiao}角`)}</text>`
    : "";
  return `
    <svg class="lesson-svg money-svg" viewBox="0 0 520 214" role="img" aria-label="把元和角换成同一种单位">
      <text x="26" y="30" class="svg-title">${escapeText(title)}</text>
      <g transform="translate(44 48)">
        ${Array.from({ length: noteCount }, (_, index) => moneyNote(index * 98, 0, "1元", "#65d6ad")).join("")}
      </g>
      ${coinGroup}
      <g transform="translate(48 114)">
        <text x="0" y="20" class="svg-note">${escapeText(leftText)}</text>
        <path d="M96 13h66" fill="none" stroke="#244056" stroke-width="4" stroke-linecap="round"/>
        <text x="174" y="20" class="svg-note">${escapeText(middleText)}</text>
        <text x="306" y="20" class="svg-note">${escapeText(rightText)}</text>
      </g>
      <rect x="118" y="166" width="284" height="34" rx="12" fill="#fff4d8"/>
      <text x="164" y="190" class="svg-win">${escapeText(promptText)}</text>
    </svg>
  `;
}

function renderJiaoDecomposeSvg(lesson, money) {
  const fullYuan = Math.floor(money.decomposeJiao / 10);
  const restJiao = money.decomposeJiao % 10;
  const groups = Array.from({ length: Math.max(1, fullYuan) }, (_, index) => {
    const x = 54 + index * 146;
    return `
      <g transform="translate(${x} 70)">
        <rect x="0" y="0" width="112" height="46" rx="12" fill="#65d6ad" stroke="#244056" stroke-width="3"/>
        <text x="24" y="30" class="svg-label">10角</text>
        <text x="20" y="82" class="svg-note">换成1元</text>
      </g>
    `;
  }).join("");
  const rest = restJiao
    ? `
      <g transform="translate(${62 + Math.max(1, fullYuan) * 146} 70)">
        <rect x="0" y="0" width="96" height="46" rx="12" fill="#ffd36a" stroke="#244056" stroke-width="3"/>
        <text x="22" y="30" class="svg-label">${restJiao}角</text>
        <text x="12" y="82" class="svg-note">剩下${restJiao}角</text>
      </g>
    `
    : "";
  return `
    <svg class="lesson-svg money-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">把 ${money.decomposeJiao} 角拆成几元几角</text>
      <text x="44" y="58" class="svg-note">先每10角圈成1元，再看还剩几角</text>
      ${groups}
      ${rest}
      <rect x="118" y="166" width="284" height="34" rx="12" fill="#fff4d8"/>
      <text x="150" y="190" class="svg-win">${money.decomposeJiao}角 = ?元?角</text>
    </svg>
  `;
}

function getMoneyVisualNumbers(lesson) {
  const source = normalizeText(`${state.aiMessage || ""} ${state.currentStep || ""} ${lesson.problem || ""}`);
  const decomposeMatch = source.match(/(\d+)角(?:里面|里|可以|能)?.{0,8}几元几角/);
  const yuanJiaoMatch = source.match(/(\d+)元(\d+)角/);
  const pureYuanQuestion = /(\d+)元是几角/.test(source);
  const yuanOnlyMatch = source.match(/(\d+)元/);
  const decomposeJiao = decomposeMatch ? Number(decomposeMatch[1]) : 0;
  const yuan = yuanJiaoMatch ? Number(yuanJiaoMatch[1]) : pureYuanQuestion && yuanOnlyMatch ? Number(yuanOnlyMatch[1]) : yuanOnlyMatch ? Number(yuanOnlyMatch[1]) : 3;
  const jiao = yuanJiaoMatch ? Number(yuanJiaoMatch[2]) : 0;
  return {
    yuan: Number.isFinite(yuan) && yuan > 0 ? yuan : 3,
    jiao: Number.isFinite(jiao) && jiao > 0 ? jiao : 0,
    yuanJiao: (Number.isFinite(yuan) && yuan > 0 ? yuan : 3) * 10,
    totalJiao: (Number.isFinite(yuan) && yuan > 0 ? yuan : 3) * 10 + (Number.isFinite(jiao) && jiao > 0 ? jiao : 0),
    isPureYuanQuestion: pureYuanQuestion,
    decomposeJiao: Number.isFinite(decomposeJiao) && decomposeJiao > 0 ? decomposeJiao : 0,
  };
}

function renderShoppingSvg(lesson) {
  const { price, paid, change, item } = getShoppingVisualNumbers(lesson);
  const atom = normalizeText(state.currentAtomName || "");
  const step = normalizeText(state.currentStep || "");
  const isPrice = atom.includes("价格") || step.includes("价格");
  const isPaid = atom.includes("付了多少钱") || step.includes("付了多少钱");
  const isChange = atom.includes("找回") || atom.includes("减法") || step.includes("找回") || step.includes("减法") || step.includes("闯关");
  const title = isPrice
    ? `先看价格：${item}${price}元`
    : isPaid
      ? `再看付出：付了${paid}元`
      : isChange
        ? `用付的钱减价格：${paid} - ${price}`
        : lesson.visualTitle;
  const noteColor = isPrice ? "#65d6ad" : "#d7f0ff";
  const paidColor = isPaid ? "#65d6ad" : "#d7f0ff";
  const changeColor = isChange ? "#ffcf6d" : "#f4f8fb";

  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="购物找回多少钱">
      <text x="26" y="30" class="svg-title">${escapeText(title)}</text>
      <g transform="translate(42 58)">
        <rect x="0" y="0" width="132" height="72" rx="12" fill="#f7fbff" stroke="#244056" stroke-width="3"/>
        <path d="M20 22h62M20 42h48" stroke="#8eb3c7" stroke-width="5" stroke-linecap="round"/>
        <rect x="76" y="16" width="70" height="40" rx="10" fill="${noteColor}" stroke="#244056" stroke-width="3"/>
        <text x="91" y="43" class="svg-label">${price}元</text>
        <text x="22" y="98" class="svg-note">商品价格</text>
      </g>
      <g transform="translate(218 60)">
        <rect x="0" y="0" width="102" height="54" rx="12" fill="${paidColor}" stroke="#244056" stroke-width="3"/>
        <text x="26" y="36" class="svg-label">${paid}元</text>
        <text x="9" y="94" class="svg-note">付出去的钱</text>
      </g>
      <path d="M340 88c34 18 52 42 56 72" fill="none" stroke="#ffb72b" stroke-width="6" stroke-linecap="round"/>
      <path d="m383 154 16 17 12-21" fill="none" stroke="#ffb72b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(390 126)">
        <rect x="0" y="0" width="88" height="48" rx="12" fill="${changeColor}" stroke="#244056" stroke-width="3"/>
        <text x="24" y="32" class="svg-label">${change}元</text>
        <text x="9" y="74" class="svg-note">找回</text>
      </g>
      <text x="126" y="190" class="svg-win">${paid}元 - ${price}元 = ${change}元</text>
    </svg>
  `;
}

function getShoppingVisualNumbers(lesson) {
  const source = normalizeText(`${state.aiMessage || ""} ${state.currentStep || ""} ${lesson.problem || ""}`);
  const itemMatch = source.match(/(?:买|一本|一个)?(本子|橡皮|铅笔|尺子|贴纸|商品)/);
  const priceMatch = source.match(/(?:本子|橡皮|铅笔|尺子|贴纸|商品|价格|要)(\d+)元/);
  const paidMatch = source.match(/(?:付|付了|给|给了)(\d+)元/);
  const yuanNumbers = Array.from(source.matchAll(/(\d+)元/g)).map((match) => Number(match[1])).filter(Number.isFinite);
  const paid = paidMatch ? Number(paidMatch[1]) : yuanNumbers.length > 1 ? yuanNumbers[1] : 5;
  let price = priceMatch ? Number(priceMatch[1]) : yuanNumbers[0] || 4;
  if (price === paid && yuanNumbers.length > 1) {
    price = yuanNumbers.find((value) => value !== paid) || price;
  }
  return {
    item: itemMatch?.[1] || "商品",
    price,
    paid,
    change: Math.max(0, paid - price),
  };
}

function moneyNote(x, y, label, color) {
  return `
    <rect x="${x}" y="${y}" width="88" height="48" rx="10" fill="${color}" stroke="#244056" stroke-width="3"/>
    <text x="${x + 22}" y="${y + 31}" class="svg-label">${label}</text>
  `;
}

function renderMoneyCoins(count) {
  if (!count) return "";
  return Array.from({ length: count }, (_, index) => {
    const x = (index % 5) * 34;
    const y = Math.floor(index / 5) * 34;
    return moneyCoin(x, y);
  }).join("");
}

function moneyCoin(x, y = 0) {
  return `
    <circle cx="${x}" cy="${y + 16}" r="15" fill="#ffd36a" stroke="#244056" stroke-width="2"/>
    <text x="${x - 11}" y="${y + 22}" class="svg-label">1角</text>
  `;
}

function renderPracticePanel() {
  return `
    <div class="practice-panel">
      <div>
        <span>今天第 ${state.todayQuestion} 题</span>
        <strong>${state.phase === "summary" ? "已讲清楚 1 个知识点" : `掌握度 ${state.mastery}%`}</strong>
      </div>
      <div class="mastery-ring" style="--value: ${state.mastery}%">
        <b>${state.mastery}%</b>
        <small>掌握</small>
      </div>
    </div>
  `;
}

function renderGeneratedImage() {
  const lesson = currentLesson();
  if (state.imageJob.lessonId && state.imageJob.lessonId !== lesson.id) return "";
  if (state.imageJob.interactionKey && state.imageJob.interactionKey !== getVisualInteractionKey()) return "";
  if (state.imageJob.status === "idle") return "";
  if (state.imageJob.status === "loading") {
    return `
      <div class="generated-visual is-loading">
        <span class="loading-dot" aria-hidden="true"></span>
        <p>AI 正在画生活例子。上面的图会保留精确关系，生活图只帮助孩子想象。</p>
      </div>
    `;
  }
  if (state.imageJob.status === "error") {
    return `
      <div class="generated-visual is-error">
        <strong>AI 图片暂时没画出来</strong>
        <p>${escapeText(state.imageJob.message || "请检查 Ark 图片服务配置。")}</p>
      </div>
    `;
  }
  return `
    <div class="generated-visual">
      <img src="${escapeAttr(state.imageJob.url)}" alt="AI 生成的理解图" loading="lazy" />
      <p>${escapeText(lesson.generatedCaption)}</p>
    </div>
  `;
}

function getVisualInteractionKey() {
  const lesson = currentLesson();
  return [lesson.id, lesson.activeQuestion?.id, lesson.problem, state.phase, state.currentStep, state.currentAtomName, state.aiMessage, state.lastStudentText].join("|");
}

function resetGeneratedVisualForTurn() {
  const lesson = currentLesson();
  const interactionKey = getVisualInteractionKey();
  if (state.imageJob.lessonId === lesson.id && state.imageJob.interactionKey === interactionKey && state.imageJob.status === "idle") return;
  state.imageJob = { status: "idle", url: "", message: "", lessonId: lesson.id, interactionKey };
}

function fractionBar(x, y, denominator, numerator, color, label) {
  const width = 300;
  const height = 34;
  const piece = width / denominator;
  let parts = "";
  for (let i = 0; i < denominator; i += 1) {
    const filled = i < numerator;
    parts += `<rect x="${x + i * piece}" y="${y}" width="${piece}" height="${height}" fill="${filled ? color : "#fff"}" stroke="#244056" stroke-width="2"/>`;
  }
  return `
    <text x="${x}" y="${y - 10}" class="svg-label">${label}</text>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="7" fill="none" stroke="#244056" stroke-width="2"/>
    ${parts}
  `;
}

function renderParentView() {
  const lesson = currentLesson();
  return `
    <main class="parent-page">
      <section class="parent-hero">
        <div>
          <h1>给家长看的进展</h1>
          <p>孩子端只保留师生对话；这里记录知识点拆分、换讲法、看图辅助和“讲给老师听”的结果。</p>
        </div>
        <button class="btn btn-primary" data-action="summary-view">${icon("book")}查看本题总结</button>
      </section>

      <section class="parent-grid">
        <article class="parent-card wide">
          <div class="panel-head">
            <span>${icon("book")}人教版知识点拆分</span>
            <strong>${escapeText(lesson.edition)}</strong>
          </div>
          <div class="knowledge-path">
            <span>${escapeText(lesson.subject)}</span>
            <span>${escapeText(lesson.grade)}</span>
            <span>${escapeText(lesson.unit)}</span>
            <span>${escapeText(lesson.lesson)}</span>
          </div>
          <h2>${escapeText(lesson.node)}</h2>
          <div class="knowledge-columns">
            <div>
              <h3>前置知识</h3>
              <ul>${lesson.prerequisites.map((item) => `<li>${escapeText(item)}</li>`).join("")}</ul>
            </div>
            <div>
              <h3>常见卡点</h3>
              <ul>${lesson.commonGaps.map((item) => `<li>${escapeText(item)}</li>`).join("")}</ul>
            </div>
            <div>
              <h3>掌握标志</h3>
              <ul>${(lesson.masterySignals || []).map((item) => `<li>${escapeText(item)}</li>`).join("")}</ul>
            </div>
            <div>
              <h3>五层目标</h3>
              <ul>${(lesson.knowledgeLayers || []).map((item) => `<li>${escapeText(item)}</li>`).join("")}</ul>
            </div>
          </div>
        </article>

        <article class="parent-card">
          <div class="metric-large">
            <span>掌握度</span>
            <strong>${state.mastery}%</strong>
            <p>${state.canExplainWhy ? "能用自己的话讲出关键原因。" : "会做，但还需要继续练习讲清楚原因。"}</p>
          </div>
        </article>

        <article class="parent-card">
          <div class="metric-large">
            <span>讲给老师听</span>
            <strong>${escapeText(state.feynmanStatus)}</strong>
            <p>记录孩子是否真的理解，而不是只会报答案。</p>
          </div>
        </article>

        <article class="parent-card wide">
          <div class="panel-head">
            <span>${icon("repeat")}卡住链路</span>
            <strong>${escapeText(renderTeachingStageLabel())}</strong>
          </div>
          ${renderParentSignals()}
        </article>

        <article class="parent-card">
          <div class="panel-head">
            <span>${icon("repeat")}换过的讲法</span>
          </div>
          <div class="strategy-list">
            ${lesson.strategies
              .slice(0, Math.max(1, state.strategyIndex + 1))
              .map(
                (strategy) => `
                  <div class="strategy-row ${strategy.label === state.bestStrategy ? "is-best" : ""}">
                    <strong>${escapeText(strategy.label)}</strong>
                    <span>${strategy.label === state.bestStrategy ? "目前最有效" : "已尝试"}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>

        <article class="parent-card">
          <div class="panel-head">
            <span>${icon("image")}理解图片</span>
          </div>
          <p class="plain-text">分数条、时间线、几何图会优先用程序精准绘制，避免 AI 图片把关系画错。生活情景图再交给 Ark 图片生成。</p>
        </article>

        <article class="parent-card wide">
          <div class="panel-head">
            <span>${icon("check")}学习证据</span>
          </div>
          <div class="evidence-list">
            ${state.evidence
              .map(
                (item) => `
                  <div class="evidence-row">
                    <strong>${escapeText(item.signal)}</strong>
                    <p>${escapeText(item.text)}</p>
                    <span>${escapeText(item.strategy)}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
      </section>
    </main>
  `;
}

function renderParentSignals() {
  const signals = state.parentSignals;
  if (!signals?.stuck_chain?.length) {
    return `<p class="plain-text">目前还没有明显卡住链路。系统会记录孩子是卡在当前小台阶、前置知识，还是会做但讲不清。</p>`;
  }
  return `
    <div class="evidence-list compact">
      ${signals.stuck_chain
        .map(
          (item) => `
            <div class="evidence-row">
              <strong>${escapeText(item.error_tag || item.state || "卡住记录")}</strong>
              <p>${escapeText(item.fallback_atom_id ? `回溯到 ${item.fallback_atom_id}` : `卡在 ${item.atom_id || "当前小台阶"}`)}</p>
              <span>${escapeText(item.state || "记录")}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderSummaryView() {
  const lesson = currentLesson();
  return `
    <main class="summary-page">
      <section class="summary-sheet">
        <button class="btn btn-soft" data-action="parent-view">${icon("arrow")}返回家长页</button>
        <h1>本题学习总结</h1>
        <div class="summary-block">
          <h2>孩子学到什么</h2>
          <p>${escapeText(lesson.summary)}</p>
        </div>
        <div class="summary-block">
          <h2>是否能讲出来</h2>
          <p>${state.canExplainWhy ? escapeText(lesson.explainSummary) : "孩子目前还需要看图和提示才能讲清楚原因。"}</p>
        </div>
        <div class="summary-block">
          <h2>下次建议</h2>
          <p>${escapeText(lesson.nextSuggestion)}</p>
        </div>
      </section>
    </main>
  `;
}

function renderMascot() {
  return `
    <div class="mascot ice-princess" aria-hidden="true">
      <div class="ice-cape"></div>
      <div class="ice-hair"></div>
      <div class="ice-head">
        <span class="ice-eye"></span>
        <span class="ice-eye"></span>
        <span class="ice-smile"></span>
        <span class="ice-cheek ice-cheek-left"></span>
        <span class="ice-cheek ice-cheek-right"></span>
      </div>
      <div class="ice-braid">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="ice-dress">
        <span class="ice-snow">✦</span>
        <span class="ice-snow">✧</span>
      </div>
    </div>
  `;
}

function renderMascotFace() {
  return `
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path d="M22 5 25 15l10-3-6 9 8 7-11 1-4 10-4-10-11-1 8-7-6-9 10 3 3-10Z" fill="currentColor"/>
      <circle cx="18" cy="23" r="2" fill="#fff"/>
      <circle cx="26" cy="23" r="2" fill="#fff"/>
      <path d="M18 30c2.6 1.8 5.4 1.8 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((node) => {
    if (node.dataset.action === "voice") return;
    node.addEventListener("click", handleAction);
  });
  document.querySelectorAll("[data-action='voice']").forEach((node) => {
    node.addEventListener("click", toggleVoiceInput);
  });
  document.querySelectorAll("[data-form='typed-answer']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = new FormData(form).get("answer");
      form.reset();
      handleChildInput(String(value || "").trim(), "typed");
    });
  });
}

async function toggleVoiceInput(event) {
  event.preventDefault();
  if (state.voiceStatus === "processing") return;
  await handleVoiceButton();
}

async function handleAction(event) {
  const action = event.currentTarget.dataset.action;

  if (action === "child-home") {
    state.view = "child";
    state.showLessonPicker = false;
    render();
    return;
  }

  if (action === "parent-view") {
    state.view = "parent";
    state.showLessonPicker = false;
    render();
    return;
  }

  if (action === "summary-view") {
    state.view = "summary";
    state.showLessonPicker = false;
    render();
    return;
  }

  if (action === "toggle-lesson-picker") {
    state.showLessonPicker = !state.showLessonPicker;
    render();
    return;
  }

  if (action === "select-lesson") {
    const index = Number(event.currentTarget.dataset.lessonIndex);
    state.showLessonPicker = false;
    if (Number.isInteger(index) && index !== state.lessonIndex) {
      changeLesson("孩子从知识点列表选择了新内容。", index);
    } else {
      render();
    }
    return;
  }

  if (action === "toggle-keyboard") {
    state.showKeyboard = !state.showKeyboard;
    render();
    return;
  }

  if (action === "camera") {
    toastMessage("拍照入口已预留。接入真实拍照后，AI 会先识别题目再拆知识点。");
    return;
  }

  if (action === "dont-understand" || action === "cant-explain") {
    switchExplanation("孩子说没懂，AI 换了一种讲法。");
    return;
  }

  if (action === "repeat") {
    speakCurrentMessage();
    toastMessage("老师再说一遍");
    return;
  }

  if (action === "change-lesson") {
    state.showLessonPicker = true;
    render();
    return;
  }

  if (action === "new-example") {
    advanceLessonQuestion("孩子想换一道同类题。");
    return;
  }

  if (action === "show-visual") {
    state.showVisual = true;
    state.strategyIndex = Math.max(state.strategyIndex, 1);
    const strategy = lessonStrategy(1);
    state.aiContext = "我们看图再说一遍。";
    state.aiMessage = strategy.guidance;
    state.bestStrategy = strategy.label;
    addEvidence("看图辅助", "孩子请求再看图，AI 切换到图示讲法。", "画图");
    render();
    speakCurrentMessage();
    return;
  }

  if (action === "generate-story-image") {
    await generateStoryImage();
    return;
  }

  if (action === "teach") {
    startTeachback();
  }
}

function changeLesson(reason, targetIndex = null) {
  const nextIndex =
    Number.isInteger(targetIndex) && targetIndex >= 0 && targetIndex < lessons.length
      ? targetIndex
      : (state.lessonIndex + 1) % lessons.length;
  const lesson = lessons[nextIndex];
  state.lessonIndex = nextIndex;
  state.phase = "guiding";
  state.recording = false;
  state.voiceStatus = "idle";
  state.showLessonPicker = false;
  state.showKeyboard = false;
  state.strategyIndex = 0;
  state.mastery = 60;
  state.completedSteps = 0;
  state.transcript = "";
  state.lastStudentText = "";
  state.aiContext = reason || lesson.initialContext;
  state.aiMessage = `好，我们换一个知识点。${lesson.initialMessage}`;
  state.currentStep = lesson.initialStep;
  state.teachingState = "GUIDED_STEP";
  state.currentAtomName = "";
  state.engineSession = null;
  state.passedQuestionIds = [];
  state.parentSignals = null;
  state.feynmanStatus = "还没开始讲";
  state.canExplainWhy = false;
  state.canUseOwnWords = false;
  state.bestStrategy = lesson.strategies[0].label;
  state.showVisual = true;
  state.imageJob = { status: "idle", url: "", message: "", lessonId: lesson.id, interactionKey: getVisualInteractionKey() };
  addEvidence("换知识点", `切换到「${lesson.node}」：${lesson.problem}`, "课程切换");
  render();
  speakCurrentMessage();
}

function startTeachback() {
  const lesson = currentLesson();
  state.phase = "teachback";
  state.aiContext = "轮到你当小老师了。";
  state.aiMessage = lesson.teachbackPrompt;
  state.currentStep = "小台阶 3：用自己的话讲";
  state.feynmanStatus = "等待孩子讲";
  resetGeneratedVisualForTurn();
  render();
  speakCurrentMessage();
}

async function generateStoryImage() {
  const lesson = currentLesson();
  const activeQuestion = lesson.activeQuestion || null;
  const interactionKey = getVisualInteractionKey();
  state.imageJob = { status: "loading", url: "", message: "", lessonId: lesson.id, interactionKey };
  render();

  const prompt = [
    ...lesson.imagePrompt,
    `当前知识点：${lesson.node}`,
    `当前题目：${activeQuestion?.prompt || lesson.problem}`,
    activeQuestion?.answer ? `这道题的正确答案：${activeQuestion.answer}` : "",
    activeQuestion?.explanation ? `这道题的正确思路：${activeQuestion.explanation}` : "",
    `当前小台阶：${state.currentStep}`,
    `老师正在讲：${state.aiMessage}`,
    state.lastStudentText ? `孩子刚才说：${state.lastStudentText}` : "",
    "图片必须只表现当前知识点、当前题目和当前小台阶，不要画其他数学内容。",
    "注意：这只是生活类比图，精确数学关系会由页面上的程序图呈现。",
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch("/api/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        size: "2K",
        watermark: true,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.detail || payload.error || "图片生成失败");
    }
    const url = extractImageUrl(payload);
    if (!url) throw new Error("图片服务没有返回图片地址");
    state.imageJob = { status: "done", url, message: "", lessonId: lesson.id, interactionKey };
    state.strategyIndex = Math.max(state.strategyIndex, 2);
    state.bestStrategy = lesson.strategies[2]?.label || "生活类比";
    addEvidence("AI 生成理解图片", "AI 生成生活情景图，帮助孩子把知识点放进真实场景。", "生活类比图");
    toastMessage("AI 生活图已生成");
  } catch (error) {
    state.imageJob = {
      status: "error",
      url: "",
      message: error?.message || "图片生成失败，请检查 Ark 配置",
      lessonId: lesson.id,
      interactionKey,
    };
    toastMessage("AI 图片暂时没画出来");
  }

  render();
}

function extractImageUrl(payload) {
  return (
    payload?.data?.[0]?.url ||
    payload?.data?.[0]?.image_url ||
    payload?.url ||
    payload?.image_url ||
    ""
  );
}

async function handleVoiceButton() {
  if (state.recording) {
    stopVoiceInput();
    return;
  }

  if (USE_REALTIME_ASR && canUseRealtimeAsr()) {
    try {
      await startRealtimeVoiceInput();
      return;
    } catch (error) {
      console.warn("Realtime speech recognition did not start.", error);
      toastMessage("实时语音没有接通，改用短录音识别。");
    }
  }

  if (
    USE_BROWSER_SPEECH_RECOGNITION &&
    window.location.protocol !== "file:" &&
    getSpeechRecognitionCtor()
  ) {
    try {
      startBrowserSpeechRecognition();
      return;
    } catch {
      toastMessage("浏览器语音识别没有启动，改用短录音识别。");
    }
  }

  if (window.location.protocol !== "file:" && navigator.mediaDevices?.getUserMedia && window.MediaRecorder) {
    try {
      await startRecording();
      return;
    } catch {
      state.showKeyboard = true;
      state.transcript = "";
      state.lastStudentText = "";
      render();
      toastMessage("没有拿到麦克风权限，可以再试一次或用键盘输入。");
      return;
    }
  }

  state.showKeyboard = true;
  state.transcript = "";
  state.lastStudentText = "";
  render();
  toastMessage("语音没有启动成功，可以再试一次或用键盘输入。");
}

function stopVoiceInput() {
  if (realtimeVoiceSession) {
    stopRealtimeVoiceInput();
    return;
  }
  if (recognitionSession) {
    recognitionSession.stop();
    return;
  }
  if (recordingSession) {
    stopRecording();
    return;
  }
  state.recording = false;
  state.voiceStatus = "idle";
  render();
}

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function canUseRealtimeAsr() {
  return (
    window.location.protocol !== "file:" &&
    window.WebSocket &&
    navigator.mediaDevices?.getUserMedia &&
    (window.AudioContext || window.webkitAudioContext)
  );
}

async function startRealtimeVoiceInput() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    },
  });
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  if (audioContext.state === "suspended") await audioContext.resume();

  const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${socketProtocol}//${window.location.host}/api/realtime/voice`);
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  const mute = audioContext.createGain();
  mute.gain.value = 0;

  realtimeVoiceSession = {
    socket,
    stream,
    audioContext,
    source,
    processor,
    mute,
    pendingBytes: new Uint8Array(0),
    sentBytes: [],
    finalTranscript: "",
    stopped: false,
    finished: false,
  };

  processor.onaudioprocess = (event) => {
    if (!realtimeVoiceSession || realtimeVoiceSession.stopped) return;
    const pcm = downsampleFloatToPcm16(event.inputBuffer.getChannelData(0), audioContext.sampleRate, 16000);
    if (pcm.byteLength) queueRealtimePcm(pcm);
  };

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "start" }));
    flushRealtimePcmQueue();
  });

  socket.addEventListener("message", (event) => {
    handleRealtimeVoiceMessage(event.data);
  });

  socket.addEventListener("error", () => {
    fallbackRealtimeVoiceToBatch("实时语音连接中断。");
  });

  socket.addEventListener("close", () => {
    if (realtimeVoiceSession && !realtimeVoiceSession.finished && !realtimeVoiceSession.finalTranscript) {
      fallbackRealtimeVoiceToBatch("实时语音连接已关闭。");
    }
  });

  source.connect(processor);
  processor.connect(mute);
  mute.connect(audioContext.destination);
  state.recording = true;
  state.voiceStatus = "recording";
  render();
}

function queueRealtimePcm(chunk) {
  const session = realtimeVoiceSession;
  if (!session) return;
  session.pendingBytes = concatUint8Arrays(session.pendingBytes, new Uint8Array(chunk));
  flushRealtimePcmQueue();
}

function flushRealtimePcmQueue() {
  const session = realtimeVoiceSession;
  if (!session || session.socket.readyState !== WebSocket.OPEN) return;
  while (session.pendingBytes.byteLength >= REALTIME_ASR_CHUNK_BYTES) {
    const current = session.pendingBytes.slice(0, REALTIME_ASR_CHUNK_BYTES);
    session.pendingBytes = session.pendingBytes.slice(REALTIME_ASR_CHUNK_BYTES);
    sendRealtimePcm(current);
  }
}

function sendRealtimePcm(chunk) {
  const session = realtimeVoiceSession;
  if (!session || session.socket.readyState !== WebSocket.OPEN) return;
  session.sentBytes.push(chunk);
  session.socket.send(JSON.stringify({ type: "audio", audioBase64: bytesToBase64(chunk) }));
}

function stopRealtimeVoiceInput() {
  const session = realtimeVoiceSession;
  if (!session) return;
  session.stopped = true;
  state.recording = false;
  state.voiceStatus = "processing";
  render();

  const finalChunk = session.pendingBytes.byteLength ? session.pendingBytes : new Uint8Array(0);
  if (finalChunk.byteLength) session.sentBytes.push(finalChunk);
  if (session.socket.readyState === WebSocket.OPEN) {
    session.socket.send(JSON.stringify({ type: "stop", audioBase64: bytesToBase64(finalChunk) }));
  } else {
    fallbackRealtimeVoiceToBatch("实时语音还没准备好。");
  }
  cleanupRealtimeAudio(false);
}

function handleRealtimeVoiceMessage(raw) {
  const session = realtimeVoiceSession;
  if (!session) return;
  const payload = JSON.parse(String(raw || "{}"));
  if (payload.type === "partial") {
    session.finalTranscript = String(payload.transcript || "").trim() || session.finalTranscript;
    return;
  }
  if (payload.type === "final") {
    const transcript = String(payload.transcript || session.finalTranscript || "").trim();
    session.finished = true;
    cleanupRealtimeAudio(true);
    state.voiceStatus = "idle";
    state.transcript = "";
    if (!transcript) state.lastStudentText = "";
    render();
    if (transcript) handleChildInput(transcript, "voice");
    else toastMessage("没有听清楚，可以再点一下重说。");
    return;
  }
  if (payload.type === "error") {
    fallbackRealtimeVoiceToBatch(payload.message || "实时语音识别不可用。");
  }
}

async function fallbackRealtimeVoiceToBatch(message) {
  const session = realtimeVoiceSession;
  if (!session) return;
  const chunks = session.sentBytes.slice();
  if (session.pendingBytes?.byteLength) chunks.push(session.pendingBytes);
  cleanupRealtimeAudio(true);
  state.recording = false;
  state.voiceStatus = "processing";
  render();
  if (!chunks.length) {
    state.voiceStatus = "idle";
    state.transcript = "";
    state.lastStudentText = "";
    render();
    toastMessage(message || "没有听到声音，请再试一次。");
    return;
  }
  const wavBlob = new Blob([encodePcmWav(concatUint8Arrays(...chunks), 16000)], { type: "audio/wav" });
  await transcribeRecording(wavBlob, "");
}

function cleanupRealtimeAudio(closeSocket) {
  const session = realtimeVoiceSession;
  if (!session) return;
  if (!session.audioStopped) {
    try {
      session.processor.disconnect();
      session.source.disconnect();
      session.mute.disconnect();
    } catch {
      // Audio nodes may already be disconnected.
    }
    session.stream.getTracks().forEach((track) => track.stop());
    if (session.audioContext.state !== "closed") session.audioContext.close();
    session.audioStopped = true;
  }
  if (closeSocket && session.socket.readyState < WebSocket.CLOSING) session.socket.close();
  if (closeSocket) realtimeVoiceSession = null;
}

function startBrowserSpeechRecognition() {
  const SpeechRecognition = getSpeechRecognitionCtor();
  if (!SpeechRecognition) throw new Error("SpeechRecognition unavailable");
  const recognition = new SpeechRecognition();
  let finalText = "";
  recognition.lang = "zh-CN";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognitionSession = recognition;
  state.recording = true;
  state.voiceStatus = "recording";
  render();

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const text = event.results[i][0]?.transcript || "";
      if (event.results[i].isFinal) finalText += text;
      else interim += text;
    }
    state.transcript = `${finalText}${interim}`.trim();
  };

  recognition.onerror = () => {
    recognitionSession = null;
    state.recording = false;
    state.voiceStatus = "idle";
    state.showKeyboard = true;
    render();
    toastMessage("浏览器语音识别没有成功，可以再试一次或用键盘输入。");
  };

  recognition.onend = () => {
    const text = state.transcript.trim();
    recognitionSession = null;
    state.recording = false;
    state.voiceStatus = "idle";
    state.transcript = "";
    if (!text) state.lastStudentText = "";
    render();
    if (text) handleChildInput(text, "voice");
    else {
      toastMessage("没有听清楚，可以再点一下重说。");
    }
  };

  recognition.start();
}

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks = [];
  const options = getMediaRecorderOptions();
  const recorder = new MediaRecorder(stream, options);
  const fallbackRecognition = null;
  const timeoutId = window.setTimeout(() => {
    if (recordingSession) stopRecording();
  }, MAX_RECORDING_MS);
  recordingSession = { recorder, stream, chunks, timeoutId, fallbackRecognition, fallbackTranscript: "" };
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data?.size) chunks.push(event.data);
  });
  recorder.addEventListener("stop", async () => {
    window.clearTimeout(timeoutId);
    state.recording = false;
    state.voiceStatus = "processing";
    render();
    stream.getTracks().forEach((track) => track.stop());
    const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
    const fallbackTranscript = recordingSession?.fallbackTranscript || "";
    stopPassiveBrowserRecognition(recordingSession?.fallbackRecognition);
    recordingSession = null;
    await transcribeRecording(blob, fallbackTranscript);
  });
  state.recording = true;
  state.voiceStatus = "recording";
  recorder.start(250);
  render();
}

function getMediaRecorderOptions() {
  if (!window.MediaRecorder?.isTypeSupported) return {};
  if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
    return { mimeType: "audio/ogg;codecs=opus" };
  }
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return { mimeType: "audio/webm;codecs=opus" };
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) {
    return { mimeType: "audio/mp4" };
  }
  return {};
}

function stopRecording() {
  if (!recordingSession) return;
  if (recordingSession.recorder.state !== "inactive") recordingSession.recorder.stop();
}

function startPassiveBrowserRecognition() {
  const SpeechRecognition = getSpeechRecognitionCtor();
  if (!SpeechRecognition || window.location.protocol === "file:") return null;
  try {
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0]?.transcript || "";
      }
      if (recordingSession) recordingSession.fallbackTranscript = text.trim();
    };
    recognition.onerror = () => {};
    recognition.start();
    return recognition;
  } catch {
    return null;
  }
}

function stopPassiveBrowserRecognition(recognition) {
  if (!recognition) return;
  try {
    recognition.stop();
  } catch {
    // The browser may already have ended passive recognition.
  }
}

async function transcribeRecording(blob, fallbackTranscript = "") {
  try {
    const { audioData, mimeType } = await buildSpeechPayload(blob);
    const response = await fetch("/api/speech/transcriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioData,
        mimeType,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.mode === "mock" || !payload.transcript) {
      throw new Error(payload.detail || payload.message || "语音识别暂不可用");
    }
    state.voiceStatus = "idle";
    render();
    handleChildInput(payload.transcript, "voice");
  } catch (error) {
    console.warn("Speech recognition did not return a usable transcript.", error);
    state.voiceStatus = "idle";
    state.transcript = "";
    state.lastStudentText = "";
    state.showKeyboard = true;
    render();
    toastMessage("语音识别没有成功，请再说一次或用键盘输入。");
  }
}

async function buildSpeechPayload(blob) {
  const wavBlob = await convertBlobToWav(blob).catch(() => null);
  const uploadBlob = wavBlob || blob;
  return {
    audioData: await blobToDataUrl(uploadBlob),
    mimeType: uploadBlob.type || blob.type || "audio/wav",
  };
}

async function convertBlobToWav(blob) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) throw new Error("AudioContext unavailable");
  const sourceBuffer = await blob.arrayBuffer();
  const context = new AudioContext({ sampleRate: 16000 });
  try {
    const audioBuffer = await context.decodeAudioData(sourceBuffer.slice(0));
    const wavBuffer = encodeWav(audioBuffer);
    return new Blob([wavBuffer], { type: "audio/wav" });
  } finally {
    if (context.state !== "closed") await context.close();
  }
}

function encodeWav(audioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const sampleCount = audioBuffer.length;
  const dataSize = sampleCount * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const channels = Array.from({ length: channelCount }, (_, index) => audioBuffer.getChannelData(index));
  let offset = 44;
  for (let i = 0; i < sampleCount; i += 1) {
    let sample = 0;
    for (let channel = 0; channel < channelCount; channel += 1) {
      sample += channels[channel][i] || 0;
    }
    sample = Math.max(-1, Math.min(1, sample / channelCount));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function encodePcmWav(pcmBytes, sampleRate) {
  const data = pcmBytes instanceof Uint8Array ? pcmBytes : new Uint8Array(pcmBytes || 0);
  const buffer = new ArrayBuffer(44 + data.byteLength);
  const view = new DataView(buffer);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + data.byteLength, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, data.byteLength, true);
  new Uint8Array(buffer, 44).set(data);
  return buffer;
}

function downsampleFloatToPcm16(samples, inputRate, outputRate) {
  if (!samples?.length) return new Uint8Array(0);
  const ratio = inputRate / outputRate;
  const outputLength = Math.max(1, Math.floor(samples.length / ratio));
  const output = new Uint8Array(outputLength * 2);
  const view = new DataView(output.buffer);

  for (let i = 0; i < outputLength; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.min(samples.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j += 1) {
      sum += samples[j] || 0;
      count += 1;
    }
    const sample = Math.max(-1, Math.min(1, count ? sum / count : samples[start] || 0));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return output;
}

function concatUint8Arrays(...arrays) {
  const normalized = arrays.filter(Boolean).map((item) => (item instanceof Uint8Array ? item : new Uint8Array(item)));
  const total = normalized.reduce((sum, item) => sum + item.byteLength, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  normalized.forEach((item) => {
    result.set(item, offset);
    offset += item.byteLength;
  });
  return result;
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(offset, offset + chunkSize));
  }
  return window.btoa(binary);
}

function writeAscii(view, offset, text) {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function handleChildInput(text, inputType) {
  if (state.voiceStatus === "processing") {
    toastMessage("老师正在回复，等这句说完再继续。");
    return;
  }

  if (!text) {
    toastMessage("先说一句或打几个字，我再继续。");
    return;
  }

  state.transcript = "";

  const requestedLessonIndex = findRequestedLessonIndex(text);
  if (requestedLessonIndex >= 0) {
    changeLesson("孩子主动说想换知识点。", requestedLessonIndex);
    return;
  }

  state.lastStudentText = text;
  state.voiceStatus = "processing";
  resetGeneratedVisualForTurn();
  render();
  askGatewayTutor(text, inputType);
}

async function askGatewayTutor(text, inputType) {
  const lesson = currentLesson();
  if (lesson.useQuestionBankTutor) {
    evaluateLocally(text, inputType);
    state.voiceStatus = "idle";
    render();
    return;
  }

  if (window.location.protocol === "file:") {
    evaluateLocally(text, inputType);
    state.voiceStatus = "idle";
    render();
    return;
  }

  try {
    const response = await fetch("/api/learning/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        inputType,
        phase: state.phase,
        context: state.aiContext,
        step: state.currentStep,
        engineSession: state.engineSession,
        lesson: {
          id: lesson.id,
          problem: lesson.problem,
          textbook: `${lesson.edition} ${lesson.grade} ${lesson.unit}`,
          node: lesson.node,
          lessonName: lesson.lesson,
          useQuestionBankTutor: lesson.useQuestionBankTutor,
          sourceQuestionBankId: lesson.sourceQuestionBankId,
          prerequisites: lesson.prerequisites,
          microSteps: lesson.microSteps,
          commonGaps: lesson.commonGaps,
          knowledgeLayers: lesson.knowledgeLayers,
          substeps: lesson.substeps,
          masterySignals: lesson.masterySignals,
          diagnosticFocus: lesson.diagnosticFocus,
          answerSignals: lesson.answer,
          teachingStrategies: lesson.strategies.map((strategy) => strategy.label),
          currentQuestion: lesson.activeQuestion
            ? {
                id: lesson.activeQuestion.id,
                kind: lesson.activeQuestion.kind,
                type: lesson.activeQuestion.type,
                prompt: lesson.activeQuestion.prompt,
                answer: lesson.activeQuestion.answer,
                explanation: lesson.activeQuestion.explanation,
                answerKeywords: lesson.activeQuestion.answerKeywords,
              }
            : null,
          questionBankSample: getQuestionBankSample(lesson),
          questionBankStats: lesson.questionBankStats,
          variationRules: lesson.variationRules,
          teachingMethods: lesson.teachingMethods,
        },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.mode === "mock") {
      throw new Error(payload.detail || payload.error || "模型暂不可用");
    }
    applyGatewayTutor(payload, inputType);
  } catch {
    evaluateLocally(text, inputType);
  }

  state.voiceStatus = "idle";
  render();
}

function applyGatewayTutor(payload, inputType) {
  let nextPhase = ["guiding", "teachback", "repair", "summary"].includes(payload.nextPhase)
    ? payload.nextPhase
    : state.phase;
  const lesson = currentLesson();
  const unclearChildText = isUnclearChildText(normalizeText(state.lastStudentText));
  if (unclearChildText && ["teachback", "summary"].includes(nextPhase)) {
    nextPhase = "guiding";
    payload.aiContext = "孩子输入不完整，前端已阻止误判通过。";
    payload.aiMessage = `我没听清。我们只看这题：${lesson.activeQuestion?.prompt || lesson.problem}`;
    payload.teachingState = "GUIDED_STEP";
    payload.currentStep = `小台阶 1：${getLessonLadderSteps(lesson)[0] || lesson.microSteps[0] || "先读题"}`;
    payload.evidenceSignal = "输入不完整";
    payload.evidenceText = "孩子没有给出可判断的回答，系统没有推进掌握状态。";
  }

  state.phase = nextPhase;
  state.aiContext = payload.aiContext || state.aiContext;
  state.aiMessage = payload.aiMessage || state.aiMessage;
  state.teachingState = payload.teachingState || state.teachingState;
  state.currentAtomName = payload.currentAtomName || state.currentAtomName;
  state.engineSession = payload.engineSession || state.engineSession;
  state.parentSignals = payload.parentSignals || state.parentSignals;
  if (payload.mastery) state.mastery = Number(payload.mastery) || state.mastery;
  if (payload.currentStep) state.currentStep = payload.currentStep;
  state.feynmanStatus = payload.feynmanStatus || state.feynmanStatus;
  state.bestStrategy = payload.bestStrategy || state.bestStrategy;

  if (nextPhase === "teachback") {
    state.completedSteps = getLessonLadderSteps(lesson).length;
    state.mastery = Math.max(state.mastery, 74);
    state.currentStep = payload.currentStep || "小台阶 3：讲给老师听";
  }

  if (nextPhase === "repair") {
    state.showVisual = true;
    state.strategyIndex = Math.max(state.strategyIndex, 1);
    state.currentStep = payload.currentStep || "小台阶 3：再讲一次";
    state.mastery = Math.max(state.mastery, 68);
    if (!payload.aiMessage) state.aiMessage = lesson.repairPrompt;
  }

  if (nextPhase === "summary") {
    state.completedSteps = getLessonLadderSteps(lesson).length;
    state.mastery = Math.max(state.mastery, 86);
    state.currentStep = payload.currentStep || "完成：能讲清楚原因";
    state.canExplainWhy = true;
    state.canUseOwnWords = true;
    if (!payload.aiMessage) state.aiMessage = lesson.doneMessage;
  }

  syncLadderProgress(payload);
  resetGeneratedVisualForTurn();
  addEvidence(
    payload.evidenceSignal || "AI 评估",
    payload.evidenceText || "真实模型已根据孩子回答更新学习状态。",
    inputType === "voice" ? "语音回答" : "键盘回答",
  );
  state.voiceStatus = "idle";
  speakCurrentMessage();
}

function evaluateLocally(text, inputType) {
  if (state.phase === "teachback" || state.phase === "repair") {
    evaluateTeachback(text, inputType);
  } else {
    evaluateAttempt(text, inputType);
  }
}

function evaluateAttempt(text, inputType) {
  const lesson = currentLesson();
  const normalized = normalizeText(text);
  const activeQuestion = lesson.activeQuestion || null;
  const knowsProcess = includesAny(normalized, lesson.answer.attemptKeywords);
  const picksAnswer = includesAny(normalized, lesson.answer.answerKeywords);
  const unclear = isUnclearChildText(normalized);

  if (unclear) {
    state.phase = "guiding";
    state.mastery = Math.max(48, state.mastery - 1);
    state.currentStep = `小台阶 1：${getLessonLadderSteps(lesson)[0] || lesson.microSteps[0] || "先读题"}`;
    state.aiContext = "孩子输入不完整，先拉回当前题。";
    state.aiMessage = `我没听清。我们只看这题：${activeQuestion?.prompt || lesson.problem}`;
    state.showVisual = true;
    resetGeneratedVisualForTurn();
    addEvidence("输入不完整", "孩子没有给出可判断的回答，AI 没有默认判对。", inputType === "voice" ? "语音回答" : "键盘回答");
    speakCurrentMessage();
    return;
  }

  if (knowsProcess && picksAnswer) {
    state.phase = "teachback";
    state.mastery = Math.max(state.mastery, 74);
    state.completedSteps = getLessonLadderSteps(lesson).length;
    state.currentStep = "小台阶 3：讲给老师听";
    state.aiContext = "你已经会做这一步了。";
    state.aiMessage = "这次换你当小老师，讲给我听一遍。";
    state.feynmanStatus = "等待孩子讲";
    resetGeneratedVisualForTurn();
    addEvidence("答对并进入复述", `孩子能做出「${lesson.node}」，开始进入讲给老师听。`, inputType === "voice" ? "语音回答" : "键盘回答");
    speakCurrentMessage();
    return;
  }

  if (picksAnswer) {
    state.phase = "teachback";
    state.mastery = Math.max(state.mastery, 70);
    state.completedSteps = Math.max(state.completedSteps, Math.min(1, getLessonLadderSteps(lesson).length));
    state.currentStep = "小台阶：说清原因";
    state.aiContext = "孩子答案对了，但还没有说明原因。";
    state.aiMessage = `答案对了。你再说一句：为什么是${formatExpectedAnswer(activeQuestion, lesson)}？`;
    state.feynmanStatus = "会做，等待说理";
    resetGeneratedVisualForTurn();
    addEvidence("答案正确，追问原因", `孩子答出了「${formatExpectedAnswer(activeQuestion, lesson)}」，继续检查是否会说理。`, inputType === "voice" ? "语音回答" : "键盘回答");
    speakCurrentMessage();
    return;
  }

  if (knowsProcess) {
    state.phase = "guiding";
    state.mastery = Math.max(56, state.mastery);
    state.currentStep = "小台阶：检查答案";
    state.aiContext = "孩子说到了一部分方法，但答案还不稳。";
    state.aiMessage = `想法有一点对。现在只回答这题：${activeQuestion?.prompt || lesson.problem}`;
    state.showVisual = true;
    resetGeneratedVisualForTurn();
    addEvidence("方法部分正确", "孩子说到过程词，但还没有答出当前题答案。", inputType === "voice" ? "语音回答" : "键盘回答");
    speakCurrentMessage();
    return;
  }

  state.phase = "repair";
  state.mastery = Math.max(52, state.mastery - 2);
  state.aiContext = "孩子回答和当前题不匹配，先给一个更小提示。";
  state.aiMessage = `这次先不急。看这题：${activeQuestion?.prompt || lesson.problem}。你可以先说：${getLessonLadderSteps(lesson)[0] || lesson.microSteps[0]}。`;
  state.currentStep = "小台阶 1：先找题目条件";
  state.showVisual = true;
  state.strategyIndex = 1;
  state.bestStrategy = lesson.strategies[1]?.label || "画图";
  resetGeneratedVisualForTurn();
  addEvidence("答非所问或答案不稳", "孩子回答没有匹配当前题答案，AI 拉回当前题并给更小提示。", "小提示");
  speakCurrentMessage();
}

function isUnclearChildText(normalizedText) {
  if (!normalizedText || normalizedText.length < 1) return true;
  return ["好", "好的", "嗯", "啊", "哦", "可以", "行", "不知道", "不会", "没听清"].includes(normalizedText);
}

function formatExpectedAnswer(question, lesson) {
  return question?.answer || lesson.answer.answerKeywords?.[0] || "这个答案";
}

function recordQuestionPass(lesson = currentLesson()) {
  const id = lesson.activeQuestion?.id || lesson.problem;
  if (!id) return;
  state.passedQuestionIds = uniqueKeywords([...(state.passedQuestionIds || []), id]);
}

function maybeContinueWithVariantAfterTeachback(inputType) {
  const lesson = currentLesson();
  const bank = getLessonQuestionBank(lesson);
  if (!lesson.useQuestionBankTutor || bank.length <= 1) return false;
  if ((state.passedQuestionIds || []).length >= 3) return false;

  const nextCursor = ((Number(lesson.questionCursor) || 0) + 1) % bank.length;
  const nextQuestion = bank[nextCursor];
  activateLessonQuestion(lesson, nextQuestion, nextCursor);

  state.phase = "guiding";
  state.completedSteps = 0;
  state.mastery = Math.max(state.mastery, 76);
  state.strategyIndex = 0;
  state.currentStep = `变式练习：${getLessonLadderSteps(lesson)[0] || lesson.microSteps[0] || "先读题"}`;
  state.aiContext = "孩子讲清楚了一题，进入同知识点变式题。";
  state.aiMessage = `你讲清楚了。我们换一道同类题：${nextQuestion.prompt}`;
  state.feynmanStatus = "已讲清一题，继续变式";
  state.showVisual = true;
  state.lastStudentText = "";
  state.engineSession = null;
  resetGeneratedVisualForTurn();
  addEvidence("进入变式题", `已通过 ${state.passedQuestionIds.length} 道，继续：${nextQuestion.prompt}`, inputType === "voice" ? "语音复述" : "打字复述");
  speakCurrentMessage();
  return true;
}

function evaluateTeachback(text, inputType) {
  const lesson = currentLesson();
  const normalized = normalizeText(text);
  const mentionsConcept = includesAny(normalized, lesson.answer.conceptKeywords);
  const explainsWhy = includesAny(normalized, lesson.answer.whyKeywords);
  const usesOwnWords = includesAny(normalized, lesson.answer.ownWordsKeywords);
  const comparesResult = includesAny(normalized, lesson.answer.resultKeywords);

  if (mentionsConcept && explainsWhy && comparesResult) {
    recordQuestionPass(lesson);
    if (maybeContinueWithVariantAfterTeachback(inputType)) return;

    state.phase = "summary";
    state.mastery = 86;
    state.completedSteps = getLessonLadderSteps(lesson).length;
    state.currentStep = "完成：能讲清楚原因";
    state.aiContext = "你讲清楚了关键原因。";
    state.aiMessage = lesson.doneMessage;
    state.feynmanStatus = "能讲清楚";
    state.canExplainWhy = true;
    state.canUseOwnWords = usesOwnWords;
    state.bestStrategy = usesOwnWords ? lesson.strategies[1]?.label || state.bestStrategy : state.bestStrategy;
    resetGeneratedVisualForTurn();
    addEvidence("能用自己的话解释", `孩子复述时能说出「${lesson.node}」的关键原因。`, inputType === "voice" ? "讲给老师听" : "打字复述");
    speakCurrentMessage();
    return;
  }

  state.phase = "repair";
  state.mastery = Math.max(state.mastery, 68);
  state.currentStep = "小台阶 3：再讲一次";
  state.aiContext = "你已经说出了一部分，还差一点原因。";
  state.aiMessage = lesson.repairPrompt;
  state.feynmanStatus = "会做但讲不清";
  state.showVisual = true;
  state.strategyIndex = 1;
  state.bestStrategy = lesson.strategies[1]?.label || "画图";
  resetGeneratedVisualForTurn();
  addEvidence("会做但讲不清", "孩子复述不完整，AI 没有判错，而是换成看图追问。", "画图");
  speakCurrentMessage();
}

function switchExplanation(reason) {
  state.phase = state.phase === "teachback" ? "repair" : state.phase;
  state.strategyIndex = Math.min(currentLesson().strategies.length - 1, state.strategyIndex + 1);
  const strategy = lessonStrategy();
  state.aiContext = reason;
  state.aiMessage = strategy.message;
  state.showVisual = state.showVisual || strategy.key === "visual" || state.phase === "repair";
  state.bestStrategy = strategy.label;
  state.currentStep = strategy.key === "story" ? "小台阶 2：用生活例子想" : "小台阶 2：换一种讲法";
  resetGeneratedVisualForTurn();
  addEvidence("换讲法", `AI 改用「${strategy.label}」帮助孩子理解。`, strategy.label);
  speakCurrentMessage();
  render();
}

async function speakCurrentMessage() {
  const text = toSpokenText(state.aiMessage.trim());
  if (!text) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  if (window.location.protocol !== "file:") {
    try {
      const response = await fetch("/api/speech/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.audioDataUrl) {
        currentAudio = new Audio(payload.audioDataUrl);
        await currentAudio.play();
        return;
      }
    } catch {
      // Browser speech is a safe fallback for local demos and missing TTS setup.
    }
  }

  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  const preferredVoice = pickChineseVoice();
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 0.88;
  utterance.pitch = 1.04;
  window.speechSynthesis.speak(utterance);
}

function pickChineseVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return (
    voices.find((voice) => /zh|Chinese|Mandarin|中文|普通话/i.test(`${voice.lang} ${voice.name}`)) ||
    voices.find((voice) => /Ting|Mei|Sin|Li|Yu/i.test(voice.name)) ||
    null
  );
}

function toSpokenText(text) {
  return String(text || "")
    .replace(/2\/3/g, "三分之二")
    .replace(/3\/4/g, "四分之三")
    .replace(/8\/12/g, "十二分之八")
    .replace(/9\/12/g, "十二分之九")
    .replace(/3:20/g, "三点二十")
    .replace(/3:45/g, "三点四十五")
    .replace(/\b5\s*\+\s*3\s*\+\s*5\s*\+\s*3\b/g, "五加三加五加三")
    .replace(/AI/g, "老师")
    .replace(/L2/g, "第二级提示")
    .replace(/[：:]/g, "，")
    .replace(/[“”"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function addEvidence(signal, text, strategy) {
  state.evidence.unshift({ signal, text, strategy, type: "learning" });
  state.evidence = state.evidence.slice(0, 8);
}

function findRequestedLessonIndex(text) {
  const normalized = normalizeText(text);
  const explicitTopic = findExplicitTopic(normalized);

  const hasGenericSwitchIntent = [
    "换知识点",
    "换个知识点",
    "换一个知识点",
    "换一题",
    "换题",
    "换别的",
    "不想学这个",
    "换内容",
    "换课程",
    "换课",
    "下一个",
    "下一题",
    "重新选",
  ].some((keyword) => normalized.includes(normalizeText(keyword)));

  const hasTopicSwitchIntent = [
    "换",
    "换成",
    "换到",
    "帮我换",
    "我想换",
    "想学",
    "想学习",
    "学一下",
    "学习",
    "讲一下",
    "讲讲",
    "教我",
    "帮我",
    "知识",
    "知识点",
  ].some((keyword) => normalized.includes(normalizeText(keyword)));

  if (explicitTopic && (hasGenericSwitchIntent || hasTopicSwitchIntent)) {
    return explicitTopic.index;
  }

  return hasGenericSwitchIntent ? (state.lessonIndex + 1) % lessons.length : -1;
}

function findExplicitTopic(normalizedText) {
  const currentId = currentLesson().id;
  const candidates = lessons
    .map((lesson, index) => {
      const keywords = buildLessonKeywords(lesson);
      const score = keywords.reduce((total, keyword) => {
        const normalizedKeyword = normalizeText(keyword);
        if (!normalizedKeyword || !normalizedText.includes(normalizedKeyword)) return total;
        return total + Math.min(12, Math.max(2, normalizedKeyword.length));
      }, 0);
      return { lesson, index, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best) return null;
  if (best.lesson.id === currentId && candidates[1]?.score === best.score) return candidates[1];
  return best;
}

function buildLessonKeywords(lesson) {
  return uniqueKeywords([
    lesson.id,
    lesson.unit,
    lesson.lesson,
    lesson.node,
    lesson.problem,
    ...(lesson.curriculumKeywords || []),
    ...(lesson.prerequisites || []),
    ...(lesson.commonGaps || []),
  ]);
}

function includesAny(normalizedText, keywords) {
  return keywords.some((keyword) => normalizedText.includes(normalizeText(keyword)));
}

function normalizeText(text) {
  return String(text).toLowerCase().replace(/\s/g, "");
}

function shortSvgText(text, maxLength) {
  const value = String(text || "");
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function toastMessage(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeText(value).replace(/"/g, "&quot;");
}

render();
