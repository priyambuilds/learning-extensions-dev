import {useState, useEffect, useRef} from 'react'
import {Input} from '@/ui/input'
import {Button} from '@/ui/button'
import { Search } from 'lucide-react';

/**
 * A simple, full-page search input for YouTube.
 * Focuses the input on mount and submits the form when the user presses enter.
 * Redirects the user to the YouTube search results page with the query when the form is submitted.
 */
export default function ZenSearch() {
    const [query , setQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

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

    return (
        <div className='fixed inset-0 flex flex-col items-center justify-center px-6 cover-full bg-background dark:bg-background'>
            {/* Heading */}
            <h1 className='mb-8 text-4xl font-semibold text-center text-foreground'>
                What do you want to see?
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