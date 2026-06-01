import { LESSON_MODULES } from "../src/data/lesson-modules.js";

const TARGET_TAG_PATTERN = /(?:#|--|\/\/)?\s*ds-target:([a-zA-Z0-9_-]+)/g;
const ALLOWED_STAGE_TYPES = new Set(["click_target", "scenaro_choice", "scenario_choice"]);

function collectTargetTags(codeSnippet = "") {
  return [...codeSnippet.matchAll(TARGET_TAG_PATTERN)].map((match) => match[1]);
}

function formatPath(moduleId, stageId, field) {
  return `${moduleId}.interviewGraph.stages.${stageId}${field ? `.${field}` : ""}`;
}

function validateReachability(moduleId, graph, errors) {
  const stages = graph.stages || {};
  const memo = new Map();

  function canReachTerminal(stageId, visiting = new Set()) {
    if (memo.has(stageId)) return memo.get(stageId);
    const stage = stages[stageId];
    if (!stage) return false;
    if (stage.terminal) {
      memo.set(stageId, true);
      return true;
    }
    if (visiting.has(stageId)) return false;

    visiting.add(stageId);
    const nextIds = Object.values(stage.branches || {});
    const result = nextIds.some((nextStageId) => canReachTerminal(nextStageId, new Set(visiting)));
    visiting.delete(stageId);
    memo.set(stageId, result);
    return result;
  }

  for (const stageId of Object.keys(stages)) {
    if (!canReachTerminal(stageId)) {
      errors.push(`${formatPath(moduleId, stageId)} cannot reach a terminal stage; this creates a dead-end or infinite recovery loop.`);
    }
  }
}

function validateInterviewGraph(moduleId, graph) {
  const errors = [];
  const stages = graph?.stages || {};
  const stageIds = new Set(Object.keys(stages));

  if (!graph?.initialStageId) {
    errors.push(`${moduleId}.interviewGraph.initialStageId is required.`);
  } else if (!stageIds.has(graph.initialStageId)) {
    errors.push(`${moduleId}.interviewGraph.initialStageId points to missing stage '${graph.initialStageId}'.`);
  }

  if (stageIds.size === 0) {
    errors.push(`${moduleId}.interviewGraph.stages must contain at least one stage.`);
    return errors;
  }

  let terminalCount = 0;

  for (const [stageId, stage] of Object.entries(stages)) {
    if (stage.id !== stageId) {
      errors.push(`${formatPath(moduleId, stageId, "id")} must equal its object key.`);
    }

    if (!ALLOWED_STAGE_TYPES.has(stage.type)) {
      errors.push(`${formatPath(moduleId, stageId, "type")} must be one of: ${[...ALLOWED_STAGE_TYPES].join(", ")}.`);
    }

    if (typeof stage.code_snippet !== "string" || stage.code_snippet.trim().length === 0) {
      errors.push(`${formatPath(moduleId, stageId, "code_snippet")} must be a non-empty string.`);
    }

    if (!stage.branches || typeof stage.branches !== "object" || Array.isArray(stage.branches)) {
      errors.push(`${formatPath(moduleId, stageId, "branches")} must be an object mapping user inputs to stage IDs.`);
    } else {
      for (const [inputId, nextStageId] of Object.entries(stage.branches)) {
        if (!stageIds.has(nextStageId)) {
          errors.push(`${formatPath(moduleId, stageId, "branches")} maps '${inputId}' to missing stage '${nextStageId}'.`);
        }
      }
    }

    if (stage.terminal) terminalCount += 1;

    if (stage.type === "click_target") {
      const targetTags = collectTargetTags(stage.code_snippet);
      const uniqueTargets = new Set(targetTags);
      if (uniqueTargets.size === 0) {
        errors.push(`${formatPath(moduleId, stageId, "code_snippet")} must include at least one hidden ds-target:* tag for click_target stages.`);
      }
      if (uniqueTargets.size !== targetTags.length) {
        errors.push(`${formatPath(moduleId, stageId, "code_snippet")} contains duplicate ds-target:* tags.`);
      }
      for (const targetId of uniqueTargets) {
        if (!stage.branches?.[targetId]) {
          errors.push(`${formatPath(moduleId, stageId, "branches")} must map target '${targetId}' to a next stage.`);
        }
        if (!stage.validationCopy?.[targetId]) {
          errors.push(`${formatPath(moduleId, stageId, "validationCopy")} must explain target '${targetId}'.`);
        }
      }
    }
  }

  if (terminalCount === 0) {
    errors.push(`${moduleId}.interviewGraph must define at least one terminal stage.`);
  }

  validateReachability(moduleId, graph, errors);
  return errors;
}

const allErrors = [];

for (const [moduleId, spec] of Object.entries(LESSON_MODULES)) {
  if (!spec?.interviewGraph) continue;
  allErrors.push(...validateInterviewGraph(moduleId, spec.interviewGraph));
}

if (allErrors.length > 0) {
  console.error("Interview graph validation failed:\n");
  for (const error of allErrors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Interview graph validation passed.");
