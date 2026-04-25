"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ConditionTemplateRow } from "@/lib/supabase/types";
import type { DietaryRestriction, NutritionalTarget } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const RESTRICTION_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian", vegan: "Vegan", glutenFree: "Gluten Free",
  dairyFree: "Dairy Free", nutFree: "Nut Free",
};

interface Props {
  onApply: (restrictions: DietaryRestriction[], targets: NutritionalTarget[]) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function TemplatePickerStep({ onApply, onSkip, onBack }: Props) {
  const [templates, setTemplates] = useState<ConditionTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("condition_templates").select("*").order("name");
      setTemplates(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const chosenTemplate = templates.find((t) => t.id === selected);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-brand-forest">Start from a Template</h2>
        <p className="text-sm text-stone-400">Loading templates…</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-brand-forest mb-1">Start from a Template</h2>
          <p className="text-sm text-stone-500">No templates yet. You can create them under Templates in the sidebar.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={onSkip} className="flex-1">Continue without template</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-forest mb-1">Start from a Template</h2>
        <p className="text-sm text-stone-500">
          Apply a condition template to pre-fill restrictions and nutritional targets.
          You can adjust everything in the next steps.
        </p>
      </div>

      <div className="space-y-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(selected === t.id ? null : t.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selected === t.id
                ? "border-brand-olive bg-brand-sage/10"
                : "border-brand-warm bg-white hover:border-brand-sage"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-black text-sm">{t.name}</p>
                {t.description && (
                  <p className="text-xs text-stone-500 mt-0.5">{t.description}</p>
                )}
                {t.restrictions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.restrictions.map((r) => (
                      <span key={r} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                        {RESTRICTION_LABELS[r] ?? r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                selected === t.id ? "border-brand-olive bg-brand-olive" : "border-stone-300"
              }`}>
                {selected === t.id && <span className="text-white text-xs leading-none">✓</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        {chosenTemplate ? (
          <Button
            onClick={() => onApply(chosenTemplate.restrictions, chosenTemplate.targets)}
            className="flex-1"
          >
            Apply "{chosenTemplate.name}"
          </Button>
        ) : (
          <Button variant="secondary" onClick={onSkip} className="flex-1">
            Skip — set manually
          </Button>
        )}
      </div>
    </div>
  );
}
