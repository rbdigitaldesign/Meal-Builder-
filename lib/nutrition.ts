import type {
  Food,
  MealItem,
  DailyLog,
  FoodNutrients,
  NutritionalTarget,
  NutrientSummary,
  NutrientKey,
} from "@/lib/types";
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from "@/lib/types";

export function scaleNutrients(food: Food, portionGrams: number): FoodNutrients {
  const scale = portionGrams / 100;
  return {
    calories:   round(food.nutrients.calories   * scale),
    protein:    round(food.nutrients.protein    * scale),
    carbs:      round(food.nutrients.carbs      * scale),
    fat:        round(food.nutrients.fat        * scale),
    fiber:      round(food.nutrients.fiber      * scale),
    iron:       round(food.nutrients.iron       * scale),
    calcium:    round(food.nutrients.calcium    * scale),
    zinc:       round(food.nutrients.zinc       * scale),
    vitaminC:   round(food.nutrients.vitaminC   * scale),
    vitaminB12: round(food.nutrients.vitaminB12 * scale),
  };
}

export function calculateMealTotals(items: MealItem[]): FoodNutrients {
  return items.reduce(
    (totals, item) => {
      const scaled = scaleNutrients(item.food, item.portionGrams);
      return {
        calories:   round(totals.calories   + scaled.calories),
        protein:    round(totals.protein    + scaled.protein),
        carbs:      round(totals.carbs      + scaled.carbs),
        fat:        round(totals.fat        + scaled.fat),
        fiber:      round(totals.fiber      + scaled.fiber),
        iron:       round(totals.iron       + scaled.iron),
        calcium:    round(totals.calcium    + scaled.calcium),
        zinc:       round(totals.zinc       + scaled.zinc),
        vitaminC:   round(totals.vitaminC   + scaled.vitaminC),
        vitaminB12: round(totals.vitaminB12 + scaled.vitaminB12),
      };
    },
    emptyNutrients()
  );
}

export function calculateDailyTotals(log: DailyLog): FoodNutrients {
  const allItems = (["breakfast", "lunch", "dinner", "snack"] as const)
    .flatMap((type) => log.meals[type]?.items ?? []);
  return calculateMealTotals(allItems);
}

export function buildNutrientSummaries(
  totals: FoodNutrients,
  targets: NutritionalTarget[]
): NutrientSummary[] {
  return targets.map((target) => {
    const consumed = totals[target.nutrient];
    const percentage = target.dailyTarget > 0
      ? Math.round((consumed / target.dailyTarget) * 100)
      : 0;
    return {
      nutrient:   target.nutrient,
      label:      NUTRIENT_LABELS[target.nutrient],
      unit:       NUTRIENT_UNITS[target.nutrient],
      consumed,
      target:     target.dailyTarget,
      percentage,
      status:     getNutrientStatus(consumed, target.dailyTarget),
    };
  });
}

export function getNutrientStatus(
  consumed: number,
  target: number
): NutrientSummary["status"] {
  const pct = target > 0 ? (consumed / target) * 100 : 0;
  if (pct >= 110) return "exceeded";
  if (pct >= 90)  return "met";
  if (pct >= 50)  return "approaching";
  return "deficient";
}

// Returns an absorption tip if the meal contains iron + vitamin C rich foods
export function getAbsorptionNote(items: MealItem[]): string | null {
  const hasIronFood = items.some(
    (i) => i.food.highlightedNutrients.includes("iron")
  );
  const hasVitCFood = items.some(
    (i) => i.food.highlightedNutrients.includes("vitaminC")
  );
  if (hasIronFood && hasVitCFood) {
    return "Great combination — the vitamin C in this meal helps your body absorb iron more effectively.";
  }
  return null;
}

export function formatNutrient(value: number, nutrient: NutrientKey): string {
  const unit = NUTRIENT_UNITS[nutrient];
  if (unit === "kcal") return `${Math.round(value)} kcal`;
  if (value < 1) return `${(value).toFixed(1)}${unit}`;
  return `${round(value)}${unit}`;
}

function emptyNutrients(): FoodNutrients {
  return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, calcium: 0, zinc: 0, vitaminC: 0, vitaminB12: 0 };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
