"use client";

import type { MealItem } from "@/lib/types";
import { scaleNutrients } from "@/lib/nutrition";
import { Slider } from "@/components/ui/Slider";

interface Props {
  item: MealItem;
  onPortionChange: (grams: number) => void;
  onRemove: () => void;
}

export function MealItemRow({ item, onPortionChange, onRemove }: Props) {
  const scaled = scaleNutrients(item.food, item.portionGrams);

  return (
    <div className="p-3 bg-white rounded-xl border border-brand-warm space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-black truncate">{item.food.name}</p>
          <p className="text-xs text-stone-500">{scaled.calories} kcal · {scaled.protein}g protein · {scaled.iron}mg iron</p>
        </div>
        <button
          onClick={onRemove}
          className="text-stone-400 hover:text-red-500 transition-colors text-lg leading-none flex-shrink-0"
          aria-label={`Remove ${item.food.name}`}
        >
          ×
        </button>
      </div>
      <Slider
        value={item.portionGrams}
        onChange={onPortionChange}
        label="Portion"
      />
    </div>
  );
}
