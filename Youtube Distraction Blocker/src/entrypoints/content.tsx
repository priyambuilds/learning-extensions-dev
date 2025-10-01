import '../styles/globals.css';
import { createRoot } from 'react-dom/client';
import ZenSearch from '@/components/ZenSearch';
import { getSettings, onSettingsChanged, isFeatureEnabled } from '@/lib/storage';
import { showCommandFeedback } from '@/lib/toast';
import {
  YT_SELECTORS,
  getCurrentPageType,
  isFeatureAvailableOnPage,
  exists,
  hasChildElements,
  type PageType
} from '@/lib/yt-selectors';
import type { ZenSettings, FeatureToggles } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

// Feature module interfaces
interface FeatureModule {
  name: keyof FeatureToggles;
  isEnabled: boolean;
  enable: (pageType: PageType) => void;
  disable: () => void;
}

class YouTubeDistractionController {
  private settings: ZenSettings | null = null;
  private currentPageType: PageType = 'other';
  private zenSearchRoot: ReturnType<typeof createRoot> | null = null;
  private zenSearchContainer: HTMLElement | null = null;
  private features: Record<string, FeatureModule> = {};
  private mutationObserver: MutationObserver | null = null;
  private isInitialized = false;
  private isDomReady = false;
  private pendingSettings: ZenSettings | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('Zen YouTube: Starting initialization...');

    // Wait for DOM and then load settings
    this.waitForDomReady().then(() => {
      this.loadSettingsAndInitialize();
    });
  }

  private async waitForDomReady(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // DOM is ready, but wait a bit for YouTube to load
        setTimeout(() => {
          this.isDomReady = true;
          resolve();
        }, 100);
        return;
      }

      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          this.isDomReady = true;
          resolve();
        }, 100);
      });
    });
  }

  private async loadSettingsAndInitialize() {
    try {
      // Watch for settings changes (set up before loading to not miss any changes)
      onSettingsChanged((newSettings) => {
        if (this.settings === null) {
          // Settings not loaded yet, store for later processing
          this.pendingSettings = newSettings;
        } else {
          this.handleSettingsChange(newSettings);
        }
      });

      // Load initial settings
      this.settings = await getSettings();
      console.log('Zen YouTube: Settings loaded', this.settings);

      // Initialize feature modules
      this.initializeFeatureModules();

      // Set up SPA navigation listening (after DOM ready)
      this.setupNavigationObserver();

      // Set up message listener for commands
      this.setupMessageListener();

      // Initial page processing
      this.onNavigation();

      // Handle any pending settings
      if (this.pendingSettings) {
        this.handleSettingsChange(this.pendingSettings);
        this.pendingSettings = null;
      }

    } catch (error) {
      console.error('Zen YouTube: Failed to initialize', error);
      // Fallback to defaults if settings fail
      this.settings = { ...DEFAULT_SETTINGS };
    }
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
abstract class BaseFeatureModule implements FeatureModule {
  abstract name: keyof FeatureToggles;
  isEnabled = false;
  private retryAttempts = 0;
  private maxRetries = 10;
  private retryInterval = 500;

  protected abstract getSelectors(): { container: string; items?: string } & { [key: string]: string };
  protected guard?(): boolean;

  enable(pageType: PageType) {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.retryAttempts = 0;
    this.applyHide();
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.applyShow();
  }

  private applyHide() {
    const selectors = this.getSelectors();
    const elements = Object.values(selectors);

    try {
      const foundElements = document.querySelectorAll(elements.join(', '));

      if (foundElements.length === 0 && this.retryAttempts < this.maxRetries) {
        // Try again later
        this.retryAttempts++;
        setTimeout(() => this.applyHide(), this.retryInterval);
        return;
      }

      foundElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });

      // Set up observer for new elements
      this.observeNewElements(selectors);

    } catch (error) {
      console.log(`Zen YouTube: Error hiding ${this.name}`, error);
    }
  }

  private applyShow() {
    const selectors = this.getSelectors();
    const elements = Object.values(selectors);

    try {
      document.querySelectorAll(elements.join(', ')).forEach(el => {
        (el as HTMLElement).style.display = '';
      });
    } catch (error) {
      console.log(`Zen YouTube: Error showing ${this.name}`, error);
    }
  }

  private observeNewElements(selectors: Record<string, string>) {
    const observer = new MutationObserver((mutations) => {
      if (!this.isEnabled) return;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const shouldHide = Object.values(selectors).some(selector => {
              return element.matches && element.matches(selector);
            }) || Object.values(selectors).some(selector => {
              return element.querySelector && element.querySelector(selector) !== null;
            });

            if (shouldHide) {
              // Apply hiding to new elements
              Object.values(selectors).forEach(sel => {
                element.querySelectorAll(sel).forEach(el => {
                  (el as HTMLElement).style.display = 'none';
                });
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

class HideShortsModule extends BaseFeatureModule implements FeatureModule {
  name = 'hideShorts' as const;

  protected getSelectors() {
    return {
      container: YT_SELECTORS.distractions.shorts.container,
      shelf: YT_SELECTORS.distractions.shorts.shelf,
      items: YT_SELECTORS.distractions.shorts.items,
    };
  }

  protected guard() {
    return typeof YT_SELECTORS.distractions.shorts.guard === 'function'
      ? YT_SELECTORS.distractions.shorts.guard()
      : true;
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

class HideEndCardsModule extends BaseFeatureModule implements FeatureModule {
  name = 'hideEndCards' as const;

  protected getSelectors() {
    return {
      container: YT_SELECTORS.distractions.endScreens.container,
      overlay: YT_SELECTORS.distractions.endScreens.overlay,
      suggestions: YT_SELECTORS.distractions.endScreens.suggestions,
    };
  }

  protected guard() {
    return typeof YT_SELECTORS.distractions.endScreens.guard === 'function'
      ? YT_SELECTORS.distractions.endScreens.guard()
      : true;
  }
}

class HideCommentsModule extends BaseFeatureModule implements FeatureModule {
  name = 'hideComments' as const;

  protected getSelectors() {
    return {
      container: YT_SELECTORS.distractions.comments.container,
      entryPoints: YT_SELECTORS.distractions.comments.entryPoints,
      mainComments: YT_SELECTORS.distractions.comments.mainComments,
    };
  }

  protected guard() {
    return typeof YT_SELECTORS.distractions.comments.guard === 'function'
      ? YT_SELECTORS.distractions.comments.guard()
      : true;
  }
}

class HideSidebarModule extends BaseFeatureModule implements FeatureModule {
  name = 'hideSidebar' as const;

  protected getSelectors() {
    return {
      container: YT_SELECTORS.distractions.sidebar.container,
    };
  }

  protected guard() {
    return typeof YT_SELECTORS.distractions.sidebar.guard === 'function'
      ? YT_SELECTORS.distractions.sidebar.guard()
      : true;
  }
}

class SearchOnlyModule extends BaseFeatureModule implements FeatureModule {
  name = 'searchOnly' as const;

  protected getSelectors() {
    return {
      container: YT_SELECTORS.containers.secondaryContent,
    };
  }

  protected guard() {
    return typeof YT_SELECTORS.distractions.searchOnly?.guard === 'function'
      ? YT_SELECTORS.distractions.searchOnly.guard()
      : true;
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
