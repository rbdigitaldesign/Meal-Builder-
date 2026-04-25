export type NutrientKey =
  | "calories"
  | "protein"
  | "carbs"
  | "fat"
  | "fiber"
  | "iron"
  | "calcium"
  | "zinc"
  | "vitaminC"
  | "vitaminB12";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealCategory = "protein" | "fat" | "fibre" | "carbs";

export const MEAL_CATEGORY_LABELS: Record<MealCategory, string> = {
  protein: "Protein",
  fat: "Healthy Fat",
  fibre: "Fibre + Veggies",
  carbs: "Complex Carbs",
};

export const MEAL_CATEGORY_HINTS: Record<MealCategory, string> = {
  protein: "Choose 1",
  fat: "Choose 1",
  fibre: "Choose 1",
  carbs: "Choose 1 — optional",
};

export type DietaryRestriction =
  | "vegetarian"
  | "vegan"
  | "glutenFree"
  | "dairyFree"
  | "nutFree";

export interface FoodNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  zinc: number;
  vitaminC: number;
  vitaminB12: number;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  mealCategory: MealCategory;
  nutrients: FoodNutrients;
  tags: DietaryRestriction[];
  highlightedNutrients: NutrientKey[];
  servingSuggestion?: string;
}

export interface MealItem {
  food: Food;
  portionGrams: number;
}

export interface Meal {
  id: string;
  type: MealType;
  items: MealItem[];
}

export interface NutritionalTarget {
  nutrient: NutrientKey;
  dailyTarget: number;
  unit: string;
  priority: "critical" | "recommended";
}

export interface PatientProfile {
  name: string;
  pin?: string;
  restrictions: DietaryRestriction[];
  targets: NutritionalTarget[];
  setupComplete: boolean;
}

export interface DailyLog {
  date: string;
  meals: Record<MealType, Meal | null>;
}

export interface NutrientSummary {
  nutrient: NutrientKey;
  label: string;
  unit: string;
  consumed: number;
  target: number;
  percentage: number;
  status: "deficient" | "approaching" | "met" | "exceeded";
}

export const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  calories: "Calories",
  protein: "Protein",
  carbs: "Carbohydrates",
  fat: "Fat",
  fiber: "Fiber",
  iron: "Iron",
  calcium: "Calcium",
  zinc: "Zinc",
  vitaminC: "Vitamin C",
  vitaminB12: "Vitamin B12",
};

export const NUTRIENT_UNITS: Record<NutrientKey, string> = {
  calories: "kcal",
  protein: "g",
  carbs: "g",
  fat: "g",
  fiber: "g",
  iron: "mg",
  calcium: "mg",
  zinc: "mg",
  vitaminC: "mg",
  vitaminB12: "mcg",
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
