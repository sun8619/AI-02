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

const textbookMap = {
  subject: "数学",
  edition: "人教版",
  grade: "三年级上册",
  unit: "分数的初步认识",
  lesson: "分数大小比较",
  node: "异分母分数比较",
  prerequisites: ["认识分数", "知道分母表示平均分成几份", "同分母分数比较"],
  microSteps: [
    "先看分母",
    "想办法变成能比较的样子",
    "说出为什么 3/4 更大",
  ],
  commonGaps: ["直接比分子", "不知道为什么要通分", "会算但讲不清"],
};

const strategies = [
  {
    key: "step",
    label: "拆步骤",
    childLabel: "小台阶讲法",
    message: "我们只做一步：先看分母。分母不一样，就不能直接比分子。",
    guidance: "下一步，只看一件事：要不要通分？",
  },
  {
    key: "visual",
    label: "画图",
    childLabel: "看图讲法",
    message: "你看图：三分之二是把同样长的条分成 3 份涂 2 份，四分之三是分成 4 份涂 3 份。换成 12 小格后就好比了。",
    guidance: "看一看，8 小格和 9 小格，谁更多？",
  },
  {
    key: "story",
    label: "生活类比",
    childLabel: "饼干讲法",
    message: "想成两块一样大的饼干。一个吃了三份里的两份，另一个吃了四份里的三份。要比较多少，就先切成一样细的小份。",
    guidance: "切成一样细之后，谁吃到的小份更多？",
  },
  {
    key: "example",
    label: "换例子",
    childLabel: "换个例子",
    message: "换个更小的例子：比较 1/2 和 2/3，也要先想办法让每一小份一样大。",
    guidance: "如果都切成 6 小份，1/2 是几份？2/3 是几份？",
  },
];

let state = {
  view: "child",
  phase: "guiding",
  recording: false,
  showKeyboard: false,
  showVisual: true,
  strategyIndex: 0,
  mastery: 64,
  completedSteps: 1,
  todayQuestion: 2,
  transcript: "",
  aiContext: "我记得你刚才说：分母不一样。",
  aiMessage: "下一步，只看一件事：要不要通分？",
  currentStep: "小台阶 1：先看分母",
  feynmanStatus: "还没开始讲",
  canExplainWhy: false,
  canUseOwnWords: false,
  bestStrategy: "拆步骤",
  imageJob: {
    status: "idle",
    url: "",
    message: "",
  },
  evidence: [
    {
      type: "attempt",
      text: "孩子能说出分母不一样。",
      signal: "部分正确",
      strategy: "拆步骤",
    },
  ],
};

let recordingSession = null;

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

