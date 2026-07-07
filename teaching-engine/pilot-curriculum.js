import {
  DependencyStrength,
  ErrorTag,
  MasteryDimension,
  TeachingAction,
  makeDependency,
} from "./knowledge-model.js";

const direct = MasteryDimension.DIRECT;
const variant = MasteryDimension.VARIANT;
const reasoning = MasteryDimension.REASONING;

export const pilotKnowledgeModules = [
  {
    id: "g1a-add-within-20",
    grade_term: "一年级上",
    module_name: "20以内进位加法",
    textbook_order: 8,
    points: [
      {
        id: "g1a-add-9-plus",
        lesson_ids: ["g1a-carry-add-20"],
        point_name: "9加几",
        child_title: "9加几：先凑成10",
        teaching_family: "makeTenAdd",
        entry_question: "9+4可以怎样算得更快？",
        atoms: [
          {
            id: "g1a-atom-number-bond-10",
            atom_name: "10的分与合",
            can_do_statement: "孩子能说出几和几能合成10。",
            check_keywords: ["合成10", "凑成10", "1和9", "2和8", "3和7", "4和6", "5和5", "差1", "还差1"],
            dependencies: [],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.NO_RESPONSE],
            assessment_targets: ["能补出10的朋友数", "能把10看成两个数合起来"],
            remediation_targets: ["用手指或圆点补到10"],
            teaching_actions: [TeachingAction.MANIPULATIVE, TeachingAction.MICRO_PRACTICE],
          },
          {
            id: "g1a-atom-make-ten-from-9",
            atom_name: "看到9先想差1到10",
            is_entry: true,
            can_do_statement: "孩子看到9加几时，能先想到9还差1就是10。",
            check_keywords: ["9差1", "还差1", "差1到10", "凑成10", "拿1", "借1"],
            dependencies: [
              makeDependency("g1a-atom-number-bond-10", DependencyStrength.STRONG, "不知道10的分与合，就很难理解凑十。"),
            ],
            common_error_tags: [ErrorTag.PREREQUISITE_GAP, ErrorTag.PROCESS_DROP],
            assessment_targets: ["能说出9差1到10", "能从另一个加数里拿出1"],
            remediation_targets: ["先问9还差几到10", "用小方块演示拿1个给9"],
            teaching_actions: [TeachingAction.EXPLAIN, TeachingAction.PROMPT],
          },
          {
            id: "g1a-atom-split-addend",
            atom_name: "把另一个数拆成1和剩下的数",
            can_do_statement: "孩子能把4拆成1和3，把6拆成1和5。",
            check_keywords: ["4拆成1和3", "1和3", "6拆成1和5", "1和5", "7拆成1和6", "拆出1"],
            dependencies: [
              makeDependency("g1a-atom-make-ten-from-9", DependencyStrength.STRONG, "先知道拿1给9，才知道另一个数为什么要拆。"),
            ],
            common_error_tags: [ErrorTag.PROCESS_DROP, ErrorTag.CALCULATION_SLIP],
            assessment_targets: ["能正确拆另一个加数", "不把拆出来的数丢掉"],
            remediation_targets: ["只练把一个数拆成1和剩下几", "用框图记录拆数"],
            teaching_actions: [TeachingAction.GUIDED_STEP, TeachingAction.MICRO_PRACTICE],
          },
          {
            id: "g1a-atom-combine-ten-rest",
            atom_name: "10再加剩下的数",
            can_do_statement: "孩子能算出9+4就是10+3等于13。",
            check_keywords: ["10加3", "十加三", "13", "十三", "还剩3", "剩下3"],
            accepts_final_answer: true,
            dependencies: [
              makeDependency("g1a-atom-split-addend", DependencyStrength.STRONG, "拆完后要把剩下的数接回主算式。"),
            ],
            common_error_tags: [ErrorTag.PROCESS_DROP, ErrorTag.CALCULATION_SLIP],
            assessment_targets: ["能合并10和剩下的数", "能写出或说出最后结果"],
            remediation_targets: ["只练10加几", "让孩子补完整句：9拿到1变成10，还剩..."],
            teaching_actions: [TeachingAction.GUIDED_STEP, TeachingAction.ERROR_FIX],
          },
          {
            id: "g1a-atom-explain-make-ten",
            atom_name: "说清为什么这样算",
            can_do_statement: "孩子能用自己的话说出先凑10是因为10加几更好算。",
            check_keywords: ["10更好算", "先凑10", "凑十好算", "9差1", "先拿1"],
            dependencies: [
              makeDependency("g1a-atom-combine-ten-rest", DependencyStrength.STRONG, "会做之后才能解释做法。"),
            ],
            common_error_tags: [ErrorTag.EXPRESSION_WEAK],
            assessment_targets: ["能讲出关键步骤", "能讲出为什么先凑10"],
            remediation_targets: ["半句脚手架：因为9差...，所以先拿..."],
            teaching_actions: [TeachingAction.FEYNMAN, TeachingAction.PROMPT],
          },
        ],
        assessment_templates: [
          question("g1a-add-9-plus-d1", direct, "9+3等于几？你可以先凑成10。", ["g1a-atom-make-ten-from-9", "g1a-atom-split-addend", "g1a-atom-combine-ten-rest"], ["12", "十二", "10加2"], { kind: "number", value: 12 }),
          question("g1a-add-9-plus-d2", direct, "9+6等于几？", ["g1a-atom-make-ten-from-9", "g1a-atom-split-addend", "g1a-atom-combine-ten-rest"], ["15", "十五", "10加5"], { kind: "number", value: 15 }),
          question("g1a-add-9-plus-v1", variant, "有9颗糖，又来了5颗，一共有几颗？", ["g1a-atom-make-ten-from-9", "g1a-atom-combine-ten-rest"], ["14", "十四", "10加4"], { kind: "number", value: 14 }),
          question("g1a-add-9-plus-v2", variant, "算9+7时，7要拆成1和几？", ["g1a-atom-split-addend"], ["6", "六", "1和6"], { kind: "number", value: 6 }),
          question("g1a-add-9-plus-r1", reasoning, "为什么9加几时，我们常常先把9凑成10？", ["g1a-atom-explain-make-ten"], ["10更好算", "凑成10", "9差1"]),
        ],
        remediation_rules: [
          remediation("g1a-add-9-plus-r-missing-10", ErrorTag.PREREQUISITE_GAP, "g1a-atom-number-bond-10", "先补10的分与合，再回到9加几。"),
          remediation("g1a-add-9-plus-r-drop-rest", ErrorTag.PROCESS_DROP, "g1a-atom-combine-ten-rest", "只重带最后一步：10加剩下的数。"),
          remediation("g1a-add-9-plus-r-say", ErrorTag.EXPRESSION_WEAK, "g1a-atom-explain-make-ten", "给半句脚手架，让孩子补全思路。"),
        ],
        feynman_prompt: {
          id: "g1a-add-9-plus-feynman",
          child_prompt: "你来当小老师，教教我9+4可以怎样先凑成10。",
          required_signals: ["9差1到10", "把4拆成1和3", "10加3等于13", "10更好算"],
        },
      },
    ],
  },
  {
    id: "g1b-money",
    grade_term: "一年级下",
    module_name: "认识人民币",
    textbook_order: 5,
    points: [
      {
        id: "g1b-money-convert-yuan-jiao",
        lesson_ids: ["renminbi-conversion"],
        point_name: "人民币单位换算",
        child_title: "元和角：先换成同一种单位",
        teaching_family: "money",
        entry_question: "3元5角一共是几角？",
        atoms: [
          {
            id: "g1b-atom-know-yuan-jiao",
            atom_name: "认识元和角",
            can_do_statement: "孩子能分清元和角是人民币的不同单位。",
            check_keywords: ["元", "角", "单位", "钱", "人民币", "不一样"],
            dependencies: [],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.LANGUAGE_MISREAD],
            assessment_targets: ["能认出元和角", "能听懂几元几角"],
            remediation_targets: ["用真实购物情境重说题意"],
            teaching_actions: [TeachingAction.EXAMPLE, TeachingAction.MANIPULATIVE],
          },
          {
            id: "g1b-atom-one-yuan-ten-jiao",
            atom_name: "1元等于10角",
            is_entry: true,
            can_do_statement: "孩子能说出1元就是10角。",
            check_keywords: ["10", "十", "1元10角", "一元十角", "1元等于10角", "一元等于十角", "10角", "十角"],
            dependencies: [
              makeDependency("g1b-atom-know-yuan-jiao", DependencyStrength.STRONG, "不分清单位，就不能做换算。"),
            ],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.PREREQUISITE_GAP],
            assessment_targets: ["能说出1元=10角", "能把2元换成20角"],
            remediation_targets: ["画10个1角组成1元"],
            teaching_actions: [TeachingAction.EXPLAIN, TeachingAction.MICRO_PRACTICE],
          },
          {
            id: "g1b-atom-one-jiao-ten-fen",
            atom_name: "1角等于10分",
            can_do_statement: "孩子能说出1角就是10分，知道元、角、分是一级一级换的。",
            check_keywords: ["10", "十", "1角10分", "一角十分", "1角等于10分", "一角等于十分", "10分", "十分"],
            dependencies: [
              makeDependency("g1b-atom-know-yuan-jiao", DependencyStrength.MEDIUM, "认识角之后，再知道角和分的关系。"),
            ],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.PREREQUISITE_GAP],
            assessment_targets: ["能说出1角=10分", "知道元角分是不同单位"],
            remediation_targets: ["画10个1分组成1角"],
            teaching_actions: [TeachingAction.EXPLAIN, TeachingAction.MICRO_PRACTICE],
          },
          {
            id: "g1b-atom-convert-yuan-to-jiao",
            atom_name: "把几元换成几十角",
            can_do_statement: "孩子能把3元换成30角。",
            check_keywords: ["3元30角", "三元三十角", "3元是30角", "三元是三十角", "30角", "三十角"],
            dependencies: [
              makeDependency("g1b-atom-one-yuan-ten-jiao", DependencyStrength.STRONG, "换算必须先知道1元=10角。"),
            ],
            common_error_tags: [ErrorTag.PROCESS_DROP, ErrorTag.CALCULATION_SLIP],
            assessment_targets: ["能把几元换成几十角", "不把元和角直接拼接成数字"],
            remediation_targets: ["只练1元、2元、3元分别是几角"],
            teaching_actions: [TeachingAction.GUIDED_STEP, TeachingAction.MICRO_PRACTICE],
          },
          {
            id: "g1b-atom-add-leftover-jiao",
            atom_name: "再加原来的几角",
            can_do_statement: "孩子能算出3元5角是30角加5角等于35角。",
            check_keywords: ["35角", "三十五角", "30加5", "三十加五", "30角加5角", "三十角加五角"],
            accepts_final_answer: true,
            dependencies: [
              makeDependency("g1b-atom-convert-yuan-to-jiao", DependencyStrength.STRONG, "先把元换成角，再加原来的角。"),
            ],
            common_error_tags: [ErrorTag.PROCESS_DROP, ErrorTag.CALCULATION_SLIP],
            assessment_targets: ["能把换好的角和原来的角合起来", "能保留单位"],
            remediation_targets: ["用两栏图记录：元换成角 + 原来几角"],
            teaching_actions: [TeachingAction.GUIDED_STEP, TeachingAction.ERROR_FIX],
          },
          {
            id: "g1b-atom-explain-same-unit",
            atom_name: "说清为什么先换单位",
            can_do_statement: "孩子能说出元和角不一样，要先换成同一种单位再合起来。",
            check_keywords: ["单位不同", "元和角不一样", "先换成角", "同一种单位", "不能直接说35元"],
            dependencies: [
              makeDependency("g1b-atom-add-leftover-jiao", DependencyStrength.STRONG, "会换算之后才能解释为什么换。"),
            ],
            common_error_tags: [ErrorTag.EXPRESSION_WEAK],
            assessment_targets: ["能说出单位不同", "能说出先换成角再合起来"],
            remediation_targets: ["半句脚手架：元和角不一样，所以先把..."],
            teaching_actions: [TeachingAction.FEYNMAN, TeachingAction.PROMPT],
          },
        ],
        assessment_templates: [
          question("g1b-money-d1", direct, "2元是几角？", ["g1b-atom-one-yuan-ten-jiao", "g1b-atom-convert-yuan-to-jiao"], ["20角", "二十角", "20"], { kind: "money_jiao", totalJiao: 20 }),
          question("g1b-money-d2", direct, "4元3角一共是几角？", ["g1b-atom-convert-yuan-to-jiao", "g1b-atom-add-leftover-jiao"], ["43角", "四十三角", "43"], { kind: "money_jiao", totalJiao: 43 }),
          question("g1b-money-d3", direct, "3元5角一共是几角？", ["g1b-atom-convert-yuan-to-jiao", "g1b-atom-add-leftover-jiao"], ["35角", "三十五角", "35"], { kind: "money_jiao", totalJiao: 35 }),
          question("g1b-money-v1", variant, "买铅笔要1元6角，如果全用角来数，是几角？", ["g1b-atom-convert-yuan-to-jiao", "g1b-atom-add-leftover-jiao"], ["16角", "十六角", "16"], { kind: "money_jiao", totalJiao: 16 }),
          question("g1b-money-v2", variant, "25角里面有几元几角？", ["g1b-atom-one-yuan-ten-jiao", "g1b-atom-convert-yuan-to-jiao"], ["2元5角", "二元五角", "两元五角", "二元5角", "两元5角"], { kind: "money_decompose", yuan: 2, jiao: 5, totalJiao: 25 }),
          question("g1b-money-v3", variant, "一本练习本2元4角，付的钱要全部换成角来算，是几角？", ["g1b-atom-convert-yuan-to-jiao", "g1b-atom-add-leftover-jiao"], ["24角", "二十四角", "24"], { kind: "money_jiao", totalJiao: 24 }),
          question("g1b-money-r1", reasoning, "用一句话说原因：为什么元和角要先换成同一种单位？", ["g1b-atom-explain-same-unit"], ["因为元和角不是同一种单位所以要先把元换成角", "元和角不是同一种单位", "不是同一种单位", "先把元换成角", "先换成角", "单位不同"]),
        ],
        remediation_rules: [
          remediation("g1b-money-r-unit", ErrorTag.LANGUAGE_MISREAD, "g1b-atom-know-yuan-jiao", "先用购物故事重说元和角。"),
          remediation("g1b-money-r-rate", ErrorTag.PREREQUISITE_GAP, "g1b-atom-one-yuan-ten-jiao", "先补1元=10角。"),
          remediation("g1b-money-r-leftover", ErrorTag.PROCESS_DROP, "g1b-atom-add-leftover-jiao", "只重带加上原来几角。"),
        ],
        feynman_prompt: {
          id: "g1b-money-feynman",
          child_prompt: "你来当小老师，教教我3元5角为什么是35角。",
          required_signals: ["1元等于10角", "3元就是30角", "再加5角", "先换成同一种单位"],
        },
      },
      {
        id: "g1b-simple-shopping-change",
        lesson_ids: ["g1b-simple-shopping"],
        point_name: "简单购物找钱",
        child_title: "购物找钱：付的钱减去价格",
        teaching_family: "moneyApplication",
        entry_question: "一本本子4元，付5元，应找回多少钱？",
        atoms: [
          {
            id: "g1b-shop-atom-read-price",
            atom_name: "看清商品价格",
            is_entry: true,
            can_do_statement: "孩子能先看出商品要4元。",
            check_keywords: ["4", "4元", "四元", "本子4元", "价格4元", "要4元", "商品4元"],
            dependencies: [],
            common_error_tags: [ErrorTag.LANGUAGE_MISREAD, ErrorTag.CONCEPT_GAP],
            assessment_targets: ["能说出商品价格", "不把价格和付出的钱混在一起"],
            remediation_targets: ["先遮住付的钱，只读商品价格"],
            teaching_actions: [TeachingAction.PROMPT, TeachingAction.MANIPULATIVE],
          },
          {
            id: "g1b-shop-atom-read-paid",
            atom_name: "看清付了多少钱",
            can_do_statement: "孩子能看出付出去的是5元。",
            check_keywords: ["5", "5元", "五元", "付5元", "付了5元", "给5元", "给了5元"],
            dependencies: [
              makeDependency("g1b-shop-atom-read-price", DependencyStrength.STRONG, "先知道价格，再看付了多少钱。"),
            ],
            common_error_tags: [ErrorTag.LANGUAGE_MISREAD, ErrorTag.PROCESS_DROP],
            assessment_targets: ["能说出付了多少钱", "知道付的钱通常比价格多一点"],
            remediation_targets: ["用两张卡片分开放：价格、付出"],
            teaching_actions: [TeachingAction.GUIDED_STEP, TeachingAction.MICRO_PRACTICE],
          },
          {
            id: "g1b-shop-atom-change-means-left",
            atom_name: "找回就是剩下的钱",
            can_do_statement: "孩子能说出找回的钱是付的钱里剩下的部分。",
            check_keywords: ["找回", "剩下", "多出来", "退回", "付的钱减价格", "付的钱减去价格"],
            dependencies: [
              makeDependency("g1b-shop-atom-read-paid", DependencyStrength.STRONG, "要先分清付出和价格，才能理解找回。"),
            ],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.PROCESS_DROP],
            assessment_targets: ["能说明找回不是相加", "能说出从付的钱里拿走价格"],
            remediation_targets: ["画5元被拿走4元，剩下1元"],
            teaching_actions: [TeachingAction.EXPLAIN, TeachingAction.MANIPULATIVE],
          },
          {
            id: "g1b-shop-atom-subtract-change",
            atom_name: "用减法算找回",
            can_do_statement: "孩子能算出5元减4元等于1元。",
            check_keywords: ["1", "5减4", "五减四", "5-4", "5元减4元", "一元", "1元", "找回1元"],
            accepts_final_answer: true,
            dependencies: [
              makeDependency("g1b-shop-atom-change-means-left", DependencyStrength.STRONG, "理解找回是剩下的钱，才能选减法。"),
            ],
            common_error_tags: [ErrorTag.CALCULATION_SLIP, ErrorTag.EXPRESSION_WEAK],
            assessment_targets: ["能写出或说出5-4", "能带单位说1元"],
            remediation_targets: ["只算5-4，再补单位元"],
            teaching_actions: [TeachingAction.GUIDED_STEP, TeachingAction.ERROR_FIX],
          },
          {
            id: "g1b-shop-atom-explain-change",
            atom_name: "说清为什么用减法",
            can_do_statement: "孩子能说出因为付了5元，花掉4元，所以剩下1元要找回。",
            check_keywords: ["付了5元", "花掉4元", "剩下1元", "所以找回1元", "用减法", "不是加法"],
            dependencies: [
              makeDependency("g1b-shop-atom-subtract-change", DependencyStrength.STRONG, "先会算，再说清楚为什么。"),
            ],
            common_error_tags: [ErrorTag.EXPRESSION_WEAK],
            assessment_targets: ["能说出付出、花掉、剩下", "能解释为什么不是相加"],
            remediation_targets: ["半句脚手架：付了...，花掉...，剩下..."],
            teaching_actions: [TeachingAction.FEYNMAN, TeachingAction.PROMPT],
          },
        ],
        assessment_templates: [
          question("g1b-shop-d1", direct, "买橡皮2元，付5元，应找回多少钱？", ["g1b-shop-atom-read-price", "g1b-shop-atom-subtract-change"], ["3", "3元", "三元", "5减2"], { kind: "money_yuan", yuan: 3 }),
          question("g1b-shop-d2", direct, "买铅笔3元，付5元，应找回多少钱？", ["g1b-shop-atom-read-paid", "g1b-shop-atom-subtract-change"], ["2", "2元", "二元", "5减3"], { kind: "money_yuan", yuan: 2 }),
          question("g1b-shop-v1", variant, "买尺子6元，付10元，应找回多少钱？", ["g1b-shop-atom-change-means-left", "g1b-shop-atom-subtract-change"], ["4", "4元", "四元", "10减6"], { kind: "money_yuan", yuan: 4 }),
          question("g1b-shop-v2", variant, "买贴纸4元，付10元，应找回多少钱？", ["g1b-shop-atom-change-means-left", "g1b-shop-atom-subtract-change"], ["6", "6元", "六元", "10减4"], { kind: "money_yuan", yuan: 6 }),
          question("g1b-shop-r1", reasoning, "为什么找回的钱要用付的钱减价格？", ["g1b-shop-atom-explain-change"], ["付的钱", "花掉", "剩下", "减"]),
        ],
        remediation_rules: [
          remediation("g1b-shop-r-price", ErrorTag.LANGUAGE_MISREAD, "g1b-shop-atom-read-price", "先只看商品价格。"),
          remediation("g1b-shop-r-paid", ErrorTag.PROCESS_DROP, "g1b-shop-atom-read-paid", "再只看付了多少钱。"),
          remediation("g1b-shop-r-change", ErrorTag.CONCEPT_GAP, "g1b-shop-atom-change-means-left", "用拿走和剩下解释找回。"),
          remediation("g1b-shop-r-explain", ErrorTag.EXPRESSION_WEAK, "g1b-shop-atom-explain-change", "让孩子补一句为什么用减法。"),
        ],
        feynman_prompt: {
          id: "g1b-shop-feynman",
          child_prompt: "你来当小老师，教教我为什么本子4元、付5元，要找回1元。",
          required_signals: ["本子4元", "付了5元", "5减4等于1", "剩下的钱要找回"],
        },
      },
    ],
  },
  {
    id: "g2a-multiplication-i",
    grade_term: "二年级上",
    module_name: "表内乘法（一）",
    textbook_order: 4,
    points: [
      {
        id: "g2a-multiply-several-groups",
        lesson_ids: ["g2a-multiply-meaning"],
        point_name: "几个几",
        child_title: "几个几：一组一组地数",
        teaching_family: "multiplication",
        entry_question: "3盘苹果，每盘4个，一共有几个？",
        atoms: [
          {
            id: "g2a-atom-equal-groups",
            atom_name: "每组同样多",
            is_entry: true,
            can_do_statement: "孩子能看出每一组数量一样。",
            check_keywords: ["每组一样", "同样多", "每盘4个", "每盘一样", "每组4个"],
            dependencies: [],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.LANGUAGE_MISREAD],
            assessment_targets: ["能判断是不是每组同样多", "能说出每组有几个"],
            remediation_targets: ["先圈一圈每一组"],
            teaching_actions: [TeachingAction.MANIPULATIVE, TeachingAction.PROMPT],
          },
          {
            id: "g2a-atom-count-groups",
            atom_name: "数有几组",
            can_do_statement: "孩子能说出有几组。",
            check_keywords: ["3组", "三组", "3盘", "三盘", "有3个组", "有三组"],
            dependencies: [
              makeDependency("g2a-atom-equal-groups", DependencyStrength.STRONG, "乘法来自几个同样多的组。"),
            ],
            common_error_tags: [ErrorTag.PROCESS_DROP],
            assessment_targets: ["能数出组数", "不把每组数量和组数混在一起"],
            remediation_targets: ["用颜色区分组数和每组个数"],
            teaching_actions: [TeachingAction.GUIDED_STEP, TeachingAction.MICRO_PRACTICE],
          },
          {
            id: "g2a-atom-repeat-add",
            atom_name: "用连加表示几个几",
            can_do_statement: "孩子能把3个4说成4+4+4。",
            check_keywords: ["4+4+4", "四加四加四", "3个4", "三个4", "连加"],
            dependencies: [
              makeDependency("g2a-atom-count-groups", DependencyStrength.STRONG, "要先知道有几组，每组几个。"),
            ],
            common_error_tags: [ErrorTag.PROCESS_DROP, ErrorTag.CALCULATION_SLIP],
            assessment_targets: ["能写出或说出连加式", "能算出总数"],
            remediation_targets: ["先用连加，不急着写乘法"],
            teaching_actions: [TeachingAction.GUIDED_STEP, TeachingAction.ERROR_FIX],
          },
          {
            id: "g2a-atom-multiply-expression",
            atom_name: "用乘法表示几个几",
            can_do_statement: "孩子能把3个4写成3x4或4x3，并说出意义。",
            check_keywords: ["3乘4", "4乘3", "3x4", "4x3", "3个4", "乘法"],
            accepts_final_answer: true,
            dependencies: [
              makeDependency("g2a-atom-repeat-add", DependencyStrength.STRONG, "乘法是同数连加的简便写法。"),
            ],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.EXPRESSION_WEAK],
            assessment_targets: ["能把几个几写成乘法", "能解释乘法式的含义"],
            remediation_targets: ["回到连加和圈组图"],
            teaching_actions: [TeachingAction.EXPLAIN, TeachingAction.FEYNMAN],
          },
        ],
        assessment_templates: [
          question("g2a-mul-d1", direct, "4组，每组2个，一共有几个？", ["g2a-atom-equal-groups", "g2a-atom-repeat-add"], ["8", "八", "4个2"], { kind: "number", value: 8 }),
          question("g2a-mul-d2", direct, "5个3可以写成哪个连加式？", ["g2a-atom-count-groups", "g2a-atom-repeat-add"], ["3+3+3+3+3", "五个3", "5个3"], { kind: "repeat_add", addend: 3, count: 5 }),
          question("g2a-mul-v1", variant, "有6行小星星，每行2颗，一共有几颗？", ["g2a-atom-equal-groups", "g2a-atom-multiply-expression"], ["12", "十二", "6个2"], { kind: "number", value: 12 }),
          question("g2a-mul-v2", variant, "2+2+2+2表示几个几？", ["g2a-atom-count-groups", "g2a-atom-repeat-add"], ["4个2", "四个2"], { kind: "groups_of", count: 4, each: 2 }),
          question("g2a-mul-r1", reasoning, "为什么3个4可以用乘法表示？", ["g2a-atom-multiply-expression"], ["同样多", "3个4", "相同加数", "连加"]),
        ],
        remediation_rules: [
          remediation("g2a-mul-r-group", ErrorTag.CONCEPT_GAP, "g2a-atom-equal-groups", "先圈组，确认每组同样多。"),
          remediation("g2a-mul-r-count", ErrorTag.PROCESS_DROP, "g2a-atom-count-groups", "只练分清组数和每组个数。"),
          remediation("g2a-mul-r-say", ErrorTag.EXPRESSION_WEAK, "g2a-atom-multiply-expression", "让孩子用半句说明乘法意思。"),
        ],
        feynman_prompt: {
          id: "g2a-mul-feynman",
          child_prompt: "你来当小老师，教教我3盘苹果每盘4个为什么可以用乘法。",
          required_signals: ["每盘一样多", "有3盘", "每盘4个", "3个4可以写成乘法"],
        },
      },
    ],
  },
];

