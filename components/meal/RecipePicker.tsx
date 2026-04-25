"use client";

import type { MealType, DietaryRestriction, MealItem } from "@/lib/types";
import { RECIPES, resolveRecipeItems } from "@/data/recipes";
import { calculateMealTotals } from "@/lib/nutrition";
import { NutrientBadge } from "@/components/ui/Badge";
import { useEnergyUnit } from "@/lib/useEnergyUnit";

interface Props {
  mealType: MealType;
  restrictions: DietaryRestriction[];
  currentItems: MealItem[];
  onApply: (items: MealItem[]) => void;
}

export function RecipePicker({ mealType, restrictions, currentItems, onApply }: Props) {
  const { display: displayEnergy } = useEnergyUnit();

  const filtered = RECIPES.filter(
    (r) =>
      r.mealTypes.includes(mealType) &&
      restrictions.every((restriction) => r.tags.includes(restriction))
  );

  function handleApply(recipeId: string) {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;

    if (
      currentItems.length > 0 &&
      !confirm(`Replace current meal with "${recipe.name}"?`)
    ) {
      return;
    }

    onApply(resolveRecipeItems(recipe));
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-stone-500 text-sm">No recipes match your dietary profile for this meal.</p>
        <p className="text-stone-400 text-xs mt-1">Switch to "Build" to add foods manually.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-brand-forest">Choose a Recipe</h2>
        <p className="text-sm text-stone-500 mt-0.5">
          Tap any recipe to load all its ingredients at once.
        </p>
      </div>

      <div className="space-y-3">
        {filtered.map((recipe) => {
          const items = resolveRecipeItems(recipe);
          const totals = calculateMealTotals(items);

          return (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border border-brand-warm overflow-hidden"
            >
              {/* Card header */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-brand-black">{recipe.name}</p>
                      {recipe.prepTime && (
                        <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                          {recipe.prepTime}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{recipe.description}</p>
                  </div>
                </div>

                {/* Nutrient badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {recipe.highlightedNutrients.slice(0, 3).map((n) => (
                    <NutrientBadge key={n} nutrient={n} />
                  ))}
                </div>

                {/* Macro summary */}
                <div className="flex gap-3 mt-2 text-xs text-stone-400 tabular-nums">
                  <span>{displayEnergy(totals.calories)}</span>
                  <span>{totals.protein}g protein</span>
                  <span>{totals.carbs}g carbs</span>
                  <span>{totals.fat}g fat</span>
                </div>

                {recipe.note && (
                  <p className="text-xs text-brand-forest mt-2 bg-brand-sage/20 rounded-lg px-2 py-1.5">
                    {recipe.note}
                  </p>
                )}
              </div>

              {/* Ingredient list */}
              <div className="px-4 pb-3 border-t border-stone-100">
                <p className="text-xs text-stone-400 font-medium uppercase tracking-wide mt-2 mb-1.5">
                  Ingredients
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {items.map((item) => (
                    <span key={item.food.id} className="text-xs text-stone-600">
                      {item.food.name} ({item.portionGrams}g)
                    </span>
                  ))}
                </div>
              </div>

              {/* Apply button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleApply(recipe.id)}
                  className="w-full bg-brand-olive hover:bg-brand-forest text-white text-sm font-medium py-2 rounded-xl transition-colors"
                >
                  Use This Recipe →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
