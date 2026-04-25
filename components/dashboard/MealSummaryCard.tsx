"use client";

import Link from "next/link";
import type { Meal, NutritionalTarget } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { calculateMealTotals, buildNutrientSummaries } from "@/lib/nutrition";
import { useEnergyUnit } from "@/lib/useEnergyUnit";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

const MEAL_ICONS: Record<string, string> = {
  breakfast: "☀️",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
};

interface Props {
  meal: Meal | null;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  targets: NutritionalTarget[];
}

export function MealSummaryCard({ meal, mealType, targets }: Props) {
  const items = meal?.items ?? [];
  const totals = calculateMealTotals(items);
  const summaries = buildNutrientSummaries(totals, targets);
  const { display: displayEnergy, toggle: toggleUnit } = useEnergyUnit();
  const criticals = summaries.filter((s) =>
    targets.find((t) => t.nutrient === s.nutrient)?.priority === "critical"
  );

  return (
    <Link href={`/meal/${mealType}`}>
      <Card className="hover:border-brand-sage transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{MEAL_ICONS[mealType]}</span>
            <div>
              <p className="font-semibold text-brand-black">{MEAL_TYPE_LABELS[mealType]}</p>
              <p className="text-xs text-stone-400">
                {items.length === 0
                  ? "No foods added yet"
                  : <>{items.length} food{items.length !== 1 ? "s" : ""} · <button onClick={(e) => { e.preventDefault(); toggleUnit(); }} className="hover:text-brand-olive transition-colors">{displayEnergy(totals.calories)}</button></>}
              </p>
            </div>
          </div>
          <span className="text-xs text-brand-olive font-medium">Edit →</span>
        </div>

        {items.length > 0 && criticals.length > 0 && (
          <div className="space-y-2">
            {criticals.map((s) => (
              <div key={s.nutrient}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-stone-500">{s.label}</span>
                  <span className="text-stone-400 tabular-nums">{s.percentage}%</span>
                </div>
                <ProgressBar percentage={s.percentage} status={s.status} height="sm" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}
