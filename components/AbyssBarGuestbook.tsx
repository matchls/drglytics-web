"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface GuestbookEntry {
  player_name: string;
  message: string;
  updated_at: string;
}

interface Props {
  playerName: string;
}

export default function AbyssBarGuestbook({ playerName }: Props) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Charger les messages au montage
  useEffect(() => {
    async function fetchEntries() {
      const { data } = await supabase
        .from("guestbook")
        .select("player_name, message, updated_at")
        .order("updated_at", { ascending: false });
      if (data) setEntries(data);
    }
    fetchEntries();
  }, []);

  // Soumettre ou mettre à jour le message
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSaving(true);
    await supabase
      .from("guestbook")
      .upsert(
        {
          player_name: playerName,
          message: draft.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "player_name" },
      );
    setSaving(false);
    // Recharger les entrées après soumission
    const { data } = await supabase
      .from("guestbook")
      .select("player_name, message, updated_at")
      .order("updated_at", { ascending: false });
    if (data) setEntries(data);
    setDraft("");
  }

  return (
    <div className="industrial-panel p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b-4 border-outline pb-3">
        <span className="material-symbols-outlined text-primary">
          menu_book
        </span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          LIVRE D'OR
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          LAISSER UN MESSAGE EN TANT QUE{" "}
          <span className="text-drg-orange">{playerName}</span>
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="Rock and Stone..."
          className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 resize-none focus:outline-none focus:border-drg-orange"
        />
        <button
          type="submit"
          disabled={saving || !draft.trim()}
          className="self-end font-display text-sm tracking-widest px-4 py-1 bg-primary text-on-primary disabled:opacity-40 hover:bg-primary-fixed transition-colors"
        >
          {saving ? "SAVING..." : "SOUMETTRE"}
        </button>
      </form>

      {/* Liste des messages */}
      <div className="flex flex-col gap-3 mt-2">
        {entries.map((entry) => (
          <div
            key={entry.player_name}
            className="border-l-2 border-drg-border pl-3 flex flex-col gap-0.5"
          >
            <p className="font-display text-sm text-drg-orange tracking-widest">
              {entry.player_name}
            </p>
            <p className="font-mono text-sm text-on-surface">{entry.message}</p>
            <p className="font-mono text-xs text-on-surface-variant">
              {new Date(entry.updated_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
