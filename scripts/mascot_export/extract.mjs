#!/usr/bin/env node
/**
 * extract.mjs — 마스코트 발화 (LessonStep.dialogue) 일괄 추출 → 워드 5개 생성.
 *
 * 운영 코드 (src/data/lessons/) 변경 0. 출력만 — outputs/mascot_review/.
 *
 * 흐름:
 *   1) TS Compiler API 로 lesson .ts 파일의 AST 파싱
 *   2) const X: Lesson = { ... } 패턴 인식 → Lesson 객체 추출
 *   3) 각 lesson 의 steps[].dialogue[] (text + pose) 수집
 *   4) docx 라이브러리로 5 워드 파일 생성
 *
 * 5 그룹:
 *   - ADsP ch1 (1과목 — 데이터 이해)
 *   - ADsP ch2 (2과목 — 데이터 분석 기획)
 *   - ADsP ch3 (3과목 — 데이터 분석)
 *   - SQLD ch1-modeling (1과목 — 데이터 모델링)
 *   - SQLD ch2-sql (2과목 — SQL 기본 및 활용)
 *
 * 출력 워드 구조:
 *   Heading1: 과목 제목
 *   목차 (자동)
 *   Heading2: chapter (단원)
 *   Heading3: lesson (▶ Lesson X-Y: 제목)
 *   체크박스: ☐ 검토 완료
 *   Heading4: ■ topic (step.title)
 *   현재: <dialogue text>   (회색 음영 + 들여쓰기)
 *   수정:                   (3줄 빈 공간)
 *
 * 실행: node scripts/mascot_export/extract.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import ts from 'typescript';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  StyleLevel,
  TableOfContents,
  TextRun,
} from 'docx';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, '..', '..');
const LESSONS_DIR = path.join(REPO, 'src/data/lessons');
const OUT_DIR = path.join(REPO, 'outputs/mascot_review');

// ── 5 그룹 정의 (지시서의 "과목" = 운영의 chapter) ─────────────────────────
const GROUPS = [
  {
    sourceFile: 'adsp/ch1.ts',
    subjectTitle: 'ADsP 1과목 — 데이터 이해',
    outFile: 'adsp-1과목-데이터이해.docx',
    chapterNumber: 1,
    subject: 'adsp',
  },
  {
    sourceFile: 'adsp/ch2.ts',
    subjectTitle: 'ADsP 2과목 — 데이터 분석 기획',
    outFile: 'adsp-2과목-분석기획.docx',
    chapterNumber: 2,
    subject: 'adsp',
  },
  {
    sourceFile: 'adsp/ch3.ts',
    subjectTitle: 'ADsP 3과목 — 데이터 분석',
    outFile: 'adsp-3과목-데이터분석.docx',
    chapterNumber: 3,
    subject: 'adsp',
  },
  {
    sourceFile: 'sqld/ch1-modeling.ts',
    subjectTitle: 'SQLD 1과목 — 데이터 모델링',
    outFile: 'sqld-1과목-데이터모델링.docx',
    chapterNumber: 1,
    subject: 'sqld',
  },
  {
    sourceFile: 'sqld/ch2-sql.ts',
    subjectTitle: 'SQLD 2과목 — SQL 기본 및 활용',
    outFile: 'sqld-2과목-SQL.docx',
    chapterNumber: 2,
    subject: 'sqld',
  },
];

const MASCOT = { adsp: '토리 (Tori)', sqld: '셀리 (Selli)' };

// ─── TS AST 파싱: Lesson 객체 + steps[].dialogue 추출 ──────────────────────

/**
 * .ts 파일에서 `const X: Lesson = { ... }` 패턴의 모든 Lesson 객체를 찾아
 * { id, topic, title, hook, chapterTitle, steps: [{ id, title, dialogue }] }
 * 형태로 반환. 다른 필드 (blocks, reminder 등) 는 무시.
 */
