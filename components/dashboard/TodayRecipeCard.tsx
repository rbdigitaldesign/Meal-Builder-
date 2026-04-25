"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMugHot, faBowlFood, faUtensils, faAppleWhole, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import type { MealType, MealItem, DailyLog } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { RECIPES, resolveRecipeItems } from "@/data/recipes";
import type { Recipe } from "@/lib/types";

const MEAL_ICONS = {
  breakfast: { icon: faMugHot,     color: "text-amber-500"    },
  lunch:     { icon: faBowlFood,   color: "text-brand-olive"  },
  dinner:    { icon: faUtensils,   color: "text-brand-forest" },
  snack:     { icon: faAppleWhole, color: "text-rose-400"     },
} as const;

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

// Match a recipe to a set of meal items by food ID overlap.
// A recipe matches if every one of its ingredient food IDs is present in the meal.
function detectRecipe(items: MealItem[]): Recipe | null {
  if (items.length === 0) return null;
  const mealIds = new Set(items.map((i) => i.food.id));
  return (
    RECIPES.find(
      (r) =>
        r.ingredients.length > 0 &&
        r.ingredients.every((ing) => mealIds.has(ing.foodId))
    ) ?? null
  );
}

interface Props {
  activeRecipes: Partial<Record<MealType, string>>;
  dailyLog: DailyLog;
}

export function TodayRecipeCard({ activeRecipes, dailyLog }: Props) {
  const [expanded, setExpanded] = useState<Set<MealType>>(new Set(["breakfast"]));

  const entries = MEAL_ORDER
    .map((mealType) => {
      const items: MealItem[] = dailyLog.meals[mealType]?.items ?? [];
      if (items.length === 0) return null;

      // Prefer explicitly tracked recipe, fall back to detection from items
      const trackedId = activeRecipes[mealType];
      const recipe =
        (trackedId ? RECIPES.find((r) => r.id === trackedId) : null) ??
        detectRecipe(items);

      if (!recipe) return null;

      // Use actual meal items (user may have adjusted portions) but fall back to recipe defaults
      const displayItems = items.length > 0 ? items : resolveRecipeItems(recipe);

      return { mealType, recipe, items: displayItems };
    })
    .filter(Boolean) as {
      mealType: MealType;
      recipe: Recipe;
      items: MealItem[];
    }[];

  if (entries.length === 0) return null;

  function toggle(mealType: MealType) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(mealType) ? next.delete(mealType) : next.add(mealType);
      return next;
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-warm overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-brand-warm flex items-center justify-between">
        <div>
          <p className="font-semibold text-brand-forest">Today&apos;s Recipe Instructions</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {entries.length} meal{entries.length !== 1 ? "s" : ""} with a recipe applied
          </p>
        </div>
        <Link href={`/meal/${entries[0].mealType}`} className="text-xs text-brand-olive hover:underline">
          Edit meals →
        </Link>
      </div>

      {/* One collapsible section per meal */}
      <div className="divide-y divide-stone-100">
        {entries.map(({ mealType, recipe, items }) => {
          const isOpen = expanded.has(mealType);
          const { icon, color } = MEAL_ICONS[mealType];

          return (
            <div key={mealType}>
              <button
                onClick={() => toggle(mealType)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-stone-50 transition-colors text-left min-h-[60px]"
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={icon} className={`${color} w-4 h-4 flex-shrink-0`} />
                  <div>
                    <p className="text-xs font-medium text-stone-400 uppercase tracking-wide leading-none mb-0.5">
                      {MEAL_TYPE_LABELS[mealType]}
                    </p>
                    <p className="font-semibold text-brand-black leading-snug">{recipe.name}</p>
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={isOpen ? faChevronUp : faChevronDown}
                  className="text-stone-300 w-3 h-3 flex-shrink-0 ml-2"
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 space-y-4">
                  {/* Ingredients — use actual portions from the meal */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
                      Ingredients
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {items.map((item) => (
                        <div key={item.food.id} className="flex items-baseline gap-1.5 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-sage flex-shrink-0 mt-1.5" />
                          <span className="text-stone-700 leading-snug">{item.food.name}</span>
                          <span className="text-stone-400 text-xs tabular-nums ml-auto whitespace-nowrap">
                            {item.portionGrams}g
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2.5">
                        How to make it
                      </p>
                      <ol className="space-y-3">
                        {recipe.instructions.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm text-stone-600">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-forest text-white text-xs font-semibold flex items-center justify-center mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {recipe.note && (
                    <p className="text-sm text-brand-forest bg-brand-sage/20 rounded-xl px-3 py-2.5 leading-relaxed">
                      💡 {recipe.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
