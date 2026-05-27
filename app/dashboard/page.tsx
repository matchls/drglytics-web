"use client";
import { useEffect, useState } from "react";
import { DashboardData } from "@/lib/types";
import ClassCard from "@/components/ClassCard";
import HeroStats from "@/components/HeroStats";
import OverclockList from "@/components/OverclockList";
import MissionStats from "@/components/MissionStats";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    console.log("useEffect déclenché");
    const raw = sessionStorage.getItem("dashboardData");
    console.log("raw:", raw ? "données présentes" : "vide");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const dashboardData = parsed.data;
    setData(dashboardData);

    // Sauvegarder dans Supabase
    async function saveToSupabase() {
      console.log("Calling Supabase insert...");
      const { error } = await supabase.from("players").upsert(
        {
          player_name: dashboardData.player.name,
          total_missions:
            dashboardData.hero_stats.MS_Completed_TotalMissions?.total ?? 0,
          total_kills:
            dashboardData.hero_stats.MS_Killed_TotalEnemies?.total ?? 0,
          total_time_s: dashboardData.hero_stats.MS_TimePlayed?.total ?? 0,
          total_distance_cm:
            dashboardData.hero_stats.MS_DistanceTravelled?.total ?? 0,
          total_downs: dashboardData.hero_stats.MS_Death_TotalDowns?.total ?? 0,
          total_minerals:
            dashboardData.hero_stats.MS_Mined_TotalMinerals?.total ?? 0,
          driller_missions:
            dashboardData.classes.find(
              (c: { name: string }) => c.name === "Driller",
            )?.missions_completed ?? 0,
          gunner_missions:
            dashboardData.classes.find(
              (c: { name: string }) => c.name === "Gunner",
            )?.missions_completed ?? 0,
          engineer_missions:
            dashboardData.classes.find(
              (c: { name: string }) => c.name === "Engineer",
            )?.missions_completed ?? 0,
          scout_missions:
            dashboardData.classes.find(
              (c: { name: string }) => c.name === "Scout",
            )?.missions_completed ?? 0,
        },
        { onConflict: "player_name" },
      );
      if (error) console.error("Supabase insert error:", error);
      else console.log("Saved to Supabase!");
    }

    saveToSupabase();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      {data && (
        <>
          {/* KPI Row */}
          <HeroStats heroStats={data.hero_stats} />

          {/* Grille principale */}
          <div className="grid grid-cols-3 gap-6">
            {/* Class Grid 2x2 */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {data.classes.map((classData) => (
                <ClassCard key={classData.name} classData={classData} />
              ))}
            </div>

            {/* Sidebar droite */}
            <div className="flex flex-col gap-4">
              {/* Recent Expeditions */}
              <div className="industrial-panel p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 border-b-4 border-outline pb-3">
                  <span className="material-symbols-outlined text-primary">
                    history
                  </span>
                  <p className="font-display text-lg text-on-surface tracking-widest">
                    RECENT EXPEDITIONS
                  </p>
                </div>
                <p className="font-mono text-xs text-on-surface-variant tracking-widest text-center py-4">
                  DATA UNAVAILABLE — SYSTEM OFFLINE
                </p>
              </div>

              {/* Forge Status */}
              <div className="flex-1">
                <OverclockList overclocks={data.overclocks} />
              </div>
            </div>
          </div>

          {/* Employee Performance Report */}
          <MissionStats missionStats={data.mission_stats} />
        </>
      )}
    </div>
  );
}
