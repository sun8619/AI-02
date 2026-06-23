import {
  DependencyStrength,
  ErrorTag,
  MasteryDimension,
  TeachingState,
  getEntryAtom,
  getPointAtoms,
  getPrerequisites,
} from "./knowledge-model.js";

const MAX_SAME_LEVEL_FAILS = 2;

export function createLearningSession({ pointId, atomId, sourceAtomId = "" }) {
  return {
    point_id: pointId,
    current_state: TeachingState.DIAGNOSE_ENTRY,
    current_atom_id: atomId,
    source_atom_id: sourceAtomId,
    fallback_atom_id: "",
    fallback_reason: "",
    return_to_atom_id: "",
    consecutive_fail_count: 0,
    split_depth: 0,
    completed_atom_ids: [],
    assessment_index: 0,
    assessment_records: [],
    remediation_records: [],
    feynman_records: [],
    stuck_events: [],
  };
}

export function findKnowledgePointForLesson(graph, lesson) {
  const lessonId = String(lesson?.id || "");
  const node = normalizeText(lesson?.node || "");
  const lessonName = normalizeText(lesson?.lessonName || lesson?.lesson || "");

  for (const point of graph.pointById.values()) {
    if (point.lesson_ids?.includes(lessonId)) return point;
    if (lessonId && point.id === lessonId) return point;
    const pointName = normalizeText(`${point.point_name} ${point.child_title || ""}`);
    if (node && pointName.includes(node)) return point;
    if (lessonName && pointName.includes(lessonName)) return point;
  }

  return null;
}

export function runTeachingTurn({ graph, lesson, childText, session, inputType = "text" }) {
  const point = findKnowledgePointForLesson(graph, lesson);
  if (!point) return null;

  const entryAtom = getEntryAtom(graph, point.id);
  const currentSession =
    normalizeSession(session, point.id, entryAtom?.id) || createLearningSession({ pointId: point.id, atomId: entryAtom?.id || "" });
  const text = String(childText || "").trim();
  const currentAtom = graph.atomById.get(currentSession.current_atom_id) || entryAtom;

  if (!text) {
    return handleFailure({
      graph,
      point,
      session: currentSession,
      atom: currentAtom,
      errorTag: ErrorTag.NO_RESPONSE,
      inputType,
    });
  }

  if (currentSession.current_state === TeachingState.FEYNMAN_EXPLAIN || currentSession.current_state === TeachingState.FEYNMAN_EVAL) {
    return evaluateFeynman({ point, session: currentSession, text, inputType });
  }

  if (currentSession.current_state === TeachingState.PRACTICE_SET || currentSession.current_state === TeachingState.REMEDIATION_RECHECK) {
    return evaluateAssessment({ graph, point, session: currentSession, text, inputType });
  }

  if (currentSession.current_state === TeachingState.REMEDIATION_TEACH) {
    const currentAssessment = getCurrentAssessment(point, currentSession);
    if (currentAssessment) {
      const assessmentDiagnosis = evaluateAssessmentAnswer(text, currentAssessment, point);
      if (assessmentDiagnosis.passed) {
        return evaluateAssessment({ graph, point, session: { ...currentSession, current_state: TeachingState.PRACTICE_SET }, text, inputType });
      }
    }
  }

  const diagnosis = classifyChildAttempt({ point, atom: currentAtom, text, lesson });
  if (diagnosis.passed) {
    if (currentSession.current_state === TeachingState.REMEDIATION_TEACH) {
      const currentAssessment = getCurrentAssessment(point, currentSession);
      if (currentAssessment) {
        return returnToAssessmentQuestion({ point, session: currentSession, atom: currentAtom, assessment: currentAssessment, inputType });
      }
    }
    return advanceAtomOrPractice({ graph, point, session: currentSession, atom: currentAtom, inputType });
  }

  return handleFailure({
    graph,
    point,
    session: currentSession,
    atom: currentAtom,
    errorTag: diagnosis.error_tag,
    inputType,
  });
}

function normalizeSession(session, pointId, atomId) {
  if (!session || typeof session !== "object" || session.point_id !== pointId) return null;
  return {
    ...createLearningSession({ pointId, atomId }),
    ...session,
    completed_atom_ids: Array.isArray(session.completed_atom_ids) ? session.completed_atom_ids : [],
    assessment_records: Array.isArray(session.assessment_records) ? session.assessment_records : [],
    remediation_records: Array.isArray(session.remediation_records) ? session.remediation_records : [],
    feynman_records: Array.isArray(session.feynman_records) ? session.feynman_records : [],
    stuck_events: Array.isArray(session.stuck_events) ? session.stuck_events : [],
  };
}

function classifyChildAttempt({ point, atom, text, lesson }) {
  const normalized = normalizeText(text);
  if (looksLikeNoResponse(normalized) || looksInvalidForLearning(normalized)) {
    return { passed: false, error_tag: ErrorTag.NO_RESPONSE };
  }

  const answerSignals = lesson?.answerSignals || lesson?.answer || {};
  const atomHit = includesAny(normalized, atom?.check_keywords || []);
  const targetHit = includesAny(normalized, atom?.assessment_targets || []);
  const finalAnswerHit = atom?.accepts_final_answer && includesAny(normalized, answerSignals.answerKeywords || []);
  const processHit =
    atom?.accepts_final_answer &&
    (includesAny(normalized, answerSignals.attemptKeywords || []) || includesAny(normalized, answerSignals.whyKeywords || []));

  if (atomHit || targetHit || finalAnswerHit || processHit) {
    return { passed: true, error_tag: "" };
  }

  if (mentionsOnlyResult(normalized, answerSignals.resultKeywords || []) && !processHit && !atom?.accepts_final_answer) {
    return { passed: false, error_tag: ErrorTag.EXPRESSION_WEAK };
  }

  if (hasPossibleCalculationSlip(normalized, answerSignals.answerKeywords || [])) {
    return { passed: false, error_tag: ErrorTag.CALCULATION_SLIP };
  }

  if (looksOffTopic(normalized, point, atom, answerSignals)) {
    return { passed: false, error_tag: ErrorTag.OFF_TOPIC };
  }

  if (mentionsTopicButMissesUnit(normalized, point)) {
    return { passed: false, error_tag: ErrorTag.PROCESS_DROP };
  }

  return { passed: false, error_tag: atom?.common_error_tags?.[0] || ErrorTag.CONCEPT_GAP };
}

