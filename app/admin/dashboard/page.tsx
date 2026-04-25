"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ClientRow } from "@/lib/supabase/types";
import { getEngagementStatus } from "@/lib/analytics";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const ENGAGEMENT_STYLES = {
  active:   { dot: "bg-green-400",  label: "Active",    text: "text-green-600"  },
  quiet:    { dot: "bg-amber-400",  label: "Quiet",     text: "text-amber-600"  },
  inactive: { dot: "bg-red-400",    label: "Inactive",  text: "text-red-500"    },
  never:    { dot: "bg-stone-300",  label: "Never logged", text: "text-stone-400" },
} as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin/login"); return; }
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      setClients(data ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  const [conditionFilter, setConditionFilter] = useState<string | null>(null);

  const active = clients.filter((c) => !c.archived_at);
  const archived = clients.filter((c) => c.archived_at);
  const baseList = showArchived ? archived : active;

  const allConditionTags = Array.from(
    new Set(active.flatMap((c) => c.condition_tags))
  ).sort();

  const shown = conditionFilter
    ? baseList.filter((c) => c.condition_tags.includes(conditionFilter))
    : baseList;

  async function handleArchive(id: string) {
    if (!confirm("Archive this client? They won't be able to log in.")) return;
    const supabase = createClient();
    await supabase.from("clients").update({ archived_at: new Date().toISOString() }).eq("id", id);
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, archived_at: new Date().toISOString() } : c));
  }

  async function handleUnarchive(id: string) {
    const supabase = createClient();
    await supabase.from("clients").update({ archived_at: null }).eq("id", id);
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, archived_at: null } : c));
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-forest">Clients</h1>
          <p className="text-sm text-stone-500 mt-0.5">{active.length} active client{active.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => router.push("/admin/clients/new")}>+ New Client</Button>
      </div>

      {/* Toggle archived */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => { setShowArchived(false); setConditionFilter(null); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px] ${!showArchived ? "bg-brand-olive text-white" : "bg-stone-100 text-stone-500"}`}
        >
          Active ({active.length})
        </button>
        <button
          onClick={() => { setShowArchived(true); setConditionFilter(null); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px] ${showArchived ? "bg-brand-olive text-white" : "bg-stone-100 text-stone-500"}`}
        >
          Archived ({archived.length})
        </button>
      </div>

      {/* Condition tag filters */}
      {!showArchived && allConditionTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-stone-400 self-center">Filter by condition:</span>
          {allConditionTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setConditionFilter(conditionFilter === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border min-h-[36px] ${
                conditionFilter === tag
                  ? "bg-brand-olive text-white border-brand-olive"
                  : "bg-white text-stone-600 border-stone-200 hover:border-brand-olive"
              }`}
            >
              {tag}
            </button>
          ))}
          {conditionFilter && (
            <button
              onClick={() => setConditionFilter(null)}
              className="text-xs text-stone-400 hover:text-brand-olive transition-colors px-1"
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-stone-400 text-sm">Loading…</p>
      ) : shown.length === 0 ? (
        <Card>
          <p className="text-stone-400 text-sm text-center py-4">
            {showArchived ? "No archived clients." : "No clients yet. Add your first client to get started."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {shown.map((client) => {
            const status = getEngagementStatus(client.last_active);
            const { dot, label, text } = ENGAGEMENT_STYLES[status];
            return (
              <Card key={client.id} padded={false} className="px-4 py-4">
                {/* Row 1: name + engagement badge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-semibold text-brand-black leading-snug">{client.name}</p>
                  <span className={`flex items-center gap-1.5 text-xs font-medium flex-shrink-0 mt-0.5 ${text}`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    {label}
                  </span>
                </div>

                {/* Row 2: condition + restriction pills */}
                {client.condition_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {client.condition_tags.map((tag) => (
                      <span key={tag} className="text-xs bg-brand-sage/30 text-brand-forest px-2 py-0.5 rounded-full leading-snug">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Row 3: meta + action buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100">
                  <div className="text-xs text-stone-400 space-y-0.5 min-w-0">
                    <p>PIN: <span className="font-mono font-semibold text-stone-600">{client.pin ?? "—"}</span></p>
                    {client.last_active
                      ? <p>Active: {new Date(client.last_active).toLocaleDateString("en-AU")}</p>
                      : <p>Added: {new Date(client.created_at).toLocaleDateString("en-AU")}</p>
                    }
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/clients/${client.id}`}>
                      <Button variant="secondary" size="md">View</Button>
                    </Link>
                    {client.archived_at ? (
                      <Button variant="ghost" size="md" onClick={() => handleUnarchive(client.id)}>Restore</Button>
                    ) : (
                      <Button variant="danger" size="md" onClick={() => handleArchive(client.id)}>Archive</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