function icon(name) {
  return icons[name] || "";
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
          ["new-example", "换个例子", "book"],
        ];

  return `
    <main class="child-stage">
      <section class="learning-scene" aria-label="孩子学习区">
        <div class="scene-left">
          <div class="problem-strip">
            <span>${icon("book")}当前题目</span>
            <strong>比较 2/3 和 3/4 哪个大？</strong>
          </div>

          <div class="tutor-wrap">
            <div class="tutor-card">
              ${renderMascot()}
              <div class="speech-card">
                <p class="context-line">${state.aiContext}</p>
                <h1>${state.aiMessage}</h1>
                <div class="strategy-chip">${icon("light")}${strategies[state.strategyIndex].childLabel}</div>
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
        </div>

        <aside class="scene-right">
          <div class="step-panel">
            <div class="panel-head">
              <span>${icon("star")}小台阶</span>
              <strong>提示 L2</strong>
            </div>
            <h2>${state.currentStep}</h2>
            <p>${renderStepHint()}</p>
            <div class="step-ladder" aria-label="学习小台阶">
              ${textbookMap.microSteps
                .map(
                  (step, index) => `
                    <div class="ladder-step ${index < state.completedSteps ? "is-done" : ""} ${index === state.completedSteps ? "is-now" : ""}">
                      <span>${index < state.completedSteps ? icon("check") : index + 1}</span>
                      <em>${step}</em>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </div>

          ${state.showVisual ? renderLearningVisual() : ""}

          <div class="practice-panel">
            <div>
              <span>今天第 ${state.todayQuestion} 题</span>
              <strong>已完成 ${state.completedSteps} 个小台阶</strong>
            </div>
            <div class="mastery-ring" style="--value:${state.mastery}%">
              <b>${state.mastery}%</b>
              <small>掌握</small>
            </div>
          </div>
        </aside>
      </section>

      <section class="voice-dock" aria-label="语音输入区">
        ${state.showKeyboard ? renderKeyboardComposer() : ""}
        <div class="dock-actions">
          <button class="dock-mini" data-action="camera">${icon("camera")}拍照</button>
          <button class="voice-button ${state.recording ? "is-recording" : ""}" data-action="voice">
            ${icon("mic")}
            <span>${state.recording ? "点我结束" : state.phase === "teachback" ? "讲给我听" : "按住说"}</span>
          </button>
          <button class="dock-mini" data-action="toggle-keyboard">${icon("keyboard")}键盘输入</button>
        </div>
        <p class="dock-note">${renderDockNote()}</p>
      </section>
    </main>
  `;
}

function renderStepHint() {
  if (state.phase === "teachback") return "你已经会做这一步了。现在试着用自己的话讲给 AI 听。";
  if (state.phase === "repair") return "没关系，我们换一种讲法。先看图，再慢慢说。";
  if (state.phase === "summary") return "你能说出为什么，这个知识点就更稳了。";
  return "分母不一样时，先不要急着比分子，要想办法让它们能比较。";
}

function renderDockNote() {
  if (state.phase === "teachback") return "像小老师一样讲：为什么不能直接比？要怎么变？";
  if (state.phase === "repair") return "可以看着图说，不用一次讲完整。";
  if (state.phase === "summary") return "已经完成这一题，可以去家长页看学习记录。";
  return "部署后会优先用火山语音识别和语音合成；没有配置时自动回退模拟。";
}

function renderKeyboardComposer() {
  return `
    <form class="keyboard-composer" data-form="typed-answer">
      <input name="answer" value="${escapeAttr(state.transcript)}" placeholder="也可以打字模拟孩子说的话，例如：要通分，3/4 大" />
      <button class="btn btn-primary" type="submit">发送</button>
    </form>
  `;
}

function renderLearningVisual() {
  return `
    <div class="visual-panel">
      <div class="panel-head">
        <span>${icon("image")}看图想一想</span>
        <strong>程序精准绘制</strong>
      </div>
      <svg class="fraction-svg" viewBox="0 0 520 240" role="img" aria-label="把三分之二和四分之三都变成十二小格比较">
        <text x="26" y="32" class="svg-title">把它们都变成 12 小格</text>
        ${fractionBar(36, 58, 3, 2, "#5cc7a4", "2/3 = 8/12")}
        ${fractionBar(36, 140, 4, 3, "#4da3ff", "3/4 = 9/12")}
        <text x="370" y="98" class="svg-note">8 小格</text>
        <text x="370" y="180" class="svg-note">9 小格，更多</text>
        <path d="M432 150c28 0 42 9 42 24s-14 24-42 24" fill="none" stroke="#ffb72b" stroke-width="5" stroke-linecap="round"/>
        <text x="396" y="224" class="svg-win">所以 3/4 更大</text>
      </svg>
      <div class="ai-visual-card">
        <div>
          <strong>AI 生活图</strong>
          <p>如果孩子还是没懂，可以让 AI 画一个“同样大的饼干切成小份”的例子。</p>
        </div>
        <button class="btn btn-primary" data-action="generate-story-image" ${state.imageJob.status === "loading" ? "disabled" : ""}>
          ${icon("image")}${state.imageJob.status === "loading" ? "正在画" : "AI 画生活例子"}
        </button>
      </div>
      ${renderGeneratedImage()}
    </div>
  `;
}

function renderGeneratedImage() {
  if (state.imageJob.status === "idle") return "";
  if (state.imageJob.status === "loading") {
    return `
      <div class="generated-visual is-loading">
        <span class="loading-dot" aria-hidden="true"></span>
        <p>AI 正在画生活例子。数学比例图已经在上面，生活图只帮助孩子想象。</p>
      </div>
    `;
  }
  if (state.imageJob.status === "error") {
    return `
      <div class="generated-visual is-error">
        <strong>AI 图片暂时没画出来</strong>
        <p>${state.imageJob.message || "请检查 Ark 图片服务配置。"}</p>
      </div>
    `;
  }
  return `
    <div class="generated-visual">
      <img src="${escapeAttr(state.imageJob.url)}" alt="AI 生成的分饼干理解图" loading="lazy" />
      <p>这张图用于生活类比；真正的分数比例以上面的程序图为准。</p>
    </div>
  `;
}

function fractionBar(x, y, denominator, numerator, color, label) {
  const width = 300;
  const height = 38;
  const piece = width / denominator;
  let parts = "";
  for (let i = 0; i < denominator; i += 1) {
    const filled = i < numerator;
    parts += `<rect x="${x + i * piece}" y="${y}" width="${piece}" height="${height}" fill="${filled ? color : "#fff"}" stroke="#244056" stroke-width="2"/>`;
  }
  return `
    <text x="${x}" y="${y - 12}" class="svg-label">${label}</text>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="7" fill="none" stroke="#244056" stroke-width="2"/>
    ${parts}
  `;
}