function advanceAtomOrPractice({ graph, point, session, atom, inputType }) {
  const atoms = getPointAtoms(graph, point.id);
  const completed = unique(session.completed_atom_ids.concat(atom?.id || []));
  const currentIndex = atoms.findIndex((item) => item.id === atom?.id);
  const finalAtomId = atoms.at(-1)?.id;
  const nextAtom = atoms
    .slice(Math.max(0, currentIndex + 1))
    .find((item) => !completed.includes(item.id) && item.id !== finalAtomId);

  if (nextAtom) {
    const nextSession = {
      ...session,
      current_state: TeachingState.GUIDED_STEP,
      current_atom_id: nextAtom.id,
      completed_atom_ids: completed,
      consecutive_fail_count: 0,
      split_depth: 0,
    };
    return buildResult({
      point,
      session: nextSession,
      phase: "guiding",
      aiContext: `孩子已通过「${atom?.atom_name || point.point_name}」，进入下一个知识原子。`,
      aiMessage: makeTeachMessage(nextAtom),
      currentStep: `小台阶：${nextAtom.atom_name}`,
      evidenceSignal: "通过一个小台阶",
      evidenceText: `孩子能做到：${atom?.can_do_statement || point.point_name}`,
      bestStrategy: "小台阶",
      inputType,
    });
  }

  const firstQuestion = point.assessment_templates?.[0];
  const nextSession = {
    ...session,
    current_state: TeachingState.PRACTICE_SET,
    current_atom_id: firstQuestion?.primary_atom_id || atom?.id || session.current_atom_id,
    completed_atom_ids: completed,
    consecutive_fail_count: 0,
    assessment_index: 0,
  };
  return buildResult({
    point,
    session: nextSession,
    phase: "guiding",
    aiContext: "进入掌握检验。先做直接题，再做变式题和说理题。",
    aiMessage: makeAssessmentPromptMessage(firstQuestion, "我们来做一个小闯关。第一题："),
    currentStep: `闯关检验 1/${point.assessment_templates?.length || 1}`,
    evidenceSignal: "进入掌握检验",
    evidenceText: "当前知识点的核心小台阶已走完，开始做直接题、变式题和说理题。",
    bestStrategy: "闯关检验",
    inputType,
    assessment: firstQuestion || null,
  });
}

function evaluateAssessment({ graph, point, session, text, inputType }) {
  const templates = point.assessment_templates || [];
  const current = templates[session.assessment_index] || templates[0];
  const diagnosis = evaluateAssessmentAnswer(text, current, point);
  const passed = diagnosis.passed;
  const record = {
    template_id: current?.id || "",
    dimension: current?.dimension || MasteryDimension.DIRECT,
    primary_atom_id: current?.primary_atom_id || session.current_atom_id,
    secondary_atom_ids: current?.secondary_atom_ids || [],
    answer_text: text,
    passed,
    error_tag: diagnosis.error_tag || "",
    confidence: diagnosis.confidence || 0,
    evidence: diagnosis.evidence || "",
  };
  const records = session.assessment_records.concat(record);

  if (!passed) {
    const errorTag = diagnosis.error_tag || ErrorTag.PROCESS_DROP;
    const shouldCountAsRemediation = ![ErrorTag.NO_RESPONSE, ErrorTag.OFF_TOPIC, ErrorTag.AMBIGUOUS_RESPONSE].includes(errorTag);
    const targetAtomId = current?.primary_atom_id || session.current_atom_id;
    const targetAtom = graph.atomById.get(targetAtomId);
    const nextSession = {
      ...session,
      current_state: TeachingState.ERROR_ANALYSIS,
      current_atom_id: targetAtomId,
      assessment_records: records,
      remediation_records: shouldCountAsRemediation ? session.remediation_records.concat({
        source_atom_id: session.current_atom_id,
        target_atom_id: targetAtomId,
        reason: errorTag,
        assessment_template_id: current?.id || "",
        attempt_count: countRemediations(session, targetAtomId) + 1,
      }) : session.remediation_records,
      stuck_events: session.stuck_events.concat({
        atom_id: targetAtomId,
        error_tag: errorTag,
        state: TeachingState.ERROR_ANALYSIS,
      }),
    };

    const fallback = shouldCountAsRemediation ? shouldFallbackToPrerequisite(graph, nextSession, targetAtomId) : null;
    if (fallback) return fallbackToPrerequisite({ graph, point, session: nextSession, atom: targetAtom, fallback, inputType });

    nextSession.current_state = TeachingState.REMEDIATION_TEACH;
    return buildResult({
      point,
      session: nextSession,
      phase: "repair",
      aiContext: `掌握检验中发现一个小地方没稳：${errorTag}。精确回讲对应知识原子。`,
      aiMessage: makeAssessmentRepairMessage(current, targetAtom, point, diagnosis),
      currentStep: `重讲：${targetAtom?.atom_name || point.point_name}`,
      evidenceSignal: "错题映射到知识原子",
      evidenceText: diagnosis.evidence || `错题对应 ${targetAtom?.atom_name || targetAtomId}，不整章重讲。`,
      bestStrategy: "精准重讲",
      inputType,
    });
  }

  const nextIndex = session.assessment_index + 1;
  if (nextIndex < templates.length) {
    const nextQuestion = templates[nextIndex];
    return buildResult({
      point,
      session: {
        ...session,
        current_state: TeachingState.PRACTICE_SET,
        current_atom_id: nextQuestion.primary_atom_id || session.current_atom_id,
        assessment_index: nextIndex,
        assessment_records: records,
      },
      phase: "guiding",
      aiContext: "继续掌握检验。",
      aiMessage: makeAssessmentPromptMessage(nextQuestion, "这一题过了。下一题："),
      currentStep: `闯关检验 ${nextIndex + 1}/${templates.length}`,
      evidenceSignal: "检验题通过",
      evidenceText: `孩子通过 ${current?.prompt || "当前检验题"}`,
      bestStrategy: "闯关检验",
      inputType,
      assessment: nextQuestion,
    });
  }

  return buildResult({
    point,
    session: {
      ...session,
      current_state: TeachingState.FEYNMAN_EXPLAIN,
      assessment_records: records,
      assessment_index: templates.length,
    },
    phase: "teachback",
    aiContext: "掌握检验全对，进入费曼复述。",
    aiMessage: point.feynman_prompt?.child_prompt || `你来当小老师，讲讲${point.point_name}怎么想。`,
    currentStep: "你来当小老师",
    feynmanStatus: "等待孩子讲",
    evidenceSignal: "掌握检验全对",
    evidenceText: "直接题、变式题和说理题已通过，进入讲给老师听。",
    bestStrategy: "费曼复述",
    inputType,
  });
}

