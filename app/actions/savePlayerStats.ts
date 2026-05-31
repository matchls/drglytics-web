"use server";
// savePlayerStats — Écriture AUTORISÉE des stats d'un joueur (remplace l'upsert
// qui partait du navigateur dans app/dashboard/page.tsx).
//
// Tout se passe ici, côté serveur : on VÉRIFIE le PIN puis on ÉCRIT, dans le même
// appel. Le navigateur ne touche plus jamais directement à la table players.

import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseServer";

// Résultat de la porte d'autorisation.
// - "create"  : nouveau joueur → on devra stocker le hash du PIN fourni
// - "update"  : joueur existant, PIN correct → mise à jour autorisée
// - "denied"  : PIN incorrect → on refuse
type AuthDecision =
  | { kind: "create" }
  | { kind: "update" }
  | { kind: "denied" };

/**
 * La PORTE D'AUTORISATION.
 *
 * Décide si l'écriture sur le joueur `playerName` est permise, à partir du PIN fourni.
 * C'est le cœur de sécurité de l'issue #29.
 *
 * @param playerName - pseudo NORMALISÉ (déjà .trim().toUpperCase() par l'appelant)
 * @param pin        - le PIN saisi par l'utilisateur (4–6 chiffres)
 * @returns AuthDecision
 *
 * Indices :
 *   - Lire le pin_hash existant :
 *       const { data } = await supabaseAdmin
 *         .from("players").select("pin_hash").eq("player_name", playerName).single();
 *   - Comparer un PIN à un hash bcrypt : await bcrypt.compare(pin, hash)  → booléen
 *   - Couvre les 3 cas du tableau : pas de joueur / PIN ok / PIN faux.
 */
async function authorizeWrite(
  playerName: string,
  pin: string,
): Promise<AuthDecision> {
  // 1. On demande à la base le pin_hash de ce joueur (et rien d'autre).
  const { data } = await supabaseAdmin
    .from("players")
    .select("pin_hash")
    .eq("player_name", playerName)
    .single();

  // 2. Pas de ligne trouvée, OU ligne sans pin_hash → personne ne "possède"
  //    encore ce pseudo : c'est une création, on autorise.
  //    (Le ?. évite de planter si data est null ; on teste AVANT bcrypt.compare.)
  if (!data?.pin_hash) {
    return { kind: "create" };
  }

  // 3. Le joueur existe et a un PIN : le PIN saisi correspond-il au hash stocké ?
  const pinMatches = await bcrypt.compare(pin, data.pin_hash);
  return pinMatches ? { kind: "update" } : { kind: "denied" };
}

/**
 * Enregistre les stats d'un joueur, APRÈS vérification du PIN côté serveur.
 * Appelée depuis le navigateur (server action), mais toute la sécurité vit ici.
 *
 * @param playerName - pseudo brut saisi par l'utilisateur
 * @param pin        - PIN saisi (4–6 chiffres)
 * @param stats      - les colonnes déjà construites côté client (total_kills, etc.),
 *                     SANS player_name ni pin_hash : ces deux-là sont gérés ici.
 */
export async function savePlayerStats(
  playerName: string,
  pin: string,
  stats: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // On normalise le pseudo de la MÊME façon partout (clé d'unicité de la table).
  const name = playerName.trim().toUpperCase();

  // Validation serveur — on ne fait jamais confiance à ce que le client a validé.
  if (!name) {
    return { ok: false, error: "Pseudo requis." };
  }
  if (!/^\d{4,6}$/.test(pin)) {
    return { ok: false, error: "PIN invalide." };
  }

  // La porte d'autorisation décide : création, mise à jour, ou refus.
  const decision = await authorizeWrite(name, pin);
  if (decision.kind === "denied") {
    // Message volontairement vague : on ne dit pas POURQUOI (cf. anti-énumération).
    return { ok: false, error: "Identité non confirmée." };
  }

  // On construit la ligne à écrire. Deux colonnes sont SOUS CONTRÔLE SERVEUR :
  const row: Record<string, unknown> = {
    ...stats,
    player_name: name, // on écrase tout player_name que le client aurait glissé
  };
  delete row.pin_hash; // on jette tout pin_hash venu du client : il ne le contrôle jamais

  // Création seulement : c'est le serveur qui hache le PIN, jamais le navigateur.
  if (decision.kind === "create") {
    row.pin_hash = await bcrypt.hash(pin, 10);
  }

  const { error } = await supabaseAdmin
    .from("players")
    .upsert(row, { onConflict: "player_name" });

  if (error) {
    // On loggue le détail côté serveur, mais on ne le renvoie pas au client (cf. erreurs verbeuses).
    console.error("savePlayerStats upsert error:", error);
    return { ok: false, error: "Échec de l'enregistrement." };
  }

  return { ok: true };
}
