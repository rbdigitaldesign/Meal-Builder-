"use client";

import { useState } from "react";
import type { NutritionalTarget, DailyLog } from "@/lib/types";
import { calculateDailyTotals, buildNutrientSummaries } from "@/lib/nutrition";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useEnergyUnit } from "@/lib/useEnergyUnit";

interface Props {
  targets: NutritionalTarget[];
  dailyLog: DailyLog;
}

export function DailyProgressStrip({ targets, dailyLog }: Props) {
  const [showAll, setShowAll] = useState(false);
  const { unit, toggle: toggleUnit, display: displayEnergy } = useEnergyUnit();

  const totals = calculateDailyTotals(dailyLog);
  const summaries = buildNutrientSummaries(totals, targets);

  const criticals = summaries.filter(
    (s) => targets.find((t) => t.nutrient === s.nutrient)?.priority === "critical"
  );
  const recommended = summaries.filter(
    (s) => targets.find((t) => t.nutrient === s.nutrient)?.priority === "recommended"
  );

  const allCriticalsMet =
    criticals.length > 0 &&
    criticals.every((s) => s.status === "met" || s.status === "exceeded");

  const displayed = showAll ? [...criticals, ...recommended] : criticals;

  if (targets.length === 0) return null;

  return (
    <div className="bg-white border-b border-brand-warm px-4 py-3">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Today's Progress
            </p>
            {/* Energy unit toggle pill */}
            <button
              onClick={toggleUnit}
              className="flex items-center rounded-full border border-brand-warm bg-stone-50 text-xs font-medium overflow-hidden"
              title="Switch energy units"
            >
              <span className={`px-2.5 py-1 transition-colors ${unit === "kcal" ? "bg-brand-olive text-white" : "text-stone-400"}`}>kcal</span>
              <span className={`px-2.5 py-1 transition-colors ${unit === "kJ"   ? "bg-brand-olive text-white" : "text-stone-400"}`}>kJ</span>
            </button>
          </div>
          {recommended.length > 0 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-sm text-brand-olive hover:underline flex-shrink-0 py-1.5 px-2 -my-1 -mr-1 rounded-lg hover:bg-brand-sage/20 transition-colors min-h-[44px] flex items-center"
            >
              {showAll ? "Show less ↑" : "Show all ↓"}
            </button>
          )}
        </div>

        {allCriticalsMet && !showAll ? (
          <div className="flex items-center gap-2 py-1">
            <span className="text-xs font-medium text-brand-olive">
              All priority targets met
            </span>
            <span className="text-brand-olive text-sm">✓</span>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((s) => {
              const isCritical = targets.find((t) => t.nutrient === s.nutrient)?.priority === "critical";
              return (
                <div key={s.nutrient}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`text-xs ${isCritical ? "font-medium text-brand-black" : "text-stone-500"}`}>
                      {s.label}
                    </span>
                    <span className="text-xs text-stone-400 tabular-nums">
                      {s.nutrient === "calories" ? `${displayEnergy(s.consumed)} / ${displayEnergy(s.target)}` : `${s.consumed}${s.unit} / ${s.target}${s.unit}`}
                      <span className={`ml-1.5 font-medium ${
                        s.status === "met" || s.status === "exceeded"
                          ? "text-brand-olive"
                          : s.status === "approaching"
                          ? "text-amber-500"
                          : "text-stone-400"
                      }`}>
                        {s.percentage}%
                      </span>
                    </span>
                  </div>
                  <ProgressBar percentage={s.percentage} status={s.status} height="sm" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