function evaluateFeynman({ point, session, text, inputType }) {
  const normalized = normalizeText(text);
  const requiredSignals = point.feynman_prompt?.required_signals || [];
  const hitCount = requiredSignals.filter((signal) => normalized.includes(normalizeText(signal))).length;
  const passed = hitCount >= Math.max(2, Math.ceil(requiredSignals.length * 0.6));
  const record = {
    prompt_id: point.feynman_prompt?.id || "",
    answer_text: text,
    required_signal_count: requiredSignals.length,
    hit_count: hitCount,
    passed,
  };

  if (passed) {
    return buildResult({
      point,
      session: {
        ...session,
        current_state: TeachingState.MASTERED,
        feynman_records: session.feynman_records.concat(record),
      },
      phase: "summary",
      aiContext: "孩子通过费曼复述，知识点标记为稳定掌握。",
      aiMessage: "你讲清楚了步骤，也讲到了为什么。这个知识点更稳了。",
      currentStep: "完成：能用自己的话讲",
      feynmanStatus: "能讲清楚",
      evidenceSignal: "费曼复述通过",
      evidenceText: `孩子讲中了 ${hitCount}/${requiredSignals.length} 个关键点。`,
      bestStrategy: "费曼复述",
      inputType,
    });
  }

  return buildResult({
    point,
    session: {
      ...session,
      current_state: TeachingState.FEYNMAN_EXPLAIN,
      feynman_records: session.feynman_records.concat(record),
      consecutive_fail_count: session.consecutive_fail_count + 1,
    },
    phase: "repair",
    aiContext: "孩子会做但讲不完整，进入半句脚手架。",
    aiMessage: makeFeynmanScaffold(requiredSignals),
    currentStep: "再讲一次：补一句为什么",
    feynmanStatus: "会做但讲不清",
    evidenceSignal: "费曼复述未完整",
    evidenceText: `孩子只讲中了 ${hitCount}/${requiredSignals.length} 个关键点，需要半句脚手架。`,
    bestStrategy: "半句脚手架",
    inputType,
  });
}

function handleFailure({ graph, point, session, atom, errorTag, inputType }) {
  const nextFailCount = session.consecutive_fail_count + 1;
  const shouldSplit = [ErrorTag.NO_RESPONSE, ErrorTag.PROCESS_DROP, ErrorTag.EXPRESSION_WEAK].includes(errorTag);
  const prerequisites = getPrerequisites(graph, atom?.id || session.current_atom_id, DependencyStrength.STRONG);

  if (errorTag === ErrorTag.PREREQUISITE_GAP || (nextFailCount > MAX_SAME_LEVEL_FAILS && prerequisites.length)) {
    return fallbackToPrerequisite({
      graph,
      point,
      session: { ...session, consecutive_fail_count: nextFailCount },
      atom,
      fallback: prerequisites[0],
      inputType,
      reason: errorTag,
    });
  }

  const nextState = shouldSplit || nextFailCount > MAX_SAME_LEVEL_FAILS ? TeachingState.SPLIT_ATOM : TeachingState.REMEDIATION_TEACH;
  const nextSession = {
    ...session,
    current_state: nextState,
    consecutive_fail_count: nextFailCount,
    split_depth: nextState === TeachingState.SPLIT_ATOM ? session.split_depth + 1 : session.split_depth,
    stuck_events: session.stuck_events.concat({
      atom_id: atom?.id || session.current_atom_id,
      error_tag: errorTag,
      state: nextState,
    }),
  };

  return buildResult({
    point,
    session: nextSession,
    phase: "repair",
    aiContext: `孩子卡住原因：${errorTag}。不要重复原话，缩小台阶。`,
    aiMessage: makeRepairMessage(atom, errorTag, point),
    currentStep: nextState === TeachingState.SPLIT_ATOM ? `拆小：${atom?.atom_name || point.point_name}` : `重讲：${atom?.atom_name || point.point_name}`,
    evidenceSignal: errorTagToChildSignal(errorTag),
    evidenceText: `系统判断不是简单答错，而是 ${errorTag}，已切换策略。`,
    bestStrategy: nextState === TeachingState.SPLIT_ATOM ? "继续细拆" : "精准重讲",
    inputType,
  });
}

function fallbackToPrerequisite({ point, session, atom, fallback, inputType, reason = ErrorTag.PREREQUISITE_GAP }) {
  const nextSession = {
    ...session,
    current_state: TeachingState.FALLBACK_PREREQUISITE,
    current_atom_id: fallback.id,
    source_atom_id: atom?.id || session.current_atom_id,
    fallback_atom_id: fallback.id,
    fallback_reason: reason,
    return_to_atom_id: atom?.id || session.current_atom_id,
    consecutive_fail_count: 0,
    stuck_events: session.stuck_events.concat({
      atom_id: atom?.id || session.current_atom_id,
      fallback_atom_id: fallback.id,
      error_tag: reason,
      state: TeachingState.FALLBACK_PREREQUISITE,
    }),
  };

  return buildResult({
    point,
    session: nextSession,
    phase: "repair",
    aiContext: "孩子卡在强前置知识，先补一个前置小台阶，补完回主线。",
    aiMessage: makeTeachMessage(fallback),
    currentStep: `先补：${fallback.atom_name}`,
    evidenceSignal: "回溯前置知识",
    evidenceText: `从 ${atom?.atom_name || session.current_atom_id} 回溯到 ${fallback.atom_name}。`,
    bestStrategy: "前置回溯",
    inputType,
  });
}

function shouldFallbackToPrerequisite(graph, session, atomId) {
  if (countRemediations(session, atomId) < 2) return null;
  return getPrerequisites(graph, atomId, DependencyStrength.STRONG)[0] || null;
}

function countRemediations(session, atomId) {
  return session.remediation_records.filter((record) => record.target_atom_id === atomId).length;
}

function getCurrentAssessment(point, session) {
  const templates = point.assessment_templates || [];
  return templates[session.assessment_index] || null;
}

function makeAssessmentPromptMessage(template, prefix = "") {
  if (!template) return `${prefix}先看这一小问。`;
  if (template.id === "g1b-money-r1" || template.primary_atom_id === "g1b-atom-explain-same-unit") {
    return makeMoneyReasonRepeatMessage(prefix);
  }
  return `${prefix}${template.prompt}`;
}

