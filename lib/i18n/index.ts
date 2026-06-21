import { usePrefs } from "@/lib/PrefsContext";
import { auth } from "./auth";
import { upload } from "./upload";
import { dashboard } from "./dashboard";
import { leaderboard } from "./leaderboard";
import { options } from "./options";
import { nav } from "./nav";
import { player } from "./player";
import { footer } from "./footer";
import { abyssBar } from "./abyss-bar";
import { privacy } from "./privacy";

const translations = {
  en: {
    ...auth.en,
    ...upload.en,
    ...dashboard.en,
    ...leaderboard.en,
    ...options.en,
    ...nav.en,
    ...player.en,
    ...footer.en,
    ...abyssBar.en,
    ...privacy.en,
  },
  fr: {
    ...auth.fr,
    ...upload.fr,
    ...dashboard.fr,
    ...leaderboard.fr,
    ...options.fr,
    ...nav.fr,
    ...player.fr,
    ...footer.fr,
    ...abyssBar.fr,
    ...privacy.fr,
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function useTranslation() {
  const { prefs } = usePrefs();
  return (key: TranslationKey): string => translations[prefs.language][key];
}
