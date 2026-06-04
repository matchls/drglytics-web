import "server-only";
// pinThrottle.ts — Anti-brute-force DURABLE du PIN (#30).
//
// sanitizeForLog — remplace les caractères de contrôle par "?" et borne la
// longueur pour éviter l'injection de fausses lignes de log via des données
// utilisateur (retours ligne, tabulations, séquences d'échappement).
function sanitizeForLog(value: string, maxLen = 80): string {
  return value
    .replace(/[\x00-\x1F\x7F]/g, "?")
    .slice(0, maxLen);
}
//
// Le PIN est l'unique facteur d'auth. Contrairement à lib/rateLimit.ts (en
// mémoire, perdu à chaque instance froide Vercel), l'état vit ici dans deux tables
// Supabase partagées entre toutes les instances serverless :
//   • pin_attempts        — compteur par (joueur, IP) ; verrou à 5 échecs / 15 min
//   • pin_global_attempts — compteur par joueur toutes IP confondues ;
//                           verrou à 20 échecs / 1 h (anti-rotation de proxies/VPN)
//
// L'incrément des deux compteurs est délégué à la RPC Postgres `record_pin_failure`
// (cf. sql/2026-06-04_pin-global-throttle.sql). La RPC utilise SELECT … FOR UPDATE
// pour garantir qu'aucune tentative concurrente ne peut être sous-comptée.
import { supabaseAdmin } from "./supabaseServer";

/**
 * checkPinLock — ce joueur/IP est-il actuellement verrouillé ?
 * Vérifie les deux niveaux en parallèle : verrou par IP ET verrou global par joueur.
 * À appeler AVANT bcrypt, pour ne pas offrir d'oracle de timing.
 */
export async function checkPinLock(
  playerName: string,
  ip: string,
): Promise<boolean> {
  const now = Date.now();

  const [{ data: ipData }, { data: globalData }] = await Promise.all([
    supabaseAdmin
      .from("pin_attempts")
      .select("locked_until")
      .eq("player_name", playerName)
      .eq("ip", ip)
      .maybeSingle(),
    supabaseAdmin
      .from("pin_global_attempts")
      .select("locked_until")
      .eq("player_name", playerName)
      .maybeSingle(),
  ]);

  const ipLocked =
    !!ipData?.locked_until && new Date(ipData.locked_until).getTime() > now;
  const globalLocked =
    !!globalData?.locked_until &&
    new Date(globalData.locked_until).getTime() > now;
  return ipLocked || globalLocked;
}

/**
 * recordFailure — enregistre un échec via la RPC atomique Postgres.
 * L'incrément, le calcul de fenêtre et le verrou sont entièrement délégués
 * à record_pin_failure (SELECT FOR UPDATE) : aucune race condition possible.
 */
export async function recordFailure(
  playerName: string,
  ip: string,
): Promise<void> {
  const { data, error } = await supabaseAdmin.rpc("record_pin_failure", {
    p_player_name: playerName,
    p_ip: ip,
  });

  if (error) {
    // "PGRST202" = fonction RPC introuvable → la RPC SQL n'a pas été déployée avant
    // le code. On refuse la vérification (fail-closed) pour ne pas laisser le
    // compteur anti-brute-force aveugle sans aucun signal visible.
    if (error.code === "PGRST202") {
      console.error("pinThrottle.recordFailure — RPC record_pin_failure absente en base. Déployer sql/2026-06-01_pin-attempts-rate-limit.sql avant le code.");
      throw new Error("PIN rate limiting unavailable");
    }
    // Erreur transitoire (réseau, timeout…) : on log sans bloquer l'auth.
    console.error("pinThrottle.recordFailure:", error);
    return;
  }

  const result = data as {
    failed_count: number;
    locked_until: string | null;
    global_count: number;
    global_locked_until: string | null;
  };
  const {
    failed_count: failedCount,
    locked_until: lockedUntil,
    global_count: globalCount,
    global_locked_until: globalLockedUntil,
  } = result;

  // Journalisation serveur des deux niveaux (sans révéler quoi que ce soit au client).
  // playerName et ip sont sanitisés pour éviter l'injection dans les logs.
  console.warn(
    `[pin] échec #${failedCount} (global: ${globalCount}) pour "${sanitizeForLog(playerName)}" depuis ${sanitizeForLog(ip)}` +
      (lockedUntil ? ` — verrou IP jusqu'à ${lockedUntil}` : "") +
      (globalLockedUntil ? ` — verrou global jusqu'à ${globalLockedUntil}` : ""),
  );
}

/**
 * clearAttempts — PIN correct : efface les deux compteurs pour repartir propre.
 * Le compteur global est réinitialisé également : le joueur s'est authentifié,
 * on ne pénalise plus ses tentatives futures depuis d'autres IPs.
 */
export async function clearAttempts(
  playerName: string,
  ip: string,
): Promise<void> {
  const [{ error: ipError }, { error: globalError }] = await Promise.all([
    supabaseAdmin
      .from("pin_attempts")
      .delete()
      .eq("player_name", playerName)
      .eq("ip", ip),
    supabaseAdmin
      .from("pin_global_attempts")
      .delete()
      .eq("player_name", playerName),
  ]);

  if (ipError) console.error("pinThrottle.clearAttempts (ip):", ipError);
  if (globalError)
    console.error("pinThrottle.clearAttempts (global):", globalError);
}
