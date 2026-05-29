"use server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// Client Supabase côté serveur — utilise les variables d'env (jamais exposées au navigateur)
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Vérifie si un joueur existe et s'il a déjà un PIN
export async function checkPlayer(
  playerName: string,
): Promise<{ exists: boolean; hasPIN: boolean }> {
  const { data } = await supabaseServer
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
  const { data } = await supabaseServer
    .from("players")
    .select("pin_hash")
    .eq("player_name", playerName.trim().toUpperCase())
    .single();

  if (!data?.pin_hash) return { valid: false };

  const valid = await bcrypt.compare(pin, data.pin_hash);
  return { valid };
}

// Hash un PIN pour le stocker en base — bcrypt avec 10 rounds
export async function hashPIN(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}
