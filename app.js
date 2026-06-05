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
const MAX_RECORDING_MS = 9000;

const lessons = [
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
    initialMessage: "我们先只看 3 元。1 元是 10 角，3 元可以换成多少角？",
    initialStep: "小台阶 1：先换整元",
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

let state = {
  view: "child",
  lessonIndex: 0,
  phase: "guiding",
  recording: false,
  voiceStatus: "idle",
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
  feynmanStatus: "还没开始讲",
  canExplainWhy: false,
  canUseOwnWords: false,
  bestStrategy: lessons[0].strategies[0].label,
  imageJob: {
    status: "idle",
    url: "",
    message: "",
  },
  evidence: [
    {
      type: "attempt",
      text: "孩子正在学习“分母不同先变成能比较的样子”。",
      signal: "开始学习",
      strategy: "拆步骤",
    },
  ],
};

let recordingSession = null;
let recognitionSession = null;
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
          <strong>启步学伴</strong>
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
          ["change-lesson", "换知识点", "book"],
        ];

  return `
    <main class="child-stage">
      <section class="learning-scene" aria-label="孩子学习区">
        <div class="scene-left">
          <div class="problem-strip">
            <span>${icon("book")}当前题目</span>
            <strong>${escapeText(lesson.problem)}</strong>
          </div>

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
        </div>

        <aside class="scene-right">
          <div class="step-panel">
            <div class="panel-head">
              <span>${icon("star")}小台阶</span>
              <strong>${escapeText(lesson.unit)}</strong>
            </div>
            <h2>${escapeText(state.currentStep)}</h2>
            <p>${escapeText(renderStepHint())}</p>
            <div class="step-ladder" aria-label="学习小台阶">
              ${lesson.microSteps
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
          </div>

          ${state.showVisual ? renderLearningVisual() : ""}
          ${renderPracticePanel()}
        </aside>
      </section>
    </main>
  `;
}

function renderVoiceDock() {
  return `
    <section class="voice-dock" aria-label="语音输入区">
      ${state.showKeyboard ? renderKeyboardComposer() : ""}
      <div class="dock-actions">
        <button class="dock-mini" data-action="camera">${icon("camera")}拍照</button>
        <button class="voice-button ${state.recording ? "is-recording" : ""}" data-action="voice" aria-label="按住说话，松开结束">
          ${icon("mic")}
          <span>${renderVoiceButtonLabel()}</span>
        </button>
        <button class="dock-mini" data-action="toggle-keyboard">${icon("keyboard")}键盘输入</button>
      </div>
      <p class="dock-note">${escapeText(renderDockNote())}</p>
    </section>
  `;
}

function renderVoiceButtonLabel() {
  if (state.voiceStatus === "processing") return "正在听";
  if (state.recording) return "松开结束";
  if (state.phase === "teachback") return "讲给老师听";
  return "按住说";
}

function renderStepHint() {
  const lesson = currentLesson();
  if (state.phase === "teachback") return "你已经会做这一步了。现在试着用自己的话讲给老师听。";
  if (state.phase === "repair") return "没关系，我们换一种讲法。先看图，再慢慢说。";
  if (state.phase === "summary") return "你能说出为什么，这个知识点就更稳了。";
  return lesson.stepHint;
}

function renderDockNote() {
  if (state.voiceStatus === "processing") return "我正在把你说的话变成文字。";
  if (state.phase === "teachback") return "像小老师一样讲给老师听，说不完整也没关系。";
  if (state.phase === "repair") return "可以看着图说，不用一次讲完整。";
  if (state.phase === "summary") return "这一题已经完成，可以换知识点或去家长页看记录。";
  return "按住说话，松开后老师会接着讲。也可以直接说“换知识点”。";
}

function renderKeyboardComposer() {
  return `
    <form class="keyboard-composer" data-form="typed-answer">
      <input name="answer" value="${escapeAttr(state.transcript)}" placeholder="也可以打字，例如：我想换知识点" />
      <button class="btn btn-primary" type="submit">发送</button>
    </form>
  `;
}

