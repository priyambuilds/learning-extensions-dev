import {useState, useEffect, useRef} from 'react'
import { Search, Sparkles } from 'lucide-react';
import { getSettings, onSettingsChanged } from '@/lib/storage';
import type { ZenSettings } from '@/types/settings';

/**
 * Beautiful, minimal full-page search interface for YouTube
 * Features excellent contrast, smooth animations, and clean design
 */
export default function ZenSearch() {
    const [query, setQuery] = useState('')
    const [settings, setSettings] = useState<ZenSettings | null>(null);
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Load settings and watch for changes
    useEffect(() => {
        getSettings().then(setSettings);
        const unwatch = onSettingsChanged(setSettings);
        return unwatch;
    }, []);

    // Focus input on mount with delay for smooth animation
    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus()
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    // Search when form is submitted
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`;
        }
    }

    // Don't render if disabled
    if (!settings?.enabled) {
        return null;
    }

    return (
        <div className="fixed relative inset-0 flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-slate-900/50 dark:via-slate-800 dark:to-slate-900/50" />

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
                backgroundSize: '20px 20px'
            }} />

            <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
                {/* Icon & Title */}
                <div className="mb-12 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-3 shadow-xl bg-gradient-to-br from-red-500 to-red-600 rounded-2xl">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="mb-4 text-4xl font-bold tracking-tight text-transparent md:text-6xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-800 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text">
                        {settings.customMessage || 'Find Your Perfect Video'}
                    </h1>
                    <p className="text-lg font-medium md:text-xl text-slate-600 dark:text-slate-400">
                        Search millions of videos, distraction-free
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
                    <div className="relative group">
                        {/* Search input with enhanced styling */}
                        <div className={`relative transition-all duration-300 ${
                            isFocused ? 'transform scale-[1.02]' : ''
                        }`}>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="What do you want to watch?"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                className="w-full h-16 px-6 pr-16 text-lg font-medium transition-all duration-300 border shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:shadow-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white hover:bg-white/90 dark:hover:bg-slate-800/90"
                            />

                            {/* Search button */}
                            <button
                                type="submit"
                                className="absolute p-3 text-white transition-all duration-200 -translate-y-1/2 shadow-lg right-3 top-1/2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                disabled={!query.trim()}
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </form>

                {/* Instructions */}
                <div className="animate-slide-up">
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Search YouTube without distractions
                    </p>

                    {/* Keyboard hint */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                        <kbd className="px-3 py-1 text-xs font-semibold border rounded shadow-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                            Enter
                        </kbd>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            to search
                        </span>
                    </div>
                </div>

                {/* Subtle branding */}
                <div className="absolute -translate-x-1/2 bottom-6 left-1/2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Press Alt+Z to toggle Zen mode anywhere on YouTube
                    </p>
                </div>
            </div>
        </div>
    )
}
