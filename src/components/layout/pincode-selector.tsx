'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useStoredString, writeStored } from '@/lib/client-storage';

const STORAGE_KEY = 'homekart:pincode';
const FALLBACK = 'Mumbai 400001';

function isPincode(value: string | null): value is string {
  return value !== null && /^\d{6}$/.test(value);
}

/**
 * Shows the customer's saved delivery pincode. It deliberately does not state a
 * delivery time: no serviceability check or express-delivery service exists yet,
 * so the reference artwork's "60 minutes" claim is not reproduced here.
 */
export function PincodeSelector() {
  const pincode = useStoredString(STORAGE_KEY);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function save() {
    if (!isPincode(draft)) return;
    writeStored(STORAGE_KEY, draft);
    setEditing(false);
  }

  return (
    <div className="relative hidden shrink-0 lg:block">
      {editing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="flex items-center gap-1.5"
        >
          <label htmlFor="pincode" className="sr-only">
            Delivery pincode
          </label>
          <input
            id="pincode"
            value={draft}
            onChange={(event) => setDraft(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="400001"
            className="h-9 w-24 rounded-lg border border-line bg-white px-2 text-sm tabular-nums focus:border-brand-400 focus:outline-none"
            autoFocus
          />
          <button type="submit" className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white">
            Set
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(isPincode(pincode) ? pincode : '');
            setEditing(true);
          }}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-cream"
        >
          <MapPin size={18} className="text-brand-600" aria-hidden />
          <span className="leading-tight">
            <span className="block text-[11px] text-ink-soft">Deliver to</span>
            <span className="block text-sm font-medium text-ink">{isPincode(pincode) ? pincode : FALLBACK}</span>
          </span>
        </button>
      )}
    </div>
  );
}
