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
    <div className="min-h-screen bg-drg-dark text-white p-8">
      {data && (
        <div className="max-w-7xl mx-auto">
          <h1 className="text-drg-orange text-4xl font-bold uppercase tracking-widest">
            {data.player.name}
          </h1>
          <HeroStats heroStats={data.hero_stats} />
          <div className="grid grid-cols-2 gap-4 mt-8">
            {data.classes.map((classData) => (
              <ClassCard key={classData.name} classData={classData} />
            ))}
          </div>
          <OverclockList overclocks={data.overclocks} />
          <MissionStats missionStats={data.mission_stats} />
        </div>
      )}
    </div>
  );
}
