// session.ts — Accès centralisé à l'état de session du dashboard.
//
// Analogie : c'est le seul "casier" partagé entre les pages. Au lieu que chaque
// page ouvre le casier à sa façon (et risque de mal lire l'étiquette), tout le
// monde passe par les fonctions ci-dessous.
//
// Trois clés vivent dans sessionStorage :
//   - "dashboardData" : la réponse complète du backend (ApiResponse { ok, data })
//   - "playerName"    : le pseudo SAISI à l'upload (peut différer de data.player.name)
//   - "isDemo"        : "true" quand les données affichées viennent de la démo
//
// Avant ce module, ces clés étaient lues et JSON.parse-ées à la main dans 5
// composants, sans typage ni garde d'erreur. Ici, tout est typé et protégé.

import { ApiResponse, DashboardData } from "./types";

const DASHBOARD_KEY = "dashboardData";
const NAME_KEY = "playerName";
const DEMO_KEY = "isDemo";

export interface DashboardSession {
  // Les stats du joueur (le cœur de ce qu'affichent les pages).
  data: DashboardData;
  // Pseudo saisi au moment de l'upload. "" si absent. À ne pas confondre avec
  // data.player.name (le nom porté par les stats elles-mêmes).
  name: string;
  // true si les données proviennent de la démo (pas d'un vrai upload).
  isDemo: boolean;
}

/**
 * Lit l'état de session courant.
 * @returns la session typée, ou null si aucune donnée valide n'est présente
 *          (clé absente, JSON corrompu, ou réponse sans data).
 */
export function getDashboardSession(): DashboardSession | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(DASHBOARD_KEY);
  if (!raw) return null;

  try {
    const response = JSON.parse(raw) as ApiResponse;
    if (!response?.data) return null;
    return {
      data: response.data,
      name: sessionStorage.getItem(NAME_KEY) ?? "",
      isDemo: sessionStorage.getItem(DEMO_KEY) === "true",
    };
  } catch {
    // JSON corrompu → on traite comme "pas de session" plutôt que de planter.
    return null;
  }
}

/**
 * Écrit l'état de session (appelé après un upload réussi ou en mode démo).
 *
 * @param response - la réponse du backend (on stocke l'enveloppe { ok, data })
 * @param name     - le pseudo saisi par l'utilisateur
 * @param isDemo   - true pour la démo ; false efface le flag éventuel
 */
export function setDashboardSession(
  response: ApiResponse,
  name: string,
  isDemo: boolean,
): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(DASHBOARD_KEY, JSON.stringify(response));
  sessionStorage.setItem(NAME_KEY, name);
  if (isDemo) sessionStorage.setItem(DEMO_KEY, "true");
  else sessionStorage.removeItem(DEMO_KEY);
}

/** Efface toutes les clés de session du dashboard. */
export function clearDashboardSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DASHBOARD_KEY);
  sessionStorage.removeItem(NAME_KEY);
  sessionStorage.removeItem(DEMO_KEY);
}
