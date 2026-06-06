// route.ts — Orchestration upload : parse (Flask) + save (Supabase) côté serveur.
//
// Avant ce route handler, le navigateur appelait Flask directement, recevait un
// DashboardData complet, puis le renvoyait immédiatement à savePlayerStats pour
// persistance. Le même payload volumineux traversait donc deux fois la frontière
// navigateur (Flask → navigateur, puis navigateur → Next.js).
//
// Ce handler regroupe les deux appels côté serveur :
//   1. Il reçoit le fichier .sav du navigateur (un seul envoi côté client).
//   2. Il appelle Flask en server-to-server (pas de retour navigateur intermédiaire).
//   3. Il persiste dans Supabase via savePlayerStats si l'utilisateur le demande.
//   4. Il retourne le DashboardData au navigateur, qui peut afficher le dashboard.
//
// Le navigateur ne sert plus de relais entre Flask et Next.js.

import { NextRequest, NextResponse } from "next/server";
import { savePlayerStats } from "@/app/actions/savePlayerStats";
import { ApiResponse } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export interface UploadRouteResponse {
  ok: boolean;
  data?: ApiResponse["data"];
  error?: string;
  // true si le parse a réussi mais la sauvegarde leaderboard a échoué (PIN incorrect,
  // throttle, erreur Supabase…). Le navigateur peut afficher le dashboard quand même.
  leaderboardFailed?: boolean;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<UploadRouteResponse>> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const playerName = (formData.get("playerName") as string | null)?.trim() ?? "";
  const pin = (formData.get("pin") as string | null) ?? "";
  const saveToLeaderboard = formData.get("saveToLeaderboard") === "true";

  if (!(file instanceof File) || !playerName) {
    return NextResponse.json(
      { ok: false, error: "Fichier et pseudo requis." },
      { status: 400 },
    );
  }

  // 1. Appel Flask server-to-server — le navigateur ne voit pas ce hop.
  const backendFormData = new FormData();
  backendFormData.append("file", file);
  backendFormData.append("player_name", playerName);

  let parseResult: ApiResponse;
  try {
    const res = await fetch(`${BACKEND_URL}/api/parse`, {
      method: "POST",
      body: backendFormData,
    });
    parseResult = (await res.json()) as ApiResponse;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Backend inaccessible." },
      { status: 502 },
    );
  }

  if (!parseResult.ok || !parseResult.data) {
    return NextResponse.json({
      ok: false,
      error: parseResult.error ?? "Erreur de parsing.",
    });
  }

  // 2. Persistance Supabase — côté serveur, pas de retour navigateur supplémentaire.
  if (saveToLeaderboard && pin) {
    const saveResult = await savePlayerStats(
      playerName,
      pin,
      parseResult.data,
    );
    if (!saveResult.ok) {
      // Parse réussi, leaderboard échoué → on renvoie les données pour le dashboard
      // mais on signale l'échec pour que l'UI puisse avertir l'utilisateur.
      return NextResponse.json({
        ok: true,
        data: parseResult.data,
        leaderboardFailed: true,
      });
    }
  }

  return NextResponse.json({ ok: true, data: parseResult.data });
}
