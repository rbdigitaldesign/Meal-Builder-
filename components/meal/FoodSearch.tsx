"use client";

import { useState, useMemo } from "react";
import type { Food, DietaryRestriction } from "@/lib/types";
import { FOODS } from "@/data/foods";
import { Input } from "@/components/ui/Input";
import { FoodCard } from "./FoodCard";

interface Props {
  restrictions: DietaryRestriction[];
  onSelect: (food: Food) => void;
  selectedIds: Set<string>;
}

export function FoodSearch({ restrictions, onSelect, selectedIds }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS
      .filter((food) => {
        if (!q) return true;
        return (
          food.name.toLowerCase().includes(q) ||
          food.category.toLowerCase().includes(q)
        );
      })
      .filter((food) => restrictions.every((r) => food.tags.includes(r)))
      .slice(0, 12);
  }, [query, restrictions]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search foods (e.g. lentils, spinach, tofu)…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-4">No foods found for that search.</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {results.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onAdd={() => onSelect(food)}
              isAdded={selectedIds.has(food.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