function extractLessonsFromFile(absPath) {
  const src = fs.readFileSync(absPath, 'utf8');
  const sourceFile = ts.createSourceFile(
    absPath,
    src,
    ts.ScriptTarget.ESNext,
    true,
  );

  const lessons = [];

  function visit(node) {
    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length === 1
    ) {
      const decl = node.declarationList.declarations[0];
      // 타입 어노테이션이 Lesson 인 변수만 추출
      if (
        decl.type &&
        ts.isTypeReferenceNode(decl.type) &&
        decl.type.typeName.getText(sourceFile) === 'Lesson' &&
        decl.initializer &&
        ts.isObjectLiteralExpression(decl.initializer)
      ) {
        const obj = parseLessonLiteral(decl.initializer, sourceFile);
        if (obj) lessons.push(obj);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return lessons;
}

function parseLessonLiteral(objExpr, sourceFile) {
  const out = {
    id: '',
    topic: '',
    title: '',
    hook: '',
    chapterTitle: '',
    chapter: 0,
    steps: [],
  };

  for (const prop of objExpr.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const name = prop.name.getText(sourceFile);
    const init = prop.initializer;

    if (name === 'id') out.id = literalString(init, sourceFile) ?? '';
    else if (name === 'topic') out.topic = literalString(init, sourceFile) ?? '';
    else if (name === 'title') out.title = literalString(init, sourceFile) ?? '';
    else if (name === 'hook') out.hook = literalString(init, sourceFile) ?? '';
    else if (name === 'chapterTitle')
      out.chapterTitle = literalString(init, sourceFile) ?? '';
    else if (name === 'chapter')
      out.chapter = Number(init.getText(sourceFile)) || 0;
    else if (name === 'steps' && ts.isArrayLiteralExpression(init)) {
      for (const stepExpr of init.elements) {
        if (!ts.isObjectLiteralExpression(stepExpr)) continue;
        out.steps.push(parseStepLiteral(stepExpr, sourceFile));
      }
    }
  }

  return out;
}

function parseStepLiteral(stepExpr, sourceFile) {
  const step = { id: '', title: '', dialogue: [], quizId: null };
  for (const prop of stepExpr.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const name = prop.name.getText(sourceFile);
    const init = prop.initializer;
    if (name === 'id') step.id = literalString(init, sourceFile) ?? '';
    else if (name === 'title') step.title = literalString(init, sourceFile) ?? '';
    else if (name === 'quizId') step.quizId = literalString(init, sourceFile);
    else if (name === 'dialogue' && ts.isArrayLiteralExpression(init)) {
      for (const turnExpr of init.elements) {
        if (!ts.isObjectLiteralExpression(turnExpr)) continue;
        const turn = { pose: 'idle', text: '' };
        for (const tp of turnExpr.properties) {
          if (!ts.isPropertyAssignment(tp)) continue;
          const tn = tp.name.getText(sourceFile);
          if (tn === 'pose')
            turn.pose = literalString(tp.initializer, sourceFile) ?? 'idle';
          else if (tn === 'text')
            turn.text = literalString(tp.initializer, sourceFile) ?? '';
        }
        step.dialogue.push(turn);
      }
    }
  }
  return step;
}

/** 문자열 / 템플릿 / 더하기 (concat) 를 모두 평탄화. */
function literalString(node, sourceFile) {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    let out = node.head.text;
    for (const span of node.templateSpans) {
      // 변수가 들어간 템플릿은 보존 — `${...}` 형태로 raw 표시
      const exprText = span.expression.getText(sourceFile);
      out += '${' + exprText + '}' + span.literal.text;
    }
    return out;
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const l = literalString(node.left, sourceFile);
    const r = literalString(node.right, sourceFile);
    if (l !== undefined && r !== undefined) return l + r;
  }
  return undefined;
}

// ─── docx 빌더 ────────────────────────────────────────────────────────────

function buildDocument(group, lessons) {
  const subjectMascot = MASCOT[group.subject];

  const sections = [];

  // ── 표지 + 안내 + 목차 ─────────────────────────────────────────────────
  const cover = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: group.subjectTitle, bold: true, size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `마스코트: ${subjectMascot}`,
          italics: true,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({ children: [new TextRun('')] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text:
            '검토 안내: 각 토픽의 "현재:" 박스는 운영 중인 마스코트 발화. ' +
            '"수정:" 영역에 새 문구를 입력하세요. 빈 칸은 변경 의사 없음으로 처리됩니다.',
          color: '555555',
          size: 20,
        }),
      ],
    }),
    new Paragraph({ children: [new TextRun('')] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '목차', bold: true })],
    }),
    new TableOfContents('Table of Contents', {
      hyperlink: true,
      headingStyleRange: '1-4',
      stylesWithLevels: [
        new StyleLevel('Heading1', 1),
        new StyleLevel('Heading2', 2),
        new StyleLevel('Heading3', 3),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: '(워드 열 때 F9 키로 목차 갱신)', italics: true, size: 18, color: '888888' })],
    }),
    new Paragraph({ pageBreakBefore: true, children: [new TextRun('')] }),
  ];
  sections.push(...cover);

  // ── 본문 ─────────────────────────────────────────────────────────────
  // 같은 chapterTitle 끼리 묶어 단원 헤딩 1번만 출력
  const byChapter = new Map(); // chapterTitle → lessons[]
  for (const lesson of lessons) {
    const key = lesson.chapterTitle || '단원';
    if (!byChapter.has(key)) byChapter.set(key, []);
    byChapter.get(key).push(lesson);
  }

  for (const [chapterTitle, chapterLessons] of byChapter) {
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: `【${chapterTitle}】`, bold: true })],
        spacing: { before: 240, after: 120 },
      }),
    );

    for (const lesson of chapterLessons) {
      // ▶ Lesson 제목
      sections.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [
            new TextRun({
              text: `▶ Lesson ${lesson.id}: ${lesson.topic}`,
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 80 },
        }),
      );

      // hook (참고용 부제)
      if (lesson.hook) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `(${lesson.title})`,
                italics: true,
                color: '666666',
                size: 20,
              }),
            ],
          }),
        );
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: lesson.hook,
                italics: true,
                color: '888888',
                size: 18,
              }),
            ],
            spacing: { after: 120 },
          }),
        );
      }

      // ☐ 검토 완료 체크박스
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '☐ 검토 완료',
              color: '999999',
              size: 18,
            }),
          ],
          spacing: { after: 160 },
        }),
      );

      // 각 step
      for (const step of lesson.steps) {
        // step 의 dialogue 가 비어있으면 (review 전용 step 등) 토픽 자체 생략
        if (!step.dialogue || step.dialogue.length === 0) continue;

        // ■ step 제목
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_4,
            children: [
              new TextRun({
                text: `■ ${step.title}`,
                bold: true,
                color: '6FFF00',
              }),
            ],
            spacing: { before: 160, after: 60 },
          }),
        );
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `(step id: ${step.id}${
                  step.quizId ? ' · quiz: ' + step.quizId : ''
                })`,
                italics: true,
                color: 'AAAAAA',
                size: 16,
              }),
            ],
            spacing: { after: 80 },
          }),
        );

        // 현재: 박스 (회색 음영 + 들여쓰기)
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: '현재:', bold: true, size: 20 })],
            spacing: { before: 80, after: 40 },
          }),
        );
        for (const turn of step.dialogue) {
          sections.push(
            new Paragraph({
              indent: { left: 360 },
              shading: {
                type: ShadingType.SOLID,
                color: 'F2F2F2',
                fill: 'F2F2F2',
              },
              children: [
                new TextRun({
                  text: `[${turn.pose}] `,
                  bold: true,
                  color: '666666',
                  size: 18,
                }),
                new TextRun({
                  text: turn.text,
                  size: 22,
                }),
              ],
              spacing: { before: 20, after: 20 },
            }),
          );
        }

        // 수정: 영역 (빈 줄 3개)
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: '수정:', bold: true, size: 20 })],
            spacing: { before: 120, after: 40 },
          }),
        );
        for (let i = 0; i < 3; i++) {
          sections.push(
            new Paragraph({
              indent: { left: 360 },
              children: [new TextRun({ text: ' ', size: 22 })],
              spacing: { before: 0, after: 0 },
            }),
          );
        }
      }
    }
  }

  return new Document({
    creator: 'QuestDP — mascot review export',
    title: group.subjectTitle,
    description: '마스코트 발화 검토용 문서',
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 36, bold: true, color: '0E0F18' },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 28, bold: true, color: '1E40AF' },
          paragraph: { spacing: { before: 200, after: 100 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 24, bold: true, color: '0F766E' },
          paragraph: { spacing: { before: 160, after: 80 } },
        },
        {
          id: 'Heading4',
          name: 'Heading 4',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 22, bold: true, color: '5B21B6' },
          paragraph: { spacing: { before: 120, after: 60 } },
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });
}

