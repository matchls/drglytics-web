"use server";
// saveGuestbookMessage — Écriture d'un message du livre d'or.
//
// Deux chemins, séparés par UNE question : « ce pseudo existe-t-il dans players ? »
//
//   - OUI, avec PIN  → joueur enregistré : PIN exigé, message éditable (upsert).
//   - OUI, sans PIN  → pseudo réservé mais non vérifiable → refusé (fail closed).
//   - NON            → invité : aucun PIN, mais INSERT (pas upsert) → le premier qui
//                      réserve le pseudo le garde ; l'unicité empêche tout écrasement.

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { findPlayerByName } from "@/lib/playerLookup";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_MESSAGE_LENGTH = 200;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function saveGuestbookMessage(
  playerName: string,
  pin: string,
  message: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = playerName.trim().toUpperCase();
  const text = message.trim();

  // Validation serveur (jamais confiance au client)
  if (!name) return { ok: false, error: "Pseudo requis." };
  if (!text) return { ok: false, error: "Message vide." };
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "Message trop long." };
  }

  // Anti-spam : limite par IP (5 messages / heure). Best-effort (voir lib/rateLimit).
  const ip =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`guestbook:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return { ok: false, error: "Trop de messages. Réessaie plus tard." };
  }

  // Ce pseudo correspond-il à un joueur enregistré ? (recherche insensible à la casse)
  const player = await findPlayerByName(name);

  // ── Chemin JOUEUR : le pseudo existe dans players ────────────────────────────
  // On bloque le chemin invité pour TOUT pseudo enregistré, pas seulement ceux
  // qui ont un PIN — sinon un invité pourrait usurper un joueur sans PIN.
  if (player) {
    // Joueur sans PIN (donnée héritée) : aucune preuve d'identité possible → refus.
    if (!player.pin_hash) {
      return {
        ok: false,
        error: "Ce pseudo appartient à un joueur. Choisis-en un autre.",
      };
    }
    // Joueur avec PIN : on l'exige et on le vérifie.
    if (!/^\d{4,6}$/.test(pin)) return { ok: false, error: "PIN invalide." };
    const pinValid = await bcrypt.compare(pin, player.pin_hash);
    if (!pinValid) return { ok: false, error: "Identité non confirmée." };

    const { error } = await supabaseAdmin.from("guestbook").upsert(
      { player_name: name, message: text, updated_at: new Date().toISOString() },
      { onConflict: "player_name" },
    );
    if (error) {
      console.error("guestbook upsert (joueur):", error);
      return { ok: false, error: "Échec de l'enregistrement." };
    }
    return { ok: true };
  }

  // ── Chemin INVITÉ : pas de PIN, INSERT atomique ──────────────────────────────
  // Pas d'upsert : si le pseudo est déjà pris dans le livre d'or, la contrainte
  // d'unicité (code 23505) rejette → personne n'écrase le message d'un autre.
  const { error } = await supabaseAdmin.from("guestbook").insert({
    player_name: name,
    message: text,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Ce pseudo est déjà pris dans le livre d'or. Choisis-en un autre.",
      };
    }
    console.error("guestbook insert (invité):", error);
    return { ok: false, error: "Échec de l'enregistrement." };
  }
  return { ok: true };
}