enrichPilotKnowledgeModules(pilotKnowledgeModules);

function enrichPilotKnowledgeModules(modules) {
  for (const module of modules || []) {
    for (const point of module.points || []) {
      for (const atom of point.atoms || []) {
        const teaching = createPilotAtomTeaching(point, atom);
        atom.teach_prompt = atom.teach_prompt || teaching.teachPrompt;
        atom.repair_prompt = atom.repair_prompt || teaching.repairPrompt;
        atom.no_response_prompt = atom.no_response_prompt || teaching.noResponsePrompt;
        atom.return_prompt = atom.return_prompt || `我们先回到这一小步：${atom.atom_name}。`;
        atom.repeat_sentence = atom.repeat_sentence || teaching.repeatSentence;
        atom.check_keywords = uniquePilotKeywords([...(atom.check_keywords || []), teaching.repeatSentence, ...(teaching.extraKeywords || [])]);
        atom.assessment_targets = uniquePilotKeywords([...(atom.assessment_targets || []), teaching.repeatSentence]);
      }
    }
  }
}

function createPilotAtomTeaching(point, atom) {
  const name = String(atom.atom_name || "");
  const pointName = String(point.point_name || point.child_title || "");
  const key = `${pointName} ${name}`;

  if (/10的分与合/.test(key)) return pilotTeaching("凑十之前，先找10的朋友。9还差1到10。", "9还差1到10", ["10的朋友", "还差1"]);
  if (/看到9先想差1/.test(key)) return pilotTeaching("看到9加几，先不硬算，先想9差1就到10。", "9差1到10", ["拿1给9", "凑成10"]);
  if (/把另一个数拆/.test(key)) return pilotTeaching("要从另一个数里拿出1给9，剩下的不能丢。", "把另一个数拆成1和剩下的数", ["拆数", "剩下"]);
  if (/10再加剩下/.test(key)) return pilotTeaching("9拿到1变成10，再把剩下的数加回来。", "10再加剩下的数", ["10加", "剩下"]);
  if (/说清为什么这样算/.test(key)) return pilotTeaching("会算以后要讲原因：先凑成10，是因为10加几更好算。", "因为10更好算，所以先凑十", ["10更好算", "凑十"]);

  if (/认识元和角/.test(key)) return pilotTeaching("人民币题先看单位。元和角是不同单位，不能直接混着算。", "先看元和角是不是同一种单位", ["元", "角", "单位"]);
  if (/1元等于10角/.test(key)) return pilotTeaching("记住关键关系：1元可以换成10个1角。", "1元等于10角", ["1元", "10角"]);
  if (/1角等于10分/.test(key)) return pilotTeaching("角和分也有关系：1角可以换成10个1分。", "1角等于10分", ["1角", "10分"]);
  if (/把几元换成几十角/.test(key)) return pilotTeaching("几元就有几个10角。3元就是3个10角，也就是30角。", "3元是30角", ["几个10角", "30角"]);
  if (/再加原来的几角/.test(key)) return pilotTeaching("整元换成角以后，还要加上题里原来的几角。", "30角再加5角", ["再加", "原来的几角"]);
  if (/为什么先换单位/.test(key)) return pilotTeaching("能算以后讲原因：元和角单位不同，所以先换成同一种单位。", "因为单位不同，所以先换成角", ["单位不同", "同一种单位"]);

  if (/看清商品价格/.test(key)) return pilotTeaching("购物题先看商品价格，就是东西本身要多少钱。", "先看商品价格", ["价格", "商品"]);
  if (/看清付了多少钱/.test(key)) return pilotTeaching("再看付出去多少钱。价格和付的钱要分开放。", "再看付了多少钱", ["付了", "给了"]);
  if (/找回就是剩下的钱/.test(key)) return pilotTeaching("找回的钱，是付的钱里花掉价格以后剩下的部分。", "找回是剩下的钱", ["找回", "剩下"]);
  if (/用减法算找回/.test(key)) return pilotTeaching("找回要用付的钱减商品价格。", "付的钱减价钱", ["减法", "付的钱减价格"]);
  if (/为什么用减法/.test(key)) return pilotTeaching("讲原因时说：付了5元，花掉4元，剩下1元要找回。", "因为找回是剩下的钱，所以用减法", ["剩下", "用减法"]);

  if (/每组同样多/.test(key)) return pilotTeaching("乘法先看每组是不是同样多。每组一样多，才能说几个几。", "每组同样多", ["同样多", "每组"]);
  if (/数有几组/.test(key)) return pilotTeaching("再数一共有几组，组数和每组个数要分清。", "再看有几组", ["组数", "几组"]);
  if (/用连加表示几个几/.test(key)) return pilotTeaching("几个几可以先写成同数连加。3个4就是4+4+4。", "几个几可以写成连加", ["连加", "几个几"]);
  if (/用乘法表示几个几/.test(key)) return pilotTeaching("同数连加可以写成乘法，这样更简便。", "几个几可以用乘法表示", ["乘法", "同数连加"]);

  const repeat = atom.check_keywords?.[0] || name || "先说当前小台阶";
  return pilotTeaching(`这一步只看「${name}」，不用一次讲完整题。`, repeat, [name]);
}

