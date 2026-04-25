"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Food, MealType } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { useProfileStore } from "@/store/profileStore";
import { useMealStore } from "@/store/mealStore";
import { MealScaffold } from "@/components/meal/MealScaffold";
import { MealItemRow } from "@/components/meal/MealItemRow";
import { MealSummaryPanel } from "@/components/meal/MealSummaryPanel";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ mealType: string }>;
}

export default function MealBuilderClient({ params }: PageProps) {
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

  function handleAdd(food: Food) {
    addItemToMeal(mealType, { food, portionGrams: 100 });
  }

  function handleRemove(foodId: string) {
    removeItemFromMeal(mealType, foodId);
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
        {/* Build Your Plate scaffold */}
        <MealScaffold
          restrictions={profile.restrictions}
          currentItems={items}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />

        {/* Portion adjusters for selected foods */}
        {items.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
              Adjust portions
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

        {/* Collapsible nutritional summary */}
        <MealSummaryPanel items={items} targets={profile.targets} />

        <div className="pb-6">
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Save &amp; Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
