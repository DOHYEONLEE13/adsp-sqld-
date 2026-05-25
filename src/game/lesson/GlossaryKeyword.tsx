import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, X } from 'lucide-react';

export const GLOSSARY_TERMS: Record<string, { title: string; body: string }> = {
  DB: {
    title: 'DB',
    body:
      'DB는 데이터베이스(Database)의 약어야. 데이터를 모아 저장하고, 필요할 때 다시 꺼내 쓰는 공간이라고 생각하면 돼.',
  },
  엔터티: {
    title: '엔터티',
    body:
      '엔터티는 DB에 저장하고 싶은 대상이야. 예를 들면 수강신청에서 학생, 과목, 신청 기록 같은 것들이 엔터티가 될 수 있어.',
  },
  인스턴스: {
    title: '인스턴스',
    body:
      '인스턴스는 엔터티에 실제로 들어가는 한 건의 예시야. 학생 엔터티라면 김민지, 박서준처럼 실제 학생 한 명 한 명이 인스턴스야.',
  },
  속성: {
    title: '속성',
    body:
      '속성은 엔터티를 설명하는 항목이야. 학생 엔터티라면 학번, 이름, 생년월일처럼 학생 한 명을 설명하는 값이 속성이야.',
  },
  컬럼: {
    title: '컬럼',
    body:
      '컬럼은 표에서 세로로 놓이는 항목이야. 학생 표라면 학번, 이름, 학과 같은 칸 이름을 컬럼이라고 생각하면 돼.',
  },
  원자성: {
    title: '원자성',
    body:
      '원자성은 한 속성에 하나의 의미만 담는다는 뜻이야. 예를 들면 이름 칸에는 이름만, 학번 칸에는 학번만 담는 식이야.',
  },
  '단일 속성': {
    title: '단일 속성',
    body:
      '단일 속성은 더 나누지 않고 하나의 의미로 쓰는 속성이야. 학번, 이름처럼 한 칸에 하나의 의미가 담긴다고 보면 쉬워.',
  },
  '복합 속성': {
    title: '복합 속성',
    body:
      '복합 속성은 필요하면 여러 하위 속성으로 나눌 수 있는 속성이야. 주소를 시, 구, 상세주소로 나누는 식이야.',
  },
  '다중값 속성': {
    title: '다중값 속성',
    body:
      '다중값 속성은 한 인스턴스가 같은 종류의 값을 여러 개 가질 수 있는 속성이야. 이메일 여러 개, 전화번호 여러 개를 떠올리면 돼.',
  },
  식별자: {
    title: '식별자',
    body:
      '식별자는 여러 데이터 중 하나를 딱 구분해 주는 값이야. 학생을 구분하는 학번처럼 생각하면 쉬워.',
  },
  PK: {
    title: 'PK',
    body:
      'PK는 Primary Key의 약어야. 한 표에서 한 행을 딱 하나로 구분해 주는 대표 식별자라고 보면 돼.',
  },
  FK: {
    title: 'FK',
    body:
      'FK는 Foreign Key의 약어야. 다른 표의 대표 식별자를 가져와서 두 표를 연결하는 값이야.',
  },
  무결성: {
    title: '무결성',
    body:
      '무결성은 DB 안의 데이터가 약속한 규칙을 계속 지키는 상태야. 학번이 비어 있지 않고, 연결된 값이 실제로 존재하고, 값의 범위가 맞는지 확인하는 느낌이야.',
  },
  '개체 무결성': {
    title: '개체 무결성',
    body:
      '개체 무결성은 한 행을 구분하는 대표값인 PK가 비거나 중복되지 않게 지키는 규칙이야. 학생 표라면 학번이 비어 있거나 겹치면 안 돼.',
  },
  '참조 무결성': {
    title: '참조 무결성',
    body:
      '참조 무결성은 FK가 실제로 존재하는 부모 데이터를 가리키게 지키는 규칙이야. 수강 기록이 존재하지 않는 학번을 가리키면 안 되는 식이야.',
  },
  '도메인 무결성': {
    title: '도메인 무결성',
    body:
      '도메인 무결성은 값이 정해진 범위와 형식 안에 들어오게 지키는 규칙이야. 학년은 1~4, 점수는 0~100처럼 허용 범위를 정하는 느낌이야.',
  },
  '일반 속성': {
    title: '일반 속성',
    body:
      '일반 속성은 PK도 FK도 아니지만 인스턴스를 설명하는 속성이야. 이름, 생년월일, 연락처처럼 데이터를 이해하는 데 필요한 정보야.',
  },
  '식별자 관계': {
    title: '식별자 관계',
    body:
      '식별자 관계는 부모의 PK가 자식의 PK 안으로 들어가는 강한 관계야. 자식은 부모 키까지 합쳐서 자신을 구분한다고 보면 돼.',
  },
  '비식별자 관계': {
    title: '비식별자 관계',
    body:
      '비식별자 관계는 부모 키를 참조하되 자식 PK에는 넣지 않는 관계야. 자식은 자기 PK를 따로 가지고, 부모 키는 FK로만 둬.',
  },
  차수: {
    title: '차수',
    body:
      '차수는 두 엔터티가 몇 개씩 연결되는지를 보는 기준이야. 1:1, 1:M, M:N 같은 표현이 차수에 해당해.',
  },
  카디널리티: {
    title: '카디널리티',
    body:
      '카디널리티(Cardinality)는 관계의 차수를 뜻하는 시험 용어야. 문제에서 카디널리티라고 나오면 1:1, 1:M, M:N 연결 개수를 떠올리면 돼.',
  },
  CRUD: {
    title: 'CRUD',
    body:
      'CRUD는 Create, Read, Update, Delete의 약어야. 데이터에 대해 만들기, 읽기, 고치기, 지우기를 한다는 뜻이야.',
  },
  ERD: {
    title: 'ERD',
    body:
      'ERD는 엔터티와 관계를 그림처럼 표현한 설계도야. 어떤 데이터가 있고 서로 어떻게 연결되는지 한눈에 보려고 그려.',
  },
  도배설명차선: {
    title: '도배설명차선',
    body:
      'ERD 작성 순서 암기어야. 엔터티 도출, 배치, 관계 설정, 관계명 기술, 차수 설정, 선택사양 기술의 앞부분을 이어 외우는 방식이야.',
  },
  DBMS: {
    title: 'DBMS',
    body:
      'DBMS는 데이터베이스를 관리하는 프로그램이야. Oracle, MySQL, SQL Server 같은 것들이 DBMS야.',
  },
  인덱스: {
    title: '인덱스',
    body:
      '인덱스는 책의 색인처럼 데이터를 더 빨리 찾게 도와주는 구조야. 대신 저장 공간이 더 필요할 수 있어.',
  },
  스키마: {
    title: '스키마',
    body:
      '스키마는 DB의 구조를 설명하는 설계도야. 어떤 표가 있고, 어떤 컬럼과 관계가 있는지 정리한 거라고 보면 돼.',
  },
};

