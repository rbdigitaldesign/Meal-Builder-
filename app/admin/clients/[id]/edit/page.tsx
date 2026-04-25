"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DietaryRestriction, NutritionalTarget } from "@/lib/types";
import type { ClientRow } from "@/lib/supabase/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { PatientInfoStep } from "@/components/clinician/PatientInfoStep";
import { DietaryRestrictionsStep } from "@/components/clinician/DietaryRestrictionsStep";
import { NutritionalGoalsStep } from "@/components/clinician/NutritionalGoalsStep";
import { ConditionTagsStep } from "@/components/admin/ConditionTagsStep";

interface PageProps { params: Promise<{ id: string }> }

const STEPS = ["Details", "Restrictions", "Conditions", "Targets"];

export default function EditClientPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [conditionTags, setConditionTags] = useState<string[]>([]);
  const [targets, setTargets] = useState<NutritionalTarget[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin/login"); return; }

      const { data } = await supabase.from("clients").select("*").eq("id", id).single();
      if (!data) { router.replace("/admin/dashboard"); return; }

      const client = data as ClientRow;
      setName(client.name);
      setPin(client.pin ?? "");
      setRestrictions(client.restrictions);
      setConditionTags(client.condition_tags);
      setTargets(client.targets);
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").update({
      name: name.trim(),
      pin: pin || null,
      restrictions,
      targets,
      condition_tags: conditionTags,
    }).eq("id", id);

    if (error) {
      if (error.code === "23505") {
        alert(`PIN ${pin} is already assigned to another client. Please choose a different PIN.`);
        setStep(0);
        setSaving(false);
        return;
      }
      alert("Failed to save changes. Please try again.");
      setSaving(false);
    } else {
      router.push(`/admin/clients/${id}`);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <p className="text-stone-400 text-sm">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href={`/admin/clients/${id}`} className="text-sm text-brand-olive hover:underline">
            ← Back to client
          </Link>
          <h1 className="text-2xl font-semibold text-brand-forest mt-2">Edit Client</h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                i < step ? "bg-brand-olive text-white" : i === step ? "bg-brand-forest text-white" : "bg-stone-200 text-stone-500"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? "bg-brand-olive" : "bg-stone-200"}`} />
              )}
            </div>
          ))}
        </div>

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
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <ConditionTagsStep
            selected={conditionTags}
            onChange={setConditionTags}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <NutritionalGoalsStep
            targets={targets}
            onChange={setTargets}
            onNext={handleSave}
            onBack={() => setStep(2)}
            submitLabel={saving ? "Saving…" : "Save Changes"}
          />
        )}
      </div>
    </AdminShell>
  );
}
