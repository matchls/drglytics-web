"use client";
import { useState } from "react";
import Link from "next/link";
import { fetchGuestbook } from "@/lib/data/guestbook";
import { useAsync } from "@/lib/hooks/useAsync";
import { saveGuestbookMessage } from "@/app/actions/saveGuestbookMessage";
import { useTranslation } from "@/lib/i18n";

interface Props {
  playerName: string;
  isLoggedIn: boolean;
}

export default function AbyssBarGuestbook({ playerName, isLoggedIn }: Props) {
  const t = useTranslation();
  const { data: entriesData, reload: reloadEntries } = useAsync(() => fetchGuestbook());
  const entries = entriesData ?? [];

  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!draft.trim()) return;

    setSaving(true);
    const result = await saveGuestbookMessage(draft);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft("");
    await reloadEntries();
  }

  return (
    <div className="industrial-panel p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b-4 border-outline pb-3">
        <span className="material-symbols-outlined text-primary">menu_book</span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          {t("gbTitle")}
        </p>
      </div>

      {/* Formulaire — seulement si connecté */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {playerName && (
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              {t("gbPostAs")}{" "}
              <span className="text-drg-orange">{playerName}</span>
            </p>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder={t("gbPlaceholder")}
            className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 resize-none focus:outline-none focus:border-drg-orange"
          />
          {error && (
            <p className="font-mono text-xs text-error tracking-widest">{error}</p>
          )}
          <button
            type="submit"
            disabled={saving || !draft.trim()}
            className="self-end font-display text-sm tracking-widest px-4 py-1 bg-primary text-on-primary disabled:opacity-40 hover:bg-primary-fixed transition-colors"
          >
            {saving ? t("gbSaving") : t("gbSubmit")}
          </button>
        </form>
      ) : (
        <div className="bg-surface-dim border-l-4 border-primary px-4 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">lock</span>
          <p className="font-mono text-xs text-on-surface-variant">
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary-fixed transition-colors"
            >
              Connecte-toi
            </Link>{" "}
            pour laisser un message.
          </p>
        </div>
      )}

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
