"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  name: string;
  pin: string;
  onChangeName: (v: string) => void;
  onChangePin: (v: string) => void;
  onNext: () => void;
}

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function PatientInfoStep({ name, pin, onChangeName, onChangePin, onNext }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Patient Details</h2>
        <p className="text-sm text-stone-500">Enter the patient's name and assign a PIN they'll use to log in on their device.</p>
      </div>
      <Input
        label="Patient name"
        placeholder="e.g. Sarah Mitchell"
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        autoFocus
      />
      <div className="space-y-1">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="PIN (optional)"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => onChangePin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              hint="Leave blank to allow open access to settings"
            />
          </div>
          <button
            type="button"
            onClick={() => onChangePin(generatePin())}
            className="mb-[22px] px-3 py-2 text-sm font-medium text-brand-olive border border-brand-warm rounded-xl hover:bg-brand-sage/20 transition-colors whitespace-nowrap"
          >
            Generate
          </button>
        </div>
        {pin.length === 4 && (
          <p className="text-xs text-brand-forest bg-brand-sage/20 rounded-lg px-3 py-2">
            PIN: <span className="font-mono font-bold tracking-widest">{pin}</span> — share this with the patient.
          </p>
        )}
      </div>
      <Button onClick={onNext} disabled={!name.trim()} className="w-full">
        Continue
      </Button>
    </div>
  );
}

