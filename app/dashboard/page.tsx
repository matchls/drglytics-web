"use client";
import { useEffect, useState } from "react";
import ClassPieChart from "@/components/ClassPieChart";
import { DashboardData } from "@/lib/types";
import ClassCard from "@/components/ClassCard";
import HeroStats from "@/components/HeroStats";
import OverclockList from "@/components/OverclockList";
import MissionStats from "@/components/MissionStats";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedStatKey, setSelectedStatKey] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    const raw = sessionStorage.getItem("dashboardData");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    setData(parsed.data as DashboardData);
    setIsDemo(sessionStorage.getItem("isDemo") === "true");
    // L'enregistrement en base se fait désormais à l'upload
    // (UploadForm → savePlayerStats), côté serveur et après vérification du PIN.
    // Cette page ne fait plus qu'afficher les données de la session.
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
