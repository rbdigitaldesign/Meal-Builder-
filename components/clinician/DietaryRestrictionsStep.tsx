"use client";

import type { DietaryRestriction } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const OPTIONS: { key: DietaryRestriction; label: string; description: string }[] = [
  { key: "vegetarian", label: "Vegetarian",  description: "No meat or fish" },
  { key: "vegan",      label: "Vegan",       description: "No animal products — includes vegetarian" },
  { key: "glutenFree", label: "Gluten-free", description: "No wheat, barley or rye" },
  { key: "dairyFree",  label: "Dairy-free",  description: "No milk or dairy products" },
  { key: "nutFree",    label: "Nut-free",    description: "No tree nuts or peanuts" },
];

interface Props {
  selected: DietaryRestriction[];
  onChange: (restrictions: DietaryRestriction[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DietaryRestrictionsStep({ selected, onChange, onNext, onBack }: Props) {
  function toggle(key: DietaryRestriction) {
    if (selected.includes(key)) {
      // Removing vegan also removes vegetarian (it was auto-added)
      const toRemove = key === "vegan" ? ["vegan", "vegetarian"] : [key];
      onChange(selected.filter((r) => !toRemove.includes(r)));
    } else {
      // Adding vegan auto-adds vegetarian
      const toAdd: DietaryRestriction[] = key === "vegan" ? ["vegan", "vegetarian"] : [key];
      const next = Array.from(new Set([...selected, ...toAdd]));
      onChange(next);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Dietary Restrictions</h2>
        <p className="text-sm text-stone-500">Select all that apply. These filter food suggestions throughout the app.</p>
      </div>
      <div className="space-y-3">
        {OPTIONS.map(({ key, label, description }) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors text-left ${
                active
                  ? "border-brand-olive bg-brand-sage/20"
                  : "border-brand-warm bg-white hover:border-brand-sage"
              }`}
            >
              <div>
                <p className="font-medium text-brand-black">{label}</p>
                <p className="text-xs text-stone-500">{description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                active ? "border-brand-olive bg-brand-olive" : "border-stone-300"
              }`}>
                {active && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
}
