"use server";
// Classement mensuel basé sur les deltas de player_snapshots (30 derniers jours).
// Principe : pour chaque joueur, on prend le snapshot le plus ancien et le plus
// récent dans la fenêtre de 30 jours, et on calcule la différence de stats.
// Il faut au moins 2 snapshots pour apparaître dans ce classement.
import { supabaseAdmin } from "@/lib/supabaseServer";

export type MonthlyEntry = {
  player_name: string;
  missions: number;
  kills: number;
  time_s: number;
  oc: number;
};

export async function getMonthlyLeaderboard(days = 30): Promise<MonthlyEntry[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("player_snapshots")
    .select(
      "user_id, player_name, total_missions, total_kills, total_time_s, forged_overclocks, created_at",
    )
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return [];

  // Grouper par user_id — chaque clé contient la liste ordonnée de snapshots
  const byUser = new Map<string, typeof data>();
  for (const row of data) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, []);
    byUser.get(row.user_id)!.push(row);
  }

  return [...byUser.values()]
    .filter((rows) => rows.length >= 2)
    .map((rows) => {
      const first = rows[0];
      const last = rows[rows.length - 1];
      return {
        player_name: last.player_name,
        missions: Math.max(0, last.total_missions - first.total_missions),
        kills: Math.max(0, last.total_kills - first.total_kills),
        time_s: Math.max(0, last.total_time_s - first.total_time_s),
        oc: Math.max(0, last.forged_overclocks - first.forged_overclocks),
      };
    })
    .filter((e) => e.missions > 0 || e.kills > 0)
    .sort((a, b) => b.missions - a.missions);
}
