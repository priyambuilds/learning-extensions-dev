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
    <div className=''>
      <Label htmlFor={id} className='text-sm font-medium text-foreground'>{label}</Label>
    </div>
  )
}