"use client";

import type { NutrientSummary, NutritionalTarget } from "@/lib/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

interface Props {
  summaries: NutrientSummary[];
  targets: NutritionalTarget[];
  className?: string;
}

export function DailyNutrientChart({ summaries, targets, className }: Props) {
  const criticals = summaries.filter(
    (s) => targets.find((t) => t.nutrient === s.nutrient)?.priority === "critical"
  );
  const recommended = summaries.filter(
    (s) => targets.find((t) => t.nutrient === s.nutrient)?.priority === "recommended"
  );

  return (
    <Card className={className}>
      <h3 className="font-semibold text-brand-forest mb-4">Today&apos;s Progress</h3>

      {criticals.length > 0 && (
        <div className="space-y-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Priority targets</p>
          {criticals.map((s) => (
            <div key={s.nutrient}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-brand-black">{s.label}</span>
                <span className="text-stone-500 tabular-nums">
                  {s.consumed}{s.unit} / {s.target}{s.unit}
                  <span className={`ml-2 text-xs ${
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
              <ProgressBar percentage={s.percentage} status={s.status} />
            </div>
          ))}
        </div>
      )}

      {recommended.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Other targets</p>
          {recommended.map((s) => (
            <div key={s.nutrient}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-600">{s.label}</span>
                <span className="text-stone-400 tabular-nums">
                  {s.consumed}{s.unit} / {s.target}{s.unit}
                </span>
              </div>
              <ProgressBar percentage={s.percentage} status={s.status} height="sm" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
