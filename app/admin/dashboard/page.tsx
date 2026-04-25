"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ClientRow } from "@/lib/supabase/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

  const active = clients.filter((c) => !c.archived_at);
  const archived = clients.filter((c) => c.archived_at);
  const shown = showArchived ? archived : active;

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
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!showArchived ? "bg-brand-olive text-white" : "bg-stone-100 text-stone-500"}`}
        >
          Active ({active.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${showArchived ? "bg-brand-olive text-white" : "bg-stone-100 text-stone-500"}`}
        >
          Archived ({archived.length})
        </button>
      </div>

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
          {shown.map((client) => (
            <Card key={client.id} padded={false} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-brand-black">{client.name}</p>
                  {client.condition_tags.map((tag) => (
                    <span key={tag} className="text-xs bg-brand-sage/30 text-brand-forest px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-400">
                  <span>PIN: <span className="font-mono font-semibold text-stone-600">{client.pin ?? "—"}</span></span>
                  {client.last_active && (
                    <span>Last active: {new Date(client.last_active).toLocaleDateString("en-AU")}</span>
                  )}
                  <span>Added: {new Date(client.created_at).toLocaleDateString("en-AU")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/clients/${client.id}`}>
                  <Button variant="secondary" size="sm">View</Button>
                </Link>
                {client.archived_at ? (
                  <Button variant="ghost" size="sm" onClick={() => handleUnarchive(client.id)}>Restore</Button>
                ) : (
                  <Button variant="danger" size="sm" onClick={() => handleArchive(client.id)}>Archive</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
