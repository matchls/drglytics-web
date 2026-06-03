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