function makeMoneyReasonRepeatMessage(prefix = "") {
  return `${prefix}这句老师先说，你跟着说一遍：因为元和角不是同一种单位，所以要先把元换成角。`;
}

function returnToAssessmentQuestion({ point, session, atom, assessment, inputType }) {
  const nextSession = {
    ...session,
    current_state: TeachingState.PRACTICE_SET,
    current_atom_id: assessment.primary_atom_id || session.current_atom_id,
    consecutive_fail_count: 0,
    split_depth: 0,
  };
  return buildResult({
    point,
    session: nextSession,
    phase: "guiding",
    aiContext: "补救小台阶已通过，回到刚才没稳的题，不继续跑偏。",
    aiMessage: makeAssessmentPromptMessage(assessment, "这一小步补上了。回到刚才这题："),
    currentStep: `回到闯关：${assessment.prompt}`,
    evidenceSignal: "补完后回到原题",
    evidenceText: `孩子已补上 ${atom?.atom_name || point.point_name}，回到 ${assessment.prompt}`,
    bestStrategy: "回到原题",
    inputType,
    assessment,
  });
}

function evaluateAssessmentAnswer(text, template, point) {
  const normalized = normalizeText(text);
  if (!template) return makeDiagnosis(false, ErrorTag.PROCESS_DROP, 0.1, "没有找到当前检验题。");
  if (looksLikeNoResponse(normalized) || looksInvalidForLearning(normalized)) {
    return makeDiagnosis(false, ErrorTag.NO_RESPONSE, 0.9, "孩子没有给出可判定答案。");
  }
  if (looksOffTopicAssessment(normalized, template, point)) {
    return makeDiagnosis(false, ErrorTag.OFF_TOPIC, 0.8, "孩子这句话没有回答当前题目。");
  }

  const structured = evaluateStructuredAnswer(text, template);
  if (structured) return structured;

  const expectedSignals = template.expected_keywords || [];
  if (includesAny(normalized, expectedSignals)) return makeDiagnosis(true, "", 0.86, "命中当前题的标准答案表达。");
  if (template.dimension === MasteryDimension.REASONING) {
    const reasoningPassed = includesAny(normalized, point.feynman_prompt?.required_signals || []);
    return reasoningPassed
      ? makeDiagnosis(true, "", 0.82, "说理题命中了关键原因。")
      : makeDiagnosis(false, ErrorTag.EXPRESSION_WEAK, 0.62, "孩子还没有说出关键原因。");
  }

  if (hasNumberishAnswer(normalized)) {
    return makeDiagnosis(false, ErrorTag.CALCULATION_SLIP, 0.7, "孩子给了数字，但和当前题期待答案不一致。");
  }
  return makeDiagnosis(false, ErrorTag.AMBIGUOUS_RESPONSE, 0.45, "孩子的回答和当前题有关，但还不够清楚。");
}

function evaluateStructuredAnswer(text, template) {
  const expected = template?.expected || {};
  if (!expected.kind) return null;

  const normalized = normalizeText(text);
  const numbers = extractNumbers(normalized);
  const expressionValue = evaluateSimpleExpression(normalized);

  if (expected.kind === "number") {
    if (numberMatches(numbers, expected.value) || expressionValue === expected.value) {
      return makeDiagnosis(true, "", 0.9, `答案是 ${expected.value}，数值匹配。`);
    }
    if (includesAny(normalized, template.expected_keywords || [])) {
      return makeDiagnosis(true, "", 0.82, "命中当前题允许的等价表达。");
    }
    return numbers.length || expressionValue !== null
      ? makeDiagnosis(false, ErrorTag.CALCULATION_SLIP, 0.78, `孩子给了数字，但不是 ${expected.value}。`)
      : makeDiagnosis(false, ErrorTag.AMBIGUOUS_RESPONSE, 0.45, "没有听到明确数字答案。");
  }

  if (expected.kind === "money_jiao") {
    const totalJiao = parseJiaoAnswer(normalized, expressionValue);
    if (totalJiao === expected.totalJiao) {
      return makeDiagnosis(true, "", 0.92, `答案换成了 ${expected.totalJiao}角。`);
    }
    if (mentionsYuanAndJiao(normalized) && !numberMatches(numbers, expected.totalJiao)) {
      return makeDiagnosis(false, ErrorTag.PROCESS_DROP, 0.76, "孩子还停在几元几角，没有换成一共几角。");
    }
    return totalJiao !== null || numbers.length
      ? makeDiagnosis(false, ErrorTag.CALCULATION_SLIP, 0.76, `孩子给了数字，但不是 ${expected.totalJiao}角。`)
      : makeDiagnosis(false, ErrorTag.AMBIGUOUS_RESPONSE, 0.45, "没有听到明确的几角答案。");
  }

  if (expected.kind === "money_yuan") {
    const yuan = parseYuanAnswer(normalized, expressionValue);
    if (yuan === expected.yuan) {
      return makeDiagnosis(true, "", 0.9, `答案是 ${expected.yuan}元。`);
    }
    return yuan !== null || numbers.length
      ? makeDiagnosis(false, ErrorTag.CALCULATION_SLIP, 0.76, `孩子给了数字，但不是 ${expected.yuan}元。`)
      : makeDiagnosis(false, ErrorTag.AMBIGUOUS_RESPONSE, 0.45, "没有听到明确的几元答案。");
  }

  if (expected.kind === "money_decompose") {
    const parts = parseMoneyParts(normalized);
    if (parts && parts.yuan === expected.yuan && parts.jiao === expected.jiao) {
      return makeDiagnosis(true, "", 0.94, `孩子拆成了 ${expected.yuan}元${expected.jiao}角。`);
    }
    if (parseJiaoAnswer(normalized, expressionValue) === expected.totalJiao) {
      return makeDiagnosis(false, ErrorTag.PROCESS_DROP, 0.82, "孩子说出了总角数，但还没有拆成几元几角。");
    }
    return parts || numbers.length
      ? makeDiagnosis(false, ErrorTag.CALCULATION_SLIP, 0.72, "孩子给了钱数，但没有拆对几元几角。")
      : makeDiagnosis(false, ErrorTag.AMBIGUOUS_RESPONSE, 0.45, "没有听到明确的几元几角。");
  }

  if (expected.kind === "repeat_add") {
    const repeated = parseRepeatAdd(normalized);
    if (repeated && repeated.addend === expected.addend && repeated.count === expected.count) {
      return makeDiagnosis(true, "", 0.9, "连加式匹配。");
    }
    if (containsGroupPhrase(normalized, expected.count, expected.addend)) {
      return makeDiagnosis(true, "", 0.78, "孩子说出了几个几，可以继续巩固连加写法。");
    }
    return hasNumberishAnswer(normalized)
      ? makeDiagnosis(false, ErrorTag.PROCESS_DROP, 0.7, "孩子说了数字，但还没有写出连加式。")
      : makeDiagnosis(false, ErrorTag.AMBIGUOUS_RESPONSE, 0.45, "没有听到清楚的连加式。");
  }

  if (expected.kind === "groups_of") {
    if (containsGroupPhrase(normalized, expected.count, expected.each)) {
      return makeDiagnosis(true, "", 0.9, "孩子说出了正确的几个几。");
    }
    return hasNumberishAnswer(normalized)
      ? makeDiagnosis(false, ErrorTag.PROCESS_DROP, 0.7, "孩子说了数字，但还没有说清几个几。")
      : makeDiagnosis(false, ErrorTag.AMBIGUOUS_RESPONSE, 0.45, "没有听到清楚的几个几。");
  }

  return null;
}

