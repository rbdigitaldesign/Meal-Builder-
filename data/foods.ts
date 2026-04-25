// Nutrition data sourced from vital.ly (https://www.vital.ly) and USDA FoodData Central.
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

export const DATA_SOURCES = [
  { label: "vital.ly", url: "https://www.vital.ly" },
  { label: "USDA FoodData Central", url: "https://fdc.nal.usda.gov" },
];