function renderParentView() {
  return `
    <main class="parent-page">
      <section class="parent-hero">
        <div>
          <h1>给家长看的进展</h1>
          <p>孩子端只保留语音陪练；这里记录知识点拆分、换讲法、看图辅助和“讲给 AI 听”的结果。</p>
        </div>
        <button class="btn btn-primary" data-action="summary-view">${icon("book")}查看本题总结</button>
      </section>

      <section class="parent-grid">
        <article class="parent-card wide">
          <div class="panel-head">
            <span>${icon("book")}人教版知识点拆分</span>
            <strong>${textbookMap.edition}</strong>
          </div>
          <div class="knowledge-path">
            <span>${textbookMap.subject}</span>
            <span>${textbookMap.grade}</span>
            <span>${textbookMap.unit}</span>
            <span>${textbookMap.lesson}</span>
          </div>
          <h2>${textbookMap.node}</h2>
          <div class="knowledge-columns">
            <div>
              <h3>前置知识</h3>
              <ul>${textbookMap.prerequisites.map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
            <div>
              <h3>常见卡点</h3>
              <ul>${textbookMap.commonGaps.map((item) => `<li>${item}</li>`).join("")}</ul>
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
            <span>讲给 AI 听</span>
            <strong>${state.feynmanStatus}</strong>
            <p>记录孩子是否真的理解，而不是只会报答案。</p>
          </div>
        </article>

        <article class="parent-card">
          <div class="panel-head">
            <span>${icon("repeat")}换过的讲法</span>
          </div>
          <div class="strategy-list">
            ${strategies
              .slice(0, Math.max(1, state.strategyIndex + 1))
              .map(
                (strategy) => `
                  <div class="strategy-row ${strategy.label === state.bestStrategy ? "is-best" : ""}">
                    <strong>${strategy.label}</strong>
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
          <p class="plain-text">分数条、数轴、几何图会优先用程序精准绘制，避免 AI 图片把比例画错。生活情景图以后可接入 Ark 图片生成。</p>
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
                    <strong>${item.signal}</strong>
                    <p>${item.text}</p>
                    <span>${item.strategy}</span>
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
  return `
    <main class="summary-page">
      <section class="summary-sheet">
        <button class="btn btn-soft" data-action="parent-view">${icon("arrow")}返回家长页</button>
        <h1>本题学习总结</h1>
        <div class="summary-block">
          <h2>孩子学到什么</h2>
          <p>比较 2/3 和 3/4 时，分母不一样，不能直接比分子。可以先变成同样的小份，再比较谁更多。</p>
        </div>
        <div class="summary-block">
          <h2>是否能讲出来</h2>
          <p>${state.canExplainWhy ? "孩子已经能说出“分母不同要先通分，再比较 8/12 和 9/12”。" : "孩子目前还需要看图和提示才能讲清楚原因。"}</p>
        </div>
        <div class="summary-block">
          <h2>下次建议</h2>
          <p>明天再练 1 道分母不同的分数比较题，并让孩子继续当小老师讲一遍。</p>
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
    node.addEventListener("click", handleAction);
  });
  document.querySelectorAll("[data-form='typed-answer']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = new FormData(form).get("answer");
      handleChildInput(String(value || "").trim(), "typed");
    });
  });
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

  if (action === "voice") {
    await handleVoiceButton();
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
    toastMessage("已模拟 AI 语音再说一遍");
    return;
  }

  if (action === "new-example") {
    state.strategyIndex = Math.min(strategies.length - 1, 3);
    state.aiContext = "我们换一个更小的例子。";
    state.aiMessage = strategies[state.strategyIndex].guidance;
    state.bestStrategy = strategies[state.strategyIndex].label;
    addEvidence("换例子", "AI 改用更小的分数例子帮助理解。", "换讲法");
    render();
    return;
  }

  if (action === "show-visual") {
    state.showVisual = true;
    state.strategyIndex = Math.max(state.strategyIndex, 1);
    state.aiContext = "我们看图再说一遍。";
    state.aiMessage = strategies[1].guidance;
    state.bestStrategy = "画图";
    addEvidence("看图辅助", "孩子请求再看图，AI 切换到分数条讲法。", "画图");
    render();
    return;
  }

  if (action === "generate-story-image") {
    await generateStoryImage();
    return;
  }

  if (action === "teach") {
    state.phase = "teachback";
    state.aiContext = "轮到你当小老师了。";
    state.aiMessage = "讲给我听：为什么 3/4 比 2/3 大？";
    state.currentStep = "小台阶 3：用自己的话讲";
    state.feynmanStatus = "等待孩子讲";
    render();
  }
}

async function generateStoryImage() {
  state.imageJob = { status: "loading", url: "", message: "" };
  render();

  const prompt = [
    "为低年级小学生生成一张帮助理解分数比较的生活情景图。",
    "画面：两块一样大的圆形饼干或蛋糕放在浅色桌面上，左边切成 3 份并涂/拿走 2 份，右边切成 4 份并涂/拿走 3 份。",
    "目的：帮助孩子理解 2/3 和 3/4 的大小比较。",
    "要求：儿童教育插图风格，画面干净，主体清楚，不要复杂小字，不要真实品牌，不要夸张卡通，不要错误数学符号。",
    "注意：这只是生活类比图，精确比例会由页面上的程序分数条呈现。",
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
    state.bestStrategy = "生活类比";
    addEvidence("AI 生成理解图片", "AI 生成生活情景图，帮助孩子把通分理解成切成一样细的小份。", "生活类比图");
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
  if (state.recording && recordingSession) {
    stopRecording();
    return;
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

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks = [];
  const recorder = new MediaRecorder(stream);
  recordingSession = { recorder, stream, chunks };
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data?.size) chunks.push(event.data);
  });
  recorder.addEventListener("stop", async () => {
    state.recording = false;
    render();
    stream.getTracks().forEach((track) => track.stop());
    const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
    recordingSession = null;
    await transcribeRecording(blob);
  });
  state.recording = true;
  recorder.start();
  render();
}

function stopRecording() {
  if (!recordingSession) return;
  recordingSession.recorder.stop();
}

async function transcribeRecording(blob) {
  try {
    const audioData = await blobToDataUrl(blob);
    const response = await fetch("/api/speech/transcriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioData,
        mimeType: blob.type,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.mode === "mock" || !payload.transcript) {
      throw new Error(payload.detail || payload.message || "语音识别暂不可用");
    }
    handleChildInput(payload.transcript, "voice");
  } catch {
    toastMessage("语音识别暂不可用，已用模拟回答继续。");
    handleChildInput(getSimulatedTranscript(), "voice");
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
  render();
  window.setTimeout(() => {
    const transcript = getSimulatedTranscript();
    state.recording = false;
    handleChildInput(transcript, "voice");
  }, 520);
}

function getSimulatedTranscript() {
  if (state.phase === "teachback") {
    return "分母不一样，不能直接比分子。先都变成十二小格，二分之三不对，是三分之二变成八个小格，四分之三变成九个小格，所以四分之三更大。";
  }
  if (state.phase === "repair") {
    return "要先让每一小份一样大，再看谁涂的小格更多。四分之三是九格，比八格多。";
  }
  return "要通分，三分之二是八分不对，是十二分之八，四分之三是十二分之九，所以四分之三大。";
}

function handleChildInput(text, inputType) {
  if (!text) {
    toastMessage("先说一句或打几个字，我再继续。");
    return;
  }

  state.transcript = text;

  askGatewayTutor(text, inputType);
}

async function askGatewayTutor(text, inputType) {
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

  state.phase = nextPhase;
  state.aiContext = payload.aiContext || state.aiContext;
  state.aiMessage = payload.aiMessage || state.aiMessage;
  state.feynmanStatus = payload.feynmanStatus || state.feynmanStatus;
  state.bestStrategy = payload.bestStrategy || state.bestStrategy;

  if (nextPhase === "teachback") {
    state.completedSteps = Math.max(state.completedSteps, 2);
    state.mastery = Math.max(state.mastery, 74);
    state.currentStep = "小台阶 3：讲给 AI 听";
  }

  if (nextPhase === "repair") {
    state.showVisual = true;
    state.strategyIndex = Math.max(state.strategyIndex, 1);
    state.currentStep = "小台阶 3：再讲一次";
    state.mastery = Math.max(state.mastery, 68);
  }

  if (nextPhase === "summary") {
    state.completedSteps = 3;
    state.mastery = Math.max(state.mastery, 86);
    state.currentStep = "完成：能讲清楚原因";
    state.canExplainWhy = true;
    state.canUseOwnWords = true;
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
  const normalized = normalizeText(text);
  const knowsCommonDenominator = normalized.includes("通分") || normalized.includes("十二") || normalized.includes("12");
  const picksAnswer = normalized.includes("3/4") || normalized.includes("四分之三") || normalized.includes("三分之四");

  if (knowsCommonDenominator && picksAnswer) {
    state.phase = "teachback";
    state.mastery = Math.max(state.mastery, 74);
    state.completedSteps = 2;
    state.currentStep = "小台阶 3：讲给 AI 听";
    state.aiContext = "你已经会做这一步了。";
    state.aiMessage = "这次换你当小老师，讲给我听一遍。";
    state.feynmanStatus = "等待孩子讲";
    addEvidence("答对并进入复述", "孩子能说出要通分，并判断 3/4 更大。", inputType === "voice" ? "语音回答" : "键盘回答");
    speakCurrentMessage();
    return;
  }

  state.phase = "repair";
  state.mastery = Math.max(52, state.mastery - 2);
  state.aiContext = "你已经说出了一部分，我们换个方法。";
  state.aiMessage = "先看图：如果都切成 12 小格，谁涂得更多？";
  state.currentStep = "小台阶 2：看图比较";
  state.showVisual = true;
  state.strategyIndex = 1;
  state.bestStrategy = "画图";
  addEvidence("需要换讲法", "孩子回答还没有说清楚通分或大小比较，AI 切到看图讲法。", "画图");
}

function evaluateTeachback(text, inputType) {
  const normalized = normalizeText(text);
  const mentionsConcept = normalized.includes("分母") && (normalized.includes("不一样") || normalized.includes("不同"));
  const explainsWhy = normalized.includes("不能直接") || normalized.includes("一样大") || normalized.includes("能比较");
  const usesOwnWords = normalized.includes("小格") || normalized.includes("涂") || normalized.includes("切");
  const comparesResult = normalized.includes("9") || normalized.includes("九") || normalized.includes("更多") || normalized.includes("更大");

  if (mentionsConcept && explainsWhy && comparesResult) {
    state.phase = "summary";
    state.mastery = 86;
    state.completedSteps = 3;
    state.currentStep = "完成：能讲清楚原因";
    state.aiContext = "你讲清楚了关键原因。";
    state.aiMessage = "很好，你不是只说答案，你说出了为什么。";
    state.feynmanStatus = "能讲清楚";
    state.canExplainWhy = true;
    state.canUseOwnWords = usesOwnWords;
    state.bestStrategy = usesOwnWords ? "画图" : state.bestStrategy;
    addEvidence("能用自己的话解释", "孩子复述时说出分母不同、不能直接比较，并说明 3/4 更大。", inputType === "voice" ? "讲给 AI 听" : "打字复述");
    speakCurrentMessage();
    return;
  }

  state.phase = "repair";
  state.mastery = Math.max(state.mastery, 68);
  state.currentStep = "小台阶 3：再讲一次";
  state.aiContext = "你已经说出答案了，还差一点原因。";
  state.aiMessage = "我们换成看图说：为什么 9 小格比 8 小格多？";
  state.feynmanStatus = "会做但讲不清";
  state.showVisual = true;
  state.strategyIndex = 1;
  state.bestStrategy = "画图";
  addEvidence("会做但讲不清", "孩子复述不完整，AI 没有判错，而是换成看图追问。", "画图");
  speakCurrentMessage();
}

function switchExplanation(reason) {
  state.phase = state.phase === "teachback" ? "repair" : state.phase;
  state.strategyIndex = Math.min(strategies.length - 1, state.strategyIndex + 1);
  const strategy = strategies[state.strategyIndex];
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
  const text = `${state.aiContext} ${state.aiMessage}`.trim();
  if (window.location.protocol !== "file:") {
    try {
      const response = await fetch("/api/speech/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.audioDataUrl) {
        const audio = new Audio(payload.audioDataUrl);
        await audio.play();
        return;
      }
    } catch {
      // Browser speech is a safe fallback for local demos and missing TTS setup.
    }
  }

  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.92;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}

function addEvidence(signal, text, strategy) {
  state.evidence.unshift({ signal, text, strategy, type: "learning" });
  state.evidence = state.evidence.slice(0, 8);
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

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

render();
