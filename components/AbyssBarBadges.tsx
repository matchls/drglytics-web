import { DashboardData } from "@/lib/types";
import { ABYSS_BADGE_THRESHOLDS } from "@/lib/ranks";

interface Badge {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
}

interface Props {
  data: DashboardData;
}

export default function AbyssBarBadges({ data }: Props) {
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

  // TODO : définir les badges ici
  const badges: Badge[] = [
    {
      id: "rock-and-stone",
      label: "ROCK AND STONE",
      description: "10 missions complétées — bienvenue dans les rangs.",
      unlocked: totalMissions >= ABYSS_BADGE_THRESHOLDS.rockAndStone,
    },
    {
      id: "veteran",
      label: "DEEP VETERAN",
      description: "500 missions — Management a noté vos services.",
      unlocked: totalMissions >= ABYSS_BADGE_THRESHOLDS.deepVeteran,
    },
    {
      id: "bug-zapper",
      label: "BUG ZAPPER",
      description: "100 000 ennemis éliminés — efficace.",
      unlocked: totalKills >= ABYSS_BADGE_THRESHOLDS.bugZapper,
    },
    {
      id: "karls-chosen",
      label: "KARL'S CHOSEN",
      description: "1 000 000 éliminations — Karl vous salue.",
      unlocked: totalKills >= ABYSS_BADGE_THRESHOLDS.karlsChosen,
    },
    {
      id: "underground",
      label: "UNDERGROUND",
      description: "100 heures sous Hoxxes IV.",
      unlocked: totalHours >= ABYSS_BADGE_THRESHOLDS.underground,
    },
    {
      id: "legend",
      label: "LEGEND OF THE DEEP",
      description: "1 000 heures. Vous n'avez pas de vie en surface.",
      unlocked: totalHours >= ABYSS_BADGE_THRESHOLDS.legend,
    },
    {
      id: "gear-head",
      label: "GEAR HEAD",
      description: "10 overclocks forgés — l'armurerie vous connaît.",
      unlocked: forgedCount >= ABYSS_BADGE_THRESHOLDS.gearHead,
    },
    {
      id: "full-arsenal",
      label: "FULL ARSENAL",
      description:
        "50 overclocks forgés — vous avez investi dans votre survie.",
      unlocked: forgedCount >= ABYSS_BADGE_THRESHOLDS.fullArsenal,
    },
    {
      id: "jack-of-all-trades",
      label: "JACK OF ALL TRADES",
      description: "50 missions avec chaque classe — un vrai polyvalent.",
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
          COMMENDATIONS
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
              {badge.label}
            </p>
            <p className="font-mono text-xs text-on-surface-variant">
              {badge.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
