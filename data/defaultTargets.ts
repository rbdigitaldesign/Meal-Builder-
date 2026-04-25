import type { DietaryRestriction, NutritionalTarget } from "@/lib/types";

const BASE_TARGETS: NutritionalTarget[] = [
  { nutrient: "calories",   dailyTarget: 2000, unit: "kcal", priority: "recommended" },
  { nutrient: "protein",    dailyTarget: 50,   unit: "g",    priority: "recommended" },
  { nutrient: "carbs",      dailyTarget: 275,  unit: "g",    priority: "recommended" },
  { nutrient: "fat",        dailyTarget: 78,   unit: "g",    priority: "recommended" },
  { nutrient: "fiber",      dailyTarget: 28,   unit: "g",    priority: "recommended" },
  { nutrient: "iron",       dailyTarget: 8,    unit: "mg",   priority: "recommended" },
  { nutrient: "calcium",    dailyTarget: 1000, unit: "mg",   priority: "recommended" },
  { nutrient: "zinc",       dailyTarget: 8,    unit: "mg",   priority: "recommended" },
  { nutrient: "vitaminC",   dailyTarget: 90,   unit: "mg",   priority: "recommended" },
  { nutrient: "vitaminB12", dailyTarget: 2.4,  unit: "mcg",  priority: "recommended" },
];

export function getDefaultTargets(
  restrictions: DietaryRestriction[]
): NutritionalTarget[] {
  const targets: NutritionalTarget[] = BASE_TARGETS.map((t) => ({ ...t }));

  const isVeg = restrictions.includes("vegetarian") || restrictions.includes("vegan");
  const isVegan = restrictions.includes("vegan");

  if (isVeg) {
    // Higher iron target — plant iron (non-haem) is less bioavailable
    setTarget(targets, "iron", 18, "critical");
    // Flag B12 as critical for plant-based diets
    setTarget(targets, "vitaminB12", 2.4, "critical");
    // Higher zinc target — also less bioavailable from plant sources
    setTarget(targets, "zinc", 11, "recommended");
    // Vitamin C flagged recommended to aid iron absorption
    setTarget(targets, "vitaminC", 90, "recommended");
  }

  if (isVegan) {
    // Even higher iron for vegans (no eggs)
    setTarget(targets, "iron", 32, "critical");
    setTarget(targets, "calcium", 1200, "critical");
  }

  return targets;
}

function setTarget(
  targets: NutritionalTarget[],
  nutrient: NutritionalTarget["nutrient"],
  value: number,
  priority: NutritionalTarget["priority"]
) {
  const t = targets.find((t) => t.nutrient === nutrient);
  if (t) {
    t.dailyTarget = value;
    t.priority = priority;
  }
}
