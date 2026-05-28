import { Preferences } from "@/lib/preferences";

export function formatDistance(
  cm: number,
  prefs: Preferences,
  showUnit = true,
): string {
  if (prefs.distanceUnit === "mi") {
    return ((cm / 100000) * 0.621371).toFixed(0) + (showUnit ? " mi" : "");
  }
  return (cm / 100000).toFixed(0) + (showUnit ? " km" : "");
}

// TODO : convertit des secondes en texte selon prefs.timeFormat
// - "hours" : format "Xh Ym"   ex: "342h 15m"
// - "dhm"   : format "Xj Yh"   ex: "14j 6h"  (jours + heures restantes, pas de minutes)
//   astuce pour les jours : Math.floor(seconds / 86400)  (86400 = 60*60*24)
//   heures restantes      : Math.floor((seconds % 86400) / 3600)
export function formatTime(seconds: number, prefs: Preferences): string {
  if (prefs.timeFormat === "hours") {
    return (
      Math.floor(seconds / 3600) +
      "h" +
      " " +
      Math.floor((seconds % 3600) / 60) +
      "m"
    );
  }
  return (
    Math.floor(seconds / 86400) +
    "j" +
    " " +
    Math.floor((seconds % 86400) / 3600) +
    "h"
  );
}
