import { Brain, CheckCircle2, ChevronRight, Clock3, Gauge } from 'lucide-react';
import { handleNavClick } from '@/lib/navigate';

const ITEMS = [
  { label: '377개 카드·스텝', icon: Brain, color: '#67e8f9' },
  { label: '즉시 풀이', icon: CheckCircle2, color: '#7DD850' },
  { label: '약점 점수', icon: Gauge, color: '#FD802E' },
  { label: '망각곡선 복습', icon: Clock3, color: '#c084fc' },
] as const;

export default function StudyMethodTeaser() {
  return (
    <section id="study-method" className="relative bg-base py-20 md:py-24">
      <div className="mx-auto max-w-[1180px] px-6 md:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-end">
          <div>
            <p className="kr-num mb-3 text-[11px] uppercase tracking-widest text-neon">
              Learning Method
            </p>
            <h2 className="kr-heading max-w-[650px] text-[30px] leading-[1.14] md:text-[44px]">
              왜 게임처럼 풀어도 ADsP·SQLD·컴활 공부가 되나요?
            </h2>
            <p className="kr-body mt-4 max-w-[560px] text-[14.5px] leading-[1.75] text-cream/68 md:text-[16px]">
              QuestDP는 시험범위를 작은 개념 스텝과 카드로 나누고, 바로 문제를 풀게 한 뒤,
              약점 점수와 망각곡선 복습 시점을 다시 계산합니다. 재미는 입구이고, 구조는 시험 대비입니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-[16px] border border-cream/10 bg-white/[0.035] p-4"
                >
                  <Icon size={20} strokeWidth={2.35} style={{ color: item.color }} />
                  <div className="kr-heading mt-3 text-[14px] text-cream/90">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <a
          href="/study-method"
          onClick={(e) => handleNavClick(e, '/study-method')}
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-cream/15 px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-cream/82 transition hover:border-neon/40 hover:text-neon"
        >
          학습 원리 보기
          <ChevronRight size={14} strokeWidth={2.6} />
        </a>
        <a
          href="/topics/comhwal/spreadsheet-general/060"
          onClick={(e) => handleNavClick(e, '/topics/comhwal/spreadsheet-general/060')}
          className="ml-0 mt-3 inline-flex items-center gap-2 rounded-full border border-lime-300/25 px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-lime-200 transition hover:bg-lime-300/10 md:ml-3 md:mt-7"
        >
          컴활 엑셀 카드 보기
          <ChevronRight size={14} strokeWidth={2.6} />
        </a>
      </div>
    </section>
  );
}
