import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Bug,
  Check,
  Copy,
  CreditCard,
  Mail,
  MessageCircle,
  UserRound,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BRAND, COMPANY } from '@/data/site';
import { handleNavClick } from '@/lib/navigate';
import { useSeoMeta } from '@/lib/seo';

const CANONICAL = 'https://quest-dp.com/contact';
const SUPPORT_SUBJECT = 'QuestDP 고객문의';

const INQUIRY_GUIDE = [
  {
    title: '결제·환불',
    body: '주문번호, 결제 일시, 로그인 이메일을 함께 보내주세요.',
    icon: CreditCard,
  },
  {
    title: '계정·로그인',
    body: '사용한 Google 계정과 문제가 생긴 화면을 알려주세요.',
    icon: UserRound,
  },
  {
    title: '학습·문제 오류',
    body: '과목, 챕터, 문제 화면 또는 캡처를 보내주시면 빠르게 확인합니다.',
    icon: BookOpen,
  },
  {
    title: '기술 오류',
    body: '기기, 브라우저, 발생 시간을 함께 적어주세요.',
    icon: Bug,
  },
] as const;

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const seoDescription =
    'QuestDP 고객문의 페이지. 결제·환불, 계정·로그인, ADsP·SQLD 학습 및 문제 오류를 이메일로 문의할 수 있습니다.';

  useSeoMeta({
    title: '고객문의 — QuestDP',
    description: seoDescription,
    canonical: CANONICAL,
    ogImage: 'https://quest-dp.com/og/default.png',
    ogType: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'QuestDP 고객문의',
        description: seoDescription,
        url: CANONICAL,
        inLanguage: 'ko-KR',
        isPartOf: { '@type': 'WebSite', name: BRAND.nameEn, url: 'https://quest-dp.com' },
        publisher: { '@type': 'Organization', name: BRAND.nameKr },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: BRAND.nameKr,
        url: 'https://quest-dp.com',
        email: COMPANY.email,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: COMPANY.email,
          availableLanguage: ['ko'],
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
          { '@type': 'ListItem', position: 2, name: '고객문의', item: CANONICAL },
        ],
      },
    ],
  });

  const mailHref = makeMailHref();

  const handleCopy = async () => {
    await copyText(COMPANY.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen bg-base text-cream">
      <div className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(209,248,67,0.13),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(103,232,249,0.13),transparent_34%),linear-gradient(180deg,rgba(1,8,40,0.35),#010828_76%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cream/25 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1200px] px-6 pb-16 pt-6 md:px-10 md:pb-20">
          <Header />

          <main className="mx-auto mt-16 max-w-[980px] md:mt-20">
            <a
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
              className="mb-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-cream/62 transition hover:text-[#D1F843]"
            >
              <ArrowLeft size={14} strokeWidth={2.4} />
              홈으로
            </a>

            <section className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D1F843]/25 bg-[#D1F843]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#D1F843]">
                  <MessageCircle size={13} strokeWidth={2.4} />
                  Support
                </div>
                <h1 className="kr-heading max-w-[520px] text-[34px] leading-[1.12] md:text-[54px]">
                  고객문의
                </h1>
                <p className="kr-body mt-5 max-w-[560px] text-[15px] leading-[1.75] text-cream/72 md:text-[17px]">
                  문의는 아래 이메일로 보내주세요. 메일 앱이 열리지 않아도 주소를 복사해
                  바로 사용할 수 있습니다.
                </p>
                <p className="kr-body mt-4 max-w-[560px] text-[13px] leading-[1.65] text-cream/50">
                  영업일 기준 1~3일 안에 확인합니다. 결제·환불 문의는 우선 확인합니다.
                </p>
              </div>

              <div className="rounded-[24px] border border-cream/12 bg-white/[0.045] p-5 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur md:p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D1F843]/25 bg-[#D1F843]/10 text-[#D1F843]">
                  <Mail size={22} strokeWidth={2.3} />
                </div>
                <p className="kr-num mb-2 text-[11px] uppercase tracking-widest text-cream/45">
                  Email
                </p>
                <div className="break-all rounded-[18px] border border-cream/10 bg-[#06113a]/70 px-4 py-4 text-[18px] font-semibold text-cream md:text-[22px]">
                  {COMPANY.email}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="kr-heading inline-flex items-center justify-center gap-2 rounded-full bg-[#D1F843] px-5 py-3 text-[12px] uppercase tracking-widest text-[#06113a] transition hover:brightness-110 active:scale-[0.98]"
                    aria-live="polite"
                  >
                    {copied ? <Check size={16} strokeWidth={2.6} /> : <Copy size={15} strokeWidth={2.5} />}
                    <span className={copied ? 'animate-pulse' : ''}>
                      {copied ? '복사됨' : '이메일 복사'}
                    </span>
                  </button>
                  <a
                    href={mailHref}
                    className="kr-heading inline-flex items-center justify-center gap-2 rounded-full border border-cream/18 bg-cream/[0.06] px-5 py-3 text-[12px] uppercase tracking-widest text-cream/88 transition hover:border-[#D1F843]/45 hover:text-[#D1F843] active:scale-[0.98]"
                  >
                    <Mail size={15} strokeWidth={2.5} />
                    메일 앱 열기
                  </a>
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-3 sm:grid-cols-2">
              {INQUIRY_GUIDE.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-[18px] border border-cream/10 bg-white/[0.035] p-4"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#D1F843]/10 text-[#D1F843]">
                        <Icon size={17} strokeWidth={2.3} />
                      </span>
                      <h2 className="kr-heading text-[15px] text-cream">{item.title}</h2>
                    </div>
                    <p className="kr-body text-[13px] leading-[1.65] text-cream/62">
                      {item.body}
                    </p>
                  </article>
                );
              })}
            </section>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function makeMailHref() {
  const body = [
    '문의 유형:',
    '로그인 이메일:',
    '발생 화면:',
    '문의 내용:',
  ].join('\n');
  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}&body=${encodeURIComponent(body)}`;
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // 아래 fallback 으로 한 번 더 시도한다.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
