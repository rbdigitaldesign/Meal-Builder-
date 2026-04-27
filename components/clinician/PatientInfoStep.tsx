"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  firstName: string;
  lastName: string;
  pin: string;
  onChangeFirstName: (v: string) => void;
  onChangeLastName: (v: string) => void;
  onChangePin: (v: string) => void;
  onNext: () => void;
}

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function PatientInfoStep({ firstName, lastName, pin, onChangeFirstName, onChangeLastName, onChangePin, onNext }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Patient Details</h2>
        <p className="text-sm text-stone-500">Enter the patient's name and assign a PIN they'll use to log in on their device.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          placeholder="e.g. Sarah"
          value={firstName}
          onChange={(e) => onChangeFirstName(e.target.value)}
          autoFocus
        />
        <Input
          label="Last name"
          placeholder="e.g. Mitchell"
          value={lastName}
          onChange={(e) => onChangeLastName(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="PIN"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => onChangePin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              hint="Required. The patient will use this 4-digit PIN to log in."
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

      <Button onClick={onNext} disabled={!firstName.trim() || pin.length !== 4} className="w-full">
        Continue
      </Button>
    </div>
  );
}
