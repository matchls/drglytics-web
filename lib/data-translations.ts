// Dictionnaires de traduction FR pour les données venant du backend
// Si une entrée est absente, le nom original (nettoyé) est utilisé en fallback

// --- Noms de stats (MissionStats) ---
export const STAT_NAMES_FR: Record<string, string> = {
  // Missions
  "Missions Completed": "Missions complétées",
  "Missions Failed": "Missions échouées",
  "Missions Abandoned": "Missions abandonnées",

  // Ennemis
  "Total Enemies Killed": "Ennemis éliminés",
  "Total Enemies Killed (Friendly Fire)": "Victimes de tirs amis",

  // Temps / Distance
  "Time Played": "Temps joué",
  "Distance Travelled": "Distance parcourue",

  // Ressources
  "Total Minerals Mined": "Minéraux extraits",
  "Gold Mined": "Or extrait",
  "Nitra Mined": "Nitra extrait",

  // Bar
  "Beers Consumed": "Bières consommées",
  "Rounds Ordered": "Tournées commandées",
  "Bartender Tips": "Pourboires au barman",

  // Deaths
  "Total Deaths": "Morts totales",
  "Total Downs": "Fois mis à terre",

  // Deep Dives
  "Deep Dives Completed": "Expéditions complétées",
  "Elite Deep Dives Completed": "Expéditions élite complétées",
};

// --- Noms d'overclocks ---
// Format : "Nom EN": "Nom FR"
// Les noms DRG sont souvent identiques en FR — à compléter selon le jeu localisé
export const OVERCLOCK_NAMES_FR: Record<string, string> = {
  // Exemples — à compléter
  // "Volatile Impact Mixture": "Mélange à impact volatil",
};

// Overrides EN : noms backend qui doivent être remplacés même en anglais
const STAT_NAMES_EN: Record<string, string> = {
  "Character": "All",
};

// Overrides FR : noms backend → traduction française
const STAT_NAMES_FR_EXTRA: Record<string, string> = {
  "Character": "Tous",
};

// Lookup avec fallback : retourne la traduction si elle existe,
// sinon retourne le nom original nettoyé des underscores
export function translateStatName(name: string, language: "fr" | "en"): string {
  if (language === "en") return STAT_NAMES_EN[name] ?? name.replace(/_/g, " ");
  return STAT_NAMES_FR_EXTRA[name] ?? STAT_NAMES_FR[name] ?? name.replace(/_/g, " ");
}

export function translateOverclockName(name: string, language: "fr" | "en"): string {
  if (language === "en") return name;
  return OVERCLOCK_NAMES_FR[name] ?? name;
}
