"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from "recharts";
import type { MealLogRow } from "@/lib/supabase/types";
import type { NutritionalTarget, NutrientKey } from "@/lib/types";
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from "@/lib/types";
import { calculateMealTotals } from "@/lib/nutrition";
import { Card } from "@/components/ui/Card";

interface Props {
  logs: MealLogRow[];
  targets: NutritionalTarget[];
}

const CHART_NUTRIENTS: NutrientKey[] = ["iron", "protein", "calcium", "vitaminB12", "vitaminC", "zinc"];
const COLORS = ["#7c966c", "#a6c776", "#62835a", "#aacc92", "#8a8c50", "#cacba3"];

export function NutrientTrends({ logs, targets }: Props) {
  const data = useMemo(() => {
    // Group logs by date, sum all meals
    const byDate: Record<string, MealLogRow[]> = {};
    logs.forEach((log) => {
      if (!byDate[log.date]) byDate[log.date] = [];
      byDate[log.date].push(log);
    });

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30) // Last 30 days
      .map(([date, dayLogs]) => {
        const allItems = dayLogs.flatMap((l) => l.items);
        const totals = calculateMealTotals(allItems);
        const point: Record<string, number | string> = {
          date: new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
        };
        CHART_NUTRIENTS.forEach((n) => { point[n] = totals[n]; });
        return point;
      });
  }, [logs]);

  const criticalTargets = targets.filter((t) => t.priority === "critical" && CHART_NUTRIENTS.includes(t.nutrient));

  if (data.length < 2) {
    return (
      <Card>
        <h3 className="font-semibold text-brand-forest mb-2">Nutrient Trends</h3>
        <p className="text-sm text-stone-400">At least 2 days of meal data needed to show trends.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-brand-forest">Nutrient Trends (last 30 days)</h3>
      {criticalTargets.map((target, i) => {
        const nutrient = target.nutrient as NutrientKey;
        return (
          <Card key={nutrient}>
            <p className="text-sm font-medium text-brand-black mb-3">
              {NUTRIENT_LABELS[nutrient]} ({NUTRIENT_UNITS[nutrient]}/day)
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}${NUTRIENT_UNITS[nutrient]}`, NUTRIENT_LABELS[nutrient]]} />
                <ReferenceLine
                  y={target.dailyTarget}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  label={{ value: `Goal: ${target.dailyTarget}${NUTRIENT_UNITS[nutrient]}`, position: "right", fontSize: 10, fill: "#ef4444" }}
                />
                <Line
                  type="monotone"
                  dataKey={nutrient}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        );
      })}
    </div>
  );
}
