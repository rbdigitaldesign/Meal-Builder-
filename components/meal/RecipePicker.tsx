"use client";

import { useState } from "react";
import Image from "next/image";
import type { MealType, DietaryRestriction, MealItem, NutritionalTarget, DailyLog, Recipe } from "@/lib/types";
import { NUTRIENT_LABELS } from "@/lib/types";
import { RECIPES, resolveRecipeItems } from "@/data/recipes";
import { calculateMealTotals, calculateDailyTotals } from "@/lib/nutrition";
import { NutrientBadge } from "@/components/ui/Badge";
import { useEnergyUnit } from "@/lib/useEnergyUnit";

const OVERAGE_THRESHOLD = 150;

interface OverageItem {
  label: string;
  unit: string;
  projected: number;
  percentage: number;
  target: number;
}

function getRecipeOverages(
  recipe: Recipe,
  mealType: MealType,
  dailyLog: DailyLog,
  targets: NutritionalTarget[]
): OverageItem[] {
  if (targets.length === 0) return [];

  const otherLog: DailyLog = {
    ...dailyLog,
    meals: { ...dailyLog.meals, [mealType]: null },
  };
  const otherTotals = calculateDailyTotals(otherLog);
  const recipeTotals = calculateMealTotals(resolveRecipeItems(recipe));

  return targets.flatMap((t) => {
    const key = t.nutrient as keyof typeof otherTotals;
    const projected = (otherTotals[key] ?? 0) + (recipeTotals[key] ?? 0);
    const pct = t.dailyTarget > 0 ? Math.round((projected / t.dailyTarget) * 100) : 0;
    if (pct > OVERAGE_THRESHOLD) {
      return [{
        label: NUTRIENT_LABELS[t.nutrient],
        unit: t.unit,
        projected: Math.round(projected * 10) / 10,
        percentage: pct,
        target: t.dailyTarget,
      }];
    }
    return [];
  });
}

interface Props {
  mealType: MealType;
  restrictions: DietaryRestriction[];
  currentItems: MealItem[];
  dailyLog: DailyLog;
  targets: NutritionalTarget[];
  onApply: (items: MealItem[], recipeId: string) => void;
}

export function RecipePicker({ mealType, restrictions, currentItems, dailyLog, targets, onApply }: Props) {
  const { display: displayEnergy } = useEnergyUnit();
  const [expandedInstructions, setExpandedInstructions] = useState<Set<string>>(new Set());

  function toggleInstructions(recipeId: string) {
    setExpandedInstructions((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) { next.delete(recipeId); } else { next.add(recipeId); }
      return next;
    });
  }

  const filtered = RECIPES.filter(
    (r) =>
      r.mealTypes.includes(mealType) &&
      restrictions.every((restriction) => r.tags.includes(restriction))
  );

  function handleApply(recipeId: string) {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;

    const overages = getRecipeOverages(recipe, mealType, dailyLog, targets);

    if (
      currentItems.length > 0 &&
      !confirm(`Replace current meal with "${recipe.name}"?`)
    ) return;

    if (overages.length > 0) {
      const lines = overages
        .map((o) => `• ${o.label}: ${o.projected}${o.unit} (${o.percentage}% of your ${o.target}${o.unit} daily goal)`)
        .join("\n");
      if (!confirm(
        `⚠️ Heads up — this recipe would take some nutrients over 150% of your daily targets:\n\n${lines}\n\nYou can reduce portion sizes in Build mode after applying.\n\nProceed anyway?`
      )) return;
    }

    onApply(resolveRecipeItems(recipe), recipe.id);
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
          const overages = getRecipeOverages(recipe, mealType, dailyLog, targets);

          return (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border border-brand-warm overflow-hidden"
            >
              {/* Hero image */}
              {recipe.imageUrl && (
                <div className="relative w-full h-48">
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}

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
                      {overages.length > 0 && (
                        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          ⚠ High {overages.map((o) => o.label).join(", ")}
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

                {overages.length > 0 && (
                  <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2">
                    <span className="flex-shrink-0 font-bold">⚠</span>
                    <span>
                      Would put your daily {overages.map((o) => `${o.label} at ${o.percentage}%`).join(" and ")} of target.
                      Consider adjusting portions after applying.
                    </span>
                  </div>
                )}

                {recipe.note && !overages.length && (
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
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {items.map((item) => (
                    <span key={item.food.id} className="text-sm text-stone-600">
                      {item.food.name} ({item.portionGrams}g)
                    </span>
                  ))}
                </div>
              </div>

              {/* Collapsible cooking instructions */}
              {recipe.instructions && recipe.instructions.length > 0 && (
                <div className="px-4 pb-3 border-t border-stone-100">
                  <button
                    onClick={() => toggleInstructions(recipe.id)}
                    className="flex items-center gap-2 text-sm text-brand-olive font-medium mt-1 hover:text-brand-forest transition-colors min-h-[44px] w-full"
                  >
                    <span className="text-base leading-none">{expandedInstructions.has(recipe.id) ? "▲" : "▼"}</span>
                    {expandedInstructions.has(recipe.id) ? "Hide instructions" : "How to make this"}
                  </button>
                  {expandedInstructions.has(recipe.id) && (
                    <ol className="mt-1 space-y-2.5 list-none">
                      {recipe.instructions.map((step, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-stone-600">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-sage/40 text-brand-forest font-semibold text-xs flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {/* Apply button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleApply(recipe.id)}
                  className={`w-full text-white text-sm font-medium py-3.5 rounded-xl transition-colors ${
                    overages.length > 0
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-brand-olive hover:bg-brand-forest"
                  }`}
                >
                  {overages.length > 0 ? "Use This Recipe (review portions) →" : "Use This Recipe →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
