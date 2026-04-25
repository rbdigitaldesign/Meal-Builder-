"use client";

import { useState } from "react";
import type { PatientProfile } from "@/lib/types";
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from "@/lib/types";
import { Card } from "@/components/ui/Card";

const RESTRICTION_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  glutenFree: "Gluten Free",
  dairyFree: "Dairy Free",
  nutFree: "Nut Free",
};

interface Props {
  profile: PatientProfile;
}

export function HealthPlanCard({ profile }: Props) {
  const [open, setOpen] = useState(false);

  const criticals = profile.targets.filter((t) => t.priority === "critical");
  const recommended = profile.targets.filter((t) => t.priority === "recommended");

  const hasTags = profile.restrictions.length > 0;

  return (
    <Card className="space-y-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={open}
      >
        <div>
          <span className="font-semibold text-brand-forest text-sm">My Health Plan</span>
          <span className="ml-2 text-xs text-stone-400">Set by your practitioner</span>
        </div>
        <span className="text-brand-olive text-xs font-medium">{open ? "Hide ↑" : "Show ↓"}</span>
      </button>

      {open && (
        <div className="space-y-4 pt-1 border-t border-brand-warm/50">

          {/* Condition / dietary tags */}
          {hasTags && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Dietary</p>
              <div className="flex flex-wrap gap-2">
                {profile.restrictions.map((r) => (
                  <span key={r} className="text-xs bg-brand-sage/30 text-brand-forest px-3 py-1 rounded-full font-medium">
                    {RESTRICTION_LABELS[r] ?? r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Priority targets */}
          {criticals.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Priority targets</p>
              <div className="space-y-1.5">
                {criticals.map((t) => (
                  <div key={t.nutrient} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-brand-black">{NUTRIENT_LABELS[t.nutrient]}</span>
                    <span className="text-stone-500 tabular-nums">
                      {t.dailyTarget} {NUTRIENT_UNITS[t.nutrient]} / day
                      <span className="ml-2 text-xs text-red-400 font-medium">●</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended targets */}
          {recommended.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Other targets</p>
              <div className="space-y-1.5">
                {recommended.map((t) => (
                  <div key={t.nutrient} className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">{NUTRIENT_LABELS[t.nutrient]}</span>
                    <span className="text-stone-400 tabular-nums">{t.dailyTarget} {NUTRIENT_UNITS[t.nutrient]} / day</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-stone-300 text-center pt-1">
            Contact your practitioner to update these goals
          </p>
        </div>
      )}
    </Card>
  );
}
