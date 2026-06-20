import { describe, it, expect } from "vitest";
import { getPlayerBadges, getUnlockedBadges } from "@/lib/badges";
import { type DashboardData } from "@/lib/types";

// Construit une DashboardData minimale pour les tests
function makeData(overrides: {
  missions?: number[];       // [driller, gunner, engineer, scout]
  kills?: number;
  timeSec?: number;
  downs?: number;
  forgedOC?: number;
}): DashboardData {
  const [d = 0, g = 0, e = 0, s = 0] = overrides.missions ?? [0, 0, 0, 0];
  return {
    player: { name: "Test", perk_points: 0 },
    hero_stats: {
      MS_Killed_TotalEnemies: { label: "Kills", total: overrides.kills ?? 0, by_class: {} },
      MS_TimePlayed:          { label: "Time",  total: overrides.timeSec ?? 0, by_class: {} },
      MS_Death_TotalDowns:    { label: "Downs", total: overrides.downs ?? 0, by_class: {} },
    },
    classes: [
      { name: "Driller",  missions_completed: d, kills: 0, time_played_s: 0, distance_cm: 0, downs: 0 },
      { name: "Gunner",   missions_completed: g, kills: 0, time_played_s: 0, distance_cm: 0, downs: 0 },
      { name: "Engineer", missions_completed: e, kills: 0, time_played_s: 0, distance_cm: 0, downs: 0 },
      { name: "Scout",    missions_completed: s, kills: 0, time_played_s: 0, distance_cm: 0, downs: 0 },
    ],
    mission_stats: {},
    overclocks: {
      forged: [],
      forged_by_dwarf: { Driller: [], Gunner: [], Engineer: [], Scout: [] },
      unforged: [],
      forged_count: overrides.forgedOC ?? 0,
      unforged_count: 0,
    },
  } as unknown as DashboardData;
}

describe("getPlayerBadges", () => {
  it("aucun badge au départ (pas de stats)", () => {
    const data = makeData({});
    const unlocked = getUnlockedBadges(data);
    expect(unlocked).toHaveLength(0);
  });

  it("rock-and-stone : 10 missions", () => {
    const data = makeData({ missions: [10, 0, 0, 0] });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).toContain("rock-and-stone");
  });

  it("deep-veteran : 500 missions", () => {
    const data = makeData({ missions: [500, 0, 0, 0] });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).toContain("deep-veteran");
  });

  it("bug-zapper : 100 000 kills", () => {
    const data = makeData({ kills: 100_000 });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).toContain("bug-zapper");
  });

  it("karls-chosen : 1 000 000 kills", () => {
    const data = makeData({ kills: 1_000_000 });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).toContain("karls-chosen");
    expect(ids).toContain("bug-zapper"); // aussi unlocked
  });

  it("underground : 100 heures", () => {
    const data = makeData({ timeSec: 100 * 3600 });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).toContain("underground");
  });

  it("forge-master : 100 OC", () => {
    const data = makeData({ forgedOC: 100 });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).toContain("forge-master");
    expect(ids).toContain("full-arsenal");
    expect(ids).toContain("gear-head");
  });

  it("jack-of-all-trades : 50 missions dans chaque classe", () => {
    const data = makeData({ missions: [50, 50, 50, 50] });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).toContain("jack-of-all-trades");
  });

  it("jack-of-all-trades : pas unlocked si une classe < 50", () => {
    const data = makeData({ missions: [50, 50, 50, 49] });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).not.toContain("jack-of-all-trades");
  });

  it("main-driller : 40%+ des missions en Driller (sur 100+ total)", () => {
    // 60 driller / 150 total = 40%
    const data = makeData({ missions: [60, 30, 30, 30] });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).toContain("main-driller");
  });

  it("main-driller : pas unlocked si < 100 missions au total", () => {
    // 40% mais seulement 50 missions
    const data = makeData({ missions: [20, 10, 10, 10] });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).not.toContain("main-driller");
  });

  it("main-driller : pas unlocked si ratio < 40%", () => {
    // 35 / 100 = 35%
    const data = makeData({ missions: [35, 35, 15, 15] });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).not.toContain("main-driller");
  });

  it("iron-dwarf : downs / missions <= 0.5 sur 50+ missions", () => {
    // 25 downs / 100 missions = 0.25 <= 0.5
    const data = makeData({ missions: [100, 0, 0, 0], downs: 25 });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).toContain("iron-dwarf");
  });

  it("iron-dwarf : pas unlocked si ratio > 0.5", () => {
    // 60 downs / 100 missions = 0.6 > 0.5
    const data = makeData({ missions: [100, 0, 0, 0], downs: 60 });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).not.toContain("iron-dwarf");
  });

  it("iron-dwarf : pas unlocked si < 50 missions", () => {
    const data = makeData({ missions: [49, 0, 0, 0], downs: 0 });
    const ids = getUnlockedBadges(data).map((b) => b.id);
    expect(ids).not.toContain("iron-dwarf");
  });

  it("tous les badges sont présents dans la liste complète", () => {
    const data = makeData({});
    const all = getPlayerBadges(data);
    expect(all.length).toBeGreaterThan(10);
    // Vérifie que chaque badge a les champs attendus
    all.forEach((b) => {
      expect(b.id).toBeTruthy();
      expect(b.labelKey).toBeTruthy();
      expect(b.descKey).toBeTruthy();
      expect(["bronze", "silver", "gold"]).toContain(b.tier);
      expect(typeof b.unlocked).toBe("boolean");
    });
  });
});
