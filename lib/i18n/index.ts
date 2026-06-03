import { usePrefs } from "@/lib/PrefsContext";
import { upload } from "./upload";
import { dashboard } from "./dashboard";
import { leaderboard } from "./leaderboard";
import { options } from "./options";
import { nav } from "./nav";
import { pin } from "./pin";
import { player } from "./player";
import { footer } from "./footer";
import { abyssBar } from "./abyss-bar";

const translations = {
  en: {
    ...upload.en,
    ...dashboard.en,
    ...leaderboard.en,
    ...options.en,
    ...nav.en,
    ...pin.en,
    ...player.en,
    ...footer.en,
    ...abyssBar.en,
  },
  fr: {
    ...upload.fr,
    ...dashboard.fr,
    ...leaderboard.fr,
    ...options.fr,
    ...nav.fr,
    ...pin.fr,
    ...player.fr,
    ...footer.fr,
    ...abyssBar.fr,
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function useTranslation() {
  const { prefs } = usePrefs();
  return (key: TranslationKey): string => translations[prefs.language][key];
}
