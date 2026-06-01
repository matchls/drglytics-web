"use server";
// getPlayerProfile — Lecture du profil joueur CÔTÉ SERVEUR (#31, Partie A).
//
// Avant : la page profil et la démo lisaient `raw_data` directement avec la clé
// anon → n'importe qui pouvait moissonner en boucle le JSON intégral de tous les
// joueurs. On route désormais la lecture par le serveur (service_role), et on
// révoque l'accès anon à `raw_data` au niveau base (voir la migration SQL).
//
// On ne renvoie qu'un joueur à la fois, et `raw_data` est typé DashboardData :
// cette structure ne contient que des stats (aucun SteamID ni chemin de fichier).
import { supabaseAdmin } from "@/lib/supabaseServer";
import { DashboardData } from "@/lib/types";

export async function getPlayerProfile(
  rawName: string,
): Promise<DashboardData | null> {
  const name = rawName.trim();
  if (!name) return null;

  const { data } = await supabaseAdmin
    .from("players")
    .select("player_name, raw_data")
    .ilike("player_name", name); // insensible à la casse (un pseudo = une identité)

  // ilike traite % et _ comme des jokers → on reconfirme par une égalité exacte
  // insensible à la casse (fail closed : au pire on ne trouve rien).
  const row = data?.find(
    (p) => p.player_name.toUpperCase() === name.toUpperCase(),
  );

  return (row?.raw_data as DashboardData) ?? null;
}
