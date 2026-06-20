"use server";
// leaderboardVisibility — Lit et met à jour visible_on_leaderboard pour le joueur connecté.
//
// Le toggle Options ne supprime pas les données : il masque juste la ligne du leaderboard.
// Seul le service_role peut écrire sur `players` (la clé anon est en lecture seule).

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// Retourne la valeur en base, ou null si l'utilisateur n'est pas connecté
// ou n'a pas encore de ligne dans players.
export async function getLeaderboardVisibility(): Promise<boolean | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabaseAdmin
    .from("players")
    .select("visible_on_leaderboard")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.visible_on_leaderboard ?? null;
}

export async function updateLeaderboardVisibility(
  visible: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Non connecté." };

  const { error } = await supabaseAdmin
    .from("players")
    .update({ visible_on_leaderboard: visible })
    .eq("user_id", user.id);

  if (error) {
    console.error("updateLeaderboardVisibility:", error);
    return { ok: false, error: "Échec de la mise à jour." };
  }

  return { ok: true };
}
