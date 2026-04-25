"use client";

import { useState } from "react";
import type { NutritionalTarget, NutrientKey } from "@/lib/types";
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const EDITABLE_NUTRIENTS: NutrientKey[] = [
  "calories", "protein", "iron", "calcium", "vitaminB12", "zinc", "vitaminC", "fiber",
];

interface PresetAdjustment {
  nutrient: NutrientKey;
  dailyTarget: number;
  priority: "critical" | "recommended";
}

const FOCUS_PRESETS: { id: string; label: string; adjustments: PresetAdjustment[] }[] = [
  {
    id: "iron-deficiency",
    label: "Iron Deficiency",
    adjustments: [
      { nutrient: "iron",     dailyTarget: 18, priority: "critical" },
      { nutrient: "vitaminC", dailyTarget: 90, priority: "critical" },
    ],
  },
  {
    id: "zinc-deficiency",
    label: "Zinc Deficiency",
    adjustments: [
      { nutrient: "zinc", dailyTarget: 11, priority: "critical" },
    ],
  },
  {
    id: "calcium-deficiency",
    label: "Calcium Deficiency",
    adjustments: [
      { nutrient: "calcium", dailyTarget: 1200, priority: "critical" },
    ],
  },
  {
    id: "mental-health",
    label: "Mental Health",
    adjustments: [
      { nutrient: "zinc",       dailyTarget: 11,  priority: "critical" },
      { nutrient: "vitaminB12", dailyTarget: 2.4, priority: "critical" },
      { nutrient: "protein",    dailyTarget: 60,  priority: "critical" },
      { nutrient: "iron",       dailyTarget: 18,  priority: "critical" },
    ],
  },
  {
    id: "immune-support",
    label: "Immune Support",
    adjustments: [
      { nutrient: "vitaminC", dailyTarget: 200, priority: "critical" },
      { nutrient: "zinc",     dailyTarget: 11,  priority: "critical" },
      { nutrient: "iron",     dailyTarget: 18,  priority: "critical" },
    ],
  },
];

interface Props {
  targets: NutritionalTarget[];
  onChange: (targets: NutritionalTarget[]) => void;
  onNext: () => void;
  onBack: () => void;
  submitLabel?: string;
}

export function NutritionalGoalsStep({ targets, onChange, onNext, onBack, submitLabel = "Review" }: Props) {
  const [activePresets, setActivePresets] = useState<Set<string>>(new Set());

  function applyPreset(presetId: string) {
    const preset = FOCUS_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const isActive = activePresets.has(presetId);
    const nextActive = new Set(activePresets);

    if (isActive) {
      nextActive.delete(presetId);
      // Revert nutrients that are ONLY used by this preset
      const otherActive = [...nextActive];
      const stillNeeded = new Set(
        otherActive.flatMap((id) => FOCUS_PRESETS.find((p) => p.id === id)?.adjustments.map((a) => a.nutrient) ?? [])
      );
      const revertNutrients = preset.adjustments
        .map((a) => a.nutrient)
        .filter((n) => !stillNeeded.has(n));

      onChange(
        targets.map((t) =>
          revertNutrients.includes(t.nutrient) ? { ...t, priority: "recommended" } : t
        )
      );
    } else {
      nextActive.add(presetId);
      onChange(
        targets.map((t) => {
          const adj = preset.adjustments.find((a) => a.nutrient === t.nutrient);
          return adj ? { ...t, dailyTarget: adj.dailyTarget, priority: adj.priority } : t;
        })
      );
    }

    setActivePresets(nextActive);
  }

  function updateTarget(nutrient: NutrientKey, value: number) {
    onChange(targets.map((t) => t.nutrient === nutrient ? { ...t, dailyTarget: value } : t));
  }

  function togglePriority(nutrient: NutrientKey) {
    onChange(
      targets.map((t) =>
        t.nutrient === nutrient
          ? { ...t, priority: t.priority === "critical" ? "recommended" : "critical" }
          : t
      )
    );
  }

  const shown = targets.filter((t) => EDITABLE_NUTRIENTS.includes(t.nutrient));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Nutritional Goals</h2>
        <p className="text-sm text-stone-500">
          Set daily targets. Mark nutrients as <strong>Critical</strong> to highlight them prominently in the patient view.
        </p>
      </div>

      {/* Focus area presets */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Focus Areas</p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_PRESETS.map((preset) => {
            const active = activePresets.has(preset.id);
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? "bg-brand-forest text-white border-brand-forest"
                    : "bg-white text-stone-600 border-brand-warm hover:border-brand-olive hover:text-brand-forest"
                }`}
              >
                {active ? "✓ " : ""}{preset.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-stone-400 mt-1.5">Tap to apply — sets recommended targets and marks key nutrients as critical. Tap again to remove.</p>
      </div>

      <div className="space-y-3">
        {shown.map((target) => (
          <div key={target.nutrient} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-brand-warm">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-black truncate">
                {NUTRIENT_LABELS[target.nutrient]}
              </p>
              <p className="text-xs text-stone-500">{NUTRIENT_UNITS[target.nutrient]} per day</p>
            </div>
            <input
              type="number"
              value={target.dailyTarget}
              min={0}
              step={target.nutrient === "vitaminB12" ? 0.1 : 1}
              onChange={(e) => updateTarget(target.nutrient, parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-brand-warm px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
            />
            <button
              onClick={() => togglePriority(target.nutrient)}
              title={target.priority === "critical" ? "Mark as recommended" : "Mark as critical"}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                target.priority === "critical"
                  ? "bg-red-100 text-red-700"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {target.priority === "critical" ? "Critical" : "Recommended"}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">{submitLabel}</Button>
      </div>
    </div>
  );
}
