export type Preferences = {
  showOnLeaderboard: boolean;
  language: "fr" | "en";
  distanceUnit: "km" | "mi";
  timeFormat: "hours" | "dhm";
  playerName: string;
};

export const DEFAULTS: Preferences = {
  showOnLeaderboard: true,
  language: "fr",
  distanceUnit: "km",
  timeFormat: "hours",
  playerName: "",
};

const KEY = "drg_preferences";

export function getPrefs(): Preferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return DEFAULTS;
    // Fusionner avec les défauts : si une clé manque, on prend la valeur par défaut
    return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch {
    return DEFAULTS;
  }
}

export function setPrefs(partial: Partial<Preferences>): void {
  const current = getPrefs();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...partial }));
}
