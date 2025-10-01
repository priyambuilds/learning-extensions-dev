import { storage } from '#imports';
import type { ZenSettings, FeatureToggles, PerPathSettings } from '@/types/settings';
import {
  DEFAULT_SETTINGS,
  DEFAULT_FEATURE_TOGGLES,
  DEFAULT_PER_PATH_SETTINGS
} from '@/types/settings';

// Migration functions for schema changes
const MIGRATIONS = {
  1: (settings: any): ZenSettings => ({
    // Version 1 (current) - no changes needed
    schemaVersion: 1,
    enabled: settings.enabled ?? true,
    customMessage: settings.customMessage ?? '🚀 YouTube Distraction Blocker is active',
    reducedMotion: settings.reducedMotion ?? false,
    features: {
      hideShorts: settings.hideShorts ?? true,
      hideHomeFeed: settings.hideHomeFeed ?? true,
      hideEndCards: settings.hideEndCards ?? false,
      hideComments: settings.hideComments ?? false,
      hideSidebar: settings.hideSidebar ?? false,
      searchOnly: settings.searchOnly ?? false,
    },
    perPath: settings.perPath ?? { ...DEFAULT_PER_PATH_SETTINGS },
  }),
};

// Get current schema version
export const CURRENT_SCHEMA_VERSION = 1;

// Define storage items with migration support
export const zenSettings = storage.defineItem<ZenSettings>('sync:zenSettings', {
  fallback: DEFAULT_SETTINGS,
  version: CURRENT_SCHEMA_VERSION,
  migrations: MIGRATIONS,
});

// In-memory cache for performance
let cachedSettings: ZenSettings | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Get settings with caching
export async function getSettings(): Promise<ZenSettings> {
  const now = Date.now();

  // Return cached if still valid
  if (cachedSettings && (now - cacheTimestamp) < CACHE_DURATION) {
    return { ...cachedSettings };
  }

  try {
    const settings = await zenSettings.getValue();
    cachedSettings = settings;
    cacheTimestamp = now;
    return { ...settings };
  } catch (error) {
    console.warn('Storage access failed, using defaults:', error);
    // Fallback to local storage if sync fails
    try {
      const localSettings = await storage.defineItem<ZenSettings>('local:zenFallback', {
        fallback: DEFAULT_SETTINGS,
      }).getValue();
      cachedSettings = localSettings;
      cacheTimestamp = now;
      return { ...localSettings };
    } catch {
      // Ultimate fallback
      return { ...DEFAULT_SETTINGS };
    }
  }
}

// Save settings (will update cache)
export async function saveSettings(updates: Partial<ZenSettings>): Promise<void> {
  try {
    const current = await zenSettings.getValue();
    const updated = { ...current, ...updates };

    // Ensure schema version is current
    updated.schemaVersion = CURRENT_SCHEMA_VERSION;

    await zenSettings.setValue(updated);

    // Update cache
    cachedSettings = updated;
    cacheTimestamp = Date.now();

    // Also backup to local storage as fallback
    await storage.defineItem<ZenSettings>('local:zenFallback', {
      fallback: DEFAULT_SETTINGS,
    }).setValue(updated);
  } catch (error) {
    console.warn('Sync storage failed, falling back to local:', error);
    // Try local storage as fallback
    try {
      const fallbackItem = storage.defineItem<ZenSettings>('local:zenFallback', {
        fallback: DEFAULT_SETTINGS,
      });
      const current = await fallbackItem.getValue();
      const updated = { ...current, ...updates };
      updated.schemaVersion = CURRENT_SCHEMA_VERSION;
      await fallbackItem.setValue(updated);

      cachedSettings = updated;
      cacheTimestamp = Date.now();
    } catch (fallbackError) {
      console.error('All storage backends failed:', fallbackError);
    }
  }
}

// Import settings from JSON
export async function importSettings(jsonString: string): Promise<void> {
  try {
    const imported = JSON.parse(jsonString);

    // Validate basic structure
    if (typeof imported !== 'object' || imported === null) {
      throw new Error('Invalid JSON format');
    }

    // Run migration if needed
    const migrated = MIGRATIONS[CURRENT_SCHEMA_VERSION](imported);

    await saveSettings(migrated);
  } catch (error) {
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export settings to JSON
export async function exportSettings(): Promise<string> {
  const settings = await getSettings();
  return JSON.stringify(settings, null, 2);
}

// Reset to defaults
export async function resetSettings(): Promise<void> {
  const defaultSettings = { ...DEFAULT_SETTINGS };
  defaultSettings.schemaVersion = CURRENT_SCHEMA_VERSION;
  await zenSettings.setValue(defaultSettings);

  // Clear cache
  cachedSettings = null;
  cacheTimestamp = 0;
}

// Get effective settings for a specific path, merging globals with overrides
export async function getEffectiveSettings(path: keyof PerPathSettings): Promise<ZenSettings> {
  const settings = await getSettings();
  const pathOverrides = settings.perPath[path];

  return {
    ...settings,
    features: {
      ...settings.features,
      ...pathOverrides,
    },
  };
}

// Check if feature is enabled for current path
export async function isFeatureEnabled(feature: keyof FeatureToggles, path: keyof PerPathSettings): Promise<boolean> {
  const effective = await getEffectiveSettings(path);

  // Respect global enabled flag
  if (!effective.enabled) return false;

  return effective.features[feature] ?? false;
}

// Watch for settings changes
export function onSettingsChanged(callback: (settings: ZenSettings) => void) {
  return storage.watch('sync:zenSettings', async () => {
    // Invalidate cache
    cachedSettings = null;
    const settings = await getSettings();
    callback(settings);
  });
}
