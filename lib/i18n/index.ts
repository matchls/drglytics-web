import { usePrefs } from "@/lib/PrefsContext";
import { upload } from "./upload";
import { dashboard } from "./dashboard";
import { leaderboard } from "./leaderboard";
import { options } from "./options";
import { nav } from "./nav";
import { pin } from "./pin";

const translations = {
  en: {
    ...upload.en,
    ...dashboard.en,
    ...leaderboard.en,
    ...options.en,
    ...nav.en,
    ...pin.en,
  },
  fr: {
    ...upload.fr,
    ...dashboard.fr,
    ...leaderboard.fr,
    ...options.fr,
    ...nav.fr,
    ...pin.fr,
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function useTranslation() {
  const { prefs } = usePrefs();
  return (key: TranslationKey): string => translations[prefs.language][key];
}
