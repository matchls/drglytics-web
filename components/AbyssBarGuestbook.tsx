"use client";
import { useState } from "react";
import { fetchGuestbook } from "@/lib/data/guestbook";
import { useAsync } from "@/lib/hooks/useAsync";
import { saveGuestbookMessage } from "@/app/actions/saveGuestbookMessage";
import { checkPlayer } from "@/app/actions/pinActions";
import PinModal from "@/components/PinModal";

interface Props {
  playerName: string;
}

export default function AbyssBarGuestbook({ playerName }: Props) {
  // useAsync remplace le useState + useEffect + loadEntries qui chargeaient le guestbook.
  // reload() est utilisé plus bas après soumission d'un message pour rafraîchir la liste.
  const { data: entriesData, reload: reloadEntries } = useAsync(() => fetchGuestbook());
  const entries = entriesData ?? [];

  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Le modal PIN s'ouvre au moment de soumettre, pour prouver l'identité.
  const [pinModalOpen, setPinModalOpen] = useState(false);
  // Pseudo saisi par un invité quand aucune session n'est active (prop vide).
  const [guestName, setGuestName] = useState("");

  // Nom effectif : celui de la session (prop) en priorité, sinon la saisie invité.
  const activeName = (playerName || guestName).trim();

  // Soumission : on regarde si le pseudo est un joueur protégé par un PIN.
  // - Joueur enregistré → on demande le PIN via le modal.
  // - Invité (pseudo libre) → envoi direct, sans PIN.
  // (Le serveur revérifie de toute façon : ce choix n'est qu'une question d'UX.)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!draft.trim()) return;
    if (!activeName) {
      setError("⚠ ENTRE TON PSEUDO POUR LAISSER UN MESSAGE.");
      return;
    }
    const { exists, hasPIN } = await checkPlayer(activeName);
    if (hasPIN) {
      // Joueur protégé → on exige le PIN.
      setPinModalOpen(true);
    } else if (exists) {
      // Pseudo déjà pris par un joueur (sans PIN) → pas d'usurpation possible.
      setError("⚠ CE PSEUDO APPARTIENT À UN JOUEUR. CHOISIS-EN UN AUTRE.");
    } else {
      // Pseudo libre → chemin invité.
      await submitMessage("");
    }
  }

  // Écriture VÉRIFIÉE côté serveur. pin = "" pour un invité.
  async function submitMessage(pin: string) {
    setSaving(true);
    const result = await saveGuestbookMessage(activeName, pin, draft);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft("");
    await reloadEntries();
  }

  // Appelé par le modal après saisie + pré-vérification du PIN (chemin joueur).
  function handlePinSuccess(pin: string) {
    setPinModalOpen(false);
    submitMessage(pin);
  }

  return (
    <div className="industrial-panel p-6 flex flex-col gap-4">
      {/* Modal PIN — par-dessus le contenu */}
      {pinModalOpen && (
        <PinModal
          mode="verify"
          playerName={activeName.toUpperCase()}
          onSuccess={handlePinSuccess}
          onCancel={() => setPinModalOpen(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 border-b-4 border-outline pb-3">
        <span className="material-symbols-outlined text-primary">
          menu_book
        </span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          {"LIVRE D'OR"}
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {playerName ? (
          <p className="font-mono text-xs text-on-surface-variant tracking-widest">
            LAISSER UN MESSAGE EN TANT QUE{" "}
            <span className="text-drg-orange">{playerName}</span>
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              TON PSEUDO
            </p>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={32}
              placeholder="ENTER OPERATIVE ID"
              className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange"
            />
          </div>
        )}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="Rock and Stone..."
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
