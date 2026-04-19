import ModeCard from '@/components/ui/ModeCard';
import { GAME_MODES } from '@/data/gameModes';
import { COLLECTION } from '@/data/site';

export default function GameModes() {
  return (
    <section
      id="modes"
      className="bg-base py-20 md:py-28 relative"
    >
      <div className="max-w-layout mx-auto px-6 md:px-12">
        <Header />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {GAME_MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              funScoreLabel={COLLECTION.cardFunScoreLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 lg:gap-8 mb-12">
      <h2 className="kr-heading uppercase leading-[1] text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px]">
        <span className="block">{COLLECTION.titleFirstLine}</span>
        <span className="block ml-12 sm:ml-24 lg:ml-32">
          <span className="cursive text-neon mr-2">
            {COLLECTION.cursiveInline}
          </span>
          {COLLECTION.titleSecondLineSuffix}
        </span>
      </h2>

      <button
        type="button"
        onClick={() => {
          window.location.hash = '/game';
        }}
        className="inline-flex flex-col items-start gap-3"
      >
        <div className="kr-heading uppercase leading-[1] flex items-end gap-4">
          <span className="text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px]">
            {COLLECTION.seeAllPrimary}
          </span>
          <span className="flex flex-col gap-0.5 text-[20px] sm:text-[26px] md:text-[30px] lg:text-[36px]">
            <span>{COLLECTION.seeAllSecondaryTop}</span>
            <span>{COLLECTION.seeAllSecondaryBottom}</span>
          </span>
        </div>
        <span
          aria-hidden
          className="w-full bg-neon rounded-sm h-[6px] lg:h-[10px]"
        />
      </button>
    </div>
  );
}
