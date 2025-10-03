import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { getSettings, saveSettings } from '@/lib/storage';
import type { ZenSettings } from '@/types/settings';

import { importSettings, exportSettings, resetSettings } from '@/lib/storage';
import { downloadBlob } from '@/lib/utils';

export default function Options() {
    const [settings, setSettings] = useState<ZenSettings | null>(null);
    const [message, setMessage] = useState('');
    const [importError, setImportError] = useState('');

    useEffect(() => {
        getSettings().then((s) => {
            setSettings(s);
            setMessage(s.customMessage);
        });
    }, []);

    if (!settings) return <div className='p-8'>Loading...</div>

    const persist = async (patch: Partial<ZenSettings>) => {
        await saveSettings(patch);
        setSettings({ ...settings, ...patch });
    };

    const handleExport = async () => {
        const json = await exportSettings();
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, 'zen-youtube-settings.json');
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            await importSettings(text);
            setImportError('');
            // Refresh settings
            const newSettings = await getSettings();
            setSettings(newSettings);
            setMessage(newSettings.customMessage);
        } catch (error) {
            setImportError(error instanceof Error ? error.message : 'Import failed');
        }
    };

    const handleReset = async () => {
        if (confirm('Reset all settings to defaults? This cannot be undone.')) {
            await resetSettings();
            const newSettings = await getSettings();
            setSettings(newSettings);
            setMessage(newSettings.customMessage);
        }
    };

  return (
    <div className="max-w-4xl min-h-screen p-8 mx-auto space-y-8 bg-background text-foreground">
      <header>
        <h1 className="text-4xl font-semibold">Zen YouTube — Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure distraction blocking and customize behavior.
        </p>
      </header>

      {/* Global Settings */}
      <section className="space-y-6">
        <h2 className="text-2xl font-medium">General</h2>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enabled" className="text-base">Enable Zen Mode</Label>
            <p className="text-sm text-muted-foreground">Globally enable/disable all features</p>
          </div>
          <Switch
            id="enabled"
            checked={settings.enabled}
            onCheckedChange={(v) => persist({ enabled: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="reducedMotion" className="text-base">Reduce Motion</Label>
            <p className="text-sm text-muted-foreground">Disable animations for better accessibility</p>
          </div>
          <Switch
            id="reducedMotion"
            checked={settings.reducedMotion}
            onCheckedChange={(v) => persist({ reducedMotion: v })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="msg">Custom heading (shown on home)</Label>
          <div className="flex gap-2">
            <Input
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like to focus on?"
            />
            <Button
              onClick={() =>
                message.trim() &&
                message !== settings.customMessage &&
                persist({ customMessage: message.trim() })
              }
              disabled={!message.trim() || message === settings.customMessage}
            >
              Save
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Toggles */}
      <section className="space-y-6">
        <h2 className="text-2xl font-medium">Default Features</h2>
        <p className="text-sm text-muted-foreground">
          These settings apply to all YouTube pages unless overridden below.
        </p>

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Hide Shorts</Label>
              <p className="text-sm text-muted-foreground">Remove YouTube Shorts feed and recommendations</p>
            </div>
            <Switch
              checked={settings.features.hideShorts}
              onCheckedChange={(v) => persist({
                features: { ...settings.features, hideShorts: v }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Hide Home Feed</Label>
              <p className="text-sm text-muted-foreground">Replace home page with zen search interface</p>
            </div>
            <Switch
              checked={settings.features.hideHomeFeed}
              onCheckedChange={(v) => persist({
                features: { ...settings.features, hideHomeFeed: v }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Hide End Cards</Label>
              <p className="text-sm text-muted-foreground">Remove suggested videos at end of videos</p>
            </div>
            <Switch
              checked={settings.features.hideEndCards}
              onCheckedChange={(v) => persist({
                features: { ...settings.features, hideEndCards: v }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Hide Comments</Label>
              <p className="text-sm text-muted-foreground">Remove comment sections</p>
            </div>
            <Switch
              checked={settings.features.hideComments}
              onCheckedChange={(v) => persist({
                features: { ...settings.features, hideComments: v }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Hide Sidebar</Label>
              <p className="text-sm text-muted-foreground">Remove recommendations sidebar</p>
            </div>
            <Switch
              checked={settings.features.hideSidebar}
              onCheckedChange={(v) => persist({
                features: { ...settings.features, hideSidebar: v }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Search-only Mode</Label>
              <p className="text-sm text-muted-foreground">Limit to search interface only</p>
            </div>
            <Switch
              checked={settings.features.searchOnly}
              onCheckedChange={(v) => persist({
                features: { ...settings.features, searchOnly: v }
              })}
            />
          </div>
        </div>
      </section>

      {/* Per-path overrides (placeholder for now) */}
      <section className="space-y-6">
        <h2 className="text-2xl font-medium">Page-specific Overrides</h2>
        <p className="text-sm text-muted-foreground">
          Customize features per YouTube page type.
        </p>
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">
            Per-path overrides will be implemented in the next version.
          </p>
        </div>
      </section>

      {/* Import/Export */}
      <section className="space-y-6">
        <h2 className="text-2xl font-medium">Backup & Reset</h2>

        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={handleExport}>
            Export Settings
          </Button>

          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              Import Settings
            </Button>
          </div>

          <Button variant="destructive" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>

        {importError && (
          <p className="text-sm text-destructive">{importError}</p>
        )}
      </section>
    </div>
  )
}
