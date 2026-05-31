// buildPlayerRow.ts — Transforme les données du dashboard en colonnes Supabase.
//
// IMPORTANT : cette fonction n'inclut NI player_name NI pin_hash.
// Ces deux colonnes sont gérées exclusivement côté serveur (voir app/actions/savePlayerStats.ts),
// car ce sont elles qui portent la sécurité (à qui appartient la ligne, et son PIN).

import { DashboardData } from "./types";

export function buildPlayerRow(data: DashboardData): Record<string, unknown> {
  const driller = data.classes.find((c) => c.name === "Driller");
  const gunner = data.classes.find((c) => c.name === "Gunner");
  const engineer = data.classes.find((c) => c.name === "Engineer");
  const scout = data.classes.find((c) => c.name === "Scout");

  return {
    perk_points: data.player.perk_points,

    // Stats globales (Math.round car les floats Unreal ne passent pas en integer/bigint)
    total_missions: Math.round(data.hero_stats.MS_Completed_TotalMissions?.total ?? 0),
    total_kills: Math.round(data.hero_stats.MS_Killed_TotalEnemies?.total ?? 0),
    total_time_s: Math.round(data.hero_stats.MS_TimePlayed?.total ?? 0),
    total_distance_cm: Math.round(data.hero_stats.MS_DistanceTravelled?.total ?? 0),
    total_downs: Math.round(data.hero_stats.MS_Death_TotalDowns?.total ?? 0),
    total_minerals: Math.round(data.hero_stats.MS_Mined_TotalMinerals?.total ?? 0),

    // Missions par classe
    driller_missions: Math.round(driller?.missions_completed ?? 0),
    gunner_missions: Math.round(gunner?.missions_completed ?? 0),
    engineer_missions: Math.round(engineer?.missions_completed ?? 0),
    scout_missions: Math.round(scout?.missions_completed ?? 0),

    // Kills par classe
    driller_kills: Math.round(driller?.kills ?? 0),
    gunner_kills: Math.round(gunner?.kills ?? 0),
    engineer_kills: Math.round(engineer?.kills ?? 0),
    scout_kills: Math.round(scout?.kills ?? 0),

    // Temps par classe (secondes)
    driller_time_s: Math.round(driller?.time_played_s ?? 0),
    gunner_time_s: Math.round(gunner?.time_played_s ?? 0),
    engineer_time_s: Math.round(engineer?.time_played_s ?? 0),
    scout_time_s: Math.round(scout?.time_played_s ?? 0),

    // Distance par classe (centimètres)
    driller_distance_cm: Math.round(driller?.distance_cm ?? 0),
    gunner_distance_cm: Math.round(gunner?.distance_cm ?? 0),
    engineer_distance_cm: Math.round(engineer?.distance_cm ?? 0),
    scout_distance_cm: Math.round(scout?.distance_cm ?? 0),

    // Downs par classe
    driller_downs: Math.round(driller?.downs ?? 0),
    gunner_downs: Math.round(gunner?.downs ?? 0),
    engineer_downs: Math.round(engineer?.downs ?? 0),
    scout_downs: Math.round(scout?.downs ?? 0),

    // Overclocks
    forged_overclocks: data.overclocks.forged_count,
    unforged_overclocks: data.overclocks.unforged_count,

    // Abyss Bar
    bartender_tips: Math.floor(data.mission_stats["MS_BartenderTips"]?.total ?? 0),
    beers_consumed: Math.floor(data.mission_stats["MS_Drinkable_TotalConsumed"]?.total ?? 0),
    rounds_ordered: Math.floor(data.mission_stats["MS_Drinkable_TotalRoundsOrdered"]?.total ?? 0),

    // JSON complet — filet de sécurité pour les évolutions futures
    raw_data: data,
  };
}
