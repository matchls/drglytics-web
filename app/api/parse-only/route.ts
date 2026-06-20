// parse-only/route.ts — Parse un .sav via Flask SANS sauvegarder en base.
// Utilisé exclusivement pour vérifier qu'un utilisateur possède bien un save
// avant de lui permettre de réclamer un profil (feature claim #144).
// Mêmes validations que /api/upload, mais aucun appel à savePlayerStats.

import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";
const BACKEND_PARSE_TIMEOUT_MS = parseInt(
  process.env.BACKEND_PARSE_TIMEOUT_MS ?? "35000",
  10,
);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const GVAS_MAGIC = new Uint8Array([0x47, 0x56, 0x41, 0x53]);

export interface ParseOnlyResponse {
  ok: boolean;
  data?: ApiResponse["data"];
  error?: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ParseOnlyResponse>> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier requis." }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".sav")) {
    return NextResponse.json(
      { ok: false, error: "Le fichier doit avoir l'extension .sav." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: "Le fichier est vide." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Fichier trop volumineux (max 5 Mo)." },
      { status: 413 },
    );
  }

  const headerBuffer = await file.slice(0, 4).arrayBuffer();
  const header = new Uint8Array(headerBuffer);
  if (!GVAS_MAGIC.every((byte, i) => header[i] === byte)) {
    return NextResponse.json(
      { ok: false, error: "Ce fichier n'est pas une sauvegarde DRG valide." },
      { status: 400 },
    );
  }

  const backendFormData = new FormData();
  backendFormData.append("file", file);
  // player_name requis par Flask mais ignoré ici — on ne sauvegarde pas
  backendFormData.append("player_name", "_claim_check");

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
        { ok: false, error: "Le serveur de parsing ne répond pas." },
        { status: 504 },
      );
    }
    return NextResponse.json({ ok: false, error: "Backend inaccessible." }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!parseResult.ok || !parseResult.data) {
    return NextResponse.json({ ok: false, error: parseResult.error ?? "Erreur de parsing." });
  }

  return NextResponse.json({ ok: true, data: parseResult.data });
}
