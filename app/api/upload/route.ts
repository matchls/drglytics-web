// route.ts — Orchestration upload : parse (Flask) + save (Supabase) côté serveur.

import { NextRequest, NextResponse } from "next/server";
import { savePlayerStats } from "@/app/actions/savePlayerStats";
import { ApiResponse } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

// Timeout côté Next.js pour l'appel Flask. Légèrement supérieur au timeout
// serveur (PARSE_TIMEOUT_S=30s) pour laisser Flask répondre avant qu'on abandonne.
const BACKEND_PARSE_TIMEOUT_MS = parseInt(
  process.env.BACKEND_PARSE_TIMEOUT_MS ?? "35000",
  10,
);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo, cohérent avec Flask

// Magic bytes au début de tout fichier GVAS (Unreal Engine save format).
const GVAS_MAGIC = new Uint8Array([0x47, 0x56, 0x41, 0x53]); // "GVAS"

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

  // Validation du fichier avant d'appeler Flask
  if (!file.name.toLowerCase().endsWith(".sav")) {
    return NextResponse.json(
      { ok: false, error: "Le fichier doit avoir l'extension .sav." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Le fichier est vide." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Fichier trop volumineux (max 5 Mo)." },
      { status: 413 },
    );
  }

  // Vérification de la signature GVAS avant d'envoyer le fichier au parser
  const headerBuffer = await file.slice(0, 4).arrayBuffer();
  const header = new Uint8Array(headerBuffer);
  if (!GVAS_MAGIC.every((byte, i) => header[i] === byte)) {
    return NextResponse.json(
      { ok: false, error: "Ce fichier n'est pas une sauvegarde DRG valide." },
      { status: 400 },
    );
  }

  // 1. Appel Flask server-to-server avec timeout
  const backendFormData = new FormData();
  backendFormData.append("file", file);
  backendFormData.append("player_name", playerName);

  // AbortController permet d'annuler le fetch si Flask ne répond pas à temps.
  // Le finally garantit que le timer est toujours nettoyé, succès ou non.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_PARSE_TIMEOUT_MS);

  let parseResult: ApiResponse;
  try {
    const res = await fetch(`${BACKEND_URL}/api/parse`, {
      method: "POST",
      body: backendFormData,
      signal: controller.signal,
    });
    parseResult = (await res.json()) as ApiResponse;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { ok: false, error: "Le serveur de parsing ne répond pas. Réessaie dans quelques instants." },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Backend inaccessible." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeoutId);
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
