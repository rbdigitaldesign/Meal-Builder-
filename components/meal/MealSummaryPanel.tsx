"use client";

import type { MealItem, NutritionalTarget } from "@/lib/types";
import { calculateMealTotals, buildNutrientSummaries, getAbsorptionNote } from "@/lib/nutrition";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

interface Props {
  items: MealItem[];
  targets: NutritionalTarget[];
}

export function MealSummaryPanel({ items, targets }: Props) {
  const totals = calculateMealTotals(items);
  const summaries = buildNutrientSummaries(totals, targets);
  const absorptionNote = getAbsorptionNote(items);

  const criticals = summaries.filter((s) =>
    targets.find((t) => t.nutrient === s.nutrient)?.priority === "critical"
  );
  const recommended = summaries.filter((s) =>
    targets.find((t) => t.nutrient === s.nutrient)?.priority === "recommended"
  );

  if (items.length === 0) {
    return (
      <Card>
        <p className="text-sm text-stone-400 text-center py-4">
          Add foods to see nutritional progress.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-brand-forest text-sm uppercase tracking-wide">This meal</h3>

      {absorptionNote && (
        <div className="bg-brand-sage/20 border border-brand-sage rounded-xl px-3 py-2">
          <p className="text-xs text-brand-forest">{absorptionNote}</p>
        </div>
      )}

      {criticals.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Priority targets</p>
          {criticals.map((s) => (
            <div key={s.nutrient}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-brand-black">{s.label}</span>
                <span className="text-stone-500 tabular-nums">{s.consumed}{s.unit} / {s.target}{s.unit}</span>
              </div>
              <ProgressBar percentage={s.percentage} status={s.status} />
            </div>
          ))}
        </div>
      )}

      {recommended.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Other targets</p>
          {recommended.map((s) => (
            <div key={s.nutrient}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-600">{s.label}</span>
                <span className="text-stone-400 tabular-nums">{s.consumed}{s.unit} / {s.target}{s.unit}</span>
              </div>
              <ProgressBar percentage={s.percentage} status={s.status} height="sm" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
