"use server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_MESSAGE_LENGTH = 200;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function saveGuestbookMessage(
  message: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const text = message.trim();
  if (!text) return { ok: false, error: "Message vide." };
  if (text.length > MAX_MESSAGE_LENGTH) return { ok: false, error: "Message trop long." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Non connecté." };

  // Rate limit par user ID (plus fiable que par IP)
  if (!checkRateLimit(`guestbook:${user.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return { ok: false, error: "Trop de messages. Réessaie plus tard." };
  }

  // Le player_name vient de la DB — le client ne peut pas le falsifier
  const { data: player } = await supabaseAdmin
    .from("players")
    .select("player_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!player) {
    return {
      ok: false,
      error: "Aucun joueur lié à ce compte. Upload ta save d'abord.",
    };
  }

  const { error } = await supabaseAdmin.from("guestbook").upsert(
    {
      player_name: player.player_name,
      message: text,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "player_name" },
  );

  if (error) {
    console.error("guestbook upsert:", error);
    return { ok: false, error: "Échec de l'enregistrement." };
  }

  return { ok: true };
}
