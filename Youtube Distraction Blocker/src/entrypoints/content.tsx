// Content script: root-mounted + Shadow DOM + constructable stylesheet injection.
// Fixes: broken viewport-fixed positioning under transformed ancestors and host CSS bleed. 

import { createRoot } from 'react-dom/client';
import ZenSearch from '@/components/ZenSearch';
import { getSettings, onSettingsChanged } from '@/lib/storage';
import {
  YT_SELECTORS,
  getCurrentPageType,
  isFeatureAvailableOnPage,
  type PageType,
} from '@/lib/yt-selectors';
import type { ZenSettings, FeatureToggles } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

// IMPORTANT: Do NOT import CSS globally into the page.
// Instead, import your Tailwind build as text and adopt it inside the shadow.
import cssText from '@/styles/globals.css?inline'; // contains @tailwind base/components/utilities

interface FeatureModule {
  name: keyof FeatureToggles;
  isEnabled: boolean;
  enable: (pageType: PageType) => void;
  disable: () => void;
}

class YouTubeDistractionController {
  private settings: ZenSettings | null = null;
  private currentPageType: PageType = 'other';

  // Shadow host + root
  private zenHostEl: HTMLDivElement | null = null;
  private shadow: ShadowRoot | null = null;
  private reactRoot: ReturnType<typeof createRoot> | null = null;

  // Page-level styles used to hide YouTube UI when overlay is visible
  private hideStylesEl: HTMLStyleElement | null = null;

  private features: Record<string, FeatureModule> = {};
  private navigationObserver: MutationObserver | null = null;
  private titleObserver: MutationObserver | null = null;

