import type { MealLogRow } from "@/lib/supabase/types";
import type { NutritionalTarget, NutrientKey, FoodNutrients } from "@/lib/types";
import { calculateMealTotals } from "@/lib/nutrition";

export type EngagementStatus = "active" | "quiet" | "inactive" | "never";

export interface WeeklySummary {
  daysLogged: number;
  avgIntake: FoodNutrients;
  compliance: Record<NutrientKey, number>;  // % of days target was met (0–100)
  weekOnWeek: Record<NutrientKey, number>;  // % change vs prior 7 logged days
}

export interface TopFood {
  name: string;
  count: number;
}

const ZERO: FoodNutrients = {
  calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
  iron: 0, calcium: 0, zinc: 0, vitaminC: 0, vitaminB12: 0,
};

const NUTRIENT_KEYS: NutrientKey[] = [
  "calories", "protein", "carbs", "fat", "fiber",
  "iron", "calcium", "zinc", "vitaminC", "vitaminB12",
];

export function groupLogsByDate(logs: MealLogRow[]): Record<string, FoodNutrients> {
  const byDate: Record<string, MealLogRow[]> = {};
  for (const log of logs) {
    (byDate[log.date] ??= []).push(log);
  }
  const result: Record<string, FoodNutrients> = {};
  for (const [date, dayLogs] of Object.entries(byDate)) {
    result[date] = calculateMealTotals(dayLogs.flatMap((l) => l.items));
  }
  return result;
}

export function computeWeeklySummary(logs: MealLogRow[], targets: NutritionalTarget[]): WeeklySummary {
  const byDate = groupLogsByDate(logs);
  const allDates = Object.keys(byDate).sort();

  const thisWeek = allDates.slice(-7);
  const lastWeek = allDates.slice(-14, -7);
  const daysLogged = thisWeek.length;

  function weekAvg(dates: string[]): FoodNutrients {
    if (dates.length === 0) return { ...ZERO };
    const result = { ...ZERO };
    for (const key of NUTRIENT_KEYS) {
      const sum = dates.reduce((acc, d) => acc + (byDate[d][key] ?? 0), 0);
      result[key] = Math.round((sum / dates.length) * 10) / 10;
    }
    return result;
  }

  const avgIntake = weekAvg(thisWeek);
  const lastAvg = weekAvg(lastWeek);

  const compliance = {} as Record<NutrientKey, number>;
  const weekOnWeek = {} as Record<NutrientKey, number>;

  for (const key of NUTRIENT_KEYS) {
    const target = targets.find((t) => t.nutrient === key);
    compliance[key] =
      target && daysLogged > 0
        ? Math.round(
            (thisWeek.filter((d) => {
              const val = byDate[d][key] ?? 0;
              return target.dailyTarget > 0 && val / target.dailyTarget >= 0.9;
            }).length /
              daysLogged) *
              100
          )
        : 0;
    const prev = lastAvg[key];
    weekOnWeek[key] = prev > 0 ? Math.round(((avgIntake[key] - prev) / prev) * 100) : 0;
  }

  return { daysLogged, avgIntake, compliance, weekOnWeek };
}

export function getEngagementStatus(lastActive: string | null): EngagementStatus {
  if (!lastActive) return "never";
  const days = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86_400_000);
  if (days <= 7) return "active";
  if (days <= 30) return "quiet";
  return "inactive";
}

export function getTopFoods(logs: MealLogRow[], limit = 5): TopFood[] {
  const counts: Record<string, number> = {};
  for (const log of logs) {
    for (const item of log.items) {
      counts[item.food.name] = (counts[item.food.name] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}
