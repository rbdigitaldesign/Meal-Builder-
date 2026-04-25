"use client";

import { useCallback, useEffect, useState } from "react";

const KJ_PER_KCAL = 4.184;
const STORAGE_KEY = "meal-builder-energy-unit";

export function useEnergyUnit() {
  const [unit, setUnit] = useState<"kcal" | "kJ">("kcal");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "kJ") setUnit("kJ");
  }, []);

  const toggle = useCallback(() => {
    setUnit((prev) => {
      const next = prev === "kcal" ? "kJ" : "kcal";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const display = useCallback(
    (kcal: number): string => {
      if (unit === "kJ") return `${Math.round(kcal * KJ_PER_KCAL)} kJ`;
      return `${Math.round(kcal)} kcal`;
    },
    [unit]
  );

  return { unit, toggle, display };
}
