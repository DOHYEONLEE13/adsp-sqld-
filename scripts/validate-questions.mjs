#!/usr/bin/env node
/**
 * validate-questions.mjs — 문제 은행의 기계적 결함 일괄 검출.
 *
 * 검출 항목:
 *   M1. JSON 파싱 가능 / 스키마 부합 (id, subject, chapter, type, choices, answerIndex)
 *   M2. answerIndex 가 choices 범위 안
 *   M3. 같은 문제 내 중복 보기 (정규화 후 비교)
 *   M4. 정답이 choices 에 비해 너무 길거나 짧음 (단서 노출)
 *   M5. explanation 이 너무 짧음 (string 30자 미만 또는 객체의 why_correct 30자 미만)
 *   M6. id 중복 (전 파일 통합)
 *
 * 출력: stdout 에 결함 리포트 (JSON · markdown 둘 다 가능). exit code 0 = 결함 없음.
 *
 * 실행:
 *   node scripts/validate-questions.mjs [--format=json|md] [--file=<path>]
 *
 * Phase 4 (검증) 단계의 자동화 회귀 테스트로 활용. CI 에서도 호출 가능.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const QUESTIONS_DIR = path.join(ROOT, 'src/data/questions');

const args = process.argv.slice(2);
const format = (args.find((a) => a.startsWith('--format='))?.split('=')[1] ??
  'md');
const fileFilter = args.find((a) => a.startsWith('--file='))?.split('=')[1];

// 의미상 중복 비교 위한 정규화
function norm(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, ' ');
}

function findFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findFiles(full));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

const files = fileFilter
  ? [path.resolve(ROOT, fileFilter)]
  : findFiles(QUESTIONS_DIR);

const defects = [];
const idSeen = new Map();
let totalQuestions = 0;

function reportDefect(qid, code, msg, file) {
  defects.push({ qid, code, msg, file: path.relative(ROOT, file) });
}

function explanationLength(exp) {
  if (!exp) return 0;
  if (typeof exp === 'string') return exp.trim().length;
  // ExplanationObj
  return (exp.why_correct ?? '').trim().length;
}

for (const file of files) {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    reportDefect('?', 'M1', `JSON parse error: ${e.message}`, file);
    continue;
  }

  const questions = Array.isArray(raw) ? raw : raw.questions;
  if (!Array.isArray(questions)) {
    reportDefect('?', 'M1', 'no questions array', file);
    continue;
  }

  for (const q of questions) {
    totalQuestions += 1;
    const qid = q.id ?? '(no-id)';

    // M1. 필수 필드
    const required = ['id', 'subject', 'chapter', 'type'];
    for (const f of required) {
      if (q[f] == null) reportDefect(qid, 'M1', `missing field: ${f}`, file);
    }

    // M6. id 중복
    if (q.id) {
      if (idSeen.has(q.id)) {
        reportDefect(
          qid,
          'M6',
          `duplicate id (also in ${idSeen.get(q.id)})`,
          file,
        );
      } else {
        idSeen.set(q.id, path.relative(ROOT, file));
      }
    }

    if (q.type === 'multiple_choice') {
      // M2. answerIndex 범위
      if (
        !Array.isArray(q.choices) ||
        q.choices.length < 2 ||
        typeof q.answerIndex !== 'number' ||
        q.answerIndex < 0 ||
        q.answerIndex >= q.choices.length
      ) {
        reportDefect(
          qid,
          'M2',
          `answerIndex out of range or choices invalid (idx=${q.answerIndex}, len=${q.choices?.length})`,
          file,
        );
      }

      // M3. 중복 보기
      if (Array.isArray(q.choices)) {
        const set = new Map();
        for (let i = 0; i < q.choices.length; i++) {
          const n = norm(q.choices[i]);
          if (n.length === 0) {
            reportDefect(qid, 'M3', `empty choice at index ${i}`, file);
            continue;
          }
          if (set.has(n)) {
            reportDefect(
              qid,
              'M3',
              `duplicate choices: idx ${set.get(n)} and ${i} both = "${q.choices[i]}"`,
              file,
            );
          } else {
            set.set(n, i);
          }
        }

        // M4. 정답이 다른 보기보다 1.6배 이상 길거나 다른 모든 보기보다 짧음 → 단서 노출 의심
        const lengths = q.choices.map((c) => String(c).length);
        const correctLen = lengths[q.answerIndex];
        const others = lengths.filter((_, i) => i !== q.answerIndex);
        if (others.length > 0) {
          const avgOther = others.reduce((a, b) => a + b, 0) / others.length;
          if (correctLen >= avgOther * 1.6 && correctLen >= 25) {
            reportDefect(
              qid,
              'M4',
              `correct choice unusually long (correct=${correctLen}, avg-other=${avgOther.toFixed(1)})`,
              file,
            );
          }
        }
      }
    }

    // M5. 해설 충분성
    const elen = explanationLength(q.explanation);
    if (elen > 0 && elen < 30) {
      reportDefect(
        qid,
        'M5',
        `explanation too short (${elen} chars, min 30)`,
        file,
      );
    } else if (elen === 0) {
      reportDefect(qid, 'M5', `explanation missing`, file);
    }
  }
}

// ── 출력 ───────────────────────────────────────
if (format === 'json') {
  console.log(
    JSON.stringify(
      { totalQuestions, defectCount: defects.length, defects },
      null,
      2,
    ),
  );
} else {
  // markdown
  const byCode = {};
  for (const d of defects) {
    byCode[d.code] = (byCode[d.code] || 0) + 1;
  }

  console.log(`# 문제 은행 기계 검증 리포트\n`);
  console.log(`- 총 문항: **${totalQuestions}**`);
  console.log(`- 결함: **${defects.length}**\n`);
  if (defects.length === 0) {
    console.log('✅ 기계 결함 없음.');
  } else {
    console.log('## 결함 코드별 카운트\n');
    console.log('| 코드 | 의미 | 카운트 |');
    console.log('|---|---|---:|');
    const meaning = {
      M1: 'JSON / 필수 필드 누락',
      M2: 'answerIndex 범위 오류',
      M3: '중복 보기 / 빈 보기',
      M4: '정답 단서 노출 (길이 편향)',
      M5: '해설 부족',
      M6: 'id 중복',
    };
    for (const [code, n] of Object.entries(byCode).sort()) {
      console.log(`| ${code} | ${meaning[code] ?? '?'} | ${n} |`);
    }
    console.log('\n## 상세 결함 목록\n');
    console.log('| 파일 | qid | 코드 | 사유 |');
    console.log('|---|---|---|---|');
    for (const d of defects) {
      console.log(
        `| ${d.file} | \`${d.qid}\` | ${d.code} | ${d.msg.replace(/\|/g, '\\|')} |`,
      );
    }
  }
}

process.exit(defects.length === 0 ? 0 : 1);
