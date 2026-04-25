"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DailyLog, MealItem, MealType } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptyLog(): DailyLog {
  return {
    date: todayStr(),
    meals: { breakfast: null, lunch: null, dinner: null, snack: null },
  };
}

interface MealStore {
  dailyLog: DailyLog;
  addItemToMeal: (mealType: MealType, item: MealItem) => void;
  removeItemFromMeal: (mealType: MealType, foodId: string) => void;
  updateItemPortion: (mealType: MealType, foodId: string, grams: number) => void;
  clearMeal: (mealType: MealType) => void;
  resetDay: () => void;
  ensureTodayLog: () => void;
}

export const useMealStore = create<MealStore>()(
  persist(
    (set, get) => ({
      dailyLog: emptyLog(),

      ensureTodayLog: () => {
        const { dailyLog } = get();
        if (dailyLog.date !== todayStr()) {
          set({ dailyLog: emptyLog() });
        }
      },

      addItemToMeal: (mealType, item) =>
        set((state) => {
          const meal = state.dailyLog.meals[mealType];
          const items = meal?.items ?? [];
          const exists = items.find((i) => i.food.id === item.food.id);
          const newItems = exists ? items : [...items, item];
          return {
            dailyLog: {
              ...state.dailyLog,
              meals: {
                ...state.dailyLog.meals,
                [mealType]: {
                  id: mealType,
                  type: mealType,
                  items: newItems,
                },
              },
            },
          };
        }),

      removeItemFromMeal: (mealType, foodId) =>
        set((state) => {
          const meal = state.dailyLog.meals[mealType];
          if (!meal) return {};
          return {
            dailyLog: {
              ...state.dailyLog,
              meals: {
                ...state.dailyLog.meals,
                [mealType]: {
                  ...meal,
                  items: meal.items.filter((i) => i.food.id !== foodId),
                },
              },
            },
          };
        }),

      updateItemPortion: (mealType, foodId, grams) =>
        set((state) => {
          const meal = state.dailyLog.meals[mealType];
          if (!meal) return {};
          return {
            dailyLog: {
              ...state.dailyLog,
              meals: {
                ...state.dailyLog.meals,
                [mealType]: {
                  ...meal,
                  items: meal.items.map((i) =>
                    i.food.id === foodId ? { ...i, portionGrams: grams } : i
                  ),
                },
              },
            },
          };
        }),

      clearMeal: (mealType) =>
        set((state) => ({
          dailyLog: {
            ...state.dailyLog,
            meals: { ...state.dailyLog.meals, [mealType]: null },
          },
        })),

      resetDay: () => set({ dailyLog: emptyLog() }),
    }),
    { name: "meal-builder-daily-log" }
  )
);
