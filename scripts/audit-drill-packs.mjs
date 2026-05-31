#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const MIN = Number(
  process.argv.find((arg) => arg.startsWith('--min='))?.split('=')[1] ?? 5,
);
const FORMAT =
  process.argv.find((arg) => arg.startsWith('--format='))?.split('=')[1] ??
  'text';
const STRICT_MIN = process.argv.includes('--strict-min');

const LESSON_FILES = [
  'src/data/lessons/adsp/ch1.ts',
  'src/data/lessons/adsp/ch2.ts',
  'src/data/lessons/adsp/ch3.ts',
  'src/data/lessons/sqld/ch1-modeling.ts',
  'src/data/lessons/sqld/ch2-sql.ts',
];

function findJsonFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findJsonFiles(full));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function questionIndexes() {
  const allIds = new Set();
  const playableIds = new Set();
  const root = path.join(ROOT, 'src/data/questions');
  for (const file of findJsonFiles(root)) {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const questions = Array.isArray(raw) ? raw : raw.questions;
    if (!Array.isArray(questions)) continue;
    for (const q of questions) {
      if (!q?.id) continue;
      allIds.add(q.id);
      if (
        q?.id &&
        q?.type === 'multiple_choice' &&
        q?.interaction?.kind !== 'sql_ordering' &&
        q?.status !== 'restored' &&
        q?.status !== 'deprecated' &&
        !q?.needsDistractors
      ) {
        playableIds.add(q.id);
      }
    }
  }
  return { allIds, playableIds };
}

function prop(node, name) {
  return node.properties.find(
    (p) =>
      ts.isPropertyAssignment(p) &&
      ts.isIdentifier(p.name) &&
      p.name.text === name,
  );
}

function stringValue(propNode) {
  if (!propNode) return undefined;
  const init = propNode.initializer;
  return ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)
    ? init.text
    : undefined;
}

function stringArray(propNode) {
  if (!propNode || !ts.isArrayLiteralExpression(propNode.initializer)) {
    return [];
  }
  return propNode.initializer.elements
    .map((item) =>
      ts.isStringLiteral(item) || ts.isNoSubstitutionTemplateLiteral(item)
        ? item.text
        : undefined,
    )
    .filter(Boolean);
}

function groupKey(id, explicitGroup) {
  if (explicitGroup) return explicitGroup;
  const match = id?.match(/^(.+-s\d+)(?:-[a-zA-Z][a-zA-Z0-9-]*)?$/);
  return match ? match[1] : id;
}

function lessonSteps() {
  const steps = [];
  for (const file of LESSON_FILES) {
    const abs = path.join(ROOT, file);
    const source = fs.readFileSync(abs, 'utf8');
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isObjectLiteralExpression(node)) {
        const quizProp = prop(node, 'quizId');
        const idProp = prop(node, 'id');
        if (quizProp && idProp) {
          const id = stringValue(idProp);
          const quizId = stringValue(quizProp);
          const explicitGroup = stringValue(prop(node, 'group'));
          steps.push({
            file,
            id,
            title: stringValue(prop(node, 'title')) ?? '',
            quizId,
            extraQuizIds: stringArray(prop(node, 'extraQuizIds')),
            group: groupKey(id, explicitGroup),
          });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  return steps;
}

function orderedUnique(ids) {
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

const { allIds, playableIds } = questionIndexes();
const steps = lessonSteps();
const byGroup = new Map();
for (const step of steps) {
  if (!byGroup.has(step.group)) byGroup.set(step.group, []);
  byGroup.get(step.group).push(step);
}

const missing = [];
const duplicatePackIds = [];
const belowMin = [];
let exactEnough = 0;
let supplemented = 0;

for (const step of steps) {
  const authored = orderedUnique([step.quizId, ...step.extraQuizIds]);
  for (const id of authored) {
    if (!allIds.has(id)) missing.push({ step: step.id, id, file: step.file });
  }
  if (authored.length < 1 + step.extraQuizIds.length) {
    duplicatePackIds.push({ step: step.id, file: step.file });
  }

  const groupSteps = byGroup.get(step.group) ?? [];
  const groupIds = orderedUnique(
    groupSteps.flatMap((item) => [item.quizId, ...item.extraQuizIds]),
  );
  const pack = orderedUnique([
    ...authored.filter((id) => id !== step.quizId),
    ...groupIds.filter((id) => id !== step.quizId),
  ]).filter((id) => playableIds.has(id));

  if (authored.length - 1 >= MIN) exactEnough += 1;
  else if (pack.length >= MIN) supplemented += 1;
  else {
    belowMin.push({
      step: step.id,
      title: step.title,
      file: step.file,
      group: step.group,
      available: pack.length,
    });
  }
}

const summary = {
  steps: steps.length,
  groups: byGroup.size,
  minAdditionalQuestions: MIN,
  exactEnough,
  supplemented,
  belowMin: belowMin.length,
  missingIds: missing.length,
  duplicatePackIds: duplicatePackIds.length,
};

if (FORMAT === 'json') {
  console.log(
    JSON.stringify(
      {
        summary,
        missing,
        duplicatePackIds,
        belowMin: belowMin.slice(0, 80),
      },
      null,
      2,
    ),
  );
} else {
  console.log('Drill pack audit');
  console.log(JSON.stringify(summary, null, 2));
  if (missing.length) {
    console.log('\nMissing quiz ids');
    for (const item of missing.slice(0, 40)) {
      console.log(`- ${item.step}: ${item.id} (${item.file})`);
    }
  }
  if (belowMin.length) {
    console.log(`\nBelow min ${MIN} additional questions (first 40)`);
    for (const item of belowMin.slice(0, 40)) {
      console.log(`- ${item.step}: ${item.available}/${MIN} ${item.title}`);
    }
  }
}

if (missing.length || duplicatePackIds.length || (STRICT_MIN && belowMin.length)) {
  process.exit(1);
}
