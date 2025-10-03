// src/components/ZenSearch.tsx (drop-in replacement)
import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { getSettings, onSettingsChanged } from '@/lib/storage';
import type { ZenSettings } from '@/types/settings';

/**
 * Minimal full-page search for YouTube
 * - Viewport-fixed, shadow-isolated by the content script host
 * - Flex field wrapper: no overflow, perfect icon alignment
 * - Stable baseline + tighter header spacing
 */
export default function ZenSearch() {
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState<ZenSettings | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load settings and watch changes
  useEffect(() => {
    let unwatch: (() => void) | undefined;
    getSettings().then(setSettings);
    unwatch = onSettingsChanged(setSettings);
    return () => {
      if (unwatch) unwatch();
    };
  }, []);

  // Focus on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    }
  };

  if (!settings?.enabled) return null;

  return (
    <div
      className="fixed inset-0 z-[2147483646] flex items-center justify-center p-6 font-sans text-[16px] leading-[1.5] antialiased"
      role="dialog"
      aria-modal="true"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-50/60 via-white to-purple-50/60 dark:from-slate-950/70 dark:via-slate-900 dark:to-slate-950/70" />

      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[48rem] text-center">
        {/* Icon & Title (tighter spacing) */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-center mx-auto mb-4 md:mb-5">
            <div className="p-3 shadow-lg rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-black/10">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="mb-2 text-4xl font-semibold tracking-tight text-transparent md:mb-3 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-800 bg-clip-text md:text-6xl dark:from-white dark:via-slate-200 dark:to-slate-300">
            {settings.customMessage || 'Find Your Perfect Video'}
          </h1>

          <p className="text-base font-medium text-slate-600 md:text-lg dark:text-slate-400">
            Search millions of videos, distraction-free
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-6">
          {/* Field wrapper: flex + overflow-hidden to clip the button inside the radius */}
          <div
            className={[
              'group isolate flex h-14 md:h-16 items-center overflow-hidden rounded-2xl',
              'bg-white/85 dark:bg-slate-800/85 backdrop-blur-xl',
              'border border-slate-200/60 dark:border-slate-700/60',
              'shadow-md hover:shadow-lg transition-shadow duration-200',
              'focus-within:ring-2 focus-within:ring-blue-500/40',
            ].join(' ')}
          >
            <input
              ref={inputRef}
              type="text"
              aria-label="Search YouTube"
              enterKeyHint="search"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="What do you want to watch?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 h-full px-5 text-base font-medium bg-transparent outline-none md:px-6 md:text-lg placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white"
            />

            {/* Submit button lives inside the wrapper, cannot overflow */}
            <button
              type="submit"
              aria-label="Submit search"
              disabled={!query.trim()}
              className={[
                'm-1 mr-1.5 md:mr-2 grid place-items-center',
                'size-11 md:size-12 rounded-xl',
                'text-white bg-gradient-to-r from-blue-500 to-blue-600',
                'hover:from-blue-600 hover:to-blue-700',
                'shadow-md shadow-blue-900/20 hover:shadow-lg',
                'transition-transform duration-150 active:scale-95',
                'disabled:opacity-60 disabled:shadow-none disabled:active:scale-100 disabled:pointer-events-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                'z-10',
              ].join(' ')}
            >
              <Search className="w-5 h-5 md:h-6 md:w-6" strokeWidth={2.25} aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Helper text */}
        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
          Search YouTube without distractions
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60">
          <kbd className="px-3 py-1 text-xs font-semibold border rounded shadow-sm border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
            Enter
          </kbd>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">to search</span>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-xs font-medium text-slate-400 dark:text-slate-500">
          Press Alt+Z to toggle Zen mode anywhere on YouTube
        </p>
      </div>
    </div>
  );
}
