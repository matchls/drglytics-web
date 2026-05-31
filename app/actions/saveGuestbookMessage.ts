"use server";
// saveGuestbookMessage — Écriture VÉRIFIÉE d'un message du livre d'or.
//
// Différence avec savePlayerStats : ici, PAS de cas "création".
// Pour laisser un message au nom d'un joueur, il faut que ce joueur existe DÉJÀ
// (profil + PIN) et que le PIN saisi corresponde. Sinon on refuse.

import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseServer";

const MAX_MESSAGE_LENGTH = 200; // même limite que le maxLength du textarea

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
  if (!/^\d{4,6}$/.test(pin)) return { ok: false, error: "PIN invalide." };

  // Vérification du PIN contre le profil du joueur (table players).
  // data?.pin_hash absent → joueur inconnu ou sans PIN → identité non prouvée.
  const { data } = await supabaseAdmin
    .from("players")
    .select("pin_hash")
    .eq("player_name", name)
    .single();

  const pinValid = data?.pin_hash
    ? await bcrypt.compare(pin, data.pin_hash)
    : false;

  if (!pinValid) {
    return { ok: false, error: "Identité non confirmée." };
  }

  // Identité prouvée → on écrit via le client serveur (service_role).
  const { error } = await supabaseAdmin.from("guestbook").upsert(
    {
      player_name: name,
      message: text,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "player_name" },
  );

  if (error) {
    console.error("saveGuestbookMessage upsert error:", error);
    return { ok: false, error: "Échec de l'enregistrement." };
  }
  return { ok: true };
}
