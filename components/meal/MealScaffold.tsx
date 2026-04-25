"use client";

import { useState } from "react";
import type { Food, MealCategory, DietaryRestriction, MealItem } from "@/lib/types";
import { MEAL_CATEGORY_LABELS } from "@/lib/types";
import { FOODS_BY_CATEGORY, DATA_SOURCES } from "@/data/foods";
import { scaleNutrients } from "@/lib/nutrition";
import { NutrientBadge } from "@/components/ui/Badge";
import { useEnergyUnit } from "@/lib/useEnergyUnit";

const CATEGORY_ORDER: MealCategory[] = ["protein", "fat", "carbs", "fibre"];
const PORTION_STEP = 10;
const PORTION_MIN = 10;
const PORTION_MAX = 500;

// Brand-aligned palette
const CATEGORY_STYLE: Record<MealCategory, { card: string; header: string }> = {
  protein: { card: "bg-brand-forest/5 border-brand-forest/20",  header: "bg-brand-forest" },
  fat:     { card: "bg-amber-50 border-amber-200",               header: "bg-amber-600" },
  fibre:   { card: "bg-emerald-50 border-emerald-200",           header: "bg-brand-olive" },
  carbs:   { card: "bg-orange-50 border-orange-200",             header: "bg-orange-500" },
};

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
        onPortionChange(food.id, Math.min(maxUnits, Math.max(minUnits, num)) * gramsPerUnit);
      } else {
        onPortionChange(food.id, Math.min(PORTION_MAX, Math.max(PORTION_MIN, num)));
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
    currentItems.some((i) => i.food.id === food.id) ? onRemove(food.id) : onAdd(food);
  }

  function changePortion(food: Food, current: number, delta: number) {
    if (food.servingUnit) {
      const { gramsPerUnit, minUnits = 1, maxUnits = 10 } = food.servingUnit;
      const next = Math.min(maxUnits, Math.max(minUnits, Math.round(current / gramsPerUnit) + delta));
      onPortionChange(food.id, next * gramsPerUnit);
    } else {
      onPortionChange(food.id, Math.min(PORTION_MAX, Math.max(PORTION_MIN, current + delta * PORTION_STEP)));
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
    return food.servingUnit
      ? Math.round(portionGrams / food.servingUnit.gramsPerUnit) <= (food.servingUnit.minUnits ?? 1)
      : portionGrams <= PORTION_MIN;
  }

  function isAtMax(food: Food, portionGrams: number): boolean {
    return food.servingUnit
      ? Math.round(portionGrams / food.servingUnit.gramsPerUnit) >= (food.servingUnit.maxUnits ?? 10)
      : portionGrams >= PORTION_MAX;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-brand-forest">Build Your Plate</h2>
        <p className="text-sm text-stone-500 mt-0.5">Add foods from each group — mix and match freely.</p>
      </div>

      {/* 1-column on mobile, 2-column on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORY_ORDER.map((cat) => {
          const foods = getFiltered(cat);
          const { card, header } = CATEGORY_STYLE[cat];

          return (
            <div key={cat} className={`rounded-2xl border overflow-hidden ${card}`}>
              {/* Section header */}
              <div className={`${header} px-4 py-2.5 flex items-center justify-between`}>
                <span className="font-semibold text-white text-sm">{MEAL_CATEGORY_LABELS[cat]}</span>
                <span className="text-white/60 text-xs">Add any</span>
              </div>

              <div className="p-2 flex flex-col gap-2">
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
                      isSelected ? "border-brand-olive bg-white shadow-sm" : "border-transparent bg-white/60"
                    }`}>
                      {/* Tap row */}
                      <button
                        onClick={() => handleToggle(food)}
                        className="flex items-center gap-3 px-3 py-3 text-left w-full hover:bg-white/80 rounded-xl transition-colors min-h-[56px]"
                      >
                        {/* Checkbox */}
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          isSelected ? "border-brand-olive bg-brand-olive" : "border-stone-300"
                        }`}>
                          {isSelected && <span className="text-white text-xs leading-none">✓</span>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-brand-black leading-snug">{food.name}</p>
                          {food.servingSuggestion && !food.servingUnit && (
                            <p className="text-xs text-stone-400 mt-0.5 leading-snug">{food.servingSuggestion}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {food.highlightedNutrients.slice(0, 3).map((n) => (
                              <NutrientBadge key={n} nutrient={n} />
                            ))}
                          </div>
                        </div>
                      </button>

                      {/* Portion controls — only when selected */}
                      {isSelected && scaled && (
                        <div className="px-3 pb-3 pt-2 border-t border-brand-warm/50">
                          <div className="flex items-center justify-between gap-2">
                            {/* − / value / + */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => changePortion(food, portion, -1)}
                                disabled={isAtMin(food, portion)}
                                aria-label="Decrease portion"
                                className="w-9 h-9 flex items-center justify-center rounded-full border border-brand-warm bg-white text-brand-forest font-bold text-lg hover:border-brand-olive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                                  className="text-sm font-semibold text-brand-forest tabular-nums w-16 text-center bg-brand-sage/20 border border-brand-olive rounded-lg px-1 py-1 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              ) : (
                                <button
                                  onClick={() => startEdit(food, portion)}
                                  title="Tap to edit amount"
                                  className="text-sm font-semibold text-brand-forest tabular-nums min-w-[3.5rem] text-center rounded-lg px-2 py-1.5 hover:bg-brand-sage/20 transition-colors cursor-text"
                                >
                                  {getPortionDisplay(food, portion)}
                                </button>
                              )}

                              <button
                                onClick={() => changePortion(food, portion, +1)}
                                disabled={isAtMax(food, portion)}
                                aria-label="Increase portion"
                                className="w-9 h-9 flex items-center justify-center rounded-full border border-brand-warm bg-white text-brand-forest font-bold text-lg hover:border-brand-olive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                +
                              </button>
                            </div>

                            {/* Nutrition summary — tap to toggle kcal/kJ */}
                            <button
                              onClick={toggleUnit}
                              title={`Switch to ${unit === "kcal" ? "kJ" : "kcal"}`}
                              className="text-right text-xs text-stone-500 tabular-nums hover:text-brand-olive transition-colors leading-relaxed"
                            >
                              <span className="underline decoration-dotted underline-offset-2">
                                {displayEnergy(scaled.calories)}
                              </span>
                              <br />
                              <span>{scaled.protein}g protein{scaled.iron > 0 ? ` · ${scaled.iron}mg iron` : ""}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {foods.length === 0 && (
                  <p className="px-3 py-3 text-xs text-stone-400 italic">
                    No options match your restrictions.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution */}
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
