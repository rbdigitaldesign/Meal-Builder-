"use client";

import { useState } from "react";
import type { ClinicalNoteRow } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Props {
  clientId: string;
  initial: ClinicalNoteRow[];
}

export function ClinicalNotes({ clientId, initial }: Props) {
  const [notes, setNotes] = useState<ClinicalNoteRow[]>(initial);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  async function handleAdd() {
    if (!draft.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("clinical_notes")
      .insert({ client_id: clientId, content: draft.trim() })
      .select()
      .single();
    if (data) setNotes([data, ...notes]);
    setDraft("");
    setSaving(false);
  }

  async function handleEdit(id: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("clinical_notes")
      .update({ content: editContent, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (data) setNotes(notes.map((n) => (n.id === id ? data : n)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    const supabase = createClient();
    await supabase.from("clinical_notes").delete().eq("id", id);
    setNotes(notes.filter((n) => n.id !== id));
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-brand-forest">Clinical Notes</h3>

      {/* New note */}
      <Card>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a clinical note — observations, treatment notes, goals discussed…"
          rows={3}
          className="w-full text-sm text-brand-black placeholder:text-stone-400 resize-none focus:outline-none"
        />
        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={handleAdd} disabled={!draft.trim() || saving}>
            {saving ? "Saving…" : "Add Note"}
          </Button>
        </div>
      </Card>

      {/* Existing notes */}
      {notes.length === 0 ? (
        <p className="text-sm text-stone-400">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-stone-400">
                  {new Date(note.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {note.updated_at !== note.created_at && " (edited)"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                    className="text-xs text-stone-400 hover:text-brand-olive"
                  >Edit</button>
                  <button onClick={() => handleDelete(note.id)} className="text-xs text-stone-400 hover:text-red-500">Delete</button>
                </div>
              </div>
              {editingId === note.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full text-sm border border-brand-warm rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(note.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-brand-black whitespace-pre-wrap">{note.content}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
