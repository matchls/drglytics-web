"use server";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { findPlayerByName } from "@/lib/playerLookup";
import { checkPinLock, recordFailure, clearAttempts } from "@/lib/pinThrottle";

// Toutes les lectures liées au PIN passent par le client serveur (service_role,
// dans findPlayerByName) et sont INSENSIBLES À LA CASSE : un pseudo est une
// identité, "Bob" et "BOB" désignent la même personne.

// Vérifie si un joueur existe et s'il a déjà un PIN
export async function checkPlayer(
  playerName: string,
): Promise<{ exists: boolean; hasPIN: boolean }> {
  const player = await findPlayerByName(playerName);
  if (!player) return { exists: false, hasPIN: false };
  return { exists: true, hasPIN: !!player.pin_hash };
}

// Vérifie que le PIN saisi correspond au hash stocké, avec anti-brute-force (#30).
//
// On normalise le pseudo (MAJUSCULES) pour que le compteur d'échecs vise bien
// l'identité, pas une variante de casse. On renvoie TOUJOURS la même forme
// d'erreur ({ valid: false }) — qu'on soit verrouillé, que le compte n'existe
// pas, ou que le PIN soit faux : aucun oracle pour l'attaquant.
export async function verifyPIN(
  playerName: string,
  pin: string,
): Promise<{ valid: boolean }> {
  const name = playerName.trim().toUpperCase();
  const ip =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // 1) Verrou AVANT toute chose : on ne fait même pas bcrypt si c'est verrouillé.
  if (await checkPinLock(name, ip)) return { valid: false };

  const player = await findPlayerByName(name);
  // Compte inexistant / sans PIN : on compte quand même l'échec, pour que sonder
  // des pseudos au hasard finisse aussi par verrouiller (anti-énumération).
  if (!player?.pin_hash) {
    await recordFailure(name, ip);
    return { valid: false };
  }

  const valid = await bcrypt.compare(pin, player.pin_hash);

  if (valid) {
    // Succès → on efface le compteur pour repartir propre.
    await clearAttempts(name, ip);
    return { valid: true };
  }

  // Échec → on incrémente (et on pose le verrou si le seuil est atteint).
  await recordFailure(name, ip);
  return { valid: false };
}
