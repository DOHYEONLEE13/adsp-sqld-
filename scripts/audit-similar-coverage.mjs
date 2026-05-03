/**
 * audit-similar-coverage.mjs — "비슷한 문제 더 풀기" 풀 커버리지 점검.
 *
 * 각 concept-practice 문제 (cp-XX) 가 같은 (subject, chapter, canonicalTopic)
 * 안에서 본인 외 다른 문제를 몇 개 가지고 있는지 측정. < 3 인 cp 가 보강 작성
 * 우선순위 후보.
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

// CLI 인자
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const subjectFilter = args.subject; // 'adsp' | 'sqld' | undefined
const threshold = Number(args.threshold ?? 3);

// ─── canonicalTopic 미니 구현 — topicAlias.ts 의 로직만 재현 (파일 직접 import 불가) ───
// 변환 매핑은 topicAlias.ts 가 source of truth — 여기선 단순화: q.topic 그대로 사용.
// (cp-XX 자체는 schema topic 그대로라 정확. 기출 raw 매핑 정확도는 약간 낮을 수
// 있으나 audit 용도엔 충분.)
function canonicalTopic(q) {
  return q.topic;
}

// ─── 모든 question JSON 파일 재귀 로드 ───
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
console.log(`\n📚 총 playable 문항: ${ALL.length}`);

// concept-practice 문제만 (id pattern: <subject>-<ch>-<topicId>-cp-NN)
const CP_RE = /-cp(-[a-z0-9-]+)?$/;
const cps = ALL.filter((q) => CP_RE.test(q.id));
console.log(`🎯 concept-practice (cp-XX) 문항: ${cps.length}\n`);

// 각 cp 의 same (subject, chapter, canonicalTopic) 풀 카운트
const buckets = []; // { cp, subject, chapter, topic, similarCount }
for (const cp of cps) {
  if (subjectFilter && cp.subject !== subjectFilter) continue;
  const canon = canonicalTopic(cp);
  const similar = ALL.filter(
    (q) =>
      q.id !== cp.id &&
      q.subject === cp.subject &&
      q.chapter === cp.chapter &&
      canonicalTopic(q) === canon,
  );
  buckets.push({
    cp: cp.id,
    subject: cp.subject,
    chapter: cp.chapter,
    topic: cp.topic,
    similarCount: similar.length,
  });
}

// 통계
const statBuckets = { 0: 0, 1: 0, 2: 0, '3+': 0 };
for (const b of buckets) {
  if (b.similarCount === 0) statBuckets[0]++;
  else if (b.similarCount === 1) statBuckets[1]++;
  else if (b.similarCount === 2) statBuckets[2]++;
  else statBuckets['3+']++;
}

console.log('=== 분포 ===');
console.log(`  count = 0   : ${statBuckets[0]}  (우선 작성 필요)`);
console.log(`  count = 1   : ${statBuckets[1]}  (보강 후보)`);
console.log(`  count = 2   : ${statBuckets[2]}  (보강 후보)`);
console.log(`  count >= 3  : ${statBuckets['3+']} (충분)`);

const thin = buckets
  .filter((b) => b.similarCount < threshold)
  .sort((a, b) => a.similarCount - b.similarCount || a.cp.localeCompare(b.cp));

console.log(
  `\n=== count < ${threshold} 인 cp (총 ${thin.length}건, 우선순위 list) ===\n`,
);

// 토픽별로 그룹핑해서 출력 (작성 batch 단위로 보기 편하게)
const byTopic = new Map();
for (const b of thin) {
  const key = `${b.subject} · Ch${b.chapter} · ${b.topic}`;
  if (!byTopic.has(key)) byTopic.set(key, []);
  byTopic.get(key).push(b);
}

const topicEntries = [...byTopic.entries()].sort(
  (a, b) => b[1].length - a[1].length, // thin cp 많은 토픽 우선
);
for (const [topic, list] of topicEntries) {
  console.log(`📌 ${topic}  (thin cp ${list.length}건)`);
  for (const b of list) {
    console.log(`     ${b.cp.padEnd(32)} similar=${b.similarCount}`);
  }
}

console.log(
  `\n💡 작성 가이드: 위 토픽별로 batch 작성 → src/data/questions/<subject>/concept-practice-similar.json 적재.`,
);
console.log(
  `   M1~M6 검증: npm run audit (또는 node scripts/validate-questions.mjs)\n`,
);

if (thin.length === 0) {
  console.log(`✅ 모든 cp 가 similar count >= ${threshold} — 보강 불필요!`);
  process.exit(0);
}
process.exit(0);
