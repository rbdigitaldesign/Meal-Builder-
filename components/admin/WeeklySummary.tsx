"use client";

import type { MealLogRow } from "@/lib/supabase/types";
import type { NutritionalTarget, NutrientKey } from "@/lib/types";
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from "@/lib/types";
import { computeWeeklySummary } from "@/lib/analytics";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

interface Props {
  logs: MealLogRow[];
  targets: NutritionalTarget[];
}

export function WeeklySummary({ logs, targets }: Props) {
  const summary = computeWeeklySummary(logs, targets);
  const criticals = targets.filter((t) => t.priority === "critical");
  const recommended = targets.filter((t) => t.priority === "recommended");

  if (logs.length === 0) {
    return (
      <Card>
        <p className="text-sm text-stone-400">
          No meal data yet — summary will appear once the client starts logging.
        </p>
      </Card>
    );
  }

  const loggingPct = Math.round((summary.daysLogged / 7) * 100);
  const loggingStatus =
    summary.daysLogged >= 5 ? "met" : summary.daysLogged >= 3 ? "approaching" : "deficient";

  const trendNutrients = targets.filter(
    (t) => summary.weekOnWeek[t.nutrient] !== 0
  ) as NutritionalTarget[];

  return (
    <div className="space-y-4">
      {/* Days logged */}
      <Card>
        <h3 className="font-semibold text-brand-forest mb-3">This Week at a Glance</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-brand-forest">{summary.daysLogged}</span>
          <span className="text-sm text-stone-500">/ 7 days with meals logged</span>
        </div>
        <ProgressBar percentage={loggingPct} status={loggingStatus} />
      </Card>

      {/* Critical target compliance */}
      {criticals.length > 0 && (
        <Card>
          <h3 className="font-semibold text-brand-forest mb-3">Priority Target Compliance</h3>
          <div className="space-y-4">
            {criticals.map((t) => {
              const pct = summary.compliance[t.nutrient] ?? 0;
              const avg = summary.avgIntake[t.nutrient as NutrientKey] ?? 0;
              const metDays = summary.daysLogged > 0 ? Math.round((pct / 100) * summary.daysLogged) : 0;
              const status = pct >= 90 ? "met" : pct >= 50 ? "approaching" : "deficient";
              return (
                <div key={t.nutrient}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-brand-black">{NUTRIENT_LABELS[t.nutrient]}</span>
                    <span className="text-stone-500 tabular-nums text-xs">
                      {metDays}/{summary.daysLogged} days met &middot; avg {avg}{NUTRIENT_UNITS[t.nutrient]} / {t.dailyTarget}{NUTRIENT_UNITS[t.nutrient]}
                    </span>
                  </div>
                  <ProgressBar percentage={pct} status={status} />
                  <p className="text-xs text-stone-400 mt-0.5">{pct}% of logged days target was reached</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Week-on-week */}
      {trendNutrients.length > 0 && (
        <Card>
          <h3 className="font-semibold text-brand-forest mb-3">This Week vs Last Week</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {trendNutrients.map((t) => {
              const change = summary.weekOnWeek[t.nutrient] ?? 0;
              const up = change > 0;
              return (
                <div key={t.nutrient} className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-400">{NUTRIENT_LABELS[t.nutrient]}</p>
                  <p className={`text-lg font-bold mt-0.5 ${up ? "text-brand-olive" : "text-red-500"}`}>
                    {up ? "↑" : "↓"} {Math.abs(change)}%
                  </p>
                </div>
              );
            })}
          </div>
          {trendNutrients.length === 0 && (
            <p className="text-sm text-stone-400">Not enough data for two weeks yet.</p>
          )}
        </Card>
      )}

      {/* Recommended targets averages */}
      {recommended.length > 0 && (
        <Card>
          <h3 className="font-semibold text-brand-forest mb-3">Other Targets — 7-Day Averages</h3>
          <div className="space-y-2">
            {recommended.map((t) => {
              const avg = summary.avgIntake[t.nutrient as NutrientKey] ?? 0;
              const pct = summary.compliance[t.nutrient] ?? 0;
              return (
                <div key={t.nutrient} className="flex justify-between text-sm">
                  <span className="text-stone-600">{NUTRIENT_LABELS[t.nutrient]}</span>
                  <span className="tabular-nums text-stone-500 text-xs">
                    avg {avg}{NUTRIENT_UNITS[t.nutrient]} &middot; {pct}% days met
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
