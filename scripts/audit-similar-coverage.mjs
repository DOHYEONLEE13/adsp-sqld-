/**
 * audit-similar-coverage.mjs — "비슷한 문제 더 풀기" 풀 커버리지 점검.
 *
 * 매칭 단위: lesson step group (step.group 또는 id 의 -sN prefix).
 * 같은 group 안의 다른 quizId 수가 풀 크기.
 *
 * 사용:
 *   node scripts/audit-similar-coverage.mjs
 *   node scripts/audit-similar-coverage.mjs --subject=adsp
 *   node scripts/audit-similar-coverage.mjs --threshold=3
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const QUESTIONS_ROOT = path.join(REPO_ROOT, 'src/data/questions');
const LESSONS_ROOT = path.join(REPO_ROOT, 'src/data/lessons');

// CLI 인자
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const subjectFilter = args.subject;
const threshold = Number(args.threshold ?? 3);

// ─── lesson 파일에서 (stepId, quizId, explicitGroup) 추출 ───
function extractStepGroups() {
  const tsFiles = [];
  for (const subj of ['adsp', 'sqld']) {
    const dir = path.join(LESSONS_ROOT, subj);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.ts')) tsFiles.push(path.join(dir, f));
    }
  }

  // quizId → groupKey 인덱스 + group → Set<quizId>
  const q2g = new Map();
  const g2q = new Map();

  for (const file of tsFiles) {
    const src = fs.readFileSync(file, 'utf8');
    // step block 패턴: `id: '...'` + `quizId?: '...'` + (선택) `group: '...'`
    // 단순화: { id, quizId, group } 가 같은 step 객체 안에 있다고 가정. 정규식
    // 으로 step 영역을 추출하고 안에서 필드를 매칭.
    const stepRe =
      /id:\s*'([\w-]+)'[\s\S]*?(?:quizId:\s*'([\w-]+)')?[\s\S]*?(?:group:\s*'([\w-]+)')?[\s\S]*?(?=\n\s{4}\}\s*,?\s*\n)/g;
    // 위 regex 가 너무 광범위. 더 간단히: 라인 단위로 step 객체 진입 — `    {` 부터
    // `    },` 까지를 하나로 묶고 그 안에서 추출.
    // (TS 파일 들여쓰기 4칸 컨벤션 가정)
    const lines = src.split('\n');
    let cur = null;
    for (const line of lines) {
      if (/^    \{\s*$/.test(line)) {
        cur = { id: null, quizId: null, group: null };
        continue;
      }
      if (cur) {
        const idM = line.match(/^\s+id:\s*'([\w-]+)'/);
        if (idM && !cur.id) cur.id = idM[1];
        const qM = line.match(/^\s+quizId:\s*'([\w-]+)'/);
        if (qM && !cur.quizId) cur.quizId = qM[1];
        const gM = line.match(/^\s+group:\s*'([\w-]+)'/);
        if (gM && !cur.group) cur.group = gM[1];
        if (/^    \},?\s*$/.test(line)) {
          if (cur.id && cur.quizId) {
            const groupKey = cur.group ?? extractGroupKey(cur.id);
            if (!q2g.has(cur.quizId)) q2g.set(cur.quizId, groupKey);
            if (!g2q.has(groupKey)) g2q.set(groupKey, new Set());
            g2q.get(groupKey).add(cur.quizId);
          }
          cur = null;
        }
      }
    }
  }

  return { q2g, g2q };
}

function extractGroupKey(stepId) {
  const m = stepId.match(/^(.+-s\d+)(?:-[a-zA-Z][a-zA-Z0-9-]*)?$/);
  return m ? m[1] : stepId;
}

// ─── 모든 question JSON 로드 ───
function walkJSON(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkJSON(p, out);
    else if (entry.name.endsWith('.json')) out.push(p);
  }
  return out;
}

function loadQuestions() {
  const all = [];
  for (const file of walkJSON(QUESTIONS_ROOT)) {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    let arr;
    if (Array.isArray(raw)) arr = raw;
    else if (raw && Array.isArray(raw.questions)) arr = raw.questions;
    else continue;
    for (const q of arr) {
      if (!q || typeof q !== 'object') continue;
      if (q.type !== 'multiple_choice') continue;
      if (q.status === 'restored') continue;
      if (q.needsDistractors) continue;
      all.push(q);
    }
  }
  return all;
}

const ALL = loadQuestions();
const QUESTION_IDS = new Set(ALL.map((q) => q.id));
console.log(`\n📚 총 playable 문항: ${ALL.length}`);

const { q2g, g2q } = extractStepGroups();
console.log(`🔗 lesson step → quizId 매핑: ${q2g.size} 개`);
console.log(`📦 group 수: ${g2q.size}\n`);

// 각 lesson quizId 의 group 내 다른 quiz 수 측정
const buckets = []; // { quizId, group, count }
for (const [qid, gkey] of q2g.entries()) {
  if (subjectFilter && !qid.startsWith(subjectFilter + '-')) continue;
  const groupQuizIds = g2q.get(gkey);
  let count = 0;
  for (const other of groupQuizIds) {
    if (other === qid) continue;
    if (QUESTION_IDS.has(other)) count++;
  }
  buckets.push({ quizId: qid, group: gkey, count });
}

// 통계
const stats = { 0: 0, 1: 0, 2: 0, '3+': 0 };
for (const b of buckets) {
  if (b.count === 0) stats[0]++;
  else if (b.count === 1) stats[1]++;
  else if (b.count === 2) stats[2]++;
  else stats['3+']++;
}

console.log('=== group 기반 분포 (lesson quiz 전체) ===');
console.log(`  count = 0   : ${stats[0]}  (그룹 단독 step — 풀 비어있음, 버튼 숨김)`);
console.log(`  count = 1   : ${stats[1]}  (1문 노출)`);
console.log(`  count = 2   : ${stats[2]}  (2문 노출)`);
console.log(`  count >= 3  : ${stats['3+']} (3문+ 노출)`);

const thin = buckets
  .filter((b) => b.count < threshold)
  .sort((a, b) => a.count - b.count || a.quizId.localeCompare(b.quizId));

console.log(`\n=== count < ${threshold} 인 quiz (${thin.length}건) ===\n`);

const byGroup = new Map();
for (const b of thin) {
  if (!byGroup.has(b.group)) byGroup.set(b.group, []);
  byGroup.get(b.group).push(b);
}

for (const [grp, list] of [...byGroup.entries()].sort()) {
  console.log(`📌 group ${grp}  (${list[0].count + 1} step — thin)`);
  for (const b of list) {
    console.log(`     ${b.quizId.padEnd(36)} similar=${b.count}`);
  }
}

if (thin.length === 0) {
  console.log(`✅ 모든 lesson quiz 가 group 안에 ≥${threshold} 다른 문제 보유.`);
}
