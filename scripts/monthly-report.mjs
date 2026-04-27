// scripts/monthly-report.mjs
//
// QuestDP — 월간 운영 보고서 자동 생성기.
//
// Supabase 에서 전월(또는 지정 월) 데이터를 집계해 .xlsx 파일로 출력.
// 시트:
//   1. 요약            — 핵심 KPI (가입·활성·프리미엄·세션 합계)
//   2. 일별 활동       — 가입/세션/정답률 추이
//   3. 사용자          — 신규 가입자 + 누적 XP TOP 20
//   4. 학습 콘텐츠     — 챕터별 세션 수, 정답률
//   5. 어려운 문항     — 정답률 낮은 문항 TOP 30 (난이도 튜닝용)
//   6. 재무 (placeholder) — 결제 연동 후 자동 채워짐
//   7. 부가세 / 세무   — 매출세액 / 매입세액 자동 분리 (결제 연동 후)
//
// 사용법:
//   1. .env.local 에 SUPABASE_SERVICE_ROLE_KEY 추가 (Dashboard → Project Settings → API → service_role secret)
//      ⚠️ service role 키는 RLS 우회 — 반드시 .env.local 에만, git X
//   2. node scripts/monthly-report.mjs                # 전월 보고서
//      node scripts/monthly-report.mjs 2026-04        # 특정 월 보고서
//
// 출력: ./reports/YYYY-MM.xlsx

