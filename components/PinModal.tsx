"use client";
import { useState } from "react";
import { verifyPIN, hashPIN } from "@/app/actions/pinActions";

interface Props {
  mode: "create" | "verify";
  playerName: string;
  // onSuccess reçoit le hash (create) ou une chaîne vide (verify — hash déjà en base)
  onSuccess: (pinHash: string) => void;
}

export default function PinModal({ mode, playerName, onSuccess }: Props) {
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    // Validation : 4 à 6 chiffres uniquement
    if (!/^\d{4,6}$/.test(pin)) {
      setError("⚠ LE PIN DOIT CONTENIR 4 À 6 CHIFFRES.");
      return;
    }

    if (mode === "create") {
      if (pin !== pinConfirm) {
        setError("⚠ LES DEUX PINS NE CORRESPONDENT PAS.");
        return;
      }
      setLoading(true);
      const hash = await hashPIN(pin);
      onSuccess(hash);
    }

    if (mode === "verify") {
      setLoading(true);
      const { valid } = await verifyPIN(playerName, pin);
      if (!valid) {
        setError("⚠ CODE PIN INCORRECT.");
        setLoading(false);
        return;
      }
      // Pour verify, on passe une chaîne vide — le hash existe déjà en base
      onSuccess("");
    }
  }

  return (
    // Fond semi-transparent par-dessus la page
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="industrial-panel w-full max-w-sm">
        {/* Header */}
        <div className="p-4 border-b-4 border-outline flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">lock</span>
          <p className="font-display text-lg text-on-surface tracking-widest">
            {mode === "create" ? "CRÉER UN CODE PIN" : "VÉRIFICATION D'IDENTITÉ"}
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Contexte */}
          <p className="font-mono text-xs text-on-surface-variant">
            {mode === "create"
              ? `Bienvenue, ${playerName}. Choisissez un PIN (4–6 chiffres) pour protéger votre profil.`
              : `Bonjour, ${playerName}. Entrez votre PIN pour confirmer votre identité.`}
          </p>

          {/* Avertissement création */}
          {mode === "create" && (
            <div className="bg-surface-container border-l-4 border-primary px-3 py-2">
              <p className="font-mono text-xs text-primary tracking-widest">
                ⚠ NOTEZ VOTRE PIN — VOUS EN AUREZ BESOIN POUR METTRE À JOUR VOS STATS.
              </p>
            </div>
          )}

          {/* Input PIN */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              CODE PIN
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange tracking-[0.5em]"
            />
          </div>

          {/* Confirmation (création uniquement) */}
          {mode === "create" && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs text-on-surface-variant tracking-widest">
                CONFIRMER LE PIN
              </p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange tracking-[0.5em]"
              />
            </div>
          )}

          {/* Erreur */}
          {error && (
            <p className="font-mono text-xs text-error tracking-widest">{error}</p>
          )}

          {/* Bouton */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-on-primary font-display tracking-widest py-2 hover:bg-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "VÉRIFICATION..." : mode === "create" ? "CRÉER MON PIN" : "CONFIRMER"}
          </button>
        </div>
      </div>
    </div>
  );
}
