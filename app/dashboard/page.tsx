"use client";
import { useEffect, useState } from "react";
import { DashboardData } from "@/lib/types";
import ClassCard from "@/components/ClassCard";
import HeroStats from "@/components/HeroStats";
import OverclockList from "@/components/OverclockList";
import MissionStats from "@/components/MissionStats";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("dashboardData");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    setData(parsed.data);
  }, []);

  return (
    <div className="min-h-screen bg-drg-dark text-white p-8">
      {data && (
        <>
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
        </>
      )}
    </div>
  );
}
