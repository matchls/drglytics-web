// lib/ranks.ts — Seuils de progression centralisés.
//
// Pourquoi ce module : les seuils (nombre de missions, de kills, d'heures...)
// qui déclenchent un rang, un statut ou un badge étaient codés en dur et
// dupliqués dans plusieurs composants de l'UI. Les regrouper ici donne une
// source de vérité unique : pour rééquilibrer une progression, on ne touche
// qu'à ce fichier — plus de "nombre magique" perdu au milieu du JSX.
//
// Ces constantes sont volontairement de simples données (pas de JSX, pas de
// logique de rendu). La présentation (clés i18n, couleurs, classes CSS) reste
// dans les composants qui les consomment.

// Rangs d'une classe (ClassCard) — comparés au nombre de missions complétées
// PAR la classe. En dessous du plus petit seuil : "greenbeard".
export const CLASS_RANK_THRESHOLDS = {
  veteran: 500, // rankVeteran
  experienced: 200, // rankExperienced
  rookie: 50, // rankRookie
} as const;

// Statut d'un joueur sur le leaderboard — comparé au total de missions.
// En dessous du plus petit seuil : "critical slacker".
export const LEADERBOARD_STATUS_THRESHOLDS = {
  legendary: 2000, // lbLegendary
  productive: 500, // lbProductive
  adequate: 100, // lbAdequate
} as const;

// Badges de l'Abyss Bar (commendations). Chaque badge se compare à sa propre
// métrique — le commentaire indique laquelle.
export const ABYSS_BADGE_THRESHOLDS = {
  rockAndStone: 10, // missions totales
  deepVeteran: 500, // missions totales
  bugZapper: 100_000, // kills totaux
  karlsChosen: 1_000_000, // kills totaux
  underground: 100, // heures de jeu
  legend: 1_000, // heures de jeu
  gearHead: 10, // overclocks forgés
  fullArsenal: 50, // overclocks forgés
  jackOfAllTrades: 50, // missions par classe (pour CHAQUE classe)
} as const;
