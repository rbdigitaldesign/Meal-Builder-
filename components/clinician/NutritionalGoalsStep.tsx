"use client";

import type { NutritionalTarget, NutrientKey } from "@/lib/types";
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const EDITABLE_NUTRIENTS: NutrientKey[] = [
  "calories", "protein", "iron", "calcium", "vitaminB12", "zinc", "vitaminC", "fiber",
];

interface Props {
  targets: NutritionalTarget[];
  onChange: (targets: NutritionalTarget[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function NutritionalGoalsStep({ targets, onChange, onNext, onBack }: Props) {
  function updateTarget(nutrient: NutrientKey, value: number) {
    onChange(targets.map((t) => t.nutrient === nutrient ? { ...t, dailyTarget: value } : t));
  }

  function togglePriority(nutrient: NutrientKey) {
    onChange(
      targets.map((t) =>
        t.nutrient === nutrient
          ? { ...t, priority: t.priority === "critical" ? "recommended" : "critical" }
          : t
      )
    );
  }

  const shown = targets.filter((t) => EDITABLE_NUTRIENTS.includes(t.nutrient));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Nutritional Goals</h2>
        <p className="text-sm text-stone-500">
          Set daily targets. Mark nutrients as <strong>Critical</strong> to highlight them prominently in the patient view.
        </p>
      </div>
      <div className="space-y-3">
        {shown.map((target) => (
          <div key={target.nutrient} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-brand-warm">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-black truncate">
                {NUTRIENT_LABELS[target.nutrient]}
              </p>
              <p className="text-xs text-stone-500">{NUTRIENT_UNITS[target.nutrient]} per day</p>
            </div>
            <input
              type="number"
              value={target.dailyTarget}
              min={0}
              step={target.nutrient === "vitaminB12" ? 0.1 : 1}
              onChange={(e) => updateTarget(target.nutrient, parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-brand-warm px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
            />
            <button
              onClick={() => togglePriority(target.nutrient)}
              title={target.priority === "critical" ? "Mark as recommended" : "Mark as critical"}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                target.priority === "critical"
                  ? "bg-red-100 text-red-700"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {target.priority === "critical" ? "Critical" : "Recommended"}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Review</Button>
      </div>
    </div>
  );
}
