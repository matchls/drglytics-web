import { describe, it, expect } from "vitest";
import {
  getBestClass,
  getStatusBadge,
  VALID_SORT_KEYS,
  getPodiumStyle,
} from "@/lib/leaderboard";
import { LEADERBOARD_STATUS_THRESHOLDS } from "@/lib/ranks";
import { type PlayerRow } from "@/lib/data/players";

// Mock minimal de la fonction de traduction : retourne la clé telle quelle
const t = (key: string) => key;

// Mock minimal d'un PlayerRow avec les champs utilisés par les fonctions testées
function makePlayer(overrides: Partial<PlayerRow> = {}): PlayerRow {
  return {
    player_name: "MINER",
    total_missions: 0,
    total_kills: 0,
    total_time_s: 0,
    total_distance_cm: 0,
    total_downs: 0,
    driller_missions: 0,
    gunner_missions: 0,
    engineer_missions: 0,
    scout_missions: 0,
    driller_kills: 0,
    gunner_kills: 0,
    engineer_kills: 0,
    scout_kills: 0,
    driller_time_s: 0,
    gunner_time_s: 0,
    engineer_time_s: 0,
    scout_time_s: 0,
    driller_distance_cm: 0,
    gunner_distance_cm: 0,
    engineer_distance_cm: 0,
    scout_distance_cm: 0,
    driller_downs: 0,
    gunner_downs: 0,
    engineer_downs: 0,
    scout_downs: 0,
    visible_on_leaderboard: true,
    ...overrides,
  } as PlayerRow;
}

describe("getBestClass", () => {
  it("retourne la classe avec le plus de missions", () => {
    const player = makePlayer({ driller_missions: 10, scout_missions: 50 });
    expect(getBestClass(player)).toBe("Scout");
  });

  it("retourne Driller en premier en cas d'égalité (ordre du tableau)", () => {
    const player = makePlayer({
      driller_missions: 5,
      gunner_missions: 5,
      engineer_missions: 5,
      scout_missions: 5,
    });
    expect(getBestClass(player)).toBe("Driller");
  });
});

describe("getStatusBadge", () => {
  it("retourne lbLegendary au-dessus du seuil legendary", () => {
    const badge = getStatusBadge(LEADERBOARD_STATUS_THRESHOLDS.legendary, t as never);
    expect(badge.label).toBe("lbLegendary");
  });

  it("retourne lbProductive entre productive et legendary", () => {
    const badge = getStatusBadge(LEADERBOARD_STATUS_THRESHOLDS.productive, t as never);
    expect(badge.label).toBe("lbProductive");
  });

  it("retourne lbAdequate entre adequate et productive", () => {
    const badge = getStatusBadge(LEADERBOARD_STATUS_THRESHOLDS.adequate, t as never);
    expect(badge.label).toBe("lbAdequate");
  });

  it("retourne lbCriticalSlacker en dessous du seuil minimal", () => {
    const badge = getStatusBadge(0, t as never);
    expect(badge.label).toBe("lbCriticalSlacker");
  });
});

describe("VALID_SORT_KEYS", () => {
  it("contient les 5 colonnes triables", () => {
    expect(VALID_SORT_KEYS).toHaveLength(5);
    expect(VALID_SORT_KEYS).toContain("total_missions");
    expect(VALID_SORT_KEYS).toContain("total_kills");
  });
});

describe("getPodiumStyle", () => {
  it("retourne du doré pour le rang 1", () => {
    expect(getPodiumStyle(1)).toContain("FFD700");
  });

  it("retourne de l'argent pour le rang 2", () => {
    expect(getPodiumStyle(2)).toContain("C0C0C0");
  });
});
