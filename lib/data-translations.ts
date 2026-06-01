// Dictionnaires de traduction FR pour les données venant du backend
//
// Les clés correspondent EXACTEMENT à ce que _format_stat_name() produit dans stats_builder.py
// Règle : enlève le préfixe "MS_MotCle_", puis ajoute des espaces avant les majuscules
// Ex: MS_Completed_TotalMissions → "Total Missions"
//     MS_Warnings_BulletHell    → "Bullet Hell"
//
// Si une clé est absente, le nom anglais du backend est affiché en fallback.

const STAT_NAMES_FR: Record<string, string> = {
  // ── Missions ──────────────────────────────────────────────────────────────
  "Total Missions":          "Missions totales",
  "Total Solo Missions":     "Missions solo totales",
  "Secondary Missions":      "Missions secondaires",
  "Total Campaign Missions": "Missions de campagne totales",
  "Total Campaigns":         "Campagnes totales",
  "Deep Scan":               "Scan en profondeur",
  "Mining Expedition":       "Expédition minière",
  "Point Extraction":        "Extraction de points",
  "Refinery Missions":       "Missions de raffinerie",
  "Escort Missions":         "Missions d'escorte",
  "Salvage Missions":        "Missions de récupération",
  "Elimination Missions":    "Missions d'élimination",
  "Egg Hunts":               "Chasse aux œufs",
  "Heavy Extraction":        "Extraction lourde",

  // ── Biomes (noms propres DRG — traduits selon la version FR du jeu) ───────
  "Azure Weald":      "Bois d'azur",
  "Crystal":          "Cavernes cristallines",
  "Fungus":           "Marais fongiques",
  "Ice Caves":        "Grottes glaciaires",
  "Lush":             "Terres fertiles",
  "Magma":            "Noyau magmatique",
  "Ossuary Depths":   "Profondeurs ossuaires",
  "Radioactive":      "Zone radioactive",
  "Salt":             "Désert de sel",
  "Sandblasted":      "Cavernes sablées",

  // ── Anomalies (Warnings) ──────────────────────────────────────────────────
  "Bullet Hell":            "Pluie de balles",
  "Cave Leech Clusters":    "Grappes de sangsues",
  "Core Corruption":        "Corruption du noyau",
  "Double Warning":         "Double anomalie",
  "Exploder Infestations":  "Infestation d'exploseurs",
  "Ghost":                  "Fantôme",
  "Hero Enemies":           "Ennemis héroïques",
  "Infested Enemies":       "Ennemis infectés",
  "Lethal Enemies":         "Ennemis létaux",
  "Mactera Plagues":        "Fléau des Mactera",
  "No Oxygen":              "Sans oxygène",
  "No Shields":             "Sans boucliers",
  "Ossiran Colony":         "Colonie ossirienne",
  "Plague":                 "Peste",
  "Regeneration":           "Régénération",
  "Rival Incursion":        "Incursion rivale",
  "Rock Infestation":       "Infestation rocheuse",
  "Scrab Nesting Grounds":  "Terrain des Scrabs",
  "Swarmageddon":           "Swarmagedon",

  // ── Kills ─────────────────────────────────────────────────────────────────
  "Total Enemies":       "Ennemis éliminés",
  // Labels hero stats (format backend avec unité — utilisés dans ClassPieChart)
  // NB : "Total Missions" et "Total Downs" sont déjà définis plus haut/bas
  // (mêmes valeurs) → non redéfinis ici pour éviter les clés dupliquées.
  "Total Enemies Killed":     "Ennemis éliminés",
  "Time Played (s)":          "Temps joué",
  "Distance Travelled (cm)":  "Distance parcourue",
  "Total Minerals Mined":     "Minéraux extraits",

  // ── Deaths ────────────────────────────────────────────────────────────────
  "Total Downs":       "Fois mis à terre",
  "Total Downs Drunk": "Fois mis à terre (ivre)",

  // ── Distance ──────────────────────────────────────────────────────────────
  "Distance Travelled": "Distance parcourue",

  // ── Time ──────────────────────────────────────────────────────────────────
  "Time Played": "Temps joué",

  // ── Mined ─────────────────────────────────────────────────────────────────
  "Total Minerals": "Minéraux extraits",
  "Gold Mined":     "Or extrait",
  "Nitra Mined":    "Nitra extrait",

  // ── Bar ───────────────────────────────────────────────────────────────────
  "Bartender Tips":       "Pourboires au barman",
  "Total Consumed":       "Bières consommées",
  "Total Rounds Ordered": "Tournées commandées",
  "Special Beers Unlocked": "Bières spéciales débloquées",

  // ── Forge ─────────────────────────────────────────────────────────────────
  "Overclocks":    "Overclocks forgés",
  "Cosmetics":     "Cosmétiques forgés",
  "Weapon Skins":  "Skins d'armes forgés",

  // ── Classes ───────────────────────────────────────────────────────────────
  "Driller":  "Perceur",
  "Gunner":   "Tireur",
  "Engineer": "Ingénieur",
  "Scout":    "Éclaireur",

  // ── Deep Dives ────────────────────────────────────────────────────────────
  "Deep Dive":            "Plongée profonde",
  "Elite Deep Dive":      "Plongée profonde élite",
  "Defense":              "Défense",
  "Repair Mini Mules":    "Réparation des mini-mulets",

  // ── Saisons ───────────────────────────────────────────────────────────────
  "Season Challenge": "Défi de saison",
  "Season Events":    "Événements de saison",

  // ── Assignments ───────────────────────────────────────────────────────────
  "Weapon Licenses": "Licences d'armes",

  // ── Overrides : noms de fallback incorrects à corriger ───────────────────
  "Character": "Tous",
};

// ── Overrides EN ─────────────────────────────────────────────────────────────
// Noms backend qui doivent être remplacés même en anglais
const STAT_NAMES_EN: Record<string, string> = {
  "Character": "All",
};

// ── Noms d'overclocks ─────────────────────────────────────────────────────────
// Les noms DRG sont identiques en FR — à compléter si la localisation FR diffère
export const OVERCLOCK_NAMES_FR: Record<string, string> = {};

// ── Fonctions de traduction ───────────────────────────────────────────────────

// Retourne la traduction si elle existe, sinon le nom original nettoyé
export function translateStatName(name: string, language: "fr" | "en"): string {
  if (language === "en") return STAT_NAMES_EN[name] ?? name.replace(/_/g, " ");
  return STAT_NAMES_FR[name] ?? name.replace(/_/g, " ");
}

export function translateOverclockName(name: string, language: "fr" | "en"): string {
  if (language === "en") return name;
  return OVERCLOCK_NAMES_FR[name] ?? name;
}
