import { storage } from '#imports';

export interface ZenSettings {
    enabled: boolean;
    customMessage: string;
    darkMode: boolean;
}

export const DEFAULT_SETTINGS: ZenSettings = {
    enabled: true,
    customMessage: '🚀 YouTube Distraction Blocker is enabled',
    darkMode: false,
}

// Define storage items with proper typing
export const zenSettings = storage.defineItem<ZenSettings>('local:zenSettings', {
    fallback: DEFAULT_SETTINGS,
    version: 1,
})

// Get settings from storage
export async function getSettings(): Promise<ZenSettings> {
    return await zenSettings.getValue();
}

// Save settings to storage
export async function saveSettings(newSettings: Partial<ZenSettings>): Promise<void> {
  const currentSettings = await zenSettings.getValue();
  const updatedSettings = { ...currentSettings, ...newSettings };
  await zenSettings.setValue(updatedSettings);
}

// Watch for settings changes
export function onSettingsChanged(callback: (settings: ZenSettings) => void) {
    return storage.watch('local:zenSettings', async () => {
        const settings = await zenSettings.getValue();
        callback(settings);
    });
}