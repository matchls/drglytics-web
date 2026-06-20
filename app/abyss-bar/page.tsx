"use client";
import { useEffect, useState } from "react";
import { DashboardData } from "@/lib/types";
import AbyssBarGuestbook from "@/components/AbyssBarGuestbook";
import AbyssBarBadges from "@/components/AbyssBarBadges";
import AbyssBarHonorRoll from "@/components/AbyssBarHonorRoll";
import { getDashboardSession, getCurrentIdentity } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";

export default function AbyssBarPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = getDashboardSession();
    if (session) setData(session.data);

    const id = getCurrentIdentity();
    if (!id.isDemo && id.displayName) setPlayerName(id.displayName);

    // Vérifie si l'utilisateur est connecté via le client navigateur
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="industrial-panel p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">local_bar</span>
        <p className="font-display text-2xl text-on-surface tracking-widest">
          ABYSS BAR
        </p>
      </div>

      <AbyssBarHonorRoll />

      {data && (
        <div className="industrial-panel p-6">
          <AbyssBarBadges data={data} />
        </div>
      )}

      <div className="industrial-panel p-6">
        <AbyssBarGuestbook playerName={playerName} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
