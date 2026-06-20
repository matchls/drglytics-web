// lib/data/players.ts — Couche d'accès aux données : table `players` (lectures anon).
//
// Analogie : c'est le "guichet" de la table players. Les composants ne parlent
// plus directement à Supabase ; ils demandent au guichet (fetchLeaderboard, etc.).
// Avantage : les noms de colonnes et la forme des requêtes vivent à UN seul endroit.
//
// ⚠️ Lectures anon UNIQUEMENT (clé publique, exécutables côté navigateur).
// La lecture de `raw_data` reste côté serveur via la server action getPlayerProfile
// (service_role) — voir app/actions/getPlayerProfile.ts. On ne la déplace pas ici
// pour ne pas tirer la clé service_role dans le bundle client.

import { supabase } from "@/lib/supabase";
import { type SortKey, VALID_SORT_KEYS } from "@/lib/leaderboard";

// Type partagé d'une ligne du leaderboard (projection des colonnes utiles de `players`).
export interface PlayerRow {
  player_name: string;
  total_missions: number;
  total_kills: number;
  total_time_s: number;
  total_distance_cm: number;
  total_downs: number;
  total_minerals: number;
  driller_missions: number;
  gunner_missions: number;
  engineer_missions: number;
  scout_missions: number;
}

// Colonnes du leaderboard — jamais `.select("*")` (raw_data est lourd, cf. CLAUDE.md).
const LEADERBOARD_COLUMNS =
  "player_name, total_missions, total_kills, total_time_s, total_distance_cm, total_downs, total_minerals, driller_missions, gunner_missions, engineer_missions, scout_missions";

export const LEADERBOARD_PAGE_SIZE = 50;

export interface LeaderboardParams {
  sortKey?: SortKey;
  ascending?: boolean;
  page?: number;
  pageSize?: number;
}

// Leaderboard paginé, trié côté Supabase.
// Retourne au plus pageSize joueurs (défaut 50), jamais toute la table.
export async function fetchLeaderboard(params: LeaderboardParams = {}): Promise<PlayerRow[]> {
  const {
    sortKey = "total_missions",
    ascending = false,
    page = 0,
    pageSize = LEADERBOARD_PAGE_SIZE,
  } = params;

  // Whitelist défensive : si la clé n'est pas autorisée, on replie sur missions
  const safeKey = VALID_SORT_KEYS.includes(sortKey) ? sortKey : "total_missions";

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("players")
    .select(LEADERBOARD_COLUMNS)
    .eq("visible_on_leaderboard", true)
    .order(safeKey, { ascending })
    .range(from, to);

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

export interface CommunityTotals {
  kills: number;
  missions: number;
}

// Agrégats communautaires pour BountyTargets — projection minimale (2 colonnes).
// Ne charge pas le leaderboard paginé pour ne pas mélanger les deux besoins.
export async function fetchCommunityTotals(): Promise<CommunityTotals> {
  const { data, error } = await supabase
    .from("players")
    .select("total_kills, total_missions")
    .eq("visible_on_leaderboard", true);

  if (error) {
    console.error(error);
    return { kills: 0, missions: 0 };
  }

  const rows = data ?? [];
  return {
    kills: rows.reduce((sum, p) => sum + p.total_kills, 0),
    missions: rows.reduce((sum, p) => sum + p.total_missions, 0),
  };
}

// Une "mention spéciale" : le joueur en tête d'une stat et sa valeur.
export interface HonorRollEntry {
  playerName: string | null;
  value: number;
}

// Mentions spéciales de l'Abyss Bar (top 1 de chaque stat de bar).
export interface HonorRoll {
  tips: HonorRollEntry;
  beers: HonorRollEntry;
  rounds: HonorRollEntry;
}

// Récupère le leader de chaque stat de bar (une requête par stat, en parallèle).
export async function fetchHonorRoll(): Promise<HonorRoll> {
  const [tips, beers, rounds] = await Promise.all([
    supabase
      .from("players")
      .select("player_name, bartender_tips")
      .eq("visible_on_leaderboard", true)
      .order("bartender_tips", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("players")
      .select("player_name, beers_consumed")
      .eq("visible_on_leaderboard", true)
      .order("beers_consumed", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("players")
      .select("player_name, rounds_ordered")
      .eq("visible_on_leaderboard", true)
      .order("rounds_ordered", { ascending: false })
      .limit(1)
      .single(),
  ]);

  return {
    tips: {
      playerName: tips.data?.player_name ?? null,
      value: tips.data?.bartender_tips ?? 0,
    },
    beers: {
      playerName: beers.data?.player_name ?? null,
      value: beers.data?.beers_consumed ?? 0,
    },
    rounds: {
      playerName: rounds.data?.player_name ?? null,
      value: rounds.data?.rounds_ordered ?? 0,
    },
  };
}
