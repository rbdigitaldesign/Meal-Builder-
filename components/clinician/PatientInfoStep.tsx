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

export function PatientInfoStep({ name, pin, onChangeName, onChangePin, onNext }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Patient Details</h2>
        <p className="text-sm text-stone-500">Enter the patient's name. A PIN is optional — it prevents the patient from editing these settings.</p>
      </div>
      <Input
        label="Patient name"
        placeholder="e.g. Sarah Mitchell"
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        autoFocus
      />
      <Input
        label="PIN (optional)"
        type="password"
        inputMode="numeric"
        maxLength={4}
        placeholder="4-digit PIN"
        value={pin}
        onChange={(e) => onChangePin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        hint="Leave blank to allow open access to settings"
      />
      <Button onClick={onNext} disabled={!name.trim()} className="w-full">
        Continue
      </Button>
    </div>
  );
}
