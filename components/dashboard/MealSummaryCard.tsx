"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMugHot, faBowlFood, faUtensils, faAppleWhole } from "@fortawesome/free-solid-svg-icons";
import type { Meal, NutritionalTarget } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { calculateMealTotals, buildNutrientSummaries } from "@/lib/nutrition";
import { useEnergyUnit } from "@/lib/useEnergyUnit";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

const MEAL_ICONS = {
  breakfast: { icon: faMugHot,    bg: "bg-amber-50",       color: "text-amber-500"      },
  lunch:     { icon: faBowlFood,  bg: "bg-green-50",       color: "text-brand-olive"    },
  dinner:    { icon: faUtensils,  bg: "bg-brand-forest/10", color: "text-brand-forest"  },
  snack:     { icon: faAppleWhole, bg: "bg-rose-50",       color: "text-rose-400"       },
} as const;

interface Props {
  meal: Meal | null;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  targets: NutritionalTarget[];
  readOnly?: boolean;
}

export function MealSummaryCard({ meal, mealType, targets, readOnly = false }: Props) {
  const items = meal?.items ?? [];
  const totals = calculateMealTotals(items);
  const summaries = buildNutrientSummaries(totals, targets);
  const { display: displayEnergy, toggle: toggleUnit } = useEnergyUnit();
  const criticals = summaries.filter((s) =>
    targets.find((t) => t.nutrient === s.nutrient)?.priority === "critical"
  );

  const { icon, bg, color } = MEAL_ICONS[mealType];

  const inner = (
      <Card className={!readOnly ? "hover:border-brand-sage transition-colors cursor-pointer" : "opacity-90"}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <FontAwesomeIcon icon={icon} className={`${color} w-4 h-4`} />
            </div>
            <div>
              <p className="font-semibold text-brand-black">{MEAL_TYPE_LABELS[mealType]}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {items.length === 0
                  ? readOnly
                    ? <span className="text-stone-400">Nothing logged</span>
                    : <span className="text-brand-olive/70">Tap to add foods →</span>
                  : <>
                      {items.length} food{items.length !== 1 ? "s" : ""} ·{" "}
                      <button
                        onClick={(e) => { e.preventDefault(); toggleUnit(); }}
                        className="tabular-nums underline decoration-dotted underline-offset-2 hover:text-brand-olive transition-colors"
                      >
                        {displayEnergy(totals.calories)} ⇄
                      </button>
                    </>
                }
              </p>
            </div>
          </div>
          {!readOnly && <span className="text-xs text-brand-olive font-medium shrink-0">Edit →</span>}
        </div>

        {items.length > 0 && criticals.length > 0 && (
          <div className="space-y-2.5 mt-4 pt-3 border-t border-stone-100">
            {criticals.map((s) => (
              <div key={s.nutrient}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-500">{s.label}</span>
                  <span className="text-stone-400 tabular-nums">{s.percentage}%</span>
                </div>
                <ProgressBar percentage={s.percentage} status={s.status} height="sm" />
              </div>
            ))}
          </div>
        )}
      </Card>
  );

  return readOnly ? inner : <Link href={`/meal/${mealType}`}>{inner}</Link>;
}
