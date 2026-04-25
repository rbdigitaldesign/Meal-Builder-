"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMugHot, faBowlFood, faUtensils, faAppleWhole, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import type { MealType } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { RECIPES, resolveRecipeItems } from "@/data/recipes";

const MEAL_ICONS = {
  breakfast: { icon: faMugHot,     color: "text-amber-500"     },
  lunch:     { icon: faBowlFood,   color: "text-brand-olive"   },
  dinner:    { icon: faUtensils,   color: "text-brand-forest"  },
  snack:     { icon: faAppleWhole, color: "text-rose-400"      },
} as const;

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

interface Props {
  activeRecipes: Partial<Record<MealType, string>>;
}

export function TodayRecipeCard({ activeRecipes }: Props) {
  const [expanded, setExpanded] = useState<Set<MealType>>(new Set(["breakfast"]));

  const entries = MEAL_ORDER
    .map((mealType) => {
      const recipeId = activeRecipes[mealType];
      if (!recipeId) return null;
      const recipe = RECIPES.find((r) => r.id === recipeId);
      if (!recipe) return null;
      return { mealType, recipe, items: resolveRecipeItems(recipe) };
    })
    .filter(Boolean) as { mealType: MealType; recipe: (typeof RECIPES)[0]; items: ReturnType<typeof resolveRecipeItems> }[];

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
      {/* Header */}
      <div className="px-4 py-3 border-b border-brand-warm flex items-center justify-between">
        <div>
          <p className="font-semibold text-brand-forest">Today&apos;s Recipe Instructions</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {entries.length} meal{entries.length !== 1 ? "s" : ""} with a recipe applied
          </p>
        </div>
        <Link
          href={`/meal/${entries[0].mealType}`}
          className="text-xs text-brand-olive hover:underline"
        >
          Edit meals →
        </Link>
      </div>

      {/* One section per meal with a recipe */}
      <div className="divide-y divide-stone-100">
        {entries.map(({ mealType, recipe, items }) => {
          const isOpen = expanded.has(mealType);
          const { icon, color } = MEAL_ICONS[mealType];

          return (
            <div key={mealType}>
              {/* Meal header — tap to expand/collapse */}
              <button
                onClick={() => toggle(mealType)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors text-left"
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
                  className="text-stone-300 w-3 h-3 flex-shrink-0"
                />
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Ingredients */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
                      Ingredients
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {items.map((item) => (
                        <div key={item.food.id} className="flex items-baseline gap-1.5 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-sage flex-shrink-0 mt-1.5" />
                          <span className="text-stone-700">{item.food.name}</span>
                          <span className="text-stone-400 text-xs tabular-nums ml-auto">{item.portionGrams}g</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
                        How to make it
                      </p>
                      <ol className="space-y-2.5">
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
                    <p className="text-xs text-brand-forest bg-brand-sage/20 rounded-xl px-3 py-2 leading-relaxed">
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
