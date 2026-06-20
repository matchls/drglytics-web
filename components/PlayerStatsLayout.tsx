"use client";
import { useState } from "react";
import HeroStats from "@/components/HeroStats";
import ClassCard from "@/components/ClassCard";
import ClassPieChart from "@/components/ClassPieChart";
import MissionStats from "@/components/MissionStats";
import OverclockList from "@/components/OverclockList";
import PlayerBadges from "@/components/PlayerBadges";
import { DashboardData } from "@/lib/types";

interface PlayerStatsLayoutProps {
  data: DashboardData;
  header?: React.ReactNode;
  showPieChart?: boolean;
}

export default function PlayerStatsLayout({
  data,
  header,
  showPieChart = false,
}: PlayerStatsLayoutProps) {
  const [selectedStatKey, setSelectedStatKey] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 flex flex-col gap-4 md:gap-6">
      {header}
      <HeroStats
        heroStats={data.hero_stats}
        selectedStatKey={selectedStatKey}
        onStatClick={setSelectedStatKey}
      />
      {showPieChart ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.classes.map((classData) => (
              <ClassCard key={classData.name} classData={classData} />
            ))}
          </div>
          <ClassPieChart
            heroStats={data.hero_stats}
            selectedStatKey={selectedStatKey}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.classes.map((classData) => (
            <ClassCard key={classData.name} classData={classData} />
          ))}
        </div>
      )}
      <PlayerBadges data={data} />
      <MissionStats missionStats={data.mission_stats} />
      <OverclockList overclocks={data.overclocks} />
    </div>
  );
}
