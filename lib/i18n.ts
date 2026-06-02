import { usePrefs } from "@/lib/PrefsContext";

// Dictionnaire de traductions FR/EN
// Clés en camelCase, valeurs en majuscules (style DRG)
const translations = {
  en: {
    // --- UploadForm ---
    tip1: "⛏ Drilling through your save file...",
    tip2: "🪨 Rock and Stone, Miner!",
    tip3: "📊 Counting your kills...",
    tip4: "🍺 Almost ready for a beer...",
    tip5: "💎 Gathering your stats...",
    processing: "PROCESSING...",
    formTitle: "SAVE-FILE SUBMISSION TERMINAL",
    operativeId: "ENTER OPERATIVE ID",
    dragDrop: "DRAG & DROP .SAV FILE HERE",
    whereFindFile: "WHERE TO FIND MY FILE?",
    helpStep1: "1. Right-click on",
    helpStep2Prefix: "2. Manage →",
    helpStep2Action: "Browse local files",
    helpStep3Prefix: "3. Navigate to",
    helpStep4Prefix: "4. Pick the",
    helpStep4Suffix: "most recent .sav file",
    warning:
      "⚠ AUTHORIZED PERSONNEL ONLY — UNAUTHORIZED ACCESS WILL BE REPORTED TO MANAGEMENT",
    submitBtn: "SUBMIT FOR ANALYSIS",
    tryDemo: "TRY DEMO",
    // Erreurs de validation du formulaire d'upload
    errMissingBoth: "⚠ ENTER YOUR OPERATIVE ID AND SELECT A SAVE FILE.",
    errMissingId: "⚠ ENTER YOUR OPERATIVE ID.",
    errMissingFile: "⚠ SELECT A SAVE FILE.",

    // --- MissionStats ---
    employeeReport: "EMPLOYEE PERFORMANCE REPORT",
    statName: "STAT NAME",
    total: "TOTAL",
    classBreakdown: "CLASS BREAKDOWN",
    catMissions: "MISSIONS",
    catBiomes: "BIOMES",
    catWarnings: "WARNINGS",
    catExtracted: "EXTRACTED DATA",
    catSeasons: "SEASONS",
    catForging: "FORGING",
    catAssignments: "ASSIGNMENTS",
    catDeepDives: "DEEP DIVES",
    catMined: "MINING",
    catKills: "KILLS",
    catDeaths: "DEATHS",
    catDistance: "DISTANCE",
    catTime: "TIME",
    catPurchases: "PURCHASES",
    catClasses: "CLASSES",
    catBar: "BAR",

    // --- ClassCard ranks ---
    rankVeteran: "VETERAN",
    rankExperienced: "EXPERIENCED",
    rankRookie: "ROOKIE",
    rankGreenbeard: "GREENBEARD",

    // --- OverclockList ---
    forgeStatus: "FORGE STATUS",
    forged: "FORGED",
    totalForged: "TOTAL FORGED",

    // --- Options ---
    languageLabel: "LANGUAGE",
    unitsLabel: "UNITS",
    distanceLabel: "DISTANCE",
    timeFormatLabel: "TIME FORMAT",
    timeFormatHours: "HOURS",
    timeFormatDhm: "D+H",
    clickStat: "CLICK A STAT",
    toDetail: "TO DETAIL IT",
    allClasses: "ALL",
    downs: "DOWNS",
    minerals: "MINERALS",
    // Page Options (titres, hints, formulaire de contact)
    optionsTitle: "OPTIONS",
    optProfileLeaderboard: "PROFILE & LEADERBOARD",
    optPseudo: "USERNAME",
    optPseudoHint: "Applied on next upload.",
    optShowOnLeaderboard: "APPEAR ON LEADERBOARD",
    optShowOnLeaderboardHint:
      "If disabled, your stats will no longer be visible to other players.",
    optLanguageHint: "Français or English.",
    optDistanceHint: "Kilometers or miles.",
    optTimeFormatHint: "342h 15m — or — 14d 6h",
    optContactTitle: "CONTACT ADMINISTRATION",
    optContactHint:
      "Problem with your PIN, your stats or something else? Send a message.",
    optMessage: "MESSAGE",
    optMessagePlaceholder: "Describe your problem...",
    optContactSuccess: "✓ MESSAGE SENT — ADMINISTRATION HAS BEEN NOTIFIED.",
    optContactSending: "SENDING...",
    optContactSend: "SEND",

    // --- Leaderboard ---
    lbRank: "RANK",
    lbMinerName: "MINER NAME",
    lbStatus: "STATUS",
    lbBestClass: "BEST CLASS",
    lbLegendary: "LEGENDARY",
    lbProductive: "PRODUCTIVE",
    lbAdequate: "ADEQUATE",
    lbCriticalSlacker: "CRITICAL SLACKER",
    lbSyncing: "SYNCING WITH MISSION CONTROL... [OK]",
    lbWarning: "⚠ SLACKERS WILL BE PROCESSED FOR LEAF-LOVER JUICE.",

    // --- Friends ---
    lbAllPlayers: "ALL MINERS",
    lbFriendsOnly: "FRIENDS ONLY",
    lbNoFriends: "NO FRIENDS YET — CLICK ★ ON A ROW TO ADD ONE",
    lbFriend: "FRIEND",

    // --- SideNav ---
    navTerminal: "TERMINAL",
    navMissionControl: "MISSION CONTROL",
    navAbyssBar: "ABYSS BAR",
    navMemorial: "MEMORIAL",
    navStartMission: "START MISSION",
    navSpaceRigProfile: "Space Rig Profile",
  },

  fr: {
    // --- UploadForm ---
    tip1: "⛏ Forage du fichier de sauvegarde...",
    tip2: "🪨 Rock and Stone, Mineur !",
    tip3: "📊 Comptage des éliminations...",
    tip4: "🍺 Encore un instant avant la bière...",
    tip5: "💎 Collecte des statistiques...",
    processing: "ANALYSE MINIÈRE EN COURS...",

    formTitle: "TERMINAL DE SOUMISSION DE SAUVEGARDE",
    operativeId: "ENTRER L’IDENTIFIANT D’OPÉRATEUR",

    dragDrop: "GLISSEZ & DÉPOSEZ LE FICHIER .SAV ICI",

    whereFindFile: "OÙ TROUVER MON FICHIER ?",

    helpStep1: "1. Faites un clic droit sur",
    helpStep2Prefix: "2. Gérer →",
    helpStep2Action: "Parcourir les fichiers locaux",
    helpStep3Prefix: "3. Rendez-vous dans",
    helpStep4Prefix: "4. Sélectionnez le",
    helpStep4Suffix: "fichier .sav le plus récent",

    warning:
      "⚠ PERSONNEL AUTORISÉ UNIQUEMENT — TOUT ACCÈS NON AUTORISÉ SERA SIGNALÉ À LA DIRECTION",
    submitBtn: "ENVOYER AU DÉPARTEMENT D’ANALYSE",
    tryDemo: "ESSAYER LA DÉMO",
    // Erreurs de validation du formulaire d'upload
    errMissingBoth:
      "⚠ ENTREZ VOTRE IDENTIFIANT D’OPÉRATEUR ET SÉLECTIONNEZ UN FICHIER DE SAUVEGARDE.",
    errMissingId: "⚠ ENTREZ VOTRE IDENTIFIANT D’OPÉRATEUR.",
    errMissingFile: "⚠ SÉLECTIONNEZ UN FICHIER DE SAUVEGARDE.",

    // --- MissionStats ---
    employeeReport: "RAPPORT DE PERFORMANCE DE L’EMPLOYÉ",

    statName: "STATISTIQUE",
    total: "TOTAL",
    classBreakdown: "RÉPARTITION PAR CLASSE",

    catMissions: "MISSIONS",
    catBiomes: "BIOMES",
    catWarnings: "ANOMALIES",
    catExtracted: "DONNÉES EXTRAITES",
    catSeasons: "SAISONS",
    catForging: "FORGE",
    catAssignments: "MISSIONS D’AFFECTATION",
    catDeepDives: "EXPÉDITIONS EN PROFONDEUR",
    catMined: "MINAGE",
    catKills: "ÉLIMINATIONS",
    catDeaths: "MORTS",
    catDistance: "DISTANCE",
    catTime: "TEMPS",
    catPurchases: "ACHATS",
    catClasses: "CLASSES",
    catBar: "BAR",

    // --- ClassCard ranks ---
    rankVeteran: "VÉTÉRAN",
    rankExperienced: "EXPÉRIMENTÉ",
    rankRookie: "BLEU",
    rankGreenbeard: "BARBE-VERTE",

    // --- OverclockList ---
    forgeStatus: "STATUT DE LA FORGE",
    forged: "FORGÉS",
    totalForged: "TOTAL FORGÉ",
    // --- Options ---
    languageLabel: "LANGUE",
    unitsLabel: "UNITÉS",
    distanceLabel: "DISTANCE",
    timeFormatLabel: "FORMAT TEMPS",
    timeFormatHours: "HEURES",
    timeFormatDhm: "J+H",
    clickStat: "CLIQUEZ UNE STAT",
    toDetail: "POUR LA DÉTAILLER",
    allClasses: "TOUTES",
    downs: "MORTS",
    minerals: "MINERAIS",
    // Page Options (titres, hints, formulaire de contact)
    optionsTitle: "OPTIONS",
    optProfileLeaderboard: "PROFIL & LEADERBOARD",
    optPseudo: "PSEUDO",
    optPseudoHint: "Modifié au prochain upload.",
    optShowOnLeaderboard: "APPARAÎTRE DANS LE LEADERBOARD",
    optShowOnLeaderboardHint:
      "Si désactivé, vos stats ne seront plus visibles par les autres joueurs.",
    optLanguageHint: "Français ou English.",
    optDistanceHint: "Kilomètres ou miles.",
    optTimeFormatHint: "342h 15m — ou — 14j 6h",
    optContactTitle: "CONTACTER L’ADMINISTRATION",
    optContactHint:
      "Problème avec ton PIN, tes stats ou autre chose ? Envoie un message.",
    optMessage: "MESSAGE",
    optMessagePlaceholder: "Décris ton problème...",
    optContactSuccess: "✓ MESSAGE ENVOYÉ — L’ADMINISTRATION A ÉTÉ NOTIFIÉE.",
    optContactSending: "ENVOI EN COURS...",
    optContactSend: "ENVOYER",

    // --- Leaderboard ---
    lbRank: "RANG",
    lbMinerName: "NOM DU MINEUR",
    lbStatus: "STATUT",
    lbBestClass: "CLASSE FAVORITE",
    lbLegendary: "LÉGENDAIRE",
    lbProductive: "PRODUCTIF",
    lbAdequate: "CONVENABLE",
    lbCriticalSlacker: "FAINÉANT CRITIQUE",
    lbSyncing: "SYNCHRONISATION AVEC LE CONTRÔLE DE MISSION... [OK]",
    lbWarning: "⚠ LES FAINÉANTS SERONT TRANSFORMÉS EN JUS DE LEAF-LOVER.",

    // --- Friends ---
    lbAllPlayers: "TOUS LES MINEURS",
    lbFriendsOnly: "AMIS SEULEMENT",
    lbNoFriends: "AUCUN AMI — CLIQUE SUR ★ POUR EN AJOUTER UN",
    lbFriend: "AMI",

    // --- SideNav ---
    navTerminal: "TERMINAL",
    navMissionControl: "RAPPORT DE MISSION",
    navAbyssBar: "ABYSS BAR",
    navMemorial: "MÉMORIAL",
    navStartMission: "LANCER UNE MISSION",
    navSpaceRigProfile: "Profil de la plateforme",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

// Hook à utiliser dans les composants : const t = useTranslation()
export function useTranslation() {
  const { prefs } = usePrefs();
  return (key: TranslationKey): string => translations[prefs.language][key];
}
