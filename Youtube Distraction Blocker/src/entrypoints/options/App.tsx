import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { getSettings, saveSettings, type ZenSettings } from '@/lib/storage';

export default function Options() {
    const [settings, setSettings] = useState<ZenSettings | null>(null);
    const [message, setMessage] = useState('');

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

  return (
    <div className="max-w-3xl min-h-screen p-8 mx-auto space-y-8 bg-background text-foreground">
      <header>
        <h1 className="text-3xl font-semibold">Zen YouTube — Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure homepage behavior and theme.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled" className="text-base">Enable Zen Mode</Label>
          <Switch
            id="enabled"
            checked={settings.enabled}
            onCheckedChange={(v) => persist({ enabled: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="dark" className="text-base">Dark Mode</Label>
          <Switch
            id="dark"
            checked={settings.darkMode}
            onCheckedChange={(v) => persist({ darkMode: v })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="msg">Custom Heading</Label>
          <div className="flex gap-2">
            <Input
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you want to see?"
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
    </div>
  )
}