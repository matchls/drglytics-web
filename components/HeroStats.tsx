import { DashboardData } from "@/lib/types";

interface Props {
  heroStats: DashboardData["hero_stats"];
}

export default function HeroStats({ heroStats }: Props) {
  const stats = [
    {
      label: "MISSIONS",
      value: (
        heroStats.MS_Completed_TotalMissions?.total ?? 0
      ).toLocaleString(),
    },
    {
      label: "KILLS",
      value: (heroStats.MS_Killed_TotalEnemies?.total ?? 0).toLocaleString(),
    },
    {
      label: "HOURS",
      value: Math.floor((heroStats.MS_TimePlayed?.total ?? 0) / 3600) + "h",
    },
    {
      label: "DISTANCE",
      value:
        Math.floor((heroStats.MS_DistanceTravelled?.total ?? 0) / 100000) +
        " km",
    },
    {
      label: "MINERALS",
      value: (heroStats.MS_Mined_TotalMinerals?.total ?? 0).toLocaleString(),
    },
    {
      label: "DOWNS",
      value: (heroStats.MS_Death_TotalDowns?.total ?? 0).toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-6 gap-4 mt-6">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="industrial-panel pressed-metal p-4 text-center"
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
