"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Food, MealType } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { useProfileStore } from "@/store/profileStore";
import { useMealStore } from "@/store/mealStore";
import { FoodSearch } from "@/components/meal/FoodSearch";
import { MealItemRow } from "@/components/meal/MealItemRow";
import { MealSummaryPanel } from "@/components/meal/MealSummaryPanel";
import { NutrientSuggestions } from "@/components/meal/NutrientSuggestions";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ mealType: string }>;
}

export default function MealBuilderPage({ params }: PageProps) {
  const { mealType: mealTypeRaw } = use(params);
  const mealType = mealTypeRaw as MealType;
  const router = useRouter();

  const { profile } = useProfileStore();
  const { dailyLog, addItemToMeal, removeItemFromMeal, updateItemPortion, clearMeal } = useMealStore();

  if (!profile?.setupComplete) {
    router.replace("/clinician");
    return null;
  }

  const meal = dailyLog.meals[mealType];
  const items = meal?.items ?? [];
  const selectedIds = new Set(items.map((i) => i.food.id));

  function handleAdd(food: Food) {
    addItemToMeal(mealType, { food, portionGrams: 100 });
  }

  const label = MEAL_TYPE_LABELS[mealType] ?? mealType;

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-white border-b border-brand-warm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/dashboard" className="text-brand-olive text-sm font-medium hover:underline">
          ← Dashboard
        </Link>
        <h1 className="flex-1 text-center font-semibold text-brand-forest">{label}</h1>
        {items.length > 0 && (
          <button
            onClick={() => clearMeal(mealType)}
            className="text-xs text-stone-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Current meal items */}
        {items.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
              In this meal
            </h2>
            <div className="space-y-2">
              {items.map((item) => (
                <MealItemRow
                  key={item.food.id}
                  item={item}
                  onPortionChange={(g) => updateItemPortion(mealType, item.food.id, g)}
                  onRemove={() => removeItemFromMeal(mealType, item.food.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Nutritional summary */}
        <MealSummaryPanel items={items} targets={profile.targets} />

        {/* Suggestions */}
        <NutrientSuggestions
          items={items}
          targets={profile.targets}
          restrictions={profile.restrictions}
          onAdd={handleAdd}
        />

        {/* Food search */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Add foods
          </h2>
          <FoodSearch
            restrictions={profile.restrictions}
            onSelect={handleAdd}
            selectedIds={selectedIds}
          />
        </section>

        <div className="pb-6">
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Save &amp; Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
