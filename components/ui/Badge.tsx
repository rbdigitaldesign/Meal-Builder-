import type { NutrientKey } from "@/lib/types";

const NUTRIENT_COLORS: Partial<Record<NutrientKey, string>> = {
  iron:       "bg-amber-100 text-amber-800",
  protein:    "bg-blue-100 text-blue-800",
  calcium:    "bg-purple-100 text-purple-800",
  vitaminC:   "bg-orange-100 text-orange-800",
  vitaminB12: "bg-pink-100 text-pink-800",
  zinc:       "bg-teal-100 text-teal-800",
  fiber:      "bg-green-100 text-green-800",
};

const NUTRIENT_SHORT: Partial<Record<NutrientKey, string>> = {
  iron:       "Iron",
  protein:    "Protein",
  calcium:    "Calcium",
  vitaminC:   "Vit C",
  vitaminB12: "B12",
  zinc:       "Zinc",
  fiber:      "Fiber",
  calories:   "Cal",
  carbs:      "Carbs",
  fat:        "Fat",
};

interface NutrientBadgeProps {
  nutrient: NutrientKey;
}

export function NutrientBadge({ nutrient }: NutrientBadgeProps) {
  const color = NUTRIENT_COLORS[nutrient] ?? "bg-stone-100 text-stone-700";
  const label = NUTRIENT_SHORT[nutrient] ?? nutrient;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

interface TextBadgeProps {
  label: string;
  color?: string;
}

export function TextBadge({ label, color = "bg-stone-100 text-stone-600" }: TextBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
