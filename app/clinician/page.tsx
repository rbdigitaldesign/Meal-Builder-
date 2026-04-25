"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DietaryRestriction, NutritionalTarget, PatientProfile } from "@/lib/types";
import { useProfileStore } from "@/store/profileStore";
import { getDefaultTargets } from "@/data/defaultTargets";
import { getPresetsForProfile, applyPresetsToTargets } from "@/lib/presets";
import { PatientInfoStep } from "@/components/clinician/PatientInfoStep";
import { DietaryRestrictionsStep } from "@/components/clinician/DietaryRestrictionsStep";
import { ConditionsStep } from "@/components/clinician/ConditionsStep";
import { NutritionalGoalsStep } from "@/components/clinician/NutritionalGoalsStep";
import { SetupSummary } from "@/components/clinician/SetupSummary";

const STEPS = ["Patient Info", "Restrictions", "Conditions", "Targets", "Review"];

export default function ClinicianPage() {
  const router = useRouter();
  const { setProfile } = useProfileStore();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [conditionTags, setConditionTags] = useState<string[]>([]);
  const [targets, setTargets] = useState<NutritionalTarget[]>(() => getDefaultTargets([]));
  const [autoPresets, setAutoPresets] = useState<string[]>([]);

  function handleRestrictionsNext() {
    setTargets(getDefaultTargets(restrictions));
    setStep(2);
  }

  function handleConditionsNext() {
    const presetIds = getPresetsForProfile(conditionTags, restrictions);
    setAutoPresets(presetIds);
    if (presetIds.length > 0) {
      setTargets((prev) => applyPresetsToTargets(prev, presetIds));
    }
    setStep(3);
  }

  function handleConfirm() {
    const profile: PatientProfile = {
      name: name.trim(),
      pin: pin || undefined,
      restrictions,
      conditionTags,
      targets,
      setupComplete: true,
    };
    setProfile(profile);
    router.push("/dashboard");
  }

  const profileDraft = { name, pin, restrictions, conditionTags, targets };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-brand-forest text-white px-6 py-4 flex items-center gap-4">
        <Image src="/logo.png" alt="Alchemy Natural Health" width={120} height={40} className="object-contain" />
        <div className="border-l border-white/20 pl-4">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Clinician Setup</p>
          <h1 className="text-base font-semibold">Patient Meal Builder</h1>
        </div>
      </div>

      {/* Step indicators */}
      <div className="px-6 py-4 border-b border-brand-warm bg-white">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                i < step ? "bg-brand-olive text-white" :
                i === step ? "bg-brand-forest text-white" :
                "bg-stone-200 text-stone-500"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? "bg-brand-olive" : "bg-stone-200"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-md mx-auto mt-1">
          {STEPS.map((label) => (
            <span key={label} className="text-xs text-stone-500 text-center" style={{ width: "25%" }}>{label}</span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-md mx-auto px-6 py-8">
        {step === 0 && (
          <PatientInfoStep
            name={name}
            pin={pin}
            onChangeName={setName}
            onChangePin={setPin}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <DietaryRestrictionsStep
            selected={restrictions}
            onChange={setRestrictions}
            onNext={handleRestrictionsNext}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <ConditionsStep
            selected={conditionTags}
            onChange={setConditionTags}
            onNext={handleConditionsNext}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <NutritionalGoalsStep
            targets={targets}
            onChange={setTargets}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
            initialActivePresets={autoPresets}
          />
        )}
        {step === 4 && (
          <SetupSummary
            profile={profileDraft}
            onConfirm={handleConfirm}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}