function makeDiagnosis(passed, errorTag = "", confidence = 0.5, evidence = "") {
  return { passed, error_tag: errorTag, confidence, evidence };
}

function makeClarifyAssessmentMessage(template, atom, point) {
  const prompt = normalizeText(template?.prompt || "");
  const atomName = atom?.atom_name || "";
  if (template?.id === "g1b-money-r1" || atomName.includes("说清为什么先换单位")) {
    return makeMoneyReasonRepeatMessage("我没听清。");
  }
  if (prompt.includes("25角")) return "我没听清。你是想说2元5角吗？请只说：几元几角。";
  if (prompt.includes("几角") || atomName.includes("元等于10角") || atomName.includes("换成几十角")) return "我没听清。请只说一个答案：是几角？";
  if (prompt.includes("找回")) return "我没听清。请只说找回多少钱，比如：3元。";
  if (prompt.includes("连加式")) return "我没听清。请说成连加式，比如：3加3加3。";
  if (prompt.includes("几个几")) return "我没听清。请只说：几个几。";
  return `我没听清。我们回到这一小问：${template?.prompt || atom?.atom_name || point?.point_name || "你再说一次答案"}`;
}

function makeAssessmentRepairMessage(template, atom, point, diagnosis = {}) {
  const atomName = atom?.atom_name || "";
  const prompt = template?.prompt || point?.entry_question || "";
  if (diagnosis.error_tag === ErrorTag.NO_RESPONSE) return makeNoResponseMessage(atom, point);
  if (diagnosis.error_tag === ErrorTag.OFF_TOPIC) return makeReturnToQuestionMessage(atom, point);
  if (diagnosis.error_tag === ErrorTag.AMBIGUOUS_RESPONSE) return makeClarifyAssessmentMessage(template, atom, point);
  if (atomName.includes("1元等于10角")) {
    if (normalizeText(prompt).includes("25角")) return "先补最小台阶：1元等于几角？";
    return "我们先补一小问：1元等于几角？";
  }
  if (atomName.includes("1角等于10分")) return "我们先补一小问：1角等于几分？";
  if (atomName.includes("换成几十角")) return "我们只补换算这一步：几元就有几个10角。你先说，2元是几角？";
  if (atomName.includes("再加原来的几角")) return "我们只补最后一小步：先换成角，再加原来的几角。你先说，30角加5角是多少？";
  if (atomName.includes("说清为什么先换单位")) return makeMoneyReasonRepeatMessage("还差原因。");
  if (atomName.includes("看清商品价格")) return "我们先只看商品价格。题里说商品要多少钱？";
  if (atomName.includes("看清付了多少钱")) return "我们先只看付出去的钱。题里说付了多少钱？";
  if (atomName.includes("找回就是剩下的钱")) return "找回的钱是剩下的钱。你先说：找回是剩下，还是再付？";
  if (atomName.includes("用减法算找回")) return "我们只补计算：付了5元，花4元，5减4等于几？";
  return makeNoResponseMessage(atom, point);
}

function buildResult({
  point,
  session,
  phase,
  aiContext,
  aiMessage,
  currentStep,
  feynmanStatus = "",
  evidenceSignal,
  evidenceText,
  bestStrategy,
  inputType,
  assessment = null,
}) {
  const currentAtom = (point.atoms || []).find((atom) => atom.id === session.current_atom_id);
  return {
    mode: "engine",
    aiContext,
    aiMessage,
    nextPhase: phase,
    teachingState: session.current_state,
    currentAtomId: session.current_atom_id,
    currentAtomName: currentAtom?.atom_name || "",
    currentStep,
    feynmanStatus,
    evidenceSignal,
    evidenceText,
    bestStrategy,
    engineSession: session,
    mastery: estimateMastery(session),
    assessment,
    parentSignals: buildParentSignals(point, session),
    inputType,
  };
}

function estimateMastery(session) {
  if (session.current_state === TeachingState.MASTERED) return 92;
  if (session.current_state === TeachingState.FEYNMAN_EXPLAIN) return 82;
  if (session.current_state === TeachingState.PRACTICE_SET) return 74;
  if (session.current_state === TeachingState.FALLBACK_PREREQUISITE) return 48;
  if (session.current_state === TeachingState.SPLIT_ATOM) return 58;
  return 64;
}

function buildParentSignals(point, session) {
  return {
    point_id: point.id,
    point_name: point.point_name,
    stuck_chain: session.stuck_events.slice(-5),
    remediation_count: session.remediation_records.length,
    assessment_passed: session.assessment_records.length > 0 && session.assessment_records.every((record) => record.passed),
    feynman_passed: session.feynman_records.some((record) => record.passed),
  };
}

