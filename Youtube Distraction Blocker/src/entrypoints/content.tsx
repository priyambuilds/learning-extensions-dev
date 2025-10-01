import '../styles/globals.css';
import { createRoot } from 'react-dom/client';
import ZenSearch from '@/components/ZenSearch';
import { getSettings, onSettingsChanged, isFeatureEnabled } from '@/lib/storage';
import { showCommandFeedback } from '@/lib/toast';
import {
  YT_SELECTORS,
  getCurrentPageType,
  isFeatureAvailableOnPage,
  type PageType
} from '@/lib/yt-selectors';
import type { ZenSettings, FeatureToggles } from '@/types/settings';

// Feature module interfaces
interface FeatureModule {
  name: keyof FeatureToggles;
  enable: (pageType: PageType) => void;
  disable: () => void;
  isEnabled: boolean;
}

class YouTubeDistractionController {
  private settings: ZenSettings | null = null;
  private currentPageType: PageType = 'other';
  private zenSearchRoot: ReturnType<typeof createRoot> | null = null;
  private zenSearchContainer: HTMLElement | null = null;
  private features: Record<string, FeatureModule> = {};
  private mutationObserver: MutationObserver | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Load initial settings
    this.settings = await getSettings();

    // Watch for settings changes
    onSettingsChanged((newSettings) => {
      this.handleSettingsChange(newSettings);
    });

    // Initialize feature modules
    this.initializeFeatureModules();

    // Set up SPA navigation listening
    this.setupNavigationObserver();

    // Set up message listener for commands
    this.setupMessageListener();

    // Initial page processing
    this.onNavigation();

