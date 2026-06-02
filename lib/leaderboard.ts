// lib/leaderboard.ts — Logique métier pure du leaderboard.
//
// Ces fonctions sont volontairement sorties de la page : ce sont des fonctions
// pures (entrée → sortie, sans JSX ni état React). Les isoler ici les rend
// testables unitairement et réutilisables (ex. page profil), et allège la page
// qui n'est plus qu'un orchestrateur.

import { TranslationKey } from "@/lib/i18n";
import { ClassName } from "@/lib/types";
import { type PlayerRow } from "@/lib/data/players";

// Les colonnes sur lesquelles on peut trier
export type SortKey =
  | "total_missions"
  | "total_kills"
  | "total_time_s"
  | "total_distance_cm"
  | "total_downs";

// Calcule le badge de statut selon le nombre de missions
// t est passé en paramètre car cette fonction est en dehors du composant (ne peut pas appeler un hook directement)
export function getStatusBadge(
  missions: number,
  t: (key: TranslationKey) => string,
): { label: string; className: string } {
  if (missions >= 2000)
    return {
      label: t("lbLegendary"),
      className: "bg-primary text-on-primary px-2 py-0.5",
    };
  if (missions >= 500)
    return {
      label: t("lbProductive"),
      className: "border border-tertiary text-tertiary px-2 py-0.5",
    };
  if (missions >= 100)
    return {
      label: t("lbAdequate"),
      className:
        "border border-outline-variant text-on-surface-variant px-2 py-0.5",
    };
  return {
    label: t("lbCriticalSlacker"),
    className: "border border-error text-error px-2 py-0.5",
  };
}

// Couleurs du podium : or / argent / bronze
export function getPodiumStyle(rank: number): string {
  if (rank === 1)
    return "border-[#FFD700] bg-[#FFD700]/10 scale-105 shadow-lg shadow-[#FFD700]/20";
  if (rank === 2) return "border-[#C0C0C0] bg-[#C0C0C0]/10";
  return "border-[#A52A2A] bg-[#A52A2A]/10";
}

// Trouve la classe avec le plus de missions pour un joueur
// reduce : parcourt le tableau en gardant le "meilleur" à chaque étape
export function getBestClass(player: PlayerRow): ClassName {
  const scores: [ClassName, number][] = [
    ["Driller", player.driller_missions],
    ["Gunner", player.gunner_missions],
    ["Engineer", player.engineer_missions],
    ["Scout", player.scout_missions],
  ];
  return scores.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  )[0];
}

// Milestones communautaires pour les Bounty Targets
export const COMMUNITY_KILL_MILESTONE = 2_000_000;
export const COMMUNITY_MISSION_MILESTONE = 10_000;
