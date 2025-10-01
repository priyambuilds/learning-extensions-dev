// src/lib/yt-selectors.ts - Robust YouTube DOM selectors and guards

export interface SelectorGuard {
  selector: string;
  guard?: () => boolean;
  description?: string;
}

// Generic guard functions
export const exists = (selector: string) => {
  try {
    return document.querySelector(selector) !== null;
  } catch {
    return false;
  }
};

export const existsAndVisible = (selector: string) => {
  try {
    const element = document.querySelector(selector) as HTMLElement;
    return element && element.offsetWidth > 0 && element.offsetHeight > 0;
  } catch {
    return false;
  }
};

export const hasChildElements = (selector: string, minCount: number = 1) => {
  try {
    const element = document.querySelector(selector);
    return element ? element.children.length >= minCount : false;
  } catch {
    return false;
  }
};

// YouTube-specific selectors with guards
export const YT_SELECTORS = {
  // Navigation and routing
  nav: {
    // Listen to yt-navigate-finish events for SPA navigation
    navigateFinish: 'yt-navigate-finish',
    // Current path detection
    isHome: () => location.pathname === '/',
    isWatch: () => location.pathname === '/watch',
    isResults: () => location.pathname === '/results',
    isFeed: () => location.pathname.startsWith('/feed'),
  },

  // Layout containers
  containers: {
    // Main content areas
    contents: '#contents',
    pageManager: '#page-manager',
    app: 'ytd-app',

    // Watch page specific
    watchFlexy: '#flexy',
    primaryContent: '#primary',
    secondaryContent: '#secondary',

    // Results page
    resultsContainer: '#contents.ytd-section-list-renderer',
  },

  // Distraction elements
  distractions: {
    // Shorts
    shorts: {
      container: 'ytd-rich-shelf-renderer[is-shorts]',
      shelf: 'ytd-rich-shelf-renderer[title="Shorts"]',
      items: 'ytd-video-renderer:has(a[href*="/shorts/"]), ytd-compact-video-renderer:has(a[href*="/shorts/"])',
      guard: () => exists('ytd-rich-shelf-renderer[is-shorts]'),
    },

    // Home feed (rich grid)
    homeFeed: {
      richGrid: 'ytd-rich-grid-renderer',
      shelf: 'ytd-rich-shelf-renderer:not([is-shorts])',
      contents: 'ytd-rich-grid-renderer #contents',
      guard: () => exists('ytd-rich-grid-renderer'),
    },

    // End screens (recommended videos on watch)
    endScreens: {
      container: '.html5-endscreen',
      overlay: 'ytd-video-endscreen-content-renderer',
      suggestions: '.ytp-endscreen-content',
      guard: () => exists('.html5-endscreen') || exists('ytd-video-endscreen-content-renderer'),
    },

    // Comments section
    comments: {
      entryPoints: '#comments #sections',
      mainComments: '#comments #contents',
      container: 'ytd-comments#comments',
      guard: () => exists('ytd-comments#comments'),
    },

    // Sidebar recommendations
    sidebar: {
      container: '#secondary',
      relatedVideos: 'ytd-watch-next-secondary-results-renderer',
      playlist: 'ytd-playlist-panel-renderer',
      guard: () => exists('#secondary'),
    },

    // Search-only mode (invert logic)
    searchOnly: {
      // Hide everything except search results
      hideAllExcept: '[aria-label="Search results"][role="main"]',
      resultsList: 'ytd-section-list-renderer[page-subtype="search-results"]',
      mainContent: '#primary',
      guard: () => exists('ytd-section-list-renderer[page-subtype="search-results"]'),
    },
  },

  // Utility selectors
  visibility: {
    hidden: 'style[zen-hidden="true"]',
    displayNone: 'style[zen-display-none="true"]',
  },
} as const;

// Page type detection
export type PageType = 'home' | 'watch' | 'results' | 'feed' | 'other';

export function getCurrentPageType(): PageType {
  const path = location.pathname;

  if (path === '/' || path === '/home') return 'home';
  if (path === '/watch') return 'watch';
  if (path === '/results') return 'results';
  if (path.startsWith('/feed')) return 'feed';

  return 'other';
}

// Feature availability by page type
export const FEATURE_AVAILABILITY: Record<string, readonly string[]> = {
  hideShorts: ['home', 'results', 'feed'],
  hideHomeFeed: ['home'],
  hideEndCards: ['watch'],
  hideComments: ['watch', 'results'],
  hideSidebar: ['watch'],
  searchOnly: ['results'], // Only makes sense for search results
};

type FeatureKey = keyof typeof FEATURE_AVAILABILITY;

export function isFeatureAvailableOnPage(feature: FeatureKey, pageType: PageType): boolean {
  const availablePages = FEATURE_AVAILABILITY[feature];
  return availablePages?.includes(pageType) ?? false;
}

// Selector validation
export function isSelectorValid(selector: string): boolean {
  try {
    document.querySelector(selector);
    return true;
  } catch {
    return false;
  }
}

// Batch guard checking
export function checkGuard(guard: SelectorGuard): boolean {
  if (guard.guard) {
    return guard.guard();
  }
  if (guard.selector) {
    return exists(guard.selector);
  }
  return false;
}