import 'dotenv/config';
import { config as loadDotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// .env.local 우선 로드 (서비스 롤 키는 .env 가 아닌 .env.local 에)
loadDotenv({ path: '.env.local', override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// ── 환경 변수 ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL (또는 VITE_SUPABASE_URL) 가 .env / .env.local 에 없습니다.');
  process.exit(1);
}
if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 없습니다.');
  console.error('   Dashboard → Project Settings → API → service_role 키 복사해서 추가.');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── 기간 결정 (인자 없으면 전월) ─────────────────────────────────────────
function resolvePeriod(arg) {
  let year, month;
  if (arg && /^\d{4}-\d{2}$/.test(arg)) {
    const [y, m] = arg.split('-').map(Number);
    year = y;
    month = m;
  } else {
    const now = new Date();
    // 전월
    year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    month = now.getMonth() === 0 ? 12 : now.getMonth();
  }
  // KST (UTC+9) 로 월 시작/끝 계산 후 ISO 변환
  const startKst = new Date(Date.UTC(year, month - 1, 1, -9, 0, 0));
  const endKst = new Date(Date.UTC(year, month, 1, -9, 0, 0));
  return {
    label: `${year}-${String(month).padStart(2, '0')}`,
    year,
    month,
    startIso: startKst.toISOString(),
    endIso: endKst.toISOString(),
  };
}

const period = resolvePeriod(process.argv[2]);
console.log(`\n📊 QuestDP 월간 보고서 생성 — ${period.label}`);
console.log(`   기간: ${period.startIso} → ${period.endIso} (KST 기준 월간)`);

// ── 헬퍼 ──────────────────────────────────────────────────────────────────
function fmtPct(n, total) {
  if (!total) return '—';
  return `${((n / total) * 100).toFixed(1)}%`;
}

function fmtMs(ms) {
  if (!ms) return '0초';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}초`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${min}분 ${remSec}초`;
}

// 모든 row 가져오기 (Supabase 1000건 제한 우회)
async function fetchAll(query, pageSize = 1000) {
  const all = [];
  let from = 0;
  while (true) {
    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

// ── 데이터 수집 ───────────────────────────────────────────────────────────
async function collectData() {
  console.log('\n📥 데이터 수집 중…');

  // 1. profiles 전체 (사용자 모수)
  const { data: profiles, error: profErr } = await sb
    .from('profiles')
    .select(
      'id, tag, display_name, total_xp, level, streak_days, last_seen_at, last_played_date, is_premium, premium_until, energy_count, active_subject, created_at',
    );
  if (profErr) throw profErr;
  console.log(`   ✓ profiles: ${profiles.length}명`);

  // 2. 전월 sessions
  const sessions = await fetchAll(
    sb
      .from('sessions')
      .select(
        'id, user_id, subject, chapter, chapter_title, topic, total, correct_count, total_time_ms, label, flow, ended_at',
      )
      .gte('ended_at', period.startIso)
      .lt('ended_at', period.endIso)
      .order('ended_at', { ascending: true }),
  );
  console.log(`   ✓ sessions (전월): ${sessions.length}건`);

  // 3. 전월 question_stats (마지막 응답 기준 필터 — last_seen_at 사용)
  const qstats = await fetchAll(
    sb
      .from('question_stats')
      .select('user_id, question_id, attempts, correct, last_seen_at, avg_time_ms')
      .gte('last_seen_at', period.startIso)
      .lt('last_seen_at', period.endIso),
  );
  console.log(`   ✓ question_stats (전월 활동): ${qstats.length}건`);

  // 4. 전월 신규 가입자
  const newUsers = profiles.filter(
    (p) => p.created_at >= period.startIso && p.created_at < period.endIso,
  );
  console.log(`   ✓ 신규 가입자: ${newUsers.length}명`);

  return { profiles, sessions, qstats, newUsers };
}

// ── 시트 빌더 ─────────────────────────────────────────────────────────────

// Sheet 1: 요약 KPI
function buildSummary(ws, { profiles, sessions, newUsers }) {
  ws.columns = [
    { header: '지표', key: 'k', width: 32 },
    { header: '값', key: 'v', width: 24 },
    { header: '비고', key: 'note', width: 40 },
  ];

  const activeIds = new Set(sessions.map((s) => s.user_id));
  const premiumCount = profiles.filter((p) => p.is_premium).length;
  const totalQuestions = sessions.reduce((acc, s) => acc + s.total, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.correct_count, 0);
  const totalTimeMs = sessions.reduce((acc, s) => acc + s.total_time_ms, 0);

  const adspSessions = sessions.filter((s) => s.subject === 'adsp');
  const sqldSessions = sessions.filter((s) => s.subject === 'sqld');

  const rows = [
    { k: '— 사용자 —', v: '', note: '' },
    { k: '누적 가입자', v: profiles.length, note: '서비스 시작 이래 전체' },
    { k: '신규 가입자 (전월)', v: newUsers.length, note: '' },
    {
      k: '월간 활성 사용자 (MAU)',
      v: activeIds.size,
      note: `세션 ≥ 1회 기준 — ${fmtPct(activeIds.size, profiles.length)}`,
    },
    { k: '프리미엄 사용자', v: premiumCount, note: fmtPct(premiumCount, profiles.length) },

    { k: '— 학습 활동 —', v: '', note: '' },
    { k: '총 세션 수', v: sessions.length, note: '' },
    { k: '총 풀이 문항', v: totalQuestions, note: '' },
    { k: '평균 정답률', v: fmtPct(totalCorrect, totalQuestions), note: '' },
    { k: '총 학습 시간', v: fmtMs(totalTimeMs), note: '' },
    {
      k: '사용자당 평균 세션',
      v: activeIds.size ? (sessions.length / activeIds.size).toFixed(1) : '0',
      note: 'MAU 기준',
    },

    { k: '— 과목별 —', v: '', note: '' },
    { k: 'ADSP 세션', v: adspSessions.length, note: fmtPct(adspSessions.length, sessions.length) },
    { k: 'SQLD 세션', v: sqldSessions.length, note: fmtPct(sqldSessions.length, sessions.length) },

    { k: '— 흐름 —', v: '', note: '' },
    {
      k: '학습 모드 (learn)',
      v: sessions.filter((s) => s.flow === 'learn').length,
      note: '레슨 + 인라인 퀴즈',
    },
    {
      k: '풀이 모드 (play)',
      v: sessions.filter((s) => s.flow === 'play').length,
      note: '실전 세트',
    },
    {
      k: '시험 모드 (test)',
      v: sessions.filter((s) => s.flow === 'test').length,
      note: '챕터 모의고사',
    },
  ];

  rows.forEach((r) => ws.addRow(r));

  // 헤더 + 섹션 헤더 굵게
  ws.getRow(1).font = { bold: true, size: 12 };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A1F33' },
  };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFEFF4FF' }, size: 12 };

  rows.forEach((r, i) => {
    if (r.k.startsWith('—')) {
      const row = ws.getRow(i + 2);
      row.font = { bold: true, color: { argb: 'FF6FFF00' } };
    }
  });
}

// Sheet 2: 일별 활동
function buildDaily(ws, { sessions, profiles, period }) {
  ws.columns = [
    { header: '날짜', key: 'd', width: 12 },
    { header: '신규 가입', key: 'nu', width: 12 },
    { header: '활성 사용자', key: 'au', width: 14 },
    { header: '세션 수', key: 'sc', width: 12 },
    { header: '풀이 문항', key: 'q', width: 12 },
    { header: '정답률', key: 'ar', width: 12 },
  ];

  // 날짜별 버킷
  const buckets = new Map(); // YYYY-MM-DD → { newUsers, activeUsers:Set, sessions, total, correct }
  const dim = new Date(Date.UTC(period.year, period.month, 0)).getDate();

  for (let d = 1; d <= dim; d++) {
    const key = `${period.year}-${String(period.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    buckets.set(key, { newUsers: 0, activeUsers: new Set(), sessions: 0, total: 0, correct: 0 });
  }

  // KST 기준 일자 추출
  const toKstDate = (iso) => {
    const d = new Date(iso);
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
  };

  profiles.forEach((p) => {
    if (p.created_at >= period.startIso && p.created_at < period.endIso) {
      const key = toKstDate(p.created_at);
      const b = buckets.get(key);
      if (b) b.newUsers++;
    }
  });

  sessions.forEach((s) => {
    const key = toKstDate(s.ended_at);
    const b = buckets.get(key);
    if (!b) return;
    b.activeUsers.add(s.user_id);
    b.sessions++;
    b.total += s.total;
    b.correct += s.correct_count;
  });

  for (const [d, b] of buckets) {
    ws.addRow({
      d,
      nu: b.newUsers,
      au: b.activeUsers.size,
      sc: b.sessions,
      q: b.total,
      ar: fmtPct(b.correct, b.total),
    });
  }

  ws.getRow(1).font = { bold: true, color: { argb: 'FFEFF4FF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F33' } };
}

// Sheet 3: 사용자 TOP
function buildUsers(ws, { profiles, sessions }) {
  ws.columns = [
    { header: '순위', key: 'rank', width: 6 },
    { header: '태그', key: 'tag', width: 18 },
    { header: '닉네임', key: 'name', width: 18 },
    { header: '레벨', key: 'lv', width: 8 },
    { header: '누적 XP', key: 'xp', width: 12 },
    { header: '연속일', key: 'streak', width: 10 },
    { header: '활성 과목', key: 'subj', width: 10 },
    { header: '월 세션', key: 'ms', width: 10 },
    { header: '프리미엄', key: 'prem', width: 10 },
    { header: '최근 접속', key: 'last', width: 22 },
  ];

  const monthSessionsByUser = new Map();
  sessions.forEach((s) => {
    monthSessionsByUser.set(s.user_id, (monthSessionsByUser.get(s.user_id) ?? 0) + 1);
  });

  const top = [...profiles]
    .sort((a, b) => b.total_xp - a.total_xp)
    .slice(0, 50);

  top.forEach((p, i) => {
    ws.addRow({
      rank: i + 1,
      tag: p.tag,
      name: p.display_name || '—',
      lv: p.level,
      xp: p.total_xp,
      streak: p.streak_days,
      subj: p.active_subject ?? '—',
      ms: monthSessionsByUser.get(p.id) ?? 0,
      prem: p.is_premium ? 'O' : '',
      last: p.last_seen_at ? new Date(p.last_seen_at).toLocaleString('ko-KR') : '—',
    });
  });

  ws.getRow(1).font = { bold: true, color: { argb: 'FFEFF4FF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F33' } };
}

// Sheet 4: 학습 콘텐츠 — 챕터별
function buildContent(ws, { sessions }) {
  ws.columns = [
    { header: '과목', key: 'subj', width: 8 },
    { header: '챕터', key: 'ch', width: 8 },
    { header: '챕터 제목', key: 'title', width: 32 },
    { header: '세션 수', key: 'sc', width: 10 },
    { header: '풀이 문항', key: 'q', width: 12 },
    { header: '정답률', key: 'ar', width: 10 },
    { header: '평균 시간', key: 't', width: 14 },
  ];

  const map = new Map(); // `${subj}-${ch}` → agg
  sessions.forEach((s) => {
    const k = `${s.subject}-${s.chapter}`;
    if (!map.has(k)) {
      map.set(k, {
        subj: s.subject,
        ch: s.chapter,
        title: s.chapter_title,
        sc: 0,
        q: 0,
        correct: 0,
        timeMs: 0,
      });
    }
    const agg = map.get(k);
    agg.sc++;
    agg.q += s.total;
    agg.correct += s.correct_count;
    agg.timeMs += s.total_time_ms;
  });

  [...map.values()]
    .sort((a, b) => (a.subj === b.subj ? a.ch - b.ch : a.subj.localeCompare(b.subj)))
    .forEach((a) =>
      ws.addRow({
        subj: a.subj.toUpperCase(),
        ch: a.ch,
        title: a.title,
        sc: a.sc,
        q: a.q,
        ar: fmtPct(a.correct, a.q),
        t: fmtMs(a.sc ? a.timeMs / a.sc : 0),
      }),
    );

  ws.getRow(1).font = { bold: true, color: { argb: 'FFEFF4FF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F33' } };
}

// Sheet 5: 어려운 문항 TOP 30
function buildHardQuestions(ws, { qstats }) {
  ws.columns = [
    { header: '순위', key: 'rank', width: 6 },
    { header: '문항 ID', key: 'qid', width: 36 },
    { header: '시도자 수', key: 'users', width: 12 },
    { header: '총 시도', key: 'attempts', width: 10 },
    { header: '정답', key: 'correct', width: 10 },
    { header: '정답률', key: 'rate', width: 10 },
    { header: '평균 시간', key: 't', width: 14 },
  ];

  // 문항별 집계
  const map = new Map();
  qstats.forEach((s) => {
    if (!map.has(s.question_id)) {
      map.set(s.question_id, { users: new Set(), attempts: 0, correct: 0, timeSum: 0 });
    }
    const a = map.get(s.question_id);
    a.users.add(s.user_id);
    a.attempts += s.attempts;
    a.correct += s.correct;
    a.timeSum += (s.avg_time_ms || 0) * s.attempts;
  });

  const arr = [...map.entries()]
    .map(([qid, a]) => ({
      qid,
      users: a.users.size,
      attempts: a.attempts,
      correct: a.correct,
      rate: a.attempts ? a.correct / a.attempts : 0,
      avgTime: a.attempts ? a.timeSum / a.attempts : 0,
    }))
    .filter((x) => x.attempts >= 3) // 통계 의미 있을 정도
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 30);

  arr.forEach((x, i) =>
    ws.addRow({
      rank: i + 1,
      qid: x.qid,
      users: x.users,
      attempts: x.attempts,
      correct: x.correct,
      rate: fmtPct(x.correct, x.attempts),
      t: fmtMs(x.avgTime),
    }),
  );

  ws.getRow(1).font = { bold: true, color: { argb: 'FFEFF4FF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F33' } };
}

// Sheet 6: 재무 (placeholder)
function buildFinance(ws) {
  ws.columns = [
    { header: '항목', key: 'k', width: 28 },
    { header: '금액 (원)', key: 'v', width: 16 },
    { header: '메모', key: 'note', width: 50 },
  ];

  const rows = [
    { k: '— 매출 —', v: '', note: '결제 연동 후 자동 채워짐' },
    { k: '월 구독 매출 (Toss)', v: 0, note: 'TODO: Toss API 연동' },
    { k: '월 구독 매출 (Stripe)', v: 0, note: 'TODO: Stripe API 연동' },
    { k: '환불액', v: 0, note: '' },
    { k: '순매출 합계', v: 0, note: '' },
    { k: '— 매입 / 경비 —', v: '', note: '청구서 메일 자동 분류' },
    { k: 'Supabase Pro', v: 0, note: 'TODO: Gmail MCP — invoice 라벨' },
    { k: 'Cloudflare', v: 0, note: '' },
    { k: 'Mux 비디오', v: 0, note: '' },
    { k: '도메인', v: 0, note: '' },
    { k: '광고비 (메타·구글)', v: 0, note: '' },
    { k: '경비 합계', v: 0, note: '' },
    { k: '— 결과 —', v: '', note: '' },
    { k: '월 순이익', v: 0, note: '매출 - 경비' },
    { k: '— 부가세 분리 —', v: '', note: '간이과세자 가정' },
    { k: '매출세액 (10%)', v: 0, note: '일반과세자 전환 시 활성화' },
    { k: '매입세액 공제분', v: 0, note: '' },
  ];

  rows.forEach((r) => ws.addRow(r));

  ws.getRow(1).font = { bold: true, color: { argb: 'FFEFF4FF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F33' } };
  rows.forEach((r, i) => {
    if (r.k.startsWith('—')) {
      ws.getRow(i + 2).font = { bold: true, color: { argb: 'FF6FFF00' } };
    }
  });
}

// Sheet 7: 세무 신고용 (placeholder)
function buildTax(ws) {
  ws.columns = [
    { header: '항목', key: 'k', width: 32 },
    { header: '값', key: 'v', width: 20 },
    { header: '메모', key: 'note', width: 60 },
  ];

  const rows = [
    { k: '과세유형', v: '간이과세자', note: '연매출 8000만원 미만 — 자동' },
    { k: '신고 주기', v: '연 1회 (1월 25일)', note: '일반과세자 전환 시 1·7월' },
    { k: '— 매출 자료 —', v: '', note: '' },
    { k: 'PG 매출 합계', v: 0, note: 'Toss 정산내역 + Stripe payouts' },
    { k: '카드 매출 (자동신고)', v: 0, note: '국세청 연동 자동' },
    { k: '— 매입 자료 —', v: '', note: '' },
    { k: '세금계산서 받은 매입', v: 0, note: 'B2B 거래분' },
    { k: '카드 매입', v: 0, note: '사업용 카드 사용분' },
    { k: '현금영수증 매입', v: 0, note: '' },
    { k: '— 종합소득세 (5월) —', v: '', note: '' },
    { k: '연간 매출 추정', v: 0, note: '월평균 × 12' },
    { k: '연간 경비 추정', v: 0, note: '' },
    { k: '예상 사업소득', v: 0, note: '매출 - 경비' },
    { k: '예상 산출세액', v: '—', note: '회계 SaaS 자동 계산 권장' },
  ];

  rows.forEach((r) => ws.addRow(r));

  ws.getRow(1).font = { bold: true, color: { argb: 'FFEFF4FF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1F33' } };
  rows.forEach((r, i) => {
    if (r.k.startsWith('—')) {
      ws.getRow(i + 2).font = { bold: true, color: { argb: 'FF6FFF00' } };
    }
  });
}

// ── 실행 ──────────────────────────────────────────────────────────────────
async function main() {
  const data = await collectData();

  console.log('\n📝 Excel 작성 중…');

  const wb = new ExcelJS.Workbook();
  wb.creator = 'QuestDP Auto Report';
  wb.created = new Date();
  wb.title = `QuestDP 월간 보고서 ${period.label}`;

  buildSummary(wb.addWorksheet('1. 요약'), data);
  buildDaily(wb.addWorksheet('2. 일별 활동'), { ...data, period });
  buildUsers(wb.addWorksheet('3. 사용자'), data);
  buildContent(wb.addWorksheet('4. 학습 콘텐츠'), data);
  buildHardQuestions(wb.addWorksheet('5. 어려운 문항'), data);
  buildFinance(wb.addWorksheet('6. 재무'));
  buildTax(wb.addWorksheet('7. 세무'));

  // 출력
  const outDir = path.join(projectRoot, 'reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${period.label}.xlsx`);
  await wb.xlsx.writeFile(outPath);

  console.log(`\n✅ 보고서 생성 완료 — ${outPath}`);
  console.log('   시트: 1.요약 / 2.일별 / 3.사용자 / 4.콘텐츠 / 5.어려운 문항 / 6.재무 / 7.세무');
}

main().catch((err) => {
  console.error('\n❌ 보고서 생성 실패:', err);
  process.exit(1);
});
