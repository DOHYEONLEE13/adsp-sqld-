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
  식별자: {
    title: '식별자',
    body:
      '식별자는 여러 데이터 중 하나를 딱 구분해 주는 값이야. 학생을 구분하는 학번처럼 생각하면 쉬워.',
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
