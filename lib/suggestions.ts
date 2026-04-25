import type { Food, MealItem, NutrientKey, DietaryRestriction } from "@/lib/types";
import { FOODS } from "@/data/foods";

export function getSuggestionsForNutrient(
  nutrient: NutrientKey,
  restrictions: DietaryRestriction[],
  currentMealItems: MealItem[],
  topN = 3
): Food[] {
  const currentIds = new Set(currentMealItems.map((i) => i.food.id));

  return FOODS
    .filter((food) => {
      if (currentIds.has(food.id)) return false;
      return restrictions.every((r) => food.tags.includes(r));
    })
    .sort((a, b) => b.nutrients[nutrient] - a.nutrients[nutrient])
    .slice(0, topN);
}

export function getDeficientNutrients(
  percentages: Record<NutrientKey, number>,
  threshold = 40
): NutrientKey[] {
  return (Object.entries(percentages) as [NutrientKey, number][])
    .filter(([, pct]) => pct < threshold)
    .map(([key]) => key);
}