function pilotTeaching(explain, repeatSentence, extraKeywords = []) {
  const repeat = cleanPilotSentence(repeatSentence || "");
  return {
    teachPrompt: createPilotTeachPrompt(explain, repeat),
    repairPrompt: createPilotRepairPrompt(explain, repeat),
    noResponsePrompt: createPilotNoResponsePrompt(explain, repeat),
    repeatSentence: repeat,
    extraKeywords,
  };
}

function createPilotTeachPrompt(explain, repeat) {
  const cleanExplain = cleanPilotSentence(explain);
  const cleanRepeat = cleanPilotSentence(repeat);
  const variants = [
    `先看一个小方法：${cleanExplain} 接下来请你说：${cleanRepeat}。`,
    `这一步先听老师讲清楚，不急着算完整题。${cleanExplain} 请用自己的话说：${cleanRepeat}。`,
    `${cleanExplain} 现在只回答这一句：${cleanRepeat}。`,
    `先看图和题怎么连起来：${cleanExplain} 你试着说：${cleanRepeat}。`,
    `乐之老师给你半句提示：${cleanExplain} 请跟着说：${cleanRepeat}。`,
    `把眼睛放到这一小步：${cleanExplain} 请跟着说：${cleanRepeat}。`,
    `这句话用得上：${cleanExplain} 请回答：${cleanRepeat}。`,
    `如果一下子想不出，先听老师示范：${cleanExplain} 请跟着说：${cleanRepeat}。`,
    `我们先练眼前这一步。${cleanExplain} 请说：${cleanRepeat}。`,
    `先把方法说短一点：${cleanExplain} 请跟着说：${cleanRepeat}。`,
  ];
  return pickPilotLine(variants, `${cleanExplain}-${cleanRepeat}-teach`);
}

