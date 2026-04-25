"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Props {
  currentPin: string | null;
  onUpdate: (pin: string) => Promise<void>;
}

export function PINManager({ currentPin, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState(currentPin ?? "");
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onUpdate(pin);
    setSaving(false);
    setEditing(false);
  }

  return (
    <Card>
      <h3 className="font-semibold text-brand-forest mb-3">Patient PIN</h3>
      {editing ? (
        <div className="flex items-end gap-3">
          <Input
            label="New PIN"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            hint="4 digits. Leave blank to remove PIN protection."
            className="w-32"
          />
          <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setPin(currentPin ?? ""); }}>Cancel</Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-stone-500">Current PIN</p>
            <p className="text-2xl font-mono font-bold tracking-widest text-brand-forest mt-0.5">
              {currentPin ? (revealed ? currentPin : "••••") : <span className="text-stone-400 text-base font-normal">No PIN set</span>}
            </p>
          </div>
          <div className="flex gap-2 ml-auto">
            {currentPin && (
              <Button size="sm" variant="secondary" onClick={() => setRevealed((r) => !r)}>
                {revealed ? "Hide" : "Reveal"}
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              {currentPin ? "Reset PIN" : "Set PIN"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
