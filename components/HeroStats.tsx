"use client";
import { DashboardData } from "@/lib/types";
import { usePrefs } from "@/lib/PrefsContext";
import { formatDistance } from "@/lib/formatters";
import { useTranslation } from "@/lib/i18n";

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
  const { prefs } = usePrefs();
  const t = useTranslation();
  const stats = [
    {
      key: "MS_Completed_TotalMissions",
      label: t("catMissions"),
      value: (
        heroStats.MS_Completed_TotalMissions?.total ?? 0
      ).toLocaleString(),
    },
    {
      key: "MS_Killed_TotalEnemies",
      label: t("catKills"),
      value: (heroStats.MS_Killed_TotalEnemies?.total ?? 0).toLocaleString(),
    },
    {
      key: "MS_TimePlayed",
      label: t("timeFormatHours"),
      value: Math.floor((heroStats.MS_TimePlayed?.total ?? 0) / 3600),
    },
    {
      key: "MS_DistanceTravelled",
      label: prefs.distanceUnit.toUpperCase(), // "KM" ou "MI" — unité universelle, pas besoin de traduire
      value: formatDistance(
        heroStats.MS_DistanceTravelled?.total ?? 0,
        prefs,
        false,
      ),
    },
    {
      key: "MS_Death_TotalDowns",
      label: t("downs"),
      value: (heroStats.MS_Death_TotalDowns?.total ?? 0).toLocaleString(),
    },
    {
      key: "MS_Mined_TotalMinerals",
      label: t("minerals"),
      value: Math.floor(
        heroStats.MS_Mined_TotalMinerals?.total ?? 0,
      ).toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4 mt-6">
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
