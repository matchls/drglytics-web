"use client";
import { useEffect, useState } from "react";
import { DashboardData } from "@/lib/types";
import AbyssBarGuestbook from "@/components/AbyssBarGuestbook";
import AbyssBarBadges from "@/components/AbyssBarBadges";
import AbyssBarHonorRoll from "@/components/AbyssBarHonorRoll";
import { getDashboardSession, getCurrentIdentity } from "@/lib/session";

export default function AbyssBarPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  // Nom connu (depuis une session active). Vide pour un visiteur sans session :
  // dans ce cas, le livre d'or affiche lui-même un champ pseudo (chemin invité).
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    // Les données de session alimentent les badges (valable même en démo).
    const session = getDashboardSession();
    if (session) setData(session.data);

    // Identité du livre d'or = identité courante (session puis préférence).
    // En DÉMO, on n'adopte AUCUNE identité : le visiteur reste un invité et doit
    // choisir son propre pseudo — impossible de poster sous le joueur démo.
    const id = getCurrentIdentity();
    if (!id.isDemo && id.displayName) setGuestName(id.displayName);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="industrial-panel p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">
          local_bar
        </span>
        <p className="font-display text-2xl text-on-surface tracking-widest">
          ABYSS BAR
        </p>
      </div>

      <AbyssBarHonorRoll />

      {/* Badges — seulement si l'utilisateur a des données de session */}
      {data && (
        <div className="industrial-panel p-6">
          <AbyssBarBadges data={data} />
        </div>
      )}

      {/* Guestbook — gère lui-même la saisie du pseudo pour les invités */}
      <div className="industrial-panel p-6">
        <AbyssBarGuestbook playerName={guestName} />
      </div>
    </div>
  );
}
