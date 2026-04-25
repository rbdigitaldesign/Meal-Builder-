"use client";

import React from "react";
import Link from "next/link";
import type { Meal, NutritionalTarget } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { calculateMealTotals, buildNutrientSummaries } from "@/lib/nutrition";
import { useEnergyUnit } from "@/lib/useEnergyUnit";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

const MEAL_ICONS: Record<string, React.ReactNode> = {
  breakfast: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
      <circle cx="10" cy="10" r="4"/>
      <line x1="10" y1="2" x2="10" y2="4"/>
      <line x1="10" y1="16" x2="10" y2="18"/>
      <line x1="2" y1="10" x2="4" y2="10"/>
      <line x1="16" y1="10" x2="18" y2="10"/>
      <line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/>
      <line x1="14.4" y1="14.4" x2="15.8" y2="15.8"/>
      <line x1="4.2" y1="15.8" x2="5.6" y2="14.4"/>
      <line x1="14.4" y1="5.6" x2="15.8" y2="4.2"/>
    </svg>
  ),
  lunch: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-olive">
      <path d="M10 17C10 17 3 13 3 7a7 7 0 0 1 14 0c0 6-7 10-7 10z"/>
      <line x1="10" y1="17" x2="10" y2="9"/>
    </svg>
  ),
  dinner: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-forest">
      <path d="M3 10h14M5 10a5 5 0 0 1 10 0"/>
      <line x1="10" y1="3" x2="10" y2="6"/>
    </svg>
  ),
  snack: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
      <circle cx="10" cy="10" r="7"/>
      <circle cx="10" cy="10" r="2" fill="currentColor"/>
    </svg>
  ),
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
      <Card className="hover:border-brand-sage transition-colors cursor-pointer p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center flex-shrink-0">
              {MEAL_ICONS[mealType]}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-black">{MEAL_TYPE_LABELS[mealType]}</p>
              <p className="text-xs text-stone-400">
                {items.length === 0
                  ? "No foods added yet"
                  : <>{items.length} food{items.length !== 1 ? "s" : ""} · <button onClick={(e) => { e.preventDefault(); toggleUnit(); }} className="text-xs text-stone-500 tabular-nums underline decoration-dotted underline-offset-2 hover:text-brand-olive transition-colors cursor-pointer">{displayEnergy(totals.calories)} ⇄</button></>}
              </p>
            </div>
          </div>
          <span className="text-xs text-brand-olive font-medium">Edit →</span>
        </div>

        {items.length > 0 && criticals.length > 0 && (
          <div className="space-y-2 mt-3">
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