function makeTeachMessage(atom) {
  if (!atom) return "我们先看一个很小的问题。";
  const atomName = atom.atom_name || "";
  if (atom.teach_prompt) return atom.teach_prompt;
  if (atomName.includes("1元等于10角")) return "我们先只看1元。1元等于几角？";
  if (atomName.includes("1角等于10分")) return "再看角和分：1角等于几分？";
  if (atomName.includes("换成几十角")) return "现在只换整元：3元是几角？";
  if (atomName.includes("再加原来的几角")) return "现在把换好的角和原来的角合起来。30角加5角是多少？";
  if (atomName.includes("说清为什么先换单位")) return makeMoneyReasonRepeatMessage("这句有点难，老师先说。");
  if (atomName.includes("看清商品价格")) return "先只看价格：商品多少钱？";
  if (atomName.includes("看清付了多少钱")) return "再只看付出去的钱：付了多少钱？";
  if (atomName.includes("找回就是剩下的钱")) return "找回的钱，是付出去后剩下的钱，还是还要再付的钱？";
  if (atomName.includes("用减法算找回")) return "现在只算找回：5减4等于几？";
  if (atomName.includes("说清为什么用减法")) return "你试着说一句：为什么找回的钱要用减法？";
  if (atomName.includes("每组同样多")) return "先看每一组：每组有几个？";
  if (atomName.includes("数有几组")) return "再数一数：一共有几组？";
  if (atomName.includes("用连加表示几个几")) return "先写连加式：3个4可以写成4+4+4吗？";
  if (atomName.includes("用乘法表示几个几")) return "几个几可以用乘法简写。3个4可以写成几乘几？";
  if (atomName.includes("看到9先想差1到10")) return "现在只看9：9还差几就到10？";
  if (atomName.includes("把另一个数拆成")) return "为了给9凑成10，4可以拆成1和几？";
  if (atomName.includes("10再加剩下的数")) return "9拿到1变成10，还剩3。10加3等于几？";
  if (atomName.includes("说清为什么这样算")) return "你试着说一句：为什么9加几可以先凑10？";
  return `我们只学一步：${atomName}。你先说第一步该看什么？`;
}

function makeRepairMessage(atom, errorTag, point) {
  const atomName = atom?.atom_name || "";
  if (errorTag === ErrorTag.OFF_TOPIC) return makeReturnToQuestionMessage(atom, point);
  if (errorTag === ErrorTag.NO_RESPONSE) return makeNoResponseMessage(atom, point);
  if (errorTag === ErrorTag.AMBIGUOUS_RESPONSE) return `我没听清。我们只回答这一小步：${atomName || point?.point_name || "你再说一次答案"}`;
  if (atom?.repair_prompt) return atom.repair_prompt;
  if (errorTag === ErrorTag.LANGUAGE_MISREAD) return "我把题目换成更口语的话。你先说：题里让我们找什么？";
  if ((errorTag === ErrorTag.CONCEPT_GAP || errorTag === ErrorTag.CALCULATION_SLIP) && atomName.includes("1元等于10角")) return "差一点。1元不是1角，1元可以换成10个1角。你再说一遍：1元等于几角？";
  if ((errorTag === ErrorTag.PROCESS_DROP || errorTag === ErrorTag.CALCULATION_SLIP) && atomName.includes("换成几十角")) return "先只换整元：1元是10角，所以3元是3个10角。你先说：3元是几角？";
  if ((errorTag === ErrorTag.PROCESS_DROP || errorTag === ErrorTag.CALCULATION_SLIP) && atomName.includes("再加原来的几角")) return "先别急。3元先换成30角，再加原来的5角。你先说：30角加5角是多少？";
  if (errorTag === ErrorTag.CALCULATION_SLIP && atomName.includes("价格")) return "先别急着说答案。我们只看价格：商品多少钱？";
  if (errorTag === ErrorTag.CALCULATION_SLIP && atomName.includes("付了多少钱")) return "先不算答案。我们只看付出去的钱是多少？";
  if (errorTag === ErrorTag.CONCEPT_GAP && atomName.includes("找回就是剩下的钱")) return "找回的钱，就是付出去以后剩下要还给你的钱。你先说：找回是剩下的钱，还是又要付的钱？";
  if (errorTag === ErrorTag.CALCULATION_SLIP && atomName.includes("用减法算找回")) return "先看清：付了5元，花掉4元，剩下的钱才找回。你先说：5减4等于几？";
  if ((errorTag === ErrorTag.CONCEPT_GAP || errorTag === ErrorTag.CALCULATION_SLIP) && atomName.includes("每组同样多")) return "先不算总数，只看每一组：每组有几个？";
  if ((errorTag === ErrorTag.PROCESS_DROP || errorTag === ErrorTag.CALCULATION_SLIP) && atomName.includes("数有几组")) return "先只数组数：一共有几组？";
  if ((errorTag === ErrorTag.PROCESS_DROP || errorTag === ErrorTag.CALCULATION_SLIP) && atomName.includes("用连加表示几个几")) return "先别急着说总数。3个4要写成4+4+4，你也试着说一遍。";
  if ((errorTag === ErrorTag.CONCEPT_GAP || errorTag === ErrorTag.EXPRESSION_WEAK) && atomName.includes("用乘法表示几个几")) return "先说意思：3个4就是3组，每组4个。可以写成几乘几？";
  if (errorTag === ErrorTag.CALCULATION_SLIP) return "这像是小计算滑了一下。我们只检查这一步，不重讲整题。";
  if (errorTag === ErrorTag.EXPRESSION_WEAK) return "你说出了结果，还要补一句原因。你可以接着说：因为...";
  return `这个小台阶再切小一点：${atom?.atom_name || "先看第一步"}。你先说一个词也可以。`;
}

function makeNoResponseMessage(atom, point) {
  const atomName = atom?.atom_name || "";
  if (atomName.includes("1元等于10角")) return "没关系。我们只回答一个数：1元等于几角？";
  if (atomName.includes("1角等于10分")) return "没关系。只回答一个数：1角等于几分？";
  if (atomName.includes("换成几十角")) return "没关系。先只看3元：1元是10角，3元是几个10角？";
  if (atomName.includes("再加原来的几角")) return "没关系。只算最后一小步：30角加5角是多少？";
  if (atomName.includes("说清为什么先换单位")) return makeMoneyReasonRepeatMessage("没关系，先跟老师说一遍。");
  if (atomName.includes("看清商品价格")) return "没关系。先只看价格：本子要多少钱？";
  if (atomName.includes("看清付了多少钱")) return "没关系。先只看付出去的钱：付了多少钱？";
  if (atomName.includes("用减法算找回")) return "没关系。只算一小步：5减4等于几？";
  if (atomName.includes("每组同样多")) return "没关系。先只看每一组：每组有几个？";
  if (atomName.includes("数有几组")) return "没关系。先只数组数：一共有几组？";
  if (atomName.includes("用连加表示几个几")) return "没关系。先说连加式：3个4可以写成什么？";
  if (atomName.includes("用乘法表示几个几")) return "没关系。先说几个几：这是几个4？";
  if (atomName.includes("看到9先想差1到10")) return "没关系。只看9：9还差几就到10？";
  if (atomName.includes("把另一个数拆成")) return "没关系。只拆4：4可以拆成1和几？";
  if (atomName.includes("10再加剩下的数")) return "没关系。只算10加3等于几？";
  if (atom?.no_response_prompt) return atom.no_response_prompt;
  return `没关系。我们只看这一小步：${atomName || point?.point_name || "先看第一步"}。你可以说“不知道”，老师再拆小一点。`;
}

