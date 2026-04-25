"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ClientRow, MealLogRow, ClinicalNoteRow } from "@/lib/supabase/types";
import type { NutritionalTarget, DietaryRestriction } from "@/lib/types";
import { getDefaultTargets } from "@/data/defaultTargets";
import { AdminShell } from "@/components/admin/AdminShell";
import { ClinicalNotes } from "@/components/admin/ClinicalNotes";
import { NutrientTrends } from "@/components/admin/NutrientTrends";
import { WeeklySummary } from "@/components/admin/WeeklySummary";
import { PINManager } from "@/components/admin/PINManager";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NUTRIENT_LABELS } from "@/lib/types";

interface PageProps { params: Promise<{ id: string }> }

export default function ClientDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientRow | null>(null);
  const [logs, setLogs] = useState<MealLogRow[]>([]);
  const [notes, setNotes] = useState<ClinicalNoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "summary" | "trends" | "notes">("overview");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin/login"); return; }

      const [{ data: clientData }, { data: logsData }, { data: notesData }] = await Promise.all([
        supabase.from("clients").select("*").eq("id", id).single(),
        supabase.from("meal_logs").select("*").eq("client_id", id).order("date", { ascending: false }).limit(150),
        supabase.from("clinical_notes").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      ]);

      setClient(clientData);
      setLogs(logsData ?? []);
      setNotes(notesData ?? []);
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleUpdatePin(pin: string) {
    const supabase = createClient();
    await supabase.from("clients").update({ pin: pin || null }).eq("id", id);
    setClient((c) => c ? { ...c, pin: pin || null } : c);
  }

  if (loading) return <AdminShell><p className="text-stone-400">Loading…</p></AdminShell>;
  if (!client) return <AdminShell><p className="text-stone-400">Client not found.</p></AdminShell>;

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "summary",  label: "Summary" },
    { key: "trends",   label: "Trends" },
    { key: "notes",    label: `Notes (${notes.length})` },
  ] as const;

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-sm text-brand-olive hover:underline mb-2 block">← All Clients</Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-brand-forest">{client.name}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {client.condition_tags.map((tag) => (
                <span key={tag} className="text-xs bg-brand-sage/30 text-brand-forest px-2 py-0.5 rounded-full">{tag}</span>
              ))}
              {client.restrictions.map((r) => (
                <span key={r} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full capitalize">
                  {r.replace(/([A-Z])/g, " $1").trim()}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/clients/${id}/report`}>
              <Button variant="secondary" size="sm">Print Report</Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/clients/${id}/edit`)}>Edit Profile</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-brand-warm">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? "border-brand-olive text-brand-forest" : "border-transparent text-stone-500 hover:text-brand-black"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <PINManager currentPin={client.pin} onUpdate={handleUpdatePin} />

          <Card>
            <h3 className="font-semibold text-brand-forest mb-3">Nutritional Targets</h3>
            <div className="space-y-2">
              {client.targets.map((t) => (
                <div key={t.nutrient} className="flex justify-between text-sm">
                  <span className={t.priority === "critical" ? "font-medium text-brand-black" : "text-stone-500"}>
                    {NUTRIENT_LABELS[t.nutrient]}
                    {t.priority === "critical" && <span className="ml-1 text-xs text-red-500">●</span>}
                  </span>
                  <span className="tabular-nums text-stone-500">{t.dailyTarget} {t.unit}/day</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-brand-forest mb-2">Activity</h3>
            <div className="text-sm text-stone-500 space-y-1">
              <p>Meals logged: <span className="font-medium text-brand-black">{logs.length}</span></p>
              <p>Last active: <span className="font-medium text-brand-black">
                {client.last_active ? new Date(client.last_active).toLocaleDateString("en-AU") : "Never"}
              </span></p>
              <p>Client since: <span className="font-medium text-brand-black">
                {new Date(client.created_at).toLocaleDateString("en-AU")}
              </span></p>
            </div>
          </Card>
        </div>
      )}

      {tab === "summary" && <WeeklySummary logs={logs} targets={client.targets} />}
      {tab === "trends" && <NutrientTrends logs={logs} targets={client.targets} />}
      {tab === "notes" && <ClinicalNotes clientId={id} initial={notes} />}
    </AdminShell>
  );
}