// ─── 실행 ────────────────────────────────────────────────────────────────

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const stats = [];
let totalSteps = 0;
let totalDialogueSteps = 0;
let totalTurns = 0;

for (const group of GROUPS) {
  const abs = path.join(LESSONS_DIR, group.sourceFile);
  if (!fs.existsSync(abs)) {
    console.error(`❌ 파일 없음: ${group.sourceFile}`);
    continue;
  }
  const lessons = extractLessonsFromFile(abs);
  let stepsInGroup = 0;
  let dialogueStepsInGroup = 0;
  let turnsInGroup = 0;
  for (const l of lessons) {
    stepsInGroup += l.steps.length;
    for (const s of l.steps) {
      if (s.dialogue.length > 0) {
        dialogueStepsInGroup += 1;
        turnsInGroup += s.dialogue.length;
      }
    }
  }
  totalSteps += stepsInGroup;
  totalDialogueSteps += dialogueStepsInGroup;
  totalTurns += turnsInGroup;

  const doc = buildDocument(group, lessons);
  const buf = await Packer.toBuffer(doc);
  const outPath = path.join(OUT_DIR, group.outFile);
  fs.writeFileSync(outPath, buf);

  stats.push({
    file: group.outFile,
    lessons: lessons.length,
    steps: stepsInGroup,
    dialogueSteps: dialogueStepsInGroup,
    turns: turnsInGroup,
    bytes: buf.length,
  });

  console.log(
    `✅ ${group.outFile} — lesson ${lessons.length} · step ${stepsInGroup} (대화 ${dialogueStepsInGroup}) · turn ${turnsInGroup} · ${buf.length} bytes`,
  );
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('## 마스코트 문구 워드파일 생성 완료');
console.log('');
console.log('### 산출물');
for (const s of stats) {
  console.log(`- ${s.file} — lesson ${s.lessons} · step ${s.dialogueSteps} (총 ${s.steps}, 대화 있는 step ${s.dialogueSteps}) · turn ${s.turns}`);
}
console.log(`- 합계: lesson ${stats.reduce((a, s) => a + s.lessons, 0)} · step ${totalSteps} (대화 있는 step ${totalDialogueSteps}) · turn ${totalTurns}`);
console.log('');
console.log('### 위치');
console.log(`outputs/mascot_review/`);
console.log('');
console.log('### 운영 코드 변경');
console.log('- 변경 파일: 0개');
console.log('- 회귀 영향: 없음');