function makeReturnToQuestionMessage(atom, point) {
  const atomName = atom?.atom_name || "";
  if (atomName.includes("1元等于10角")) return "这句还没有回答题目。我们回到这一小问：1元等于几角？";
  if (atomName.includes("1角等于10分")) return "这句还没有回答题目。我们回到这一小问：1角等于几分？";
  if (atomName.includes("换成几十角")) return "这句还没有回答题目。现在只看3元：3元是几角？";
  if (atomName.includes("再加原来的几角")) return "这句还没有回答题目。现在只算：30角加5角是多少？";
  if (atomName.includes("说清为什么先换单位")) return makeMoneyReasonRepeatMessage("这句还没有说到原因。先跟老师说一遍。");
  if (atomName.includes("看清商品价格")) return "这句还没有回答题目。先只看价格：本子要多少钱？";
  if (atomName.includes("看清付了多少钱")) return "这句还没有回答题目。先只看付了多少钱？";
  if (atomName.includes("找回就是剩下的钱")) return "这句还没有回答题目。找回的钱，是剩下的钱，还是又要付的钱？";
  if (atomName.includes("用减法算找回")) return "这句还没有回答题目。现在只算：5减4等于几？";
  if (atomName.includes("每组同样多")) return "这句还没有回答题目。先只看每一组：每组有几个？";
  if (atomName.includes("数有几组")) return "这句还没有回答题目。先只数一数：一共有几组？";
  if (atomName.includes("用连加表示几个几")) return "这句还没有回答题目。先说连加式：3个4可以写成什么？";
  if (atomName.includes("用乘法表示几个几")) return "这句还没有回答题目。先说：这是几个4？";
  if (atomName.includes("看到9先想差1到10")) return "这句还没有回答题目。现在只看：9还差几就到10？";
  if (atomName.includes("把另一个数拆成")) return "这句还没有回答题目。现在只拆4：4可以拆成1和几？";
  if (atomName.includes("10再加剩下的数")) return "这句还没有回答题目。现在只算：10加3等于几？";
  if (atom?.return_prompt) return atom.return_prompt;
  return `这句还没有回答题目。我们先回到：${atomName || point?.point_name || "这一小步"}。`;
}

function makeFeynmanScaffold(requiredSignals) {
  const first = requiredSignals[0] || "先看第一步";
  const second = requiredSignals[1] || "再说为什么";
  return `差一点就讲清楚了。你接这半句：我先${first}，因为${second}。`;
}

function errorTagToChildSignal(errorTag) {
  const map = {
    [ErrorTag.NO_RESPONSE]: "没有回答，降低难度",
    [ErrorTag.CONCEPT_GAP]: "概念没懂，重讲意思",
    [ErrorTag.PREREQUISITE_GAP]: "前置缺口，先补台阶",
    [ErrorTag.PROCESS_DROP]: "步骤漏掉，拆小重带",
    [ErrorTag.LANGUAGE_MISREAD]: "题意没听懂，换说法",
    [ErrorTag.CALCULATION_SLIP]: "偶发算错，只纠一步",
    [ErrorTag.EXPRESSION_WEAK]: "会做但讲不清，补半句",
    [ErrorTag.AMBIGUOUS_RESPONSE]: "回答不清楚，先确认",
    [ErrorTag.OFF_TOPIC]: "回答跑开了，拉回题目",
  };
  return map[errorTag] || "需要换讲法";
}

function looksOffTopicAssessment(normalized, template, point) {
  if (!normalized || hasNumberishAnswer(normalized)) return false;
  const learningSignals = [
    template?.prompt,
    point?.point_name,
    point?.child_title,
    ...(template?.expected_keywords || []),
    "元",
    "角",
    "钱",
    "找回",
    "剩下",
    "加",
    "减",
    "等于",
    "几个",
    "每组",
    "连加",
  ];
  if (includesAny(normalized, learningSignals)) return false;
  return normalized.length >= 2;
}

function hasNumberishAnswer(normalized) {
  return /\d/.test(normalized) || /[一二三四五六七八九十百]/.test(normalized) || /[+\-＋－]/.test(normalized);
}

function extractNumbers(normalized) {
  const values = [];
  const digitMatches = normalized.match(/\d+/g) || [];
  for (const item of digitMatches) values.push(Number(item));

  const chineseMatches = normalized.match(/[零一二三四五六七八九十百]+/g) || [];
  for (const item of chineseMatches) {
    const value = chineseNumberToNumber(item);
    if (Number.isFinite(value)) values.push(value);
  }

  return unique(values.map(String)).map(Number);
}

function chineseNumberToNumber(text) {
  const source = normalizeText(text);
  if (!source) return NaN;
  const digits = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (/^[零一二三四五六七八九]$/.test(source)) return digits[source];
  if (source === "十") return 10;
  if (source.includes("百")) {
    const [hundredsRaw, restRaw = ""] = source.split("百");
    const hundreds = hundredsRaw ? digits[hundredsRaw] || 1 : 1;
    const rest = restRaw ? chineseNumberToNumber(restRaw.replace(/^零/, "")) : 0;
    return hundreds * 100 + rest;
  }
  if (source.includes("十")) {
    const [tensRaw, onesRaw = ""] = source.split("十");
    const tens = tensRaw ? digits[tensRaw] || 0 : 1;
    const ones = onesRaw ? digits[onesRaw] || 0 : 0;
    return tens * 10 + ones;
  }
  if ([...source].every((char) => char in digits)) {
    return Number([...source].map((char) => digits[char]).join(""));
  }
  return NaN;
}

function numberMatches(numbers, expectedValue) {
  return numbers.some((value) => value === expectedValue);
}

