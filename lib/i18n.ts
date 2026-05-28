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
    forged: "FORGÉ",
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
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

// Hook à utiliser dans les composants : const t = useTranslation()
export function useTranslation() {
  const { prefs } = usePrefs();
  return (key: TranslationKey): string => translations[prefs.language][key];
}
