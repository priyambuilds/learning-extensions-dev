// src/entrypoints/background.ts
import { zenSettings } from '@/lib/storage';

export default defineBackground(() => {
  // Handle keyboard shortcuts
  chrome.commands.onCommand.addListener(async (command) => {
    try {
      const current = await zenSettings.getValue();

      if (command === 'toggle-zen') {
        const newValue = !current.enabled;
        await zenSettings.setValue({ ...current, enabled: newValue });

        // Send toast notification to current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id && tab.url?.includes('youtube.com')) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'command-feedback',
            data: {
              type: 'zen-mode',
              enabled: newValue,
            }
          });
        }

      } else if (command === 'toggle-search-only') {
        const newValue = !current.features.searchOnly;
        await zenSettings.setValue({
          ...current,
          features: { ...current.features, searchOnly: newValue }
        });

        // Send toast notification to current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id && tab.url?.includes('youtube.com')) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'command-feedback',
            data: {
              type: 'search-only',
              enabled: newValue,
            }
          });
        }
      }
    } catch (error) {
      console.error('Command handler error:', error);
    }
  });

  // Initialize defaults on install/update
  chrome.runtime.onInstalled.addListener(async () => {
    try {
      const current = await zenSettings.getValue();
      await zenSettings.setValue(current); // ensures item exists with fallback
    } catch (error) {
      console.error('Install handler error:', error);
    }
  });
});
