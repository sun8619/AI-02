export const TeachingState = Object.freeze({
  DIAGNOSE_ENTRY: "DIAGNOSE_ENTRY",
  TEACH_CONCEPT: "TEACH_CONCEPT",
  GUIDED_STEP: "GUIDED_STEP",
  CHECK_UNDERSTANDING: "CHECK_UNDERSTANDING",
  SPLIT_ATOM: "SPLIT_ATOM",
  FALLBACK_PREREQUISITE: "FALLBACK_PREREQUISITE",
  PRACTICE_SET: "PRACTICE_SET",
  ERROR_ANALYSIS: "ERROR_ANALYSIS",
  REMEDIATION_TEACH: "REMEDIATION_TEACH",
  REMEDIATION_RECHECK: "REMEDIATION_RECHECK",
  FEYNMAN_EXPLAIN: "FEYNMAN_EXPLAIN",
  FEYNMAN_EVAL: "FEYNMAN_EVAL",
  MASTERED: "MASTERED",
  EXIT_WITH_NEXT: "EXIT_WITH_NEXT",
});

export const ErrorTag = Object.freeze({
  NO_RESPONSE: "NO_RESPONSE",
  CONCEPT_GAP: "CONCEPT_GAP",
  PREREQUISITE_GAP: "PREREQUISITE_GAP",
  PROCESS_DROP: "PROCESS_DROP",
  LANGUAGE_MISREAD: "LANGUAGE_MISREAD",
  CALCULATION_SLIP: "CALCULATION_SLIP",
  EXPRESSION_WEAK: "EXPRESSION_WEAK",
  AMBIGUOUS_RESPONSE: "AMBIGUOUS_RESPONSE",
  OFF_TOPIC: "OFF_TOPIC",
});

export const DependencyStrength = Object.freeze({
  STRONG: "strong_prerequisite",
  WEAK: "weak_prerequisite",
});

export const TeachingAction = Object.freeze({
  EXPLAIN: "explain",
  EXAMPLE: "example",
  MANIPULATIVE: "manipulative",
  PROMPT: "prompt",
  MICRO_PRACTICE: "micro_practice",
  ERROR_FIX: "error_fix",
  FEYNMAN: "feynman",
});

export const MasteryDimension = Object.freeze({
  DIRECT: "direct_problem",
  VARIANT: "variant_problem",
  REASONING: "reasoning",
  FEYNMAN: "feynman_explain",
});

export function createKnowledgeGraph(modules) {
  const moduleById = new Map();
  const pointById = new Map();
  const atomById = new Map();
  const dependenciesByAtomId = new Map();
  const pointsByGradeTerm = new Map();

  for (const module of modules) {
    moduleById.set(module.id, module);
    if (!pointsByGradeTerm.has(module.grade_term)) {
      pointsByGradeTerm.set(module.grade_term, []);
    }

    for (const point of module.points) {
      pointById.set(point.id, { ...point, module_id: module.id, grade_term: module.grade_term });
      pointsByGradeTerm.get(module.grade_term).push(point.id);

      for (const atom of point.atoms || []) {
        atomById.set(atom.id, { ...atom, point_id: point.id, module_id: module.id, grade_term: module.grade_term });
        dependenciesByAtomId.set(atom.id, atom.dependencies || []);
      }
    }
  }

  return {
    modules,
    moduleById,
    pointById,
    atomById,
    dependenciesByAtomId,
    pointsByGradeTerm,
  };
}

export function getPointAtoms(graph, pointId) {
  const point = graph.pointById.get(pointId);
  if (!point) return [];
  return (point.atoms || []).map((atom) => graph.atomById.get(atom.id)).filter(Boolean);
}

export function getEntryAtom(graph, pointId) {
  const atoms = getPointAtoms(graph, pointId);
  return atoms.find((atom) => atom.is_entry) || atoms[0] || null;
}

export function getPrerequisites(graph, atomId, strength = DependencyStrength.STRONG) {
  return (graph.dependenciesByAtomId.get(atomId) || [])
    .filter((edge) => edge.strength === strength)
    .map((edge) => graph.atomById.get(edge.atom_id))
    .filter(Boolean);
}

export function summarizeMastery(records) {
  const dimensions = {
    [MasteryDimension.DIRECT]: 0,
    [MasteryDimension.VARIANT]: 0,
    [MasteryDimension.REASONING]: 0,
    [MasteryDimension.FEYNMAN]: 0,
  };
  const totals = { ...dimensions };

  for (const record of records) {
    if (!record.dimension) continue;
    totals[record.dimension] = (totals[record.dimension] || 0) + 1;
    if (record.passed) {
      dimensions[record.dimension] = (dimensions[record.dimension] || 0) + 1;
    }
  }

  const ratios = {};
  for (const dimension of Object.keys(dimensions)) {
    ratios[dimension] = totals[dimension] ? dimensions[dimension] / totals[dimension] : 0;
  }

  const directReady = totals[MasteryDimension.DIRECT] > 0 && ratios[MasteryDimension.DIRECT] === 1;
  const variantReady = totals[MasteryDimension.VARIANT] === 0 || ratios[MasteryDimension.VARIANT] === 1;
  const score =
    ratios[MasteryDimension.DIRECT] * 0.55 +
    (totals[MasteryDimension.VARIANT] ? ratios[MasteryDimension.VARIANT] : ratios[MasteryDimension.DIRECT]) * 0.45;

  return {
    score: Number(score.toFixed(2)),
    ratios,
    passed: directReady && variantReady,
  };
}

export function makeDependency(atomId, strength, reason) {
  return { atom_id: atomId, strength, reason };
}
