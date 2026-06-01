// types.ts — Définitions TypeScript des données du dashboard
//
// Ce fichier décrit exactement la forme du JSON renvoyé par le backend Flask.
// Analogie : c'est le "contrat" entre le backend et le frontend.
// Si le backend change le nom d'un champ, TypeScript nous le signale ici.

// ── Stats d'une seule stat de mission ────────────────────────────────────────

export interface MissionStat {
  guid: string;
  name: string;           // ex: "Total Enemies Killed"
  category: string;       // ex: "Kills"
  category_key: string;   // ex: "MSC_Kills"
  type: string;           // "Integer" ou "Float"
  unit?: string;          // unité ex: "cm", "s", ou vide
  total: number;          // total toutes classes confondues
  by_class: {             // valeur par classe
    Driller?: number;
    Gunner?: number;
    Engineer?: number;
    Scout?: number;
  };
}

// ── Résumé d'une classe (Driller, Gunner, etc.) ───────────────────────────────

export interface ClassSummary {
  name: "Driller" | "Gunner" | "Engineer" | "Scout";
  missions_completed: number;
  kills: number;
  time_played_s: number;      // temps en secondes
  distance_cm: number;        // distance en centimètres
  downs: number;
}

// ── Un overclock ──────────────────────────────────────────────────────────────

export interface Overclock {
  guid: string;
  dwarf: string;    // ex: "Scout"
  weapon: string;   // ex: "Deepcore GK2"
  name: string;     // ex: "Compact Ammo"
  cost?: {
    credits: number;
    bismor: number;
    croppa: number;
    enor: number;
    jadiz: number;
    magnite: number;
    umanite: number;
  };
}

// ── Stats mises en avant (header du dashboard) ────────────────────────────────

export interface HeroStat {
  label: string;    // ex: "Total Enemies Killed"
  total: number;
  by_class: {
    Driller?: number;
    Gunner?: number;
    Engineer?: number;
    Scout?: number;
  };
}

// ── Overclocks groupés ────────────────────────────────────────────────────────

export interface OverclocksData {
  forged: Overclock[];
  forged_by_dwarf: {
    Driller: Overclock[];
    Gunner: Overclock[];
    Engineer: Overclock[];
    Scout: Overclock[];
  };
  unforged: Overclock[];
  forged_count: number;
  unforged_count: number;
}

// ── Réponse complète du backend ───────────────────────────────────────────────
//
// C'est ce que retourne POST /api/parse quand tout va bien.

export interface DashboardData {
  player: {
    name: string;
    perk_points: number;
  };
  hero_stats: {
    [key: string]: HeroStat;  // clé = asset_name, ex: "MS_Killed_TotalEnemies"
  };
  classes: ClassSummary[];
  mission_stats: {
    [key: string]: MissionStat;
  };
  overclocks: OverclocksData;
}

// ── Réponse de l'API ──────────────────────────────────────────────────────────

export interface ApiResponse {
  ok: boolean;
  data?: DashboardData;
  error?: string;
}

// ── Noms des classes (utile pour les boucles) ─────────────────────────────────

export type ClassName = "Driller" | "Gunner" | "Engineer" | "Scout";

export const CLASS_NAMES: ClassName[] = ["Driller", "Gunner", "Engineer", "Scout"];

export const CLASS_COLORS: Record<ClassName, string> = {
  Driller:  "#e6c020",
  Gunner:   "#5cba5c",
  Engineer: "#d44a4a",
  Scout:    "#4a8fd4",
};

// Icônes de classe — source unique partagée par tous les composants.
// (Auparavant dupliquées dans ClassCard, MissionStats et OverclockList.)
export const CLASS_ICONS: Record<ClassName, string> = {
  Driller:  "/icons/classes/driller_icon.png",
  Gunner:   "/icons/classes/gunner_icon.png",
  Engineer: "/icons/classes/engineer_icon.png",
  Scout:    "/icons/classes/scout_icon.png",
};
