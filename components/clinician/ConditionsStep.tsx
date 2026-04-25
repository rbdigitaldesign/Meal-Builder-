"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const CONDITION_OPTIONS: { label: string; category: "focus" | "condition" }[] = [
  // Focus areas
  { label: "Immune Support",   category: "focus" },
  { label: "Mental Health",    category: "focus" },
  { label: "Gut Health",       category: "focus" },
  { label: "Bone Health",      category: "focus" },
  { label: "Hormone Balance",  category: "focus" },
  { label: "Energy & Fatigue", category: "focus" },
  // Clinical conditions
  { label: "Menopause",        category: "condition" },
  { label: "PCOS",             category: "condition" },
  { label: "Coeliac Disease",  category: "condition" },
  { label: "Crohn's Disease",  category: "condition" },
  { label: "IBS",              category: "condition" },
  { label: "Osteoporosis",     category: "condition" },
  { label: "Anaemia",          category: "condition" },
  { label: "Type 2 Diabetes",  category: "condition" },
  { label: "Hypothyroidism",   category: "condition" },
  { label: "Endometriosis",    category: "condition" },
];

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ConditionsStep({ selected, onChange, onNext, onBack }: Props) {
  const [custom, setCustom] = useState("");

  function toggle(label: string) {
    if (selected.includes(label)) {
      onChange(selected.filter((t) => t !== label));
    } else {
      onChange([...selected, label]);
    }
  }

  function addCustom() {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustom("");
  }

  const focusOptions    = CONDITION_OPTIONS.filter((o) => o.category === "focus");
  const clinicalOptions = CONDITION_OPTIONS.filter((o) => o.category === "condition");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Conditions & Focus Areas</h2>
        <p className="text-sm text-stone-500">
          Select any relevant conditions or goals. These appear on the patient&apos;s Health Plan card.
          Skip if none apply.
        </p>
      </div>

      {/* Focus areas */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Focus Areas</p>
        <div className="flex flex-wrap gap-2">
          {focusOptions.map(({ label }) => {
            const active = selected.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggle(label)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-brand-forest text-white border-brand-forest"
                    : "bg-white text-stone-600 border-brand-warm hover:border-brand-olive hover:text-brand-forest"
                }`}
              >
                {active ? "✓ " : ""}{label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical conditions */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Clinical Conditions</p>
        <div className="flex flex-wrap gap-2">
          {clinicalOptions.map(({ label }) => {
            const active = selected.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggle(label)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-white text-stone-600 border-brand-warm hover:border-amber-400 hover:text-amber-700"
                }`}
              >
                {active ? "✓ " : ""}{label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom entry */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Add Custom</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="e.g. Hashimoto's, Fibromyalgia…"
            className="flex-1 rounded-xl border border-brand-warm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
          />
          <Button variant="secondary" onClick={addCustom} size="sm" className="flex-shrink-0">
            Add
          </Button>
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selected.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full"
              >
                {tag}
                <button
                  onClick={() => toggle(tag)}
                  className="text-amber-400 hover:text-amber-700 leading-none ml-0.5"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
}
