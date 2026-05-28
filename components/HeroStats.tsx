"use client";
import { DashboardData } from "@/lib/types";

interface Props {
  heroStats: DashboardData["hero_stats"];
  selectedStatKey: string | null;
  onStatClick: (key: string) => void;
}

export default function HeroStats({
  heroStats,
  selectedStatKey,
  onStatClick,
}: Props) {
  const stats = [
    {
      key: "MS_Completed_TotalMissions",
      label: "MISSIONS",
      value: (
        heroStats.MS_Completed_TotalMissions?.total ?? 0
      ).toLocaleString(),
    },
    {
      key: "MS_Killed_TotalEnemies",
      label: "KILLS",
      value: (heroStats.MS_Killed_TotalEnemies?.total ?? 0).toLocaleString(),
    },
    {
      key: "MS_TimePlayed",
      label: "HOURS",
      value: Math.floor((heroStats.MS_TimePlayed?.total ?? 0) / 3600) + " h",
    },
    {
      key: "MS_DistanceTravelled",
      label: "DISTANCE",
      value:
        Math.floor((heroStats.MS_DistanceTravelled?.total ?? 0) / 100000) +
        " km",
    },
    {
      key: "MS_Death_TotalDowns",
      label: "DOWNS",
      value: (heroStats.MS_Death_TotalDowns?.total ?? 0).toLocaleString(),
    },
    {
      key: "MS_Mined_TotalMinerals",
      label: "MINERALS",
      value: Math.floor(
        heroStats.MS_Mined_TotalMinerals?.total ?? 0,
      ).toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-6 gap-4 mt-6">
      {stats.map(({ key, label, value }) => (
        <div
          key={label}
          onClick={() => onStatClick(key)}
          className={`industrial-panel pressed-metal p-4 text-center cursor-pointer transition-colors ${
            selectedStatKey === key
              ? "border-2 border-drg-orange"
              : "hover:border hover:border-drg-orange"
          }`}
        >
          <p className="font-display text-4xl text-primary">{value}</p>
          <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
