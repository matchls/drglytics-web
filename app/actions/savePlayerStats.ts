"use server";
// savePlayerStats — Enregistre les stats d'un joueur authentifié.
//
// L'autorisation ne repose plus sur un PIN mais sur la session Supabase :
// on vérifie que l'appelant est bien connecté via auth.getUser(), puis on
// écrit avec supabaseAdmin (service role). La session est lue côté serveur
// depuis les cookies — le navigateur ne peut pas la falsifier.

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { buildPlayerRow } from "@/lib/buildPlayerRow";
import { DashboardData } from "@/lib/types";

export async function savePlayerStats(
  playerName: string,
  data: DashboardData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = playerName.trim();
  if (!name) return { ok: false, error: "Pseudo requis." };

  // Vérification de la session — getUser() fait un appel réseau à Supabase,
  // pas juste une lecture locale : on ne peut pas usurper cette vérification.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Non connecté." };

  const row = buildPlayerRow(data);

  // Cherche si ce compte a déjà un joueur en base
  const { data: existing } = await supabaseAdmin
    .from("players")
    .select("player_name")
    .eq("user_id", user.id)
    .maybeSingle();

  let error;
  if (existing) {
    // Le compte a déjà un joueur — on met à jour sa ligne
    ({ error } = await supabaseAdmin
      .from("players")
      .update(row)
      .eq("user_id", user.id));
  } else {
    // Premier upload — on crée la ligne avec user_id et player_name
    ({ error } = await supabaseAdmin
      .from("players")
      .insert({ ...row, player_name: name, user_id: user.id }));
  }

  if (error) {
    console.error("savePlayerStats error:", error);
    return { ok: false, error: "Échec de l'enregistrement." };
  }

  return { ok: true };
}
