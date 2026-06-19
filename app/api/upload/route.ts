// route.ts — Orchestration upload : parse (Flask) + save (Supabase) côté serveur.

import { NextRequest, NextResponse } from "next/server";
import { savePlayerStats } from "@/app/actions/savePlayerStats";
import { ApiResponse } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export interface UploadRouteResponse {
  ok: boolean;
  data?: ApiResponse["data"];
  error?: string;
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
  const saveToLeaderboard = formData.get("saveToLeaderboard") === "true";

  if (!(file instanceof File) || !playerName) {
    return NextResponse.json(
      { ok: false, error: "Fichier et pseudo requis." },
      { status: 400 },
    );
  }

  // 1. Appel Flask server-to-server
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

  // 2. Persistance Supabase — nécessite d'être connecté (vérifié dans savePlayerStats)
  if (saveToLeaderboard) {
    const saveResult = await savePlayerStats(playerName, parseResult.data);
    if (!saveResult.ok) {
      return NextResponse.json({
        ok: true,
        data: parseResult.data,
        leaderboardFailed: true,
      });
    }
  }

  return NextResponse.json({ ok: true, data: parseResult.data });
}
