import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSettings, importSettings, exportSettings } from './storage';

describe('Storage', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    vi.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return default settings when no settings are stored', async () => {
      const settings = await getSettings();

      expect(settings).toMatchObject({
        schemaVersion: expect.any(Number),
        hideShorts: expect.any(Boolean),
        hideHomeFeed: expect.any(Boolean),
        hideEndCards: expect.any(Boolean),
        hideComments: expect.any(Boolean),
        hideSidebar: expect.any(Boolean),
        searchOnlyMode: expect.any(Boolean),
        zenMode: expect.any(Boolean),
      });

      expect(settings.customMessage).toBeDefined();
      expect(settings.pathSpecificRules).toBeInstanceOf(Object);
    });

    it('should return stored settings when available', async () => {
      // Mock storage with custom settings
      const mockSettings = {
        schemaVersion: 1,
        hideShorts: true,
        hideHomeFeed: false,
        customMessage: 'Test Message',
        zenMode: true,
      };

      // Mock the storage get method to return our test settings
      chrome.storage.sync.get.mockResolvedValueOnce(mockSettings);

      const settings = await getSettings();

      expect(settings.hideShorts).toBe(true);
      expect(settings.hideHomeFeed).toBe(false);
      expect(settings.customMessage).toBe('Test Message');
      expect(settings.zenMode).toBe(true);
    });
  });

  describe('Settings migration', () => {
    it('should migrate settings without schema version to current version', async () => {
      const oldSettings = {
        hideShorts: true,
        hideHomeFeed: true,
      };

      chrome.storage.sync.get.mockResolvedValueOnce(oldSettings);

      // This should trigger migration
      await getSettings();

      // Should have called set to migrate
      expect(chrome.storage.sync.set).toHaveBeenCalled();
    });

    it('should not migrate if schema version matches', async () => {
      const currentSettings = {
        schemaVersion: 1,
        hideShorts: true,
        hideHomeFeed: true,
      };

      chrome.storage.sync.get.mockResolvedValueOnce(currentSettings);

      await getSettings();

      // Should not have called set since no migration needed
      expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    });
  });

  describe('Settings import/export', () => {
    it('should export settings to JSON', async () => {
      const json = await exportSettings();

      expect(json).toBeTypeOf('string');
      expect(() => JSON.parse(json)).not.toThrow();

      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('schemaVersion');
      expect(parsed).toHaveProperty('enabled');
      expect(parsed).toHaveProperty('features');
      expect(parsed).toHaveProperty('perPath');
    });

    it('should import settings from valid JSON', async () => {
      const testSettings = {
        schemaVersion: 1,
        enabled: true,
        customMessage: 'Imported message',
        reducedMotion: false,
        features: {
          hideShorts: true,
          hideHomeFeed: false,
          hideEndCards: true,
          hideComments: true,
          hideSidebar: false,
          searchOnly: false,
        },
        perPath: {
          watch: { hideShorts: true },
          results: { hideHomeFeed: false },
          feed: { hideComments: true },
        },
      };

      const jsonString = JSON.stringify(testSettings);

      // Should not throw
      await expect(importSettings(jsonString)).resolves.not.toThrow();
    });

    it('should reject invalid JSON', async () => {
      await expect(importSettings('invalid json')).rejects.toThrow('Import failed');
    });
  });
});
