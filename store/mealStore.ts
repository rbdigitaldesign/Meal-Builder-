"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DailyLog, MealItem, MealType } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptyLog(date?: string): DailyLog {
  return {
    date: date ?? todayStr(),
    meals: { breakfast: null, lunch: null, dinner: null, snack: null },
  };
}

const MAX_HISTORY_DAYS = 30;

interface MealStore {
  dailyLog: DailyLog;
  logHistory: Record<string, DailyLog>;
  addItemToMeal: (mealType: MealType, item: MealItem) => void;
  removeItemFromMeal: (mealType: MealType, foodId: string) => void;
  updateItemPortion: (mealType: MealType, foodId: string, grams: number) => void;
  clearMeal: (mealType: MealType) => void;
  resetDay: () => void;
  ensureTodayLog: () => void;
  getLogForDate: (date: string) => DailyLog | null;
}

export const useMealStore = create<MealStore>()(
  persist(
    (set, get) => ({
      dailyLog: emptyLog(),
      logHistory: {},

      ensureTodayLog: () => {
        const { dailyLog, logHistory } = get();
        if (dailyLog.date !== todayStr()) {
          // Save current day to history if it has any data
          const hasData = Object.values(dailyLog.meals).some((m) => m && m.items.length > 0);
          if (hasData) {
            const updatedHistory = { ...logHistory, [dailyLog.date]: dailyLog };
            // Prune entries older than MAX_HISTORY_DAYS
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - MAX_HISTORY_DAYS);
            const cutoffStr = cutoff.toISOString().slice(0, 10);
            for (const key of Object.keys(updatedHistory)) {
              if (key < cutoffStr) delete updatedHistory[key];
            }
            set({ dailyLog: emptyLog(), logHistory: updatedHistory });
          } else {
            set({ dailyLog: emptyLog() });
          }
        }
      },

      getLogForDate: (date: string) => {
        const { dailyLog, logHistory } = get();
        if (date === todayStr()) return dailyLog;
        return logHistory[date] ?? null;
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
                [mealType]: { id: mealType, type: mealType, items: newItems },
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
                [mealType]: { ...meal, items: meal.items.filter((i) => i.food.id !== foodId) },
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
