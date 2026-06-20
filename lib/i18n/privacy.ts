export const privacy = {
  en: {
    privTitle: "OPERATIONAL BRIEFING — DATA HANDLING",
    privPoint1: "Your .sav file is transmitted once to extract stats, then immediately discarded.",
    privPoint2: "Only gameplay statistics are stored — no personal data, no raw file.",
    privPoint3: "Leaderboard sync is opt-in. Disable it anytime in Options.",
    privPoint4: "Your public profile shows only in-game stats, nothing else.",
    privLink: "READ FULL BRIEFING →",
    privFullTitle: "DATA HANDLING — FULL BRIEFING",
    privSection1Title: "YOUR SAVE FILE",
    privSection1Body:
      "When you upload a .sav file, it is sent to our analysis server to extract your gameplay statistics. The raw file is never stored on our servers. Only the parsed statistics are kept.",
    privSection2Title: "WHAT IS STORED",
    privSection2Body:
      "If you enable leaderboard sync, we store: your chosen operative name, mission count, kill count, time played, distance traveled, downs, and per-class breakdowns. No email, no real name, no raw save file.",
    privSection3Title: "LEADERBOARD & VISIBILITY",
    privSection3Body:
      "Leaderboard participation is opt-in. You can disable it at any time via Options → Show on leaderboard. Disabling it hides your data from the public leaderboard immediately. Your stats remain in the database so you can re-enable later.",
    privSection4Title: "YOUR PUBLIC PROFILE",
    privSection4Body:
      "Your profile at /player/[name] is accessible to anyone who knows your operative name. It shows only in-game statistics. No personal information is exposed.",
    privSection5Title: "CONTACT",
    privSection5Body:
      "Questions or requests? Use the contact form in Options. We will respond as soon as possible.",
    privBackToTerminal: "← BACK TO TERMINAL",
  },
  fr: {
    privTitle: "BRIEFING OPÉRATIONNEL — TRAITEMENT DES DONNÉES",
    privPoint1: "Ton fichier .sav est transmis une fois pour extraire les stats, puis immédiatement supprimé.",
    privPoint2: "Seules les statistiques de jeu sont conservées — pas de données personnelles, pas de fichier brut.",
    privPoint3: "La synchronisation avec le leaderboard est optionnelle. Désactivable à tout moment dans Options.",
    privPoint4: "Ton profil public n'affiche que des stats de jeu, rien d'autre.",
    privLink: "LIRE LE BRIEFING COMPLET →",
    privFullTitle: "TRAITEMENT DES DONNÉES — BRIEFING COMPLET",
    privSection1Title: "TON FICHIER DE SAUVEGARDE",
    privSection1Body:
      "Quand tu uploades un fichier .sav, il est envoyé à notre serveur d'analyse pour extraire tes statistiques. Le fichier brut n'est jamais conservé sur nos serveurs. Seules les statistiques parsées sont gardées.",
    privSection2Title: "CE QUI EST CONSERVÉ",
    privSection2Body:
      "Si tu actives la synchronisation avec le leaderboard, nous conservons : ton pseudo choisi, le nombre de missions, d'éliminations, le temps de jeu, la distance parcourue, les mises à terre, et les stats par classe. Pas d'email, pas de vrai nom, pas de fichier de sauvegarde.",
    privSection3Title: "LEADERBOARD & VISIBILITÉ",
    privSection3Body:
      "La participation au leaderboard est optionnelle. Tu peux la désactiver à tout moment via Options → Apparaître dans le leaderboard. La désactivation cache immédiatement tes données du classement public. Tes stats restent en base pour que tu puisses réactiver plus tard.",
    privSection4Title: "TON PROFIL PUBLIC",
    privSection4Body:
      "Ton profil sur /player/[pseudo] est accessible à quiconque connaît ton pseudo d'opérateur. Il affiche uniquement des statistiques de jeu. Aucune information personnelle n'est exposée.",
    privSection5Title: "CONTACT",
    privSection5Body:
      "Questions ou demandes ? Utilise le formulaire de contact dans Options. Nous te répondrons dès que possible.",
    privBackToTerminal: "← RETOUR AU TERMINAL",
  },
} as const;
