"use client";
import { useEffect, useState } from "react";
import ClassPieChart from "@/components/ClassPieChart";
import { DashboardData } from "@/lib/types";
import ClassCard from "@/components/ClassCard";
import HeroStats from "@/components/HeroStats";
import OverclockList from "@/components/OverclockList";
import MissionStats from "@/components/MissionStats";
import { supabase } from "@/lib/supabase";
import { getPrefs } from "@/lib/preferences";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedStatKey, setSelectedStatKey] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    const raw = sessionStorage.getItem("dashboardData");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const dashboardData = parsed.data as DashboardData;
    setData(dashboardData);
    setIsDemo(sessionStorage.getItem("isDemo") === "true");
    async function saveToSupabase() {
      const isDemo = sessionStorage.getItem("isDemo") === "true";

      if (getPrefs().showOnLeaderboard && !isDemo) {
        const driller = dashboardData.classes.find((c) => c.name === "Driller");
        const gunner = dashboardData.classes.find((c) => c.name === "Gunner");
        const engineer = dashboardData.classes.find(
          (c) => c.name === "Engineer",
        );
        const scout = dashboardData.classes.find((c) => c.name === "Scout");
        const { error } = await supabase.from("players").upsert(
          {
            // Normalisation en majuscules — évite les doublons si la casse change entre deux uploads
            player_name: dashboardData.player.name.trim().toUpperCase(),
            perk_points: dashboardData.player.perk_points,

            // Stats globales (depuis hero_stats)
            total_missions:
              dashboardData.hero_stats.MS_Completed_TotalMissions?.total ?? 0,
            total_kills:
              dashboardData.hero_stats.MS_Killed_TotalEnemies?.total ?? 0,
            total_time_s: dashboardData.hero_stats.MS_TimePlayed?.total ?? 0,
            total_distance_cm:
              dashboardData.hero_stats.MS_DistanceTravelled?.total ?? 0,
            total_downs:
              dashboardData.hero_stats.MS_Death_TotalDowns?.total ?? 0,
            total_minerals:
              dashboardData.hero_stats.MS_Mined_TotalMinerals?.total ?? 0,

            // Missions par classe
            driller_missions: driller?.missions_completed ?? 0,
            gunner_missions: gunner?.missions_completed ?? 0,
            engineer_missions: engineer?.missions_completed ?? 0,
            scout_missions: scout?.missions_completed ?? 0,

            // Kills par classe
            driller_kills: driller?.kills ?? 0,
            gunner_kills: gunner?.kills ?? 0,
            engineer_kills: engineer?.kills ?? 0,
            scout_kills: scout?.kills ?? 0,

            // Temps par classe (en secondes)
            driller_time_s: driller?.time_played_s ?? 0,
            gunner_time_s: gunner?.time_played_s ?? 0,
            engineer_time_s: engineer?.time_played_s ?? 0,
            scout_time_s: scout?.time_played_s ?? 0,

            // Distance par classe (en centimètres)
            driller_distance_cm: driller?.distance_cm ?? 0,
            gunner_distance_cm: gunner?.distance_cm ?? 0,
            engineer_distance_cm: engineer?.distance_cm ?? 0,
            scout_distance_cm: scout?.distance_cm ?? 0,

            // Downs par classe
            driller_downs: driller?.downs ?? 0,
            gunner_downs: gunner?.downs ?? 0,
            engineer_downs: engineer?.downs ?? 0,
            scout_downs: scout?.downs ?? 0,

            // Overclocks
            forged_overclocks: dashboardData.overclocks.forged_count,
            unforged_overclocks: dashboardData.overclocks.unforged_count,

            // Abyss Bar
            bartender_tips: Math.floor(
              dashboardData.mission_stats["MS_BartenderTips"]?.total ?? 0,
            ),
            beers_consumed: Math.floor(
              dashboardData.mission_stats["MS_Drinkable_TotalConsumed"]
                ?.total ?? 0,
            ),
            rounds_ordered: Math.floor(
              dashboardData.mission_stats["MS_Drinkable_TotalRoundsOrdered"]
                ?.total ?? 0,
            ),

            // JSON complet — filet de sécurité pour les évolutions futures
            raw_data: dashboardData,
          },
          { onConflict: "player_name" },
        );
        if (error) console.error("Supabase insert error:", error);
        else console.log("Saved to Supabase!");
      }
    }

    saveToSupabase();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      {data && (
        <>
          {isDemo && (
            <div className="border-l-4 border-drg-orange px-4 py-2 font-mono text-xs text-on-surface-variant tracking-widest flex items-center gap-3 bg-surface-container">
              <span className="material-symbols-outlined text-drg-orange text-sm">
                info
              </span>
              DEMO — DONNÉES DE {data.player.name.toUpperCase()} · UPLOADEZ
              VOTRE SAVE POUR VOIR VOS STATS
            </div>
          )}
          <HeroStats
            heroStats={data.hero_stats}
            selectedStatKey={selectedStatKey}
            onStatClick={setSelectedStatKey}
          />
          <div className="grid grid-cols-3 gap-6 items-start">
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {data.classes.map((classData) => (
                <ClassCard key={classData.name} classData={classData} />
              ))}
            </div>
            <ClassPieChart
              heroStats={data.hero_stats}
              selectedStatKey={selectedStatKey}
            />
          </div>
          <MissionStats missionStats={data.mission_stats} />
          <OverclockList overclocks={data.overclocks} />
        </>
      )}
    </div>
  );
}
