import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getSettings, saveSettings, type ZenSettings, onSettingsChanged } from '@/lib/storage';

function Row ({
  label,
  checked,
  onChange,
  id
} : {
  label: string,
  checked: boolean,
  onChange: (v: boolean) => void,
  id: string
}) {
  return (
    <div className='flex items-center justify-between '>
      <Label htmlFor={id} className='text-sm font-medium text-foreground'>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export default function App() {
  const [settings, setSettings] = useState<ZenSettings | null>(null);
  const [message, setMessage] = useState('');


  // initial load + live updates
  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setMessage(s.customMessage);
    });
    const unwatch = onSettingsChanged((s) => {
      setSettings(s);
      // keep local edit unless user hasn't typed
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

  const persistToggle = async (patch: Partial<ZenSettings>) => {
    await saveSettings(patch);
  };

  const handleSave = async () => {
    await saveSettings({ customMessage: message.trim() });
  };

  return (
    <div className={`w-80 p-6 bg-background text-foreground ${settings.darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className='mb-5'>
        <div className="flex gap-2 items center">
          <div className="grid rounded-lg h-7 w-7 bg-primary text-primary-foreground place-items-center">
            <span className='text-xs font-bold'>Z</span>
          </div>
          <h1 className='text-lg font-semibold'>Zen Youtube</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Minimal homepage with focused search.
        </p>
      </div>

      {/* Toggles */}
      <div className='mb-5 space-y-4'>
        <Row 
          id="enabled"
          label="Enable Zen Mode"
          checked={settings.enabled}
          onChange={(v) => persistToggle({ enabled: v })}
        />
        <Row
          id="darkMode"
          label="Dark Mode"
          checked={settings.darkMode}
          onChange={(v) => persistToggle({ darkMode: v })}
        />
      </div>
      {/* Custom message */}
      <div className='space-y-2'>
        <Label htmlFor="message" className="text-sm">Custom Heading</Label>
        <Input
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What do you want to see?"
        />
        <Button
          onClick={handleSave}
          className="w-full apple-hover"
          disabled={!canSave}
        > Save</Button>
      </div>
      {/* Status */}
      <div className="pt-3 mt-4 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Status: {settings.enabled ? 'Active' : 'Disabled'}
        </p>
      </div>
    </div>
  )

}