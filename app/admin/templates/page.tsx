"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ConditionTemplateRow } from "@/lib/supabase/types";
import type { DietaryRestriction, NutritionalTarget } from "@/lib/types";
import { NUTRIENT_LABELS } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DietaryRestrictionsStep } from "@/components/clinician/DietaryRestrictionsStep";
import { NutritionalGoalsStep } from "@/components/clinician/NutritionalGoalsStep";
import { getDefaultTargets } from "@/data/defaultTargets";

type Mode = "list" | "new" | "edit";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ConditionTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // New/edit form state
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [targets, setTargets] = useState<NutritionalTarget[]>(() => getDefaultTargets([]));

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin/login"); return; }
      const { data } = await supabase.from("condition_templates").select("*").order("name");
      setTemplates(data ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  function startNew() {
    setName(""); setDescription(""); setRestrictions([]); setTargets(getDefaultTargets([]));
    setStep(0); setEditingId(null); setMode("new");
  }

  function startEdit(t: ConditionTemplateRow) {
    setName(t.name); setDescription(t.description ?? ""); setRestrictions(t.restrictions);
    setTargets(t.targets); setStep(0); setEditingId(t.id); setMode("edit");
  }

  async function handleSave() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = { practitioner_id: user.id, name, description: description || null, restrictions, targets };

    if (editingId) {
      const { data } = await supabase.from("condition_templates").update(payload).eq("id", editingId).select().single();
      if (data) setTemplates((prev) => prev.map((t) => t.id === editingId ? data : t));
    } else {
      const { data } = await supabase.from("condition_templates").insert(payload).select().single();
      if (data) setTemplates((prev) => [...prev, data]);
    }
    setMode("list");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    const supabase = createClient();
    await supabase.from("condition_templates").delete().eq("id", id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  if (mode === "new" || mode === "edit") {
    return (
      <AdminShell>
        <div className="max-w-lg mx-auto">
          <button onClick={() => setMode("list")} className="text-sm text-brand-olive hover:underline mb-6 block">← Back to Templates</button>
          <h1 className="text-xl font-semibold text-brand-forest mb-6">{mode === "edit" ? "Edit Template" : "New Template"}</h1>

          {step === 0 && (
            <div className="space-y-4">
              <Input label="Template name" placeholder="e.g. Iron Deficiency Anaemia" value={name} onChange={(e) => setName(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief notes about when to use this template…"
                  rows={3}
                  className="w-full rounded-xl border border-brand-warm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                />
              </div>
              <Button className="w-full" disabled={!name.trim()} onClick={() => setStep(1)}>Continue</Button>
            </div>
          )}
          {step === 1 && (
            <DietaryRestrictionsStep selected={restrictions} onChange={setRestrictions}
              onNext={() => { setTargets(getDefaultTargets(restrictions)); setStep(2); }} onBack={() => setStep(0)} />
          )}
          {step === 2 && (
            <NutritionalGoalsStep targets={targets} onChange={setTargets} onNext={handleSave} onBack={() => setStep(1)} />
          )}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-forest">Condition Templates</h1>
          <p className="text-sm text-stone-500 mt-0.5">Reusable nutritional profiles for common conditions</p>
        </div>
        <Button onClick={startNew}>+ New Template</Button>
      </div>

      {loading ? (
        <p className="text-stone-400 text-sm">Loading…</p>
      ) : templates.length === 0 ? (
        <Card>
          <p className="text-sm text-stone-400 text-center py-4">No templates yet. Create one to apply it to new clients in one click.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-black">{t.name}</p>
                  {t.description && <p className="text-sm text-stone-500 mt-0.5">{t.description}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.targets.filter((tg) => tg.priority === "critical").map((tg) => (
                      <span key={tg.nutrient} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                        {NUTRIENT_LABELS[tg.nutrient]}: {tg.dailyTarget}{tg.unit}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => startEdit(t)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
