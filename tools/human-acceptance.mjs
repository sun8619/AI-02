import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const command = process.argv[2] || "report";
const strict = process.argv.includes("--strict");

function parseCsv(text) {
  text = String(text || "").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ""; }
    else if (char === '\n') { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  const [headers = [], ...body] = rows.filter((item) => item.some((value) => value !== ""));
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function bool(value) {
  return String(value).trim().toLowerCase() === "true";
}

async function loadCsv(name) {
  return parseCsv(await readFile(new URL(`../docs/acceptance/${name}`, import.meta.url), "utf8"));
}

async function initTeacherReview() {
  const source = await readFile(new URL("../teaching-engine/grade1-2-question-bank.js", import.meta.url), "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: "grade1-2-question-bank.js" });
  const points = context.window.gradeOneTwoQuestionBank?.points || [];
  const rows = points.flatMap((point) => (point.questions || []).map((question, index) => ({
    question_id: question.id || `${point.id}-Q${String(index + 1).padStart(2, "0")}`,
    knowledge_point: point.title || point.node || point.id,
    reviewer_code: "",
    answer_correct: "",
    prompt_unambiguous: "",
    accepted_answers_complete: "",
    scaffold_safe: "",
    visual_correct: "",
    age_appropriate: "",
    status: "pending",
    notes: "",
  })));
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(","))].join("\n") + "\n";
  await writeFile(new URL("../docs/acceptance/teacher-review.csv", import.meta.url), "\uFEFF" + csv);
  console.log(`Generated teacher review checklist: ${rows.length} questions, all pending human review.`);
}

function ratio(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

async function report() {
  const [teacher, voice, devices, retention] = await Promise.all([
    loadCsv("teacher-review.csv"),
    loadCsv("child-voice.csv"),
    loadCsv("device-matrix.csv"),
    loadCsv("learning-retention.csv"),
  ]);
  const realVoice = voice.filter((row) => row.sample_id && !row.sample_id.startsWith("SAMPLE-") && bool(row.consent_recorded));
  const realDevices = devices.filter((row) => row.case_id && !row.case_id.startsWith("DEVICE-"));
  const realTrials = retention.filter((row) => row.trial_id && !row.trial_id.startsWith("TRIAL-") && bool(row.consent_recorded));
  const approvedTeacher = teacher.filter((row) => row.status === "approved" && row.reviewer_code && ["answer_correct","prompt_unambiguous","accepted_answers_complete","scaffold_safe","visual_correct","age_appropriate"].every((field) => bool(row[field])));
  const exactVoice = realVoice.filter((row) => row.expected_text.trim() === row.recognized_text.trim()).length;
  const directVoice = realVoice.filter((row) => bool(row.accepted_directly)).length;
  const falseAccepts = realVoice.filter((row) => bool(row.false_accept)).length;
  const safetyIssues = realVoice.filter((row) => bool(row.safety_issue)).length;
  const latencies = realVoice.map((row) => Number(row.latency_ms)).filter(Number.isFinite).sort((a,b) => a-b);
  const medianLatency = latencies.length ? latencies[Math.floor(latencies.length / 2)] : null;
  const approvedDevices = realDevices.filter((row) => row.status === "approved" && ["microphone_permission","recording","asr_result","keyboard_recovery","background_resume","tts_autoplay","layout_ok"].every((field) => row[field] === "pass"));
  const day7Passed = realTrials.filter((row) => bool(row.day7_correct)).length;
  const frustrationExits = realTrials.filter((row) => bool(row.frustration_exit)).length;
  const result = {
    teacher: { approved: approvedTeacher.length, total: teacher.length },
    voice: { samples: realVoice.length, exactRate: ratio(exactVoice, realVoice.length), directRate: ratio(directVoice, realVoice.length), falseAccepts, safetyIssues, medianLatency },
    devices: { approved: approvedDevices.length, tested: realDevices.length },
    retention: { trials: realTrials.length, day7Rate: ratio(day7Passed, realTrials.length), frustrationExitRate: ratio(frustrationExits, realTrials.length) },
  };
  const gates = [
    [teacher.length >= 462 && approvedTeacher.length === teacher.length, "教师应逐题批准全部题目"],
    [realVoice.length >= 100, "匿名真实童声样本至少100条"],
    [realVoice.length > 0 && result.voice.exactRate >= 0.97, "童声精确识别率至少97%"],
    [realVoice.length > 0 && result.voice.directRate >= 0.9, "语音直接采用率至少90%"],
    [falseAccepts === 0 && safetyIssues === 0, "误判为正确与安全问题必须为0"],
    [medianLatency !== null && medianLatency < 2000, "ASR中位延迟低于2秒"],
    [approvedDevices.length >= 3, "至少完成iOS Safari、Android Chrome和微信内浏览器三类真机"],
    [realTrials.length >= 10, "至少10名匿名儿童完成学习保持实验"],
    [realTrials.length > 0 && result.retention.day7Rate >= 0.8, "7日复测通过率至少80%"],
    [realTrials.length > 0 && result.retention.frustrationExitRate <= 0.1, "挫败退出率不高于10%"],
  ];
  const failures = gates.filter(([pass]) => !pass).map(([,message]) => message);
  console.log(JSON.stringify({ ...result, readyForPublicChildUse: failures.length === 0, failures }, null, 2));
  if (strict && failures.length) process.exitCode = 2;
}

if (command === "init") await initTeacherReview();
else if (command === "report") await report();
else throw new Error("Usage: node tools/human-acceptance.mjs {init|report} [--strict]");
