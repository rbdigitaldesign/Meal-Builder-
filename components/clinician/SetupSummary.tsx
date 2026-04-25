"use client";

import type { PatientProfile } from "@/lib/types";
import { NUTRIENT_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Props {
  profile: Omit<PatientProfile, "setupComplete">;
  onConfirm: () => void;
  onBack: () => void;
}

export function SetupSummary({ profile, onConfirm, onBack }: Props) {
  const criticalTargets = profile.targets.filter((t) => t.priority === "critical");
  const recTargets = profile.targets.filter((t) => t.priority === "recommended");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Review Setup</h2>
        <p className="text-sm text-stone-500">Confirm the patient profile before saving.</p>
      </div>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Patient</p>
        <p className="text-lg font-semibold text-brand-black">{profile.name}</p>
        {profile.pin && <p className="text-xs text-stone-500 mt-0.5">PIN protected</p>}
      </Card>

      {(profile.conditionTags ?? []).length > 0 && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Conditions & Focus Areas</p>
          <div className="flex flex-wrap gap-2">
            {(profile.conditionTags ?? []).map((tag) => (
              <span key={tag} className="bg-amber-50 text-amber-800 border border-amber-200 text-sm px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </Card>
      )}

      {profile.restrictions.length > 0 && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Dietary Restrictions</p>
          <div className="flex flex-wrap gap-2">
            {profile.restrictions.map((r) => (
              <span key={r} className="bg-brand-sage/30 text-brand-forest text-sm px-3 py-1 rounded-full capitalize">
                {r.replace(/([A-Z])/g, " $1").trim()}
              </span>
            ))}
          </div>
        </Card>
      )}

      {criticalTargets.length > 0 && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Critical Targets</p>
          <div className="space-y-1.5">
            {criticalTargets.map((t) => (
              <div key={t.nutrient} className="flex justify-between text-sm">
                <span className="text-brand-black">{NUTRIENT_LABELS[t.nutrient]}</span>
                <span className="font-medium text-brand-forest">{t.dailyTarget} {t.unit}/day</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {recTargets.length > 0 && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Recommended Targets</p>
          <div className="space-y-1.5">
            {recTargets.map((t) => (
              <div key={t.nutrient} className="flex justify-between text-sm">
                <span className="text-stone-600">{NUTRIENT_LABELS[t.nutrient]}</span>
                <span className="font-medium text-stone-500">{t.dailyTarget} {t.unit}/day</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onConfirm} className="flex-1">Save &amp; Start</Button>
      </div>
    </div>
  );
}
