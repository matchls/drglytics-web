// lib/badges.ts — Logique de badges centralisée.
//
// Tous les badges sont calculés à la volée depuis DashboardData, sans DB.
// Chaque BadgeDef déclare sa condition en une fonction pure : facile à tester
// et à rééquilibrer en touchant uniquement lib/ranks.ts.

import { DashboardData } from "@/lib/types";
import { ABYSS_BADGE_THRESHOLDS as T } from "@/lib/ranks";
import { type TranslationKey } from "@/lib/i18n";

export type BadgeTier = "bronze" | "silver" | "gold";

export interface Badge {
  id: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  unlocked: boolean;
  tier: BadgeTier;
}

type BadgeDef = Omit<Badge, "unlocked"> & {
  check: (d: DashboardData) => boolean;
};

const BADGE_DEFS: BadgeDef[] = [
  // ── Missions ────────────────────────────────────────────────────────────────
  {
    id: "rock-and-stone",
    tier: "bronze",
    labelKey: "badgeRockAndStone",
    descKey: "badgeRockAndStoneDesc",
    check: (d) => totalMissions(d) >= T.rockAndStone,
  },
  {
    id: "deep-veteran",
    tier: "silver",
    labelKey: "badgeDeepVeteran",
    descKey: "badgeDeepVeteranDesc",
    check: (d) => totalMissions(d) >= T.deepVeteran,
  },

  // ── Kills ───────────────────────────────────────────────────────────────────
  {
    id: "bug-zapper",
    tier: "bronze",
    labelKey: "badgeBugZapper",
    descKey: "badgeBugZapperDesc",
    check: (d) => Math.floor(d.hero_stats.MS_Killed_TotalEnemies?.total ?? 0) >= T.bugZapper,
  },
  {
    id: "karls-chosen",
    tier: "gold",
    labelKey: "badgeKarlsChosen",
    descKey: "badgeKarlsChosenDesc",
    check: (d) => Math.floor(d.hero_stats.MS_Killed_TotalEnemies?.total ?? 0) >= T.karlsChosen,
  },

  // ── Temps ───────────────────────────────────────────────────────────────────
  {
    id: "underground",
    tier: "bronze",
    labelKey: "badgeUnderground",
    descKey: "badgeUndergroundDesc",
    check: (d) => hours(d) >= T.underground,
  },
  {
    id: "legend",
    tier: "gold",
    labelKey: "badgeLegend",
    descKey: "badgeLegendDesc",
    check: (d) => hours(d) >= T.legend,
  },

  // ── Overclocks ──────────────────────────────────────────────────────────────
  {
    id: "gear-head",
    tier: "bronze",
    labelKey: "badgeGearHead",
    descKey: "badgeGearHeadDesc",
    check: (d) => d.overclocks.forged_count >= T.gearHead,
  },
  {
    id: "full-arsenal",
    tier: "silver",
    labelKey: "badgeFullArsenal",
    descKey: "badgeFullArsenalDesc",
    check: (d) => d.overclocks.forged_count >= T.fullArsenal,
  },
  {
    id: "forge-master",
    tier: "gold",
    labelKey: "badgeForgeMaster",
    descKey: "badgeForgeMasterDesc",
    check: (d) => d.overclocks.forged_count >= T.forgeMaster,
  },

  // ── Polyvalence ─────────────────────────────────────────────────────────────
  {
    id: "jack-of-all-trades",
    tier: "gold",
    labelKey: "badgeJackOfAllTrades",
    descKey: "badgeJackOfAllTradesDesc",
    check: (d) => d.classes.every((c) => c.missions_completed >= T.jackOfAllTrades),
  },

  // ── Classe principale ────────────────────────────────────────────────────────
  {
    id: "main-driller",
    tier: "silver",
    labelKey: "badgeMainDriller",
    descKey: "badgeMainDrillerDesc",
    check: (d) => isMainClass(d, "Driller"),
  },
  {
    id: "main-gunner",
    tier: "silver",
    labelKey: "badgeMainGunner",
    descKey: "badgeMainGunnerDesc",
    check: (d) => isMainClass(d, "Gunner"),
  },
  {
    id: "main-engineer",
    tier: "silver",
    labelKey: "badgeMainEngineer",
    descKey: "badgeMainEngineerDesc",
    check: (d) => isMainClass(d, "Engineer"),
  },
  {
    id: "main-scout",
    tier: "silver",
    labelKey: "badgeMainScout",
    descKey: "badgeMainScoutDesc",
    check: (d) => isMainClass(d, "Scout"),
  },

  // ── Survie ──────────────────────────────────────────────────────────────────
  {
    id: "iron-dwarf",
    tier: "silver",
    labelKey: "badgeIronDwarf",
    descKey: "badgeIronDwarfDesc",
    check: (d) => {
      const total = totalMissions(d);
      if (total < T.ironDwarfMinMissions) return false;
      const downs = Math.floor(d.hero_stats.MS_Death_TotalDowns?.total ?? 0);
      return downs / total <= T.ironDwarfMaxRatio;
    },
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function totalMissions(d: DashboardData): number {
  return d.classes.reduce((sum, c) => sum + c.missions_completed, 0);
}

function hours(d: DashboardData): number {
  return Math.floor((d.hero_stats.MS_TimePlayed?.total ?? 0) / 3600);
}

function isMainClass(d: DashboardData, className: string): boolean {
  const total = totalMissions(d);
  if (total < T.mainClassMinMissions) return false;
  const classMissions = d.classes.find((c) => c.name === className)?.missions_completed ?? 0;
  return classMissions / total >= T.mainClassRatio;
}

// ── Export principal ──────────────────────────────────────────────────────────

export function getPlayerBadges(data: DashboardData): Badge[] {
  return BADGE_DEFS.map(({ check, ...def }) => ({
    ...def,
    unlocked: check(data),
  }));
}

export function getUnlockedBadges(data: DashboardData): Badge[] {
  return getPlayerBadges(data).filter((b) => b.unlocked);
}