export default function GlossaryKeyword({
  label,
  term,
  buttonClassName = 'dialogue-keyword inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 underline decoration-dotted underline-offset-4 transition hover:bg-neon/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon',
}: {
  label: string;
  term: { title: string; body: string };
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const tooltipId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        aria-expanded={open}
        aria-controls={open ? tooltipId : undefined}
        aria-label={`${term.title} 설명 보기`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {label}
        <Info size={11} strokeWidth={2.4} aria-hidden />
      </button>
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  id={tooltipId}
                  role="dialog"
                  aria-label={`${term.title} 설명`}
                  className="fixed inset-x-4 bottom-6 z-[9999] mx-auto w-[min(380px,calc(100vw-32px))] transform-gpu rounded-[22px] border border-neon/30 bg-[#071326]/95 px-5 pb-4 pt-3 text-left shadow-[0_22px_60px_rgba(0,0,0,0.55)] backdrop-blur-md"
                  initial={{
                    opacity: 0,
                    y: 18,
                    scale: 0.96,
                    filter: 'blur(6px)',
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  }}
                  exit={{
                    opacity: 0,
                    y: 12,
                    scale: 0.98,
                    filter: 'blur(4px)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.9 }}
                >
                  <div className="mx-auto mb-2 h-0.5 w-9 rounded-full bg-white/16" aria-hidden />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="kr-heading text-[12px] uppercase tracking-widest text-neon">
                        {term.title}
                      </div>
                      <p className="mt-1.5 kr-body text-[14px] leading-[1.7] text-cream/90">
                        {term.body}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-2 text-cream/65 transition hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
                      aria-label={`${term.title} 설명 닫기`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpen(false);
                      }}
                    >
                      <X size={15} strokeWidth={2.4} aria-hidden />
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
