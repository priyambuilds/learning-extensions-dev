// src/entrypoints/background.ts
import { zenSettings } from '@/lib/storage'; // typed defineItem you exported

export default defineBackground(() => {
  chrome.commands.onCommand.addListener(async (cmd) => {
    if (cmd !== 'toggle-zen') return;

    const current = await zenSettings.getValue();
    await zenSettings.setValue({ ...current, enabled: !current.enabled });
  });

  // optional: initialize defaults on install/update
  chrome.runtime.onInstalled.addListener(async () => {
    const current = await zenSettings.getValue();
    await zenSettings.setValue(current); // ensures item exists with fallback
  });
});
