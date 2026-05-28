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

  useEffect(() => {
    const raw = sessionStorage.getItem("dashboardData");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const dashboardData = parsed.data;
    setData(dashboardData);

    async function saveToSupabase() {
      if (getPrefs().showOnLeaderboard) {
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
            total_downs:
              dashboardData.hero_stats.MS_Death_TotalDowns?.total ?? 0,
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
