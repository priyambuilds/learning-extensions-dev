import { describe, it, expect, beforeEach } from 'vitest';
import { getCurrentPageType, isFeatureAvailableOnPage, exists, hasChildElements, type PageType } from './yt-selectors';
import type { FeatureToggles } from '@/types/settings';

describe('YouTube Selectors', () => {
  beforeEach(() => {
    // Mock window.location for testing
    delete (global.window as any).location;
    global.window.location = {} as any;
  });

  describe('getCurrentPageType', () => {
    it('should detect home page', () => {
      Object.defineProperty(window.location, 'pathname', { value: '/' });
      expect(getCurrentPageType()).toBe('home');
    });

    it('should detect watch page', () => {
      Object.defineProperty(window.location, 'pathname', { value: '/watch' });
      expect(getCurrentPageType()).toBe('watch');
    });

    it('should detect results page', () => {
      Object.defineProperty(window.location, 'pathname', { value: '/results' });
      expect(getCurrentPageType()).toBe('results');
    });

    it('should detect feed page', () => {
      Object.defineProperty(window.location, 'pathname', { value: '/feed' });
      expect(getCurrentPageType()).toBe('feed');
    });

    it('should default to other for unknown pages', () => {
      Object.defineProperty(window.location, 'pathname', { value: '/unknown' });
      expect(getCurrentPageType()).toBe('other');
    });
  });

  describe('isFeatureAvailableOnPage', () => {
    it('should allow hideShorts on specific pages', () => {
      expect(isFeatureAvailableOnPage('hideShorts', 'home')).toBe(true);
      expect(isFeatureAvailableOnPage('hideShorts', 'results')).toBe(true);
      expect(isFeatureAvailableOnPage('hideShorts', 'feed')).toBe(true);
      expect(isFeatureAvailableOnPage('hideShorts', 'watch')).toBe(false);
      expect(isFeatureAvailableOnPage('hideShorts', 'other')).toBe(false);
    });

    it('should allow hideHomeFeed only on home page', () => {
      expect(isFeatureAvailableOnPage('hideHomeFeed', 'home')).toBe(true);
      expect(isFeatureAvailableOnPage('hideHomeFeed', 'watch')).toBe(false);
      expect(isFeatureAvailableOnPage('hideHomeFeed', 'results')).toBe(false);
      expect(isFeatureAvailableOnPage('hideHomeFeed', 'feed')).toBe(false);
      expect(isFeatureAvailableOnPage('hideHomeFeed', 'other')).toBe(false);
    });

    it('should allow hideEndCards only on watch page', () => {
      expect(isFeatureAvailableOnPage('hideEndCards', 'watch')).toBe(true);
      expect(isFeatureAvailableOnPage('hideEndCards', 'home')).toBe(false);
      expect(isFeatureAvailableOnPage('hideEndCards', 'results')).toBe(false);
      expect(isFeatureAvailableOnPage('hideEndCards', 'feed')).toBe(false);
      expect(isFeatureAvailableOnPage('hideEndCards', 'other')).toBe(false);
    });

    it('should allow hideComments on watch and results pages', () => {
      expect(isFeatureAvailableOnPage('hideComments', 'watch')).toBe(true);
      expect(isFeatureAvailableOnPage('hideComments', 'results')).toBe(true);
      expect(isFeatureAvailableOnPage('hideComments', 'home')).toBe(false);
      expect(isFeatureAvailableOnPage('hideComments', 'feed')).toBe(false);
      expect(isFeatureAvailableOnPage('hideComments', 'other')).toBe(false);
    });

    it('should allow hideSidebar only on watch page', () => {
      expect(isFeatureAvailableOnPage('hideSidebar', 'watch')).toBe(true);
      expect(isFeatureAvailableOnPage('hideSidebar', 'home')).toBe(false);
      expect(isFeatureAvailableOnPage('hideSidebar', 'results')).toBe(false);
      expect(isFeatureAvailableOnPage('hideSidebar', 'feed')).toBe(false);
      expect(isFeatureAvailableOnPage('hideSidebar', 'other')).toBe(false);
    });

    it('should allow searchOnly only on results page', () => {
      expect(isFeatureAvailableOnPage('searchOnly', 'results')).toBe(true);
      expect(isFeatureAvailableOnPage('searchOnly', 'home')).toBe(false);
      expect(isFeatureAvailableOnPage('searchOnly', 'watch')).toBe(false);
      expect(isFeatureAvailableOnPage('searchOnly', 'feed')).toBe(false);
      expect(isFeatureAvailableOnPage('searchOnly', 'other')).toBe(false);
    });
  });

  describe('DOM helper functions', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="test-element">
          <div class="child"></div>
          <div class="child"></div>
        </div>
        <div id="empty-element"></div>
      `;
    });

    describe('exists', () => {
      it('should return true for existing element', () => {
        expect(exists('#test-element')).toBe(true);
      });

      it('should return false for non-existing element', () => {
        expect(exists('#nonexistent')).toBe(false);
      });
    });

    describe('hasChildElements', () => {
      it('should return true for element with children', () => {
        expect(hasChildElements('#test-element')).toBe(true);
      });

      it('should return false for empty element', () => {
        expect(hasChildElements('#empty-element')).toBe(false);
      });

      it('should return false for non-existing element', () => {
        expect(hasChildElements('#nonexistent')).toBe(false);
      });
    });
  });
});
