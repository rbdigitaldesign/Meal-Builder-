import type { NutritionalTarget, NutrientKey, DietaryRestriction } from "@/lib/types";

interface PresetAdjustment {
  nutrient: NutrientKey;
  dailyTarget: number;
  priority: "critical" | "recommended";
}

export const FOCUS_PRESETS: { id: string; label: string; adjustments: PresetAdjustment[] }[] = [
  {
    id: "iron-deficiency",
    label: "Iron Deficiency",
    adjustments: [
      { nutrient: "iron",     dailyTarget: 18, priority: "critical" },
      { nutrient: "vitaminC", dailyTarget: 90, priority: "critical" },
    ],
  },
  {
    id: "b12-deficiency",
    label: "B12 Deficiency",
    adjustments: [
      { nutrient: "vitaminB12", dailyTarget: 2.4, priority: "critical" },
    ],
  },
  {
    id: "zinc-deficiency",
    label: "Zinc Deficiency",
    adjustments: [
      { nutrient: "zinc", dailyTarget: 11, priority: "critical" },
    ],
  },
  {
    id: "calcium-deficiency",
    label: "Calcium Deficiency",
    adjustments: [
      { nutrient: "calcium", dailyTarget: 1200, priority: "critical" },
    ],
  },
  {
    id: "vegetarian",
    label: "Vegetarian",
    adjustments: [
      { nutrient: "iron",       dailyTarget: 18,  priority: "critical" },
      { nutrient: "vitaminB12", dailyTarget: 2.4, priority: "critical" },
      { nutrient: "zinc",       dailyTarget: 11,  priority: "recommended" },
    ],
  },
  {
    id: "vegan",
    label: "Vegan",
    adjustments: [
      { nutrient: "iron",       dailyTarget: 32,   priority: "critical" },
      { nutrient: "vitaminB12", dailyTarget: 2.4,  priority: "critical" },
      { nutrient: "calcium",    dailyTarget: 1200, priority: "critical" },
      { nutrient: "zinc",       dailyTarget: 11,   priority: "recommended" },
    ],
  },
];

export function getPresetsForProfile(
  conditionTags: string[],
  restrictions: DietaryRestriction[]
): string[] {
  const ids = new Set<string>();

  for (const tag of conditionTags) {
    if (tag === "Iron Deficiency Anaemia" || tag === "Anaemia") ids.add("iron-deficiency");
    if (tag === "Vegan / B12 Deficiency") ids.add("b12-deficiency");
    if (tag === "Osteoporosis") ids.add("calcium-deficiency");
  }

  if (restrictions.includes("vegan")) {
    ids.add("vegan");
  } else if (restrictions.includes("vegetarian")) {
    ids.add("vegetarian");
  }

  return [...ids];
}

export function applyPresetsToTargets(
  targets: NutritionalTarget[],
  presetIds: string[]
): NutritionalTarget[] {
  let result = targets;
  for (const id of presetIds) {
    const preset = FOCUS_PRESETS.find((p) => p.id === id);
    if (!preset) continue;
    result = result.map((t) => {
      const adj = preset.adjustments.find((a) => a.nutrient === t.nutrient);
      return adj ? { ...t, dailyTarget: adj.dailyTarget, priority: adj.priority } : t;
    });
  }
  return result;
}