function renderLearningVisual() {
  const lesson = currentLesson();
  return `
    <div class="visual-panel">
      <div class="panel-head">
        <span>${icon("image")}看图想一想</span>
        <strong>${escapeText(lesson.visualLabel)}</strong>
      </div>
      ${renderLessonSvg(lesson)}
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
  if (lesson.visualType === "money") return renderMoneySvg(lesson);
  if (lesson.visualType === "perimeter") return renderPerimeterSvg(lesson);
  if (lesson.visualType === "time") return renderTimeSvg(lesson);
  return renderFractionSvg(lesson);
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
  return `
    <svg class="lesson-svg" viewBox="0 0 520 214" role="img" aria-label="把三元五角换成三十五角">
      <text x="26" y="30" class="svg-title">${escapeText(lesson.visualTitle)}</text>
      <g transform="translate(44 58)">
        ${moneyNote(0, 0, "1 元", "#65d6ad")}
        ${moneyNote(118, 0, "1 元", "#65d6ad")}
        ${moneyNote(236, 0, "1 元", "#65d6ad")}
        <text x="22" y="94" class="svg-note">3 张 1 元 = 30 角</text>
      </g>
      <path d="M120 144h235" fill="none" stroke="#244056" stroke-width="4" stroke-linecap="round"/>
      <text x="362" y="150" class="svg-note">再加 5 角</text>
      <g transform="translate(146 128)">
        ${moneyCoin(0)}
        ${moneyCoin(34)}
        ${moneyCoin(68)}
        ${moneyCoin(102)}
        ${moneyCoin(136)}
      </g>
      <text x="118" y="202" class="svg-win">30 角 + 5 角 = 35 角</text>
    </svg>
  `;
}

function moneyNote(x, y, label, color) {
  return `
    <rect x="${x}" y="${y}" width="88" height="48" rx="10" fill="${color}" stroke="#244056" stroke-width="3"/>
    <text x="${x + 22}" y="${y + 31}" class="svg-label">${label}</text>
  `;
}

function moneyCoin(x) {
  return `
    <circle cx="${x}" cy="16" r="15" fill="#ffd36a" stroke="#244056" stroke-width="2"/>
    <text x="${x - 11}" y="22" class="svg-label">1角</text>
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
    <div class="mascot" aria-hidden="true">
      <div class="mascot-antenna"></div>
      <div class="mascot-head">
        <span class="mascot-eye"></span>
        <span class="mascot-eye"></span>
        <span class="mascot-smile"></span>
      </div>
      <div class="mascot-body">
        <span></span>
        <span></span>
      </div>
    </div>
  `;
}

function renderMascotFace() {
  return `
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <rect x="8" y="10" width="28" height="24" rx="8" fill="currentColor"/>
      <circle cx="18" cy="22" r="2.5" fill="#fff"/>
      <circle cx="26" cy="22" r="2.5" fill="#fff"/>
      <path d="M18 28c2.5 2 5.5 2 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((node) => {
    if (node.dataset.action === "voice") return;
    node.addEventListener("click", handleAction);
  });
  document.querySelectorAll("[data-action='voice']").forEach((node) => {
    node.addEventListener("pointerdown", startHoldVoice);
    node.addEventListener("pointerup", stopHoldVoice);
    node.addEventListener("pointercancel", stopHoldVoice);
    node.addEventListener("pointerleave", stopHoldVoice);
    node.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") startHoldVoice(event);
    });
    node.addEventListener("keyup", (event) => {
      if (event.key === " " || event.key === "Enter") stopHoldVoice(event);
    });
  });
  document.querySelectorAll("[data-form='typed-answer']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = new FormData(form).get("answer");
      handleChildInput(String(value || "").trim(), "typed");
    });
  });
}

async function startHoldVoice(event) {
  event.preventDefault();
  if (state.recording || state.voiceStatus === "processing") return;
  window.addEventListener("pointerup", stopHoldVoice, { once: true });
  window.addEventListener("pointercancel", stopHoldVoice, { once: true });
  await handleVoiceButton();
}

function stopHoldVoice(event) {
  event.preventDefault();
  window.removeEventListener("pointerup", stopHoldVoice);
  window.removeEventListener("pointercancel", stopHoldVoice);
  if (!state.recording) return;
  stopVoiceInput();
}

