"use client";

import type { Food, MealCategory, DietaryRestriction, MealItem } from "@/lib/types";
import { MEAL_CATEGORY_LABELS, MEAL_CATEGORY_HINTS } from "@/lib/types";
import { FOODS_BY_CATEGORY, DATA_SOURCES } from "@/data/foods";
import { scaleNutrients } from "@/lib/nutrition";
import { NutrientBadge } from "@/components/ui/Badge";
import { useEnergyUnit } from "@/lib/useEnergyUnit";

const CATEGORY_ORDER: MealCategory[] = ["protein", "fat", "fibre", "carbs"];

const CATEGORY_COLORS: Record<MealCategory, string> = {
  protein: "bg-blue-50 border-blue-200",
  fat:     "bg-amber-50 border-amber-200",
  fibre:   "bg-green-50 border-green-200",
  carbs:   "bg-orange-50 border-orange-200",
};

const CATEGORY_HEADER: Record<MealCategory, string> = {
  protein: "bg-blue-600",
  fat:     "bg-amber-500",
  fibre:   "bg-brand-olive",
  carbs:   "bg-orange-500",
};

const PORTION_STEP = 10;
const PORTION_MIN = 10;
const PORTION_MAX = 500;

interface Props {
  restrictions: DietaryRestriction[];
  currentItems: MealItem[];
  onAdd: (food: Food) => void;
  onRemove: (foodId: string) => void;
  onPortionChange: (foodId: string, grams: number) => void;
}

export function MealScaffold({ restrictions, currentItems, onAdd, onRemove, onPortionChange }: Props) {
  const { display: displayEnergy, toggle: toggleUnit, unit } = useEnergyUnit();

  function getFiltered(cat: MealCategory): Food[] {
    return FOODS_BY_CATEGORY[cat].filter((f) =>
      restrictions.every((r) => f.tags.includes(r))
    );
  }

  function getSelectedItem(cat: MealCategory): MealItem | undefined {
    return currentItems.find((i) => i.food.mealCategory === cat);
  }

  function handleToggle(food: Food) {
    const existing = getSelectedItem(food.mealCategory);
    if (existing?.food.id === food.id) {
      onRemove(food.id);
    } else {
      if (existing) onRemove(existing.food.id);
      onAdd(food);
    }
  }

  function changePortion(foodId: string, current: number, delta: number) {
    const next = Math.min(PORTION_MAX, Math.max(PORTION_MIN, current + delta));
    onPortionChange(foodId, next);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-brand-forest">Build Your Plate</h2>
        <p className="text-sm text-stone-500 mt-0.5">Choose one from each section to build a balanced meal.</p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const foods = getFiltered(cat);
        const selectedItem = getSelectedItem(cat);

        return (
          <div key={cat} className={`rounded-2xl border overflow-hidden ${CATEGORY_COLORS[cat]}`}>
            {/* Section header */}
            <div className={`${CATEGORY_HEADER[cat]} px-4 py-2 flex items-center justify-between`}>
              <span className="font-semibold text-white text-sm">{MEAL_CATEGORY_LABELS[cat]}</span>
              <span className="text-white/70 text-xs">{MEAL_CATEGORY_HINTS[cat]}</span>
            </div>

            {/* Food options */}
            <div className="p-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {foods.map((food) => {
                const isSelected = selectedItem?.food.id === food.id;
                const portion = selectedItem?.portionGrams ?? 100;
                const scaled = isSelected ? scaleNutrients(food, portion) : null;

                return (
                  <div key={food.id} className={`rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-brand-olive bg-white shadow-sm"
                      : "border-transparent bg-white/60"
                  }`}>
                    <button
                      onClick={() => handleToggle(food)}
                      className="flex items-start gap-3 p-3 text-left w-full hover:bg-white/80 rounded-xl transition-colors"
                    >
                      {/* Checkbox circle */}
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                        isSelected ? "border-brand-olive bg-brand-olive" : "border-stone-300"
                      }`}>
                        {isSelected && <span className="text-white text-xs leading-none">✓</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-black leading-snug">{food.name}</p>
                        {food.servingSuggestion && (
                          <p className="text-xs text-stone-400 mt-0.5">{food.servingSuggestion}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {food.highlightedNutrients.slice(0, 2).map((n) => (
                            <NutrientBadge key={n} nutrient={n} />
                          ))}
                        </div>
                      </div>
                    </button>

                    {/* Inline portion control — shown only when selected */}
                    {isSelected && scaled && (
                      <div className="px-3 pb-3 pt-0 border-t border-brand-warm/50 mt-1">
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => changePortion(food.id, portion, -PORTION_STEP)}
                              disabled={portion <= PORTION_MIN}
                              aria-label="Decrease portion"
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-brand-warm bg-white text-brand-forest font-bold hover:border-brand-olive disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
                            >
                              −
                            </button>
                            <span className="text-sm font-semibold text-brand-forest tabular-nums w-12 text-center">
                              {portion}g
                            </span>
                            <button
                              onClick={() => changePortion(food.id, portion, +PORTION_STEP)}
                              disabled={portion >= PORTION_MAX}
                              aria-label="Increase portion"
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-brand-warm bg-white text-brand-forest font-bold hover:border-brand-olive disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={toggleUnit}
                            className="text-xs text-stone-400 tabular-nums hover:text-brand-olive transition-colors"
                            title={`Tap to switch to ${unit === "kcal" ? "kJ" : "kcal"}`}
                          >
                            {displayEnergy(scaled.calories)} · {scaled.protein}g protein
                            {scaled.iron > 0 ? ` · ${scaled.iron}mg iron` : ""}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {foods.length === 0 && (
              <p className="px-4 pb-3 text-xs text-stone-400">
                No options match the current dietary restrictions.
              </p>
            )}
          </div>
        );
      })}

      {/* Data attribution */}
      <p className="text-xs text-stone-400 text-center pt-1">
        Nutrition data:{" "}
        {DATA_SOURCES.map((s, i) => (
          <span key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-olive">
              {s.label}
            </a>
            {i < DATA_SOURCES.length - 1 && " · "}
          </span>
        ))}
      </p>
    </div>
  );
}
