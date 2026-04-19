import VideoBg from '@/components/ui/VideoBg';
import { ABOUT } from '@/data/site';

export default function About() {
  return (
    <section
      id="about"
      className="relative min-h-screen overflow-hidden isolate"
    >
      <VideoBg src={ABOUT.videoUrl} />

      <div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(1,8,40,0.15) 0%, rgba(1,8,40,0.55) 100%)',
        }}
      />

      <div className="relative z-[2] min-h-screen max-w-layout mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col justify-between gap-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 lg:gap-12">
          <div className="relative">
            <h2 className="kr-heading uppercase leading-[1] text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px]">
              {ABOUT.headingLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>

          <p className="kr-body text-[14px] md:text-[15px] text-cream max-w-[300px] leading-[1.75]">
            {ABOUT.lead}
          </p>
        </div>

        <div className="flex justify-between gap-8">
          <div className="flex flex-col gap-4">
            {ABOUT.bulletLines.map((line, i) => (
              <p
                key={i}
                className="kr-body text-[14px] md:text-[15px] text-cream max-w-[300px] leading-[1.75]"
              >
                {line}
              </p>
            ))}
          </div>
          <div className="hidden lg:flex flex-col gap-4">
            {ABOUT.bulletLines.map((line, i) => (
              <p
                key={i}
                className="kr-body text-[14px] md:text-[15px] text-cream max-w-[300px] leading-[1.75]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