async function handleAction(event) {
  const action = event.currentTarget.dataset.action;

  if (action === "child-home") {
    state.view = "child";
    render();
    return;
  }

  if (action === "parent-view") {
    state.view = "parent";
    render();
    return;
  }

  if (action === "summary-view") {
    state.view = "summary";
    render();
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

  if (action === "change-lesson" || action === "new-example") {
    changeLesson("孩子想换一个知识点。");
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
  state.showKeyboard = false;
  state.strategyIndex = 0;
  state.mastery = 60;
  state.completedSteps = 0;
  state.transcript = "";
  state.lastStudentText = "";
  state.aiContext = reason || lesson.initialContext;
  state.aiMessage = `好，我们换一个知识点。${lesson.initialMessage}`;
  state.currentStep = lesson.initialStep;
  state.feynmanStatus = "还没开始讲";
  state.canExplainWhy = false;
  state.canUseOwnWords = false;
  state.bestStrategy = lesson.strategies[0].label;
  state.showVisual = true;
  state.imageJob = { status: "idle", url: "", message: "" };
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
  render();
  speakCurrentMessage();
}

async function generateStoryImage() {
  const lesson = currentLesson();
  state.imageJob = { status: "loading", url: "", message: "" };
  render();

  const prompt = [
    ...lesson.imagePrompt,
    `当前题目：${lesson.problem}`,
    "注意：这只是生活类比图，精确数学关系会由页面上的程序图呈现。",
  ].join("");

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
    state.imageJob = { status: "done", url, message: "" };
    state.strategyIndex = Math.max(state.strategyIndex, 2);
    state.bestStrategy = lesson.strategies[2]?.label || "生活类比";
    addEvidence("AI 生成理解图片", "AI 生成生活情景图，帮助孩子把知识点放进真实场景。", "生活类比图");
    toastMessage("AI 生活图已生成");
  } catch (error) {
    state.imageJob = {
      status: "error",
      url: "",
      message: error?.message || "图片生成失败，请检查 Ark 配置",
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
      toastMessage("没有拿到麦克风权限，先用模拟语音体验。");
    }
  }

  simulateVoiceInput();
}

function stopVoiceInput() {
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
    render();
    if (text) handleChildInput(text, "voice");
    else {
      toastMessage("没有听清楚，可以再按住说一次。");
    }
  };

  recognition.start();
}

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks = [];
  const options = getMediaRecorderOptions();
  const recorder = new MediaRecorder(stream, options);
  const fallbackRecognition = startPassiveBrowserRecognition();
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
    handleChildInput(payload.transcript, "voice");
  } catch (error) {
    console.warn("Speech recognition gateway fell back to browser transcript.", error);
    state.voiceStatus = "idle";
    if (fallbackTranscript.trim()) {
      toastMessage("已听清，老师继续。");
      handleChildInput(fallbackTranscript.trim(), "voice");
      return;
    }
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

function simulateVoiceInput() {
  state.recording = true;
  state.voiceStatus = "recording";
  render();
  window.setTimeout(() => {
    const transcript = getSimulatedTranscript();
    state.recording = false;
    state.voiceStatus = "idle";
    handleChildInput(transcript, "voice");
  }, 420);
}

function getSimulatedTranscript() {
  const lesson = currentLesson();
  if (state.phase === "teachback") return lesson.simulated.teachback;
  if (state.phase === "repair") return lesson.simulated.repair;
  return lesson.simulated.guiding;
}

function handleChildInput(text, inputType) {
  if (!text) {
    toastMessage("先说一句或打几个字，我再继续。");
    return;
  }

  state.transcript = text;
  state.lastStudentText = text;

  const requestedLessonIndex = findRequestedLessonIndex(text);
  if (requestedLessonIndex >= 0) {
    changeLesson("孩子主动说想换知识点。", requestedLessonIndex);
    return;
  }

  askGatewayTutor(text, inputType);
}

async function askGatewayTutor(text, inputType) {
  const lesson = currentLesson();
  if (window.location.protocol === "file:") {
    evaluateLocally(text, inputType);
    render();
    return;
  }

  try {
    const response = await fetch("/api/learning/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        phase: state.phase,
        context: state.aiContext,
        step: state.currentStep,
        lesson: {
          problem: lesson.problem,
          textbook: `${lesson.edition} ${lesson.grade} ${lesson.unit}`,
          node: lesson.node,
          microSteps: lesson.microSteps,
          commonGaps: lesson.commonGaps,
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

  render();
}

function applyGatewayTutor(payload, inputType) {
  const nextPhase = ["guiding", "teachback", "repair", "summary"].includes(payload.nextPhase)
    ? payload.nextPhase
    : state.phase;
  const lesson = currentLesson();

  state.phase = nextPhase;
  state.aiContext = payload.aiContext || state.aiContext;
  state.aiMessage = payload.aiMessage || state.aiMessage;
  state.feynmanStatus = payload.feynmanStatus || state.feynmanStatus;
  state.bestStrategy = payload.bestStrategy || state.bestStrategy;

  if (nextPhase === "teachback") {
    state.completedSteps = Math.max(state.completedSteps, 2);
    state.mastery = Math.max(state.mastery, 74);
    state.currentStep = "小台阶 3：讲给老师听";
  }

  if (nextPhase === "repair") {
    state.showVisual = true;
    state.strategyIndex = Math.max(state.strategyIndex, 1);
    state.currentStep = "小台阶 3：再讲一次";
    state.mastery = Math.max(state.mastery, 68);
    if (!payload.aiMessage) state.aiMessage = lesson.repairPrompt;
  }

  if (nextPhase === "summary") {
    state.completedSteps = lesson.microSteps.length;
    state.mastery = Math.max(state.mastery, 86);
    state.currentStep = "完成：能讲清楚原因";
    state.canExplainWhy = true;
    state.canUseOwnWords = true;
    if (!payload.aiMessage) state.aiMessage = lesson.doneMessage;
  }

  addEvidence(
    payload.evidenceSignal || "AI 评估",
    payload.evidenceText || "真实模型已根据孩子回答更新学习状态。",
    inputType === "voice" ? "语音回答" : "键盘回答",
  );
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
  const knowsProcess = includesAny(normalized, lesson.answer.attemptKeywords);
  const picksAnswer = includesAny(normalized, lesson.answer.answerKeywords);

  if (knowsProcess && picksAnswer) {
    state.phase = "teachback";
    state.mastery = Math.max(state.mastery, 74);
    state.completedSteps = Math.max(2, Math.min(lesson.microSteps.length - 1, 2));
    state.currentStep = "小台阶 3：讲给老师听";
    state.aiContext = "你已经会做这一步了。";
    state.aiMessage = "这次换你当小老师，讲给我听一遍。";
    state.feynmanStatus = "等待孩子讲";
    addEvidence("答对并进入复述", `孩子能做出「${lesson.node}」，开始进入讲给老师听。`, inputType === "voice" ? "语音回答" : "键盘回答");
    speakCurrentMessage();
    return;
  }

  state.phase = "repair";
  state.mastery = Math.max(52, state.mastery - 2);
  state.aiContext = "你已经说出了一部分，我们换个方法。";
  state.aiMessage = lesson.repairPrompt;
  state.currentStep = "小台阶 2：看图再想";
  state.showVisual = true;
  state.strategyIndex = 1;
  state.bestStrategy = lesson.strategies[1]?.label || "画图";
  addEvidence("需要换讲法", "孩子回答还没有说清楚过程或答案，AI 切到看图讲法。", "画图");
  speakCurrentMessage();
}

function evaluateTeachback(text, inputType) {
  const lesson = currentLesson();
  const normalized = normalizeText(text);
  const mentionsConcept = includesAny(normalized, lesson.answer.conceptKeywords);
  const explainsWhy = includesAny(normalized, lesson.answer.whyKeywords);
  const usesOwnWords = includesAny(normalized, lesson.answer.ownWordsKeywords);
  const comparesResult = includesAny(normalized, lesson.answer.resultKeywords);

  if (mentionsConcept && explainsWhy && comparesResult) {
    state.phase = "summary";
    state.mastery = 86;
    state.completedSteps = lesson.microSteps.length;
    state.currentStep = "完成：能讲清楚原因";
    state.aiContext = "你讲清楚了关键原因。";
    state.aiMessage = lesson.doneMessage;
    state.feynmanStatus = "能讲清楚";
    state.canExplainWhy = true;
    state.canUseOwnWords = usesOwnWords;
    state.bestStrategy = usesOwnWords ? lesson.strategies[1]?.label || state.bestStrategy : state.bestStrategy;
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
  const explicitTopic = [
    { id: "fraction-compare", keywords: ["分数", "分数比较", "三分之二", "四分之三"] },
    { id: "rectangle-perimeter", keywords: ["周长", "长方形", "正方形", "一圈"] },
    { id: "elapsed-time", keywords: ["时间", "钟表", "经过时间", "几点", "分钟"] },
    { id: "renminbi-conversion", keywords: ["人民币", "元角分", "元和角", "换算", "钱", "买东西"] },
  ].find((entry) => entry.keywords.some((keyword) => normalized.includes(normalizeText(keyword))));

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
  ].some((keyword) => normalized.includes(normalizeText(keyword)));

  const hasTopicSwitchIntent = [
    "换成",
    "想学",
    "学一下",
    "讲一下",
    "讲讲",
  ].some((keyword) => normalized.includes(normalizeText(keyword)));

  if (explicitTopic && (hasGenericSwitchIntent || hasTopicSwitchIntent)) {
    const index = lessons.findIndex((lesson) => lesson.id === explicitTopic.id);
    return index;
  }

  return hasGenericSwitchIntent ? (state.lessonIndex + 1) % lessons.length : -1;
}

function includesAny(normalizedText, keywords) {
  return keywords.some((keyword) => normalizedText.includes(normalizeText(keyword)));
}

function normalizeText(text) {
  return String(text).toLowerCase().replace(/\s/g, "");
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
