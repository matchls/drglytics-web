"use server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseServer";

// Toutes les lectures liées au PIN passent par le client serveur (service_role) :
// le rôle anon n'a ainsi jamais besoin de lire la colonne pin_hash.

// Vérifie si un joueur existe et s'il a déjà un PIN
export async function checkPlayer(
  playerName: string,
): Promise<{ exists: boolean; hasPIN: boolean }> {
  const { data } = await supabaseAdmin
    .from("players")
    .select("pin_hash")
    .eq("player_name", playerName.trim().toUpperCase())
    .single();

  if (!data) return { exists: false, hasPIN: false };
  return { exists: true, hasPIN: !!data.pin_hash };
}

// Vérifie que le PIN saisi correspond au hash stocké
export async function verifyPIN(
  playerName: string,
  pin: string,
): Promise<{ valid: boolean }> {
  const { data } = await supabaseAdmin
    .from("players")
    .select("pin_hash")
    .eq("player_name", playerName.trim().toUpperCase())
    .single();

  if (!data?.pin_hash) return { valid: false };

  const valid = await bcrypt.compare(pin, data.pin_hash);
  return { valid };
}
