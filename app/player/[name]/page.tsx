"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPlayerProfile } from "@/app/actions/getPlayerProfile";
import { DashboardData } from "@/lib/types";
import HeroStats from "@/components/HeroStats";
import ClassCard from "@/components/ClassCard";
import MissionStats from "@/components/MissionStats";
import OverclockList from "@/components/OverclockList";

export default function PlayerProfilePage() {
  const params = useParams();
  const playerName = decodeURIComponent(params.name as string);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatKey, setSelectedStatKey] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayer() {
      const profile = await getPlayerProfile(playerName);
      if (!profile) setError("Miner not found in Company records.");
      else setData(profile);
      setLoading(false);
    }
    fetchPlayer();
  }, [playerName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-on-surface-variant tracking-widest animate-pulse">
          ACCESSING PERSONNEL FILE...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-error tracking-widest">
          ⚠ {error ?? "UNKNOWN ERROR"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      {/* Header — dossier du personnel */}
      <div className="industrial-panel p-6 flex flex-col gap-1">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          PERSONNEL FILE — CLASSIFIED
        </p>
        <p className="font-display text-4xl text-primary tracking-widest">
          {data.player.name.toUpperCase()}
        </p>
      </div>

      {/* Stats globales */}
      <HeroStats
        heroStats={data.hero_stats}
        selectedStatKey={selectedStatKey}
        onStatClick={setSelectedStatKey}
      />

      {/* Cards par classe */}
      <div className="grid grid-cols-2 gap-4">
        {data.classes.map((classData) => (
          <ClassCard key={classData.name} classData={classData} />
        ))}
      </div>

      {/* Stats de mission */}
      <MissionStats missionStats={data.mission_stats} />

      {/* Overclocks */}
      <OverclockList overclocks={data.overclocks} />
    </div>
  );
}
