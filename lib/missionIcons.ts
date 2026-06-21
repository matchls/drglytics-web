// Mapping nom de stat (tel que renvoyé par le backend) → icone
// Couvre les types de missions ET les ressources/objectifs secondaires
export const MISSION_STAT_ICONS: Record<string, string> = {
  // --- Types de missions ---
  "Egg Hunts": "/icons/missions/egg_hunt_icon.png",
  "Elimination Missions": "/icons/missions/elimination_icon.png",
  "Kill Fester Fleas": "/icons/missions/elimination_icon.png",
  "Escort Missions": "/icons/missions/escort_duty_icon.png",
  "Refinery Missions": "/icons/missions/on_site_refining_icon.png",
  "Salvage Missions": "/icons/missions/salvage_icon.png",
  "Mining Expeditions": "/icons/missions/mining_expedition_icon.png",
  "Point Extractions": "/icons/missions/point_extraction_icon.png",
  "Black Box Missions": "/icons/missions/blackbox_icon.png",
  "Deep Scan Missions": "/icons/missions/deep_scan_icon.png",
  "Heavy Extraction": "/icons/missions/heavy_extraction_icon.png",
  "Mining Expedition": "/icons/missions/mining_expedition_icon.png",
  "Point Extraction": "/icons/missions/point_extraction_icon.png",
  "Deep Scan": "/icons/missions/deep_scan_icon.png",

  // --- Ressources / objectifs secondaires ---
  "Apoca Bloom": "/icons/resources/apoca_bloom_icon.png",
  "Boolo Caps": "/icons/resources/boolo_cap_icon.png",
  "Destroy Bha Barnacle": "/icons/resources/bha_barnacle_icon.png",
  "Destroy Eggs": "/icons/resources/glyphid_egg_icon.png",
  "Find Ebonut": "/icons/resources/ebonut_icon.png",
  "Find Gunk Seed": "/icons/resources/gunk_seed_icon.png",
  Fossils: "/icons/resources/fossil_icon.png",
  Holomite: "/icons/resources/hollomite_icon.png",
  Dystrum: "/icons/resources/dystrum_icon.png",

  // --- Minéraux (catégorie Mining) ---
  "Bismor": "/icons/resources/bismor_icon.png",
  "Morkite": "/icons/resources/morkite_icon.png",
  "Jadiz": "/icons/resources/jadiz_icon.png",
  "Croppa": "/icons/resources/croppa_icon.png",
  "Magnite": "/icons/resources/magnite_icon.png",
  "Enor Pearl": "/icons/resources/enor_pearl_icon.png",
  "Umanite": "/icons/resources/umanite_icon.png",
  "Gold": "/icons/resources/gold_icon.png",
  "Nitra": "/icons/resources/nitra_icon.png",
  "Compressed Gold": "/icons/resources/compressed_gold_icon.png",

  // --- Divers ---
  "Deep Dive": "/icons/misc/deep_dive_icon.png",
  "Industrial Sabotage": "/icons/missions/industrial_sabotage_icon.png",
  "Search And Destroy": "/icons/missions/search_and_extract_icon.png",
};

// Stats à masquer (données peu pertinentes pour l'affichage)
export const STATS_HIDDEN = new Set([
  "Hazard 3",
  "Hazard 5",
  "Hazard3",
  "Hazard5",
  "Facility",
  "Tutorial",
]);

// Stats à afficher en fin de liste (ordre secondaire)
export const STATS_SORT_LAST = new Set([
  "Secondary Missions",
  "Total Campaign Missions",
  "Total Campaigns",
  "Total Missions",
  "Tutorial",
]);