    console.log('Zen YouTube: Initialized with settings', this.settings);
  }

  private initializeFeatureModules() {
    this.features = {
      hideShorts: new HideShortsModule(),
      hideHomeFeed: new HideHomeFeedModule(),
      hideEndCards: new HideEndCardsModule(),
      hideComments: new HideCommentsModule(),
      hideSidebar: new HideSidebarModule(),
      searchOnly: new SearchOnlyModule(),
    };
  }

  private setupNavigationObserver() {
    // Listen to YouTube's SPA navigation
    document.addEventListener(YT_SELECTORS.nav.navigateFinish, this.onNavigation.bind(this));

    // Fallback: watch URL changes with MutationObserver
    this.mutationObserver = new MutationObserver(() => {
      const newPageType = getCurrentPageType();
      if (newPageType !== this.currentPageType) {
        this.currentPageType = newPageType;
        this.onNavigation();
      }
    });

    // Watch for title changes (good indicator of navigation)
    const titleObserver = new MutationObserver(() => {
      setTimeout(() => this.onNavigation(), 100); // Debounce
    });

    titleObserver.observe(document.querySelector('title') || document.head, {
      childList: true,
      subtree: true,
    });
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'command-feedback') {
        const { type, enabled } = message.data;
        showCommandFeedback(type, enabled);
      }
    });
  }

  private onNavigation = () => {
    this.currentPageType = getCurrentPageType();

    // Update zen search visibility
    this.updateZenSearch();

    // Update all features
    this.updateAllFeatures();

    console.log('Zen YouTube: Navigation to', this.currentPageType, this.settings?.enabled);
  };

  private handleSettingsChange(newSettings: ZenSettings) {
    const oldSettings = this.settings;
    this.settings = newSettings;

    if (!oldSettings || oldSettings.enabled !== newSettings.enabled) {
      this.updateZenSearch();
    }

    this.updateAllFeatures();
  }

  private updateZenSearch() {
    const shouldShow = this.settings?.features.hideHomeFeed &&
                      this.currentPageType === 'home' &&
                      this.settings.enabled;

    if (shouldShow) {
      this.showZenSearch();
    } else {
      this.hideZenSearch();
    }
  }

  private showZenSearch() {
    if (this.zenSearchContainer) return;

    // Hide YouTube UI
    const zenStyles = document.createElement('style');
    zenStyles.id = 'zen-youtube-styles';
    zenStyles.textContent = `
      ${YT_SELECTORS.containers.pageManager}, ${YT_SELECTORS.containers.app} {
        display: none !important;
      }
      body {
        background: hsl(var(--background, 255 255 255)) !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      html {
        background: hsl(var(--background, 255 255 255)) !important;
      }
    `;
    document.head.appendChild(zenStyles);

    // Create React container
    this.zenSearchContainer = document.createElement('div');
    this.zenSearchContainer.id = 'zen-search-root';
    this.zenSearchContainer.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
    `;
    document.body.appendChild(this.zenSearchContainer);

    // Mount React
    this.zenSearchRoot = createRoot(this.zenSearchContainer);
    this.zenSearchRoot.render(<ZenSearch />);
  }

  private hideZenSearch() {
    if (!this.zenSearchContainer) return;

    // Unmount React
    if (this.zenSearchRoot) {
      this.zenSearchRoot.unmount();
      this.zenSearchRoot = null;
    }

    // Remove elements
    this.zenSearchContainer.remove();
    this.zenSearchContainer = null;

    // Remove styles
    document.getElementById('zen-youtube-styles')?.remove();
  }

  private updateAllFeatures() {
    if (!this.settings?.enabled) {
      // Disable all features
      Object.values(this.features).forEach(feature => {
        if (feature.isEnabled) feature.disable();
      });
      return;
    }

    Object.entries(this.features).forEach(([featureName, feature]) => {
      const shouldBeEnabled = this.settings!.features[featureName as keyof FeatureToggles] &&
                             isFeatureAvailableOnPage(featureName as keyof FeatureToggles, this.currentPageType);

      if (shouldBeEnabled && !feature.isEnabled) {
        feature.enable(this.currentPageType);
      } else if (!shouldBeEnabled && feature.isEnabled) {
        feature.disable();
      }
    });
  }
}

// Feature Module Implementations
class HideShortsModule implements FeatureModule {
  name = 'hideShorts' as const;
  isEnabled = false;

  enable(pageType: PageType) {
    if (this.isEnabled) return;
    this.isEnabled = true;

    const selectors = YT_SELECTORS.distractions.shorts;
    if (!selectors.guard()) return;

    const elements = [
      selectors.container,
      selectors.shelf,
      selectors.items,
    ];

    this.hideElements(elements);
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.showElements(YT_SELECTORS.distractions.shorts.container);
  }

  private hideElements(selectors: string[]) {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    });
  }

  private showElements(selector: string) {
    document.querySelectorAll(selector).forEach(el => {
      (el as HTMLElement).style.display = '';
    });
  }
}

class HideHomeFeedModule implements FeatureModule {
  name = 'hideHomeFeed' as const;
  isEnabled = false;

  enable(pageType: PageType) {
    if (this.isEnabled || pageType !== 'home') return;
    this.isEnabled = true;

    // This is handled by zen search, but register as enabled
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;
  }
}

class HideEndCardsModule implements FeatureModule {
  name = 'hideEndCards' as const;
  isEnabled = false;

  enable(pageType: PageType) {
    if (this.isEnabled || pageType !== 'watch') return;
    this.isEnabled = true;

    const selectors = YT_SELECTORS.distractions.endScreens;
    if (!selectors.guard()) return;

    document.querySelectorAll([
      selectors.container,
      selectors.overlay,
      selectors.suggestions,
    ].join(', ')).forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;

    document.querySelectorAll([
      YT_SELECTORS.distractions.endScreens.container,
      YT_SELECTORS.distractions.endScreens.overlay,
      YT_SELECTORS.distractions.endScreens.suggestions,
    ].join(', ')).forEach(el => {
      (el as HTMLElement).style.display = '';
    });
  }
}

class HideCommentsModule implements FeatureModule {
  name = 'hideComments' as const;
  isEnabled = false;

  enable(pageType: PageType) {
    if (this.isEnabled || !['watch', 'results'].includes(pageType)) return;
    this.isEnabled = true;

    const selectors = YT_SELECTORS.distractions.comments;
    if (!selectors.guard()) return;

    document.querySelectorAll([
      selectors.container,
      selectors.entryPoints,
      selectors.mainComments,
    ].join(', ')).forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;

    document.querySelectorAll([
      YT_SELECTORS.distractions.comments.container,
      YT_SELECTORS.distractions.comments.entryPoints,
      YT_SELECTORS.distractions.comments.mainComments,
    ].join(', ')).forEach(el => {
      (el as HTMLElement).style.display = '';
    });
  }
}

class HideSidebarModule implements FeatureModule {
  name = 'hideSidebar' as const;
  isEnabled = false;

  enable(pageType: PageType) {
    if (this.isEnabled || pageType !== 'watch') return;
    this.isEnabled = true;

    const selector = YT_SELECTORS.distractions.sidebar.container;
    document.querySelectorAll(selector).forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;

    document.querySelectorAll(YT_SELECTORS.distractions.sidebar.container).forEach(el => {
      (el as HTMLElement).style.display = '';
    });
  }
}

class SearchOnlyModule implements FeatureModule {
  name = 'searchOnly' as const;
  isEnabled = false;

  enable(pageType: PageType) {
    if (this.isEnabled || pageType !== 'results') return;
    this.isEnabled = true;

    // For search-only, hide everything except the actual search results
    const selectors = YT_SELECTORS.distractions.searchOnly;
    if (!selectors.guard()) return;

    // This would hide secondary content and focuses only on main results
    // More selective than zen search - keeps YouTube's search results visible
    document.querySelectorAll(YT_SELECTORS.containers.secondaryContent).forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;

    document.querySelectorAll(YT_SELECTORS.containers.secondaryContent).forEach(el => {
      (el as HTMLElement).style.display = '';
    });
  }
}

// Initialize the controller
export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  runAt: 'document_start',
  main() {
    new YouTubeDistractionController();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      console.log('Zen YouTube: Page unloading');
    });
  },
});
