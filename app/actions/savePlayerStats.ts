"use server";
// savePlayerStats — Écriture AUTORISÉE des stats d'un joueur (remplace l'upsert
// qui partait du navigateur dans app/dashboard/page.tsx).
//
// Tout se passe ici, côté serveur : on VÉRIFIE le PIN puis on ÉCRIT, dans le même
// appel. Le navigateur ne touche plus jamais directement à la table players.
//
// Casse : un pseudo est une IDENTITÉ. "Poussif", "poussif" et "POUSSIF" désignent
// la même personne. La recherche se fait donc en insensible à la casse (via
// findPlayerByName), mais on STOCKE le pseudo tel que tapé pour garder un joli
// gamertag lisible. L'unicité réelle est garantie côté base par un index unique
// sur lower(player_name) (cf. sql/2026-05-31_player-name-case-insensitive.sql).

import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { findPlayerByName, type PlayerRecord } from "@/lib/playerLookup";

// Résultat de la porte d'autorisation.
// - "denied" : PIN incorrect → on refuse.
// - "write"  : écriture autorisée. Deux infos l'accompagnent :
//     • existing   : la ligne DÉJÀ présente (avec sa casse d'origine), ou null si
//                    le pseudo est tout neuf. Décide INSERT vs UPDATE ciblé.
//     • setPinHash : faut-il hacher et stocker le PIN fourni ? Vrai pour un nouveau
//                    joueur OU un ancien joueur "sans PIN" qui prend possession.
type AuthDecision =
  | { kind: "denied" }
  | { kind: "write"; existing: PlayerRecord | null; setPinHash: boolean };

/**
 * La PORTE D'AUTORISATION.
 *
 * Décide si l'écriture sur le joueur `playerName` est permise, à partir du PIN fourni.
 * C'est le cœur de sécurité de l'issue #29.
 *
 * @param playerName - pseudo brut saisi (juste .trim() par l'appelant, casse conservée)
 * @param pin        - le PIN saisi par l'utilisateur (4–6 chiffres)
 * @returns AuthDecision
 */
async function authorizeWrite(
  playerName: string,
  pin: string,
): Promise<AuthDecision> {
  // Recherche INSENSIBLE À LA CASSE : on récupère la ligne existante quelle que
  // soit la casse stockée. C'est ce qui empêche de re-créer "POUSSIF" à côté de
  // "Poussif" (le bug de doublons).
  const existing = await findPlayerByName(playerName);

  // Personne ne "possède" encore ce pseudo : soit aucune ligne (existing === null),
  // soit une ligne héritée SANS pin_hash. Dans les deux cas, on autorise et on
  // posera le PIN fourni (prise de possession).
  if (!existing?.pin_hash) {
    return { kind: "write", existing, setPinHash: true };
  }

  // Le joueur existe et a un PIN : le PIN saisi doit correspondre au hash stocké.
  const pinMatches = await bcrypt.compare(pin, existing.pin_hash);
  return pinMatches
    ? { kind: "write", existing, setPinHash: false }
    : { kind: "denied" };
}

/**
 * Enregistre les stats d'un joueur, APRÈS vérification du PIN côté serveur.
 * Appelée depuis le navigateur (server action), mais toute la sécurité vit ici.
 *
 * @param playerName - pseudo brut saisi par l'utilisateur (casse conservée)
 * @param pin        - PIN saisi (4–6 chiffres)
 * @param stats      - les colonnes déjà construites côté client (total_kills, etc.),
 *                     SANS player_name ni pin_hash : ces deux-là sont gérés ici.
 */
export async function savePlayerStats(
  playerName: string,
  pin: string,
  stats: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // On garde la casse telle que tapée (juste un trim). La comparaison d'identité,
  // elle, est insensible à la casse — c'est authorizeWrite qui s'en charge.
  const name = playerName.trim();

  // Validation serveur — on ne fait jamais confiance à ce que le client a validé.
  if (!name) {
    return { ok: false, error: "Pseudo requis." };
  }
  if (!/^\d{4,6}$/.test(pin)) {
    return { ok: false, error: "PIN invalide." };
  }

  // La porte d'autorisation décide : écriture autorisée (avec ou sans pose du PIN),
  // ou refus.
  const decision = await authorizeWrite(name, pin);
  if (decision.kind === "denied") {
    // Message volontairement vague : on ne dit pas POURQUOI (cf. anti-énumération).
    return { ok: false, error: "Identité non confirmée." };
  }

  // On construit la ligne à écrire. Deux colonnes sont SOUS CONTRÔLE SERVEUR :
  const row: Record<string, unknown> = { ...stats };
  delete row.pin_hash; // on jette tout pin_hash venu du client : il ne le contrôle jamais
  delete row.player_name; // l'identité n'est jamais pilotée par le client

  // Pose du PIN : c'est le serveur qui hache, jamais le navigateur.
  if (decision.setPinHash) {
    row.pin_hash = await bcrypt.hash(pin, 10);
  }

  let error;
  if (decision.existing) {
    // Une ligne existe déjà (même pseudo à la casse près) → UPDATE CIBLÉ sur son
    // nom EXACT tel qu'il est stocké. On ne crée donc jamais de doublon, et on
    // préserve la casse d'affichage d'origine (identité stable).
    ({ error } = await supabaseAdmin
      .from("players")
      .update(row)
      .eq("player_name", decision.existing.player_name));
  } else {
    // Aucune ligne → INSERT avec le pseudo TEL QUE TAPÉ (casse conservée).
    // L'index unique sur lower(player_name) reste le filet de sécurité ultime.
    row.player_name = name;
    ({ error } = await supabaseAdmin.from("players").insert(row));
  }

  if (error) {
    // On loggue le détail côté serveur, mais on ne le renvoie pas au client (cf. erreurs verbeuses).
    console.error("savePlayerStats write error:", error);
    return { ok: false, error: "Échec de l'enregistrement." };
  }

  return { ok: true };
}