function createPilotRepairPrompt(explain, repeat) {
  const cleanExplain = cleanPilotSentence(explain);
  const cleanRepeat = cleanPilotSentence(repeat);
  const cue = cleanRepeat.split(/[，,；;、\s]+/).filter(Boolean).slice(0, 2).join("、") || cleanRepeat;
  const variants = [
    `刚才差一点。我们退回这一步：${cleanExplain} 先说「${cue}」就行。`,
    `不重做整题，只补这个小地方：${cleanRepeat}。`,
    `乐之老师把问题缩小：${cleanExplain} 请先说「${cue}」。`,
    `先别猜最后答案，回到方法：${cleanRepeat}。`,
    `这一步还没稳。再看一次：${cleanExplain} 然后请说出眼前这个小答案。`,
  ];
  return pickPilotLine(variants, `${cleanExplain}-${cleanRepeat}-repair`);
}

function createPilotNoResponsePrompt(explain, repeat) {
  const cleanExplain = cleanPilotSentence(explain);
  const cleanRepeat = cleanPilotSentence(repeat);
  const variants = [
    `说不出来也正常，老师先带一遍：${cleanExplain} 请跟着说：${cleanRepeat}。`,
    `这一步先不用自己想长句。老师说：${cleanRepeat}。请跟着说：${cleanRepeat}。`,
    `我们先把方法放稳：${cleanExplain} 请跟着说：${cleanRepeat}。`,
    `没关系，先看老师怎么说：${cleanRepeat}。下一轮再让你自己讲。`,
    `先不答整题，只练这个意思：${cleanRepeat}。`,
  ];
  return pickPilotLine(variants, `${cleanExplain}-${cleanRepeat}-no-response`);
}

function cleanPilotSentence(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[。！？.!?]+$/, "");
}

function pickPilotLine(items, key) {
  const text = String(key || "");
  const index = Array.from(text).reduce((sum, char) => sum + char.codePointAt(0), 0) % items.length;
  return items[index];
}

function uniquePilotKeywords(values) {
  return Array.from(new Set((values || []).map((item) => String(item || "").trim()).filter(Boolean)));
}

function question(id, dimension, prompt, atomIds, expectedKeywords = [], expected = {}) {
  return {
    id,
    dimension,
    prompt,
    expected_keywords: expectedKeywords,
    expected,
    primary_atom_id: atomIds[0],
    secondary_atom_ids: atomIds.slice(1),
  };
}

function remediation(id, errorTag, atomId, strategy) {
  return {
    id,
    error_tag: errorTag,
    target_atom_id: atomId,
    strategy,
  };
}
