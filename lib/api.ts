// api.ts — Communication avec les serveurs (backend Flask et API Next.js)

import { ApiResponse } from "./types";
import type { UploadRouteResponse } from "@/app/api/upload/route";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

/**
 * Envoie un fichier .sav et un pseudo au backend, retourne les stats parsées.
 * Appelée directement quand on n'a pas besoin de sauvegarder dans le leaderboard.
 *
 * @param saveFile   - Le fichier .sav sélectionné par l'utilisateur
 * @param playerName - Le pseudo entré par l'utilisateur
 * @returns          - La réponse de l'API (ok + data, ou ok + error)
 */
export async function parseSaveFile(
  saveFile: File,
  playerName: string,
): Promise<ApiResponse> {
  // FormData est le format standard pour envoyer des fichiers via HTTP
  // C'est comme remplir un formulaire papier : on ajoute chaque champ un par un
  const formData = new FormData();
  formData.append("file", saveFile);
  formData.append("player_name", playerName);

  try {
    const response = await fetch(`${BACKEND_URL}/api/parse`, {
      method: "POST",
      body: formData,
      // Pas de Content-Type manuel — fetch le calcule automatiquement pour FormData
    });

    const json: ApiResponse = await response.json();
    return json;
  } catch (error) {
    // Erreur réseau (backend inaccessible, pas de connexion, etc.)
    console.error(error);
    return {
      ok: false,
      error: "Could not reach the backend. Is it running?",
    };
  }
}

/**
 * Envoie le fichier .sav au route handler Next.js qui orchestre :
 *   1. Parse côté serveur via Flask (server-to-server, pas de retour navigateur)
 *   2. Persistance Supabase si saveToLeaderboard est true
 *
 * Avantage vs parseSaveFile + savePlayerStats séparés : le DashboardData complet
 * ne transite plus deux fois par le navigateur (Flask → nav → Next.js).
 *
 * @param saveFile          - Le fichier .sav sélectionné
 * @param playerName        - Le pseudo saisi
 * @param pin               - Le PIN du joueur (pour la persistance)
 * @param saveToLeaderboard - Doit-on sauvegarder dans Supabase ?
 * @returns                 - ApiResponse + leaderboardFailed si la save a échoué
 */
export async function uploadAndSave(
  saveFile: File,
  playerName: string,
  saveToLeaderboard: boolean,
): Promise<UploadRouteResponse> {
  const formData = new FormData();
  formData.append("file", saveFile);
  formData.append("playerName", playerName);
  formData.append("saveToLeaderboard", String(saveToLeaderboard));

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    return (await response.json()) as UploadRouteResponse;
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Could not reach the server." };
  }
}
