import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { getSettings, onSettingsChanged } from '@/lib/storage';
import type { ZenSettings } from '@/types/settings';

/**
 * Minimal full-page search for YouTube
 * - Pixel-aligned, no scale jitter
 * - Strong contrast in both themes
 * - Accessible, extension-safe overlay
 */
export default function ZenSearch() {
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState<ZenSettings | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load settings and watch for changes
  useEffect(() => {
    let unwatch: (() => void) | undefined;
    getSettings().then(setSettings);
    unwatch = onSettingsChanged(setSettings);
    return () => {
      if (unwatch) unwatch();
    };
  }, []);

  // Focus input on mount with slight delay
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, []);

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    }
  };

  // Respect setting toggle
  if (!settings?.enabled) return null;

  return (
    <div
      // High z-index to sit above YouTube chrome reliably
      className="fixed inset-0 z-[2147483646] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-50/60 via-white to-purple-50/60 dark:from-slate-950/70 dark:via-slate-900 dark:to-slate-950/70" />

      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[48rem] text-center">
        {/* Icon & Title */}
        <div className="mb-10">
          <div className="flex items-center justify-center mx-auto mb-6">
            <div className="p-3 shadow-lg rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-black/10">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="mb-3 text-4xl font-semibold tracking-tight text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-800 bg-clip-text md:text-6xl dark:from-white dark:via-slate-200 dark:to-slate-300">
            {settings.customMessage || 'Find Your Perfect Video'}
          </h1>

          <p className="text-base font-medium text-slate-600 md:text-lg dark:text-slate-400">
            Search millions of videos, distraction-free
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
          <div className="relative">
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
              className={[
                'w-full h-14 md:h-16 rounded-2xl px-6 pr-16 text-base md:text-lg font-medium',
                // Surfaces
                'bg-white/85 dark:bg-slate-800/85 backdrop-blur-xl',
                'border border-slate-200/60 dark:border-slate-700/60',
                // Text
                'placeholder-slate-500 dark:placeholder-slate-400',
                'text-slate-900 dark:text-white',
                // Effects
                'transition-shadow transition-colors duration-200',
                isFocused
                  ? 'ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10'
                  : 'shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10',
                'outline-none focus:outline-none',
              ].join(' ')}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={!query.trim()}
              className={[
                'absolute right-3 top-1/2 -translate-y-1/2',
                'rounded-xl p-2.5 md:p-3',
                'text-white transition-transform duration-150',
                'bg-gradient-to-r from-blue-500 to-blue-600',
                'hover:from-blue-600 hover:to-blue-700',
                'shadow-md shadow-blue-900/20 hover:shadow-lg',
                'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
              ].join(' ')}
              aria-label="Submit search"
            >
              <Search className="w-5 h-5 md:h-6 md:w-6" />
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Search YouTube without distractions
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60">
            <kbd className="px-3 py-1 text-xs font-semibold border rounded shadow-sm border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
              Enter
            </kbd>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              to search
            </span>
          </div>
        </div>

        {/* Footer hint */}
        <div className="absolute -translate-x-1/2 pointer-events-none left-1/2 bottom-6">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Press Alt+Z to toggle Zen mode anywhere on YouTube
          </p>
        </div>
      </div>
    </div>
  );
}
