"use server";
// claimProfile — Permet à un utilisateur connecté de réclamer un profil
// existant dont user_id est NULL, en prouvant qu'il possède le save file.
//
// Sécurité :
// - Seul un utilisateur authentifié peut initier un claim.
// - L'utilisateur ne doit pas déjà avoir un profil lié.
// - Le profil cible doit avoir user_id = NULL.
// - Les stats uploadées doivent être >= aux stats stockées (un vrai joueur
//   ne peut pas avoir moins de missions que son profil historique).
// - Le multiplicateur max de 5× évite qu'un joueur très avancé claim
//   un profil bas niveau avec des stats "supérieures".
// - L'UPDATE utilise AND user_id IS NULL → atomique contre les race conditions.

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { type DashboardData } from "@/lib/types";

export type ProfileOwnership = {
  isClaimed: boolean;
  isLoggedIn: boolean;
  isOwner: boolean;
  userHasOtherProfile: boolean;
};

export type ClaimResult =
  | { ok: true }
  | { ok: false; error: "not_logged_in" | "already_claimed" | "user_has_profile" | "stats_mismatch" | "not_found" | "db_error" };

// Échappe les caractères spéciaux ILIKE pour éviter les injections via pseudo
function escapeLike(name: string): string {
  return name.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function getProfileOwnership(playerName: string): Promise<ProfileOwnership> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: row } = await supabaseAdmin
    .from("players")
    .select("user_id")
    .ilike("player_name", escapeLike(playerName))
    .maybeSingle();

  if (!row) {
    return { isClaimed: false, isLoggedIn: !!user, isOwner: false, userHasOtherProfile: false };
  }

  const isClaimed = !!row.user_id;
  const isOwner = isClaimed && user?.id === row.user_id;

  let userHasOtherProfile = false;
  if (user && !isOwner) {
    const { data: existing } = await supabaseAdmin
      .from("players")
      .select("player_name")
      .eq("user_id", user.id)
      .maybeSingle();
    userHasOtherProfile = !!existing;
  }

  return { isClaimed, isLoggedIn: !!user, isOwner, userHasOtherProfile };
}

export async function claimProfile(
  playerName: string,
  uploadedData: DashboardData,
): Promise<ClaimResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_logged_in" };

  // Un compte = un profil
  const { data: existing } = await supabaseAdmin
    .from("players")
    .select("player_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return { ok: false, error: "user_has_profile" };

  // Charge les stats stockées du profil à réclamer
  const { data: stored } = await supabaseAdmin
    .from("players")
    .select("user_id, total_missions, total_kills, forged_overclocks, player_name")
    .ilike("player_name", escapeLike(playerName))
    .maybeSingle();

  if (!stored) return { ok: false, error: "not_found" };
  if (stored.user_id) return { ok: false, error: "already_claimed" };

  // Comparaison des stats uploadées vs stockées
  const uploadMissions = Math.round(uploadedData.hero_stats.MS_Completed_TotalMissions?.total ?? 0);
  const uploadKills = Math.round(uploadedData.hero_stats.MS_Killed_TotalEnemies?.total ?? 0);

  const MAX_GROWTH = 5; // le joueur peut avoir 5× plus de missions depuis le snapshot
  const missionsOk =
    uploadMissions >= stored.total_missions &&
    (stored.total_missions === 0 || uploadMissions <= stored.total_missions * MAX_GROWTH);
  const killsOk =
    uploadKills >= stored.total_kills &&
    (stored.total_kills === 0 || uploadKills <= stored.total_kills * MAX_GROWTH);

  if (!missionsOk || !killsOk) {
    return { ok: false, error: "stats_mismatch" };
  }

  // UPDATE atomique : le WHERE user_id IS NULL garantit qu'un seul claim gagne
  // en cas de requêtes concurrentes pour le même profil.
  const { error: updateError, count } = await supabaseAdmin
    .from("players")
    .update({ user_id: user.id })
    .eq("player_name", stored.player_name)
    .is("user_id", null)
    .select("player_name");

  if (updateError || count === 0) return { ok: false, error: "db_error" };
  return { ok: true };
}
