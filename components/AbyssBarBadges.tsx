import { DashboardData } from "@/lib/types";
import { ABYSS_BADGE_THRESHOLDS } from "@/lib/ranks";
import { useTranslation, TranslationKey } from "@/lib/i18n";

interface Badge {
  id: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  unlocked: boolean;
}

interface Props {
  data: DashboardData;
}

export default function AbyssBarBadges({ data }: Props) {
  const t = useTranslation();
  // Valeurs précalculées pour les conditions
  const totalMissions = data.classes.reduce(
    (sum, c) => sum + c.missions_completed,
    0,
  );
  const totalKills = Math.floor(
    data.hero_stats.MS_Killed_TotalEnemies?.total ?? 0,
  );
  const totalHours = Math.floor(
    (data.hero_stats.MS_TimePlayed?.total ?? 0) / 3600,
  );
  const forgedCount = data.overclocks.forged_count;
  const allClassesAt50 = data.classes.every(
    (c) => c.missions_completed >= ABYSS_BADGE_THRESHOLDS.jackOfAllTrades,
  );

  const badges: Badge[] = [
    {
      id: "rock-and-stone",
      labelKey: "badgeRockAndStone",
      descKey: "badgeRockAndStoneDesc",
      unlocked: totalMissions >= ABYSS_BADGE_THRESHOLDS.rockAndStone,
    },
    {
      id: "veteran",
      labelKey: "badgeDeepVeteran",
      descKey: "badgeDeepVeteranDesc",
      unlocked: totalMissions >= ABYSS_BADGE_THRESHOLDS.deepVeteran,
    },
    {
      id: "bug-zapper",
      labelKey: "badgeBugZapper",
      descKey: "badgeBugZapperDesc",
      unlocked: totalKills >= ABYSS_BADGE_THRESHOLDS.bugZapper,
    },
    {
      id: "karls-chosen",
      labelKey: "badgeKarlsChosen",
      descKey: "badgeKarlsChosenDesc",
      unlocked: totalKills >= ABYSS_BADGE_THRESHOLDS.karlsChosen,
    },
    {
      id: "underground",
      labelKey: "badgeUnderground",
      descKey: "badgeUndergroundDesc",
      unlocked: totalHours >= ABYSS_BADGE_THRESHOLDS.underground,
    },
    {
      id: "legend",
      labelKey: "badgeLegend",
      descKey: "badgeLegendDesc",
      unlocked: totalHours >= ABYSS_BADGE_THRESHOLDS.legend,
    },
    {
      id: "gear-head",
      labelKey: "badgeGearHead",
      descKey: "badgeGearHeadDesc",
      unlocked: forgedCount >= ABYSS_BADGE_THRESHOLDS.gearHead,
    },
    {
      id: "full-arsenal",
      labelKey: "badgeFullArsenal",
      descKey: "badgeFullArsenalDesc",
      unlocked: forgedCount >= ABYSS_BADGE_THRESHOLDS.fullArsenal,
    },
    {
      id: "jack-of-all-trades",
      labelKey: "badgeJackOfAllTrades",
      descKey: "badgeJackOfAllTradesDesc",
      unlocked: allClassesAt50,
    },
  ];

  return (
    <div className="industrial-panel p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b-4 border-outline pb-3">
        <span className="material-symbols-outlined text-primary">
          military_tech
        </span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          {t("badgesTitle")}
        </p>
      </div>

      {/* Grille de badges */}
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`border p-3 flex flex-col gap-1 transition-opacity ${
              badge.unlocked
                ? "border-drg-orange bg-surface-container-highest"
                : "border-drg-border opacity-35"
            }`}
          >
            <p
              className={`font-display text-sm tracking-widest ${badge.unlocked ? "text-drg-orange" : "text-on-surface-variant"}`}
            >
              {t(badge.labelKey)}
            </p>
            <p className="font-mono text-xs text-on-surface-variant">
              {t(badge.descKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
