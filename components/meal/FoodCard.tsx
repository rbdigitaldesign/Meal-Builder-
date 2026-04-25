"use client";

import type { Food } from "@/lib/types";
import { NutrientBadge, TextBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  food: Food;
  onAdd: () => void;
  isAdded: boolean;
}

export function FoodCard({ food, onAdd, isAdded }: Props) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-brand-warm hover:border-brand-sage transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brand-black truncate">{food.name}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          <TextBadge label={food.category} color="bg-stone-100 text-stone-500" />
          {food.highlightedNutrients.slice(0, 3).map((n) => (
            <NutrientBadge key={n} nutrient={n} />
          ))}
        </div>
        {food.servingSuggestion && (
          <p className="text-xs text-stone-400 mt-1">{food.servingSuggestion}</p>
        )}
      </div>
      <Button
        variant={isAdded ? "secondary" : "primary"}
        size="sm"
        onClick={onAdd}
        disabled={isAdded}
        className="flex-shrink-0"
      >
        {isAdded ? "Added" : "+ Add"}
      </Button>
    </div>
  );
}
