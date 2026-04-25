"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getDefaultTargets } from "@/data/defaultTargets";
import type { DietaryRestriction, NutritionalTarget } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { PatientInfoStep } from "@/components/clinician/PatientInfoStep";
import { DietaryRestrictionsStep } from "@/components/clinician/DietaryRestrictionsStep";
import { NutritionalGoalsStep } from "@/components/clinician/NutritionalGoalsStep";
import { SetupSummary } from "@/components/clinician/SetupSummary";
import { ConditionTagsStep } from "@/components/admin/ConditionTagsStep";

const STEPS = ["Details", "Restrictions", "Conditions", "Targets", "Review"];

export default function NewClientPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [conditionTags, setConditionTags] = useState<string[]>([]);
  const [targets, setTargets] = useState<NutritionalTarget[]>(() => getDefaultTargets([]));
  const [saving, setSaving] = useState(false);

  function handleRestrictionsNext() {
    setTargets(getDefaultTargets(restrictions));
    setStep(2);
  }

  async function handleConfirm() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/admin/login"); return; }

    const { error } = await supabase.from("clients").insert({
      practitioner_id: user.id,
      name: name.trim(),
      pin: pin || null,
      restrictions,
      targets,
      condition_tags: conditionTags,
    });

    if (error) {
      if (error.code === "23505") {
        alert(`PIN ${pin} is already assigned to another client. Please choose a different PIN.`);
        setStep(0);
      } else {
        alert("Failed to save client. Please try again.");
      }
      setSaving(false);
    } else {
      router.push("/admin/dashboard");
    }
  }

  return (
    <AdminShell>
      <div className="max-w-lg mx-auto">
        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                i < step ? "bg-brand-olive text-white" : i === step ? "bg-brand-forest text-white" : "bg-stone-200 text-stone-500"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-brand-olive" : "bg-stone-200"}`} />}
            </div>
          ))}
        </div>

        {step === 0 && <PatientInfoStep name={name} pin={pin} onChangeName={setName} onChangePin={setPin} onNext={() => setStep(1)} />}
        {step === 1 && <DietaryRestrictionsStep selected={restrictions} onChange={setRestrictions} onNext={handleRestrictionsNext} onBack={() => setStep(0)} />}
        {step === 2 && <ConditionTagsStep selected={conditionTags} onChange={setConditionTags} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <NutritionalGoalsStep targets={targets} onChange={setTargets} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && (
          <SetupSummary
            profile={{ name, pin, restrictions, targets }}
            onConfirm={handleConfirm}
            onBack={() => setStep(3)}
          />
        )}
        {saving && <p className="text-center text-sm text-stone-400 mt-4">Saving client…</p>}
      </div>
    </AdminShell>
  );
}
