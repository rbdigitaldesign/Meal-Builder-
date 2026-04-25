"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Food, MealItem, MealType } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { useProfileStore } from "@/store/profileStore";
import { useMealStore } from "@/store/mealStore";
import { MealScaffold } from "@/components/meal/MealScaffold";
import { DailyProgressStrip } from "@/components/meal/DailyProgressStrip";
import { RecipePicker } from "@/components/meal/RecipePicker";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ mealType: string }>;
}

function syncMeal(mealType: string, items: MealItem[]) {
  const clientId = typeof window !== "undefined"
    ? localStorage.getItem("meal-builder-client-id")
    : null;
  if (!clientId) return;

  const date = new Date().toISOString().slice(0, 10);
  fetch("/api/meal-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, date, mealType, items }),
  }).catch(() => {});
}

export default function MealBuilderClient({ params }: PageProps) {
  const { mealType: mealTypeRaw } = use(params);
  const mealType = mealTypeRaw as MealType;
  const router = useRouter();

  const { profile, _hasHydrated } = useProfileStore();
  const { dailyLog, addItemToMeal, removeItemFromMeal, updateItemPortion, clearMeal } = useMealStore();

  const [activeMode, setActiveMode] = useState<"recipes" | "build">("recipes");

  const meal = dailyLog.meals[mealType];
  const items = meal?.items ?? [];

  // Debounced sync to Supabase via API route
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => syncMeal(mealType, items), 1500);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [items, mealType]);

  // Wait for store to rehydrate from localStorage before deciding to redirect
  if (!_hasHydrated) return null;

  if (!profile?.setupComplete) {
    router.replace("/clinician");
    return null;
  }

  function handleAdd(food: Food) {
    addItemToMeal(mealType, { food, portionGrams: 100 });
  }

  function handleRemove(foodId: string) {
    removeItemFromMeal(mealType, foodId);
  }

  function handleApplyRecipe(recipeItems: MealItem[]) {
    clearMeal(mealType);
    for (const item of recipeItems) {
      addItemToMeal(mealType, item);
    }
    setActiveMode("build");
  }

  const label = MEAL_TYPE_LABELS[mealType] ?? mealType;

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-white border-b border-brand-warm px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
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

      {/* Live daily progress — always visible */}
      <div className="sticky top-[52px] z-10">
        <DailyProgressStrip targets={profile.targets} dailyLog={dailyLog} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Mode tabs */}
        <div className="flex rounded-xl bg-stone-100 p-1 gap-1">
          <button
            onClick={() => setActiveMode("recipes")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeMode === "recipes"
                ? "bg-white text-brand-forest shadow-sm"
                : "text-stone-500 hover:text-brand-forest"
            }`}
          >
            Recipes
          </button>
          <button
            onClick={() => setActiveMode("build")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeMode === "build"
                ? "bg-white text-brand-forest shadow-sm"
                : "text-stone-500 hover:text-brand-forest"
            }`}
          >
            Build Your Plate
          </button>
        </div>

        {/* Mode content */}
        {activeMode === "recipes" ? (
          <RecipePicker
            mealType={mealType}
            restrictions={profile.restrictions}
            currentItems={items}
            dailyLog={dailyLog}
            targets={profile.targets}
            onApply={handleApplyRecipe}
          />
        ) : (
          <MealScaffold
            restrictions={profile.restrictions}
            currentItems={items}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onPortionChange={(foodId, grams) => updateItemPortion(mealType, foodId, grams)}
          />
        )}

        <div className="pb-6">
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Save &amp; Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
