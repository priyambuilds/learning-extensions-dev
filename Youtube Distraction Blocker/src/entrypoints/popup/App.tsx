import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, ExternalLink } from 'lucide-react';
import { getSettings, saveSettings, onSettingsChanged } from '@/lib/storage';
import type { ZenSettings } from '@/types/settings';

function FeatureRow({
  label,
  description,
  checked,
  onChange,
  id
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="ml-3"
      />
    </div>
  );
}

export default function App() {
  const [settings, setSettings] = useState<ZenSettings | null>(null);
  const [message, setMessage] = useState('');

  // Initial load + live updates
  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setMessage(s.customMessage);
    });
    const unwatch = onSettingsChanged((s) => {
      setSettings(s);
      // Keep local edit unless user hasn't typed
      setMessage((m) => (m.trim().length ? m : s.customMessage));
    });
    return unwatch;
  }, []);

  const canSave = useMemo(
    () => settings && message.trim() && message.trim() !== settings.customMessage,
    [settings, message],
  );

  if (!settings) {
    return (
      <div className="p-6 w-80 bg-background text-foreground">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const persistToggle = async (updates: Partial<ZenSettings>) => {
    await saveSettings(updates);
  };

  const handleSave = async () => {
    await saveSettings({ customMessage: message.trim() });
  };

  return (
    <div className="w-80 min-h-[400px] bg-background text-foreground">
      {/* Header with Status Pill */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`grid rounded-lg h-7 w-7 text-primary-foreground place-items-center ${
              settings.enabled ? 'bg-primary' : 'bg-muted'
            }`}>
              <span className="text-xs font-bold">Z</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Zen YouTube</h1>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                settings.enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {settings.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Control distractions while browsing YouTube
        </p>
      </div>

      {/* Main Toggle */}
      <div className="px-6 pb-4">
        <Switch
          id="global-enabled"
          checked={settings.enabled}
          onCheckedChange={(v) => persistToggle({ enabled: v })}
          className="mr-3"
        />
        <Label
          htmlFor="global-enabled"
          className="text-base font-medium cursor-pointer"
        >
          Enable Zen Mode
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Globally control all features
        </p>
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-4 space-y-3">
        <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>

        <FeatureRow
          id="hide-shorts"
          label="Hide Shorts"
          description="Remove Shorts feed & recommendations"
          checked={settings.features.hideShorts}
          onChange={(v) => persistToggle({
            features: { ...settings.features, hideShorts: v }
          })}
        />

        <FeatureRow
          id="hide-home"
          label="Hide Home Feed"
          description="Replace with zen search"
          checked={settings.features.hideHomeFeed}
          onChange={(v) => persistToggle({
            features: { ...settings.features, hideHomeFeed: v }
          })}
        />

        <FeatureRow
          id="search-only"
          label="Search-only Mode"
          description="Limit to search interface"
          checked={settings.features.searchOnly}
          onChange={(v) => persistToggle({
            features: { ...settings.features, searchOnly: v }
          })}
        />
      </div>

      {/* Custom Message */}
      <div className="px-6 pb-4">
        <h3 className="mb-2 text-sm font-medium text-foreground">Custom Heading</h3>
        <div className="space-y-2">
          <Input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Focus on what matters to you"
            className="text-sm"
          />
          <Button
            onClick={handleSave}
            className="w-full apple-hover"
            disabled={!canSave}
            size="sm"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="justify-between w-full"
          onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })}
        >
          <span className="text-sm">Full Settings</span>
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