  private isInitialized = false;
  private pendingSettings: ZenSettings | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    await this.waitForDomInteractive();
    await this.loadSettingsAndWire();
  }

  private waitForDomInteractive(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
      }
    });
  }

  private async loadSettingsAndWire() {
    try {
      onSettingsChanged((s) => {
        if (!this.settings) {
          this.pendingSettings = s;
        } else {
          this.handleSettingsChange(s);
        }
      });

      this.settings = await getSettings();

      this.initializeFeatureModules();
      this.setupNavigationObservers();
      this.onNavigation();

      if (this.pendingSettings) {
        this.handleSettingsChange(this.pendingSettings);
        this.pendingSettings = null;
      }
    } catch (e) {
      console.error('Zen YouTube: init failed', e);
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

  private setupNavigationObservers() {
    document.addEventListener('yt-navigate-finish', this.onNavigation);

    this.navigationObserver = new MutationObserver(() => {
      const next = getCurrentPageType();
      if (next !== this.currentPageType) this.onNavigation();
    });
    this.navigationObserver.observe(document.documentElement, { childList: true, subtree: true });

    this.titleObserver = new MutationObserver(() => {
      setTimeout(() => this.onNavigation(), 80);
    });
    this.titleObserver.observe(document.querySelector('title') || document.head, {
      childList: true,
      subtree: true,
    });
  }

  private onNavigation = () => {
    this.currentPageType = getCurrentPageType();
    this.updateZenSearch();
    this.updateAllFeatures();
  };

  private handleSettingsChange(newSettings: ZenSettings) {
    const prev = this.settings;
    this.settings = newSettings;

    if (!prev || prev.enabled !== newSettings.enabled) this.updateZenSearch();
    this.updateAllFeatures();
  }

  private updateZenSearch() {
    const shouldShow =
      !!this.settings?.features.hideHomeFeed &&
      this.currentPageType === 'home' &&
      !!this.settings?.enabled;

    if (shouldShow) this.showZenSearch();
    else this.hideZenSearch();
  }

  // Show overlay: hide YouTube UI with page-level <style>, then render React inside a ShadowRoot
  private showZenSearch() {
    if (this.zenHostEl) return;

    // 1) Hide host UI safely while overlay is on
    this.hideStylesEl = document.createElement('style');
    this.hideStylesEl.id = 'zen-youtube-styles';
    this.hideStylesEl.textContent = `
      ${YT_SELECTORS.containers.pageManager}, ${YT_SELECTORS.containers.app} {
        display: none !important;
      }
      html, body {
        background: #0b0b0b !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(this.hideStylesEl);

    // 2) Create host mounted at the document root (avoids transformed ancestors)
    const host = document.createElement('div');
    host.id = 'zen-youtube-host';
    host.style.all = 'initial';
    host.style.position = 'fixed';
    host.style.inset = '0';
    host.style.zIndex = '2147483646';
    host.style.pointerEvents = 'auto';
    document.documentElement.appendChild(host);
    this.zenHostEl = host;

    // 3) Shadow DOM for style isolation
    const shadow = host.attachShadow({ mode: 'open' });
    this.shadow = shadow;

    // 4) Inject Tailwind (constructable stylesheet + fallback)
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      // ts-expect-error: adoptedStyleSheets not always typed on ShadowRoot
      shadow.adoptedStyleSheets = [sheet];
    } catch {
      const style = document.createElement('style');
      style.textContent = cssText;
      shadow.appendChild(style);
    }

    // 5) React mount inside the shadow
    const app = document.createElement('div');
    shadow.appendChild(app);
    this.reactRoot = createRoot(app);
    this.reactRoot.render(<ZenSearch />);
  }

  private hideZenSearch() {
    if (!this.zenHostEl) return;

    // Unmount React
    try {
      this.reactRoot?.unmount();
    } catch {}
    this.reactRoot = null;

    // Remove host + shadow
    try {
      this.zenHostEl.remove();
    } catch {}
    this.zenHostEl = null;
    this.shadow = null;

    // Remove page-level hide styles
    try {
      this.hideStylesEl?.remove();
    } catch {}
    this.hideStylesEl = null;
  }

  private updateAllFeatures() {
    if (!this.settings?.enabled) {
      Object.values(this.features).forEach((f) => {
        if (f.isEnabled) f.disable();
      });
      return;
    }

    Object.entries(this.features).forEach(([name, feature]) => {
      const enable =
        this.settings!.features[name as keyof FeatureToggles] &&
        isFeatureAvailableOnPage(name as keyof FeatureToggles, this.currentPageType);

      if (enable && !feature.isEnabled) feature.enable(this.currentPageType);
      else if (!enable && feature.isEnabled) feature.disable();
    });
  }
}

// ========== Feature Modules (unchanged behavior) ==========

abstract class BaseFeatureModule implements FeatureModule {
  abstract name: keyof FeatureToggles;
  isEnabled = false;
  private retryAttempts = 0;
  private maxRetries = 10;
  private retryInterval = 500;

  protected abstract getSelectors(): { container: string; items?: string } & {
    [key: string]: string;
  };
  protected guard?(): boolean;

  enable(_pageType: PageType) {
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
      const found = document.querySelectorAll(elements.join(', '));

      if (found.length === 0 && this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        setTimeout(() => this.applyHide(), this.retryInterval);
        return;
      }

      found.forEach((el) => ((el as HTMLElement).style.display = 'none'));
      this.observeNewElements(selectors);
    } catch (e) {
      console.log(`Zen YouTube: Error hiding ${this.name}`, e);
    }
  }

  private applyShow() {
    const selectors = this.getSelectors();
    const elements = Object.values(selectors);
    try {
      document.querySelectorAll(elements.join(', ')).forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    } catch (e) {
      console.log(`Zen YouTube: Error showing ${this.name}`, e);
    }
  }

  private observeNewElements(selectors: Record<string, string>) {
    const observer = new MutationObserver((mutations) => {
      if (!this.isEnabled) return;

      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const element = node as HTMLElement;

          const matchesAny =
            Object.values(selectors).some((sel) => element.matches?.(sel)) ||
            Object.values(selectors).some((sel) => !!element.querySelector?.(sel));

          if (matchesAny) {
            Object.values(selectors).forEach((sel) => {
              element.querySelectorAll(sel).forEach((n) => {
                (n as HTMLElement).style.display = 'none';
              });
            });
          }
        });
      }
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
}

class HideHomeFeedModule implements FeatureModule {
  name = 'hideHomeFeed' as const;
  isEnabled = false;
  enable(pageType: PageType) {
    if (this.isEnabled || pageType !== 'home') return;
    this.isEnabled = true;
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
}

class HideSidebarModule extends BaseFeatureModule implements FeatureModule {
  name = 'hideSidebar' as const;
  protected getSelectors() {
    return {
      container: YT_SELECTORS.distractions.sidebar.container,
    };
  }
}

class SearchOnlyModule extends BaseFeatureModule implements FeatureModule {
  name = 'searchOnly' as const;
  protected getSelectors() {
    return {
      container: YT_SELECTORS.containers.secondaryContent,
    };
  }
}

// ========== WXT content entry ==========
export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  runAt: 'document_start',
  main() {
    new YouTubeDistractionController();
    window.addEventListener('beforeunload', () => {});
  },
});
