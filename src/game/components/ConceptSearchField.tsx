import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronRight, Search, X } from 'lucide-react';
import type { Subject } from '@/types/question';
import {
  searchConceptsInChapter,
  type ConceptSearchResult,
} from '../conceptSearch';

interface Props {
  subject: Subject;
  chapter: number;
  accent: string;
  onSelect: (result: ConceptSearchResult) => void;
  floating?: boolean;
  autoFocus?: boolean;
}

export default function ConceptSearchField({
  subject,
  chapter,
  accent,
  onSelect,
  floating = false,
  autoFocus = false,
}: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(
    () => searchConceptsInChapter(subject, chapter, query, 10),
    [subject, chapter, query],
  );
  const showResults = focused && query.trim().length > 0;

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setFocused(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  const selectResult = (result: ConceptSearchResult) => {
    setQuery('');
    setFocused(false);
    onSelect(result);
  };

  return (
    <div
      ref={rootRef}
      className={
        floating
          ? 'relative z-30 w-full'
          : 'relative z-30 mt-5 w-full max-w-[560px]'
      }
    >
      <label className="relative block">
        <span className="sr-only">현재 챕터에서 개념 검색</span>
        <Search
          size={19}
          strokeWidth={2.25}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: focused ? accent : 'rgba(239,244,255,0.5)' }}
        />
        <input
          ref={inputRef}
          type="search"
          autoFocus={autoFocus}
          value={query}
          onFocus={() => setFocused(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setFocused(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setFocused(false);
              inputRef.current?.blur();
            }
            if (event.key === 'Enter' && results[0]) {
              event.preventDefault();
              selectResult(results[0]);
            }
          }}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="이 챕터에서 개념 검색"
          role="combobox"
          aria-expanded={showResults}
          aria-controls="chapter-concept-search-results"
          className="kr-body h-[54px] w-full appearance-none rounded-full border pl-12 pr-12 text-[14px] text-cream outline-none placeholder:text-cream/38 transition duration-200 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.07)] [&::-webkit-search-cancel-button]:hidden"
          style={{
            WebkitAppearance: 'none',
            background: floating
              ? 'linear-gradient(110deg, rgba(10,28,66,0.66), rgba(5,16,45,0.56))'
              : 'linear-gradient(110deg, rgba(8,25,62,0.88), rgba(5,16,45,0.8))',
            borderColor: focused
              ? `color-mix(in srgb, ${accent} 64%, rgba(255,255,255,0.12))`
              : 'rgba(239,244,255,0.18)',
            boxShadow: focused
              ? `0 0 0 3px color-mix(in srgb, ${accent} 11%, transparent), 0 14px 34px -28px ${accent}, inset 0 1px 0 rgba(255,255,255,0.09)`
              : 'inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-cream/45 transition hover:bg-white/[0.08] hover:text-cream"
            aria-label="검색어 지우기"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        ) : null}
      </label>

      {showResults ? (
        <div
          id="chapter-concept-search-results"
          role="listbox"
          className={`absolute inset-x-0 max-h-[min(390px,48dvh)] overflow-y-auto rounded-[18px] border border-white/12 py-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            floating ? 'bottom-[62px] bg-[#07163b]/82' : 'top-[62px] bg-[#07163b]/95'
          }`}
          style={{
            borderColor: `color-mix(in srgb, ${accent} 28%, rgba(255,255,255,0.12))`,
          }}
        >
          {results.length > 0 ? (
            results.map((result, index) => (
              <button
                key={result.stepId}
                type="button"
                role="option"
                aria-selected={index === 0}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectResult(result)}
                className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.075]"
              >
                <span
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    color: accent,
                    background: `color-mix(in srgb, ${accent} 12%, rgba(5,16,46,0.9))`,
                  }}
                >
                  <BookOpen size={17} strokeWidth={2.25} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="kr-heading block truncate text-[13px] text-cream md:text-[14px]">
                    {result.title}
                  </span>
                  <span className="kr-body mt-0.5 block truncate text-[10.5px] text-cream/48 md:text-[11px]">
                    {result.topic} · {result.snippet}
                  </span>
                </span>
                <ChevronRight
                  size={17}
                  strokeWidth={2.25}
                  className="shrink-0 text-cream/28 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            ))
          ) : (
            <div className="px-5 py-7 text-center">
              <p className="kr-heading text-[13px] text-cream/68">
                찾은 개념이 없어요
              </p>
              <p className="kr-body mt-1 text-[11px] text-cream/40">
                단어를 짧게 줄여서 다시 검색해보세요.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
