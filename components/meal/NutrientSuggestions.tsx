"use client";

import type { MealItem, NutritionalTarget, DietaryRestriction, NutrientKey } from "@/lib/types";
import { NUTRIENT_LABELS } from "@/lib/types";
import { calculateMealTotals, getNutrientStatus } from "@/lib/nutrition";
import { getSuggestionsForNutrient } from "@/lib/suggestions";
import { NutrientBadge } from "@/components/ui/Badge";

interface Props {
  items: MealItem[];
  targets: NutritionalTarget[];
  restrictions: DietaryRestriction[];
  onAdd: (food: import("@/lib/types").Food) => void;
}

export function NutrientSuggestions({ items, targets, restrictions, onAdd }: Props) {
  const totals = calculateMealTotals(items);

  const deficientCritical = targets
    .filter((t) => t.priority === "critical")
    .filter((t) => {
      const status = getNutrientStatus(totals[t.nutrient], t.dailyTarget / 3);
      return status === "deficient" || status === "approaching";
    })
    .slice(0, 1);

  if (deficientCritical.length === 0) return null;

  const target = deficientCritical[0];
  const suggestions = getSuggestionsForNutrient(target.nutrient as NutrientKey, restrictions, items, 3);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <p className="text-sm font-medium text-amber-800">
        Boost your {NUTRIENT_LABELS[target.nutrient]} — try adding:
      </p>
      <div className="space-y-2">
        {suggestions.map((food) => (
          <div key={food.id} className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm text-brand-black">{food.name}</p>
              <div className="flex gap-1 mt-0.5">
                {food.highlightedNutrients.slice(0, 2).map((n) => (
                  <NutrientBadge key={n} nutrient={n} />
                ))}
              </div>
            </div>
            <button
              onClick={() => onAdd(food)}
              className="text-xs text-brand-olive font-medium hover:underline flex-shrink-0"
            >
              + Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
