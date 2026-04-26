"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const FOCUS_AREAS = [
  "Immune Support",
  "Mental Health",
  "Gut Health",
  "Bone Health",
  "Hormone Balance",
  "Energy & Fatigue",
];

const CLINICAL_CONDITIONS = [
  "Menopause",
  "PCOS",
  "Coeliac Disease",
  "Crohn's Disease",
  "IBS",
  "Osteoporosis",
  "Iron Deficiency Anaemia",
  "Type 2 Diabetes",
  "Hypothyroidism",
  "Endometriosis",
  "Pregnancy",
  "Vegan / B12 Deficiency",
];

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ConditionTagsStep({ selected, onChange, onNext, onBack }: Props) {
  const [custom, setCustom] = useState("");

  function toggle(tag: string) {
    onChange(
      selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]
    );
  }

  function addCustom() {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustom("");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Conditions & Focus Areas</h2>
        <p className="text-sm text-stone-500">Tag this client's conditions and health focus areas.</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Focus Areas</p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                selected.includes(tag)
                  ? "border-brand-olive bg-brand-olive text-white"
                  : "border-brand-warm bg-white text-stone-600 hover:border-brand-sage"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Clinical Conditions</p>
        <div className="flex flex-wrap gap-2">
          {CLINICAL_CONDITIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                selected.includes(tag)
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add custom condition…"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
        />
        <Button variant="secondary" onClick={addCustom} disabled={!custom.trim()}>Add</Button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-brand-sage/10 rounded-xl">
          {selected.map((tag) => (
            <span key={tag} className="flex items-center gap-1 bg-brand-olive text-white text-sm px-3 py-1 rounded-full">
              {tag}
              <button onClick={() => toggle(tag)} className="ml-1 opacity-70 hover:opacity-100">×</button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
}
