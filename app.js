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

const TEACHER_AVATAR_SRC = "./assets/lezhi-teacher-v2.png?v=1";

const USE_BROWSER_SPEECH_RECOGNITION = false;
const USE_REALTIME_ASR = true;
const MAX_RECORDING_MS = 9000;
const REALTIME_ASR_CHUNK_BYTES = 6400;
const VOICE_MIN_DURATION_MS = 420;
const VOICE_MIN_RMS = 0.0045;
const VOICE_MIN_VOICED_RATIO = 0.045;
const VOICE_LOW_CONFIDENCE = 0.58;
const ALLOW_BROWSER_TTS_FALLBACK = false;
let ttsProblemNotified = false;

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
    doneMessage: "这次不只是答案对了，你也说出了为什么。",
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
    const listedQuestions = normalizeLessonQuestions(point.questions || []);
    const typical = normalizeQuestion(point.typicalQuestion) || listedQuestions[0] || null;
    const questions = uniqueQuestions([typical, ...listedQuestions].filter(Boolean));
    const primaryQuestion = typical || questions[0] || null;
    if (!primaryQuestion) return null;

    const primaryFamily = getKnowledgePointFamily(point) || inferQuestionTeachingFamily(point, primaryQuestion);
    const orderedQuestions = orderQuestionsForKnowledgePoint(point, questions, primaryQuestion, primaryFamily);
    return createQuestionBankBlueprint(point, orderedQuestions, primaryQuestion, primaryFamily);
  }).filter(Boolean);
}

function orderQuestionsForKnowledgePoint(point, questions, primaryQuestion, primaryFamily) {
  const primaryId = primaryQuestion?.id || "";
  const direct = [];
  const sameFamily = [];
  for (const question of questions || []) {
    if (!question) continue;
    if (question.id === primaryId) {
      direct.push(question);
      continue;
    }
    const family = inferQuestionTeachingFamily(point, question);
    if (family === primaryFamily) sameFamily.push(question);
  }
  const scoped = uniqueQuestions([...direct, ...sameFamily]);
  return scoped.length ? scoped : uniqueQuestions(direct);
}

function createQuestionBankBlueprint(point, questions, originalPrimaryQuestion, primaryFamily) {
    const pointOverlay = getKnowledgePointOverlay(point);
    const family = pointOverlay?.family || primaryFamily;
    const baseId = questionBankLessonAliases[point.id] || point.id.toLowerCase();
    const id = baseId;
    const primaryQuestion =
      questions.find((question) => question.id === originalPrimaryQuestion?.id) ||
      questions[0] ||
      originalPrimaryQuestion;
    const visualType = pointOverlay?.visualType || visualTypeForTeachingFamily(family, point.visualType || "generic");
    const familyLabel = teachingFamilyChildLabel(family);
    const node = point.node || point.title || "";
    const lessonName = point.lesson || point.title || point.node || "";
    const pointForGroup = {
      ...point,
      node,
      title: node,
      lesson: lessonName,
      visualType,
      teachingOverlay: pointOverlay,
    };
    const teachingProfile = createTeachingProfileForPoint(pointForGroup, primaryQuestion, family);
    const teachingStrategy = getTeachingStrategy(family) || {};
    const microSteps = normalizeTextList(teachingProfile.microSteps, [
      "先读懂题目在问什么",
      "只做当前小台阶",
      "说一说这样想的原因",
      "换一道同类题再试",
    ]);
    const starterLesson = {
      id,
      node,
      lesson: lessonName,
      visualType,
      baseVisualType: visualType,
      sourceQuestionFamily: family,
      activeQuestionFamily: family,
      activeQuestion: primaryQuestion,
      microSteps,
      substeps: teachingProfile.substeps || point.substeps || microSteps,
      teachingProfile,
      answer: { answerKeywords: primaryQuestion?.answerKeywords || [] },
    };
    const starterStep = createGuidedStepPlan(starterLesson, 0);
    const questionAnswerKeywords = primaryQuestion?.answerKeywords || [];
    return {
      id,
      sourceQuestionBankId: point.id,
      sourceQuestionFamily: family,
      subject: "数学",
      edition: "人教版",
      grade: point.grade || point.volume || "",
      unit: point.unit || "",
      lesson: lessonName,
      node,
      problem: primaryQuestion?.prompt || point.description || point.title || "",
      initialContext: teachingProfile.initialContext || point.description || `${point.title || "这个知识点"} 从一道小题开始。`,
      initialMessage: createInitialGuidedMessage(pointForGroup, primaryQuestion, microSteps),
      initialStep: `小台阶 1：${starterStep.label}`,
      stepHint: starterStep.prompt || point.description || microSteps[0],
      microSteps,
      commonGaps: normalizeTextList(teachingProfile.commonGaps || point.commonGaps, ["只报答案不说原因", "漏看题目条件", "换题后不稳"]),
      keywords: normalizeTextList(point.keywords, [point.title, point.unit]).concat(point.questionTypes || []),
      answerKeywords: uniqueKeywords(questionAnswerKeywords.concat(point.answerKeywords || [])),
      masterySignals: normalizeTextList(teachingProfile.masterySignals || point.masterySignals, ["能做直接题", "能做变式题", "能说出原因", "能讲给老师听"]),
      diagnosticFocus: uniqueKeywords([...(point.commonGaps || []), ...(pointOverlay?.diagnostics || []), ...(pointOverlay?.commonGaps || [])]),
      substeps: normalizeTextList(teachingProfile.substeps || point.substeps || point.microSteps, microSteps),
      visualType,
      baseVisualType: visualType,
      activeQuestionFamily: family,
      questionBank: questions,
      useQuestionBankTutor: true,
      targetPassCount: teachingProfile.targetPassCount,
      teachingProfile,
      activeQuestionId: primaryQuestion?.id || "",
      questionCursor: Math.max(0, questions.findIndex((question) => question.id === primaryQuestion?.id)),
      questionTypes: uniqueKeywords([...(point.questionTypes || []), familyLabel]),
      variationRules: uniqueKeywords([...(point.variationRules || []), ...(pointOverlay?.variationRules || []), ...(teachingProfile.variationRules || []), ...(teachingStrategy.variants || [])]),
      teachingMethods: uniqueKeywords([...(point.teachingMethods || []), ...(pointOverlay?.teachingMethods || []), ...(teachingProfile.teachingMethods || []), ...(teachingStrategy.teachingMethods || [])]),
      questionBankStats: {
        sourceId: point.id,
        family,
        questionCount: questions.length,
        sourceQuestionCount: Number(point.questionCount || questions.length),
        typicalCount: questions.filter((question) => question.kind === "typical").length,
        variantCount: questions.filter((question) => question.kind === "variant").length,
      },
    };
}

function uniqueQuestions(questions) {
  const seen = new Set();
  return (questions || []).filter((question) => {
    const key = question?.id || question?.prompt;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function groupQuestionsByTeachingFamily(point, questions) {
  const groups = new Map();
  for (const question of questions) {
    const family = inferQuestionTeachingFamily(point, question);
    if (!groups.has(family)) groups.set(family, []);
    groups.get(family).push(question);
  }
  return groups;
}

function orderQuestionGroups(groups, primaryFamily) {
  const result = [];
  if (groups.has(primaryFamily)) result.push({ family: primaryFamily, questions: groups.get(primaryFamily) });
  for (const [family, questions] of groups.entries()) {
    if (family !== primaryFamily) result.push({ family, questions });
  }
  return result.filter((group) => group.questions.length);
}

function teachingFamilyChildLabel(family) {
  const labels = {
    money: "元角分换算",
    moneyApplication: "购物找零",
    compare: "比大小",
    ordinal: "第几个和位置",
    count: "数一数",
    composition: "分与合",
    pattern: "找规律",
    calculation: "计算",
    concreteAddition: "合起来和一共",
    concreteSubtraction: "拿走和还剩",
    makeTenAdd: "凑十加法",
    breakTenSubtract: "破十减法",
    mixedCalculation: "连加连减",
    comparisonDifference: "比较多多少",
    application: "解决问题",
    multiplication: "乘法意义",
    division: "平均分",
    arrangement: "搭配排列",
    observation: "观察物体",
    time: "认识时间",
    timeDuration: "经过时间",
    angle: "认识角",
    remainderDivision: "有余数除法",
    remainderApplication: "余数解决问题",
    measure: "测量和单位",
    placeValue: "数位与组成",
    shape: "图形认识",
    data: "分类统计",
    logic: "推理",
  };
  return labels[family] || "同类题";
}

function visualTypeForTeachingFamily(family, fallback = "generic") {
  const map = {
    money: "money",
    moneyApplication: "money",
    compare: "compare",
    ordinal: "position",
    count: "count",
    composition: "ten-frame",
    pattern: "pattern",
    calculation: "number-line",
    concreteAddition: "ten-frame",
    concreteSubtraction: "ten-frame",
    makeTenAdd: "ten-frame",
    breakTenSubtract: "ten-frame",
    mixedCalculation: "number-line",
    comparisonDifference: "compare",
    application: "ten-frame",
    multiplication: "array",
    division: "sharing",
    arrangement: "array",
    observation: "position",
    time: "clock",
    timeDuration: "clock",
    angle: "angle",
    remainderDivision: "sharing",
    remainderApplication: "sharing",
    measure: ["ruler", "mass", "angle"].includes(fallback) ? fallback : "ruler",
    placeValue: "place-value",
    shape: "shape",
    data: "data",
    logic: "logic",
  };
  return map[family] || fallback || "generic";
}

function getStandardMasterySignals() {
  return [
  "能独立做一道直接题",
  "换数字或情境后还能做",
  "能用一句话说出原因",
  "能当小老师讲一遍",
  ];
}

function getTeachingStrategy(family) {
  try {
    return window.LezhiTeachingStrategies?.getStrategy?.(family) || null;
  } catch (error) {
    return null;
  }
}

function getKnowledgePointOverlay(pointOrId) {
  try {
    return window.LezhiKnowledgePointOverlays?.getPointOverlay?.(pointOrId) || null;
  } catch (error) {
    return null;
  }
}

function getKnowledgePointFamily(pointOrId) {
  return getKnowledgePointOverlay(pointOrId)?.family || "";
}

function getLessonTeachingFamily(lesson) {
  return (
    lesson?.activeQuestionFamily ||
    lesson?.sourceQuestionFamily ||
    lesson?.questionBankStats?.family ||
    getKnowledgePointFamily(lesson) ||
    inferQuestionTeachingFamily(lesson, lesson?.activeQuestion)
  );
}

function getPlanTeachingFamily(lesson, plan = null) {
  const activeFamily = inferActiveQuestionFamily(lesson, lesson?.activeQuestion || null);
  const text = normalizeText([
    lesson?.node,
    lesson?.lesson,
    lesson?.lessonName,
    lesson?.activeQuestion?.prompt,
    plan?.label,
    plan?.prompt,
    plan?.teacherHint,
    plan?.repeatSentence,
  ].filter(Boolean).join(" "));

  if ((activeFamily === "angle" || activeFamily === "shape") && isGeometryAngleContext(text)) return activeFamily;
  if (isCompositionTeachingText(text)) return "composition";
  if (isMoneyApplicationText(text) && !isMoneyUnitConversionText(text)) return "moneyApplication";
  if (hasMoneyTerm(text)) return activeFamily === "moneyApplication" ? "moneyApplication" : "money";
  return activeFamily;
}

function isCompositionTeachingText(text = "") {
  const value = normalizeText(text);
  return /分与合|分成|组成|总数|另一部分|两部分|合起来检查|合起来还是总数/.test(value) && !hasMoneyTerm(value);
}

function hasMoneyTerm(text = "") {
  const value = normalizeText(text);
  if (!value) return false;
  if (/人民币|钱|纸币|硬币|元角分|找回|找零|价钱|付钱|付了|购物|商品价格/.test(value)) return true;
  if (/(\d+|一|二|两|三|四|五|六|七|八|九|十|百|几|多少)\s*元|元\s*(=|等于|换成|是)/.test(value)) return true;
  if (isGeometryAngleContext(value)) return false;
  if (/(\d+|一|二|两|三|四|五|六|七|八|九|十|百|几|多少)\s*角|角\s*(=|等于|换成|是)|换成角|先换成角|角钱/.test(value)) return true;
  return /(换算|换成|等于|多少)\s*[0-9一二三四五六七八九十百]*分/.test(value) && /人民币|钱|元|角/.test(value);
}

function isGeometryAngleContext(text = "") {
  const value = normalizeText(text);
  if (!value) return false;
  if (/人民币|元角分|角钱|找回|找零|价钱|付钱|付了|购物|商品价格/.test(value)) return false;
  return /认识角|直角|锐角|钝角|角度|顶点|两条边|角的大小|角有|张口|边画得|图形/.test(value);
}

function getExternalTeachingStandards() {
  try {
    const standards = window.LezhiTeachingStrategies?.getTeachingStandards?.();
    return standards && typeof standards === "object" ? standards : null;
  } catch (error) {
    return null;
  }
}

function createStrategyScaffoldHint(lesson, step, family, question, expression, answer) {
  try {
    return window.LezhiTeachingStrategies?.createScaffoldHint?.({ lesson, step, family, question, expression, answer }) || "";
  } catch (error) {
    return "";
  }
}

function getStrategyProgressBridge(family, isReason, key) {
  try {
    return window.LezhiTeachingStrategies?.getProgressBridge?.(family, isReason, key) || "";
  } catch (error) {
    return "";
  }
}

function createStrategyVariantQuestionMessage(family, prompt, firstStep, key) {
  try {
    return window.LezhiTeachingStrategies?.createVariantMessage?.({ family, prompt, firstStep, key }) || "";
  } catch (error) {
    return "";
  }
}

function createStrategyDialogueMove(family, kind, key, options = {}) {
  try {
    return window.LezhiTeachingStrategies?.createDialogueMove?.({ family, kind, key, ...options }) || "";
  } catch (error) {
    return "";
  }
}

function getTeachingStandards() {
  const externalStandards = getExternalTeachingStandards();
  if (externalStandards && Object.keys(externalStandards).length) return externalStandards;
  return {
  money: {
    steps: ["先认清元角分", "先换成同一种单位", "只算当前这一小步", "说一说为什么先换单位", "换一道同类题再试", "当小老师讲一遍"],
    commonGaps: ["把元角分当成同一种单位", "只报结果不说先换单位", "忘记加上原来的几角或几分"],
    targetPassCount: 4,
  },
  moneyApplication: {
    steps: ["先看题目问找回还是一共", "找商品价格和付的钱", "元角先换成同一种单位", "用付的钱减商品价格", "带单位回答", "换一道购物题再试", "当小老师讲一遍"],
    commonGaps: ["把商品价格和付的钱混在一起", "元角混着直接相减", "知道结果但说不清为什么先换单位", "忘记找回是付的钱里剩下的部分"],
    targetPassCount: 4,
  },
  compare: {
    steps: ["先看清两边分别是多少", "用数数或一一对应比较", "填大于号小于号或等号", "说一说比较方法", "换一道同类题再试", "当小老师讲一遍"],
    commonGaps: ["把符号方向看反", "只看图不说哪边多", "不会说明为什么大或小"],
    targetPassCount: 4,
  },
  count: {
    steps: ["先确定从哪里开始数", "一个一个按顺序数", "数过的做记号不重复", "说最后一个数就是总数", "换一张图再试", "当小老师讲一遍"],
    commonGaps: ["漏数或重复数", "把第几个当成一共有几个", "数完不带单位回答"],
    targetPassCount: 4,
  },
  composition: {
    steps: ["先看总数是多少", "看已经给了哪一部分", "找另一部分是多少", "合起来检查总数不变", "换一种分法再试", "当小老师讲一遍"],
    commonGaps: ["忘记总数", "只猜另一部分", "不会用合起来检查"],
    targetPassCount: 4,
  },
  ordinal: {
    steps: ["先确定从哪边开始数", "找到第几个的位置", "只数前面或后面那一边", "说清第几个是位置", "换方向再试", "当小老师讲一遍"],
    commonGaps: ["方向看反", "把第几个当成总数", "前面后面没分清"],
    targetPassCount: 4,
  },
  pattern: {
    steps: ["先看相邻两个怎么变", "说出每次多几或少几", "按同样规律补下一个", "说一说发现的规律", "换一组数再试", "当小老师讲一遍"],
    commonGaps: ["只看最后一个数", "规律说不清", "换一组就不会接"],
    targetPassCount: 4,
  },
  calculation: {
    steps: ["先看符号和数位", "选择小方法：数一数、凑十、破十、口诀或笔算", "只算当前小步", "说出中间结果", "检查有没有进位或退位", "换一道同方法题再试", "当小老师讲一遍"],
    commonGaps: ["看错加减乘除", "不知道该用数一数、凑十、破十、口诀还是笔算", "口算滑错", "满十不进一或不够不借一", "只说结果不说方法"],
    targetPassCount: 4,
  },
  concreteAddition: {
    steps: ["先看第一部分有几个", "再看又来或另一部分有几个", "把两部分合起来", "说出一共有多少", "说清加法表示合起来", "换一道生活题再试", "当小老师讲一遍"],
    commonGaps: ["不知道加法表示合起来", "只盯着一个数", "不会用图或手指数合起来"],
    targetPassCount: 4,
  },
  concreteSubtraction: {
    steps: ["先看原来有几个", "看拿走或少了几个", "把拿走的去掉", "数还剩几个", "说清减法表示去掉后剩下", "换一道生活题再试", "当小老师讲一遍"],
    commonGaps: ["不知道减法表示拿走或少了", "把原来和拿走混在一起", "只背答案不理解还剩"],
    targetPassCount: 4,
  },
  makeTenAdd: {
    steps: ["先看哪个数快到10", "找还差几到10", "把另一个数拆成两部分", "先凑成10", "再加剩下的数", "换一道9加几或8加几再试", "当小老师讲一遍"],
    commonGaps: ["不知道为什么要凑十", "不会把另一个数拆成合适的两部分", "凑成10后忘记加剩下的数"],
    targetPassCount: 4,
  },
  breakTenSubtract: {
    steps: ["先看个位够不够减", "把十几拆成10和几", "先用10去减", "把剩下的几加回来", "也可以想几加减数等于被减数", "换一道十几减几再试", "当小老师讲一遍"],
    commonGaps: ["不知道个位不够减要破十", "拆成10和几后忘记加回个位", "只会背结果不会说过程"],
    targetPassCount: 4,
  },
  mixedCalculation: {
    steps: ["先看有几步和哪些运算", "有括号先算括号", "有乘除和加减混在一起时先算乘除", "只有同级运算才从左往右", "记住中间结果再算下一步", "换一道同规则题再试", "当小老师讲一遍"],
    commonGaps: ["跳着算", "有乘除时没有先算乘除", "忘记中间结果", "把一步答案当最终答案", "把所有题都误当成从左往右"],
    targetPassCount: 4,
  },
  application: {
    steps: ["先看题目问什么", "找有用条件", "说清故事动作：合起来、拿走、相差、同样多或平均分", "把故事动作变成算式", "算出结果并带单位", "换一道生活题再试", "当小老师讲一遍"],
    commonGaps: ["没看清问题", "把条件全拿来乱算", "不会把故事动作说成关系句", "知道答案但说不清为什么这样算"],
    targetPassCount: 4,
  },
  multiplication: {
    steps: ["先看每组有几个", "再数一共有几组", "说成几个几", "列乘法或用口诀", "说清为什么能用乘法", "换一种排列再试", "当小老师讲一遍"],
    commonGaps: ["组数和每组个数说反", "把几个几和总数混在一起", "只背口诀不懂意思"],
    targetPassCount: 4,
  },
  division: {
    steps: ["先看是不是平均分", "看总数是多少", "看分成几份或每份几个", "看题目问每份数还是份数", "说出结果", "换一道平均分题再试", "当小老师讲一遍"],
    commonGaps: ["没有先确认平均分", "总数、份数、每份数混淆", "只写答案不说平均分意思"],
    targetPassCount: 4,
  },
  time: {
    steps: ["先看短针时针", "再看长针分针", "合起来读时间", "说清先看时再看分", "换一个钟面再试", "当小老师讲一遍"],
    commonGaps: ["时针分针看反", "半时和整时混淆", "读时间不完整"],
    targetPassCount: 4,
  },
  measure: {
    steps: ["先看量的是长度还是质量", "选厘米、米、克或千克", "尺子题先找0刻度或起点", "换算题先说单位关系", "读数或计算", "带单位检查", "换一道同单位题再试"],
    commonGaps: ["单位选错", "量长度没从0开始", "厘米米混淆", "克千克混淆", "换算时少带单位"],
    targetPassCount: 4,
  },
  placeValue: {
    steps: ["先看最高位", "按数位一个一个看", "读写或拆成几个千百十一", "说清数位不同大小不同", "换一个数再试", "当小老师讲一遍"],
    commonGaps: ["0的读写不稳", "数位看错", "只读数字不说位值"],
    targetPassCount: 4,
  },
  shape: {
    steps: ["先判断是平面、立体还是图形运动", "平面图形看边和角", "立体图形看面和能不能滚", "平移看是不是直直移动", "旋转看是不是绕点转", "说一个判断依据", "换方向或生活物体再试"],
    commonGaps: ["只看像不像", "边角面特征说不出", "平面图形和立体图形混淆", "平移和旋转混淆"],
    targetPassCount: 4,
  },
  data: {
    steps: ["先看按什么标准分类", "读表中对应的一行或一列", "读出每类数量", "根据问题判断求一共、最多最少还是相差", "一共就合起来，相差就大数减小数", "说清从哪里看出来", "换一张表再试"],
    commonGaps: ["看错行列", "分类标准不清", "相差题用了加法", "一共题漏掉一类", "只报答案不说从哪里看"],
    targetPassCount: 4,
  },
  logic: {
    steps: ["先记住已知条件", "划掉不可能的情况", "看剩下谁可能", "再检查每个条件", "说一说排除理由", "换一道推理题再试", "当小老师讲一遍"],
    commonGaps: ["只猜不排除", "漏掉一个条件", "可能和一定混淆"],
    targetPassCount: 4,
  },
  generic: {
    steps: ["先读懂题目问什么", "只做当前小台阶", "说出答案", "说一说为什么", "换一道同类题再试", "当小老师讲一遍"],
    commonGaps: ["看错题目意思", "中间步骤丢失", "只报答案不说原因"],
    targetPassCount: 4,
  },
  };
}

function createTeachingProfileForPoint(point, primaryQuestion, familyOverride = "") {
  const overlay = getKnowledgePointOverlay(point) || point?.teachingOverlay || null;
  const family = overlay?.family || familyOverride || inferTeachingFamily(point, primaryQuestion);
  const teachingStandards = getTeachingStandards();
  const standard = teachingStandards[family] || teachingStandards.generic;
  const strategy = getTeachingStrategy(family) || {};
  const sourceSteps = normalizeTextList(point.substeps || point.microSteps, []);
  const selectedSourceSteps = sourceSteps
    .filter((step) => !/换个例子|换一道|当小老师|讲一遍|复述/.test(step))
    .slice(0, 3);
  const overlaySteps = normalizeTextList(overlay?.microSteps || overlay?.substeps, []);
  const substeps = uniqueKeywords([
    ...overlaySteps,
    ...standard.steps,
    ...selectedSourceSteps,
  ]).slice(0, 7);

  return {
    family,
    microSteps: substeps.slice(0, 5),
    substeps,
    commonGaps: uniqueKeywords([...(point.commonGaps || []), ...(overlay?.commonGaps || []), ...(overlay?.diagnostics || []), ...(standard.commonGaps || []), ...(strategy.diagnostics || [])]).slice(0, 10),
    masterySignals: uniqueKeywords([...(overlay?.masterySignals || []), ...(strategy.masterySignals || []), ...getStandardMasterySignals()]).slice(0, 10),
    teachingMethods: uniqueKeywords([...(overlay?.teachingMethods || []), ...(strategy.teachingMethods || [])]),
    variationRules: uniqueKeywords([...(overlay?.variationRules || []), ...(strategy.variants || [])]),
    teacherMoves: normalizeTextList(overlay?.teacherMoves, []),
    targetPassCount: overlay?.targetPassCount || standard.targetPassCount || 4,
    teachingGoal: overlay?.teachingGoal || "",
    initialContext: overlay?.initialContext || `${point.title || point.node || "这个知识点"}按小台阶学：先会做，再会说为什么。`,
  };
}

function inferTeachingFamily(point, question) {
  return inferQuestionTeachingFamily(point, question);
}

function inferQuestionTeachingFamily(point, question) {
  const questionText = normalizeText(`${question?.type || ""} ${question?.prompt || ""} ${question?.explanation || ""} ${question?.answer || ""}`);
  const pointText = normalizeText(`${point?.title || ""} ${point?.node || ""} ${point?.lesson || ""}`);
  const text = `${questionText} ${pointText}`;
  const visualType = point?.visualType || "";
  const expression = parseTeachingArithmeticExpression(question);
  const overlayFamily = getKnowledgePointFamily(point);
  const operatorCount = countQuestionArithmeticOperators(questionText);

  if (/经过.*时间|从.*开始.*结束|到.*结束|多长时间/.test(text)) return "timeDuration";
  if (/钟|时间|时针|分针|几时|半时|[0-9一二三四五六七八九十]+分/.test(text) && !/元|角|人民币|纸币|硬币/.test(text)) return "time";
  if (/分类|统计|读表|记录表|表格|象形统计图|条形统计|最多|最少/.test(text)) return "data";
  if (/推理|排除|不是|可能|一定/.test(text)) return "logic";
  if (/观察物体|正面|侧面|上面|从.*看|看到的是/.test(text)) return "observation";
  if (/图形|长方体|正方体|圆柱|球|长方形|正方形|三角形|圆|对称|平移|旋转|轴对称/.test(text)) return "shape";
  if (/角的|直角|锐角|钝角|顶点|两条边|张开/.test(text)) return "angle";
  if (/分成|组成|合起来检查/.test(text) && !hasMoneyTerm(text)) return "composition";
  if (isMoneyApplicationText(text) && !isMoneyUnitConversionText(questionText)) return "moneyApplication";
  if (/元|角|人民币|钱|纸币|硬币/.test(text)) return "money";
  if (/有余数|余数|……|\.\.\./.test(text)) {
    if (/至少|最多|船|车|盒|箱|装|坐|租|买票|够不够|进一|去尾/.test(text)) return "remainderApplication";
    return "remainderDivision";
  }
  if (/进一法|去尾法|至少需要|最多可以|每条船|每辆车|每盒|每箱/.test(text)) return "remainderApplication";
  if (/搭配|排列|组合|不同搭配|多少种|路线/.test(text)) return "arrangement";
  if (/比.*多多少|比.*少多少|多多少|少多少|相差/.test(text)) return "comparisonDifference";
  if (/第几个|第\s*\d+|前面|后面|从左|从右/.test(questionText)) return "ordinal";
  if (/比较|大小|大于|小于|等于|符号/.test(text) || /[□_]\s*[0-9一二三四五六七八九十百]/.test(questionText) || /[0-9一二三四五六七八九十百]\s*[□_]/.test(questionText)) return "compare";
  if (operatorCount >= 2 || parseArithmeticChain(questionText) || ((/连加|连减|加减混合|混合运算|乘加|乘减|小括号/.test(text)) && operatorCount >= 1)) return "mixedCalculation";
  if (/凑十|进位|9加|8加|7加|6加/.test(text) || isMakeTenAdditionExpression(expression)) return "makeTenAdd";
  if (/破十|退位|十几减|想加算减|借十/.test(text) || isBreakTenSubtractionExpression(expression)) return "breakTenSubtract";
  if (/乘法|几个几|同样多|口诀|×/.test(text)) return "multiplication";
  if (/除法|平均分|每份|求商|÷/.test(text)) return "division";
  if (/拿走|去掉|还剩|飞走|用去|少了/.test(text) || isConcreteSubtractionExpression(expression, text)) return "concreteSubtraction";
  if (/合起来|一共|又来|又有|加起来/.test(text) || isConcreteAdditionExpression(expression, text)) return "concreteAddition";
  if (/数一数|一共有几个|一共有多少个|总数/.test(questionText)) return "count";
  if (/规律|接着填/.test(text)) return "pattern";
  if (/厘米|米|克|千克|角的|量|长度|质量/.test(text)) return "measure";
  if (/数位|读作|写作|个千|个百|个十|个位|十位|百位|千位/.test(text)) return "placeValue";
  if (/一共|还剩|找回|付了|用去|飞走|应用题/.test(text)) return "application";
  if (/计算|加法|减法|口算|[+＋\-－×xX*÷/]/.test(text)) return "calculation";

  if (overlayFamily) return overlayFamily;
  if (visualType === "position") return "ordinal";
  if (visualType === "array") return "multiplication";
  if (visualType === "sharing") return "division";
  if (visualType === "clock" || visualType === "time") return "time";
  if (["ruler", "mass", "angle"].includes(visualType)) return "measure";
  if (visualType === "place-value") return "placeValue";
  if (visualType === "shape") return "shape";
  if (visualType === "data") return "data";
  if (visualType === "logic") return "logic";
  if (visualType === "count") return "count";
  if (visualType === "compare") return "compare";
  return "generic";
}

function parseTeachingArithmeticExpression(question) {
  return (
    parseArithmeticExpression(question?.prompt || "") ||
    parseArithmeticExpression(question?.explanation || "") ||
    parseArithmeticExpression(question?.answer || "")
  );
}

function countQuestionArithmeticOperators(text) {
  const normalized = String(text || "").replace(/[年月日时分秒]/g, "");
  return (normalized.match(/[+＋\-－×xX*÷/]/g) || []).length;
}

function isMakeTenAdditionExpression(expression) {
  return (
    expression?.operator === "+" &&
    expression.left > 0 &&
    expression.right > 0 &&
    expression.left < 10 &&
    expression.right < 10 &&
    expression.result > 10
  );
}

function isBreakTenSubtractionExpression(expression) {
  return (
    expression?.operator === "-" &&
    expression.left > 10 &&
    expression.left < 20 &&
    expression.right > 0 &&
    expression.right < 10 &&
    expression.left % 10 < expression.right
  );
}

function isMoneyApplicationText(text = "") {
  const value = normalizeText(text);
  return hasMoneyTerm(value) && /购物|买|卖|价格|价钱|付了|付出|应找|找回|找零|花了|便宜|贵|还剩/.test(value);
}

function isMoneyUnitConversionText(text = "") {
  const value = normalizeText(text);
  return (
    /换成|换算|等于多少(元|角|分)|=|＝/.test(value) &&
    hasMoneyTerm(value) &&
    !/付了|应找|找回|找零|买|购物|价格|价钱/.test(value)
  );
}

function isConcreteSubtractionExpression(expression, text = "") {
  return (
    expression?.operator === "-" &&
    expression.left <= 10 &&
    !/退位|破十|十几减/.test(text)
  );
}

function isConcreteAdditionExpression(expression, text = "") {
  return (
    expression?.operator === "+" &&
    expression.result <= 10 &&
    !/进位|凑十/.test(text)
  );
}

function stableTextHash(text) {
  return String(text || "").split("").reduce((sum, char) => (sum + char.charCodeAt(0)) % 997, 0);
}

function pickNaturalVariant(options, key = "") {
  const list = Array.isArray(options) ? options.filter(Boolean) : [];
  if (!list.length) return "";
  return list[stableTextHash(key) % list.length];
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

function createInitialGuidedMessage(point, primaryQuestion, microSteps) {
  const prompt = childFacingPrompt(primaryQuestion?.prompt || point.description || "");
  const family = inferQuestionTeachingFamily(point, primaryQuestion);
  const starter = createGuidedStepPlan(
    {
      id: questionBankLessonAliases[point.id] || point.id?.toLowerCase?.() || "",
      node: point.node || point.title || "",
      lesson: point.lesson || point.title || "",
      visualType: point.visualType || "generic",
      activeQuestion: primaryQuestion,
      activeQuestionFamily: family,
      sourceQuestionFamily: family,
      microSteps,
      substeps: point.substeps || microSteps,
    },
    0,
  );
  return createNaturalInitialMessage(point, prompt, starter, family);
}

function createNaturalInitialMessage(point, prompt, starter, family) {
  const title = point?.title || point?.node || "这个知识点";
  const firstStep = formatChildStepPrompt(starter);
  const key = `${title}|${prompt}|${family}|${starter?.label || ""}`;
  const lead = pickNaturalVariant(createFocusedOpeningLeads(family, title), `${key}|focused-opening`);
  return createFocusedGuidedMessage({
    lead,
    prompt,
    starter,
    family,
    key,
    mode: "initial",
  });
  const openings = {
    makeTenAdd: [
      `这题先不急着报答案，我们用“凑十”来想。看这题：${prompt} ${firstStep}`,
      `遇到快超过10的加法，可以先凑成10。先看：${prompt} ${firstStep}`,
      `老师带你用一个省力办法，先把一个数凑到10。题目是：${prompt} ${firstStep}`,
    ],
    breakTenSubtract: [
      `这题如果个位不够减，就用“破十”。先看：${prompt} ${firstStep}`,
      `十几减几不要硬背，先把十几拆成10和几。题目是：${prompt} ${firstStep}`,
      `我们用破十法慢慢来。看这题：${prompt} ${firstStep}`,
    ],
    concreteSubtraction: [
      `减法可以想成“拿走以后还剩”。看这题：${prompt} ${firstStep}`,
      `这题先别急着算，先看原来有多少、少了多少。${prompt} ${firstStep}`,
      `我们把这题当成一个小故事来看：${prompt} ${firstStep}`,
    ],
    concreteAddition: [
      `加法可以想成“合起来”。看这题：${prompt} ${firstStep}`,
      `这题先看两部分，再合起来。题目是：${prompt} ${firstStep}`,
      `我们用合起来的方法试试：${prompt} ${firstStep}`,
    ],
    mixedCalculation: [
      `混合运算先看顺序，别一口气算完。看这题：${prompt} ${firstStep}`,
      `有乘除和加减混在一起时，要先找乘除；只有同级才从左往右。题目是：${prompt} ${firstStep}`,
      `我们先判断第一步该算哪里，再慢慢算。${prompt} ${firstStep}`,
    ],
    calculation: [
      `这题先别抢答案，按小方法来会更稳。看这题：${prompt} ${firstStep}`,
      `老师不只看答案，也想看你怎么想。题目是：${prompt} ${firstStep}`,
      `我们先把算式拆成一个小动作。${prompt} ${firstStep}`,
    ],
    application: [
      `应用题先看“问什么”，别急着把数字乱加。看这题：${prompt} ${firstStep}`,
      `这类题先读成一个小故事。题目是：${prompt} ${firstStep}`,
      `我们先找题目要我们求什么。${prompt} ${firstStep}`,
    ],
    compare: [
      `比大小先别看符号，先看两边。题目是：${prompt} ${firstStep}`,
      `这题像天平一样，先看左边和右边谁多。${prompt} ${firstStep}`,
      `我们先只比较两边，不急着填符号。${prompt} ${firstStep}`,
    ],
    count: [
      `数数最怕漏掉或重复，我们先按顺序来。${prompt} ${firstStep}`,
      `这题先不用算，只要会数清楚。${prompt} ${firstStep}`,
      `把眼睛当小手指，一个一个点着数。${prompt} ${firstStep}`,
    ],
    composition: [
      `分与合先记住总数，再找另一部分。${prompt} ${firstStep}`,
      `这题像把积木分成两堆。${prompt} ${firstStep}`,
      `我们先看总数，再看已经给了哪一部分。${prompt} ${firstStep}`,
    ],
    ordinal: [
      `第几个是“位置”，不是总数。先看方向。${prompt} ${firstStep}`,
      `这题要先定从哪边数，不然容易反。${prompt} ${firstStep}`,
      `我们先找起点，再找第几个。${prompt} ${firstStep}`,
    ],
    pattern: [
      `找规律不要只看最后一个数，先看每次怎么变。${prompt} ${firstStep}`,
      `这题像小火车，每节车厢都按同样规则走。${prompt} ${firstStep}`,
      `先找相邻两个之间的变化。${prompt} ${firstStep}`,
    ],
    multiplication: [
      `乘法不是只背口诀，先看“几个几”。${prompt} ${firstStep}`,
      `这题先找每组有几个，再找有几组。${prompt} ${firstStep}`,
      `我们先把它说成几个几，再算。${prompt} ${firstStep}`,
    ],
    division: [
      `平均分先看每份是不是一样多。${prompt} ${firstStep}`,
      `这题先别急着除，先看怎么分才公平。${prompt} ${firstStep}`,
      `我们先把“平均分”的意思说清楚。${prompt} ${firstStep}`,
    ],
    placeValue: [
      `数位题先看每个数字站在哪一位。${prompt} ${firstStep}`,
      `同一个数字站的位置不同，表示的大小也不同。${prompt} ${firstStep}`,
      `我们先从高位看，再一位一位说。${prompt} ${firstStep}`,
    ],
    time: [
      `钟面题先看短针，再看长针。${prompt} ${firstStep}`,
      `时间不用猜，先找时针，再找分针。${prompt} ${firstStep}`,
      `我们先把两根针分清楚。${prompt} ${firstStep}`,
    ],
    measure: [
      `单位题先看量的是什么，再选合适单位。${prompt} ${firstStep}`,
      `这题先别只看数字，先看单位。${prompt} ${firstStep}`,
      `我们先把单位看稳，再回答。${prompt} ${firstStep}`,
    ],
    shape: [
      `图形题先看特征，不只看像不像。${prompt} ${firstStep}`,
      `我们先找边、角、面这些线索。${prompt} ${firstStep}`,
      `先说你看到了什么特征，再说名字。${prompt} ${firstStep}`,
    ],
    data: [
      `统计题先看表格，不急着猜答案。${prompt} ${firstStep}`,
      `我们先找对应的那一行或那一列。${prompt} ${firstStep}`,
      `这题先看清分类标准。${prompt} ${firstStep}`,
    ],
    logic: [
      `推理题不能靠猜，先看已知条件。${prompt} ${firstStep}`,
      `这题像侦探游戏，先排除不可能的。${prompt} ${firstStep}`,
      `我们先看已经确定的线索。${prompt} ${firstStep}`,
    ],
  };
  const fallback = [
    `今天先学「${title}」。看这题：${prompt} ${firstStep}`,
    `我们从一道小题开始，不用一次说完。${prompt} ${firstStep}`,
    `先看一个小地方就行。题目是：${prompt} ${firstStep}`,
  ];
  return pickNaturalVariant(openings[family] || fallback, key);
}

function createFocusedOpeningLeads(family, title = "这个知识点") {
  const byFamily = {
    makeTenAdd: ["这题我们用凑十法，不急着报答案。", "加法先找能不能凑成10。", "老师带你用凑十来想。"],
    breakTenSubtract: ["这题用破十法会更稳。", "退位减先看个位够不够。", "十几减几先不硬减。"],
    concreteSubtraction: ["这是一个拿走后还剩的故事。", "减法题先看原来和拿走。", "先把故事里的动作看清楚。"],
    concreteAddition: ["这是一个合起来的故事。", "加法题先看两部分。", "我们先找哪两部分要合起来。"],
    mixedCalculation: ["这题要先看运算顺序。", "混合运算别一口气算完。", "先判断第一步该算哪里。"],
    calculation: ["这题先选方法，再算。", "计算题不用抢答案。", "我们把算式拆成小动作。"],
    application: ["应用题先读懂问什么。", "生活题先别乱加数字。", "先把故事关系看清楚。"],
    compare: ["比较题先不急着填符号。", "先看两边谁多谁少。", "比大小先把左右看清。"],
    count: ["数数先防止漏掉或重复。", "这题先按顺序点着数。", "先看清要数谁。"],
    composition: ["分与合先看总数。", "这题先想两部分怎么合起来。", "先把总数和一部分看清。"],
    ordinal: ["位置题先定方向。", "第几个说的是位置，不是总数。", "先看从哪边开始数。"],
    pattern: ["找规律先看变化。", "规律题不要只盯最后一个空。", "先找相邻两个怎么变。"],
    multiplication: ["乘法先看几个几。", "口诀先放一放，先看每组。", "先找每组几个和有几组。"],
    division: ["除法先看是不是平均分。", "平均分先看每份一样多吗。", "先把总数和分法看清。"],
    placeValue: ["数位题先看数字站在哪一位。", "十位个位先分清。", "先看这个数由几个十和几个一组成。"],
    time: ["钟面题先看短针，再看长针。", "时间题先分清两根针。", "先看一根针，再看另一根。"],
    measure: ["单位题先看量的是什么。", "测量题先看单位和起点。", "先别只看数字，先看单位。"],
    shape: ["图形题先看特征。", "先找边、角、面这些线索。", "不只看像不像，先看特点。"],
    data: ["统计题先读表。", "先找表格里的对应位置。", "先看分类标准。"],
    logic: ["推理题先看确定线索。", "先别猜，先排除不可能的。", "像小侦探一样先看条件。"],
  };
  return byFamily[family] || [`今天先学「${title}」。`, "我们从一个小问题开始。", "先看一个小地方就行。"];
}

function createVariantOpeningLeads(family) {
  const byFamily = {
    makeTenAdd: ["换个数，还是用凑十。", "题目变了，凑十方法不变。", "再用凑十试一题。"],
    breakTenSubtract: ["换一道退位减，还是先破十。", "数字变了，破十方法不变。", "再看一题，先判断够不够减。"],
    money: ["换个钱数，还是先看单位。", "人民币题换一下，单位关系不变。", "再用元角分关系试一次。"],
    moneyApplication: ["换个购物小场景，方法不变。", "再做一题找零，还是先看付钱和价钱。", "这次换个价钱，继续看单位。"],
    compare: ["换一组数，还是先看两边。", "再比一次，先不急着写符号。", "这题换了，比较方法不变。"],
    multiplication: ["换一个几个几，方法不变。", "再看一题，先找每组和组数。", "口诀前先看意思。"],
    division: ["换一道平均分，还是先看分得公平吗。", "再分一次，先看总数和分法。", "题目换了，平均分意思不变。"],
    time: ["换一个钟面，还是先短针再长针。", "再读一次时间，先看短针。", "钟面变了，看针的方法不变。"],
    data: ["换一张表，还是先找对应位置。", "再读一次统计图表。", "表格变了，读法不变。"],
  };
  return byFamily[family] || ["换个小变化，方法不变。", "再试一题，先看一个小问题。", "题目变了，我们还是一步一步来。"];
}

function createFocusedGuidedMessage({ lead, prompt, starter, family, key, mode = "initial" }) {
  const intro = ensureChineseSentence(lead || "");
  const context = createQuestionContextSentence(prompt, starter, family, mode);
  const step = createFocusedStepSentence(starter, family, key);
  return softenTeacherScaffoldText(`${intro}${context}${step}`.trim());
}

function createQuestionContextSentence(prompt, starter, family, mode = "initial") {
  const clean = cleanPromptForChildContext(prompt);
  if (!clean) return "";
  const stepText = normalizeText(`${starter?.label || ""} ${starter?.prompt || ""}`);
  if (family === "compare" && /符号|大于|小于|等号|哪边|左边|右边|两边/.test(stepText)) {
    const expression = extractCompareExpression(clean);
    if (expression) return `题目里有 ${expression}。先不用填符号。`;
  }
  if (mode === "variant") return `这次题目是：${clean}。不用马上做完整题。`;
  return `看这题：${clean}。不用马上做完整题。`;
}

function createFocusedStepSentence(starter, family, key = "") {
  const firstStep = formatChildStepPrompt(starter);
  if (!firstStep) return "现在只说一个小答案。";
  if (shouldModelBeforeAsking(starter)) return firstStep;
  const compact = firstStep
    .replace(/^看这题[:：]\s*/, "")
    .replace(/^题目是[:：]\s*/, "")
    .replace(/^先看[:：]\s*/, "先看")
    .replace(/先说一步就行[。.]?$/g, "")
    .replace(/先说一句就行[。.]?$/g, "")
    .trim();
  const openers = {
    compare: ["现在只回答这一小问：", "先回答这一点：", "这一轮只看这一步："],
    money: ["现在只说这一小步：", "先回答钱数里的这一点：", "这一轮只看单位这一步："],
    moneyApplication: ["现在只看购物题里的这一小步：", "先回答这一点：", "这一轮不算完整题，只看："],
    application: ["现在只找题目里的一个线索：", "先回答这一小问：", "这一轮只看："],
  };
  const prefix = pickNaturalVariant(openers[family] || ["现在只回答这一小问：", "先看这一小步：", "这一轮只说一个小答案："], `${key}|focused-step`);
  return ensureChineseSentence(`${prefix}${compact}`);
}

function cleanPromptForChildContext(prompt) {
  return String(prompt || "")
    .replace(/\s+/g, " ")
    .replace(/[？?。！!]+$/g, "")
    .replace(/在口里/g, "在□里")
    .replace(/口/g, "□")
    .trim();
}

function extractCompareExpression(text) {
  const normalized = String(text || "").replace(/\s+/g, "");
  const match = normalized.match(/([0-9一二两三四五六七八九十百]+)[□<>=＞＜]([0-9一二两三四五六七八九十百]+)/);
  if (!match) return "";
  return `${match[1]} □ ${match[2]}`;
}

function childFacingPrompt(prompt) {
  const tablePrompt = markdownTableToChildPrompt(prompt);
  const text = stripExercisePrefix(tablePrompt || prompt);
  if (!text) return "";
  const moneyKnownAnswer = text.match(/^填空[:：]\s*(.+?)=\s*\d+\s*(角|分)$/);
  if (moneyKnownAnswer) return `${moneyKnownAnswer[1]}等于多少${moneyKnownAnswer[2]}？`;
  const moneyKnownTwoAnswers = text.match(/^填空[:：]\s*(.+?)=\s*\d+\s*(角|分)=\s*\d+\s*(分)$/);
  if (moneyKnownTwoAnswers) return `${moneyKnownTwoAnswers[1]}等于多少${moneyKnownTwoAnswers[2]}，又等于多少${moneyKnownTwoAnswers[3]}？`;
  const moneyBlank = text.match(/^(.+?)=_{2,}\s*(角|分)$/);
  if (moneyBlank) return `${moneyBlank[1]}等于多少${moneyBlank[2]}？`;
  const moneyDoubleBlank = text.match(/^(.+?)=_{2,}\s*(角|分)=_{2,}\s*(分)$/);
  if (moneyDoubleBlank) return `${moneyDoubleBlank[1]}等于多少${moneyDoubleBlank[2]}，又等于多少${moneyDoubleBlank[3]}？`;
  return text
    .replace(/^填空[:：]\s*/, "")
    .replace(/_{2,}/g, "多少")
    .replace(/。+$/, "") + (/[？?]$/.test(text) ? "" : "？");
}

function stripExercisePrefix(prompt) {
  let text = String(prompt || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/。+$/, "");
  if (!text) return "";
  text = text
    .replace(/^计算[:：]\s*/, "")
    .replace(/^用凑十法计算[:：]\s*/, "")
    .replace(/^用破十法计算[:：]\s*/, "")
    .replace(/^口算[:：]\s*/, "")
    .replace(/^列式计算[:：]\s*/, "")
    .replace(/^利用乘法口诀求商[:：]\s*/, "想口诀：")
    .replace(/^比较大小[:：]\s*([0-9一二三四五六七八九十百千万]+)和([0-9一二三四五六七八九十百千万]+)，较大的数是多少，较小的数是多少[？?]?$/, "$1和$2，哪个大？哪个小")
    .replace(/^比较大小[:：]\s*([0-9一二三四五六七八九十百千万]+)和([0-9一二三四五六七八九十百千万]+)，较大的数是_{2,}，较小的数是_{2,}[。？?]?$/, "$1和$2，哪个大？哪个小")
    .replace(/^在□里填上合适的符号[:：]\s*(.+?)[？?]?$/, "$1，填什么符号")
    .replace(/多少……多少/g, "商是几，余数是几")
    .replace(/=多少/g, "等于多少");
  return text;
}

function markdownTableToChildPrompt(prompt) {
  const raw = String(prompt || "").trim();
  if (!raw.includes("|")) return "";
  const tableStart = raw.indexOf("|");
  const before = raw.slice(0, tableStart).replace(/[：:]\s*$/, "");
  const afterMatch = raw.match(/\|\s*([^|]+?)\s*\|\s*([0-9一二两三四五六七八九十百千万]+)\s*\|/g) || [];
  const rows = [];
  for (const row of afterMatch) {
    if (/---/.test(row) || /类别|数量|项目|票数/.test(row)) continue;
    const cells = row.split("|").map((cell) => cell.trim()).filter(Boolean);
    if (cells.length >= 2) rows.push(`${cells[0]}${cells[1]}个`);
  }
  const tail = raw
    .slice(raw.lastIndexOf("|") + 1)
    .replace(/^[\s|]+/, "")
    .trim();
  const spokenRows = rows.length ? rows.join("，") : "";
  const question = tail || raw.split(/\|\s*[0-9一二两三四五六七八九十百千万]+\s*\|/).pop() || "";
  return [before, spokenRows, question].filter(Boolean).join("。");
}

function createGuidedStepPlan(lesson, requestedStepIndex = 0) {
  const steps = createGuidedSteps(lesson);
  const index = Math.max(0, Math.min(Number(requestedStepIndex) || 0, steps.length - 1));
  return {
    ...steps[index],
    index,
    steps,
    totalSteps: steps.length,
    isFinal: Boolean(steps[index]?.isFinal || index === steps.length - 1),
  };
}

function selectVariantStartStepIndex(lesson) {
  const steps = createGuidedSteps(lesson);
  const passedCount = (state.passedQuestionIds || []).length;
  if (passedCount <= 0 || steps.length <= 2) return 0;

  const reasonIndex = steps.findIndex((step) => step.isReason);
  const lastTeachingIndex = reasonIndex > 0 ? reasonIndex - 1 : Math.max(0, steps.length - 2);
  if (lastTeachingIndex <= 0) return 0;

  if (passedCount === 1) {
    const middleIndex = Math.floor(steps.length / 2);
    return Math.max(1, Math.min(lastTeachingIndex, middleIndex));
  }

  return Math.max(1, lastTeachingIndex);
}

function createGuidedSteps(lesson) {
  let steps = createTypedGuidedSteps(lesson);
  if (!steps.length) steps = createGenericGuidedSteps(lesson);
  return standardizeGuidedStepsForChild(steps, lesson);
}

function standardizeGuidedStepsForChild(steps, lesson) {
  const normalized = (Array.isArray(steps) ? steps : [])
    .filter(Boolean)
    .map((step) => {
      const isReason =
        Boolean(step.isReason) ||
        (!step.keepAsStep && /原因|为什么|怎么想|怎么知道|怎么比较|怎么检查|说清|理由|方法/.test(`${step.label || ""}${step.prompt || ""}`));
      const repeatSentence = isReason
        ? step.repeatSentence || createTeacherRepeatSentenceForStep(lesson, step)
        : step.repeatSentence || "";
      const answerKeywords = uniqueKeywords((step.answerKeywords || []).concat(extractRepeatKeywords(repeatSentence)));
      const normalizedStep = {
        ...step,
        isReason,
        repeatSentence,
        answerKeywords,
        isFinal: false,
      };
      const scaffoldHint = createConceptScaffoldHint(lesson, normalizedStep);
      if (!normalizedStep.teacherHint || isThinTeacherHint(normalizedStep.teacherHint)) {
        normalizedStep.teacherHint = scaffoldHint || createTeacherHintForStep(lesson, normalizedStep);
      }
      return normalizedStep;
    });

  if (!normalized.length) {
    normalized.push(guidedStep("先看题目", "先说题目问什么。", ["题目", "问什么"]));
  }

  if (!normalized.some((step) => step.isReason)) {
    normalized.push(
      guidedStep("说一说方法", "把刚才的小方法说成一句话。", createReasonKeywordsForLesson(lesson), {
        isReason: true,
        repeatSentence: createTeacherRepeatSentenceForStep(lesson, {
          label: "说一说方法",
          prompt: "把刚才的小方法说成一句话。",
          answerKeywords: createReasonKeywordsForLesson(lesson),
        }),
      }),
    );
  }

  normalized[normalized.length - 1].isFinal = true;
  return normalized;
}

function createTeacherHintForStep(lesson, step) {
  if (step?.isReason) {
    const sentence = step?.repeatSentence || createTeacherRepeatSentenceForStep(lesson, step);
    return `这句比较难，老师先示范：${sentence}。你可以先学着说半句，再换成自己的话。`;
  }
  const scaffold = createConceptScaffoldHint(lesson, step);
  if (scaffold) return scaffold;
  const answer = pickChildFollowAnswer(step?.answerKeywords || []);
  if (answer) return `老师先把这一步讲清楚：先看题里的关键关系，再试着说「${answer}」。`;
  const topic = lesson?.node || lesson?.lesson || "这一小步";
  const prompt = String(step?.prompt || "").replace(/[。！？!?]*$/, "");
  if (prompt) return `老师把问题缩小一点：${prompt}。先说你看到了什么，再说答案。`;
  return `老师先带你看${topic}，先找题目里的一个线索，再回答。`;
}

function isThinTeacherHint(text) {
  const value = normalizeText(text);
  if (!value) return true;
  if (hasConcreteTeachingContent(value)) return false;
  if (value.length > 70 && /因为|所以|先.*再|表示|关系|单位|数位|凑十|破十|平均分|几个几/.test(value)) return false;
  return /老师先说|老师先算|老师先告诉|老师示范|你跟着|你只说|只说|你可以先说/.test(value);
}

function hasConcreteTeachingContent(value) {
  const text = normalizeText(value);
  if (!text) return false;
  if (/因为|所以|先.*再|表示|关系|单位|数位|凑十|破十|借十|退位|平均分|几个几|开口.*大|合起来|还剩|找回/.test(text)) return true;
  if (/[0-9一二两三四五六七八九十百]+(元|角|分|个|只|本|支|张|条|朵|厘米|米|克|千克).*(等于|是|换成)/.test(text)) return true;
  if (/(等于|是|换成).*[0-9一二两三四五六七八九十百]+(元|角|分|个|只|本|支|张|条|朵|厘米|米|克|千克)/.test(text)) return true;
  return false;
}

function createConceptScaffoldHint(lesson, step) {
  const question = lesson?.activeQuestion || null;
  const prompt = question?.prompt || lesson?.problem || "";
  const family = getPlanTeachingFamily(lesson, step);
  const expression = parseTeachingArithmeticExpression(question) || parseArithmeticExpression(prompt);
  const label = normalizeText(step?.label || "");
  const stepPrompt = normalizeText(step?.prompt || "");
  const answer = pickChildFollowAnswer(step?.answerKeywords || []);
  const sayAnswer = answer ? `你可以先说「${answer}」。` : "";

  if (family === "makeTenAdd" || isMakeTenAdditionExpression(expression)) {
    if (isMakeTenAdditionExpression(expression)) {
      const base = expression.left >= expression.right ? expression.left : expression.right;
      const addend = expression.left >= expression.right ? expression.right : expression.left;
      const gap = 10 - base;
      const remain = addend - gap;
      if (label.includes("找快到10")) return `${base}离10最近，凑十法先照顾这个数。${sayAnswer || `你先说「${base}」。`}`;
      if (label.includes("还差")) return `${base}还差${gap}到10。先把“差几”说出来，再拆另一个数。${sayAnswer || `你先说「差${gap}」。`}`;
      if (label.includes("拆")) return `为了补到10，要从${addend}里面先拿出${gap}，剩下${remain}。${sayAnswer || `你先说「${gap}和${remain}」。`}`;
      if (label.includes("凑成10")) return `${base}+${gap}先变成10，先凑出整十，后面就好算。${sayAnswer}`;
      if (label.includes("剩下")) return `已经有10了，再加刚才剩下的${remain}，就是最后答案。${sayAnswer}`;
    }
    return `凑十法不是直接背答案，是先把一个数补成10，再加剩下的数。${sayAnswer}`;
  }

  if (family === "breakTenSubtract" || isBreakTenSubtractionExpression(expression)) {
    if (isBreakTenSubtractionExpression(expression)) {
      const ones = expression.left - 10;
      const tenMinus = 10 - expression.right;
      if (label.includes("够不够")) return `${expression.left}个位上是${ones}，${ones}比${expression.right}小，所以个位不够减，要破十。${sayAnswer || "你先说「不够」。"}`;
      if (label.includes("拆成10")) return `${expression.left}里面可以拆出一个10，还剩${ones}。破十就是先把十几拆开。${sayAnswer || `你先说「10和${ones}」。`}`;
      if (label.includes("10减") || label.includes("用10减")) return `先用10来减${expression.right}，10-${expression.right}=${tenMinus}。这一步算小了，比较容易。${sayAnswer}`;
      if (label.includes("加回")) return `别忘了原来个位上的${ones}还在，要把它加回来。${sayAnswer}`;
    }
    return `破十法先看个位够不够减；不够时，把十几拆成10和几，用10先减，再加回个位。${sayAnswer}`;
  }

  if (family === "concreteSubtraction") {
    return `减法先不要背“减法”两个字，先看故事：原来有多少，拿走或少了多少，剩下多少。${sayAnswer}`;
  }

  if (family === "concreteAddition") {
    return `加法先看两部分：一部分是多少，另一部分是多少，合起来才是一共。${sayAnswer}`;
  }

  if (family === "moneyApplication") {
    const moneyStory = parseMoneyApplicationQuestion(prompt, question?.explanation || "");
    if (moneyStory?.kind === "change") {
      if (label.includes("问什么")) return `这类题先看最后一句：“应找回多少钱”。找回就是付的钱里没花掉的部分。${sayAnswer || "你可以先说「找回多少钱」。"}`;
      if (label.includes("统一单位")) return `价格有元也有角，不能直接用3减2。先都换成角，才好比较和相减。${sayAnswer || "你可以先说「先换成角」。"}`;
      if (label.includes("付的钱")) return `${moneyStory.pay.text}是付出去的钱，换成角是${moneyStory.pay.jiao}角。${sayAnswer || `你可以先说「${moneyStory.pay.jiao}角」。`}`;
      if (label.includes("价格")) return `${moneyStory.price.text}是东西的价钱，换成角是${moneyStory.price.jiao}角。${sayAnswer || `你可以先说「${moneyStory.price.jiao}角」。`}`;
      if (label.includes("找回")) return `找回的钱=付的钱-价钱，所以用${moneyStory.pay.jiao}角减${moneyStory.price.jiao}角。${sayAnswer || `你可以先说「${moneyStory.answerJiao}角」。`}`;
    }
    return `购物题先看“买了什么、付了多少、问找回还是一共”。有元有角时，先换成同一种单位再算。${sayAnswer}`;
  }

  if (family === "application") {
    const relation = inferApplicationRelation(prompt, question?.explanation || "");
    const numbers = extractNumbers(prompt).slice(0, 3);
    const numberText = numbers.length ? `题里有用的数先看${numbers.join("和")}。` : "";
    const methodText = relation.operation
      ? `题目问${relation.childChoice || relation.intent}，通常要用${relation.operation}来想。`
      : "先看题目问“一共、还剩、找回、每份”哪一种。";
    return `${numberText}${methodText}${sayAnswer}`;
  }

  if (family === "calculation" && expression) {
    if (expression.operator === "+") return `加法先想“合起来”或“接着数”。从较大的数开始接着数，会比从1重新数更省力。${sayAnswer}`;
    if (expression.operator === "-") return `减法先想“去掉后还剩”，小数可以倒着数，大一点的数要看个位十位。${sayAnswer}`;
  }

  const strategyHint = createStrategyScaffoldHint(lesson, step, family, question, expression, answer);
  if (strategyHint) return strategyHint;

  if (family === "money") return `人民币换算先看单位。元、角、分不是同一种单位，要先换成同一种单位再算。${sayAnswer}`;
  if (family === "compare") return `比较大小先看两边，不急着写符号。谁大就朝谁开口，一样大就用等号。${sayAnswer}`;
  if (family === "count") return `数数要“一物一数”：一个物体配一个数，数过可以做记号，最后一个数就是总数。${sayAnswer}`;
  if (family === "composition") return `分与合先看总数，总数不变；已经知道一部分，就想还差几能合回总数。${sayAnswer}`;
  if (family === "ordinal") return `第几个先定方向：从左还是从右。第几个说的是位置，不是一共有几个。${sayAnswer}`;
  if (family === "pattern") return `找规律先看相邻两个怎么变，不要只盯最后一个空。变化一样，后面就按同样方法接。${sayAnswer}`;
  if (family === "multiplication") {
    const group = parseMultiplicationStructure(`${prompt} ${question?.explanation || ""}`);
    if (group) {
      if (label.includes("每组")) return `先看一组里有几个，一组就是重复出现的一份。这里每组是${group.each}个。${sayAnswer || `你可以先说「${group.each}个」。`}`;
      if (label.includes("几组")) return `再看这样的组重复了几次。这里有${group.groups}组。${sayAnswer || `你可以先说「${group.groups}组」。`}`;
      if (label.includes("几个几")) return `每组${group.each}个，有${group.groups}组，就是${group.groups}个${group.each}。这才是乘法的意思。${sayAnswer}`;
    }
    return `乘法先说“几个几”：每组同样多，才可以用乘法或口诀。${sayAnswer}`;
  }
  if (family === "division") return `除法先看是不是平均分：每份一样多，才叫平均分。先分公平，再说每份几个或分成几份。${sayAnswer}`;
  if (family === "time") return `钟面先看短针定几时，再看长针定几分。先看短针，再看长针走了几大格。${sayAnswer}`;
  if (family === "measure") return `单位题先看量的是什么：长度看厘米或米，重量看克或千克；测量时要对准0刻度，估计时想生活里的物体。${sayAnswer}`;
  if (family === "placeValue") return `数位题先看数字站在哪里：十位表示几个十，个位表示几个一；有0时也不能把位置丢掉。${sayAnswer}`;
  if (family === "shape") return `图形题先看特征：边、角、面、能不能滚，再说名字。${sayAnswer}`;
  if (family === "data") return `统计题先找表里的对应行列，再读数量；别凭感觉猜。${sayAnswer}`;
  if (family === "logic") return `推理题先把确定条件记住，再划掉不可能的，剩下的才是答案。${sayAnswer}`;

  return "";
}

function pickChildFollowAnswer(answerKeywords) {
  const blocked = new Set([
    "题目",
    "问什么",
    "因为",
    "所以",
    "先",
    "再",
    "问题",
    "答案",
    "方法",
    "原因",
    "单位",
    "左边",
    "右边",
    "两边",
    "一边",
    "大",
    "小",
    "数",
    "看",
    "找",
  ]);
  const candidates = normalizeTextList(answerKeywords, [])
    .flatMap((item) => String(item || "").split(/[，,、/；;]+/))
    .map((item) => {
      const value = item.trim();
      if (value === "<") return "小于号";
      if (value === ">") return "大于号";
      if (value === "=" || value === "＝") return "等号";
      return value;
    })
    .filter(Boolean)
    .filter((item) => item.length <= 12)
    .filter((item) => !blocked.has(normalizeText(item)))
    .filter((item) => !/^第?几个$/.test(item))
    .filter((item) => /[0-9零一二两三四五六七八九十百千万<>＝=+\-×÷元角分厘米米克千克个只本支张条朵面位人左右大小同加减乘除平均]|加法|减法|乘法|除法|大于|小于|等于|一样|相等|正方|长方|圆|球/.test(item));
  return candidates[0] || "";
}

function createTeacherRepeatSentenceForStep(lesson, step) {
  const question = lesson?.activeQuestion || null;
  const childSafeSentence = createChildSafeRepeatSentence(lesson, step, question);
  if (childSafeSentence) return childSafeSentence;
  const explanationSentence = createExplanationRepeatSentence(question?.explanation || "", lesson?.node || lesson?.lesson || "");
  const fallbackSentence = createReasonRepeatSentence(
    `${lesson?.node || ""}${lesson?.lesson || ""}${lesson?.visualType || ""}${step?.label || ""}`,
    `${step?.prompt || ""}${question?.prompt || ""}${question?.explanation || ""}`,
    step?.answerKeywords || [],
  );
  if (explanationSentence && !/^我先看题目/.test(explanationSentence)) return explanationSentence;
  return fallbackSentence;
}

function createChildSafeRepeatSentence(lesson, step, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const text = normalizeText(`${prompt} ${question?.explanation || ""} ${lesson?.node || ""} ${lesson?.lesson || ""} ${lesson?.visualType || ""} ${step?.label || ""}`);
  const numbers = extractNumbers(prompt);

  if (isCompareQuestion(question, lesson, text) && numbers.length >= 2) {
    const [left, right] = numbers;
    const symbol = getCompareSymbol(question?.answer || "");
    if (left === right || symbol === "=") return `${left}和${right}一样大，所以填等号。`;
    if (left < right || symbol === "<") return `${left}比${right}小，所以填小于号。`;
    if (left > right || symbol === ">") return `${left}比${right}大，所以填大于号。`;
  }

  const money = parseMoneyQuestion(question);
  if (money && (money.yuan || money.jiao || money.fen || money.sourceFen || money.isRelationQuestion)) {
    if (money.isRelationQuestion) return "1元等于10角，1角等于10分。";
    if (money.targetUnit === "角" && money.yuan && money.jiao) return `${money.yuan}元先换成${money.yuan * 10}角，再加${money.jiao}角。`;
    if (money.targetUnit === "角" && money.yuan) return `1元等于10角，所以${money.yuan}元等于${money.yuan * 10}角。`;
    if (money.targetUnit === "分" && money.jiao) return `1角等于10分，所以${money.jiao}角等于${money.jiao * 10}分。`;
  }

  const group = parseMultiplicationStructure(`${prompt} ${question?.explanation || ""}`);
  if (isMultiplicationQuestion(prompt, text, lesson) && group) {
    return `每组有${group.each}个，一共有${group.groups}组，所以是${group.groups}个${group.each}。`;
  }

  const expression = parseArithmeticExpression(`${prompt} ${question?.explanation || ""}`);
  if (expression) {
    if (isMakeTenAdditionExpression(expression)) {
      const base = expression.left >= expression.right ? expression.left : expression.right;
      const addend = expression.left >= expression.right ? expression.right : expression.left;
      const gap = 10 - base;
      const remain = addend - gap;
      return `${base}差${gap}到10，把${addend}拆成${gap}和${remain}，先凑成10，再加${remain}。`;
    }
    if (isBreakTenSubtractionExpression(expression)) {
      const ones = expression.left - 10;
      const tenMinus = 10 - expression.right;
      return `个位不够减，把${expression.left}拆成10和${ones}，先算10-${expression.right}=${tenMinus}，再加${ones}。`;
    }
    if (isConcreteSubtractionExpression(expression, text)) {
      return `从原来的${expression.left}里去掉${expression.right}，求还剩多少，所以用减法。`;
    }
    if (isConcreteAdditionExpression(expression, text)) {
      return `把${expression.left}和${expression.right}合起来，求一共有多少，所以用加法。`;
    }
    const operatorNames = { "+": "加", "-": "减", "×": "乘", "÷": "除以" };
    return `${expression.left}${operatorNames[expression.operator] || expression.operator}${expression.right}等于${expression.result}。`;
  }

  if (isPlaceValueQuestion(prompt, text, lesson)) return "先看数位，再看每个数位上是几。";
  if (isTimeQuestion(text, lesson)) return "先看时针，再看分针，合起来说时间。";
  if (isMeasureQuestion(text, lesson)) return "先看单位，再带着单位回答。";
  if (isShapeQuestion(text, lesson)) return "先说图形最明显的特征，再说它的名字。";
  if (isDataQuestion(text, lesson)) return "先看表里哪一行或哪一列，再读出数量。";

  return "";
}

function createReasonKeywordsForLesson(lesson) {
  const question = lesson?.activeQuestion || null;
  return uniqueKeywords([
    ...(lesson?.answer?.whyKeywords || []),
    ...(question?.answerKeywords || []),
    ...(lesson?.answer?.answerKeywords || []),
    ...extractKeyPhrases(question?.explanation || ""),
    "因为",
    "所以",
    "先",
    "再",
  ]);
}

function createMoneyGuidedSteps(lesson) {
  const question = lesson?.activeQuestion || { prompt: lesson?.problem, answer: lesson?.answer?.answerKeywords?.[0] || "" };
  const info = parseMoneyQuestion(question);
  if (!info) return [];

  if (info.isRelationQuestion) {
    return [
      guidedStep("知道 1 元=10 角", "先看1元能换成几个1角？", answerKeywordsForNumber(10, "角"), {
        teacherHint: "1元可以换成10个1角，所以1元等于10角。先说关键数：10角。",
      }),
      guidedStep("知道 1 元=100 分", "再想1元能换成多少分？", answerKeywordsForNumber(100, "分"), {
        teacherHint: "1元=10角，1角=10分，10个10分就是100分。先说：100分。",
      }),
      guidedStep("说清单位关系", "为什么1元会等于100分？", ["1角等于10分", "一角等于十分", "10个10分", "单位", "角和分"], {
        isReason: true,
        isFinal: true,
        repeatSentence: "因为1元等于10角，1角等于10分，所以1元等于100分。",
      }),
    ];
  }

  if (info.sourceFen > 0 && info.targetUnit === "角") {
    const result = Math.floor(info.sourceFen / 10);
    return [
      guidedStep("知道 10 分=1 角", "先看10分能换成几角？", answerKeywordsForNumber(1, "角"), {
        teacherHint: "10个1分合起来就是1角，所以10分等于1角。先说：1角。",
      }),
      guidedStep("按 10 分一组", `${info.sourceFen}分里有几个10分？`, answerKeywordsForNumber(result, ""), {
        teacherHint: `把${info.sourceFen}分按10分一组来看，有${result}组。先说：${result}个。`,
      }),
      guidedStep("说出结果", `所以${info.sourceFen}分等于几角？`, answerKeywordsForNumber(result, "角").concat(question.answerKeywords || []), {
        isFinal: true,
        teacherHint: `${info.sourceFen}分里有${result}个10分，所以等于${result}角。先说：${result}角。`,
      }),
    ];
  }

  if (info.targetUnit === "分" && (info.yuan > 0 || info.jiao > 0)) {
    const steps = [];
    if (info.yuan > 0) {
      steps.push(guidedStep("知道 1 元=100 分", "先看1元能换成多少分？", answerKeywordsForNumber(100, "分"), {
        teacherHint: "1元=10角，1角=10分，所以1元=100分。先说：100分。",
      }));
      steps.push(guidedStep(`把 ${info.yuan} 元换成分`, `这题里有${info.yuan}元，${info.yuan}元是几分？`, answerKeywordsForNumber(info.yuan * 100, "分"), {
        teacherHint: `1元是100分，${info.yuan}元就是${info.yuan}个100分，也就是${info.yuan * 100}分。`,
      }));
    }
    if (info.jiao > 0) {
      steps.push(guidedStep(`把 ${info.jiao} 角换成分`, `${info.jiao}角是几分？`, answerKeywordsForNumber(info.jiao * 10, "分"), {
        teacherHint: `1角是10分，${info.jiao}角就是${info.jiao}个10分，也就是${info.jiao * 10}分。`,
      }));
    }
    const total = info.yuan * 100 + info.jiao * 10 + info.fen;
    steps.push(guidedStep("合起来算总分", `最后合起来，一共是几分？`, answerKeywordsForNumber(total, "分").concat(question.answerKeywords || []), {
      teacherHint: `前面都换成分以后，再合起来就是${total}分。先说：${total}分。`,
    }));
    steps.push(
      guidedStep("说清为什么先换单位", "为什么要先换成同一种单位？", moneyReasonKeywords("分"), {
        isReason: true,
        isFinal: true,
        repeatSentence: "因为元、角、分不是同一种单位，所以要先都换成分。",
      }),
    );
    return steps;
  }

  if (info.targetUnit === "角" && info.yuan > 0) {
    const yuanAsJiao = info.yuan * 10;
    const total = yuanAsJiao + info.jiao;
    const steps = [
      guidedStep(`把 ${info.yuan} 元换成角`, `这题里有${info.yuan}元，${info.yuan}元是几角？`, answerKeywordsForNumber(yuanAsJiao, "角"), {
        teacherHint: `1元可以换成10个1角，所以1元等于10角。${info.yuan}元就是${info.yuan}个10角，也就是${yuanAsJiao}角。`,
      }),
    ];
    if (info.jiao > 0) {
      steps.push(guidedStep(`再加原来的 ${info.jiao} 角`, `再加原来的${info.jiao}角，一共是几角？`, answerKeywordsForNumber(total, "角").concat(question.answerKeywords || []), {
        teacherHint: `先把元换成${yuanAsJiao}角，再加原来的${info.jiao}角，一共是${total}角。`,
      }));
    } else {
      steps.push(guidedStep("说出结果", `所以${info.yuan}元等于几角？`, answerKeywordsForNumber(total, "角").concat(question.answerKeywords || []), {
        teacherHint: `${info.yuan}元就是${info.yuan}个10角，所以等于${total}角。先说：${total}角。`,
      }));
    }
    steps.push(
      guidedStep("说清为什么先换单位", "为什么要先把元换成角？", moneyReasonKeywords("角"), {
        isReason: true,
        isFinal: true,
        repeatSentence: "因为元和角不是同一种单位，所以要先把元换成角。",
      }),
    );
    return steps;
  }

  if (info.targetUnit === "分" && info.jiao > 0) {
    const total = info.jiao * 10 + info.fen;
    return [
      guidedStep("知道 1 角=10 分", "先看1角能换成几分？", answerKeywordsForNumber(10, "分"), {
        teacherHint: "1角可以换成10个1分，所以1角等于10分。先说：10分。",
      }),
      guidedStep(`把 ${info.jiao} 角换成分`, `${info.jiao}角是几分？`, answerKeywordsForNumber(info.jiao * 10, "分"), {
        teacherHint: `1角是10分，${info.jiao}角就是${info.jiao}个10分，也就是${info.jiao * 10}分。`,
      }),
      guidedStep("说出结果", `所以一共是几分？`, answerKeywordsForNumber(total, "分").concat(question.answerKeywords || []), {
        isFinal: true,
        teacherHint: `换成分以后，再合起来就是${total}分。先说：${total}分。`,
      }),
    ];
  }

  return [];
}

function createMoneyApplicationGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const story = parseMoneyApplicationQuestion(prompt, question?.explanation || "");
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);

  if (story?.kind === "change") {
    return [
      guidedStep("看问题问什么", "先看最后一句。题目要我们求什么钱？", ["找回", "找零", "剩下的钱", "应找"], {
        teacherHint: "找回的钱，就是付出去的钱里没有花掉的那一部分。你可以先说：找回多少钱。",
      }),
      guidedStep("找关系", "找回的钱是用付的钱减商品价格，还是用商品价格减付的钱？", ["付的钱减商品价格", "付的钱减价钱", "付的钱减去商品价格", "付的钱减", "减法", "剩下"], {
        teacherHint: "找回的钱是付出去以后剩下的钱，所以用付的钱减商品价格。",
      }),
      guidedStep("先统一单位", "元和角不能混着减。我们应该先换成什么单位？", ["单位不同", "先换成角", "换成同一种单位", "角"], {
        keepAsStep: true,
        teacherHint: "元和角不是同一种单位，不能直接减。先都换成角，算起来最清楚。",
      }),
      guidedStep("换付的钱", `${story.pay.text}换成角是多少角？`, answerKeywordsForNumber(story.pay.jiao, "角"), {
        teacherHint: `${story.pay.text}是付的钱。1元=10角，所以${story.pay.text}=${story.pay.jiao}角。`,
      }),
      guidedStep("换商品价格", `${story.price.text}换成角是多少角？`, answerKeywordsForNumber(story.price.jiao, "角"), {
        teacherHint: `${story.price.text}是商品价格。先换成${story.price.jiao}角，再和付的钱比较。`,
      }),
      guidedStep("算找回的钱", `${story.pay.jiao}角减${story.price.jiao}角，找回多少？`, answerKeywords.concat(jiaoAmountKeywords(story.answerJiao)), {
        teacherHint: `找回的钱=付的钱-商品价格，所以${story.pay.jiao}角-${story.price.jiao}角=${story.answerJiao}角。`,
      }),
      guidedStep("说清为什么", "为什么要先把元换成角？", ["单位不同", "同一种单位", "先换成角", "再相减"], {
        isReason: true,
        isFinal: true,
        repeatSentence: `因为元和角单位不同，先都换成角，再用${story.pay.jiao}角减${story.price.jiao}角，所以找回${formatJiaoAmount(story.answerJiao)}。`,
      }),
    ];
  }

  return createApplicationGuidedSteps(lesson, question);
}

function parseMoneyApplicationQuestion(prompt, explanation = "") {
  const text = String(prompt || "");
  if (!/找回|应找|找零/.test(text)) return null;
  const amounts = extractMoneyAmounts(text);
  if (amounts.length < 2) return null;
  const payWordIndex = Math.max(text.indexOf("付了"), text.indexOf("付出"), text.indexOf("给了"));
  const pay = payWordIndex >= 0
    ? amounts.find((amount) => amount.index >= payWordIndex) || amounts[amounts.length - 1]
    : amounts[amounts.length - 1];
  const price = amounts.find((amount) => amount !== pay && amount.index < pay.index) || amounts.find((amount) => amount !== pay);
  if (!pay || !price) return null;
  const answerJiao = Math.max(0, pay.jiao - price.jiao);
  return { kind: "change", pay, price, answerJiao };
}

function extractMoneyAmounts(text) {
  const amounts = [];
  const source = String(text || "");
  const pattern = /(\d+)\s*元(?:\s*(\d+)\s*角)?|(\d+)\s*角/g;
  let match;
  while ((match = pattern.exec(source))) {
    const yuan = Number(match[1] || 0);
    const jiao = Number(match[2] || match[3] || 0);
    const total = match[1] ? yuan * 10 + jiao : jiao;
    amounts.push({
      text: match[0].replace(/\s+/g, ""),
      yuan,
      jiao: total,
      index: match.index,
    });
  }
  return amounts;
}

function formatJiaoAmount(totalJiao) {
  const value = Number(totalJiao);
  if (!Number.isFinite(value)) return "";
  const yuan = Math.floor(value / 10);
  const jiao = value % 10;
  if (yuan && jiao) return `${yuan}元${jiao}角`;
  if (yuan) return `${yuan}元`;
  return `${jiao}角`;
}

function jiaoAmountKeywords(totalJiao) {
  const value = Number(totalJiao);
  if (!Number.isFinite(value)) return [];
  const yuan = Math.floor(value / 10);
  const jiao = value % 10;
  return uniqueKeywords([
    ...answerKeywordsForNumber(value, "角"),
    formatJiaoAmount(value),
    yuan ? `${yuan}元${jiao ? `${jiao}角` : ""}` : "",
    jiao ? `${jiao}角` : "",
  ]);
}

function createGenericGuidedSteps(lesson) {
  const question = lesson?.activeQuestion || null;
  const prompt = childFacingPrompt(question?.prompt || lesson?.problem || "");
  const answerKeywords = (question?.answerKeywords?.length ? question.answerKeywords : lesson?.answer?.answerKeywords) || [];
  const reasonKeywords = uniqueKeywords(
    ((lesson?.answer?.whyKeywords || []).concat(extractKeyPhrases(question?.explanation || "")))
      .filter((keyword) => !["因为", "所以", "先", "再", "最后"].includes(normalizeText(keyword))),
  );
  return [
    guidedStep("先找线索", `看这题：${prompt}。先说你看到的关键数或关键词。`, uniqueKeywords(answerKeywords.concat(extractKeyPhrases(prompt), ["关键数", "关键词", "题目问什么"])), {
      teacherHint: "如果不知道从哪开始，先读题目最后问什么，再圈出有用的数字。",
    }),
    guidedStep("想小方法", "先说你准备怎么做：数一数、画一画、合起来，还是去掉一部分？", answerKeywords.concat(["先", "再", "算", "画图", "数一数", "合起来", "去掉"]), {
      teacherHint: "不会马上算也没关系，先选一个方法。低年级题常用数一数、画一画、合起来、去掉一部分这些方法。",
    }),
    guidedStep("说一句原因", "再说一句：你为什么这样想？", reasonKeywords, {
      isReason: true,
      isFinal: true,
      repeatSentence: createExplanationRepeatSentence(question?.explanation || "", lesson?.node || ""),
    }),
  ];
}

function guidedStep(label, prompt, answerKeywords, options = {}) {
  const repeatSentence = options.repeatSentence || (options.isReason ? createReasonRepeatSentence(label, prompt, answerKeywords) : "");
  return {
    label,
    prompt,
    answerKeywords: uniqueKeywords((answerKeywords || []).concat(extractRepeatKeywords(repeatSentence))),
    isReason: Boolean(options.isReason),
    keepAsStep: Boolean(options.keepAsStep),
    isFinal: Boolean(options.isFinal),
    repeatSentence,
    bridgeMessage: options.bridgeMessage || "",
    teacherHint: options.teacherHint || "",
    followPrompt: options.followPrompt || "",
  };
}

function formatChildStepPrompt(plan) {
  const prompt = String(plan?.prompt || "").trim();
  if (!prompt) return "先说你看到的一个线索。";
  if (plan?.isReason) {
    return formatReasonChildPrompt(plan);
  }
  if (shouldModelBeforeAsking(plan)) return formatTeacherModelFirstPrompt(plan);
  if (/为什么|怎么想|怎么知道|怎么比较|怎么检查/.test(prompt)) return `${prompt} 先说一句就行。`;
  if (/先说|先答|先看|再答|最后|答案是多少|是多少|几/.test(prompt)) return prompt;
  return `${prompt} 先说一步就行。`;
}

function getReasonRepeatSentence(plan) {
  return String(plan?.repeatSentence || createReasonRepeatSentence(plan?.label, plan?.prompt, plan?.answerKeywords))
    .replace(/[。！？!?]+$/, "")
    .trim();
}

function formatReasonChildPrompt(plan) {
  const sentence = getReasonRepeatSentence(plan);
  if (!sentence) return "请只说一句原因。";
  return `先试着说一句原因。卡住的话，就照着这句说一遍：“${sentence}。”`;
}

function formatCompactStepPrompt(plan) {
  return formatChildStepPrompt(plan)
    .replace(/也可以用自己的话说。/g, "")
    .replace(/先说一步就行。/g, "说一步。")
    .replace(/先说一句就行。/g, "说一句。")
    .trim();
}

function shouldModelBeforeAsking(plan) {
  if (!plan || plan.isReason || plan.isFinal) return false;
  const text = normalizeText(`${plan.label || ""} ${plan.prompt || ""}`);
  const hint = normalizeText(plan.teacherHint || "");
  if (!hint || !hasConcreteTeachingContent(hint)) return false;
  return /认识|知道|记住|先统一单位|看是不是平均分|看总数|看分成|看每份|先看时针|再看分针|先看数位|看数位|找顶点|找两条边|看分类标准|记住条件|看问题问什么|找关系|看每组几个|看有几组|看总数和分法|看图形特征|先想轻重|找起点|看终点/.test(text);
}

function formatTeacherModelFirstPrompt(plan) {
  const hint = stripTeacherFollowInstruction(ensureChineseSentence(plan.teacherHint));
  const follow = createContextualFollowSentence(plan);
  const lesson = safeCurrentLesson();
  const family = getPlanTeachingFamily(lesson, plan);
  const key = [
    lesson?.id || "",
    lesson?.activeQuestion?.id || lesson?.activeQuestion?.prompt || "",
    plan?.label || "",
    plan?.prompt || "",
    safeStateField("lastStudentText", ""),
  ].join("|");
  const lead = createTeacherLeadForModelStep(plan, family, key);
  const action = createTeacherActionForModelStep(plan, family, follow, key);
  return softenTeacherScaffoldText(joinTeacherScaffoldParts(lead, hint, action));
}

function joinTeacherScaffoldParts(...parts) {
  const sentences = [];
  for (const part of parts) {
    const chunks = splitChineseSentences(part);
    for (const chunk of chunks) {
      const current = chunk.trim();
      if (!current) continue;
      const previous = sentences[sentences.length - 1] || "";
      const prevKey = normalizeSentenceForDedupe(previous);
      const currentKey = normalizeSentenceForDedupe(current);
      if (prevKey && currentKey && (prevKey === currentKey || prevKey.includes(currentKey) || currentKey.includes(prevKey))) continue;
      sentences.push(current);
    }
  }
  return sentences.join("");
}

function splitChineseSentences(text = "") {
  return String(text || "").match(/[^。！？!?]+[。！？!?]?/g) || [];
}

function normalizeSentenceForDedupe(text = "") {
  return normalizeText(text).replace(/[。！？!?，,：:“”"「」]/g, "");
}

function createTeacherLeadForModelStep(plan, family, key) {
  const text = normalizeText(`${plan?.label || ""} ${plan?.prompt || ""}`);
  const familyLeads = {
    compare: ["先看图，不急着填符号。", "比较题先把两边看清。", "这一题先比多少，再说符号。"],
    money: ["钱的题先看单位。", "元角分先把关系站稳。", "先别急着算，把单位关系看清。"],
    moneyApplication: ["购物题先分清付钱和价钱。", "找零题先把钱换成同一种单位。", "先看故事里谁付钱、谁是价钱。"],
    makeTenAdd: ["凑十法先找谁快到10。", "这题先不硬数，先想凑十。", "加法可以先凑成10再算。"],
    breakTenSubtract: ["退位减先看个位够不够减。", "这题先别硬减，先想破十。", "不够减时，先把十几拆开。"],
    concreteAddition: ["加法故事先看两部分。", "一共多少，先把两边合起来。"],
    concreteSubtraction: ["减法故事先看原来和拿走。", "还剩多少，先把拿走的去掉。"],
    composition: ["分与合先看总数。", "组成题先看整体和一部分。", "先把总数看清，再找缺的那部分。"],
    multiplication: ["乘法先看几个几。", "口诀前面先看一组几个。"],
    division: ["平均分先看是不是一样多。", "除法先看总数和分法。"],
    time: ["钟表题先分清短针和长针。", "时间题先看一根针，再看另一根。"],
    placeValue: ["数位题先看数字站在哪一位。", "十位个位先分清。"],
    shape: ["图形题先看特征。", "先找边、角、面这些线索。"],
    data: ["统计题先看表格里的对应位置。", "读表先找行和列。"],
    logic: ["推理题先看一条确定线索。", "先排除不可能的情况。"],
  };
  const general = /看|找|数|读|分清|比较/.test(text)
    ? ["先只看图里的一个线索。", "把题目缩小，只看眼前这一点。"]
    : ["老师先把这一小步讲清。", "这一点先不让你猜，先听方法。", "先把关键句放稳。"];
  return pickNaturalVariant(familyLeads[family] || general, `${key}|lead`);
}

function createTeacherActionForModelStep(plan, family, follow, key) {
  const cleanFollow = String(follow || simplifyStepLabelForRepeat(plan?.label || plan?.prompt || "这一步"))
    .replace(/[。！？!?]+$/, "")
    .trim();
  const text = normalizeText(`${plan?.label || ""} ${plan?.prompt || ""}`);
  const target = createAnswerShapeInstruction(plan);
  const moneyTarget = createMoneyAnswerInstruction(text, target || cleanFollow);
  const visualAction = /看|找|数|读|左边|右边|时针|分针|图|表格|一一配对|起点|终点/.test(text);
  const relationAction = /认识|知道|记住|单位|关系|等于|口诀|规则|特征|条件/.test(text);
  const calculateAction = /算|换成|加|减|乘|除|合起来|拿走|剩|找回|凑十|破十/.test(text);

  const familyActions = {
    compare: [
      `先回答一个小问题：${target || cleanFollow}。`,
      `看两边，先说：${cleanFollow}。`,
      `不用急着整题，先告诉老师：${target || cleanFollow}。`,
    ],
    money: [
      `请把这句说出来：${cleanFollow}。`,
      `先说单位关系：${cleanFollow}。`,
      `这一步只回答钱数：${moneyTarget}。`,
    ],
    moneyApplication: [
      `先说这个关系：${cleanFollow}。`,
      `先说第一步：${target || cleanFollow}。`,
      `别急着最后答案，先把这一步说清：${cleanFollow}。`,
    ],
    composition: [
      `现在照着说一句：${cleanFollow}。`,
      `这一步先说这一句：${cleanFollow}。`,
      `如果会了就用自己的话说，卡住就照着说：${cleanFollow}。`,
    ],
    time: [`只看这一根针，回答：${cleanFollow}。`, `现在先说时间里的这一小步：${target || cleanFollow}。`],
    division: [`先说分法里的这一点：${cleanFollow}。`, `这一轮先回答：${target || cleanFollow}。`],
    multiplication: [`先说“几个几”的这一点：${cleanFollow}。`, `口诀先不急，先回答：${target || cleanFollow}。`],
  };

  const generalActions = [];
  if (visualAction) {
    generalActions.push(`看图，先说你看到的：${cleanFollow}。`);
    generalActions.push(`先从图里找一个答案：${target || cleanFollow}。`);
  }
  if (relationAction) {
    generalActions.push(`先把这句短话说出来：${cleanFollow}。`);
    generalActions.push(`请说这个关系：${cleanFollow}。`);
  }
  if (calculateAction) {
    generalActions.push(`请只算这一小步：${target || cleanFollow}。`);
    generalActions.push(`先不报整题答案，只回答：${target || cleanFollow}。`);
  }
  generalActions.push(`这一轮先回答这一问：${target || cleanFollow}。`);
  generalActions.push(`请说一个数、一个词，或者这句短话：${cleanFollow}。`);

  return pickNaturalVariant(familyActions[family] || generalActions, `${key}|action`);
}

function createMoneyAnswerInstruction(text, fallback = "这一步") {
  if (/几分|多少分|等于[几多少0-9一二三四五六七八九十百]+分|换成分|分[？?]/.test(text)) return "几分";
  if (/角/.test(text)) return "几角";
  if (/元/.test(text)) return "几元";
  return fallback;
}

function createContextualFollowSentence(plan) {
  const answer = pickChildFollowAnswer(plan?.answerKeywords || []);
  const label = normalizeText(plan?.label || "");
  const prompt = normalizeText(plan?.prompt || "");
  const keywordText = normalizeText((plan?.answerKeywords || []).join(" "));
  if ((label.includes("先统一单位") || prompt.includes("换成什么单位")) && keywordText.includes("先换成角")) {
    return "先换成角";
  }
  const raw = String(answer || "").trim();
  if (raw && /^[0-9一二两三四五六七八九十百千万]+$/.test(raw)) {
    if (label.includes("总数") || prompt.includes("一共有多少")) return `总数是${raw}`;
    if (/另一部分|缺|还差|分成/.test(label) || /另一部分|还差|缺/.test(prompt)) return `另一部分是${raw}`;
    if (/已知部分|知道哪一部分|一部分是/.test(label) || /已知部分|已经有一部分|一部分是/.test(prompt)) return `已知部分是${raw}`;
    if (label.includes("份数") || prompt.includes("分成几份")) return `分成${raw}份`;
    if (label.includes("每份") || prompt.includes("每份几个")) return `每份${raw}个`;
    if (label.includes("时针")) return `时针指向${raw}`;
    if (label.includes("分针")) return `分针指向${raw}`;
    if (label.includes("起点")) return `从${raw}刻度开始`;
    if (label.includes("终点")) return `终点是${raw}`;
  }
  if (raw) return raw;
  return simplifyStepLabelForRepeat(plan?.label || plan?.prompt || "这一步");
}

function createConcreteFallbackSentence(plan) {
  const lesson = safeCurrentLesson();
  const family = getPlanTeachingFamily(lesson, plan);
  const text = normalizeText(`${plan?.label || ""} ${plan?.prompt || ""} ${(plan?.answerKeywords || []).join(" ")}`);
  if (plan?.isReason || /为什么|原因|理由|说清|讲清/.test(text)) return createReasonRepeatSentence(plan?.label, plan?.prompt, plan?.answerKeywords);
  if (family === "money" || family === "moneyApplication" || hasMoneyTerm(text)) {
    if (/换成角|先换|单位/.test(text)) return "先把元换成角";
    if (/找回|找零/.test(text)) return "用付的钱减价钱";
    return "先看元，再看角";
  }
  if (family === "compare" || /比较|大于|小于|等号|符号/.test(text)) return "先看左边，再看右边";
  if (family === "composition" || /分成|组成|另一部分|缺|还差/.test(text)) return "先看总数，再看已知的一部分";
  if (family === "count" || /数数|总数|一共有/.test(text)) return "一个一个按顺序数";
  if (family === "concreteAddition" || /一共|合起来|加法/.test(text)) return "两部分合起来用加法";
  if (family === "concreteSubtraction" || /还剩|拿走|少了|减法/.test(text)) return "从原来的里面拿走，用减法";
  if (family === "makeTenAdd" || /凑十/.test(text)) return "先凑成十，再加剩下的数";
  if (family === "breakTenSubtract" || /破十|退位|十几减/.test(text)) return "先把十几拆成十和几";
  if (family === "multiplication" || /乘法|几个几/.test(text)) return "先找每组几个，再看有几组";
  if (family === "division" || /除法|平均分|每份/.test(text)) return "平均分就是每份一样多";
  if (family === "placeValue" || /数位|十位|个位/.test(text)) return "先看这个数字在哪一位";
  if (family === "time" || /时针|分针|时间|几时/.test(text)) return "先看短针，再看长针";
  if (family === "measure" || /长度|厘米|米|刻度|单位/.test(text)) return "先看用什么单位";
  if (family === "shape" || /图形|边|角|特征/.test(text)) return "先看图形的特征";
  if (family === "data" || /表格|统计|数量/.test(text)) return "先找到对应的那一行";
  if (family === "logic" || /推理|排除|可能/.test(text)) return "先排除不可能的";
  return "我先看题目问什么";
}

function stripTeacherFollowInstruction(text) {
  return String(text || "")
    .replace(/你可以先说「[^」]+」。?/g, "")
    .replace(/你先说「[^」]+」。?/g, "")
    .replace(/你可以先说[:：][^。！？!?]+[。！？!?]?/g, "")
    .replace(/你先说[:：][^。！？!?]+[。！？!?]?/g, "")
    .replace(/你可以先只说[:：][^。！？!?]+[。！？!?]?/g, "")
    .replace(/你先只说[:：][^。！？!?]+[。！？!?]?/g, "")
    .replace(/先只说[:：][^。！？!?]+[。！？!?]?/g, "")
    .replace(/先说[:：][^。！？!?]+[。！？!?]?/g, "")
    .replace(/先说[^。！？!?：:]{0,24}[:：][^。！？!?]+[。！？!?]?/g, "")
    .replace(/现在不用说完整，先说这个关键词：[^。！？!?]+[。！？!?]?/g, "")
    .replace(/再试一次，先回答这一小步：[^。！？!?]+[。！？!?]?/g, "")
    .replace(/你可以先学着说半句，再换成自己的话。?/g, "")
    .replace(/你可以先参考这句：/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function simplifyStepLabelForRepeat(label) {
  const text = String(label || "").replace(/[。！？!?：:，,]/g, "").trim();
  if (!text) return "我先看这一步";
  return text.length > 14 ? text.slice(0, 14) : text;
}

function childGuideBridge(plan, previousPlan = null) {
  const index = Number(plan?.index ?? previousPlan?.index ?? 0) || 0;
  const options = [
    "对，你看到了关键。",
    "可以，这个小点站住了。",
    "嗯，方向对了。",
    "对，就是这个意思。",
    "好，我们顺着这个想法走。",
    "可以，刚才这句话有用。",
    "这一步通了。",
    "嗯，先把这个小地方记住。",
    "对，我们不用一口气做完整题。",
    "好，继续看眼前这一点。",
  ];
  const lesson = safeCurrentLesson();
  const activeQuestion = lesson?.activeQuestion || {};
  const key = [
    lesson?.id || "",
    activeQuestion.id || activeQuestion.prompt || "",
    safeStateField("lastStudentText", ""),
    plan?.label || "",
    plan?.prompt || "",
    previousPlan?.label || "",
    index,
  ].join("|");
  return pickNaturalVariant(options, key);
}

function softenTeacherScaffoldText(text) {
  return String(text || "")
    .replace(/可以，先把这个想法放稳，再看下一点。/g, "这一步对了，我们看下一小步。")
    .replace(/刚才那句还没接到题上，老师把问题缩小。/g, "没关系，老师把问题变小一点。")
    .replace(/先抓这一小步/g, "先看这一问")
    .replace(/只回答眼前这一小步/g, "先说这一小问")
    .replace(/你只说[:：]?/g, "你可以先说：")
    .replace(/只说这个符号就行/g, "先说这个符号就行")
    .replace(/只回答一步/g, "先回答一步")
    .replace(/你只要说/g, "你可以先说")
    .replace(/你跟着说一遍[:：]?/g, "请跟着老师说一遍：")
    .replace(/你跟着说[:：]?/g, "请跟着老师说：")
    .replace(/老师先说答案[:：]?/g, "老师先示范：")
    .replace(/老师先告诉你[:：]?/g, "老师先把关键点说清楚：")
    .replace(/老师先说[:：]?/g, "老师先示范：")
    .replace(/老师把答案范围缩小[:：]?/g, "老师把这一步讲清楚：")
    .replace(/跟老师说一句/g, "跟着老师说一句")
    .replace(/跟着说一个小答案/g, "跟着老师说这个小答案")
    .replace(/\s+把刚才的方法/g, " 把刚才的方法")
    .replace(/^(对，[^。！？!?]+。)对，/g, "$1")
    .replace(/^(好，[^。！？!?]+。)好，/g, "$1");
}

function teacherAdvanceMessage(nextPlan, previousPlan = null) {
  const bridge = String(previousPlan?.bridgeMessage || "").trim();
  const follow = String(nextPlan?.followPrompt || "").trim();
  const leadOptions = nextPlan?.isReason
    ? ["现在把想法说出来", "接下来讲一讲为什么", "最后当小老师说一句", "用一句话说说为什么"]
    : [
        `先看「${nextPlan?.label || "下一步"}」`,
        `接下来换到「${nextPlan?.label || "下一步"}」`,
        `这一轮先看「${nextPlan?.label || "下一步"}」`,
        `下面换个小角度，看「${nextPlan?.label || "下一步"}」`,
        `先不急着整题，看看「${nextPlan?.label || "下一步"}」`,
      ];
  const lesson = safeCurrentLesson();
  const activeQuestion = lesson?.activeQuestion || {};
  const family = inferActiveQuestionFamily(lesson, activeQuestion);
  const nextLead = pickNaturalVariant(
    leadOptions,
    `${lesson?.id || ""}|${activeQuestion.id || activeQuestion.prompt || ""}|${safeStateField("lastStudentText", "")}|${nextPlan?.label || ""}|${previousPlan?.label || ""}|${nextPlan?.index || 0}`,
  );
  const familyBridge = createFamilyProgressBridge(nextPlan, previousPlan, lesson);
  const moveKey = `${lesson?.id || ""}|${activeQuestion.id || activeQuestion.prompt || ""}|${safeStateField("lastStudentText", "")}|${nextPlan?.label || ""}|${previousPlan?.label || ""}|${safePassedQuestionCount()}`;
  const move = createStrategyDialogueMove(family, nextPlan?.isReason ? "teachback" : "advance", moveKey) || childGuideBridge(nextPlan, previousPlan);
  let message = "";
  if (familyBridge && !bridge) {
    const nextPrompt = follow || formatCompactStepPrompt(nextPlan);
    message = `${familyBridge}${nextPrompt}`;
    return softenTeacherScaffoldText(message);
  }
  if (bridge) {
    if (nextPlan?.isReason) {
      const reasonPrompt = follow || createReasonOpenQuestion(nextPlan, family, `${moveKey}|bridge-reason`);
      message = `${move}${createNonLeakingReasonBridge(bridge, nextPlan, family, moveKey)} ${reasonPrompt}`;
      return softenTeacherScaffoldText(message);
    }
    const nextPrompt = follow || formatCompactStepPrompt(nextPlan);
    message = `${move}${bridge} ${nextLead}：${nextPrompt}`;
    return softenTeacherScaffoldText(message);
  }
  if (nextPlan?.isReason) {
    message = `${move}${follow || createReasonOpenQuestion(nextPlan, family, `${moveKey}|reason`)}`;
    return softenTeacherScaffoldText(message);
  }
  if (previousPlan?.label && nextPlan?.label) {
    message = `${move}${nextLead}：${formatCompactStepPrompt(nextPlan)}`;
    return softenTeacherScaffoldText(message);
  }
  message = `${move}下一步：${formatCompactStepPrompt(nextPlan)}`;
  return softenTeacherScaffoldText(message);
}

function createFamilyProgressBridge(nextPlan, previousPlan = null, lesson = null) {
  if (!nextPlan) return "";
  lesson = lesson || safeCurrentLesson();
  const question = lesson?.activeQuestion || null;
  const family = inferActiveQuestionFamily(lesson, question);
  const label = normalizeText(nextPlan.label || "");
  const key = `${lesson?.id || ""}|${question?.id || question?.prompt || ""}|${safeStateField("lastStudentText", "")}|${label}|${previousPlan?.label || ""}`;
  const strategyBridge = getStrategyProgressBridge(family, Boolean(nextPlan.isReason), key);
  if (strategyBridge) return strategyBridge;
  const reasonBridge = {
    money: ["结果先放稳。现在像小老师一样说一句为什么：", "答案会算了，接下来讲清单位为什么要换："],
    moneyApplication: ["找回的钱已经会算了。现在说一句为什么先换单位：", "这类购物题不只看答案，还要讲清“付的钱减价钱”："],
    makeTenAdd: ["凑成10这步过了。现在把凑十的办法说出来：", "答案快出来了，接下来讲清为什么先凑十："],
    breakTenSubtract: ["破十这步过了。现在说清为什么要先拆成10和几：", "答案先不急，接下来讲清破十的想法："],
    concreteSubtraction: ["会算还剩多少了。现在说一句为什么用减法：", "把故事讲清楚：原来有，拿走了，所以："],
    concreteAddition: ["会算一共多少了。现在说一句为什么用加法：", "把两部分合起来的想法讲出来："],
    mixedCalculation: ["现在说清先算哪一步，为什么先算它：", "把运算顺序讲出来：先算什么，再算什么："],
    multiplication: ["几个几找到了。现在说清为什么能用乘法：", "口诀前面还有意思，先讲“几个几”："],
    division: ["分得一样多这步过了。现在说清为什么叫平均分：", "答案前面先补一句：每份一样多，所以："],
    compare: ["符号快确定了。现在说清谁大谁小：", "先讲比较的方法，再说符号："],
    placeValue: ["数位看到了。现在说清这个数字表示几个十或几个一：", "答案前面补一句数位的意思："],
    time: ["时针和分针看到了。现在合起来说时间：", "先把短针长针的想法讲清楚："],
    measure: ["单位选出来了。现在说清为什么用这个单位：", "不只说答案，补一句你是怎么选单位的："],
    shape: ["名字先不急。现在说清它的特征：", "像小老师一样说一个特征，再说图形名字："],
    data: ["数量找到了。现在说清你看的是哪一行或哪一列：", "把读表的方法说出来："],
    logic: ["线索看到了。现在说清你排除了什么：", "像小侦探一样讲一讲为什么："],
  };
  const stepBridge = {
    money: ["这一步对了。下一步继续把单位看稳：", "好，单位关系站住了。现在只看下一小步："],
    moneyApplication: ["这一步过了。购物题继续按“付钱、价钱、找回”走：", "好，先别整题心算，下一步只看："],
    makeTenAdd: ["好，凑十法要一步一步来。现在看：", "这步对了，接下来把另一个数拆开看："],
    breakTenSubtract: ["好，破十法继续往下走。现在看：", "这步对了，下面只看一个小动作："],
    concreteSubtraction: ["对，故事里是在拿走。下一步看：", "好，减法故事继续往下看："],
    concreteAddition: ["对，故事里是在合起来。下一步看：", "好，加法故事继续往下看："],
    mixedCalculation: ["这步对了，按运算顺序继续往下算：", "先稳住刚才那步，把中间结果放回原题：", "顺序别乱，下一步只算这一小步："],
    calculation: ["这步对了。计算题继续拆小一点：", "好，先不跳步，下一步只看："],
    application: ["这步对了。应用题继续按故事走：", "好，数字先不乱加，下一步看："],
    compare: ["对，先看两边。下一步看：", "好，比较题继续看另一边："],
    count: ["对，数数先稳住不漏不重。下一步看：", "好，继续按顺序点着数："],
    composition: ["对，总数先记住。下一步看：", "好，分与合继续想还差几："],
    ordinal: ["对，方向先定好。下一步看：", "好，第几个继续看位置："],
    pattern: ["对，规律先看变化。下一步看：", "好，继续找同样的变化："],
    multiplication: ["对，先找一组。下一步看：", "好，乘法继续找几个几："],
    division: ["对，平均分先看公平。下一步看：", "好，先把总数和分法看清楚："],
    placeValue: ["对，先看数位。下一步看：", "好，继续看十位和个位："],
    time: ["对，先看一根针。下一步看：", "好，时间题继续看另一根针："],
    measure: ["对，先看单位。下一步看：", "好，测量题继续看刻度或单位："],
    shape: ["对，先看特征。下一步看：", "好，图形题继续找特征："],
    data: ["对，先看表格。下一步看：", "好，继续找对应的数量："],
    logic: ["对，先看确定条件。下一步看：", "好，推理题继续排除："],
  };
  if (nextPlan.isReason) return pickNaturalVariant(reasonBridge[family] || reasonBridge.application || ["这一步会做了。现在说说为什么："], key);
  return pickNaturalVariant(stepBridge[family] || stepBridge.application || ["这一步对了。下一步只看："], key);
}

function teacherRepairMessage(prefix, plan) {
  const lesson = safeCurrentLesson();
  const family = getPlanTeachingFamily(lesson, plan);
  const lastStudentText = normalizeText(safeStateField("lastStudentText", ""));
  const saysCannot = isCannotAnswerText(lastStudentText);
  const repairCount = getGuidedRepairAttemptCount(plan);
  const shouldModelAnswer = saysCannot || repairCount >= 2;
  const rawLead = String(prefix || (saysCannot ? "没关系，我们把这一步讲小一点。" : "这次还没对上。")).replace(/[。！？!?]*$/, "。");
  const moveKind = saysCannot ? "cannotAnswer" : /没连上|答非所问|当前小问题/.test(rawLead) ? "offTopic" : "repair";
  const strategyLead = createStrategyDialogueMove(
    family,
    moveKind,
    `${lesson?.id || ""}|${lesson?.activeQuestion?.id || lesson?.problem || ""}|${plan?.label || ""}|${lastStudentText}|${repairCount}`,
    { includeHint: shouldModelAnswer && !plan?.isReason },
  );
  const lead = strategyLead
    ? ensureChineseSentence(strategyLead)
    : saysCannot
    ? "没关系，这一步老师先示范。"
    : /没连上|答非所问|当前小问题/.test(rawLead)
    ? "刚才那句话先放一边，我们回到这道小题。"
    : rawLead;
  const forwardRepair = createForwardButUsefulRepair(plan, lastStudentText);
  if (forwardRepair) return softenTeacherScaffoldText(forwardRepair);
  let message = "";
  if (plan?.isReason) {
    const sentence = String(plan.repeatSentence || createReasonRepeatSentence(plan.label, plan.prompt, plan.answerKeywords)).replace(/[。！？!?]+$/, "");
    if (shouldModelAnswer) {
      message = `${lead}原因不用想很长。请跟着老师说：“${sentence}。”说完后，我们再换一道小题试试。`;
    } else {
      message = `${lead}${createReasonOpenQuestion(plan, family, `${lesson?.id || ""}|${plan?.label || ""}|repair`)}`;
    }
    return softenTeacherScaffoldText(message);
  }
  const hint = shouldModelAnswer
    ? stripTeacherFollowInstruction(ensureChineseSentence(plan?.teacherHint || ""))
    : createNonLeakingRepairHint(plan);
  if (hint) {
    const retry = shouldAppendRetryInstruction(hint, shouldModelAnswer) ? createRetryInstructionForStep(plan, shouldModelAnswer) : "";
    message = joinTeacherScaffoldParts(lead, ensureChineseSentence(hint), retry);
    return softenTeacherScaffoldText(message);
  }
  message = joinTeacherScaffoldParts(
    lead,
    `我们不重来，只把问题缩小：${formatChildStepPrompt(plan)}`,
    createRetryInstructionForStep(plan, shouldModelAnswer),
  );
  return softenTeacherScaffoldText(message);
}

function shouldAppendRetryInstruction(hint, shouldModelAnswer = false) {
  if (shouldModelAnswer) return true;
  const value = normalizeText(hint || "");
  if (!value) return true;
  return !/(请回答|这里要回答|这次只说|照着这句|跟着老师|先说这一句|只要说)/.test(value);
}

function ensureChineseSentence(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return /[。！？!?]$/.test(value) ? value : `${value}。`;
}

function createRetryInstructionForStep(plan, shouldModelAnswer = false) {
  const hasAnswerKeywords = Array.isArray(plan?.answerKeywords) && plan.answerKeywords.some((item) => String(item || "").trim());
  const answer = hasAnswerKeywords ? createContextualFollowSentence(plan) : "";
  if (shouldModelAnswer) {
    if (answer) return `如果不知道怎么说，就照着这句说一遍：“${answer}。”`;
    return `如果不知道怎么说，就跟着老师说：“${createConcreteFallbackSentence(plan)}。”`;
  }
  const target = createAnswerShapeInstruction(plan);
  if (target) return ensureChineseSentence(target);
  const lesson = safeCurrentLesson();
  return pickNaturalVariant(
    [
      `请跟着老师说：“${createConcreteFallbackSentence(plan)}。”`,
      "先说这一小问就行。",
      "看着图，说你看到的一个数或一个词。",
    ],
    `${lesson?.id || ""}|${plan?.label || ""}|${plan?.prompt || ""}|retry`,
  );
}

function createAnswerShapeInstruction(plan) {
  if (!plan) return "";
  const lesson = safeCurrentLesson();
  const family = getPlanTeachingFamily(lesson, plan);
  const label = normalizeText(plan.label || "");
  const prompt = normalizeText(plan.prompt || "");
  const text = normalizeText(`${label} ${prompt}`);

  if (plan.isReason || /为什么|原因|理由|怎么想|怎么知道|说清/.test(text)) return "这次只说一句原因";
  if (family === "compare" || /比较|符号|大于|小于|等号|哪边大/.test(text)) {
    if (/符号|大于|小于|等号/.test(text)) return "这次只说：大于号、小于号，还是等号";
    return "这次只说：左边、右边，还是一样多";
  }
  if (family === "moneyApplication" || /找回|找零|付了|价钱|购物/.test(text)) {
    if (/关系|找回/.test(text)) return "这次只说：付的钱减价钱";
    if (/单位|换成什么|先换/.test(text)) return "这次只说：先换成角";
    return "这次只说一个带单位的小答案";
  }
  if (family === "composition" || (isCompositionTeachingText(`${lesson?.node || ""}${text}`) && !hasMoneyTerm(text))) {
    if (/总数|一共/.test(text)) return "这次只说总数是多少";
    if (/另一部分|缺|还差|分成/.test(text)) return "这里要回答一个数：另一部分是几";
    if (/为什么|检查|原因|说清/.test(text)) return "这次照着说一句原因";
    return "这次只说一个数";
  }
  if (family === "money" || hasMoneyTerm(text)) {
    if (/单位|换成什么|先换/.test(text)) return "这次只说：先换成角";
    return `这次只说：${createMoneyAnswerInstruction(text, "几元或几角")}`;
  }
  if (family === "division" || /平均分|每份|分成/.test(text)) {
    if (/总数|一共/.test(text)) return "这次只说总数是多少";
    if (/份数|分成/.test(text)) return "这次只说分成几份";
    if (/每份/.test(text)) return "这次只说每份几个";
  }
  if (family === "time" || /时针|分针|几时|几分/.test(text)) {
    if (/时针|短针/.test(text)) return "这次只说短针指向几";
    if (/分针|长针/.test(text)) return "这次只说长针指向几";
    return "这次只说一个时间";
  }
  if (family === "placeValue" || /十位|个位|数位/.test(text)) return "这次只说这个数字表示几个十或几个一";
  if (family === "shape" || /图形|边|角|面|顶点/.test(text)) return "这次只说一个图形特征";
  if (/几|多少|等于|算/.test(text)) return "这次只说一个数，能带单位就带单位";
  return "";
}

function getGuidedRepairKey(plan, lesson = currentLesson()) {
  const question = lesson?.activeQuestion || null;
  return [
    lesson?.id || "",
    question?.id || question?.prompt || lesson?.problem || "",
    Number(plan?.index) || 0,
    normalizeText(plan?.label || ""),
  ].join("|");
}

function getGuidedRepairAttemptCount(plan, lesson = currentLesson()) {
  const key = getGuidedRepairKey(plan, lesson);
  return Number(state?.guidedRepairCounts?.[key]) || 0;
}

function recordGuidedRepairAttempt(lesson, plan) {
  const key = getGuidedRepairKey(plan, lesson);
  state.guidedRepairCounts = { ...(state.guidedRepairCounts || {}), [key]: (Number(state.guidedRepairCounts?.[key]) || 0) + 1 };
  return state.guidedRepairCounts[key];
}

function clearGuidedRepairAttempts() {
  state.guidedRepairCounts = {};
}

function createNonLeakingRepairHint(plan) {
  const lesson = currentLesson();
  const family = getPlanTeachingFamily(lesson, plan);
  const label = normalizeText(plan?.label || "");
  const prompt = normalizeText(plan?.prompt || "");
  const text = normalizeText(`${label} ${prompt}`);

  if (family === "compare" || /比较|符号|大于|小于|等号/.test(text)) {
    if (/符号|大于|小于|等号/.test(text)) return "符号的开口要朝大的那边。先看哪边大，再选符号。";
    return "先别急着填符号，只看左边和右边，找出哪边大。";
  }
  if (family === "composition" || isCompositionTeachingText(`${lesson?.node || ""}${text}`)) {
    if (/总数|一共/.test(text)) return "分与合先看总数。总数就是两部分合起来以后仍然是多少。";
    if (/另一部分|还差|缺|分成/.test(text)) return "总数和一部分知道了，就看还缺哪一部分。请回答：另一部分是几。";
    return "组成题可以用一句话检查：两部分合起来还是总数。";
  }
  if (family === "money" || family === "moneyApplication" || hasMoneyTerm(text) || /找回|找零/.test(text)) {
    if (/换|单位|元|角|分/.test(text)) return "元、角、分不能混着算，先换成同一种单位，再继续算。";
    return "购物题先看价钱和付的钱，再想是合起来、换单位，还是找回。";
  }
  if (family === "makeTenAdd") return "凑十法先找快到10的数，再把另一个数拆成两部分。";
  if (family === "breakTenSubtract") return "破十法先看个位够不够减，不够就把十几拆成10和几。";
  if (/加|合起来|一共/.test(text)) return "加法先看两部分，把它们合起来。可以从大数接着数。";
  if (/减|剩|去掉|拿走|少/.test(text)) return "减法先看原来有多少，再看去掉多少，最后看还剩多少。";
  if (family === "multiplication") return "乘法先找一组有几个，再看一共有几组。";
  if (family === "division") return "平均分先看总数，再看分成几份或每份几个。";
  if (family === "placeValue") return "数位题先看十位、个位，再把每个数位的意思说清楚。";
  if (family === "time") return "时间题先看时针，再看分针，不要把两根针混在一起。";
  if (family === "measure") return "测量题先看单位和起点，再看终点刻度。";
  if (family === "shape") return "图形题先说边、角、面这些特征，再说名字。";
  if (family === "data") return "读表题先找对应的行或列，再读数量。";
  if (family === "logic") return "推理题先找确定的一条线索，再排除不可能的情况。";

  const hint = stripAnswerLeakFromRepairHint(plan?.teacherHint || "");
  return hint || "先看图里的关键数，不急着说最后答案。";
}

function stripAnswerLeakFromRepairHint(text) {
  let value = stripTeacherFollowInstruction(String(text || "")).trim();
  if (!value) return "";
  value = value
    .replace(/所以这里填「[^」]+」[。！？!?]?/g, "想一想这里该选哪一种。")
    .replace(/所以答案是[^。！？!?]+[。！？!?]?/g, "")
    .replace(/答案是[^。！？!?]+[。！？!?]?/g, "")
    .replace(/所以[^。！？!?]*(等于|是|为)[^。！？!?]+[。！？!?]?/g, "")
    .replace(/你可以先学着说半句，再换成自己的话[。！？!?]?/g, "")
    .trim();
  return value;
}

function createForwardButUsefulRepair(plan, studentText) {
  if (!plan || !studentText || isCannotAnswerText(studentText)) return "";
  const lesson = currentLesson();
  const family = getPlanTeachingFamily(lesson, plan);
  const label = normalizeText(plan.label || "");

  if (family === "moneyApplication") {
    if (label.includes("找关系") && /换成角|统一单位|单位|角/.test(studentText)) {
      return "你已经想到后面要换单位了，方向很好。现在先补一句关系：找回的钱等于付的钱减价钱。你可以说：付的钱减价钱。";
    }
    if (label.includes("先统一单位") && /付的钱减|减价钱|找回|剩下/.test(studentText)) {
      return "这个关系说对了。现在进入下一小步：元和角不能直接混着减，要先换成同一种单位。你可以说：先换成角。";
    }
    if ((label.includes("换付的钱") || label.includes("换商品价格")) && /找回|减|剩下/.test(studentText)) {
      return "你已经在想最后的找回了。先把眼前这个数换稳：1元等于10角，所以这一笔钱换成多少角？";
    }
  }

  if (family === "division") {
    if ((label.includes("看总数") || label.includes("看分成") || label.includes("看每份")) && /平均分|同样多|一样多/.test(studentText)) {
      const numbers = extractNumbers(lesson?.activeQuestion?.prompt || lesson?.problem || "");
      const total = numbers[0];
      const parts = numbers[1];
      if (Number.isFinite(total) && Number.isFinite(parts)) {
        if (label.includes("看总数")) return `对，平均分这个意思已经有了。先补总数：一共有${total}个。你先说：总数是${total}。`;
        return `对，平均分这个意思已经有了。先补分法：分成${parts}份。你先说：分成${parts}份。`;
      }
      return "对，平均分这个意思已经有了。先补眼前这个数量。";
    }
    if (label.includes("看分成") && /总数|一共|12/.test(studentText)) {
      const numbers = extractNumbers(lesson?.activeQuestion?.prompt || lesson?.problem || "");
      const parts = numbers[1];
      if (Number.isFinite(parts)) return `总数说对了。接着看分法：平均分给${parts}个小朋友，就是分成${parts}份。你先说：分成${parts}份。`;
    }
    if (label.includes("看总数") && /分成|每份|小朋友|份/.test(studentText)) {
      const numbers = extractNumbers(lesson?.activeQuestion?.prompt || lesson?.problem || "");
      const total = numbers[0];
      if (Number.isFinite(total)) return `你已经看到分法了。先把总数补上：一共有${total}个。你先说：总数是${total}。`;
    }
  }

  if ((family === "makeTenAdd" || family === "breakTenSubtract") && /答案|等于|所以/.test(studentText) && !label.includes("说出结果")) {
    return "你已经在想最后答案了，挺好。我们先把中间这一步说清楚，后面答案自然会出来。";
  }

  if (family === "compare") {
    if (/大于|小于|等于|左边|右边|一样|相等|>|<|=/.test(studentText) && /看清|两边|先看|数量/.test(label)) {
      return "你已经开始比较了。先把两边说清：左边是多少，右边是多少？请先说这两个数。";
    }
    if (/大于|小于|等于|>|<|=/.test(studentText) && /原因|为什么|说清/.test(label)) {
      return "符号说出来了，现在补一句原因：先说哪边多，再说符号朝哪边。";
    }
  }

  if (family === "multiplication") {
    if (/口诀|得|等于|一共|总共/.test(studentText) && !/结果|答案|一共/.test(label)) {
      return "你已经想到乘法结果了。乘法先讲意思：一组有几个？一共有几组？先回答这一小步。";
    }
    if (/加法|连加|几个几/.test(studentText) && /结果|答案|一共/.test(label)) {
      return "意思说对了。现在把几个几换成乘法算式，算出一共是多少。";
    }
  }

  if (family === "time") {
    if (/点|时|分|半/.test(studentText) && /时针|短针/.test(label)) {
      return "你已经在说完整时间了。先拆小一点：短针指向几？请只说短针。";
    }
    if (/点|时|分|半/.test(studentText) && /分针|长针/.test(label)) {
      return "完整时间先放一下。先看长针：长针指向几，表示几分？";
    }
  }

  if (family === "shape") {
    if (/长方形|正方形|三角形|圆|角|边|面/.test(studentText) && !/特征|为什么|原因/.test(label)) {
      return "你已经说到图形了。现在先看一个特征：它有几条边，或者有没有角？";
    }
  }

  if (family === "placeValue") {
    if (/十|个位|十位|一/.test(studentText) && !/表示|数位|十位|个位/.test(label)) {
      return "你已经想到数位了。先说这一位：这个数字在十位还是个位？";
    }
  }

  if (family === "data") {
    if (/最多|最少|一共|相差|多|少/.test(studentText) && !/行|列|表/.test(label)) {
      return "你已经在想结果了。读表题先找位置：这道题要看哪一行或哪一列？";
    }
  }

  if (family === "logic") {
    if (/所以|因为|不是|只能|排除/.test(studentText) && !/线索|条件|排除/.test(label)) {
      return "你已经在推理了。先说第一条线索：题里哪一句话最确定？";
    }
  }

  return "";
}

function teacherReasonMessage(reasonPlan) {
  const lesson = safeCurrentLesson();
  const family = getPlanTeachingFamily(lesson, reasonPlan);
  const key = `${lesson?.id || ""}|${lesson?.activeQuestion?.id || lesson?.activeQuestion?.prompt || ""}|${reasonPlan?.label || ""}|${safeStateField("lastStudentText", "")}`;
  const familyLeads = {
    compare: ["你已经比出来了。现在讲清：为什么这边大？", "符号快稳了，再说一句比较方法。"],
    money: ["结果会了，接下来讲单位为什么要先换。", "钱数算出来了，现在说清元、角、分的关系。"],
    moneyApplication: ["找回的钱会算了。现在说清为什么用“付的钱减价钱”。", "购物题不只要答案，还要讲清为什么先换单位。"],
    makeTenAdd: ["答案出来了。现在讲清为什么先凑成10。", "凑十法会用了，再把方法说成一句话。"],
    breakTenSubtract: ["答案出来了。现在讲清为什么要破十。", "退位减会算了，再说清不够减怎么办。"],
    concreteAddition: ["一共多少会算了。现在讲清为什么用加法。", "把两部分合起来的意思说出来。"],
    concreteSubtraction: ["还剩多少会算了。现在讲清为什么用减法。", "把原来、拿走、还剩的故事说出来。"],
    composition: ["这一步会分了。现在讲清：两部分怎么合回总数？", "分与合的答案稳了，再说一句为什么这样分。"],
    multiplication: ["口诀会用了。现在讲清这是几个几。", "乘法答案前面，要把几个几说出来。"],
    division: ["答案会分了。现在讲清为什么是平均分。", "每份多少会算了，再说一句“每份一样多”。"],
    time: ["时间会读了。现在讲清先看哪根针、再看哪根针。"],
    placeValue: ["数会写了。现在讲清这个数字站在哪一位。"],
    shape: ["图形名字会说了。现在讲清一个特征。"],
    data: ["数量读出来了。现在讲清你看的是哪一行或哪一列。"],
    logic: ["答案推出来了。现在讲清你先用了哪条线索。"],
  };
  const lead = pickNaturalVariant(familyLeads[family] || ["答案这步过了。现在像小老师一样说一句原因。", "结果先放稳，接下来讲讲你是怎么想的。"], key);
  const childAction = createReasonOpenQuestion(reasonPlan, family, `${key}|first-reason`);
  return softenTeacherScaffoldText(`${lead}${childAction}`);
}

function createNonLeakingReasonBridge(bridge, nextPlan, family, key = "") {
  const raw = String(bridge || "").trim();
  if (!raw) return "";
  const text = normalizeText(`${raw}${nextPlan?.label || ""}${nextPlan?.prompt || ""}`);
  const hasLikelyAnswer = /左边\d+比右边\d+|右边\d+比左边\d+|答案|所以|等于|开口要朝|先换成|用减法|用加法|可以用乘法|可以用除法/.test(text);
  if (!hasLikelyAnswer) return ensureChineseSentence(raw);
  const alternatives = {
    compare: ["符号选出来了。现在别急着背答案，讲讲你怎么看出大小。", "会填符号了，接下来只说比较的方法。"],
    money: ["数算出来了。现在讲讲为什么要先看单位。", "答案先放稳，接下来只说元角分怎么想。"],
    moneyApplication: ["购物题的答案先放稳。现在讲讲为什么这样找回。", "会算了，接下来只说付钱、价钱和找回的关系。"],
    composition: ["答案先放稳。现在只说总数和两部分的关系。", "分与合会做了，接下来讲一句为什么这样分。"],
    makeTenAdd: ["答案先放稳。现在只说凑十的小方法。"],
    breakTenSubtract: ["答案先放稳。现在只说为什么要破十。"],
    multiplication: ["结果先放稳。现在只说这是几个几。"],
    division: ["结果先放稳。现在只说为什么要平均分。"],
  };
  return ensureChineseSentence(pickNaturalVariant(alternatives[family] || ["答案先放稳。现在只说你怎么想。"], key));
}

function createExplicitRepeatInstruction(sentence) {
  const clean = String(sentence || "").replace(/[。！？!?]+$/, "").trim();
  if (!clean) return "请照着老师这句说一遍。";
  return `如果不知道怎么说，就照着这句说一遍：“${clean}。”`;
}

function createReasonOpenQuestion(reasonPlan, family, key = "") {
  const label = normalizeText(reasonPlan?.label || "");
  const prompt = normalizeText(reasonPlan?.prompt || "");
  const text = `${label}${prompt}`;
  const optionsByFamily = {
    compare: [
      "请说一句小方法：你先看哪边的数量？",
      "不用说很长，先说你怎么知道哪边大。",
      "你先说：左边和右边，谁多谁少？",
    ],
    money: [
      "请说一句小方法：元和角单位不一样，要先换成同一种单位。",
      "不用说很长，卡住就照着说：先换成角，再计算。",
      "你先说：元和角不能直接混着算。",
    ],
    moneyApplication: [
      "请说一句小方法：找回的钱是剩下的钱，还是花掉的钱？",
      "不用说很长，先说为什么要用付的钱减价钱。",
      "你先说：购物题要先看价钱，还是先看找回？",
    ],
    makeTenAdd: [
      "请说一句小方法：为什么先把一个数凑成10？",
      "不用说很长，先说你想把谁变成10。",
      "你先说：凑十法先找什么？",
    ],
    breakTenSubtract: [
      "请说一句小方法：个位不够减时先怎么办？",
      "不用说很长，先说为什么要把十几拆开。",
      "你先说：破十法先看哪一位够不够减？",
    ],
    concreteAddition: [
      "请说一句小方法：为什么这里要合起来？",
      "不用说很长，先说这是把两部分合起来，还是拿走一部分。",
      "你先说：故事里是在变多，还是变少？",
    ],
    concreteSubtraction: [
      "请说一句小方法：为什么这里要拿走？",
      "不用说很长，先说原来有多少、拿走多少、还剩多少。",
      "你先说：故事里是在变多，还是变少？",
    ],
    composition: [
      "请说一句小方法：两部分合起来还是总数。",
      "不用说很长，卡住就照着说：先看总数，再找缺的部分。",
      "你先说：两部分合起来还是总数。",
    ],
    multiplication: [
      "请说一句小方法：你先看每组几个，还是先看一共有几组？",
      "不用说很长，先说这是几个几。",
      "你先说：一组有几个？有几组？",
    ],
    division: [
      "请说一句小方法：为什么要让每份一样多？",
      "不用说很长，先说总数怎么平均分。",
      "你先说：这是平均分，还是随便分？",
    ],
    time: [
      "请说一句小方法：读时间时先看短针，还是先看长针？",
      "不用说很长，先说两根针分别告诉我们什么。",
      "你先说：短针看几时，长针看几分。",
    ],
    placeValue: [
      "请说一句小方法：为什么要先看十位和个位？",
      "不用说很长，先说这个数字站在哪一位。",
      "你先说：十位表示几个十，个位表示几个一。",
    ],
    shape: [
      "请说一句小方法：你是看哪个特征判断的？",
      "不用说很长，先说它有几条边，或者有没有角。",
      "请先说一个图形特征，比如几条边或有没有角。",
    ],
    data: [
      "请说一句小方法：你从表里的哪里读到数量？",
      "不用说很长，先说你看的是哪一行或哪一列。",
      "你先说：我先找对应的位置，再看数量。",
    ],
    logic: [
      "请说一句小方法：你先用了哪条线索？",
      "不用说很长，先说哪个条件最确定。",
      "你先说：我先排除哪一种不可能。",
    ],
    measure: [
      "请说一句小方法：为什么要先看单位或起点？",
      "不用说很长，先说你先看单位，还是先看刻度。",
      "你先说：从哪里开始量，到哪里结束。",
    ],
  };
  let options = optionsByFamily[family] || [
    "请说一句小方法：你先看什么，再做什么？",
    "不用说很长，先说你怎么想的。",
    "你先补一句原因：为什么这样做？",
  ];
  if (reasonPlan?.repeatSentence && (family === "composition" || /说清|为什么|检查|原因/.test(text))) {
    return createExplicitRepeatInstruction(reasonPlan.repeatSentence);
  }
  if (/分与合|分成|组成|总数|另一部分|两部分|合起来/.test(text) && !hasMoneyTerm(text)) options = optionsByFamily.composition;
  if (/符号|比较|大于|小于|等号|哪边/.test(text)) options = optionsByFamily.compare;
  if (hasMoneyTerm(text) || (/单位/.test(text) && family === "money")) options = optionsByFamily.money;
  if (/找回|找零|购物|价钱|付的钱/.test(text)) options = optionsByFamily.moneyApplication;
  if (/凑十/.test(text)) options = optionsByFamily.makeTenAdd;
  if (/破十|退位|不够减/.test(text)) options = optionsByFamily.breakTenSubtract;
  return ensureChineseSentence(pickNaturalVariant(options, key));
}

function parseMoneyQuestion(question) {
  const rawPrompt = String(question?.prompt || "");
  const prompt = rawPrompt.replace(/^填空[:：]\s*/, "").replace(/。+$/, "");
  const targetUnit = inferMoneyTargetUnit(prompt, question);
  const leftSide = prompt.split("=")[0] || prompt;
  const relationQuestion = /1\s*元\s*=.*角.*分/.test(prompt) || /1元=/.test(normalizeText(prompt));
  const sourceFen = Number(leftSide.match(/(\d+)\s*分/)?.[1] || 0);
  const yuan = Number(leftSide.match(/(\d+)\s*元/)?.[1] || 0);
  const jiao = Number(leftSide.match(/(\d+)\s*角/)?.[1] || 0);
  const fen = Number(leftSide.match(/(\d+)\s*分/)?.[1] || 0);
  if (!relationQuestion && !targetUnit && !yuan && !jiao && !fen) return null;
  return {
    isRelationQuestion: relationQuestion,
    targetUnit: targetUnit || (fen ? "角" : "角"),
    yuan: Number.isFinite(yuan) ? yuan : 0,
    jiao: Number.isFinite(jiao) ? jiao : 0,
    fen: Number.isFinite(fen) ? fen : 0,
    sourceFen: Number.isFinite(sourceFen) && !yuan && !jiao ? sourceFen : 0,
  };
}

function inferMoneyTargetUnit(prompt, question) {
  const normalizedPrompt = normalizeText(prompt);
  if (/=_{2,}分/.test(prompt) || /=\s*\d+\s*分/.test(prompt) || normalizedPrompt.includes("多少分")) return "分";
  if (/=_{2,}角/.test(prompt) || /=\s*\d+\s*角/.test(prompt) || normalizedPrompt.includes("多少角")) return "角";
  const answer = String(question?.answer || "");
  if (/分/.test(answer)) return "分";
  if (/角/.test(answer)) return "角";
  return "";
}

function moneyReasonKeywords(unit) {
  return uniqueKeywords([
    "单位不同",
    "不是同一种单位",
    "同一种单位",
    "先换单位",
    `先换成${unit}`,
    `先都换成${unit}`,
    "元和角不一样",
    "元和角不是同一种单位",
    "角和分不一样",
    "角和分不是同一种单位",
    "因为元和角单位不一样所以要先换成角",
  ]);
}

function createExplanationRepeatSentence(explanation, fallbackTopic) {
  const source = String(explanation || "").trim();
  const candidates = source
    .split(/[。！？!?]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const picked =
    candidates.find((item) => /因为|所以|先|再|用|等于|表示|比较|单位|平均|排除|合起来/.test(item)) ||
    candidates[0] ||
    `我先看题目，再一步一步想${fallbackTopic ? `这个知识点` : ""}`;
  return simplifyRepeatSentence(picked);
}

function createReasonRepeatSentence(label, prompt, answerKeywords = []) {
  const text = normalizeText(`${label || ""}${prompt || ""}${(answerKeywords || []).join("")}`);
  if (text.includes("元") && text.includes("角") && text.includes("分")) return "因为1元等于10角，1角等于10分，所以1元等于100分。";
  if (text.includes("元") && text.includes("角")) return "因为元和角不是同一种单位，所以要先把元换成角。";
  if (text.includes("角") && text.includes("分")) return "因为角和分不是同一种单位，所以要先换成同一种单位。";
  if (text.includes("比较") || text.includes("符号")) return "我先看两边的数，再比较谁大谁小。";
  if (text.includes("分是对") || text.includes("合起来检查")) return "因为两部分合起来还是总数，所以这样分是对的。";
  if (text.includes("第几个")) return "第几个说的是位置，不是一共有几个。";
  if (text.includes("规律")) return "我先看每次怎么变，再按同样的规律接着填。";
  if (text.includes("最后一个数") || text.includes("总数")) return "按顺序数完，最后说到的数就是总数。";
  if (text.includes("凑十")) return "我先看哪个数快到10，把另一个数拆开，先凑成10，再加剩下的数。";
  if (text.includes("破十") || text.includes("退位") || text.includes("十几减")) return "个位不够减时，先把十几拆成10和几，用10先减，再加回剩下的几。";
  if (text.includes("乘法")) return "因为每组同样多，几个几可以用乘法。";
  if (text.includes("除法") || text.includes("平均分")) return "因为是平均分，每份同样多，可以用除法。";
  if (text.includes("减法") || text.includes("找回") || text.includes("还剩")) return "因为题目问剩下多少，所以用减法。";
  if (text.includes("加法") || text.includes("一共")) return "因为题目问一共多少，所以用加法。";
  if (text.includes("钟") || text.includes("时针") || text.includes("分针") || text.includes("时间")) return "我先看短针是几时，再看长针是几分。";
  if (text.includes("厘米") || text.includes("米") || text.includes("长度") || text.includes("刻度")) return "量长度要从0刻度开始，再看另一端对着几。";
  if (text.includes("顶点") || text.includes("两条边") || text.includes("张开") || text.includes("角")) return "角的大小看张开的大小，不看边画得多长。";
  if (text.includes("克") || text.includes("千克")) return "轻小的物体常用克，比较重的物体常用千克。";
  if (text.includes("数位") || text.includes("读写")) return "因为每个数字所在的数位不同，表示的大小也不同。";
  if (text.includes("排除") || text.includes("推理")) return "我先排除不可能的，再看剩下的。";
  if (text.includes("图形") || text.includes("特征")) return "我先看图形的特征，再说它的名字。";
  if (text.includes("表") || text.includes("统计")) return "我先看表里的那一行或那一列，再读出数量。";
  return "我先看题目问什么，再一步一步算。";
}

function simplifyRepeatSentence(sentence) {
  const cleaned = String(sentence || "")
    .replace(/^解[:：]\s*/, "")
    .replace(/^答[:：]\s*/, "")
    .replace(/所以答案是.*$/, "")
    .replace(/。+$/, "")
    .trim();
  const short = cleaned.length > 36 ? cleaned.slice(0, 36).replace(/[，,、][^，,、]*$/, "") : cleaned;
  return `${short || "我先看题目，再一步一步想"}。`;
}

function extractRepeatKeywords(sentence) {
  const text = String(sentence || "");
  if (!text) return [];
  const phrases = text
    .replace(/[。！？!?]/g, "")
    .split(/[，,、；;：:\s]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
  return uniqueKeywords([
    text.replace(/[，,。！？!?；;：:\s]/g, ""),
    ...phrases,
    ...extractKeyPhrases(text),
  ]);
}

function createTypedGuidedSteps(lesson) {
  const question = lesson?.activeQuestion || null;
  const prompt = question?.prompt || lesson?.problem || "";
  const family = inferActiveQuestionFamily(lesson, question);
  const visualType = visualTypeForTeachingFamily(family, lesson?.baseVisualType || lesson?.visualType || "generic");
  const typedLesson = { ...lesson, visualType };
  const text = normalizeText(`${prompt} ${question?.type || ""} ${lesson?.node || ""} ${lesson?.lesson || ""} ${visualType}`);

  if (family === "moneyApplication") return createMoneyApplicationGuidedSteps(typedLesson, question);
  if (family === "money") return createMoneyGuidedSteps(typedLesson);
  if (family === "makeTenAdd") return createMakeTenAddGuidedSteps(typedLesson, question);
  if (family === "breakTenSubtract") return createBreakTenSubtractGuidedSteps(typedLesson, question);
  if (family === "concreteSubtraction") return createConcreteSubtractionGuidedSteps(typedLesson, question);
  if (family === "concreteAddition") return createConcreteAdditionGuidedSteps(typedLesson, question);
  if (family === "mixedCalculation") return createMixedCalculationGuidedSteps(typedLesson, question);
  if (family === "comparisonDifference") return createComparisonDifferenceGuidedSteps(typedLesson, question);
  if (family === "arrangement") return createArrangementGuidedSteps(typedLesson, question);
  if (family === "observation") return createObservationGuidedSteps(typedLesson, question);
  if (family === "timeDuration") return createTimeDurationGuidedSteps(typedLesson, question);
  if (family === "angle") return createAngleGuidedSteps(typedLesson, question);
  if (family === "remainderDivision") return createRemainderDivisionGuidedSteps(typedLesson, question);
  if (family === "remainderApplication") return createRemainderApplicationGuidedSteps(typedLesson, question);
  if (family === "division") return createDivisionGuidedSteps(typedLesson, question);
  if (isCountQuestion(question, typedLesson, text)) return createCountGuidedSteps(typedLesson, question);
  if (isOrdinalQuestion(prompt, text)) return createOrdinalGuidedSteps(typedLesson, question);
  if (isCompositionQuestion(prompt, text)) return createCompositionGuidedSteps(typedLesson, question);
  if (isTimeQuestion(text, typedLesson)) return createTimeGuidedSteps(typedLesson, question);
  if (isMeasureQuestion(text, typedLesson)) return createMeasureGuidedSteps(typedLesson, question);
  if (isLogicQuestion(text, typedLesson)) return createLogicGuidedSteps(typedLesson, question);
  if (isDivisionQuestion(prompt, text, typedLesson)) return createDivisionGuidedSteps(typedLesson, question);
  if (isMultiplicationQuestion(prompt, text, typedLesson)) return createMultiplicationGuidedSteps(typedLesson, question);
  if (isApplicationQuestion(question, text)) return createApplicationGuidedSteps(typedLesson, question);
  if (isCompareQuestion(question, typedLesson, text)) return createCompareGuidedSteps(typedLesson, question);
  if (isCalculationQuestion(prompt, text)) return createCalculationGuidedSteps(typedLesson, question);
  if (isPlaceValueQuestion(prompt, text, typedLesson)) return createPlaceValueGuidedSteps(typedLesson, question);
  if (isPatternQuestion(prompt, text)) return createPatternGuidedSteps(typedLesson, question);
  if (isDataQuestion(text, typedLesson)) return createDataGuidedSteps(typedLesson, question);
  if (isShapeQuestion(text, typedLesson)) return createShapeGuidedSteps(typedLesson, question);

  return [];
}

function isCompareQuestion(question, lesson, text) {
  return (
    lesson?.visualType === "compare" ||
    text.includes("比较") ||
    text.includes("大小") ||
    text.includes("大于") ||
    text.includes("小于") ||
    /[□_]\s*[0-9一二三四五六七八九十百]/.test(question?.prompt || "") ||
    /[0-9一二三四五六七八九十百]\s*[□_]/.test(question?.prompt || "")
  );
}

function isCompositionQuestion(prompt, text) {
  return /把\s*\d+\s*分成/.test(prompt) || /[0-9]\s*\+\s*_{2,}\s*=/.test(prompt) || /_{2,}\s*\+\s*[0-9]\s*=/.test(prompt);
}

function isOrdinalQuestion(prompt, text) {
  return /第\s*\d+/.test(prompt) || text.includes("第几个") || text.includes("前面有") || text.includes("后面有");
}

function isPatternQuestion(prompt, text) {
  if (/个千|个百|个十|个一/.test(prompt)) return false;
  return text.includes("规律") || /、\s*_{2,}/.test(prompt) || /[△○□☆]\s+[△○□☆]/.test(prompt);
}

function isCountQuestion(question, lesson, text) {
  return lesson?.visualType === "count" || text.includes("看图数一数") || text.includes("一共有几个");
}

function isApplicationQuestion(question, text) {
  return (
    normalizeText(question?.type || "").includes("应用题") ||
    ["一共有", "还剩", "找回", "付了", "用去", "飞走", "又得到", "平均每", "每份"].some((keyword) => text.includes(normalizeText(keyword)))
  );
}

function isCalculationQuestion(prompt, text) {
  return text.includes("计算") || parseArithmeticExpression(prompt);
}

function isMultiplicationQuestion(prompt, text, lesson) {
  return (
    lesson?.visualType === "array" ||
    text.includes("乘法") ||
    text.includes("几个几") ||
    text.includes("同样多") ||
    text.includes("每组") ||
    text.includes("口诀") ||
    /[×xX*]/.test(prompt) ||
    /(\d+)\s*(个|组|行|列|份)\s*(\d+)/.test(prompt)
  );
}

function isDivisionQuestion(prompt, text, lesson) {
  if (lesson?.visualType === "logic" || text.includes("排除法")) return false;
  return lesson?.visualType === "sharing" || text.includes("除法") || text.includes("平均分") || /[÷/]/.test(prompt);
}

function isTimeQuestion(text, lesson) {
  return lesson?.visualType === "clock" || lesson?.visualType === "time" || text.includes("钟") || text.includes("时针") || text.includes("分针");
}

function isMeasureQuestion(text, lesson) {
  return ["ruler", "mass", "angle"].includes(lesson?.visualType) || text.includes("厘米") || text.includes("米") || text.includes("克") || text.includes("千克");
}

function isShapeQuestion(text, lesson) {
  return lesson?.visualType === "shape" || text.includes("图形") || text.includes("长方体") || text.includes("正方体") || text.includes("圆柱") || text.includes("球") || text.includes("轴对称") || text.includes("平移") || text.includes("旋转");
}

function isDataQuestion(text, lesson) {
  return (
    lesson?.visualType === "data" ||
    text.includes("分类") ||
    text.includes("统计") ||
    text.includes("读表") ||
    text.includes("记录表") ||
    text.includes("统计表") ||
    text.includes("表格") ||
    text.includes("表里") ||
    text.includes("表中")
  );
}

function isPlaceValueQuestion(prompt, text, lesson) {
  return (
    lesson?.visualType === "place-value" ||
    text.includes("数位") ||
    text.includes("读写") ||
    text.includes("读作") ||
    text.includes("写作") ||
    /里面有.*个(千|百|十|一)/.test(prompt) ||
    /(\d+|[一二三四五六七八九十百千万零]+).*(个千|个百|个十|个一)/.test(prompt)
  );
}

function isLogicQuestion(text, lesson) {
  return lesson?.visualType === "logic" || text.includes("推理") || text.includes("排除") || text.includes("不是");
}

function createCompareGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const numbers = extractNumbers(prompt);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const symbol = getCompareSymbol(question?.answer || answerKeywords[0] || "");
  if (numbers.length >= 2) {
    const [left, right] = numbers;
    const largerSide = left === right ? "一样大" : left > right ? "左边大" : "右边大";
    const relationSentence =
      left === right
        ? `左边${left}，右边${right}，两边一样大。`
        : left > right
          ? `左边${left}比右边${right}大。`
          : `左边${left}比右边${right}小。`;
    const symbolName = compareSymbolName(symbol);
    return [
      guidedStep("看清两边", `先看左边是${left}，右边是${right}。哪边大？`, [largerSide, left > right ? "左边" : right > left ? "右边" : "一样", left > right ? left : right, "大", "小", "相等"], {
        teacherHint: `左边是${left}，右边是${right}。先别填符号，只判断哪边大：${largerSide}。`,
      }),
      guidedStep("填比较符号", "方框里填大于号、小于号，还是等号？", answerKeywords.concat(compareSymbolKeywords(symbol)), {
        bridgeMessage: `${relationSentence}符号的开口要朝大的那边。`,
        followPrompt: "你想一想，方框里填大于号、小于号，还是等号？",
        teacherHint: `${relationSentence}符号开口朝大的数，所以这里填「${symbolName}」。`,
      }),
      guidedStep("说清比较方法", "你怎么知道该填这个符号？", ["比", "大", "小", "相等", "一样", "左边", "右边", "先比", "一一对应"], { isReason: true, isFinal: true }),
    ];
  }
  return [
    guidedStep("看清两边", "先说说左边和右边分别是什么。", ["左边", "右边", "两边", "一边"]),
    guidedStep("填比较符号", "再说方框里填大于号、小于号，还是等号？", answerKeywords.concat(compareSymbolKeywords(symbol))),
    guidedStep("说清比较方法", "你怎么比较出来的？", ["比", "大", "小", "相等", "一样", "一一对应", "十位", "个位"], { isReason: true, isFinal: true }),
  ];
}

function createCompositionGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const match = prompt.match(/把\s*(\d+)\s*分成\s*(\d+)\s*和/);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (match) {
    const total = Number(match[1]);
    const known = Number(match[2]);
    const missing = total - known;
    return [
      guidedStep("看总数", `先看总数是多少？`, answerKeywordsForNumber(total), {
        teacherHint: `分与合先看总数。这里总数是${total}，意思是两部分合起来还是${total}。`,
      }),
      guidedStep("找另一部分", `已经有一部分是${known}，另一部分是几？`, answerKeywordsForNumber(missing).concat(answerKeywords), {
        teacherHint: `${known}还差${missing}就到${total}，所以另一部分是${missing}。`,
        bridgeMessage: "总数和一部分都知道了，就找缺的那部分。",
      }),
      guidedStep("合起来检查", "为什么这样分是对的？", ["合起来", "加起来", `${known}+${missing}`, `${missing}+${known}`, String(total), "总数不变"], {
        isReason: true,
        isFinal: true,
        repeatSentence: `因为${known}和${missing}合起来是${total}，所以这样分是对的。`,
      }),
    ];
  }
  return [
    guidedStep("看总数", "先说总数是多少。", ["总数", "一共"], {
      teacherHint: "分与合先看总数，总数不变，两部分合起来还要等于总数。",
    }),
    guidedStep("找另一部分", `另一部分是几？`, answerKeywords, {
      teacherHint: "知道总数和其中一部分，就想还差几能合成总数。",
    }),
    guidedStep("合起来检查", "怎么检查分得对不对？", ["合起来", "加起来", "总数不变"], {
      isReason: true,
      isFinal: true,
      repeatSentence: "两部分合起来还是总数，所以这样分是对的。",
    }),
  ];
}

function createOrdinalGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const ordinal = Number(prompt.match(/第\s*(\d+)/)?.[1] || NaN);
  const directionKeywords = prompt.includes("从右") ? ["从右", "右边"] : prompt.includes("从左") ? ["从左", "左边"] : ["从左", "从右", "方向"];
  return [
    guidedStep("先定方向", "先说从哪边开始数。", directionKeywords, {
      teacherHint: "位置题最容易错在方向。先看题目说从左数，还是从右数，再开始数。",
    }),
    guidedStep("找到第几个", Number.isFinite(ordinal) ? `目标是第${ordinal}个，对吗？` : "再找到题目说的第几个。", Number.isFinite(ordinal) ? [`第${ordinal}`, String(ordinal), chineseNumber(ordinal)] : ["第几个", "位置"], {
      teacherHint: Number.isFinite(ordinal)
        ? `第${ordinal}个说的是位置，不是总数。要一个一个点到第${ordinal}个。`
        : "第几个说的是位置，要按方向一个一个点过去。",
      bridgeMessage: "方向定好了，再找位置。",
    }),
    guidedStep("回答前面或后面", "题目问前面或后面有几个，就只数那一边。答案是几？", answerKeywords, {
      teacherHint: "找到目标以后，只数它前面或后面的那一边，别把目标自己也算进去。",
    }),
    guidedStep("区分几个和第几个", "为什么第几个不是一共有几个？", ["位置", "第几个", "一共有", "前面", "后面"], {
      isReason: true,
      isFinal: true,
      repeatSentence: "第几个说的是位置，几个说的是数量，所以要分开看。",
    }),
  ];
}

function createPatternGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const numbers = extractNumbers(prompt);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const change = numbers.length >= 2 ? numbers[1] - numbers[0] : null;
  const changeKeywords = change ? [`加${change}`, `多${change}`, `每次多${change}`, `少${Math.abs(change)}`, `每次少${Math.abs(change)}`] : [];
  return [
    guidedStep("找变化", "先看相邻两个数是怎么变的。", ["规律", "每次", "多", "少", "加", "减"].concat(changeKeywords), {
      teacherHint: change
        ? `找规律先看前两个数的变化。这里每次${change > 0 ? `多${change}` : `少${Math.abs(change)}`}。`
        : "找规律不是乱猜，要看相邻两个数或图形每次怎么变。",
    }),
    guidedStep("补下一个", "按这个规律，下一个应该填什么？", answerKeywords, {
      teacherHint: "规律找到后，照着同样的变化往后接一个。",
      bridgeMessage: "变化看出来了，再按同样的变化补。",
    }),
    guidedStep("说清规律", "你发现的规律是什么？", ["每次", "规律", "接着", "多", "少", "加", "减"].concat(changeKeywords), {
      isReason: true,
      isFinal: true,
      repeatSentence: change
        ? `我先看相邻两个数，发现每次${change > 0 ? `多${change}` : `少${Math.abs(change)}`}，所以按同样的规律接着填。`
        : "我先看每次怎么变，再按同样的规律接着填。",
    }),
  ];
}

function createCountGuidedSteps(lesson, question) {
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  return [
    guidedStep("按顺序数", "先说怎么数才不会漏也不会重复。", ["按顺序", "一个一个", "不漏", "不重复", "做记号"], {
      teacherHint: "数物体要按顺序，一个一个点着数；数过的可以做记号，这样不漏也不重复。",
    }),
    guidedStep("说总数", "数完以后，一共有几个？", answerKeywords, {
      teacherHint: "数到最后一个物体时，说出的那个数，就是一共有几个。",
      bridgeMessage: "数法稳了，再说总数。",
    }),
    guidedStep("说清最后一个数", "为什么最后说出的那个数就是总数？", ["最后一个数", "总数", "一共", "数完"], {
      isReason: true,
      isFinal: true,
      repeatSentence: "因为一个一个按顺序数完，最后说出的数就是总数。",
    }),
  ];
}

function createMakeTenAddGuidedSteps(lesson, question) {
  const expression = parseTeachingArithmeticExpression(question);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (!isMakeTenAdditionExpression(expression)) {
    return [
      guidedStep("找快到10的数", "先找哪个数快到10。", ["快到10", "离10近", "凑十", "9", "8", "7", "6"], {
        teacherHint: "凑十法先找一个快到10的数，先把它补成10。",
      }),
      guidedStep("说还差几", "它离10还差几？", ["差", "还差", "到10"]),
      guidedStep("先凑十", "把另一个数拆开，先凑成10。", ["拆", "凑成10", "先凑十"]),
      guidedStep("说清凑十法", "凑十法是怎么想的？", ["凑十", "先", "再", "剩下"], {
        isReason: true,
        isFinal: true,
        repeatSentence: "先把快到10的数凑成10，再加剩下的数。",
      }),
    ];
  }

  const base = expression.left >= expression.right ? expression.left : expression.right;
  const addend = expression.left >= expression.right ? expression.right : expression.left;
  const gap = 10 - base;
  const remain = addend - gap;
  const total = expression.result;
  const displayExpression = `${expression.left}+${expression.right}`;
  return [
    guidedStep("找快到10的数", `先看${displayExpression}里，哪个数快到10？`, answerKeywordsForNumber(base).concat([`${base}`, `${base}快到10`, `先看${base}`]), {
      teacherHint: `${base}离10最近，我们先把${base}凑成10。先说哪个数快到10：${base}。`,
      bridgeMessage: `${base}快到10，先补它最省力。`,
    }),
    guidedStep("说还差几", `${base}离10还差几？`, answerKeywordsForNumber(gap).concat([`差${gap}`, `还差${gap}`]), {
      teacherHint: `${base}再加${gap}就到10。你先说：差${gap}。`,
      bridgeMessage: `对，${base}还差${gap}到10。`,
    }),
    guidedStep("拆另一个数", `把${addend}拆成${gap}和几？`, answerKeywordsForNumber(remain).concat([`${gap}和${remain}`, `${remain}`, `拆成${gap}和${remain}`]), {
      teacherHint: `因为${base}差${gap}到10，所以先从${addend}里面拿出${gap}，剩下${remain}。`,
      bridgeMessage: `这样就能先凑出一个10。`,
    }),
    guidedStep("先凑成10", `${base}+${gap}先变成多少？`, answerKeywordsForNumber(10).concat(["10", "十"]), {
      teacherHint: `${base}+${gap}=10，先得到一个整十。`,
      bridgeMessage: `有了10，后面就好算了。`,
    }),
    guidedStep("再加剩下", `10再加${remain}是多少？`, answerKeywordsForNumber(total).concat(answerKeywords), {
      teacherHint: `10再加剩下的${remain}，就是${total}。`,
      bridgeMessage: `结果出来了，现在补一句方法。`,
    }),
    guidedStep("说清凑十法", "你是怎么用凑十法想的？", ["凑十", "先", "再", String(base), String(gap), String(remain), String(total)], {
      isReason: true,
      isFinal: true,
      repeatSentence: `${base}差${gap}到10，把${addend}拆成${gap}和${remain}，先凑成10，再加${remain}，所以${displayExpression}=${total}。`,
    }),
  ];
}

function createBreakTenSubtractGuidedSteps(lesson, question) {
  const expression = parseTeachingArithmeticExpression(question);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (!isBreakTenSubtractionExpression(expression)) {
    return [
      guidedStep("看个位够不够", "先看个位够不够减。", ["不够", "够", "个位", "退位", "破十"], {
        teacherHint: "十几减几时，如果个位不够减，就把十几拆成10和几。",
      }),
      guidedStep("拆成10和几", "把十几拆成10和几。", ["10和", "十和", "拆"]),
      guidedStep("先用10去减", "先用10去减要减的数。", ["10减", "先减"]),
      guidedStep("说清破十法", "破十法是怎么想的？", ["破十", "拆成10和几", "先", "再", "加回"], {
        isReason: true,
        isFinal: true,
        repeatSentence: "个位不够减时，先把十几拆成10和几，用10先减，再加回剩下的几。",
      }),
    ];
  }

  const ones = expression.left - 10;
  const tenMinus = 10 - expression.right;
  const total = expression.result;
  const displayExpression = `${expression.left}-${expression.right}`;
  return [
    guidedStep("看个位够不够", `${expression.left}的个位是${ones}，够减${expression.right}吗？`, ["不够", "不够减", "个位不够", "不能直接减"], {
      teacherHint: `${ones}比${expression.right}小，个位不够减，所以要破十。你先说：不够。`,
      bridgeMessage: `对，个位不够减，不能硬减。`,
    }),
    guidedStep("拆成10和几", `${expression.left}可以拆成10和几？`, answerKeywordsForNumber(ones).concat([`10和${ones}`, `${ones}`, `十和${ones}`]), {
      teacherHint: `${expression.left}里面有一个10，还剩${ones}。你说：10和${ones}。`,
      bridgeMessage: `拆开以后，先用10来帮忙。`,
    }),
    guidedStep("先用10减", `先算10-${expression.right}等于几？`, answerKeywordsForNumber(tenMinus).concat([`${tenMinus}`, `10减${expression.right}等于${tenMinus}`]), {
      teacherHint: `先算10-${expression.right}=${tenMinus}。这一步只要说出中间结果：${tenMinus}。`,
      bridgeMessage: `这一步算出来了，还要把原来个位上的数加回来。`,
    }),
    guidedStep("加回个位", `${tenMinus}再加${ones}是多少？`, answerKeywordsForNumber(total).concat(answerKeywords), {
      teacherHint: `${tenMinus}+${ones}=${total}，所以${displayExpression}=${total}。`,
      bridgeMessage: `结果对上了，现在说一句方法。`,
    }),
    guidedStep("说清破十法", "你是怎么用破十法想的？", ["破十", "拆成10和", "10减", "加回", String(total)], {
      isReason: true,
      isFinal: true,
      repeatSentence: `个位不够减，把${expression.left}拆成10和${ones}，先算10-${expression.right}=${tenMinus}，再加${ones}，所以${displayExpression}=${total}。`,
    }),
  ];
}

function createConcreteSubtractionGuidedSteps(lesson, question) {
  const expression = parseTeachingArithmeticExpression(question);
  const prompt = question?.prompt || lesson?.problem || "";
  const numbers = extractNumbers(prompt);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const original = expression?.operator === "-" ? expression.left : numbers[0];
  const removed = expression?.operator === "-" ? expression.right : numbers[1];
  const result = expression?.operator === "-" ? expression.result : Number(String(question?.answer || "").match(/\d+/)?.[0] || NaN);
  if (Number.isFinite(original) && Number.isFinite(removed)) {
    return [
      guidedStep("看原来有几个", `先看原来有几个？`, answerKeywordsForNumber(original).concat([String(original), `${original}个`]), {
        teacherHint: `减法先找“原来有多少”。这里原来是${original}，先说这个数。`,
        bridgeMessage: `原来的数找到了。`,
      }),
      guidedStep("看拿走几个", `再看拿走、用去或少了几个？`, answerKeywordsForNumber(removed).concat([String(removed), `${removed}个`]), {
        teacherHint: `减法就是从原来里面去掉一部分。这里去掉${removed}。`,
        bridgeMessage: `去掉的数也找到了。`,
      }),
      guidedStep("数还剩几个", `从${original}里去掉${removed}，还剩几个？`, answerKeywords.concat(Number.isFinite(result) ? answerKeywordsForNumber(result) : []), {
        teacherHint: Number.isFinite(result) ? `${original}-${removed}=${result}，所以还剩${result}。` : "可以画掉拿走的，再数剩下的。",
        bridgeMessage: `结果有了，最后说清减法的意思。`,
      }),
      guidedStep("说清减法意思", "为什么这里用减法？", ["原来", "拿走", "去掉", "少了", "还剩", "减法"], {
        isReason: true,
        isFinal: true,
        repeatSentence: `因为是从原来的${original}里去掉${removed}，求还剩多少，所以用减法。`,
      }),
    ];
  }
  return [
    guidedStep("找原来", "先找原来有多少。", ["原来", "一开始", "有"]),
    guidedStep("找拿走", "再找拿走、用去或少了多少。", ["拿走", "用去", "少了", "飞走", "去掉"]),
    guidedStep("说还剩", "去掉以后还剩多少？", answerKeywords),
    guidedStep("说清减法意思", "为什么这里用减法？", ["原来", "去掉", "还剩", "减法"], { isReason: true, isFinal: true }),
  ];
}

function createConcreteAdditionGuidedSteps(lesson, question) {
  const expression = parseTeachingArithmeticExpression(question);
  const prompt = question?.prompt || lesson?.problem || "";
  const numbers = extractNumbers(prompt);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const first = expression?.operator === "+" ? expression.left : numbers[0];
  const second = expression?.operator === "+" ? expression.right : numbers[1];
  const result = expression?.operator === "+" ? expression.result : Number(String(question?.answer || "").match(/\d+/)?.[0] || NaN);
  if (Number.isFinite(first) && Number.isFinite(second)) {
    return [
      guidedStep("看第一部分", `先看第一部分有几个？`, answerKeywordsForNumber(first).concat([String(first), `${first}个`]), {
        teacherHint: `加法先找两部分。第一部分是${first}，先说这个数。`,
        bridgeMessage: `第一部分找到了。`,
      }),
      guidedStep("看第二部分", `再看又来或另一部分有几个？`, answerKeywordsForNumber(second).concat([String(second), `${second}个`]), {
        teacherHint: `第二部分是${second}。两部分要合起来。`,
        bridgeMessage: `两部分都有了，现在合起来。`,
      }),
      guidedStep("合起来数", `${first}和${second}合起来一共几个？`, answerKeywords.concat(Number.isFinite(result) ? answerKeywordsForNumber(result) : []), {
        teacherHint: Number.isFinite(result) ? `${first}+${second}=${result}，所以一共${result}。` : "可以接着数，也可以画图合起来数。",
        bridgeMessage: `结果有了，最后说清加法的意思。`,
      }),
      guidedStep("说清加法意思", "为什么这里用加法？", ["一共", "合起来", "又来", "加法"], {
        isReason: true,
        isFinal: true,
        repeatSentence: `因为把${first}和${second}合起来，求一共有多少，所以用加法。`,
      }),
    ];
  }
  return [
    guidedStep("找第一部分", "先找第一部分有多少。", ["第一部分", "原来", "有"]),
    guidedStep("找第二部分", "再找又来或另一部分有多少。", ["又来", "另一部分", "第二部分"]),
    guidedStep("说一共", "合起来一共有多少？", answerKeywords),
    guidedStep("说清加法意思", "为什么这里用加法？", ["一共", "合起来", "加法"], { isReason: true, isFinal: true }),
  ];
}

function createMixedCalculationGuidedSteps(lesson, question) {
  const chain = parseArithmeticChain(question?.prompt || lesson?.problem || "");
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (chain) {
    return [
      guidedStep("看第一步", `${chain.rule}，先算${chain.first.left}${chain.first.operator}${chain.first.right}。先得几？`, answerKeywordsForNumber(chain.first.result), {
        teacherHint: `${chain.rule}。第一步${chain.first.left}${chain.first.operator}${chain.first.right}=${chain.first.result}。`,
        bridgeMessage: `第一步记住了。`,
      }),
      guidedStep("记中间结果", `第一步算完得到的中间结果是多少？`, answerKeywordsForNumber(chain.first.result).concat([String(chain.first.result), "中间结果"]), {
        teacherHint: `不要把${chain.first.result}丢掉，它是下一步要用的中间结果。`,
        bridgeMessage: `中间结果不丢，继续下一步。`,
      }),
      guidedStep("算第二步", `再算${chain.second.left}${chain.second.operator}${chain.second.right}，结果是多少？`, answerKeywords.concat(answerKeywordsForNumber(chain.result)), {
        teacherHint: `${chain.second.left}${chain.second.operator}${chain.second.right}=${chain.result}。`,
        bridgeMessage: `结果出来了，说清顺序就可以。`,
      }),
      guidedStep("说清顺序", "你先算什么，再算什么？", ["先算", "再算", "中间结果", "乘除", "加减"], {
        isReason: true,
        isFinal: true,
        repeatSentence: `${chain.rule}，先算${chain.first.left}${chain.first.operator}${chain.first.right}=${chain.first.result}，再算${chain.second.left}${chain.second.operator}${chain.second.right}=${chain.result}。`,
      }),
    ];
  }
  return [
    guidedStep("看第一步", "先看这道题有没有乘除或小括号。第一步应该算哪里？", ["第一步", "先算", "乘除", "小括号", "左边"]),
    guidedStep("记中间结果", "第一步算完的数要先记住。", ["中间结果", "记住"]),
    guidedStep("算到最后", "再接着算，最后答案是多少？", answerKeywords),
    guidedStep("说清顺序", "你先算什么，再算什么？为什么？", ["先", "再", "乘除", "从左往右", "中间结果"], { isReason: true, isFinal: true }),
  ];
}

function createComparisonDifferenceGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const numbers = extractNumbers(prompt).slice(0, 2);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (numbers.length >= 2) {
    const bigger = Math.max(numbers[0], numbers[1]);
    const smaller = Math.min(numbers[0], numbers[1]);
    const difference = bigger - smaller;
    return [
      guidedStep("找谁多", `先看两个数量：${numbers[0]}和${numbers[1]}。谁多？`, answerKeywordsForNumber(bigger).concat(["多", "大数", String(bigger)]), {
        teacherHint: `先别算，先找多的一边。${bigger}比${smaller}多。`,
        bridgeMessage: `多的一边找到了。`,
      }),
      guidedStep("一一配对", "如果把两边一一配对，剩下的那一截表示什么？", ["多出来", "剩下", "差", "多多少", "少多少"], {
        teacherHint: "一一配对后，配不上的部分就是多出来的数量。",
        bridgeMessage: `现在就能用减法求这段差。`,
      }),
      guidedStep("大数减小数", `${bigger}-${smaller}等于几？`, answerKeywords.concat(answerKeywordsForNumber(difference)), {
        teacherHint: `${bigger}-${smaller}=${difference}，所以相差${difference}。`,
        bridgeMessage: `结果有了，最后说清为什么用减法。`,
      }),
      guidedStep("说清为什么", "为什么多多少要用减法？", ["多出来", "一一配对", "大数减小数", "差", String(difference)], {
        isReason: true,
        isFinal: true,
        repeatSentence: `先一一配对，剩下的就是多出来的，所以用大数${bigger}减小数${smaller}，相差${difference}。`,
      }),
    ];
  }
  return [
    guidedStep("找谁多", "先说哪一边多，哪一边少。", ["多", "少", "大数", "小数"]),
    guidedStep("一一配对", "配对后剩下的表示什么？", ["多出来", "剩下", "差"]),
    guidedStep("大数减小数", "用大数减小数，差是多少？", answerKeywords),
    guidedStep("说清为什么", "为什么这样算？", ["大数减小数", "多出来", "一一配对"], { isReason: true, isFinal: true }),
  ];
}

function createArrangementGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const numbers = extractNumbers(prompt).slice(0, 2);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (numbers.length >= 2) {
    const first = numbers[0];
    const second = numbers[1];
    const total = first * second;
    return [
      guidedStep("看第一类", `先看第一类有几种？`, answerKeywordsForNumber(first).concat([`${first}种`, String(first)]), {
        teacherHint: `先固定第一类。这里第一类有${first}种。`,
        bridgeMessage: `第一类数量找到了。`,
      }),
      guidedStep("看第二类", `再看第二类有几种？`, answerKeywordsForNumber(second).concat([`${second}种`, String(second)]), {
        teacherHint: `第二类有${second}种。每一种第一类都能和这${second}种配。`,
        bridgeMessage: `两类数量都有了。`,
      }),
      guidedStep("有序搭配", `每一种第一类都配${second}种，所以一共有几个${second}？`, answerKeywordsForNumber(first).concat([`${first}个${second}`, "每一种都配", "不漏不重"]), {
        teacherHint: `有${first}种第一类，就有${first}个${second}种搭配。`,
        bridgeMessage: `有顺序地配，就不会漏。`,
      }),
      guidedStep("算总种数", `${first}×${second}等于几种？`, answerKeywords.concat(answerKeywordsForNumber(total, "种")), {
        teacherHint: `${first}×${second}=${total}，所以一共有${total}种。`,
        bridgeMessage: `结果有了，最后说清方法。`,
      }),
      guidedStep("说清不漏不重", "你怎么保证没有漏掉、也没有重复？", ["固定", "每一种", "都配", "不漏", "不重复", String(total)], {
        isReason: true,
        isFinal: true,
        repeatSentence: `先固定第一类，每一种都和第二类的${second}种配一遍，所以${first}×${second}=${total}种。`,
      }),
    ];
  }
  return [
    guidedStep("看第一类", "先看第一类有几种。", ["第一类", "几种"]),
    guidedStep("看第二类", "再看第二类有几种。", ["第二类", "几种"]),
    guidedStep("有序搭配", "固定一种，把另一类都配一遍。", ["固定", "都配", "不漏"]),
    guidedStep("算总种数", "一共有多少种搭配？", answerKeywords),
    guidedStep("说清不漏不重", "你怎么保证没有漏掉？", ["固定", "不漏", "不重复"], { isReason: true, isFinal: true }),
  ];
}

function createObservationGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const direction = String(question?.answer || answerKeywords[0] || "").includes("侧面")
    ? "侧面"
    : String(question?.answer || answerKeywords[0] || "").includes("上面")
      ? "上面"
      : "正面";
  const clue = prompt.includes("门") ? "门形图案" : prompt.includes("长方形") ? "长方形面" : "关键特征";
  return [
    guidedStep("确定站位", "先想自己站在物体的哪一边看。", ["正面", "侧面", "上面", "站在", "方向"], {
      teacherHint: "观察物体先别猜图形，先想自己站在哪里看。",
    }),
    guidedStep("找关键特征", `题里说能看到${clue}。这个特征通常在哪一面？`, [clue, "门", "正面", "侧面", "上面"], {
      teacherHint: `看题里的特征：${clue}。先说你看到了什么。`,
      bridgeMessage: `特征找到了，再选观察方向。`,
    }),
    guidedStep("选择方向", "从正面、侧面、上面里选一个观察方向。", answerKeywords.concat([direction]), {
      teacherHint: `这题对应的是${direction}。你可以先说「${direction}」。`,
      bridgeMessage: `方向选好了，最后说依据。`,
    }),
    guidedStep("说清依据", "你为什么觉得是这个方向？", ["因为", "看到", "特征", clue, direction], {
      isReason: true,
      isFinal: true,
      repeatSentence: `因为从${direction}能看到题里说的${clue}，所以选择${direction}。`,
    }),
  ];
}

function createTimeDurationGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const pair = parseClockTimePair(prompt);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (pair) {
    const duration = pair.end - pair.start;
    const safeDuration = duration >= 0 ? duration : duration + 24 * 60;
    const startText = minutesToClockText(pair.start);
    const endText = minutesToClockText(pair.end);
    return [
      guidedStep("找开始时间", `活动从什么时候开始？`, [startText, pair.startRaw, "开始"], {
        teacherHint: `先找开始时间：${startText}。`,
        bridgeMessage: `开始时间找到了。`,
      }),
      guidedStep("找结束时间", `到什么时候结束？`, [endText, pair.endRaw, "结束"], {
        teacherHint: `再找结束时间：${endText}。`,
        bridgeMessage: `现在看中间经过多久。`,
      }),
      guidedStep("算经过时间", `${startText}到${endText}经过了多少分钟？`, answerKeywords.concat(answerKeywordsForNumber(safeDuration, "分")), {
        teacherHint: `${startText}到${endText}，分钟从${pair.start % 60}走到${pair.end % 60}，经过${safeDuration}分。`,
        bridgeMessage: `结果有了，最后说清不是读结束时间。`,
      }),
      guidedStep("说清方法", "经过时间为什么不是直接写结束时间？", ["开始", "结束", "中间", "经过", `${safeDuration}分`], {
        isReason: true,
        isFinal: true,
        repeatSentence: `经过时间是从开始${startText}走到结束${endText}中间过了多久，所以是${safeDuration}分。`,
      }),
    ];
  }
  return [
    guidedStep("找开始时间", "先找从什么时候开始。", ["开始", "从"]),
    guidedStep("找结束时间", "再找到什么时候结束。", ["结束", "到"]),
    guidedStep("算经过时间", "看中间经过了多少分钟。", answerKeywords),
    guidedStep("说清方法", "你是怎么数经过时间的？", ["开始", "结束", "经过", "分钟"], { isReason: true, isFinal: true }),
  ];
}

function createAngleGuidedSteps(lesson, question) {
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const answerText = String(question?.answer || answerKeywords[0] || "直角");
  return [
    guidedStep("找顶点和边", "先找这个角的顶点和两条边。", ["顶点", "两条边", "边"], {
      teacherHint: "角有一个顶点和两条边。先把这两个特征说出来。",
    }),
    guidedStep("和直角比", "它和三角尺上的直角相比，是一样大、更小，还是更大？", ["一样大", "更小", "更大", "直角", "锐角", "钝角"], {
      teacherHint: "角的大小看张口，不看边画得长不长。",
      bridgeMessage: `比较标准有了，再说角的名称。`,
    }),
    guidedStep("说角名称", "这个角是锐角、直角，还是钝角？", answerKeywords.concat([answerText]), {
      teacherHint: `这题答案是${answerText}。先说角的名称。`,
      bridgeMessage: `名称对上了，最后说判断理由。`,
    }),
    guidedStep("说清理由", "你凭什么判断它是这个角？", ["直角", "锐角", "钝角", "张开", "一样大", "更小", "更大"], {
      isReason: true,
      isFinal: true,
      repeatSentence: answerText.includes("直角")
        ? "它和三角尺上的直角一样大，所以是直角。"
        : answerText.includes("锐角")
          ? "它比直角小，所以是锐角。"
          : "它比直角大，所以是钝角。",
    }),
  ];
}

function createRemainderDivisionGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const numbers = extractNumbers(prompt);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const dividend = numbers[0];
  const divisor = numbers[1];
  if (Number.isFinite(dividend) && Number.isFinite(divisor) && divisor !== 0) {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    return [
      guidedStep("看总数和每份", `先看总数是${dividend}，每份是${divisor}。先说每份几个？`, answerKeywordsForNumber(divisor), {
        teacherHint: `除法先找总数和每份几个。每份是${divisor}。`,
        bridgeMessage: `每份数量找到了。`,
      }),
      guidedStep("找能分几份", `想${divisor}乘几最接近${dividend}但不超过${dividend}？`, answerKeywordsForNumber(quotient).concat([`${divisor}×${quotient}`, `${quotient}份`]), {
        teacherHint: `${divisor}×${quotient}=${divisor * quotient}，再多一份就超过${dividend}了，所以商是${quotient}。`,
        bridgeMessage: `商找到了，再看剩下。`,
      }),
      guidedStep("算余数", `${dividend}-${divisor * quotient}还剩几？`, answerKeywords.concat(answerKeywordsForNumber(remainder)), {
        teacherHint: `${dividend}-${divisor * quotient}=${remainder}，剩下的就是余数。`,
        bridgeMessage: `余数出来了，还要检查。`,
      }),
      guidedStep("检查余数", `余数${remainder}比除数${divisor}小吗？`, ["小", "比除数小", String(remainder), String(divisor)], {
        teacherHint: `余数必须比除数小。${remainder}比${divisor}小，所以可以。`,
        bridgeMessage: `检查通过，最后讲一遍。`,
      }),
      guidedStep("说清商和余数", "你怎么找到商和余数的？", ["商", "余数", "乘", "剩下", String(quotient), String(remainder)], {
        isReason: true,
        isFinal: true,
        repeatSentence: `先想${divisor}×${quotient}=${divisor * quotient}最接近${dividend}，还剩${remainder}，所以商是${quotient}，余数是${remainder}。`,
      }),
    ];
  }
  return [
    guidedStep("看总数和每份", "先找总数和每份几个。", ["总数", "每份", "除数"]),
    guidedStep("找能分几份", "用口诀找最多能分满几份。", ["商", "几份", "乘"]),
    guidedStep("算余数", "剩下几个就是余数。", answerKeywords.concat(["余数", "剩下"])),
    guidedStep("说清商和余数", "你怎么检查余数对不对？", ["余数", "比除数小"], { isReason: true, isFinal: true }),
  ];
}

function createRemainderApplicationGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const numbers = extractNumbers(prompt);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const total = numbers[0];
  const each = numbers[1];
  const needsExtra = /至少|船|车|座|票|坐|租/.test(prompt);
  if (Number.isFinite(total) && Number.isFinite(each) && each !== 0) {
    const quotient = Math.floor(total / each);
    const remainder = total % each;
    const finalAnswer = needsExtra && remainder > 0 ? quotient + 1 : quotient;
    return [
      guidedStep("先算除法", `先算${total}÷${each}，能分满几份？`, answerKeywordsForNumber(quotient).concat([`${quotient}份`, `${quotient}条`, `${quotient}个`]), {
        teacherHint: `先不急着写最终答案。${each}个一份，${total}里面能分满${quotient}份。`,
        bridgeMessage: `能分满的份数出来了。`,
      }),
      guidedStep("看余下", `分满${quotient}份后，还剩几个？`, answerKeywordsForNumber(remainder).concat(["剩下", "余数"]), {
        teacherHint: `${total}-${quotient * each}=${remainder}，还剩${remainder}。`,
        bridgeMessage: `现在要看剩下的在生活里怎么办。`,
      }),
      guidedStep("判断要不要加一份", needsExtra ? `剩下${remainder}个人也要坐船或坐车吗？要不要再加一份？` : `剩下${remainder}个不够一整份，还算一整份吗？`, needsExtra ? ["要", "再加1", "加一份", "需要"] : ["不要", "不算", "去尾"], {
        teacherHint: needsExtra
          ? `只要还有人没坐下，就还需要再加一条船或一辆车。`
          : `如果题目问最多装满几份，剩下不满一份的不能算一整份。`,
        bridgeMessage: `生活意思判断好了，最后写答案。`,
      }),
      guidedStep("说最终答案", `所以最后答案是多少？`, answerKeywords.concat(answerKeywordsForNumber(finalAnswer)), {
        teacherHint: `最后答案是${finalAnswer}。`,
        bridgeMessage: `答案有了，最后说清为什么。`,
      }),
      guidedStep("说清生活理由", "为什么这题要这样处理余数？", ["剩下", "也要", "再加", "不够", "进一", "去尾", String(finalAnswer)], {
        isReason: true,
        isFinal: true,
        repeatSentence: needsExtra
          ? `先算${total}÷${each}=${quotient}余${remainder}，剩下的人也要坐，所以再加1，至少需要${finalAnswer}份。`
          : `先算${total}÷${each}=${quotient}余${remainder}，剩下的不够一整份，所以最多是${finalAnswer}份。`,
      }),
    ];
  }
  return [
    guidedStep("先算除法", "先算能分满几份。", ["能分", "商", "几份"]),
    guidedStep("看余下", "再看还剩几个。", ["剩下", "余数"]),
    guidedStep("判断要不要加一份", "回到生活里看，剩下的还要不要再占一份？", ["要", "不要", "进一", "去尾"]),
    guidedStep("说最终答案", "最后答案是多少？", answerKeywords),
    guidedStep("说清生活理由", "为什么这样处理余数？", ["剩下", "进一", "去尾"], { isReason: true, isFinal: true }),
  ];
}

function createApplicationGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const expression = parseArithmeticExpression(`${question?.explanation || ""} ${prompt}`);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const relation = inferApplicationRelation(prompt, question?.explanation || "");
  const operationKeywords = relation.operation ? [relation.operation, relation.symbol, relation.intent].filter(Boolean) : ["加法", "减法", "乘法", "除法"];
  const usefulNumbers = extractNumbers(prompt).slice(0, 3);
  const usefulNumberKeywords = usefulNumbers.map(String).concat(usefulNumbers.map((number) => chineseNumber(number)));
  const relationAction = childRelationAction(relation);
  const methodPrompt = relation.operation
    ? `先不猜运算名。这个故事是在${relationAction.options}？`
    : "题目问的是一共、还剩、找回，还是每份多少？";
  const methodHint = relation.operation
    ? `先用故事理解：题目问${relation.childChoice || relation.intent}，意思是${relationAction.explain}，所以后面才用${relation.operation}。先说故事动作：${relationAction.say}。`
    : "先把题目读成小故事：一共通常合起来，还剩或找回通常去掉，平均每份通常平均分。";
  return [
    guidedStep("看问题问什么", `先看最后一句。题目到底要我们求${relation.childChoice || "什么"}？`, relation.keywords, {
      teacherHint: `先不算，先把问题说清楚：它要我们求${relation.childChoice || "要求的那个数"}。`,
    }),
    guidedStep("找有用条件", "题里给了哪几个有用的数？先把这些数找出来。", usefulNumberKeywords.concat(["两个数", "条件", "有用的数"]), {
      teacherHint: usefulNumbers.length
        ? `题里先看数字：${usefulNumbers.join("、")}。先把有用的数说出来，再想怎么算。`
        : "先别算，先把题里有用的数字找出来。",
    }),
    guidedStep("想故事动作", methodPrompt, uniqueKeywords(operationKeywords.concat(relation.keywords || [], relation.reasonKeywords || [], [relationAction.say, relationAction.accept], expression ? [formatExpression(expression)] : [])), {
      teacherHint: methodHint,
    }),
    guidedStep("算出结果", "按刚才的方法算，最后答案是多少？", answerKeywords.concat(expression ? answerKeywordsForNumber(expression.result) : []), {
      teacherHint: expression ? `现在才算：${formatExpression(expression)}=${expression.result}。你可以先说「${expression.result}」。` : "",
      bridgeMessage: "题意和方法都对上了，现在只差说清原因。",
    }),
    guidedStep("说清为什么", "用一句话说：为什么这样算？", relation.reasonKeywords, {
      isReason: true,
      isFinal: true,
      repeatSentence: createApplicationRepeatSentence(relation, expression),
    }),
  ];
}

function createApplicationRepeatSentence(relation, expression) {
  if (relation?.operation === "加法") return "因为题目要求一共多少，是把两部分合起来，所以用加法。";
  if (relation?.operation === "减法") return "因为题目要求还剩或找回多少，是从一个数里去掉一部分，所以用减法。";
  if (relation?.operation === "乘法") return "因为每组同样多，要求一共有多少，可以用乘法。";
  if (relation?.operation === "除法") return "因为是平均分，每份要一样多，所以用除法。";
  if (expression) return `${formatExpression(expression)}表示题里的数量关系，所以这样算。`;
  return "我先看题目问什么，再找有用的数，最后选合适的方法。";
}

function childRelationAction(relation) {
  const operation = relation?.operation || "";
  const intent = relation?.intent || relation?.childChoice || "";
  if (operation === "加法") {
    return {
      options: "把两部分合起来",
      explain: "把两部分放到一起看",
      say: "合起来",
      accept: "放在一起",
    };
  }
  if (operation === "减法") {
    const isChange = /找回|找零/.test(intent);
    return {
      options: isChange ? "付出去以后剩下" : "从原来里面去掉一部分",
      explain: isChange ? "付的钱里没有花掉的部分要找回来" : "从原来的数量里拿走或用掉一部分",
      say: isChange ? "剩下的钱" : "去掉一部分",
      accept: isChange ? "找回" : "拿走",
    };
  }
  if (operation === "乘法") {
    return {
      options: "几个同样多的一组",
      explain: "每组一样多，可以看成几个几",
      say: "几个几",
      accept: "同样多",
    };
  }
  if (operation === "除法") {
    return {
      options: "平均分",
      explain: "每份要一样多",
      say: "平均分",
      accept: "每份一样多",
    };
  }
  return {
    options: "合起来、去掉，还是平均分",
    explain: "先看故事在做什么",
    say: "先看故事",
    accept: "故事",
  };
}

function createCalculationGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const expression = parseTeachingArithmeticExpression(question) || parseArithmeticExpression(prompt);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (!expression) {
    return [
      guidedStep("看符号意思", "先看符号告诉我们：是合起来，还是去掉一部分？", ["合起来", "去掉", "加", "减", "加法", "减法"]),
      guidedStep("算出结果", "算完结果是多少？", answerKeywords),
      guidedStep("说清怎么算", "你是怎么算出来的？", ["先", "再", "数", "加", "减", "乘", "除", "口诀"], { isReason: true, isFinal: true }),
    ];
  }
  if ((expression.left >= 100 || expression.right >= 100) && ["+", "-"].includes(expression.operator)) {
    return createChunkCalculationGuidedSteps(lesson, question, expression);
  }
  if (expression.operator === "+" && expression.left < 100 && expression.right < 100 && (expression.left >= 10 || expression.right >= 10)) {
    return createPlaceValueAdditionGuidedSteps(lesson, question, expression);
  }
  if (expression.operator === "-" && expression.left < 100 && expression.right < 100 && (expression.left >= 10 || expression.right >= 10)) {
    return createPlaceValueSubtractionGuidedSteps(lesson, question, expression);
  }
  if (expression.operator === "+") {
    const larger = Math.max(expression.left, expression.right);
    const smaller = Math.min(expression.left, expression.right);
    return [
      guidedStep("看成合起来", `先看成两部分合起来：${expression.left}和${expression.right}。可以从${larger}接着数${smaller}个。`, ["合起来", "一共", String(larger), String(smaller)], {
        teacherHint: `加法不用先背术语，先想“合起来”。从${larger}接着数${smaller}个就行。`,
        bridgeMessage: `对，加法就是把两部分合起来。`,
      }),
      guidedStep("接着数", `从${larger}往后数${smaller}个，结果是多少？`, answerKeywords.concat(answerKeywordsForNumber(expression.result)), {
        teacherHint: `老师示范：从${larger}往后数${smaller}个，得到${expression.result}。你先说：${expression.result}。`,
        bridgeMessage: `答案出来了，再补一句方法。`,
      }),
      guidedStep("说清加法方法", "你是怎么想这道加法的？", ["合起来", "接着数", String(expression.result)], {
        isReason: true,
        isFinal: true,
        repeatSentence: `${expression.left}+${expression.right}表示把两部分合起来，可以从${larger}接着数${smaller}个，所以等于${expression.result}。`,
      }),
    ];
  }
  if (expression.operator === "-") {
    return [
      guidedStep("看成去掉", `先看成从${expression.left}里去掉${expression.right}。`, ["去掉", "拿走", "还剩", String(expression.left), String(expression.right)], {
        teacherHint: `减法先想“从原来的数里去掉一部分”。这里是从${expression.left}里去掉${expression.right}。`,
        bridgeMessage: `对，减法先看原来多少、去掉多少。`,
      }),
      guidedStep("倒着数或想组成", `从${expression.left}倒着数${expression.right}下，结果是多少？`, answerKeywords.concat(answerKeywordsForNumber(expression.result)), {
        teacherHint: `老师示范：从${expression.left}倒着数${expression.right}下，得到${expression.result}。你先说：${expression.result}。`,
        bridgeMessage: `答案出来了，再说清为什么这样算。`,
      }),
      guidedStep("说清减法方法", "你是怎么想这道减法的？", ["去掉", "拿走", "还剩", "倒着数", String(expression.result)], {
        isReason: true,
        isFinal: true,
        repeatSentence: `${expression.left}-${expression.right}表示从${expression.left}里去掉${expression.right}，可以倒着数，所以等于${expression.result}。`,
      }),
    ];
  }
  const operationMeaning = expression.operator === "+"
    ? ["合起来", "一共", "加法", "+"]
    : expression.operator === "-"
      ? ["去掉", "还剩", "减法", "-"]
      : [operationName(expression.operator), expression.operator];
  return [
    guidedStep("看符号意思", `先看${expression.left}${expression.operator}${expression.right}，这个符号表示什么？`, operationMeaning, {
      teacherHint: expression.operator === "+"
        ? "加号表示把两部分合起来，可以说：合起来。"
        : expression.operator === "-"
          ? "减号表示从原来的数里去掉一部分，可以说：去掉。"
          : "先看符号，再想它表示什么。",
    }),
    guidedStep("算出结果", "算完结果是多少？", answerKeywords.concat(answerKeywordsForNumber(expression.result))),
    guidedStep("说清怎么算", "你是怎么算出来的？", ["先", "再", "数", "合起来", "去掉", "口诀", formatExpression(expression)], { isReason: true, isFinal: true }),
  ];
}

function createChunkCalculationGuidedSteps(lesson, question, expression) {
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const unit = [1000, 100, 10].find((value) => expression.left % value === 0 && expression.right % value === 0 && expression.result % value === 0) || 1;
  const unitName = unit === 1000 ? "千" : unit === 100 ? "百" : unit === 10 ? "十" : "";
  const leftUnits = expression.left / unit;
  const rightUnits = expression.right / unit;
  const resultUnits = expression.result / unit;
  const action = expression.operator === "+" ? "相加" : "相减";
  const actionWord = expression.operator === "+" ? "加" : "减";
  const displayExpression = `${expression.left}${expression.operator}${expression.right}`;

  if (unit === 1 || !Number.isInteger(leftUnits) || !Number.isInteger(rightUnits) || !Number.isInteger(resultUnits)) {
    return [
      guidedStep("看同一位", "先看相同数位上的数。", ["个位", "十位", "百位", "千位", "同一位"]),
      guidedStep("算出结果", "这一步算完是多少？", answerKeywords.concat(answerKeywordsForNumber(expression.result))),
      guidedStep("说清方法", "你是按什么顺序算的？", ["先", "再", "个位", "十位", "百位", "同位"], { isReason: true, isFinal: true }),
    ];
  }

  return [
    guidedStep("先换成几个单位", `先把${expression.left}看成${leftUnits}个${unitName}，${expression.right}看成${rightUnits}个${unitName}。你先说${expression.left}是几个${unitName}？`, answerKeywordsForNumber(leftUnits).concat([`${leftUnits}个${unitName}`, String(leftUnits)]), {
      teacherHint: `${expression.left}里面有${leftUnits}个${unitName}。先把大数看成几个${unitName}，会更好算。`,
      bridgeMessage: `这样两个数就站到同一种单位上了。`,
    }),
    guidedStep(`几个${unitName}${action}`, `${leftUnits}个${unitName}${actionWord}${rightUnits}个${unitName}，得到几个${unitName}？`, answerKeywordsForNumber(resultUnits).concat([String(resultUnits), `${resultUnits}个${unitName}`]), {
      teacherHint: `只看前面的数，${leftUnits}${expression.operator}${rightUnits}=${resultUnits}，所以是${resultUnits}个${unitName}。`,
      bridgeMessage: `单位个数算出来了，再换回完整的数。`,
    }),
    guidedStep("换回完整结果", `${resultUnits}个${unitName}是多少？`, answerKeywords.concat(answerKeywordsForNumber(expression.result)), {
      teacherHint: `${resultUnits}个${unitName}就是${expression.result}。`,
      bridgeMessage: `答案有了，最后说一句方法。`,
    }),
    guidedStep("说清整十整百口算", "你是怎么口算这类题的？", ["几个十", "几个百", "同单位", "先算前面的数", String(expression.result)], {
      isReason: true,
      isFinal: true,
      repeatSentence: `${displayExpression}先看成几个${unitName}${action}，再换回完整的数，所以等于${expression.result}。`,
    }),
  ];
}

function createPlaceValueAdditionGuidedSteps(lesson, question, expression) {
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const leftOnes = expression.left % 10;
  const rightOnes = expression.right % 10;
  const leftTens = Math.floor(expression.left / 10);
  const rightTens = Math.floor(expression.right / 10);
  const onesSum = leftOnes + rightOnes;
  const carry = onesSum >= 10 ? 1 : 0;
  const onesResult = onesSum % 10;
  const tensResult = leftTens + rightTens + carry;
  const displayExpression = `${expression.left}+${expression.right}`;

  if (carry) {
    return [
      guidedStep("先算个位", `先看个位：${leftOnes}+${rightOnes}等于几？`, answerKeywordsForNumber(onesSum).concat([String(onesSum)]), {
        teacherHint: `加法从个位看起。${leftOnes}+${rightOnes}=${onesSum}。你先说：${onesSum}。`,
        bridgeMessage: `${onesSum}已经超过10了，要处理进位。`,
      }),
      guidedStep("满十进一", `${onesSum}里面有1个十和几个一？`, answerKeywordsForNumber(onesResult).concat([`1个十和${onesResult}个一`, String(onesResult), `个位写${onesResult}`]), {
        teacherHint: `${onesSum}里面有1个十和${onesResult}个一，所以向十位进1，个位留${onesResult}。`,
        bridgeMessage: `个位稳了，接着看十位。`,
      }),
      guidedStep("再算十位", `十位上原来有${leftTens + rightTens}个十，再加进来的1个十，一共几个十？`, answerKeywordsForNumber(tensResult).concat([String(tensResult), `${tensResult}个十`]), {
        teacherHint: `十位一共是${tensResult}个十。`,
        bridgeMessage: `十位和个位都有了，合起来。`,
      }),
      guidedStep("说出结果", `${tensResult}个十和${onesResult}个一，合起来是多少？`, answerKeywords.concat(answerKeywordsForNumber(expression.result)), {
        teacherHint: `${tensResult}个十和${onesResult}个一就是${expression.result}。`,
        bridgeMessage: `结果出来了，最后说一句方法。`,
      }),
      guidedStep("说清进位加法", "你是怎么做进位加法的？", ["个位", "满十", "进一", "十位", String(expression.result)], {
        isReason: true,
        isFinal: true,
        repeatSentence: `${displayExpression}先算个位，满十向十位进1，再算十位，所以等于${expression.result}。`,
      }),
    ];
  }

  return [
    guidedStep("先算个位", `先看个位：${leftOnes}+${rightOnes}等于几？`, answerKeywordsForNumber(onesSum).concat([String(onesSum)]), {
      teacherHint: `先算个位，${leftOnes}+${rightOnes}=${onesSum}。`,
      bridgeMessage: `个位算好了，没有满十，不用进位。`,
    }),
    guidedStep("再看十位", `十位上有几个十？`, answerKeywordsForNumber(leftTens + rightTens).concat([`${leftTens + rightTens}个十`, String(leftTens + rightTens)]), {
      teacherHint: `十位一共是${leftTens + rightTens}个十。`,
      bridgeMessage: `十位和个位合起来就行。`,
    }),
    guidedStep("说出结果", `${leftTens + rightTens}个十和${onesSum}个一，合起来是多少？`, answerKeywords.concat(answerKeywordsForNumber(expression.result)), {
      teacherHint: `${leftTens + rightTens}个十和${onesSum}个一就是${expression.result}。`,
      bridgeMessage: `答案有了，补一句方法。`,
    }),
    guidedStep("说清同位相加", "为什么要先看个位和十位？", ["个位", "十位", "同位", "相加", String(expression.result)], {
      isReason: true,
      isFinal: true,
      repeatSentence: `${displayExpression}先算个位，再算十位，同位相加，所以等于${expression.result}。`,
    }),
  ];
}

function createPlaceValueSubtractionGuidedSteps(lesson, question, expression) {
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const leftOnes = expression.left % 10;
  const rightOnes = expression.right % 10;
  const leftTens = Math.floor(expression.left / 10);
  const rightTens = Math.floor(expression.right / 10);
  const needsBorrow = leftOnes < rightOnes;
  const displayExpression = `${expression.left}-${expression.right}`;

  if (needsBorrow) {
    const borrowedOnes = leftOnes + 10;
    const onesResult = borrowedOnes - rightOnes;
    const tensResult = leftTens - 1 - rightTens;
    return [
      guidedStep("看个位够不够", `先看个位：${leftOnes}够减${rightOnes}吗？`, ["不够", "不够减", "要退位", "借十"], {
        teacherHint: `${leftOnes}比${rightOnes}小，不够减，要向十位借1个十。`,
        bridgeMessage: `对，个位不够，先退位。`,
      }),
      guidedStep("借一个十", `向十位借1个十后，个位变成多少？`, answerKeywordsForNumber(borrowedOnes).concat([String(borrowedOnes), `${borrowedOnes}个一`]), {
        teacherHint: `借来的1个十就是10个一，${leftOnes}+10=${borrowedOnes}。`,
        bridgeMessage: `现在个位够减了。`,
      }),
      guidedStep("算个位", `现在算个位：${borrowedOnes}-${rightOnes}等于几？`, answerKeywordsForNumber(onesResult).concat([String(onesResult)]), {
        teacherHint: `${borrowedOnes}-${rightOnes}=${onesResult}。`,
        bridgeMessage: `个位出来了，再看十位。`,
      }),
      guidedStep("算十位", `十位借走1后，还剩${leftTens - 1}个十，再减${rightTens}个十，剩几个十？`, answerKeywordsForNumber(tensResult).concat([String(tensResult), `${tensResult}个十`]), {
        teacherHint: `十位借走1后再相减，剩${tensResult}个十。`,
        bridgeMessage: `十位个位都有了，合起来。`,
      }),
      guidedStep("说出结果", `${tensResult}个十和${onesResult}个一，合起来是多少？`, answerKeywords.concat(answerKeywordsForNumber(expression.result)), {
        teacherHint: `${tensResult}个十和${onesResult}个一就是${expression.result}。`,
        bridgeMessage: `答案有了，最后讲一下退位。`,
      }),
      guidedStep("说清退位减法", "你是怎么做退位减法的？", ["个位", "不够", "借十", "十位", String(expression.result)], {
        isReason: true,
        isFinal: true,
        repeatSentence: `${displayExpression}个位不够减，就向十位借1个十，先算个位，再算十位，所以等于${expression.result}。`,
      }),
    ];
  }

  const onesResult = leftOnes - rightOnes;
  const tensResult = leftTens - rightTens;
  return [
    guidedStep("先算个位", `先看个位：${leftOnes}-${rightOnes}等于几？`, answerKeywordsForNumber(onesResult).concat([String(onesResult)]), {
      teacherHint: `个位够减，先算${leftOnes}-${rightOnes}=${onesResult}。`,
      bridgeMessage: `个位稳了，不用退位。`,
    }),
    guidedStep("再算十位", `十位上${leftTens}个十减${rightTens}个十，剩几个十？`, answerKeywordsForNumber(tensResult).concat([String(tensResult), `${tensResult}个十`]), {
      teacherHint: `十位相减，剩${tensResult}个十。`,
      bridgeMessage: `十位个位合起来。`,
    }),
    guidedStep("说出结果", `${tensResult}个十和${onesResult}个一，合起来是多少？`, answerKeywords.concat(answerKeywordsForNumber(expression.result)), {
      teacherHint: `${tensResult}个十和${onesResult}个一就是${expression.result}。`,
      bridgeMessage: `答案有了，补一句方法。`,
    }),
    guidedStep("说清同位相减", "为什么要个位和十位分开看？", ["个位", "十位", "同位", "相减", String(expression.result)], {
      isReason: true,
      isFinal: true,
      repeatSentence: `${displayExpression}先算个位，再算十位，同位相减，所以等于${expression.result}。`,
    }),
  ];
}

function createMultiplicationGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const expression = parseArithmeticExpression(prompt) || parseArithmeticExpression(question?.explanation || "");
  const group = parseMultiplicationStructure(`${prompt} ${question?.explanation || ""}`);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (group) {
    return [
      guidedStep("看每组几个", `先看每组有几个？`, answerKeywordsForNumber(group.each, "个").concat([`每组${group.each}个`, String(group.each)]), {
        teacherHint: `乘法题先看“每组几个”。这里每组有${group.each}个。`,
      }),
      guidedStep("看有几组", `再数一共有几组？`, answerKeywordsForNumber(group.groups, "组").concat([`${group.groups}组`, String(group.groups)]), {
        teacherHint: `再看有几组。这里一共有${group.groups}组。`,
      }),
      guidedStep("说几个几", `合起来说，这是几个几？`, [`${group.groups}个${group.each}`, `${group.groups}组${group.each}`, `${group.groups}个${group.each}个`], {
        teacherHint: `把组数和每组个数连起来，就是${group.groups}个${group.each}。`,
      }),
      guidedStep("列式或结果", "用乘法式表示，或者说出一共有多少。", answerKeywords.concat([`${group.groups}×${group.each}`, `${group.each}×${group.groups}`, String(group.total), chineseNumber(group.total)]), {
        teacherHint: `${group.groups}个${group.each}可以写成${group.groups}×${group.each}，结果是${group.total}。`,
      }),
      guidedStep("说清乘法意思", "为什么可以用乘法？", ["同样多", "几个几", "每组", "一共", "乘法", "口诀"], {
        isReason: true,
        isFinal: true,
        repeatSentence: "因为每组同样多，所以可以用乘法算一共有多少。",
      }),
    ];
  }
  return [
    guidedStep("看几个几", "先说这题表示几个几。", ["几个几", "每组", "同样多", "行", "列", expression ? `${expression.left}个${expression.right}` : ""]),
    guidedStep("列式或算出结果", "先列出算式，或者说出你算到的结果。", answerKeywords.concat(expression ? [formatExpression(expression), ...answerKeywordsForNumber(expression.result)] : [])),
    guidedStep("说清乘法意思", "为什么可以用乘法？", ["同样多", "几个几", "每组", "一共", "乘法", "口诀"], { isReason: true, isFinal: true }),
  ];
}

function createDivisionGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const expression = parseArithmeticExpression(prompt) || parseArithmeticExpression(question?.explanation || "");
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const numbers = extractNumbers(prompt);
  const total = numbers[0];
  const divisor = numbers[1];
  const hasStoryNumbers = Number.isFinite(total) && Number.isFinite(divisor);
  const asksByEach = /每\s*\d+\s*个|每份\s*\d+|每组\s*\d+/.test(normalizeText(prompt));
  const totalKeywords = Number.isFinite(total)
    ? answerKeywordsForNumber(total).concat([`总数是${total}`, `一共${total}`, `${total}个`])
    : ["总数", "一共"];
  const divisorKeywords = Number.isFinite(divisor)
    ? answerKeywordsForNumber(divisor).concat(
        asksByEach ? [`每份${divisor}`, `每份${divisor}个`, `${divisor}个一份`] : [`分成${divisor}份`, `${divisor}份`, `${divisor}个小朋友`],
      )
    : ["份数", "每份", "分成几份"];
  return [
    guidedStep("看是不是平均分", "先看每份是不是要一样多。", ["平均分", "每份一样多", "同样多", "分成"], {
      teacherHint: "除法不是随便分，关键是平均分：每份要一样多。",
    }),
    guidedStep(
      "看总数",
      hasStoryNumbers
        ? `先找总数：题里一共有多少个？`
        : "题里一共有多少？",
      uniqueKeywords(totalKeywords.concat(["总数", "一共"])),
      {
      teacherHint: hasStoryNumbers
        ? `这题先看总数：一共有${total}个。先说：总数是${total}。`
        : "先找总数，也就是一共有多少。",
      },
    ),
    guidedStep(asksByEach ? "看每份几个" : "看分成几份", hasStoryNumbers
      ? asksByEach
        ? `再看分法：每份是几个？`
        : `再看分法：平均分给几个小朋友，也就是分成几份？`
      : "再看分法：分成几份，还是每份几个？", uniqueKeywords(divisorKeywords.concat(["分法", "份数", "每份"])), {
      teacherHint: hasStoryNumbers
        ? asksByEach
          ? `题里说每份${divisor}个，所以每份是${divisor}个。`
          : `平均分给${divisor}个小朋友，就是分成${divisor}份。`
        : "把总数和分法分开看，后面才不会乱。",
      bridgeMessage: "总数看清了，再看怎么分。",
    }),
    guidedStep("看题目问什么", hasStoryNumbers
      ? asksByEach
        ? "题目问可以分成几份。你先说：问几份。"
        : "题目问每个小朋友分到几个。你先说：问每份几个。"
      : "题目问的是每份几个，还是能分几份？", asksByEach ? ["几份", "分成几份", "能分"] : ["每份", "每个", "每人", "几个"], {
      teacherHint: hasStoryNumbers
        ? asksByEach
          ? "题目已经告诉每份几个，现在问能分成几份。"
          : "题目已经告诉分给几个人，现在问每个人分到几个。"
        : "先把问题类型说清楚，再列式会更稳。",
      bridgeMessage: "问题类型看清了，再算就不乱。",
    }),
    guidedStep("说每份或份数", "平均分以后，答案是多少？", answerKeywords.concat(expression ? answerKeywordsForNumber(expression.result) : []), {
      teacherHint: expression ? `平均分对应的算式是${formatExpression(expression)}，结果是${expression.result}。` : "可以一份一份分，也可以用除法算。",
    }),
    guidedStep("说清除法意思", "为什么可以用除法？", ["平均分", "每份", "份数", "除法", "同样多"], {
      isReason: true,
      isFinal: true,
      repeatSentence: "因为是平均分，每份要一样多，所以可以用除法。",
    }),
  ];
}

function createTimeGuidedSteps(lesson, question) {
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  return [
    guidedStep("先看时针", "先看短短的时针指向几。", ["时针", "短针", "几时", "指向"], {
      teacherHint: "钟面上短针是时针，它先告诉我们大概是几时；长针先不急。",
    }),
    guidedStep("再看分针", "再看长长的分针指向哪里。", ["分针", "长针", "12", "整时", "半", "几分"], {
      teacherHint: "长针是分针，指向12就是整时，指向6就是半时，也就是30分。",
      bridgeMessage: "短针看完了，再看长针。",
    }),
    guidedStep("说出时间", "合起来是几时几分？", answerKeywords, {
      teacherHint: "读钟面要把短针和长针合起来说，先说几时，再说几分。",
      isFinal: true,
    }),
  ];
}

function createMeasureGuidedSteps(lesson, question) {
  const text = normalizeText(`${question?.prompt || ""} ${lesson?.node || ""} ${lesson?.visualType || ""}`);
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  if (text.includes("克") || text.includes("千克") || lesson?.visualType === "mass") {
    return [
      guidedStep("先想轻重", "先想这个物体轻还是重。", ["轻", "重", "物体", "估计"], {
        teacherHint: "选克还是千克，先不用急着猜数字。轻小的东西常用克，比较重的东西常用千克。",
      }),
      guidedStep("选单位或结果", "应该用克还是千克？答案是多少？", answerKeywords.concat(["克", "千克"]), {
        teacherHint: "如果是一个苹果、一支笔这类轻小物体，常用克；如果是一袋米、一个人这类重物，常用千克。",
      }),
      guidedStep("说清生活经验", "为什么选这个单位？", ["轻", "重", "生活", "克", "千克"], {
        isReason: true,
        isFinal: true,
        repeatSentence: "轻小的物体常用克，比较重的物体常用千克。",
      }),
    ];
  }
  if (lesson?.visualType === "angle" || text.includes("角")) {
    return [
      guidedStep("找顶点", "先找角的顶点在哪里。", ["顶点", "尖尖的点"], {
        teacherHint: "角不是看整幅图，先找尖尖的那个点，它叫顶点。",
      }),
      guidedStep("找两条边", "再找从顶点伸出去的两条边。", ["两条边", "边", "张开"], {
        teacherHint: "从顶点伸出去的两条直直的边，围成一个角；没有两条边就不是一个角。",
      }),
      guidedStep("判断角", "这个图形里有几个角？", answerKeywords, {
        teacherHint: "数角时，一个顶点配两条边，数完要检查有没有漏掉。",
        isFinal: true,
      }),
    ];
  }
  return [
    guidedStep("找起点", "先看是不是从0刻度开始量。", ["0刻度", "起点", "从0开始"], {
      teacherHint: "用尺量长度，最稳的方法是从0刻度开始；如果不是从0开始，就要用终点减起点。",
    }),
    guidedStep("看终点", "再看另一端对着几。", ["终点", "对着", "刻度"], {
      teacherHint: "起点看清后，再看物体另一端对着哪个刻度，这个刻度帮我们得到长度。",
    }),
    guidedStep("带单位回答", "最后带上单位说答案。", answerKeywords, {
      teacherHint: "长度答案不能只说数字，还要带上厘米或米这样的单位。",
      isFinal: true,
    }),
  ];
}

function createLogicGuidedSteps(lesson, question) {
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  return [
    guidedStep("记住条件", "先说题目告诉了我们哪一个条件。", ["已知", "条件", "告诉", "不是", "是"], {
      teacherHint: "推理题先别猜答案，先看题目给出的条件，比如“不是谁”“比谁多”“在谁旁边”。",
    }),
    guidedStep("排除不可能", "把不可能的先排除掉。", ["排除", "不可能", "不是", "划掉"], {
      teacherHint: "不可能的先划掉，剩下的选择就会变少，这叫排除法。",
      bridgeMessage: "条件看清了，再用它排除。",
    }),
    guidedStep("说剩下答案", "剩下谁或哪一种可能？", answerKeywords, {
      teacherHint: "排除完以后，不要重新猜，只看还剩下哪个可能。",
    }),
    guidedStep("说清理由", "你为什么这样判断？", ["因为", "所以", "排除", "不是", "剩下"], {
      isReason: true,
      isFinal: true,
      repeatSentence: "我先看条件，把不可能的排除掉，剩下的就是答案。",
    }),
  ];
}

function createPlaceValueGuidedSteps(lesson, question) {
  const prompt = question?.prompt || lesson?.problem || "";
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  const text = normalizeText(prompt);
  const asksRead = text.includes("读作");
  const asksWrite = text.includes("写作");
  const asksComposition = /里面有.*个(千|百|十|一)/.test(prompt) || text.includes("组成");
  const task = asksRead ? "读作" : asksWrite ? "写作" : asksComposition ? "说组成" : "看数位";
  return [
    guidedStep("先看数位", "先从高位看起，说一说要看哪些数位。", ["个位", "十位", "百位", "千位", "高位", "数位"], {
      teacherHint: "多位数不能只看数字本身，还要看它站在哪一位：个位表示几个一，十位表示几个十，百位表示几个百。",
    }),
    guidedStep(task, asksRead ? "这道题应该怎么读？" : asksWrite ? "这道题应该怎么写？" : "每个数位上分别是几？", answerKeywords, {
      teacherHint: asksRead
        ? "读数从高位读起，中间有0时要想一想这个0要不要读。"
        : asksWrite
          ? "写数也从高位写起，哪一位没有就用0占位。"
          : "说组成时，要把每个数位上的数字说成几个百、几个十、几个一。",
    }),
    guidedStep("说清位值", "为什么要按数位来读、写或拆开？", ["数位", "个位", "十位", "百位", "千位", "0", "零", "几个十", "几个百"], {
      isReason: true,
      isFinal: true,
      repeatSentence: "因为数字所在的数位不同，表示的大小也不同。",
    }),
  ];
}

function createShapeGuidedSteps(lesson, question) {
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  return [
    guidedStep("看图形特征", "先说它最明显的样子：平平的、方方的、圆圆的，还是会滚动？", ["平", "方", "圆", "滚", "面", "边", "角", "对称", "平移", "旋转"], {
      teacherHint: "认图形不靠猜名字，先看特征：有没有平平的面、直直的边、尖尖的角，或者能不能滚动。",
    }),
    guidedStep("说出名称或判断", "根据这个特征，答案是什么？", answerKeywords.concat(["长方体", "正方体", "圆柱", "球", "长方形", "正方形", "三角形", "圆", "对", "错"]), {
      teacherHint: "把刚才看到的特征和图形名字配起来，再说答案。",
    }),
    guidedStep("说清理由", "你为什么这样认？说一个最明显的特征。", ["因为", "所以", "特征", "面", "边", "角", "对称", "平移", "旋转", "会滚"], {
      isReason: true,
      isFinal: true,
      repeatSentence: "我先看图形的特征，再根据特征说出它的名字。",
    }),
  ];
}

function createDataGuidedSteps(lesson, question) {
  const answerKeywords = expandedQuestionAnswerKeywords(question, lesson);
  return [
    guidedStep("看分类标准", "先看按什么分，或者表里每一行表示什么。", ["分类", "标准", "表", "记录", "一行", "一列", "最多", "最少"], {
      teacherHint: "分类和统计题先看清楚按什么分，比如颜色、形状、种类；表格里一行或一列只表示一种东西。",
    }),
    guidedStep("读出数量", "从表里读出来，答案是多少？", answerKeywords, {
      teacherHint: "读表时眼睛要对准那一行或那一列，别串到旁边去。",
    }),
    guidedStep("说清读表方法", "你是从哪里看出这个答案的？", ["表", "记录", "数出来", "最多", "最少", "合计", "一行", "一列"], {
      isReason: true,
      isFinal: true,
      repeatSentence: "我先看分类标准，再从对应的一行或一列读出数量。",
    }),
  ];
}

function inferApplicationRelation(prompt, explanation) {
  const text = normalizeText(`${prompt} ${explanation}`);
  if (text.includes("找回")) {
    return {
      intent: "找回",
      childChoice: "找回多少钱",
      operation: "减法",
      symbol: "-",
      keywords: ["找回", "付的钱", "价格", "剩下"],
      reasonKeywords: ["付的钱减价格", "减法", "找回", "剩下"],
    };
  }
  if (text.includes("还剩") || text.includes("飞走") || text.includes("用去") || text.includes("拿走")) {
    return {
      intent: "还剩",
      childChoice: "还剩多少",
      operation: "减法",
      symbol: "-",
      keywords: ["还剩", "少了", "去掉", "拿走", "飞走"],
      reasonKeywords: ["去掉", "剩下", "减法", "少了"],
    };
  }
  if (text.includes("平均") || text.includes("每份")) {
    return {
      intent: "每份",
      childChoice: "每份几个",
      operation: "除法",
      symbol: "÷",
      keywords: ["平均", "每份", "分成", "同样多"],
      reasonKeywords: ["平均分", "每份一样多", "除法"],
    };
  }
  if (text.includes("一共") || text.includes("又") || text.includes("合起来")) {
    return {
      intent: "一共",
      childChoice: "一共有多少",
      operation: "加法",
      symbol: "+",
      keywords: ["一共", "合起来", "又", "加起来"],
      reasonKeywords: ["合起来", "一共", "加法", "又多了"],
    };
  }
  return {
    intent: "",
    childChoice: "",
    operation: "",
    symbol: "",
    keywords: ["问题", "求什么", "一共", "还剩", "每份", "找回"],
    reasonKeywords: ["因为", "所以", "题目问", "先看条件"],
  };
}

function parseArithmeticExpression(text) {
  const match = String(text || "").match(/(\d+)\s*([+＋\-－×xX*÷/])\s*(\d+)/);
  if (!match) return null;
  const left = Number(match[1]);
  const right = Number(match[3]);
  const operator = normalizeOperator(match[2]);
  let result = NaN;
  if (operator === "+") result = left + right;
  if (operator === "-") result = left - right;
  if (operator === "×") result = left * right;
  if (operator === "÷" && right !== 0) result = left / right;
  if (!Number.isFinite(result)) return null;
  return { left, right, operator, result };
}

function parseArithmeticChain(text) {
  const match = String(text || "").match(/(\d+)\s*([+＋\-－×xX*÷/])\s*(\d+)\s*([+＋\-－×xX*÷/])\s*(\d+)/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[3]);
  const c = Number(match[5]);
  const op1 = normalizeOperator(match[2]);
  const op2 = normalizeOperator(match[4]);
  const priority = (operator) => (["×", "÷"].includes(operator) ? 2 : 1);
  const first =
    priority(op2) > priority(op1)
      ? { left: b, right: c, operator: op2, result: calculateBinaryOperation(b, c, op2) }
      : { left: a, right: b, operator: op1, result: calculateBinaryOperation(a, b, op1) };
  if (!Number.isFinite(first.result)) return null;
  const second =
    priority(op2) > priority(op1)
      ? { left: a, right: first.result, operator: op1, result: calculateBinaryOperation(a, first.result, op1) }
      : { left: first.result, right: c, operator: op2, result: calculateBinaryOperation(first.result, c, op2) };
  if (!Number.isFinite(second.result)) return null;
  return {
    first,
    second,
    result: second.result,
    rule: priority(op2) > priority(op1) ? "先算乘除，再算加减" : "从左往右一步一步算",
  };
}

function calculateBinaryOperation(left, right, operator) {
  const normalized = normalizeOperator(operator);
  if (normalized === "+") return left + right;
  if (normalized === "-") return left - right;
  if (normalized === "×") return left * right;
  if (normalized === "÷" && right !== 0) return left / right;
  return NaN;
}

function parseClockTimePair(text) {
  const matches = Array.from(String(text || "").matchAll(/(\d{1,2})[:：](\d{1,2})/g));
  if (matches.length < 2) return null;
  const startHour = Number(matches[0][1]);
  const startMinute = Number(matches[0][2]);
  const endHour = Number(matches[1][1]);
  const endMinute = Number(matches[1][2]);
  if (![startHour, startMinute, endHour, endMinute].every(Number.isFinite)) return null;
  return {
    start: startHour * 60 + startMinute,
    end: endHour * 60 + endMinute,
    startRaw: matches[0][0],
    endRaw: matches[1][0],
  };
}

function minutesToClockText(totalMinutes) {
  const minutes = ((Number(totalMinutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

function parseMultiplicationStructure(text) {
  const source = String(text || "");
  const normalized = normalizeText(source).replace(/两/g, "二");
  const expression = parseArithmeticExpression(source);
  if (expression?.operator === "×") return normalizeGroupInfo(expression.left, expression.right);

  let match = normalized.match(/每(?:组|份|行|列)(?:有)?(\d+)(?:个|只|本|支|块|张|条|朵|面|人)?.{0,10}(?:有|一共)?(\d+)(?:组|份|行|列)/);
  if (match) return normalizeGroupInfo(Number(match[2]), Number(match[1]));

  match = normalized.match(/(\d+)(?:组|份|行|列).{0,10}每(?:组|份|行|列)(?:有)?(\d+)/);
  if (match) return normalizeGroupInfo(Number(match[1]), Number(match[2]));

  match = normalized.match(/(\d+)(?:个|组|行|列|份)(\d+)/);
  if (match) return normalizeGroupInfo(Number(match[1]), Number(match[2]));

  match = normalized.match(/(\d+)个(\d+)/);
  if (match) return normalizeGroupInfo(Number(match[1]), Number(match[2]));

  match = normalized.match(/(\d+)\s*[×x*]\s*(\d+)/);
  if (match) return normalizeGroupInfo(Number(match[1]), Number(match[2]));

  return null;
}

function normalizeGroupInfo(groups, each) {
  const groupCount = Number(groups);
  const eachCount = Number(each);
  if (!Number.isFinite(groupCount) || !Number.isFinite(eachCount) || groupCount <= 0 || eachCount <= 0) return null;
  return {
    groups: groupCount,
    each: eachCount,
    total: groupCount * eachCount,
  };
}

function normalizeOperator(operator) {
  if (["+", "＋"].includes(operator)) return "+";
  if (["-", "－"].includes(operator)) return "-";
  if (["×", "x", "X", "*"].includes(operator)) return "×";
  if (["÷", "/"].includes(operator)) return "÷";
  return operator;
}

function operationName(operator) {
  const normalized = normalizeOperator(operator);
  if (normalized === "+") return "加法";
  if (normalized === "-") return "减法";
  if (normalized === "×") return "乘法";
  if (normalized === "÷") return "除法";
  return "运算";
}

function formatExpression(expression) {
  if (!expression) return "";
  return `${expression.left}${expression.operator}${expression.right}`;
}

function extractNumbers(text) {
  return Array.from(String(text || "").matchAll(/\d+/g))
    .map((match) => Number(match[0]))
    .filter(Number.isFinite);
}

function getCompareSymbol(value) {
  const text = String(value || "");
  if (text.includes("<") || text.includes("小于")) return "<";
  if (text.includes(">") || text.includes("大于")) return ">";
  if (text.includes("=") || text.includes("等于")) return "=";
  return "";
}

function compareSymbolKeywords(symbol) {
  if (symbol === "<") return ["<", "小于", "小于号"];
  if (symbol === ">") return [">", "大于", "大于号"];
  if (symbol === "=") return ["=", "等于", "等号", "一样大"];
  return ["<", ">", "=", "大于", "小于", "等于"];
}

function compareSymbolName(symbol) {
  if (symbol === "<") return "小于号";
  if (symbol === ">") return "大于号";
  if (symbol === "=") return "等号";
  return "比较符号";
}

function answerKeywordsForNumber(value, unit = "") {
  const number = Number(value);
  if (!Number.isFinite(number)) return [];
  const arabic = String(number);
  const chinese = chineseNumber(number);
  return uniqueKeywords([
    arabic,
    unit ? `${arabic}${unit}` : "",
    chinese,
    unit ? `${chinese}${unit}` : "",
    number === 10 && unit ? `一十${unit}` : "",
  ]);
}

function chineseNumber(value) {
  const number = Number(value);
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (!Number.isFinite(number) || number < 0 || number > 999) return String(value);
  if (number < 10) return digits[number];
  if (number === 10) return "十";
  if (number < 20) return `十${digits[number % 10]}`;
  if (number < 100) {
    const tens = Math.floor(number / 10);
    const ones = number % 10;
    return `${digits[tens]}十${ones ? digits[ones] : ""}`;
  }
  const hundreds = Math.floor(number / 100);
  const rest = number % 100;
  if (!rest) return `${digits[hundreds]}百`;
  return `${digits[hundreds]}百${rest < 10 ? "零" : ""}${chineseNumber(rest)}`;
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
  const visibleCustomLessons = questionBankBlueprints.length
    ? customLessons.filter((lesson) => /一|二/.test(String(lesson.grade || "")))
    : customLessons;
  return generated.concat(visibleCustomLessons.filter((lesson) => !generatedIds.has(lesson.id)));
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
    sourceQuestionFamily: generatedLesson.sourceQuestionFamily,
    activeQuestionFamily: generatedLesson.activeQuestionFamily,
    baseVisualType: generatedLesson.baseVisualType,
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
    const base = byId.get(override.id);
    const merged = {
      ...base,
      ...override,
      keywords: uniqueKeywords([...(base.keywords || []), ...(override.keywords || [])]),
      answerKeywords: uniqueKeywords([...(base.answerKeywords || []), ...(override.answerKeywords || [])]),
    };
    if (base.useQuestionBankTutor) {
      Object.assign(merged, {
        problem: base.problem,
        initialContext: base.initialContext,
        initialMessage: base.initialMessage,
        initialStep: base.initialStep,
        stepHint: base.stepHint,
        microSteps: base.microSteps,
        substeps: base.substeps,
        activeQuestionId: base.activeQuestionId,
        questionBank: base.questionBank,
        useQuestionBankTutor: base.useQuestionBankTutor,
        questionCursor: base.questionCursor,
        questionBankStats: base.questionBankStats,
        sourceQuestionBankId: base.sourceQuestionBankId,
        sourceQuestionFamily: base.sourceQuestionFamily,
        activeQuestionFamily: base.activeQuestionFamily,
        baseVisualType: base.baseVisualType,
        variationRules: base.variationRules,
        teachingMethods: base.teachingMethods,
        teachingProfile: base.teachingProfile,
        targetPassCount: base.targetPassCount,
        commonGaps: base.commonGaps,
        masterySignals: base.masterySignals,
        diagnosticFocus: base.diagnosticFocus,
        questionTypes: base.questionTypes,
        visualType: base.visualType,
        visualTitle: base.visualTitle,
        visualLabel: base.visualLabel,
        visualCardTitle: base.visualCardTitle,
        visualCardHint: base.visualCardHint,
      });
    }
    byId.set(override.id, merged);
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
  const activeQuestionFamily = spec.sourceQuestionFamily || spec.activeQuestionFamily || inferQuestionTeachingFamily(spec, activeQuestion);
  const visualType = visualTypeForTeachingFamily(activeQuestionFamily, spec.baseVisualType || spec.visualType || "generic");
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
    sourceQuestionFamily: activeQuestionFamily,
    activeQuestionFamily,
    initialContext: spec.initialContext || `${spec.node} 的学习从一个小问题开始。`,
    initialMessage: spec.initialMessage || `我们先学「${spec.node}」。先看这题：${problem}`,
    initialStep: spec.initialStep || `小台阶 1：${spec.microSteps[0]}`,
    stepHint: spec.stepHint || spec.microSteps[0],
    teachbackPrompt: `这次换你当小老师，讲给我听：${spec.node} 这题应该先想什么？`,
    repairPrompt: `没关系，我们换个更小的说法。先看图，再说：${spec.microSteps[0]}。`,
    doneMessage: "这次不只是答案对了，你也说出了怎么想。",
    prerequisites: createPrerequisites(spec),
    microSteps: spec.microSteps,
    commonGaps: spec.commonGaps,
    knowledgeLayers: spec.knowledgeLayers || ["识别层", "理解层", "操作层", "表达层", "迁移层"],
    substeps: spec.substeps || spec.microSteps,
    masterySignals: spec.masterySignals || [],
    diagnosticFocus: spec.diagnosticFocus || spec.masterySignals || spec.commonGaps || [],
    strategies,
    answer: createAnswerRules(spec, activeQuestion),
    visualType,
    baseVisualType: spec.baseVisualType || visualType,
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
  if (spec.visualType === "compare") return "先看两边，再填符号";
  if (spec.visualType === "count") return "按顺序数，不漏不重";
  if (spec.visualType === "position") return "先定方向，再找位置";
  if (spec.visualType === "number-line") return "在数线上一步一步看";
  if (spec.visualType === "ten-frame") return "用十格图看数量变化";
  if (spec.visualType === "place-value") return "按数位拆开看";
  if (spec.visualType === "array") return "用几行几列看几个几";
  if (spec.visualType === "sharing") return "平均分给每一份";
  if (spec.visualType === "money") return "先把元换成角，再相加";
  if (spec.visualType === "clock") return "先看时针，再看分针";
  if (spec.visualType === "shape") return "看特征，再认图形";
  if (spec.visualType === "pattern") return "先找重复或变化";
  if (spec.visualType === "ruler") return "先看单位和刻度";
  if (spec.visualType === "angle") return "看顶点和两条边";
  if (spec.visualType === "motion") return "看它是平移还是旋转";
  if (spec.visualType === "mass") return "先判断轻重和单位";
  if (spec.visualType === "data") return "先看分类和表格";
  if (spec.visualType === "logic") return "先确定，再排除";
  return "先读题，再只看一步";
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

function createEmptyMasteryEvidence() {
  return {
    direct: 0,
    variant: 0,
    reasoning: 0,
    teachback: 0,
  };
}

function recordMasteryEvidence(kind) {
  if (!state.masteryEvidence) state.masteryEvidence = createEmptyMasteryEvidence();
  if (!Object.prototype.hasOwnProperty.call(state.masteryEvidence, kind)) return;
  state.masteryEvidence[kind] += 1;
}

let state = {
  view: "child",
  lessonIndex: 0,
  phase: "guiding",
  recording: false,
  voiceStatus: "idle",
  voiceConfirmation: null,
  lastVoiceDiagnostic: null,
  isProcessing: false,
  showLessonPicker: false,
  showKeyboard: false,
  showVisual: true,
  strategyIndex: 0,
  mastery: 64,
  completedSteps: 0,
  guidedRepairCounts: {},
  todayQuestion: 2,
  transcript: "",
  lastStudentText: "",
  aiContext: lessons[0].initialContext,
  aiMessage: lessons[0].initialMessage,
  currentStep: lessons[0].initialStep,
  teachingState: "GUIDED_STEP",
  currentAtomName: lessons[0].useQuestionBankTutor ? createGuidedStepPlan(lessons[0], 0).label : "",
  engineSession: null,
  masteryEvidence: createEmptyMasteryEvidence(),
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

function safeCurrentLesson() {
  try {
    return typeof currentLesson === "function" ? currentLesson() : null;
  } catch {
    return null;
  }
}

function safeStateField(field, fallback = "") {
  try {
    return state?.[field] ?? fallback;
  } catch {
    return fallback;
  }
}

function safePassedQuestionCount() {
  try {
    return state?.passedQuestionIds?.length || 0;
  } catch {
    return 0;
  }
}

function getNextLessonIndex() {
  return (state.lessonIndex + 1) % lessons.length;
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
  const questionFamily = inferActiveQuestionFamily({ ...lesson, activeQuestion: question, problem: question.prompt }, question);
  lesson.activeQuestionFamily = questionFamily;
  lesson.sourceQuestionFamily = questionFamily || lesson.sourceQuestionFamily;
  lesson.visualType = visualTypeForTeachingFamily(questionFamily, lesson.baseVisualType || lesson.visualType || "generic");
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
  const starter = createGuidedStepPlan(lesson, selectVariantStartStepIndex(lesson));

  state.phase = "guiding";
  state.completedSteps = starter.index;
  state.mastery = Math.max(58, Math.min(state.mastery, 70));
  state.strategyIndex = 0;
  state.showVisual = true;
  state.showLessonPicker = false;
  state.lastStudentText = "";
  state.transcript = "";
  state.engineSession = null;
  state.teachingState = "GUIDED_STEP";
  state.currentAtomName = starter.label;
  state.currentStep = `小台阶 ${starter.index + 1}：${starter.label}`;
  state.aiContext = reason;
  state.aiMessage = createVariantQuestionMessage(lesson, nextQuestion, starter, reason);
  resetGeneratedVisualForTurn();
  addEvidence("换同类题", `从题库切到：${nextQuestion.prompt}`, "变式练习");
  render();
  speakCurrentMessage();
  return true;
}

function createVariantQuestionMessage(lesson, question, starter, reason = "") {
  const prompt = childFacingPrompt(question?.prompt || lesson.problem);
  const firstStep = formatChildStepPrompt(starter);
  const family = lesson.activeQuestionFamily || inferQuestionTeachingFamily(lesson, question);
  const key = `${lesson.id}|${question?.id || prompt}|${starter?.label || ""}|${reason}|${state.passedQuestionIds?.length || 0}`;
  const move = createStrategyDialogueMove(family, "variant", key);
  const lead = pickNaturalVariant([move, ...createVariantOpeningLeads(family)].filter(Boolean), `${key}|focused-variant`);
  return createFocusedGuidedMessage({
    lead,
    prompt,
    starter,
    family,
    key,
    mode: "variant",
  });
  if ((starter?.index || 0) > 0) {
    const lighterVariants = [
      `这次老师少提示一点。看题：${prompt}。先试这一小步：${firstStep}`,
      `换个小变化。题目是：${prompt}。先看：${firstStep}`,
      `方法还是刚才那个。先读题：${prompt}。请说关键一步：${firstStep}`,
      `题目变了，想法不变。${prompt} 这一轮先答：${firstStep}`,
    ];
    const lead = pickNaturalVariant([move, ""], `${key}|lead`);
    const body = pickNaturalVariant(lighterVariants, key);
    return softenTeacherScaffoldText(`${lead && lead !== body ? ensureChineseSentence(lead) : ""}${body}`);
  }
  const strategyVariant = createStrategyVariantQuestionMessage(family, prompt, firstStep, key);
  if (strategyVariant) {
    const lead = pickNaturalVariant([move, ""], `${key}|strategy-lead`);
    return softenTeacherScaffoldText(`${lead ? ensureChineseSentence(lead) : ""}${strategyVariant}`);
  }
  const variants = {
    makeTenAdd: [
      `换个小题，还是用凑十。看题：${prompt}。先想：${firstStep}`,
      `这次数字变了，方法不变。看题：${prompt}。先找哪个数快到10。${firstStep}`,
      `老师想确认你会不会迁移。题目是：${prompt}。先看凑十第一步：${firstStep}`,
    ],
    breakTenSubtract: [
      `换一道退位减法。看题：${prompt}。先看个位够不够减：${firstStep}`,
      `这题也别硬背答案，先用破十法。${prompt} ${firstStep}`,
      `我们再试一个小变化。题目是：${prompt}。先把十几拆开想：${firstStep}`,
    ],
    concreteAddition: [
      `换个小故事，还是看“合起来”。${prompt} ${firstStep}`,
      `这次先找两部分。题目是：${prompt}。先看一小步：${firstStep}`,
      `同样是加法意思，题目变一下。${prompt} ${firstStep}`,
    ],
    concreteSubtraction: [
      `换个小故事，还是看“拿走后还剩”。${prompt} ${firstStep}`,
      `这次先找原来有多少、少了多少。题目是：${prompt}。${firstStep}`,
      `同样是减法意思，题目变一下。${prompt} 先看：${firstStep}`,
    ],
    calculation: [
      `换个算式，别急着报答案。${prompt} 先说第一步：${firstStep}`,
      `我们用同一个方法再试一次。看题：${prompt}。${firstStep}`,
      `这题换了数字，先看方法有没有稳住。${prompt} ${firstStep}`,
    ],
    application: [
      `换个生活小题，先别乱加数字。${prompt} ${firstStep}`,
      `这次先读懂题意。${prompt} 先找线索：${firstStep}`,
      `同样是解决问题，先看问什么。${prompt} ${firstStep}`,
    ],
    compare: [
      `换一组数，再看两边。${prompt} ${firstStep}`,
      `这次只比大小，不急着猜符号。${prompt} ${firstStep}`,
      `我们换个数确认一下。${prompt} 先看：${firstStep}`,
    ],
    count: [
      `换一张图，还是按顺序数。${prompt} ${firstStep}`,
      `这次看会不会不漏不重。${prompt} ${firstStep}`,
      `再数一次新的图，慢慢来。${prompt} ${firstStep}`,
    ],
    composition: [
      `换一种分法，还是总数不变。${prompt} ${firstStep}`,
      `这次看另一部分。${prompt} ${firstStep}`,
      `我们用同样的“合起来检查”再试。${prompt} ${firstStep}`,
    ],
    ordinal: [
      `换一道位置题，先定方向。${prompt} ${firstStep}`,
      `这次别把第几个当总数。${prompt} ${firstStep}`,
      `再试一个方向题。${prompt} ${firstStep}`,
    ],
    pattern: [
      `换一组规律，先看怎么变。${prompt} ${firstStep}`,
      `这次不要只看最后一个，先看相邻两个。${prompt} ${firstStep}`,
      `同样找规律，再试一次。${prompt} ${firstStep}`,
    ],
    multiplication: [
      `换一个几个几，先找每组和组数。${prompt} ${firstStep}`,
      `口诀先放一边，先说几个几。${prompt} ${firstStep}`,
      `这题换了排列，意思还是几个几。${prompt} ${firstStep}`,
    ],
    division: [
      `换一道平均分，先看每份是不是一样多。${prompt} ${firstStep}`,
      `这次先说怎么分才公平。${prompt} ${firstStep}`,
      `再试一个平均分小题。${prompt} ${firstStep}`,
    ],
    placeValue: [
      `换一个数，先看每个数字站在哪一位。${prompt} ${firstStep}`,
      `这次看数位有没有稳住。${prompt} ${firstStep}`,
      `同样按位值来想。${prompt} ${firstStep}`,
    ],
    time: [
      `换一个钟面，还是先短针再长针。${prompt} ${firstStep}`,
      `这次看看两根针有没有分清。${prompt} ${firstStep}`,
      `再读一个时间。${prompt} ${firstStep}`,
    ],
    measure: [
      `换一个单位题，先看量的是什么。${prompt} ${firstStep}`,
      `这次先把单位看稳。${prompt} ${firstStep}`,
      `再试一道单位小题。${prompt} ${firstStep}`,
    ],
    shape: [
      `换一个图形，先看特征。${prompt} ${firstStep}`,
      `这次先找边、角或面。${prompt} ${firstStep}`,
      `再用特征判断一次。${prompt} ${firstStep}`,
    ],
    data: [
      `换一张表，先找对应位置。${prompt} ${firstStep}`,
      `这次先看分类标准。${prompt} ${firstStep}`,
      `再读一次表格。${prompt} ${firstStep}`,
    ],
    logic: [
      `换一道推理题，先看确定条件。${prompt} ${firstStep}`,
      `这次先排除不可能的。${prompt} ${firstStep}`,
      `再当一次小侦探。${prompt} ${firstStep}`,
    ],
  };
  const fallback = [
    `换个小变化。${prompt} 先答一步：${firstStep}`,
    `再来一题。${prompt} ${firstStep}`,
    `老师换个问法。${prompt} 先看：${firstStep}`,
  ];
  return softenTeacherScaffoldText(pickNaturalVariant(variants[family] || fallback, key));
}

function createLessonStartMessage(lesson, starter, reason = "") {
  const intro = reason ? "好，我们换一个知识点。" : "";
  if (lesson.useQuestionBankTutor && lesson.activeQuestion && starter) {
    const prompt = childFacingPrompt(lesson.activeQuestion.prompt);
    const family = inferActiveQuestionFamily(lesson, lesson.activeQuestion);
    return intro + createNaturalInitialMessage(
      { title: lesson.node, node: lesson.node, lesson: lesson.lesson, visualType: visualTypeForTeachingFamily(family, lesson.baseVisualType || lesson.visualType) },
      prompt,
      starter,
      family,
    );
  }
  return intro + lesson.initialMessage;
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

  return `
    <main class="child-stage kid-classroom">
      ${renderKidTopbar(lesson)}
      <section class="kid-workspace" aria-label="孩子学习区">
        <aside class="kid-coach" aria-label="老师引导区">
          ${renderKidTeacherAvatar("large")}
          ${renderKidQuestionBubble(lesson)}
          ${renderKidVoicePanel()}
          ${renderKidHelpButtons()}
        </aside>

        <section class="kid-board" aria-label="看图想一想">
          <button class="kid-board-ribbon" data-action="toggle-lesson-picker" aria-expanded="${state.showLessonPicker ? "true" : "false"}">
            ${escapeText(lesson.node)}
          </button>
          ${state.showLessonPicker ? renderLessonPicker() : ""}
          ${renderKidBoardVisual(lesson)}
        </section>
      </section>
    </main>
  `;
}

function renderKidTopbar(lesson) {
  return `
    <header class="kid-topbar" aria-label="乐之老师">
      <button class="kid-brand" data-action="child-home" aria-label="返回学习页">
        ${renderKidTeacherAvatar("mini")}
        <span>
          <strong>乐之老师</strong>
          <small>陪你想明白，再试一小步</small>
        </span>
      </button>
      ${renderKidProgressDots(lesson)}
      <div class="kid-top-actions">
        <button class="kid-lesson-switch" data-action="toggle-lesson-picker" aria-expanded="${state.showLessonPicker ? "true" : "false"}">
          ${icon("book")}
          <span>选知识点</span>
        </button>
        <div class="kid-day-pill" aria-label="今天只学一小步">
          <span aria-hidden="true">🌱</span>
          <strong>今天只学一小步</strong>
        </div>
      </div>
    </header>
  `;
}

function renderKidProgressDots(lesson) {
  const practiceStates = ["PRACTICE_SET", "ERROR_ANALYSIS", "REMEDIATION_TEACH", "REMEDIATION_RECHECK"];
  const teachbackStates = ["FEYNMAN_EXPLAIN", "FEYNMAN_EVAL", "MASTERED", "EXIT_WITH_NEXT"];
  const current = state.phase === "summary" || state.phase === "teachback" || teachbackStates.includes(state.teachingState)
    ? 2
    : practiceStates.includes(state.teachingState)
      ? 1
      : 0;
  const steps = ["先看懂", "再试试", "讲出来"];
  return `
    <div class="kid-progress" aria-label="本轮学习进度">
      ${steps
        .map(
          (label, index) => `
            <span class="kid-progress-step ${index < current ? "is-done" : ""} ${index === current ? "is-current" : ""}">
              <i>${index < current ? "✓" : index + 1}</i>
              <em>${label}</em>
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderKidQuestionBubble(lesson) {
  const plan = createGuidedStepPlan(lesson, state.completedSteps);
  const problem = childFacingPrompt(lesson.activeQuestion?.prompt || lesson.problem);
  const shortPrompt = formatChildStepPrompt(plan).replace(/^看这题[:：]\s*/, "");
  const fallbackMessage =
    state.phase === "summary"
      ? "这一步学会了。你可以换下一个知识点，也可以再练一题。"
      : `看这题：${problem} ${shortPrompt}`;
  const message = state.aiMessage || fallbackMessage;

  return `
    <section class="kid-speech-bubble" aria-label="老师提问">
      <span class="kid-speaker-label">乐之老师</span>
      <p>${escapeText(message)}</p>
      ${state.lastStudentText ? `<div class="kid-last-answer"><span>刚才你说</span><strong>${escapeText(state.lastStudentText)}</strong></div>` : ""}
    </section>
  `;
}

function renderKidVoicePanel() {
  const locked = state.isProcessing || state.voiceStatus === "processing";
  const inputLocked = state.recording || locked;
  return `
    <section class="kid-input-panel" aria-label="回答区">
      <div class="kid-answer-actions">
        <button class="kid-primary-voice ${state.recording ? "is-recording" : ""} ${locked ? "is-processing" : ""}" data-action="voice" ${locked ? "disabled" : ""}>
          ${icon("mic")}
          <span>${state.recording ? "说完了" : locked ? "老师正在想" : "点一下开始说"}</span>
        </button>
        <button class="kid-type-trigger" data-action="toggle-keyboard" ${inputLocked ? "disabled" : ""}>
          ${icon("keyboard")}
          <span>打字回答</span>
        </button>
      </div>
      ${renderVoiceConfirmation()}
      ${state.showKeyboard ? `<div class="kid-keyboard-wrap">${renderKeyboardComposer()}</div>` : ""}
      <p>${escapeText(renderDockNote())}</p>
    </section>
  `;
}

function renderVoiceConfirmation() {
  const confirmation = state.voiceConfirmation;
  if (!confirmation) return "";
  const heard = confirmation.heardText || confirmation.submitText || "";
  const submit = confirmation.submitText || heard;
  const corrected = normalizeText(heard) !== normalizeText(submit);
  const unitJoined = confirmation.reason === "number-unit-joined";
  return `
    <section class="voice-confirmation" role="status" aria-live="polite">
      <div class="voice-confirmation-copy">
        <span>${unitJoined ? "数字和单位可能听粘了" : corrected ? "这句话容易听混" : "老师再确认一下"}</span>
        <strong>${corrected ? `你说的是“${escapeText(submit)}”吗？` : `我听到“${escapeText(heard)}”，对吗？`}</strong>
      </div>
      <div class="voice-confirmation-actions">
        <button type="button" data-action="confirm-voice">${icon("check")}对，就是这个</button>
        <button type="button" data-action="retry-voice">${icon("repeat")}不对，我重说</button>
      </div>
    </section>
  `;
}

function renderKidHelpButtons() {
  const explainAction = state.phase === "teachback" || state.phase === "repair" ? "cant-explain" : "dont-understand";
  return `
    <div class="kid-help-row" aria-label="求助按钮">
      <button class="kid-help-button" data-action="${explainAction}">
        <span aria-hidden="true">🤔</span>
        <strong>${state.phase === "teachback" ? "我讲不出来" : "我需要提示"}</strong>
      </button>
      <button class="kid-help-button" data-action="show-visual">
        ${icon("image")}
        <strong>看提示图</strong>
      </button>
      <button class="kid-help-button kid-help-secondary" data-action="change-lesson">
        ${icon("book")}
        <strong>换知识点</strong>
      </button>
    </div>
  `;
}

function renderKidBoardVisual(lesson) {
  const visualLesson = createActiveVisualLesson(lesson);
  if (isMoneyApplicationLesson(visualLesson)) {
    return renderKidShoppingBoard(visualLesson);
  }
  if (visualLesson.visualType === "money" || lesson.id === "renminbi-conversion") {
    return renderKidMoneyBoard(visualLesson);
  }
  return `
    <div class="kid-board-card kid-board-card-generic">
      <div class="kid-board-head">
        <span>${icon("image")}看图想一想</span>
        <strong>这一小步</strong>
      </div>
      <h2>${escapeText(visualLesson.visualTitle || "把题目拆成小台阶")}</h2>
      <div class="kid-board-fallback">${renderLessonSvg(visualLesson, getVisualRevealMode(visualLesson))}</div>
      <div class="kid-think-box">
        <span>${icon("light")}</span>
        <strong>${escapeText(getKidBoardPrompt(visualLesson))}</strong>
      </div>
    </div>
  `;
}

function renderKidMoneyBoard(lesson) {
  const money = getMoneyVisualNumbers(lesson);
  const prompt = getKidBoardPrompt(lesson);
  const plan = createGuidedStepPlan(lesson, state.completedSteps);
  const label = normalizeText(`${plan?.label || ""}${plan?.prompt || ""}${state.currentStep || ""}`);
  const yuanCount = Math.max(1, Math.min(4, money.yuan || 3));
  const extraJiao = Math.max(0, Math.min(9, money.jiao || 0));
  const showConvertedYuan = /把\s*\d+\s*元换成角|换成几十角|再加|说出结果|说清|为什么|闯关/.test(label);
  const showExtraJiao = extraJiao > 0 && /再加|说出结果|说清|为什么|闯关/.test(label);
  const jiaoLabel = showConvertedYuan ? `${money.yuan ? money.yuan * 10 : 10}角` : "（  ）角";
  const extraLabel = showExtraJiao ? ` + ${extraJiao}角` : "";
  return `
    <div class="kid-board-card kid-money-board">
      <div class="kid-board-head">
        <span>${icon("image")}看图想一想</span>
        <strong>这一小步</strong>
      </div>
      <h2>${escapeText(lesson.visualTitle || "先把元换成角")}</h2>
      <div class="kid-money-layout">
        <div class="kid-money-box kid-money-yuan-box">
          <div class="kid-money-notes">
            ${Array.from({ length: yuanCount })
              .map((_, index) => `<span class="kid-money-note" style="--note-index:${index}"><em>1</em><small>元</small></span>`)
              .join("")}
          </div>
          <strong>${money.yuan || yuanCount}元</strong>
        </div>
        <div class="kid-money-arrow" aria-hidden="true"></div>
        <div class="kid-money-box kid-money-jiao-box">
          <div class="kid-coin-grid">
            ${Array.from({ length: 10 })
              .map(() => `<span class="kid-coin kid-coin-silver">1角</span>`)
              .join("")}
            ${showExtraJiao ? `<span class="kid-coin kid-coin-copper">${extraJiao}角</span>` : ""}
          </div>
          <strong>${jiaoLabel}${extraLabel}</strong>
        </div>
      </div>
      <div class="kid-think-box">
        <span>${icon("light")}</span>
        <strong>${escapeText(prompt)}</strong>
        <i aria-hidden="true"></i>
      </div>
    </div>
  `;
}

function isMoneyApplicationLesson(lesson) {
  const family = getLessonTeachingFamily(lesson);
  const text = `${lesson?.id || ""} ${lesson?.node || ""} ${lesson?.problem || ""} ${lesson?.activeQuestion?.prompt || ""}`;
  return family === "moneyApplication" || lesson?.id === "g1b-simple-shopping" || /找回|找零|应找/.test(text);
}

function renderKidShoppingBoard(lesson) {
  const sourcePrompt = lesson.activeQuestion?.prompt || lesson.problem || "";
  const story = parseMoneyApplicationQuestion(sourcePrompt, lesson.activeQuestion?.explanation || "");
  if (!story) return renderKidMoneyBoard(lesson);
  const plan = createGuidedStepPlan(lesson, state.completedSteps);
  const phase = getShoppingBoardPhase(plan);
  return `
    <div class="kid-board-card kid-shopping-board">
      <div class="kid-board-head">
        <span>${icon("image")}看图想一想</span>
        <strong>这一小步</strong>
      </div>
      <h2>${escapeText(getShoppingBoardTitle(phase))}</h2>
      <div class="kid-shopping-layout ${phase}">
        ${renderShoppingAmountBox("商品价格", story.price, phase === "price" || phase === "relation" || phase === "compute" || phase === "reason")}
        <div class="kid-shopping-relation ${phase === "relation" || phase === "compute" || phase === "reason" ? "is-active" : ""}">
          <span>付的钱</span>
          <strong>-</strong>
          <span>价钱</span>
          <strong>=</strong>
          <span>找回</span>
        </div>
        ${renderShoppingAmountBox("付的钱", story.pay, phase === "pay" || phase === "relation" || phase === "compute" || phase === "reason")}
      </div>
      ${phase === "compute" || phase === "reason"
        ? `
          <div class="kid-shopping-compute is-active">
            <strong>${story.pay.jiao}角 - ${story.price.jiao}角 = ${phase === "reason" ? formatJiaoAmount(story.answerJiao) : "（  ）角"}</strong>
            <span>现在只算找回的钱</span>
          </div>
        `
        : ""}
      <div class="kid-think-box">
        <span>${icon("light")}</span>
        <strong>${escapeText(getKidShoppingPrompt(lesson, plan, story))}</strong>
        <i aria-hidden="true"></i>
      </div>
    </div>
  `;
}

function getShoppingBoardPhase(plan) {
  const label = normalizeText(`${plan?.label || ""}${plan?.prompt || ""}`);
  if (/看问题|求什么/.test(label)) return "question";
  if (/找关系|付的钱减|减商品价格/.test(label)) return "relation";
  if (/统一单位|换成什么单位/.test(label)) return "unit";
  if (/换付的钱|付的钱/.test(label)) return "pay";
  if (/换商品价格|商品价格|价钱/.test(label)) return "price";
  if (/算找回|相减|减/.test(label)) return "compute";
  if (/说清|为什么|原因/.test(label)) return "reason";
  return "question";
}

function getShoppingBoardTitle(phase) {
  const titles = {
    question: "先看题目问什么",
    relation: "找回的钱从哪里来",
    unit: "元和角先换成同一种单位",
    pay: "先把付的钱换成角",
    price: "再把价钱换成角",
    compute: "用付的钱减价钱",
    reason: "把方法讲给老师听",
  };
  return titles[phase] || titles.question;
}

function getKidShoppingPrompt(lesson, plan, story) {
  const phase = getShoppingBoardPhase(plan);
  const prompts = {
    question: "题目要找回多少钱？",
    relation: "先说关系：找回的钱=付的钱-价钱。",
    unit: "元和角不能混着减，先都换成什么单位？",
    pay: `${story.pay.text} = （  ）角？`,
    price: `${story.price.text} = （  ）角？`,
    compute: `${story.pay.jiao}角 - ${story.price.jiao}角 = （  ）角？`,
    reason: "为什么要先换成角，再相减？",
  };
  return prompts[phase] || childFacingPrompt(plan?.prompt || lesson.problem);
}

function renderShoppingAmountBox(label, amount, active) {
  const yuanCount = Math.max(0, Math.min(4, Math.floor(amount.jiao / 10)));
  const restJiao = Math.max(0, amount.jiao % 10);
  return `
    <div class="kid-shopping-box ${active ? "is-active" : ""}">
      <span>${escapeText(label)}</span>
      <div class="kid-shopping-pieces">
        ${Array.from({ length: yuanCount })
          .map(() => `<em class="kid-shopping-note">1元</em>`)
          .join("")}
        ${restJiao ? `<em class="kid-shopping-coin">${restJiao}角</em>` : ""}
      </div>
      <strong>${escapeText(amount.text)}</strong>
      <small>${amount.jiao}角</small>
    </div>
  `;
}

function getKidBoardPrompt(lesson) {
  const plan = createGuidedStepPlan(lesson, state.completedSteps);
  const prompt = String(plan?.prompt || lesson.problem || "").trim();
  if (isMoneyApplicationLesson(lesson)) {
    const story = parseMoneyApplicationQuestion(lesson.activeQuestion?.prompt || lesson.problem || "", lesson.activeQuestion?.explanation || "");
    if (story) return getKidShoppingPrompt(lesson, plan, story);
  }
  const money = getMoneyVisualNumbers(lesson);
  if (plan?.isReason || /为什么|原因|单位/.test(`${plan?.label || ""}${prompt}`)) {
    if (lesson.visualType === "money" || lesson.id === "renminbi-conversion") return "为什么要先换成同一种单位？";
    return childFacingPrompt(prompt || lesson.activeQuestion?.prompt || lesson.problem);
  }
  if (/1元等于几角|1元是几角|1元等于多少角/.test(prompt)) return "1元是（  ）角？";
  if (/1角等于几分|1角是几分|1角等于多少分/.test(prompt)) return "1角是（  ）分？";
  if (/再加|一共|最后|合起来/.test(prompt) && money.jiao > 0) return `${money.yuanJiao}角 + ${money.jiao}角 = （  ）角？`;
  const yuanQuestion = prompt.match(/(\d+)元(?!\d*角).*?几角/);
  if (yuanQuestion) return `${yuanQuestion[1]}元是（  ）角？`;
  if (lesson.visualType === "money" || lesson.id === "renminbi-conversion") return `${money.yuan || 3}元是（  ）角？`;
  return childFacingPrompt(prompt || lesson.activeQuestion?.prompt || lesson.problem);
}

function renderKidTeacherAvatar(size = "large") {
  return `
    <div class="kid-teacher-avatar kid-teacher-${size}" aria-hidden="true">
      <img src="${TEACHER_AVATAR_SRC}" alt="" />
    </div>
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
      ${state.currentAtomName ? `<p class="atom-note">这一轮看：${escapeText(state.currentAtomName)}</p>` : ""}
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
  if (lesson?.useQuestionBankTutor) {
    return createGuidedStepPlan(lesson, state?.completedSteps || 0).steps.map((step) => step.label);
  }
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
  const locked = state.isProcessing || state.voiceStatus === "processing";
  const inputLocked = state.recording || locked;
  return `
    <section class="voice-dock" aria-label="语音输入区">
      ${renderVoiceConfirmation()}
      ${state.showKeyboard ? renderKeyboardComposer() : ""}
      <div class="dock-actions">
        <button class="dock-mini" data-action="camera" ${inputLocked ? "disabled" : ""}>${icon("camera")}拍照</button>
        <button class="voice-button ${state.recording ? "is-recording" : ""} ${locked ? "is-processing" : ""}" data-action="voice" aria-label="${escapeText(renderVoiceButtonAriaLabel())}" ${locked ? "disabled" : ""}>
          ${icon("mic")}
          <span>${renderVoiceButtonLabel()}</span>
        </button>
        <button class="dock-mini" data-action="toggle-keyboard" ${inputLocked ? "disabled" : ""}>${icon("keyboard")}键盘输入</button>
      </div>
      <p class="dock-note">${escapeText(renderDockNote())}</p>
    </section>
  `;
}

function renderVoiceButtonLabel() {
  if (state.recording) return "结束说话";
  if (state.isProcessing || state.voiceStatus === "processing") return "正在想";
  if (state.phase === "teachback") return "开始讲";
  return "开始说";
}

function renderVoiceButtonAriaLabel() {
  if (state.recording) return "点击结束说话";
  if (state.isProcessing || state.voiceStatus === "processing") return "老师正在思考";
  if (state.phase === "teachback") return "点击开始讲给老师听";
  return "点击开始说话";
}

function renderStepHint() {
  const lesson = currentLesson();
  if (lesson.useQuestionBankTutor && ["guiding", "repair"].includes(state.phase)) {
    return `这一轮先回答：${formatChildStepPrompt(createGuidedStepPlan(lesson, state.completedSteps))}`;
  }
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
  if (state.isProcessing || state.voiceStatus === "processing") return "老师听到了，马上接着讲。";
  if (state.voiceConfirmation) return "先看看老师有没有听对。听错了就点“我重说”。";
  if (state.phase === "teachback") return "像小老师一样讲给老师听，说不完整也没关系。";
  if (state.phase === "repair") return "可以看着图说，不用一次讲完整。";
  if (state.phase === "summary") return "这一题已经完成，可以换知识点或去家长页看记录。";
  return "点一下开始说话，说完再点一下结束。也可以直接说“换知识点”。";
}

function renderKeyboardComposer() {
  const locked = state.isProcessing || state.voiceStatus === "processing" || state.recording;
  return `
    <form class="keyboard-composer" data-form="typed-answer">
      <input name="answer" aria-label="打字回答" autocomplete="off" placeholder="也可以打字，例如：我想换知识点" ${locked ? "disabled" : ""} />
      <button class="btn btn-primary" data-action="send-text" type="submit" ${locked ? "disabled" : ""}>${locked ? "老师在想" : "发送"}</button>
    </form>
  `;
}

function renderLearningVisual() {
  const lesson = currentLesson();
  const visualLesson = createActiveVisualLesson(lesson);
  const visualMode = getVisualRevealMode(visualLesson);
  return `
    <div class="visual-panel visual-mode-${visualMode}">
      <div class="panel-head">
        <span>${icon("image")}看图想一想</span>
        <strong>${escapeText(getVisualPanelLabel(visualLesson))}</strong>
      </div>
      ${renderLessonSvg(visualLesson, visualMode)}
      <p class="visual-turn-note">本轮小问：${escapeText(getKidBoardPrompt(visualLesson))}${state.currentAtomName ? ` · ${escapeText(state.currentAtomName)}` : ""}</p>
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

function getVisualRevealMode(lesson = currentLesson()) {
  if (!lesson) return "question";
  const plan = createGuidedStepPlan(lesson, state.completedSteps || 0);
  const text = normalizeText(`${plan?.label || ""}${plan?.prompt || ""}${state.currentStep || ""}${state.currentAtomName || ""}`);
  if (state.phase === "summary" || state.phase === "teachback") return "solution";
  if (/说清|原因|为什么|方法|复述|讲给老师/.test(text)) return "solution";
  if (state.phase === "repair") return "hint";
  if ((state.completedSteps || 0) > 0) return "step";
  return "question";
}

function shouldRevealFinalVisualAnswer(mode) {
  return mode === "solution";
}

function getVisualPanelLabel(lesson) {
  const programTypes = new Set([
    "money",
    "perimeter",
    "time",
    "clock",
    "ten-frame",
    "number-line",
    "place-value",
    "shape",
    "ruler",
    "angle",
    "array",
    "sharing",
    "data",
    "pattern",
    "motion",
    "mass",
    "logic",
  ]);
  if (lesson.id === "g1b-simple-shopping" || programTypes.has(lesson.visualType) || ["compare", "count", "position"].includes(lesson.visualType)) return "按当前小台阶绘制";
  if (lesson.activeQuestion?.visualMarkup) return "当前题图";
  return lesson.visualLabel;
}

function createActiveVisualLesson(lesson) {
  const visualType = getActiveVisualType(lesson);
  const visualTitle = createActiveVisualTitle(lesson, visualType);
  return {
    ...lesson,
    visualType,
    visualTitle,
    visualLabel: ["compare", "count", "position"].includes(visualType) ? "程序辅助理解" : lesson.visualLabel,
  };
}

function getCurrentVisualPlan(lesson = currentLesson()) {
  if (!lesson) return null;
  const index = Math.max(0, Number(state.completedSteps) || 0);
  return createGuidedStepPlan(lesson, index);
}

function createActiveVisualTitle(lesson, visualType) {
  const plan = getCurrentVisualPlan(lesson);
  const label = String(plan?.label || state.currentAtomName || "").trim();
  if (state.phase !== "summary" && label) {
    if (plan?.isReason || /原因|为什么|说清|讲/.test(label)) return "说清为什么";
    return label;
  }
  if (state.phase === "summary") return "会做，也能讲清楚";
  return createVisualTitle({ ...lesson, visualType });
}

function getActiveVisualType(lesson) {
  const question = lesson?.activeQuestion || null;
  const family = inferActiveQuestionFamily(lesson, question);
  return visualTypeForTeachingFamily(family, lesson?.baseVisualType || lesson?.visualType || "generic");
}

function inferActiveQuestionFamily(lesson, question = lesson?.activeQuestion || null) {
  const knownFamily =
    lesson?.activeQuestionFamily ||
    lesson?.sourceQuestionFamily ||
    lesson?.questionBankStats?.family ||
    getKnowledgePointFamily(lesson);
  if (knownFamily) return knownFamily;

  const cleanLesson = {
    ...lesson,
    visualType: lesson?.baseVisualType || lesson?.visualType || "generic",
    activeQuestionFamily: "",
    sourceQuestionFamily: "",
  };
  const inferred = inferQuestionTeachingFamily(cleanLesson, question);
  if (inferred && inferred !== "generic") return inferred;
  return lesson?.activeQuestionFamily || lesson?.sourceQuestionFamily || inferred || "generic";
}

function renderLessonSvg(lesson, visualMode = getVisualRevealMode(lesson)) {
  const visualType = getActiveVisualType(lesson);
  const visualLesson = visualType === lesson.visualType
    ? lesson
    : { ...lesson, visualType, visualTitle: createVisualTitle({ ...lesson, visualType }) };
  if (visualLesson.id === "g1b-simple-shopping" && visualLesson.visualType === "money") return renderShoppingSvg(visualLesson, visualMode);
  if (visualLesson.visualType === "money") return renderMoneySvg(visualLesson, visualMode);
  if (visualLesson.visualType === "perimeter") return renderPerimeterSvg(visualLesson);
  if (visualLesson.visualType === "time") return renderTimeSvg(visualLesson);
  if (visualLesson.visualType === "clock") return renderClockSvg(visualLesson);
  if (visualLesson.visualType === "ten-frame") return renderTenFrameSvg(visualLesson, visualMode);
  if (visualLesson.visualType === "number-line") return renderNumberLineSvg(visualLesson);
  if (visualLesson.visualType === "place-value") return renderPlaceValueSvg(visualLesson);
  if (visualLesson.visualType === "shape") return renderShapeSvg(visualLesson);
  if (visualLesson.visualType === "ruler") return renderRulerSvg(visualLesson);
  if (visualLesson.visualType === "angle") return renderAngleSvg(visualLesson);
  if (visualLesson.visualType === "array") return renderArraySvg(visualLesson);
  if (visualLesson.visualType === "sharing") return renderSharingSvg(visualLesson);
  if (visualLesson.visualType === "data") return renderDataSvg(visualLesson);
  if (visualLesson.visualType === "pattern") return renderPatternSvg(visualLesson);
  if (visualLesson.visualType === "motion") return renderMotionSvg(visualLesson);
  if (visualLesson.visualType === "mass") return renderMassSvg(visualLesson);
  if (visualLesson.visualType === "logic") return renderLogicSvg(visualLesson);
  if (visualLesson.activeQuestion?.visualMarkup && !["compare", "count", "position", "money"].includes(visualLesson.visualType)) return renderQuestionVisualMarkup(visualLesson);
  if (visualLesson.visualType === "count" || visualLesson.visualType === "compare" || visualLesson.visualType === "position") {
    return renderPrimaryThinkingSvg(visualLesson, visualMode);
  }
  if (visualLesson.visualType !== "fraction") return renderGenericStepSvg(visualLesson);
  return renderFractionSvg(visualLesson);
}

function renderQuestionVisualMarkup(lesson) {
  return `
    <div class="question-visual-markup" role="img" aria-label="${escapeAttr(lesson.activeQuestion?.prompt || lesson.node)}">
      ${lesson.activeQuestion.visualMarkup}
    </div>
  `;
}

function renderPrimaryThinkingSvg(lesson, visualMode = getVisualRevealMode(lesson)) {
  if (lesson.visualType === "compare") return renderCompareThinkingSvg(lesson, visualMode);
  if (lesson.visualType === "position") return renderOrdinalThinkingSvg(lesson);
  if (lesson.visualType === "count") return renderCountThinkingSvg(lesson);
  const labels = lesson.visualType === "compare" ? ["一一配对", "看谁剩下", "说多和少"] : lesson.microSteps;
  const stepLabels = (labels || []).slice(0, 3);
  return `
    <svg class="lesson-svg primary-thinking-svg" viewBox="0 0 520 238" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <g transform="translate(48 62)">
        ${[0, 1, 2, 3, 4, 5].map((item) => `<circle cx="${item * 46}" cy="22" r="15" fill="#65d6ad" stroke="#244056" stroke-width="3"/>`).join("")}
        ${[0, 1, 2, 3, 4].map((item) => `<rect x="${item * 46 - 15}" y="78" width="30" height="30" rx="8" fill="#4da3ff" stroke="#244056" stroke-width="3"/>`).join("")}
        <path d="M0 52h214" stroke="#ffb72b" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
      </g>
      <g class="svg-step-labels" transform="translate(50 174)">
        ${stepLabels
          .map((label, index) => {
            const x = index * 144;
            const arrow = index < stepLabels.length - 1 ? `<path class="svg-step-arrow" d="M${x + 104} 21h24" marker-end="url(#primary-step-arrow)"/>` : "";
            return `
              <rect class="svg-step-pill" x="${x}" y="0" width="104" height="42" rx="18"/>
              <text class="svg-step-label" x="${x + 52}" y="27" text-anchor="middle">${escapeText(shortSvgText(label, 6))}</text>
              ${arrow}
            `;
          })
          .join("")}
      </g>
      <defs>
        <marker id="primary-step-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#a36900"/>
        </marker>
      </defs>
    </svg>
  `;
}

function renderCompareThinkingSvg(lesson, visualMode = getVisualRevealMode(lesson)) {
  const question = lesson.activeQuestion || null;
  const numbers = extractNumbers(question?.prompt || lesson.problem || "");
  const left = numbers[0] || 3;
  const right = numbers[1] || 5;
  const symbol = getCompareSymbol(question?.answer || "") || "□";
  const largerText = left === right ? "一样大" : left > right ? "左边大" : "右边大";
  const revealAnswer = shouldRevealFinalVisualAnswer(visualMode);
  const plan = getCurrentVisualPlan(lesson);
  const planText = normalizeText(`${plan?.label || ""} ${plan?.prompt || ""} ${state.currentStep || ""}`);
  let summaryText = `${left} □ ${right} · 先看哪边大`;
  if (revealAnswer) {
    summaryText = `${left} ${symbol} ${right} · ${largerText}`;
  } else if (/填比较符号|大于号|小于号|等号|符号/.test(planText)) {
    summaryText = `${left} □ ${right} · 该填哪个符号？`;
  } else if (/原因|为什么|说清/.test(planText)) {
    summaryText = `${left} ${symbol} ${right} · 说说为什么`;
  }
  const leftItems = Math.min(left, 9);
  const rightItems = Math.min(right, 9);
  return `
    <svg class="lesson-svg primary-thinking-svg" viewBox="0 0 520 238" role="img" aria-label="${escapeAttr(question?.prompt || lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <text x="58" y="66" class="svg-note">左边 ${left}</text>
      <text x="58" y="126" class="svg-note">右边 ${right}</text>
      <g transform="translate(150 48)">
        ${Array.from({ length: leftItems }, (_, index) => `<circle cx="${index * 34}" cy="20" r="14" fill="#65d6ad" stroke="#244056" stroke-width="3"/>`).join("")}
        ${left > leftItems ? `<text x="${leftItems * 34 + 4}" y="27" class="svg-note">...</text>` : ""}
      </g>
      <g transform="translate(150 108)">
        ${Array.from({ length: rightItems }, (_, index) => `<rect x="${index * 34 - 14}" y="2" width="28" height="28" rx="8" fill="#4da3ff" stroke="#244056" stroke-width="3"/>`).join("")}
        ${right > rightItems ? `<text x="${rightItems * 34 + 4}" y="27" class="svg-note">...</text>` : ""}
      </g>
      <path d="M150 92h${Math.max(leftItems, rightItems) * 34}" stroke="#ffb72b" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
      <rect x="82" y="164" width="356" height="48" rx="18" fill="#fff4d8" stroke="#ffb72b" stroke-width="3"/>
      <text x="260" y="196" class="svg-win" text-anchor="middle">${escapeText(summaryText)}</text>
    </svg>
  `;
}

function renderOrdinalThinkingSvg(lesson) {
  const question = lesson.activeQuestion || null;
  const prompt = question?.prompt || lesson.problem || "";
  const numbers = extractNumbers(prompt);
  const total = Math.max(3, Math.min(9, numbers[0] || 5));
  const ordinal = Math.max(1, Math.min(total, Number(prompt.match(/第\s*(\d+)/)?.[1] || numbers[1] || 3)));
  const direction = prompt.includes("从右") ? "从右往左数" : "从左往右数";
  return `
    <svg class="lesson-svg primary-thinking-svg" viewBox="0 0 520 238" role="img" aria-label="${escapeAttr(question?.prompt || lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <text x="58" y="66" class="svg-note">${escapeText(direction)}，找第 ${ordinal} 个</text>
      <g transform="translate(70 104)">
        ${Array.from({ length: total }, (_, index) => {
          const number = index + 1;
          const active = number === ordinal;
          return `
            <circle cx="${index * 46}" cy="0" r="${active ? 20 : 16}" fill="${active ? "#ffd36a" : "#65d6ad"}" stroke="#244056" stroke-width="3"/>
            <text x="${index * 46}" y="${active ? 7 : 6}" class="svg-label" text-anchor="middle">${number}</text>
          `;
        }).join("")}
      </g>
      <rect x="82" y="156" width="356" height="52" rx="18" fill="#fff4d8" stroke="#ffb72b" stroke-width="3"/>
      <text x="260" y="190" class="svg-win" text-anchor="middle">第几个是位置，不是总数</text>
    </svg>
  `;
}

function renderCountThinkingSvg(lesson) {
  const question = lesson.activeQuestion || null;
  const answerNumber = Number(String(question?.answer || "").match(/\d+/)?.[0] || NaN);
  const count = Math.max(3, Math.min(10, Number.isFinite(answerNumber) ? answerNumber : 6));
  return `
    <svg class="lesson-svg primary-thinking-svg" viewBox="0 0 520 238" role="img" aria-label="${escapeAttr(question?.prompt || lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <text x="64" y="66" class="svg-note">一个一个点着数</text>
      <g transform="translate(82 92)">
        ${Array.from({ length: count }, (_, index) => {
          const x = (index % 5) * 66;
          const y = Math.floor(index / 5) * 54;
          return `<circle cx="${x}" cy="${y}" r="19" fill="#65d6ad" stroke="#244056" stroke-width="3"/><text x="${x}" y="${y + 7}" class="svg-label" text-anchor="middle">${index + 1}</text>`;
        }).join("")}
      </g>
      <rect x="82" y="172" width="356" height="42" rx="18" fill="#fff4d8" stroke="#ffb72b" stroke-width="3"/>
      <text x="260" y="200" class="svg-win" text-anchor="middle">最后数到几，总数就是几</text>
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

function renderTenFrameSvg(lesson, visualMode = getVisualRevealMode(lesson)) {
  const question = lesson?.activeQuestion || null;
  const expression = parseTeachingArithmeticExpression(question) || parseArithmeticExpression(`${question?.prompt || ""} ${question?.explanation || ""} ${lesson?.problem || ""}`);
  const family = inferActiveQuestionFamily(lesson, question);
  if (family === "makeTenAdd" && isMakeTenAdditionExpression(expression)) return renderMakeTenFrameSvg(lesson, expression, visualMode);
  if (family === "breakTenSubtract" && isBreakTenSubtractionExpression(expression)) return renderBreakTenFrameSvg(lesson, expression, visualMode);

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

function renderMakeTenFrameSvg(lesson, expression, visualMode = getVisualRevealMode(lesson)) {
  const base = expression.left >= expression.right ? expression.left : expression.right;
  const addend = expression.left >= expression.right ? expression.right : expression.left;
  const gap = 10 - base;
  const remain = Math.max(0, addend - gap);
  const total = expression.result;
  const stepIndex = Number(state.completedSteps) || 0;
  const revealGap = visualMode === "solution" || stepIndex >= 2;
  const revealRemain = visualMode === "solution" || stepIndex >= 3;
  const revealTotal = visualMode === "solution" || stepIndex >= 5;
  const title = stepIndex <= 0 ? "先看：哪个数快到10？" : "凑十：先补成10";
  const note = stepIndex <= 0
    ? `${expression.left}+${expression.right}，先找最接近10的数`
    : `${base}还差${revealGap ? gap : "（ ）"}到10，把${addend}拆成${revealGap ? gap : "（ ）"}和${revealRemain ? remain : "（ ）"}`;
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="24" y="30" class="svg-title">${escapeText(title)}</text>
      <text x="48" y="62" class="svg-note">${escapeText(note)}</text>
      <g transform="translate(48 82)">
        ${Array.from({ length: 10 }, (_, index) => {
          const x = (index % 5) * 48;
          const y = Math.floor(index / 5) * 44;
          const fill = index < base ? "#65d6ad" : revealGap && index < base + gap ? "#ffd36a" : "#fff";
          return `<rect x="${x}" y="${y}" width="38" height="34" rx="8" fill="${fill}" stroke="#244056" stroke-width="3"/>`;
        }).join("")}
      </g>
      <g transform="translate(326 92)">
        <rect x="0" y="0" width="48" height="38" rx="10" fill="#ffd36a" stroke="#244056" stroke-width="3"/>
        <text x="14" y="25" class="svg-label">${revealGap ? gap : "?"}</text>
        <text x="58" y="26" class="svg-note">先拿来凑十</text>
        <rect x="0" y="58" width="48" height="38" rx="10" fill="#4da3ff" stroke="#244056" stroke-width="3"/>
        <text x="14" y="83" class="svg-label">${revealRemain ? remain : "?"}</text>
        <text x="58" y="84" class="svg-note">剩下再加</text>
      </g>
      <path d="M292 116c20 0 30-18 44-18" fill="none" stroke="#ffb72b" stroke-width="6" stroke-linecap="round"/>
      <text x="48" y="196" class="svg-win">${escapeText(revealTotal ? `先算 ${base}+${gap}=10，再算 10+${remain}=${total}` : `${base}+（ ）=10，再把剩下的加回来`)}</text>
    </svg>
  `;
}

function renderBreakTenFrameSvg(lesson, expression, visualMode = getVisualRevealMode(lesson)) {
  const ones = expression.left - 10;
  const tenMinus = 10 - expression.right;
  const total = expression.result;
  const stepIndex = Number(state.completedSteps) || 0;
  const revealSplit = visualMode === "solution" || stepIndex >= 2;
  const revealTenMinus = visualMode === "solution" || stepIndex >= 3;
  const revealTotal = visualMode === "solution" || stepIndex >= 4;
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="24" y="30" class="svg-title">破十：先看个位够不够</text>
      <text x="48" y="62" class="svg-note">${escapeText(revealSplit ? `${expression.left}拆成10和${ones}，先用10减` : `${expression.left}先拆成10和（ ）`)}</text>
      <g transform="translate(48 82)">
        ${Array.from({ length: 10 }, (_, index) => {
          const x = (index % 5) * 48;
          const y = Math.floor(index / 5) * 44;
          const removed = index < expression.right;
          return `<rect x="${x}" y="${y}" width="38" height="34" rx="8" fill="${removed ? "#ffe8e3" : "#65d6ad"}" stroke="#244056" stroke-width="3"/>
            ${removed ? `<line x1="${x + 8}" y1="${y + 8}" x2="${x + 30}" y2="${y + 26}" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round"/>` : ""}`;
        }).join("")}
      </g>
      <g transform="translate(332 90)">
        <rect x="0" y="0" width="56" height="42" rx="12" fill="#d9ecff" stroke="#244056" stroke-width="3"/>
        <text x="14" y="28" class="svg-label">${revealSplit ? ones : "?"}</text>
        <text x="70" y="28" class="svg-note">原来的个位</text>
        <rect x="0" y="66" width="56" height="42" rx="12" fill="#ffd36a" stroke="#244056" stroke-width="3"/>
        <text x="14" y="94" class="svg-label">${revealTenMinus ? tenMinus : "?"}</text>
        <text x="70" y="94" class="svg-note">10-${expression.right}</text>
      </g>
      <text x="48" y="196" class="svg-win">${escapeText(revealTotal ? `先算 10-${expression.right}=${tenMinus}，再加 ${ones}，得 ${total}` : `先用10减，再加回原来的个位`)}</text>
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
  const questionText = `${lesson.activeQuestion?.prompt || ""} ${lesson.activeQuestion?.explanation || ""} ${lesson.problem || ""}`;
  const group = parseMultiplicationStructure(questionText);
  const groups = Math.max(1, Math.min(6, group?.groups || 4));
  const each = Math.max(1, Math.min(8, group?.each || 6));
  const totalLabel = group ? `${group.groups}组，每组${group.each}个，一共${group.total}个` : "几组同样多";
  const circles = Array.from({ length: groups }, (_, row) =>
    Array.from({ length: each }, (_, col) => `<circle cx="${col * 34}" cy="${row * 28}" r="9" fill="#65d6ad" stroke="#244056" stroke-width="2"/>`).join(""),
  ).join("");
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="${escapeAttr(lesson.node)}">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <g transform="translate(86 62)">
        ${circles}
      </g>
      <text x="330" y="96" class="svg-note">${escapeText(shortSvgText(totalLabel, 18))}</text>
      <text x="128" y="190" class="svg-win">${escapeText(shortSvgText(group ? `${group.groups}个${group.each}可以用乘法` : lesson.microSteps.join("，"), 24))}</text>
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

function renderMoneySvg(lesson, visualMode = getVisualRevealMode(lesson)) {
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
  const promptText = isRate
    ? "1 元 = ? 角"
    : money.isPureYuanQuestion || isConvert
      ? `${money.yuan} 元 = ? 角`
      : `${money.yuanJiao} 角 + ${money.jiao} 角 = ? 角`;
  const notes = Array.from({ length: noteCount }, (_, index) => moneyNote(index * 24, index * 8, "1元", "#65d6ad")).join("");
  const extraNote = !isRate && money.yuan > 4 ? `<text x="370" y="96" class="svg-note">共 ${money.yuan} 张</text>` : "";
  const rightSide = isRate
    ? `<g transform="translate(286 64)">${renderMoneyCoins(10)}</g><text x="318" y="154" class="svg-note">10 个 1 角</text>`
    : isAdd
      ? `<rect x="318" y="70" width="86" height="50" rx="12" fill="#ffd36a" stroke="#244056" stroke-width="3"/>
         <text x="338" y="103" class="svg-label">${money.jiao}角</text>
         <text x="310" y="148" class="svg-note">原来的几角</text>`
      : `<rect x="312" y="70" width="118" height="50" rx="12" fill="#fff4d8" stroke="#244056" stroke-width="3"/>
         <text x="334" y="103" class="svg-label">?角</text>
         <text x="306" y="148" class="svg-note">先换成角</text>`;
  const middleLabel = isRate ? "换成" : isAdd ? "再加" : "换算";
  const leftLabel = isRate ? "1 张 1 元" : `${money.yuan} 元`;
  return `
    <svg class="lesson-svg money-svg" viewBox="0 0 520 238" role="img" aria-label="把元和角换成同一种单位">
      <text x="26" y="30" class="svg-title">${escapeText(title)}</text>
      <g transform="translate(42 62)">
        ${notes}
      </g>
      ${extraNote}
      <text x="58" y="148" class="svg-note">${escapeText(leftLabel)}</text>
      <path d="M218 92h48" fill="none" stroke="#244056" stroke-width="5" stroke-linecap="round"/>
      <path d="m256 80 16 12-16 12" fill="none" stroke="#244056" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="220" y="128" class="svg-note">${escapeText(middleLabel)}</text>
      ${rightSide}
      <rect x="92" y="178" width="336" height="40" rx="14" fill="#fff4d8"/>
      <text x="134" y="204" class="svg-win">${escapeText(promptText)}</text>
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
  const questionSource = `${lesson.activeQuestion?.prompt || ""} ${lesson.activeQuestion?.answer || ""} ${lesson.activeQuestion?.explanation || ""}`;
  const source = normalizeText(`${state.currentStep || ""} ${questionSource} ${lesson.problem || ""} ${state.aiMessage || ""}`);
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

function renderShoppingSvg(lesson, visualMode = getVisualRevealMode(lesson)) {
  const { price, paid, change, item } = getShoppingVisualNumbers(lesson);
  const atom = normalizeText(state.currentAtomName || "");
  const step = normalizeText(state.currentStep || "");
  const isPrice = atom.includes("价格") || step.includes("价格");
  const isPaid = atom.includes("付了多少钱") || step.includes("付了多少钱");
  const isChange = atom.includes("找回") || atom.includes("减法") || step.includes("找回") || step.includes("减法") || step.includes("闯关");
  const revealChange = shouldRevealFinalVisualAnswer(visualMode) || isChange;
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
        <text x="24" y="32" class="svg-label">${revealChange ? `${change}元` : "?元"}</text>
        <text x="9" y="74" class="svg-note">找回</text>
      </g>
      <text x="126" y="190" class="svg-win">${escapeText(revealChange ? `${paid}元 - ${price}元 = ${change}元` : `${paid}元 - ${price}元 = （ ）元`)}</text>
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
  if (state.isProcessing || state.voiceStatus === "processing") return;
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
    if (state.showKeyboard) {
      requestAnimationFrame(() => {
        document.querySelector('.kid-keyboard-wrap input[name="answer"], .keyboard-composer input[name="answer"]')?.focus();
      });
    }
    return;
  }

  if (action === "confirm-voice") {
    const confirmation = state.voiceConfirmation;
    state.voiceConfirmation = null;
    render();
    if (confirmation?.submitText) handleChildInput(confirmation.submitText, "voice");
    return;
  }

  if (action === "retry-voice") {
    state.voiceConfirmation = null;
    state.transcript = "";
    state.lastStudentText = "";
    render();
    toastMessage("好，我们重新说一次。这次靠近一点，慢一点说。");
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

  if (action === "next-lesson") {
    changeLesson("孩子选择继续下一个知识点。", getNextLessonIndex());
    return;
  }

  if (action === "new-example") {
    advanceLessonQuestion("孩子想换一道同类题。");
    return;
  }

  if (action === "show-visual") {
    const lesson = currentLesson();
    const plan = createGuidedStepPlan(lesson, state.completedSteps);
    state.showVisual = true;
    state.strategyIndex = Math.max(state.strategyIndex, 1);
    state.aiContext = "我们看图再说一遍。";
    state.currentAtomName = plan.label;
    state.currentStep = `小台阶 ${plan.index + 1}：${plan.label}`;
    state.aiMessage = teacherRepairMessage("先看图里的关键数。", plan);
    state.bestStrategy = "画图";
    addEvidence("看图辅助", "孩子请求再看图，AI 切换到图示讲法。", "画图");
    resetGeneratedVisualForTurn();
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
  if (lesson.useQuestionBankTutor) {
    const bank = getLessonQuestionBank(lesson);
    if (bank.length) {
      const cursor = Math.max(0, Math.min(bank.length - 1, Number(lesson.questionCursor) || 0));
      activateLessonQuestion(lesson, bank[cursor] || bank[0], cursor);
    }
  }
  const starter = lesson.useQuestionBankTutor ? createGuidedStepPlan(lesson, 0) : null;
  state.lessonIndex = nextIndex;
  state.phase = "guiding";
  state.recording = false;
  state.voiceStatus = "idle";
  state.voiceConfirmation = null;
  state.isProcessing = false;
  state.showLessonPicker = false;
  state.showKeyboard = false;
  state.strategyIndex = 0;
  state.mastery = 60;
  state.completedSteps = 0;
  clearGuidedRepairAttempts();
  state.transcript = "";
  state.lastStudentText = "";
  state.aiContext = reason || lesson.initialContext;
  state.aiMessage = createLessonStartMessage(lesson, starter, reason);
  state.currentStep = starter ? `小台阶 1：${starter.label}` : lesson.initialStep;
  state.teachingState = "GUIDED_STEP";
  state.currentAtomName = starter?.label || "";
  state.engineSession = null;
  state.masteryEvidence = createEmptyMasteryEvidence();
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

function createVoiceRecognitionContext() {
  const lesson = currentLesson();
  const question = lesson?.activeQuestion || null;
  let plan = null;
  try {
    plan = createGuidedStepPlan(lesson, state.completedSteps);
  } catch {
    plan = null;
  }
  const expectedAnswers = uniqueKeywords([
    ...(plan?.answerKeywords || []),
    ...(question?.answerKeywords || []),
    ...(lesson?.answer?.answerKeywords || []),
    question?.answer,
  ])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 48);
  const fallbackPrompt = formatChildStepPrompt(plan) || question?.prompt || lesson?.problem || "";
  const prompt = resolveCurrentVoicePrompt(fallbackPrompt);
  const expectedType = inferVoiceAnswerType(prompt, plan, expectedAnswers);
  return {
    lessonId: lesson?.id || "",
    questionId: question?.id || "",
    lessonName: lesson?.node || lesson?.lesson || "",
    stepLabel: plan?.label || state.currentAtomName || "",
    prompt,
    expectedType,
    expectedAnswers,
    hotwords: buildVoiceHotwords(lesson, plan, expectedAnswers, prompt),
  };
}

function inferVoiceAnswerType(prompt, plan, expectedAnswers) {
  const focus = extractVoicePromptFocus(prompt);
  const text = normalizeText(focus || prompt || "");
  const answerText = normalizeText((expectedAnswers || []).join(" "));
  if (state.phase === "teachback" || /为什么|原因|说一说方法|讲给老师|怎么想|怎么知道|说说理由/.test(text)) return "explanation";
  if (/大于号|小于号|等号|比较符号/.test(text + answerText) || /[<>=＝]/.test(answerText)) return "comparison";
  if (/对不对|是不是|能不能|是否|正确吗/.test(text)) return "yes-no";
  if (/多少|几个|第几|几元|几角|几分|几时|几点|几厘米|几米|算出|得数|结果/.test(text)) return "number";
  if (/还是|选择|哪一个|哪个|哪边|填什么|是什么/.test(text)) return "choice";
  if (plan?.isReason) return "explanation";
  if ((expectedAnswers || []).some((item) => /[0-9零一二两三四五六七八九十百千万]/.test(String(item)))) return "number";
  return "open";
}

function resolveCurrentVoicePrompt(fallbackPrompt) {
  const visibleMessage = String(state.aiMessage || "").replace(/\s+/g, " ").trim();
  const visibleFocus = extractVoicePromptFocus(visibleMessage);
  if (visibleFocus && /[？?]|只说|回答|跟着说|先说|请说|填/.test(visibleFocus)) return visibleFocus;
  return fallbackPrompt;
}

function extractVoicePromptFocus(prompt) {
  const value = String(prompt || "").replace(/\s+/g, " ").trim();
  if (!value) return "";
  const parts = value
    .split(/[。！？!?；;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const cue = [...parts].reverse().find((item) =>
    /只说|回答|跟着说|先说|请说|填|多少|几个|第几|几元|几角|几分|几点|哪边|哪个|哪一个|对不对|是不是|为什么|原因/.test(item),
  );
  return cue || parts.at(-1) || value;
}

function buildVoiceHotwords(lesson, plan, expectedAnswers, prompt = "") {
  const family = getPlanTeachingFamily(lesson, plan);
  const familyWords = {
    money: ["人民币", "元角换算", "元角分", "找回多少钱"],
    moneyApplication: ["人民币", "元角换算", "找回多少钱", "商品价格"],
    compare: ["大于号", "小于号", "等于号", "比较大小"],
    makeTenAdd: ["凑十法", "拆成十", "还差几个"],
    breakTenSubtract: ["破十法", "十几减几", "还剩几个"],
    composition: ["数的组成", "分与合", "总数", "一部分"],
    multiplication: ["几个几", "乘法口诀", "每组几个"],
    division: ["平均分", "每份几个", "分成几份"],
    time: ["钟面", "时针", "分针", "几时几分"],
    measure: ["厘米", "千克", "测量单位"],
  };
  const answerTerms = (expectedAnswers || []).filter((item) => {
    const value = String(item || "").trim();
    return value.length >= 2 && value.length <= 9 && !/[0-9零一二两三四五六七八九十百千万]/.test(value);
  });
  return uniqueKeywords([
    lesson?.node,
    plan?.label,
    ...buildPromptHotwords(prompt),
    ...(familyWords[family] || []),
    ...answerTerms,
    "换知识点",
    "我不懂",
    "再说一遍",
    "看提示图",
  ])
    .map((item) => String(item || "").replace(/[，。！？、；：,.!?;:\s]/g, "").trim())
    .filter((item) => item.length >= 2 && item.length <= 9)
    .slice(0, 30);
}

function buildPromptHotwords(prompt) {
  const text = normalizeText(prompt);
  const result = [];
  if (/几角|多少角/.test(text)) result.push("多少角", "元角换算");
  if (/几分|多少分/.test(text)) result.push("多少分", "角分换算");
  if (/几元|多少元/.test(text)) result.push("多少元", "人民币");
  if (/厘米/.test(text)) result.push("多少厘米", "长度单位");
  if (/千克|多少克|几克/.test(text)) result.push("质量单位", "多少千克");
  if (/几点|几时|多少分钟/.test(text)) result.push("钟面时间", "多少分钟");
  return result;
}

function processVoiceTranscript(transcript, metadata = {}) {
  state.voiceStatus = "idle";
  state.transcript = "";
  state.lastStudentText = "";
  const assessment = assessVoiceTranscript(transcript, metadata, createVoiceRecognitionContext());
  state.lastVoiceDiagnostic = {
    status: assessment.status,
    reason: assessment.reason || "",
    confidence: Number.isFinite(Number(metadata.confidence)) ? Number(metadata.confidence) : null,
    durationMs: Number(metadata.durationMs) || 0,
  };

  if (assessment.status === "retry") {
    state.voiceConfirmation = null;
    render();
    toastMessage(assessment.message || "这句没有听清楚，请靠近一点再说一次。");
    return;
  }

  if (assessment.status === "confirm") {
    state.voiceConfirmation = {
      heardText: assessment.heardText,
      submitText: assessment.submitText,
      reason: assessment.reason,
    };
    render();
    return;
  }

  state.voiceConfirmation = null;
  render();
  handleChildInput(assessment.submitText, "voice");
}

function assessVoiceTranscript(transcript, metadata = {}, context = createVoiceRecognitionContext()) {
  const heardText = String(transcript || "").replace(/^[，。！？、；：,.!?;:\s]+|[，。！？、；：,.!?;:\s]+$/g, "").trim();
  if (!heardText || isOnlyVoiceFiller(heardText)) {
    return { status: "retry", heardText: "", submitText: "", reason: "empty", message: "这次没有听到完整回答，请再说一次。" };
  }

  const quality = normalizeVoiceMetadata(metadata);
  const severeQualityProblem =
    (quality.durationMs > 0 && quality.durationMs < 220) ||
    (quality.rms > 0 && quality.rms < VOICE_MIN_RMS * 0.5) ||
    (quality.totalFrames > 0 && quality.voicedRatio < VOICE_MIN_VOICED_RATIO * 0.35);
  if (severeQualityProblem) {
    return {
      status: "retry",
      heardText,
      submitText: "",
      reason: "audio-too-weak",
      message: "声音有点短或太轻了。靠近一点，完整说一遍答案。",
    };
  }

  const correction = findContextualVoiceCorrection(heardText, context);
  if (correction?.needsConfirmation) {
    return {
      status: "confirm",
      heardText,
      submitText: correction.text,
      reason: correction.reason || "contextual-homophone",
    };
  }

  const submitText = correction?.text || normalizeSafeVoiceUnits(heardText, context);
  const plausible = isPlausibleVoiceAnswer(submitText, context);
  const shortAnswer = normalizeText(submitText).length <= 3;
  const matchesExpected = matchesExpectedVoiceAnswer(submitText, context);
  const childIntent = isVoiceControlPhrase(submitText) || /不知道|不会|不懂|没听懂|再讲/.test(normalizeText(submitText));
  const lowConfidence = quality.confidence !== null && quality.confidence < VOICE_LOW_CONFIDENCE;
  const marginalAudio =
    (quality.durationMs > 0 && quality.durationMs < VOICE_MIN_DURATION_MS) ||
    (quality.rms > 0 && quality.rms < VOICE_MIN_RMS) ||
    (quality.totalFrames > 0 && quality.voicedRatio < VOICE_MIN_VOICED_RATIO);

  if (childIntent) {
    return { status: "accept", heardText, submitText, reason: "child-intent" };
  }

  const numericUnitAmbiguity = findNumericUnitVoiceAmbiguity(heardText, submitText, context, matchesExpected);
  if (numericUnitAmbiguity) {
    return { status: "confirm", heardText, submitText, reason: numericUnitAmbiguity };
  }

  if (!plausible && shortAnswer) {
    return {
      status: "retry",
      heardText,
      submitText: "",
      reason: "not-an-answer",
      message: `这句不像是在回答“${shortVoicePrompt(context.prompt)}”。请只说答案，再试一次。`,
    };
  }

  if (
    plausible &&
    !matchesExpected &&
    ["number", "comparison", "yes-no", "choice"].includes(context.expectedType)
  ) {
    return { status: "confirm", heardText, submitText, reason: "short-answer-mismatch" };
  }

  if (lowConfidence || (shortAnswer && marginalAudio)) {
    return { status: "confirm", heardText, submitText, reason: lowConfidence ? "low-confidence" : "short-audio" };
  }

  return { status: "accept", heardText, submitText, reason: plausible ? "plausible" : "clear-off-topic" };
}

function normalizeVoiceMetadata(metadata) {
  let confidence = Number(metadata?.confidence);
  if (!Number.isFinite(confidence) || confidence <= 0) confidence = null;
  else if (confidence > 1) confidence /= 100;
  return {
    confidence,
    durationMs: Math.max(0, Number(metadata?.durationMs) || 0),
    rms: Math.max(0, Number(metadata?.rms) || 0),
    voicedRatio: Math.max(0, Math.min(1, Number(metadata?.voicedRatio) || 0)),
    totalFrames: Math.max(0, Number(metadata?.totalFrames) || 0),
  };
}

function isOnlyVoiceFiller(text) {
  return /^(嗯+|啊+|呃+|额+|哦+|唔+|喂+|这个|那个|嗯嗯)$/i.test(normalizeText(text));
}

function isPlausibleVoiceAnswer(text, context) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  if (isVoiceControlPhrase(normalized) || /不知道|不会|不懂|没听懂|再讲/.test(normalized)) return true;
  if (context.expectedType === "number") return hasSpokenNumber(normalized) || /大于|小于|等于|一样/.test(normalized);
  if (context.expectedType === "comparison") return /大于|小于|等于|一样|[<>=＝]/.test(normalized);
  if (context.expectedType === "yes-no") return /对|不对|是|不是|能|不能|可以|不可以/.test(normalized);
  if (context.expectedType === "explanation") return normalized.length >= 3;
  if (matchesGuidedKeywords(normalized, context.expectedAnswers || [])) return true;
  if (context.expectedType === "choice") return normalized.length >= 1 && normalized.length <= 14;
  return normalized.length >= 2;
}

function matchesExpectedVoiceAnswer(text, context) {
  const expected = context?.expectedAnswers || [];
  if (!expected.length) return false;
  const normalized = normalizeText(text);
  if (!normalized) return false;
  if (context?.expectedType === "number") {
    const heardNumbers = extractVoiceNumberValues(normalized);
    const expectedNumbers = expected.flatMap((item) => extractVoiceNumberValues(item));
    if (heardNumbers.length && expectedNumbers.length) {
      return heardNumbers.some((value) => expectedNumbers.includes(value));
    }
  }
  return expected.some((item) => {
    const answer = normalizeText(item);
    if (!answer) return false;
    if (hasSpokenNumber(normalized) || hasSpokenNumber(answer)) return normalized === answer;
    return normalized === answer || (answer.length >= 2 && (normalized.includes(answer) || answer.includes(normalized)));
  });
}

function extractVoiceNumberValues(value) {
  const tokens = String(value || "").match(/\d+|[零一二两三四五六七八九十百千万]+/g) || [];
  return tokens.map(parseVoiceNumberToken).filter(Number.isFinite);
}

function parseVoiceNumberToken(token) {
  const value = String(token || "");
  if (/^\d+$/.test(value)) return Number(value);
  const digits = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const units = { 十: 10, 百: 100, 千: 1000, 万: 10000 };
  if (!/[十百千万]/.test(value)) {
    const joined = [...value].map((char) => digits[char]).join("");
    return joined && /^\d+$/.test(joined) ? Number(joined) : Number.NaN;
  }
  let total = 0;
  let current = 0;
  for (const char of value) {
    if (Object.hasOwn(digits, char)) {
      current = digits[char];
      continue;
    }
    const unit = units[char];
    if (!unit) return Number.NaN;
    if (unit === 10000) {
      total = (total + current) * unit;
    } else {
      total += (current || 1) * unit;
    }
    current = 0;
  }
  return total + current;
}

function isVoiceControlPhrase(text) {
  return /换知识点|下一题|换一题|看图|提示|再说一遍|重新讲|我来讲/.test(normalizeText(text));
}

function hasSpokenNumber(text) {
  return /\d|[零一二两三四五六七八九十百千万]/.test(String(text || ""));
}

function normalizeSafeVoiceUnits(text, context) {
  let value = String(text || "").trim();
  const lessonText = normalizeText(`${context.lessonName || ""}${context.stepLabel || ""}${context.prompt || ""}`);
  if (/人民币|元|角|分|找回|换算/.test(lessonText)) {
    value = value.replace(/圆/g, "元").replace(/脚/g, "角");
  }
  return value;
}

function findNumericUnitVoiceAmbiguity(heardText, submitText, context, matchesExpected) {
  if (context?.expectedType !== "number" || matchesExpected) return "";
  const focus = normalizeText(extractVoicePromptFocus(context.prompt));
  const requiredUnit = ["千克", "厘米", "分钟", "角", "元", "分", "米", "克", "时", "个"].find((unit) => focus.includes(unit));
  if (!requiredUnit) return "";
  const heard = normalizeComparableVoicePhrase(heardText);
  const submitted = normalizeComparableVoicePhrase(submitText);
  if (heard.includes(requiredUnit) || submitted.includes(requiredUnit)) return "";

  const expectedWithUnit = (context.expectedAnswers || [])
    .map((item) => normalizeComparableVoicePhrase(item))
    .filter((item) => item && (item.includes(requiredUnit) || hasSpokenNumber(item)))
    .map((item) => (item.includes(requiredUnit) ? item : `${item}${requiredUnit}`));

  if (
    requiredUnit === "角" &&
    heard.endsWith("九") &&
    expectedWithUnit.some((item) => item.endsWith("角") && item.slice(0, -1) === heard.slice(0, -1))
  ) {
    return "number-unit-joined";
  }
  return "structured-answer-mismatch";
}

function normalizeComparableVoicePhrase(value) {
  return normalizeText(value).replace(/\d+/g, (digits) => chineseNumber(Number(digits)));
}

function findContextualVoiceCorrection(heardText, context) {
  const expected = (context.expectedAnswers || []).map((item) => String(item || "").trim()).filter(Boolean);
  const normalizedExpected = expected.map((item) => normalizeText(item));
  const unitCorrected = normalizeSafeVoiceUnits(heardText, context);
  if (unitCorrected !== heardText) {
    return { text: unitCorrected, needsConfirmation: true, reason: "unit-homophone" };
  }

  const heard = normalizeText(heardText);
  const compareCorrections = {
    大鱼: "大于",
    大鱼号: "大于号",
    小鱼: "小于",
    小鱼号: "小于号",
    等一号: "等于号",
  };
  if (compareCorrections[heard]) {
    const suggestion = compareCorrections[heard];
    if (normalizedExpected.some((item) => item.includes(suggestion) || suggestion.includes(item))) {
      return { text: suggestion, needsConfirmation: true, reason: "comparison-homophone" };
    }
  }

  const numberHomophones = {
    是: ["十", "四"],
    时: ["十"],
    实: ["十"],
    石: ["十"],
    寺: ["四"],
    吧: ["八"],
    久: ["九"],
  };
  const targets = numberHomophones[heard] || [];
  const matchingTargets = targets.filter((target) => normalizedExpected.some((item) => item === target || item.startsWith(target)));
  if (matchingTargets.length === 1) {
    return { text: matchingTargets[0], needsConfirmation: true, reason: "number-homophone" };
  }
  return { text: unitCorrected, needsConfirmation: false };
}

function shortVoicePrompt(prompt) {
  const value = String(prompt || "这道题").replace(/[。！？!?]+/g, "").trim();
  return value.length > 18 ? `${value.slice(0, 18)}…` : value;
}

async function handleVoiceButton() {
  if (state.recording) {
    stopVoiceInput();
    return;
  }

  state.voiceConfirmation = null;

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
    startedAt: performance.now(),
    recognitionContext: createVoiceRecognitionContext(),
    audioStats: { totalFrames: 0, voicedFrames: 0, sumSquares: 0, sampleCount: 0, peak: 0 },
  };

  processor.onaudioprocess = (event) => {
    if (!realtimeVoiceSession || realtimeVoiceSession.stopped) return;
    const samples = event.inputBuffer.getChannelData(0);
    updateRealtimeAudioStats(realtimeVoiceSession, samples);
    const pcm = downsampleFloatToPcm16(samples, audioContext.sampleRate, 16000);
    if (pcm.byteLength) queueRealtimePcm(pcm);
  };

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "start", context: realtimeVoiceSession?.recognitionContext || {} }));
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

function updateRealtimeAudioStats(session, samples) {
  if (!session?.audioStats || !samples?.length) return;
  let sumSquares = 0;
  let peak = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Number(samples[index]) || 0;
    sumSquares += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }
  const rms = Math.sqrt(sumSquares / samples.length);
  session.audioStats.totalFrames += 1;
  session.audioStats.voicedFrames += rms >= 0.012 ? 1 : 0;
  session.audioStats.sumSquares += sumSquares;
  session.audioStats.sampleCount += samples.length;
  session.audioStats.peak = Math.max(session.audioStats.peak, peak);
}

function getRealtimeAudioQuality(session) {
  const stats = session?.audioStats || {};
  const totalFrames = Number(stats.totalFrames) || 0;
  const sampleCount = Number(stats.sampleCount) || 0;
  return {
    durationMs: Math.max(0, Math.round((session?.stoppedAt || performance.now()) - (session?.startedAt || performance.now()))),
    rms: sampleCount ? Math.sqrt((Number(stats.sumSquares) || 0) / sampleCount) : 0,
    peak: Number(stats.peak) || 0,
    voicedRatio: totalFrames ? (Number(stats.voicedFrames) || 0) / totalFrames : 0,
    totalFrames,
  };
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
  session.stoppedAt = performance.now();
  session.audioQuality = getRealtimeAudioQuality(session);
  state.recording = false;
  state.voiceStatus = "processing";
  render();

  const finalChunk = session.pendingBytes.byteLength ? session.pendingBytes : new Uint8Array(0);
  if (finalChunk.byteLength) session.sentBytes.push(finalChunk);
  if (session.socket.readyState === WebSocket.OPEN) {
    session.socket.send(JSON.stringify({ type: "stop", audioBase64: bytesToBase64(finalChunk), quality: session.audioQuality }));
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
    const metadata = {
      ...(session.audioQuality || getRealtimeAudioQuality(session)),
      confidence: payload.confidence,
      utteranceCount: payload.utteranceCount,
    };
    session.finished = true;
    cleanupRealtimeAudio(true);
    state.voiceStatus = "idle";
    state.transcript = "";
    if (!transcript) state.lastStudentText = "";
    render();
    processVoiceTranscript(transcript, metadata);
    return;
  }
  if (payload.type === "error") {
    fallbackRealtimeVoiceToBatch(payload.message || "实时语音识别不可用。");
  }
}

async function fallbackRealtimeVoiceToBatch(message) {
  const session = realtimeVoiceSession;
  if (!session) return;
  const audioQuality = session.audioQuality || getRealtimeAudioQuality(session);
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
  await transcribeRecording(wavBlob, "", audioQuality);
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
  let bestConfidence = null;
  recognition.lang = "zh-CN";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;
  recognitionSession = recognition;
  state.recording = true;
  state.voiceStatus = "recording";
  render();

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const text = event.results[i][0]?.transcript || "";
      const confidence = Number(event.results[i][0]?.confidence);
      if (Number.isFinite(confidence) && confidence > 0) bestConfidence = Math.max(bestConfidence || 0, confidence);
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
    processVoiceTranscript(text, { confidence: bestConfidence });
  };

  recognition.start();
}

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    },
  });
  const chunks = [];
  const options = getMediaRecorderOptions();
  const recorder = new MediaRecorder(stream, options);
  const fallbackRecognition = null;
  const timeoutId = window.setTimeout(() => {
    if (recordingSession) stopRecording();
  }, MAX_RECORDING_MS);
  recordingSession = { recorder, stream, chunks, timeoutId, fallbackRecognition, fallbackTranscript: "", startedAt: performance.now() };
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
    const durationMs = Math.max(0, Math.round(performance.now() - (recordingSession?.startedAt || performance.now())));
    stopPassiveBrowserRecognition(recordingSession?.fallbackRecognition);
    recordingSession = null;
    await transcribeRecording(blob, fallbackTranscript, { durationMs });
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

async function transcribeRecording(blob, fallbackTranscript = "", audioQuality = {}) {
  try {
    const { audioData, mimeType } = await buildSpeechPayload(blob);
    const response = await fetch("/api/speech/transcriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioData,
        mimeType,
        context: createVoiceRecognitionContext(),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.mode === "mock" || !payload.transcript) {
      throw new Error(payload.detail || payload.message || "语音识别暂不可用");
    }
    state.voiceStatus = "idle";
    processVoiceTranscript(payload.transcript, {
      ...audioQuality,
      confidence: payload.confidence,
      durationMs: Number(audioQuality.durationMs) || Number(payload.duration) || 0,
      utteranceCount: payload.utteranceCount,
    });
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
  if (state.isProcessing || state.voiceStatus === "processing" || state.recording) {
    toastMessage("老师正在回复，等这句说完再继续。");
    return;
  }

  if (!text) {
    toastMessage("先说一句或打几个字，我再继续。");
    return;
  }

  state.voiceConfirmation = null;
  state.transcript = "";

  if (state.phase === "summary" && isNextLessonRequest(text)) {
    changeLesson("孩子选择继续下一个知识点。", getNextLessonIndex());
    return;
  }

  if (state.phase === "summary" && isChooseLessonRequest(text)) {
    state.showLessonPicker = true;
    render();
    return;
  }

  const requestedLessonIndex = findRequestedLessonIndex(text);
  if (requestedLessonIndex >= 0) {
    changeLesson("孩子主动说想换知识点。", requestedLessonIndex);
    return;
  }

  state.lastStudentText = text;
  state.isProcessing = true;
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
    state.isProcessing = false;
    render();
    return;
  }

  if (window.location.protocol === "file:") {
    evaluateLocally(text, inputType);
    state.voiceStatus = "idle";
    state.isProcessing = false;
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
  state.isProcessing = false;
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
    payload.aiMessage = `老师没听清答案。回到这题：${lesson.activeQuestion?.prompt || lesson.problem}`;
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
    state.currentAtomName = "";
    state.teachingState = "MASTERED";
    state.canExplainWhy = true;
    state.canUseOwnWords = true;
    state.aiMessage = createCompletionMessage(lesson, payload.aiMessage || lesson.doneMessage);
  }

  syncLadderProgress(payload);
  resetGeneratedVisualForTurn();
  addEvidence(
    payload.evidenceSignal || "AI 评估",
    payload.evidenceText || "真实模型已根据孩子回答更新学习状态。",
    inputType === "voice" ? "语音回答" : "键盘回答",
  );
  state.voiceStatus = "idle";
  state.isProcessing = false;
  speakCurrentMessage();
}

function evaluateLocally(text, inputType) {
  const lesson = currentLesson();
  if (lesson.useQuestionBankTutor && state.phase !== "teachback") {
    evaluateQuestionBankAttempt(text, inputType);
    return;
  }

  if (state.phase === "teachback" || state.phase === "repair") {
    evaluateTeachback(text, inputType);
  } else {
    evaluateAttempt(text, inputType);
  }
}

function evaluateAttempt(text, inputType) {
  const lesson = currentLesson();
  if (lesson.useQuestionBankTutor) {
    evaluateQuestionBankAttempt(text, inputType);
    return;
  }

  const normalized = normalizeText(text);
  const activeQuestion = lesson.activeQuestion || null;
  const knowsProcess = includesAny(normalized, lesson.answer.attemptKeywords);
  const picksAnswer = includesAny(normalized, lesson.answer.answerKeywords);
  const cannotAnswer = isCannotAnswerText(normalized);
  const unclear = isUnclearChildText(normalized);

  if (cannotAnswer) {
    const plan = createGuidedStepPlan(lesson, state.completedSteps || 0);
    keepOnCurrentGuidedStep(lesson, plan, "没关系，老师先讲这一小步。", inputType, "孩子请求讲解");
    return;
  }

  if (unclear) {
    state.phase = "guiding";
    state.mastery = Math.max(48, state.mastery - 1);
    state.currentStep = `小台阶 1：${getLessonLadderSteps(lesson)[0] || lesson.microSteps[0] || "先读题"}`;
    state.aiContext = "孩子输入不完整，先拉回当前题。";
    state.aiMessage = `老师没听清答案。回到这题：${activeQuestion?.prompt || lesson.problem}`;
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
    state.aiMessage = `想法碰到一点了。我们先把答案说清：${activeQuestion?.prompt || lesson.problem}`;
    state.showVisual = true;
    resetGeneratedVisualForTurn();
    addEvidence("方法部分正确", "孩子说到过程词，但还没有答出当前题答案。", inputType === "voice" ? "语音回答" : "键盘回答");
    speakCurrentMessage();
    return;
  }

  state.phase = "repair";
  state.mastery = Math.max(52, state.mastery - 2);
  state.aiContext = "孩子回答和当前题不匹配，先给一个更小提示。";
  state.aiMessage = `先停一下。回到「${lesson.node || lesson.title}」这道题：${activeQuestion?.prompt || lesson.problem}。请只回答这个小问题：${getLessonLadderSteps(lesson)[0] || lesson.microSteps[0]}。`;
  state.currentStep = "小台阶 1：先找题目条件";
  state.showVisual = true;
  state.strategyIndex = 1;
  state.bestStrategy = lesson.strategies[1]?.label || "画图";
  resetGeneratedVisualForTurn();
  addEvidence("答非所问或答案不稳", "孩子回答没有匹配当前题答案，AI 拉回当前题并给更小提示。", "小提示");
  speakCurrentMessage();
}

function evaluateQuestionBankAttempt(text, inputType) {
  const lesson = currentLesson();
  const normalized = normalizeText(text);
  const activeQuestion = lesson.activeQuestion || null;
  const plan = createGuidedStepPlan(lesson, state.completedSteps);
  const fullAnswerKeywords = uniqueKeywords([
    ...(activeQuestion?.answerKeywords || []),
    ...(lesson.answer?.answerKeywords || []),
    ...expandedQuestionAnswerKeywords(activeQuestion, lesson),
    activeQuestion?.answer || "",
  ]);
  const fullAnswerMatched = matchesGuidedKeywords(normalized, fullAnswerKeywords);
  const stepMatched = matchesGuidedKeywords(normalized, plan.answerKeywords);
  const cannotAnswer = isCannotAnswerText(normalized);
  const unclear = isUnclearChildText(normalized);

  if (cannotAnswer) {
    keepOnCurrentGuidedStep(lesson, plan, "没关系，老师先讲这一小步。", inputType, "孩子请求讲解");
    return;
  }

  if (unclear) {
    keepOnCurrentGuidedStep(lesson, plan, "我没听清。", inputType, "输入不完整");
    return;
  }

  if (isLikelyOffTopicAnswer(normalized, lesson, plan)) {
    keepOnCurrentGuidedStep(lesson, plan, "这个和当前小问题还没连上。", inputType, "答非所问");
    return;
  }

  if (stepMatched || (plan.isReason && looksLikeReason(normalized))) {
    if (plan.isReason) recordMasteryEvidence("reasoning");
    advanceGuidedStepOrComplete(lesson, plan, inputType);
    return;
  }

  if (fullAnswerMatched) {
    if (!plan.isFinal && !hasProcessSignalForFullAnswer(normalized)) {
      keepOnCurrentGuidedStep(lesson, plan, "答案可能对，但老师要确认你会想，我们先补这一小步。", inputType, "提前说出答案，补过程");
      return;
    }
    if (plan.isFinal || plan.index >= plan.totalSteps - 1) {
      if (hasProcessSignalForFullAnswer(normalized)) recordMasteryEvidence("reasoning");
      completeQuestionBankRound(lesson, inputType);
    } else {
      askReasonAfterFullAnswer(lesson, inputType);
    }
    return;
  }

  if (looksLikeShortAnswer(normalized)) {
    keepOnCurrentGuidedStep(lesson, plan, "这个答案还不对。", inputType, "答案错误");
    return;
  }

  keepOnCurrentGuidedStep(lesson, plan, "这次还没对上。", inputType, "小台阶未稳");
}

function advanceGuidedStepOrComplete(lesson, plan, inputType) {
  if (plan.isFinal || plan.index >= plan.totalSteps - 1) {
    completeQuestionBankRound(lesson, inputType);
    return;
  }

  const nextPlan = createGuidedStepPlan(lesson, plan.index + 1);
  state.phase = "guiding";
  state.completedSteps = nextPlan.index;
  clearGuidedRepairAttempts();
  state.mastery = Math.max(state.mastery, 58 + nextPlan.index * 5);
  state.teachingState = "GUIDED_STEP";
  state.currentAtomName = nextPlan.label;
  state.currentStep = `小台阶 ${nextPlan.index + 1}：${nextPlan.label}`;
  state.aiContext = "孩子通过了当前小台阶，进入下一步。";
  state.aiMessage = teacherAdvanceMessage(nextPlan, plan);
  state.showVisual = true;
  resetGeneratedVisualForTurn();
  addEvidence("小台阶通过", `已通过：${plan.label}，继续：${nextPlan.label}`, inputType === "voice" ? "语音回答" : "键盘回答");
  speakCurrentMessage();
}

function askReasonAfterFullAnswer(lesson, inputType) {
  const steps = createGuidedStepPlan(lesson, 0).steps;
  const reasonIndex = Math.max(0, steps.findIndex((step) => step.isReason));
  const reasonPlan = createGuidedStepPlan(lesson, reasonIndex >= 0 ? reasonIndex : steps.length - 1);
  state.phase = "guiding";
  state.completedSteps = reasonPlan.index;
  clearGuidedRepairAttempts();
  state.mastery = Math.max(state.mastery, 70);
  state.teachingState = "GUIDED_STEP";
  state.currentAtomName = reasonPlan.label;
  state.currentStep = `小台阶 ${reasonPlan.index + 1}：${reasonPlan.label}`;
  state.aiContext = "孩子答出了结果，继续检查是否能说原因。";
  state.aiMessage = teacherReasonMessage(reasonPlan);
  state.feynmanStatus = "会做，等待说理";
  state.showVisual = true;
  resetGeneratedVisualForTurn();
  addEvidence("答案正确，追问原因", `孩子答出了「${formatExpectedAnswer(lesson.activeQuestion, lesson)}」，继续检查说理。`, inputType === "voice" ? "语音回答" : "键盘回答");
  speakCurrentMessage();
}

function completeQuestionBankRound(lesson, inputType) {
  recordQuestionPass(lesson);
  const targetPassCount = getTargetQuestionPassCount(lesson);
  const passedCount = (state.passedQuestionIds || []).length;

  if (passedCount < targetPassCount && getLessonQuestionBank(lesson).length > 1) {
    advanceLessonQuestion(`孩子通过了第 ${passedCount} 道，换个问法再确认。`);
    return;
  }

  if (!state.masteryEvidence?.teachback) {
    startKnowledgeTeachbackCheck(lesson, inputType);
    return;
  }

  state.phase = "summary";
  state.mastery = Math.max(state.mastery, 86);
  state.completedSteps = getLessonLadderSteps(lesson).length;
  state.currentStep = "完成：会做，也能说原因";
  state.currentAtomName = "";
  state.teachingState = "MASTERED";
  state.aiContext = "孩子已经通过少量变式确认，不继续刷题。";
  state.aiMessage = createCompletionMessage(lesson);
  state.feynmanStatus = "能讲清楚";
  state.canExplainWhy = true;
  state.canUseOwnWords = true;
  state.showVisual = true;
  resetGeneratedVisualForTurn();
  addEvidence("知识点过关", `已用 ${passedCount} 道小题确认掌握，没有继续机械刷题。`, inputType === "voice" ? "语音回答" : "键盘回答");
  speakCurrentMessage();
}

function startKnowledgeTeachbackCheck(lesson, inputType) {
  const family = getLessonTeachingFamily(lesson);
  const key = `${lesson?.id || ""}|${lesson?.activeQuestion?.id || lesson?.problem || ""}|teachback|${state.passedQuestionIds?.length || 0}`;
  const move = createStrategyDialogueMove(family, "teachback", key);
  state.phase = "teachback";
  state.mastery = Math.max(state.mastery, 82);
  state.completedSteps = getLessonLadderSteps(lesson).length;
  state.currentStep = "最后一步：讲给老师听";
  state.currentAtomName = "讲清方法";
  state.teachingState = "FEYNMAN_CHECK";
  state.aiContext = "孩子已通过直接题和变式题，进入讲给老师听。";
  state.aiMessage = `${move || "现在换你当小老师。"}${createTeachbackCheckPrompt(lesson)}`;
  state.feynmanStatus = "等待孩子讲";
  state.showVisual = true;
  resetGeneratedVisualForTurn();
  addEvidence("进入费曼复述", "孩子做题和变式已通过，开始检查是否能用自己的话讲清。", inputType === "voice" ? "语音回答" : "键盘回答");
  speakCurrentMessage();
}

function createTeachbackCheckPrompt(lesson) {
  const family = getPlanTeachingFamily(lesson, lesson?.currentPlan || lesson?.guidedPlan?.[state.guidedStepIndex] || null);
  const topic = lesson?.node || lesson?.lesson || "这类题";
  const starter = createTeachbackStarterSentence(family);
  const prompts = {
    money: `说一句就行：为什么要先换单位？`,
    moneyApplication: `说一句就行：购物找零题先看什么？`,
    makeTenAdd: `说一句就行：为什么先凑成10？`,
    breakTenSubtract: `说一句就行：个位不够减怎么办？`,
    concreteAddition: `说一句就行：为什么把两部分合起来？`,
    concreteSubtraction: `说一句就行：为什么从原来里面拿走？`,
    composition: `说一句就行：分与合先看什么，再看什么？`,
    multiplication: `说一句就行：怎么知道是几个几？`,
    division: `说一句就行：为什么叫平均分？`,
    compare: `说一句就行：先看什么，再填什么？`,
    calculation: `说一句就行：先看符号，还是先猜答案？`,
    application: `说一句就行：先看题目问什么，还是先算数字？`,
    placeValue: `说一句就行：十位和个位有什么不同？`,
    time: `说一句就行：读钟面先看哪根针？`,
    measure: `说一句就行：选单位时先看什么？`,
    shape: `说一句就行：判断图形要看什么？`,
    data: `说一句就行：读表时先找什么？`,
    logic: `说一句就行：推理题为什么不能靠猜？`,
  };
  return `${prompts[family] || `说一句就行：${topic}先看什么？`} 你可以自己讲；卡住就照着这句说一遍：“${starter}。”`;
}

function createTeachbackStarterSentence(family) {
  const starters = {
    money: "我先把元和角换成同一种单位",
    moneyApplication: "我先看付了多少钱，再看东西多少钱",
    makeTenAdd: "我先把一个数补成10",
    breakTenSubtract: "我先看个位够不够减",
    concreteAddition: "我先找两部分，再合起来",
    concreteSubtraction: "我先看原来有多少，再看拿走多少",
    composition: "我先看总数，再看已经知道的一部分，最后想还差几",
    multiplication: "我先看每组几个，再看有几组",
    division: "我先看是不是每份一样多",
    compare: "我先看左边，再看右边",
    calculation: "我先看符号，再一步一步算",
    application: "我先看题目问什么",
    placeValue: "我先看数字站在哪一位",
    time: "我先看短针，再看长针",
    measure: "我先看要量什么，再选单位",
    shape: "我先看边、角这些特征",
    data: "我先找到表里的数量",
    logic: "我先用一个条件排除不可能的",
  };
  return starters[family] || "我先看题目问什么";
}

function createCompletionMessage(lesson = currentLesson(), prefix = "这个知识点先过关。你不是只背答案，也能说出怎么想。") {
  const nextLesson = lessons[getNextLessonIndex()];
  const nextText = nextLesson ? `接下来可以继续学「${nextLesson.node}」，` : "";
  return `${prefix}${nextText}也可以点上面的“当前知识点”自己选。你可以说“继续下一个”，或者说“我想自己选”。`;
}

function keepOnCurrentGuidedStep(lesson, plan, prefix, inputType, signal) {
  state.phase = "repair";
  recordGuidedRepairAttempt(lesson, plan);
  state.mastery = Math.max(50, state.mastery - 1);
  state.teachingState = "GUIDED_STEP";
  state.currentAtomName = plan.label;
  state.currentStep = `小台阶 ${plan.index + 1}：${plan.label}`;
  state.aiContext = "孩子还没答到当前小问题，继续停在这一小步。";
  state.aiMessage = teacherRepairMessage(prefix, plan);
  state.showVisual = true;
  state.strategyIndex = Math.max(state.strategyIndex, 1);
  state.bestStrategy = lesson.strategies[1]?.label || "画图";
  resetGeneratedVisualForTurn();
  addEvidence(signal, `停在当前小台阶：${plan.label}，不默认判对。`, inputType === "voice" ? "语音回答" : "键盘回答");
  speakCurrentMessage();
}

function isLikelyOffTopicAnswer(normalizedText, lesson, plan) {
  if (!normalizedText) return true;
  if (isCannotAnswerText(normalizedText)) return false;
  if (matchesGuidedKeywords(normalizedText, plan.answerKeywords)) return false;
  if (plan.isReason && looksLikeReason(normalizedText)) return false;
  if (/冰淇淋|吃|玩|游戏|动画片|睡觉|不想学|不要学|累了|无聊/.test(normalizedText)) return true;
  const question = lesson.activeQuestion || null;
  const text = normalizeText(`${question?.prompt || ""} ${lesson.node || ""} ${lesson.lesson || ""} ${plan.label || ""} ${plan.prompt || ""}`);
  const hasMoneyContext = hasMoneyTerm(text);
  if (hasMoneyContext) {
    const hasMoneyAnswer = /元|角|分|钱|人民币|\d|一|二|三|四|五|六|七|八|九|十|百/.test(normalizedText);
    return !hasMoneyAnswer;
  }
  const hasMathSignal = /\d|一|二|三|四|五|六|七|八|九|十|百|大|小|多|少|等|加|减|乘|除|平均|一共|还剩|因为|所以/.test(normalizedText);
  return normalizedText.length > 8 && !hasMathSignal;
}

function looksLikeShortAnswer(normalizedText) {
  if (!normalizedText) return false;
  if (normalizedText.length <= 8 && /[\d一二三四五六七八九十百千万元角分个只本支块张条朵面位人米厘米克千克<>＝=大小多少]/.test(normalizedText)) {
    return true;
  }
  return false;
}

function hasProcessSignalForFullAnswer(normalizedText) {
  if (!normalizedText) return false;
  if (looksLikeReason(normalizedText)) return true;
  if (looksLikeShortAnswer(normalizedText)) return false;
  return /先|再|因为|所以|平均|每份|分成|凑十|破十|换成|单位|付的钱|价钱|找回|合起来|拿走|剩下|加|减|乘|除|同样多|十位|个位/.test(normalizedText);
}

function getTargetQuestionPassCount(lesson) {
  const bankLength = getLessonQuestionBank(lesson).length;
  if (bankLength <= 1) return 1;
  const configured = Number(lesson?.targetPassCount || lesson?.teachingProfile?.targetPassCount || 4);
  return Math.min(bankLength, Math.max(3, Math.min(4, configured || 4)));
}

function expandedQuestionAnswerKeywords(question, lesson) {
  if (!question) return [];
  const keywords = normalizeTextList(question.answerKeywords, [question.answer]);
  const looseKeywords = expandLooseAnswerKeywords(question);
  if (lesson?.visualType !== "money" && lesson?.id !== "renminbi-conversion") return uniqueKeywords(keywords.concat(looseKeywords));
  const unit = inferMoneyTargetUnit(question.prompt || "", question);
  const answerNumber = Number(String(question.answer || "").match(/\d+/)?.[0] || NaN);
  if (!Number.isFinite(answerNumber)) return uniqueKeywords(keywords.concat(looseKeywords));
  return uniqueKeywords(keywords.concat(looseKeywords, answerKeywordsForNumber(answerNumber, unit || "")));
}

function expandLooseAnswerKeywords(question) {
  const source = normalizeTextList([question?.answer, ...(question?.answerKeywords || [])], []);
  const suffixPattern = /(个|只|本|支|块|张|条|朵|面|位|人|元|角|分|厘米|米|克|千克|旗|笔|书|苹果|小朋友|小动物|小鸟|饼干|球)$/;
  const result = [];
  source.forEach((item) => {
    const text = String(item || "").trim();
    if (!text) return;
    result.push(text);
    text.split(/[，,、/]/).forEach((part) => {
      if (part && part !== text) result.push(part);
    });
    const number = text.match(/\d+/)?.[0];
    if (number) result.push(number, chineseNumber(Number(number)));
    const stripped = text.replace(suffixPattern, "");
    if (stripped && stripped !== text && stripped.length >= 1) result.push(stripped);
  });
  return uniqueKeywords(result);
}

function looksLikeReason(normalizedText) {
  if (!normalizedText || normalizedText.length < 2) return false;
  const hasReasonMarker = includesAny(normalizedText, [
    "因为",
    "所以",
    "因此",
    "这样",
    "先",
    "再",
    "最后",
    "剩下",
    "排除",
    "不可能",
    "不是",
    "合起来",
    "加起来",
    "去掉",
    "平均",
    "同样多",
    "比较",
    "一一对应",
    "十位",
    "个位",
    "单位",
    "换成",
    "凑十",
    "破十",
    "退位",
    "借十",
    "拆",
    "差几",
    "离10",
    "十减",
    "加回",
  ]);
  if (hasReasonMarker && normalizedText.length >= 3) return true;

  const hasUnitIdea = includesAny(normalizedText, ["单位", "元和角", "角和分", "同一种", "一样", "不一样"]);
  const hasActionIdea = includesAny(normalizedText, ["换成", "先换", "才能", "比较", "相加", "算"]);
  return hasUnitIdea && hasActionIdea;
}

function isUnclearChildText(normalizedText) {
  if (!normalizedText || normalizedText.length < 1) return true;
  return [
    "好",
    "好的",
    "嗯",
    "啊",
    "哦",
    "可以",
    "行",
    "继续",
    "没听清",
    "随便",
  ].includes(normalizedText);
}

function isCannotAnswerText(normalizedText) {
  if (!normalizedText) return false;
  return /不知道|不会|不会答|不会说|不懂|没懂|没听懂|不明白|讲不出|讲不出来|不知道怎么说|我不会|我不知道|我讲不出来|老师讲一下|老师讲讲|教我一下/.test(normalizedText);
}

function formatExpectedAnswer(question, lesson) {
  return question?.answer || lesson.answer.answerKeywords?.[0] || "这个答案";
}

function recordQuestionPass(lesson = currentLesson()) {
  const id = lesson.activeQuestion?.id || lesson.problem;
  if (!id) return;
  const beforeCount = (state.passedQuestionIds || []).length;
  state.passedQuestionIds = uniqueKeywords([...(state.passedQuestionIds || []), id]);
  if ((state.passedQuestionIds || []).length > beforeCount) {
    recordMasteryEvidence(beforeCount === 0 ? "direct" : "variant");
  }
}

function maybeContinueWithVariantAfterTeachback(inputType) {
  const lesson = currentLesson();
  const bank = getLessonQuestionBank(lesson);
  if (!lesson.useQuestionBankTutor || bank.length <= 1) return false;
  if ((state.passedQuestionIds || []).length >= getTargetQuestionPassCount(lesson)) return false;

  const nextCursor = ((Number(lesson.questionCursor) || 0) + 1) % bank.length;
  const nextQuestion = bank[nextCursor];
  activateLessonQuestion(lesson, nextQuestion, nextCursor);
  const starter = createGuidedStepPlan(lesson, selectVariantStartStepIndex(lesson));

  state.phase = "guiding";
  state.completedSteps = starter.index;
  clearGuidedRepairAttempts();
  state.mastery = Math.max(state.mastery, 76);
  state.strategyIndex = 0;
  state.currentAtomName = starter.label;
  state.currentStep = `小台阶 ${starter.index + 1}：${starter.label}`;
  state.aiContext = "孩子讲清楚了一题，进入同知识点变式题。";
  state.aiMessage = `${createTeachbackVariantBridge(lesson, starter, nextQuestion)}${createVariantQuestionMessage(lesson, nextQuestion, starter, "讲清后变式")}`;
  state.feynmanStatus = "已讲清一题，继续变式";
  state.showVisual = true;
  state.lastStudentText = "";
  state.engineSession = null;
  resetGeneratedVisualForTurn();
  addEvidence("进入变式题", `已通过 ${state.passedQuestionIds.length} 道，继续：${nextQuestion.prompt}`, inputType === "voice" ? "语音复述" : "打字复述");
  speakCurrentMessage();
  return true;
}

function createTeachbackVariantBridge(lesson, starter, nextQuestion) {
  const family = inferActiveQuestionFamily(lesson, nextQuestion || lesson?.activeQuestion || null);
  const key = `${lesson?.id || ""}|${nextQuestion?.id || nextQuestion?.prompt || ""}|${starter?.label || ""}|${state?.passedQuestionIds?.length || 0}`;
  const familyBridges = {
    money: ["单位关系说清了。", "这题的钱数想法稳了。"],
    moneyApplication: ["找零方法说出来了。", "购物题的关系讲明白了。"],
    makeTenAdd: ["凑十的办法讲出来了。", "你不是背答案，已经会想凑十了。"],
    breakTenSubtract: ["破十的办法讲出来了。", "不够减怎么拆，你已经说到了。"],
    compare: ["比较方法说清了。", "谁多谁少讲明白了。"],
    multiplication: ["几个几讲清了。", "乘法意思说出来了。"],
    division: ["平均分的意思讲清了。", "每份一样多这点稳了。"],
    time: ["短针长针讲清了。", "读时间的方法说出来了。"],
  };
  return pickNaturalVariant(
    familyBridges[family] || ["这题方法说出来了。", "可以，老师换个小变化看看稳不稳。", "刚才那题过关了。"],
    key,
  );
}

function evaluateTeachback(text, inputType) {
  const lesson = currentLesson();
  const normalized = normalizeText(text);
  if (isCannotAnswerText(normalized) || isUnclearChildText(normalized)) {
    const family = getLessonTeachingFamily(lesson);
    const move = createStrategyDialogueMove(family, "cannotAnswer", `${lesson?.id || ""}|teachback|${normalized}`, { includeHint: true });
    state.phase = "repair";
    state.mastery = Math.max(state.mastery, 72);
    state.currentStep = "最后一步：再讲一次";
    state.aiContext = "孩子讲不出来，老师给半句示范。";
    state.aiMessage = `${move || "没关系，老师先示范一句。"}${lesson.repairPrompt || createTeachbackCheckPrompt(lesson)}`;
    state.feynmanStatus = "会做但讲不清";
    state.showVisual = true;
    state.strategyIndex = 1;
    state.bestStrategy = lesson.strategies[1]?.label || "画图";
    resetGeneratedVisualForTurn();
    addEvidence("讲不出来", "孩子还不能复述方法，AI 给半句示范，不直接判错。", "费曼补救");
    speakCurrentMessage();
    return;
  }
  const mentionsConcept = includesAny(normalized, lesson.answer.conceptKeywords);
  const explainsWhy = includesAny(normalized, lesson.answer.whyKeywords);
  const usesOwnWords = includesAny(normalized, lesson.answer.ownWordsKeywords);
  const comparesResult = includesAny(normalized, lesson.answer.resultKeywords);
  const methodLikeTeachback =
    looksLikeReason(normalized) &&
    (mentionsConcept || usesOwnWords || normalized.length >= 8);
  const enoughTeachback =
    mentionsConcept &&
    explainsWhy &&
    (comparesResult || usesOwnWords || methodLikeTeachback);

  if (enoughTeachback) {
    recordMasteryEvidence("teachback");
    recordMasteryEvidence("reasoning");
    recordQuestionPass(lesson);
    if (maybeContinueWithVariantAfterTeachback(inputType)) return;

    state.phase = "summary";
    state.mastery = 86;
    state.completedSteps = getLessonLadderSteps(lesson).length;
    state.currentStep = "完成：能讲清楚原因";
    state.currentAtomName = "";
    state.teachingState = "MASTERED";
    state.aiContext = "你讲清楚了关键原因。";
    state.aiMessage = createCompletionMessage(lesson, lesson.doneMessage);
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
  const lesson = currentLesson();
  const plan = createGuidedStepPlan(lesson, state.completedSteps);
  state.phase = "repair";
  state.strategyIndex = Math.min(lesson.strategies.length - 1, state.strategyIndex + 1);
  state.aiContext = reason;
  state.aiMessage = teacherRepairMessage("没关系。", plan);
  state.showVisual = true;
  state.bestStrategy = "画图";
  state.currentAtomName = plan.label;
  state.currentStep = `小台阶 ${plan.index + 1}：${plan.label}`;
  resetGeneratedVisualForTurn();
  addEvidence("换讲法", `AI 停在「${plan.label}」并给更小提示。`, "小提示");
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
      const audioUrl =
        payload.audioDataUrl ||
        (payload.audioBase64 ? `data:audio/${payload.format || "mp3"};base64,${payload.audioBase64}` : "");
      if (response.ok && audioUrl) {
        currentAudio = new Audio(audioUrl);
        await currentAudio.play();
        return;
      }
      notifyTtsProblem(payload);
    } catch (error) {
      notifyTtsProblem({ error: error?.message || "TTS request failed" });
    }
  }

  if (!ALLOW_BROWSER_TTS_FALLBACK) return;
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

function notifyTtsProblem(payload = {}) {
  if (ttsProblemNotified) return;
  ttsProblemNotified = true;
  const hint = payload.hint || payload.message || payload.error || "豆包语音合成暂不可用。";
  console.warn("Doubao TTS unavailable:", hint, payload.detail || payload.logId || "");
  toastMessage("老师声音暂时没出来，可以继续打字或再试一次。");
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

function isNextLessonRequest(text) {
  const normalized = normalizeText(text);
  return ["好", "好的", "可以", "行", "下一个", "继续", "继续学", "下个知识点", "下一个知识点", "下一课", "下一个内容"].some((keyword) =>
    normalized.includes(normalizeText(keyword)),
  );
}

function isChooseLessonRequest(text) {
  const normalized = normalizeText(text);
  return ["换一个", "自己选", "我来选", "选择", "选知识点", "换别的"].some((keyword) =>
    normalized.includes(normalizeText(keyword)),
  );
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

function matchesGuidedKeywords(normalizedText, keywords) {
  const text = normalizeText(normalizedText);
  if (!text) return false;
  return (keywords || []).some((keyword) => containsGuidedKeyword(text, normalizeText(keyword)));
}

function containsGuidedKeyword(text, keyword) {
  if (!keyword) return false;
  if (text === keyword) return true;
  const numericLike = /[0-9零一二两三四五六七八九十百千万]/;
  if (!numericLike.test(keyword)) return text.includes(keyword);

  let index = text.indexOf(keyword);
  while (index >= 0) {
    const before = text[index - 1] || "";
    const after = text[index + keyword.length] || "";
    const beforeIsNumberPart = /[0-9零一二两三四五六七八九十百千万]/.test(before);
    const afterIsNumberPart = /[0-9零一二两三四五六七八九十百千万]/.test(after);
    if (!beforeIsNumberPart && !afterIsNumberPart) return true;
    index = text.indexOf(keyword, index + 1);
  }
  return false;
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
