"use client";

import { useState } from "react";
import type { MealItem, NutritionalTarget } from "@/lib/types";
import { calculateMealTotals, buildNutrientSummaries, getAbsorptionNote } from "@/lib/nutrition";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

interface Props {
  items: MealItem[];
  targets: NutritionalTarget[];
}

export function MealSummaryPanel({ items, targets }: Props) {
  const [open, setOpen] = useState(false);

  const totals = calculateMealTotals(items);
  const summaries = buildNutrientSummaries(totals, targets);
  const absorptionNote = getAbsorptionNote(items);

  const criticals = summaries.filter((s) =>
    targets.find((t) => t.nutrient === s.nutrient)?.priority === "critical"
  );
  const recommended = summaries.filter((s) =>
    targets.find((t) => t.nutrient === s.nutrient)?.priority === "recommended"
  );

  if (items.length === 0) return null;

  const metCount = summaries.filter((s) => s.status === "met" || s.status === "exceeded").length;
  const totalCount = summaries.length;

  return (
    <Card className="space-y-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={open}
      >
        <div>
          <span className="font-semibold text-brand-forest text-sm">Nutrition progress</span>
          {!open && totalCount > 0 && (
            <span className="ml-2 text-xs text-stone-400">
              {metCount}/{totalCount} targets met
            </span>
          )}
        </div>
        <span className="text-brand-olive text-xs font-medium">{open ? "Hide ↑" : "Show ↓"}</span>
      </button>

      {open && (
        <div className="space-y-4 pt-1">
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
        </div>
      )}
    </Card>
  );
}
