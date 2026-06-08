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
        entry_question: "9+4可以怎样算得更快？",
        atoms: [
          {
            id: "g1a-atom-number-bond-10",
            atom_name: "10的分与合",
            is_entry: true,
            can_do_statement: "孩子能说出几和几能合成10。",
            dependencies: [],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.NO_RESPONSE],
            assessment_targets: ["能补出10的朋友数", "能把10看成两个数合起来"],
            remediation_targets: ["用手指或圆点补到10"],
            teaching_actions: [TeachingAction.MANIPULATIVE, TeachingAction.MICRO_PRACTICE],
          },
          {
            id: "g1a-atom-make-ten-from-9",
            atom_name: "看到9先想差1到10",
            can_do_statement: "孩子看到9加几时，能先想到9还差1就是10。",
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
          question("g1a-add-9-plus-d1", direct, "9+3等于几？你可以先凑成10。", ["g1a-atom-make-ten-from-9", "g1a-atom-split-addend", "g1a-atom-combine-ten-rest"], ["12", "十二", "10加2"]),
          question("g1a-add-9-plus-d2", direct, "9+6等于几？", ["g1a-atom-make-ten-from-9", "g1a-atom-split-addend", "g1a-atom-combine-ten-rest"], ["15", "十五", "10加5"]),
          question("g1a-add-9-plus-v1", variant, "有9颗糖，又来了5颗，一共有几颗？", ["g1a-atom-make-ten-from-9", "g1a-atom-combine-ten-rest"], ["14", "十四", "10加4"]),
          question("g1a-add-9-plus-v2", variant, "算9+7时，7要拆成1和几？", ["g1a-atom-split-addend"], ["6", "六", "1和6"]),
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
        entry_question: "3元5角一共是几角？",
        atoms: [
          {
            id: "g1b-atom-know-yuan-jiao",
            atom_name: "认识元和角",
            is_entry: true,
            can_do_statement: "孩子能分清元和角是人民币的不同单位。",
            dependencies: [],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.LANGUAGE_MISREAD],
            assessment_targets: ["能认出元和角", "能听懂几元几角"],
            remediation_targets: ["用真实购物情境重说题意"],
            teaching_actions: [TeachingAction.EXAMPLE, TeachingAction.MANIPULATIVE],
          },
          {
            id: "g1b-atom-one-yuan-ten-jiao",
            atom_name: "1元等于10角",
            can_do_statement: "孩子能说出1元就是10角。",
            dependencies: [
              makeDependency("g1b-atom-know-yuan-jiao", DependencyStrength.STRONG, "不分清单位，就不能做换算。"),
            ],
            common_error_tags: [ErrorTag.CONCEPT_GAP, ErrorTag.PREREQUISITE_GAP],
            assessment_targets: ["能说出1元=10角", "能把2元换成20角"],
            remediation_targets: ["画10个1角组成1元"],
            teaching_actions: [TeachingAction.EXPLAIN, TeachingAction.MICRO_PRACTICE],
          },
          {
            id: "g1b-atom-convert-yuan-to-jiao",
            atom_name: "把几元换成几十角",
            can_do_statement: "孩子能把3元换成30角。",
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
          question("g1b-money-d1", direct, "2元是几角？", ["g1b-atom-one-yuan-ten-jiao", "g1b-atom-convert-yuan-to-jiao"], ["20角", "二十角", "20"]),
          question("g1b-money-d2", direct, "4元3角一共是几角？", ["g1b-atom-convert-yuan-to-jiao", "g1b-atom-add-leftover-jiao"], ["43角", "四十三角", "43"]),
          question("g1b-money-v1", variant, "买铅笔要1元6角，如果全用角来数，是几角？", ["g1b-atom-convert-yuan-to-jiao", "g1b-atom-add-leftover-jiao"], ["16角", "十六角", "16"]),
          question("g1b-money-v2", variant, "25角里面有几元几角？", ["g1b-atom-one-yuan-ten-jiao", "g1b-atom-convert-yuan-to-jiao"], ["2元5角", "二元五角"]),
          question("g1b-money-r1", reasoning, "为什么3元5角不能直接说成35元？", ["g1b-atom-explain-same-unit"], ["单位不同", "先换成角", "元和角不一样"]),
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
        entry_question: "3盘苹果，每盘4个，一共有几个？",
        atoms: [
          {
            id: "g2a-atom-equal-groups",
            atom_name: "每组同样多",
            is_entry: true,
            can_do_statement: "孩子能看出每一组数量一样。",
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
          question("g2a-mul-d1", direct, "4组，每组2个，一共有几个？", ["g2a-atom-equal-groups", "g2a-atom-repeat-add"], ["8", "八", "4个2"]),
          question("g2a-mul-d2", direct, "5个3可以写成哪个连加式？", ["g2a-atom-count-groups", "g2a-atom-repeat-add"], ["3+3+3+3+3", "五个3", "5个3"]),
          question("g2a-mul-v1", variant, "有6行小星星，每行2颗，一共有几颗？", ["g2a-atom-equal-groups", "g2a-atom-multiply-expression"], ["12", "十二", "6个2"]),
          question("g2a-mul-v2", variant, "2+2+2+2表示几个几？", ["g2a-atom-count-groups", "g2a-atom-repeat-add"], ["4个2", "四个2"]),
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

function question(id, dimension, prompt, atomIds, expectedKeywords = []) {
  return {
    id,
    dimension,
    prompt,
    expected_keywords: expectedKeywords,
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
