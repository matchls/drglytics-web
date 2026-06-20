import { describe, it, expect } from "vitest";
import { formatDistance, formatTime } from "@/lib/formatters";
import { type Preferences } from "@/lib/preferences";

const km: Preferences = {
  distanceUnit: "km",
  timeFormat: "hours",
  language: "fr",
  showOnLeaderboard: true,
  playerName: "",
};

const mi: Preferences = {
  ...km,
  distanceUnit: "mi",
};

const dhm: Preferences = {
  ...km,
  timeFormat: "dhm",
};

describe("formatDistance", () => {
  it("convertit en km (100 000 000 cm = 1000 km)", () => {
    expect(formatDistance(100_000_000, km)).toBe("1000 km");
  });

  it("convertit en miles (100 000 000 cm ≈ 621 mi)", () => {
    expect(formatDistance(100_000_000, mi)).toBe("621 mi");
  });

  it("masque l'unité si showUnit = false", () => {
    expect(formatDistance(100_000_000, km, false)).toBe("1000");
  });

  it("retourne 0 pour une distance nulle", () => {
    expect(formatDistance(0, km)).toBe("0 km");
  });
});

describe("formatTime", () => {
  it("formate en heures+minutes", () => {
    expect(formatTime(3661, km)).toBe("1h 1m");
  });

  it("formate en jours+heures (dhm)", () => {
    expect(formatTime(90_000, dhm)).toBe("1j 1h");
  });

  it("retourne 0h 0m pour 0 secondes", () => {
    expect(formatTime(0, km)).toBe("0h 0m");
  });

  it("retourne 0j 0h pour 0 secondes en dhm", () => {
    expect(formatTime(0, dhm)).toBe("0j 0h");
  });
});
