// Nutrition data sourced from the Australian Food Composition Database (AFCD),
// published by Food Standards Australia New Zealand (FSANZ).
// All values are per 100g unless otherwise noted.

import type { Food, MealCategory } from "@/lib/types";
import { PROTEIN_FOODS } from "./proteins";
import { FAT_FOODS } from "./fats";
import { FIBRE_FOODS } from "./fibres";
import { CARB_FOODS } from "./carbs";

export const FOODS: Food[] = [
  ...PROTEIN_FOODS,
  ...FAT_FOODS,
  ...FIBRE_FOODS,
  ...CARB_FOODS,
];

export const FOODS_BY_CATEGORY: Record<MealCategory, Food[]> = {
  protein: PROTEIN_FOODS,
  fat:     FAT_FOODS,
  fibre:   FIBRE_FOODS,
  carbs:   CARB_FOODS,
};

export const FOODS_BY_ID: Record<string, Food> = Object.fromEntries(
  FOODS.map((f) => [f.id, f])
);

export const DATA_SOURCES = [
  {
    label: "Australian Food Composition Database (FSANZ)",
    url: "https://www.foodstandards.gov.au/science-and-research/monographs-and-technical-reports/australian-food-composition-database",
  },
];