function evaluateSimpleExpression(normalized) {
  const text = normalized
    .replace(/加/g, "+")
    .replace(/减/g, "-")
    .replace(/＋/g, "+")
    .replace(/－/g, "-")
    .replace(/[元角个颗盒彩本]/g, "");
  const match = text.match(/(\d+|[一二三四五六七八九十百]+)([+\-])(\d+|[一二三四五六七八九十百]+)/);
  if (!match) return null;
  const left = parseNumberToken(match[1]);
  const right = parseNumberToken(match[3]);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
  return match[2] === "+" ? left + right : left - right;
}

function parseNumberToken(token) {
  if (/^\d+$/.test(token)) return Number(token);
  return chineseNumberToNumber(token);
}

function parseJiaoAnswer(normalized, expressionValue) {
  if (expressionValue !== null && expressionValue !== undefined) return expressionValue;
  const jiaoMatches = [...normalized.matchAll(/(\d+|[一二三四五六七八九十百]+)角/g)].map((match) => parseNumberToken(match[1]));
  if (jiaoMatches.length && !normalized.includes("元")) return jiaoMatches.at(-1);
  const numbers = extractNumbers(normalized);
  if (numbers.length === 1 && !normalized.includes("元")) return numbers[0];
  if (numbers.length && normalized.includes("等于")) return numbers.at(-1);
  return null;
}

function parseYuanAnswer(normalized, expressionValue) {
  if (expressionValue !== null && expressionValue !== undefined) return expressionValue;
  const yuanMatches = [...normalized.matchAll(/(\d+|[一二三四五六七八九十百]+)元/g)].map((match) => parseNumberToken(match[1]));
  if (yuanMatches.length) return yuanMatches.at(-1);
  const numbers = extractNumbers(normalized);
  return numbers.length === 1 ? numbers[0] : null;
}

function mentionsYuanAndJiao(normalized) {
  return normalized.includes("元") && normalized.includes("角");
}

function parseMoneyParts(normalized) {
  const match = normalized.match(/(\d+|[一二三四五六七八九十百]+)元(?:又|再|加|和)?(\d+|[一二三四五六七八九十百]+)角/);
  if (!match) return null;
  const yuan = parseNumberToken(match[1]);
  const jiao = parseNumberToken(match[2]);
  if (!Number.isFinite(yuan) || !Number.isFinite(jiao)) return null;
  return { yuan, jiao };
}

function parseRepeatAdd(normalized) {
  const parts = normalized
    .replace(/加/g, "+")
    .replace(/＋/g, "+")
    .split("+")
    .map((item) => parseNumberToken(item.replace(/[^\d一二三四五六七八九十百]/g, "")))
    .filter((value) => Number.isFinite(value));
  if (parts.length < 2) return null;
  const addend = parts[0];
  if (!parts.every((value) => value === addend)) return null;
  return { addend, count: parts.length };
}

function containsGroupPhrase(normalized, count, each) {
  const countTexts = [String(count), numberToChinese(count)];
  const eachTexts = [String(each), numberToChinese(each)];
  return countTexts.some((countText) =>
    eachTexts.some((eachText) => normalized.includes(`${countText}个${eachText}`) || normalized.includes(`${countText}组${eachText}`)),
  );
}

function numberToChinese(value) {
  const map = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (value >= 0 && value <= 10) return map[value];
  if (value < 20) return `十${map[value - 10]}`;
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return `${map[tens]}十${ones ? map[ones] : ""}`;
  }
  return String(value);
}

function looksLikeNoResponse(normalized) {
  if (!normalized) return true;
  const unablePhrases = ["不知道", "不会", "不懂", "没懂", "讲不出来", "不知道怎么说"];
  if (unablePhrases.some((item) => normalized.includes(item))) return true;
  const acknowledgements = ["好的", "好吧", "可以", "行", "知道了", "明白了", "听懂了", "嗯嗯", "哦哦"];
  return acknowledgements.includes(normalized);
}

function looksInvalidForLearning(normalized) {
  if (!normalized) return true;
  if (normalized.length <= 1 && !/\d/.test(normalized) && !/[一二三四五六七八九十]/.test(normalized)) return true;
  if (!/[\u4e00-\u9fa5a-z0-9]/i.test(normalized)) return true;
  if (/^(.)\1{2,}$/.test(normalized)) return true;
  if (/^(啊|嗯|额|呃|哦|哈|呵){1,4}$/.test(normalized)) return true;
  return false;
}

function mentionsOnlyResult(normalized, resultKeywords) {
  return includesAny(normalized, resultKeywords) && !["因为", "所以", "先", "再", "为什么"].some((item) => normalized.includes(item));
}

function hasPossibleCalculationSlip(normalized, answerKeywords) {
  return /\d/.test(normalized) && !includesAny(normalized, answerKeywords);
}

function looksOffTopic(normalized, point, atom, answerSignals) {
  if (!normalized || /\d/.test(normalized)) return false;
  const learningSignals = [
    point?.point_name,
    point?.child_title,
    atom?.atom_name,
    ...(atom?.check_keywords || []),
    ...(atom?.assessment_targets || []),
    ...(answerSignals.answerKeywords || []),
    ...(answerSignals.attemptKeywords || []),
    ...(answerSignals.whyKeywords || []),
    ...(answerSignals.resultKeywords || []),
  ];
  if (includesAny(normalized, learningSignals)) return false;
  const studySignals = ["元", "角", "钱", "价格", "付", "找回", "剩下", "减", "加", "等于", "题", "答案", "怎么算", "不会", "不懂", "老师", "讲", "看图", "知识点"];
  if (includesAny(normalized, studySignals)) return false;
  return normalized.length >= 2;
}

function mentionsTopicButMissesUnit(normalized, point) {
  return normalizeText(point.point_name || "").split("").some((char) => char && normalized.includes(char));
}

function includesAny(normalizedText, keywords) {
  const list = Array.isArray(keywords) ? keywords : [keywords];
  return list.some((keyword) => {
    const normalized = normalizeText(keyword);
    if (/^\d$/.test(normalized)) return normalizedText === normalized;
    return normalized && normalizedText.includes(normalized);
  });
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/两/g, "二");
}

function toChildSentence(text) {
  return String(text || "")
    .replace(/^孩子能/, "你会")
    .replace(/^孩子可以/, "你可以")
    .replace(/^孩子看到/, "你看到")
    .replace(/^孩子知道/, "你知道")
    .replace(/^孩子/, "你")
    .replace(/。$/, "。");
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}
