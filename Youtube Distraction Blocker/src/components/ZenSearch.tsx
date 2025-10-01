import {useState, useEffect, useRef} from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { getSettings, onSettingsChanged } from '@/lib/storage';
import type { ZenSettings } from '@/types/settings';

/**
 * A simple, full-page search input for YouTube.
 * Focuses the input on mount and submits the form when the user presses enter.
 * Redirects the user to the YouTube search results page with the query when the form is submitted.
 */
export default function ZenSearch() {
    const [query , setQuery] = useState('')
    const [settings, setSettings] = useState<ZenSettings | null>(null);
    const inputRef = useRef<HTMLInputElement>(null)

    // Load settings and watch for changes
    useEffect(() => {
        // Load initial settings
        getSettings().then(setSettings);

        // Watch for changes
        const unwatch = onSettingsChanged(setSettings);

        return unwatch;
    }, []);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Search when form is submitted
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    }

    

    // Handle Enter Key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e)
        }
    };

      // Don't render if disabled
    if (!settings?.enabled) {
        return null;
    }

    return (
        <div className='fixed inset-0 flex flex-col items-center justify-center px-6 cover-full bg-background dark:bg-background'>
            {/* Dynamic heading */}
            <h1 className="max-w-4xl mb-8 text-5xl font-semibold tracking-tight text-center text-foreground">
                {settings.customMessage}
            </h1>
            {/* Input */}
            <form onSubmit={handleSubmit} className='w-full max-w-2xl'>
                <div className='relative'>
                    <Input 
                        ref={inputRef}
                        type='text'
                        placeholder='Search YouTube'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className='w-full pl-6 text-lg transition-shadow h-14 pr-14 rounded-apple shadow-apple focus:shadow-apple-lg'
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="absolute w-10 h-10 -translate-y-1/2 rounded-full right-2 top-1/2 apple-hover"
                    >
                        <Search className="w-5 h-5" />
                    </Button>

                </div>
            </form>
            {/* Hint Text */}
            <p className="mt-6 text-sm select-none text-muted-foreground animate-slide-up">
                Press <kbd className="px-2 py-1 font-mono text-xs rounded bg-muted text-muted-foreground">Enter</kbd> to search
            </p>
        </div>
    )
}
