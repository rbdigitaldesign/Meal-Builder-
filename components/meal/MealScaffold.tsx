"use client";

import { useState } from "react";
import type { Food, MealCategory, DietaryRestriction, MealItem } from "@/lib/types";
import { MEAL_CATEGORY_LABELS, MEAL_CATEGORY_HINTS } from "@/lib/types";
import { FOODS_BY_CATEGORY, DATA_SOURCES } from "@/data/foods";
import { scaleNutrients } from "@/lib/nutrition";
import { NutrientBadge } from "@/components/ui/Badge";
import { useEnergyUnit } from "@/lib/useEnergyUnit";

// Row 1: Protein | Healthy Fat   Row 2: Complex Carbs | Fibre + Veggies
const CATEGORY_ORDER: MealCategory[] = ["protein", "fat", "carbs", "fibre"];

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function startEdit(food: Food, portionGrams: number) {
    const val = food.servingUnit
      ? String(Math.round(portionGrams / food.servingUnit.gramsPerUnit))
      : String(portionGrams);
    setEditValue(val);
    setEditingId(food.id);
  }

  function commitEdit(food: Food) {
    const num = parseInt(editValue, 10);
    if (!isNaN(num) && num > 0) {
      if (food.servingUnit) {
        const { gramsPerUnit, minUnits = 1, maxUnits = 10 } = food.servingUnit;
        const clamped = Math.min(maxUnits, Math.max(minUnits, num));
        onPortionChange(food.id, clamped * gramsPerUnit);
      } else {
        const clamped = Math.min(PORTION_MAX, Math.max(PORTION_MIN, num));
        onPortionChange(food.id, clamped);
      }
    }
    setEditingId(null);
  }

  function getFiltered(cat: MealCategory): Food[] {
    return FOODS_BY_CATEGORY[cat].filter((f) =>
      restrictions.every((r) => f.tags.includes(r))
    );
  }

  function handleToggle(food: Food) {
    const isSelected = currentItems.some((i) => i.food.id === food.id);
    if (isSelected) {
      onRemove(food.id);
    } else {
      onAdd(food);
    }
  }

  function changePortion(food: Food, current: number, delta: number) {
    if (food.servingUnit) {
      const { gramsPerUnit, minUnits = 1, maxUnits = 10 } = food.servingUnit;
      const currentCount = Math.round(current / gramsPerUnit);
      const nextCount = Math.min(maxUnits, Math.max(minUnits, currentCount + delta));
      onPortionChange(food.id, nextCount * gramsPerUnit);
    } else {
      const next = Math.min(PORTION_MAX, Math.max(PORTION_MIN, current + delta));
      onPortionChange(food.id, next);
    }
  }

  function getPortionDisplay(food: Food, portionGrams: number): string {
    if (food.servingUnit) {
      const count = Math.round(portionGrams / food.servingUnit.gramsPerUnit);
      return `${count} ${count === 1 ? food.servingUnit.singular : food.servingUnit.plural}`;
    }
    return `${portionGrams}g`;
  }

  function isAtMin(food: Food, portionGrams: number): boolean {
    if (food.servingUnit) {
      const count = Math.round(portionGrams / food.servingUnit.gramsPerUnit);
      return count <= (food.servingUnit.minUnits ?? 1);
    }
    return portionGrams <= PORTION_MIN;
  }

  function isAtMax(food: Food, portionGrams: number): boolean {
    if (food.servingUnit) {
      const count = Math.round(portionGrams / food.servingUnit.gramsPerUnit);
      return count >= (food.servingUnit.maxUnits ?? 10);
    }
    return portionGrams >= PORTION_MAX;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-brand-forest">Build Your Plate</h2>
        <p className="text-sm text-stone-500 mt-0.5">Add foods from each group — mix and match freely.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
      {CATEGORY_ORDER.map((cat) => {
        const foods = getFiltered(cat);

        return (
          <div key={cat} className={`rounded-2xl border overflow-hidden ${CATEGORY_COLORS[cat]}`}>
            {/* Section header */}
            <div className={`${CATEGORY_HEADER[cat]} px-4 py-2 flex items-center justify-between`}>
              <span className="font-semibold text-white text-sm">{MEAL_CATEGORY_LABELS[cat]}</span>
              <span className="text-white/70 text-xs">{MEAL_CATEGORY_HINTS[cat]}</span>
            </div>

            {/* Food options — single column within half-width panels */}
            <div className="p-2 flex flex-col gap-1.5">
              {foods.map((food) => {
                const thisItem = currentItems.find((i) => i.food.id === food.id);
                const isSelected = !!thisItem;
                const portion = thisItem?.portionGrams ?? (
                  food.servingUnit
                    ? (food.servingUnit.minUnits ?? 1) * food.servingUnit.gramsPerUnit * 2
                    : 100
                );
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
                        {food.servingSuggestion && !food.servingUnit && (
                          <p className="text-xs text-stone-400 mt-0.5">{food.servingSuggestion}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {food.highlightedNutrients.slice(0, 2).map((n) => (
                            <NutrientBadge key={n} nutrient={n} />
                          ))}
                        </div>
                      </div>
                    </button>

                    {/* Portion control — shown only when selected */}
                    {isSelected && scaled && (
                      <div className="px-3 pb-3 pt-0 border-t border-brand-warm/50 mt-1">
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => changePortion(food, portion, -1)}
                              disabled={isAtMin(food, portion)}
                              aria-label="Decrease portion"
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-brand-warm bg-white text-brand-forest font-bold hover:border-brand-olive disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
                            >
                              −
                            </button>
                            {editingId === food.id ? (
                              <input
                                type="number"
                                inputMode="numeric"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => commitEdit(food)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") e.currentTarget.blur();
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                onFocus={(e) => e.target.select()}
                                autoFocus
                                className="text-sm font-semibold text-brand-forest tabular-nums w-16 text-center bg-brand-sage/20 border border-brand-olive rounded-lg px-1 py-0.5 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            ) : (
                              <button
                                onClick={() => startEdit(food, portion)}
                                title="Click to edit amount"
                                className="text-sm font-semibold text-brand-forest tabular-nums min-w-[4rem] text-center rounded-lg px-2 py-0.5 hover:bg-brand-sage/20 transition-colors cursor-text"
                              >
                                {getPortionDisplay(food, portion)}
                              </button>
                            )}
                            <button
                              onClick={() => changePortion(food, portion, +1)}
                              disabled={isAtMax(food, portion)}
                              aria-label="Increase portion"
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-brand-warm bg-white text-brand-forest font-bold hover:border-brand-olive disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={toggleUnit}
                            className="text-xs text-stone-500 tabular-nums underline decoration-dotted underline-offset-2 hover:text-brand-olive transition-colors cursor-pointer"
                            title={`Tap to switch to ${unit === "kcal" ? "kJ" : "kcal"}`}
                          >
                            {displayEnergy(scaled.calories)} ⇄ · {scaled.protein}g protein
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
                No options match your restrictions.
              </p>
            )}
          </div>
        );
      })}
      </div>

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
