import "server-only";
// pinThrottle.ts — Anti-brute-force DURABLE du PIN (#30).
//
// Le PIN est l'unique facteur d'auth. Contrairement à lib/rateLimit.ts (en
// mémoire, perdu à chaque instance froide Vercel), l'état vit ici dans la table
// Supabase `pin_attempts` : il est PARTAGÉ entre toutes les instances serverless.
//
// ⚠️ Limite assumée (best-effort) : le comptage est un read-modify-write, donc
//    deux échecs strictement simultanés peuvent n'incrémenter qu'une fois (course).
//    Le verrou finit quand même par tomber ; on accepte ce léger sous-comptage,
//    comme rateLimit.ts. Une version atomique (RPC SQL) serait l'étape d'après.
import { supabaseAdmin } from "./supabaseServer";

const MAX_FAILURES = 5; // seuil avant verrouillage
const WINDOW_MS = 15 * 60 * 1000; // fenêtre glissante de 15 minutes

type AttemptRow = {
  failed_count: number;
  first_failed_at: string;
  locked_until: string | null;
};

/** Backoff exponentiel borné : 15 min → 30 min → 1 h → … → 24 h max. */
function lockDurationMs(failedCount: number): number {
  const steps = failedCount - MAX_FAILURES;
  const duration = WINDOW_MS * 2 ** steps;
  const MAX_LOCK_MS = 24 * 60 * 60 * 1000;
  return Math.min(duration, MAX_LOCK_MS);
}

/**
 * checkPinLock — le couple (joueur, IP) est-il actuellement verrouillé ?
 * À appeler AVANT bcrypt, pour ne pas offrir d'oracle de timing.
 */
export async function checkPinLock(
  playerName: string,
  ip: string,
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("pin_attempts")
    .select("locked_until")
    .eq("player_name", playerName)
    .eq("ip", ip)
    .maybeSingle();

  const lockedUntil = data?.locked_until;
  return !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();
}

/**
 * recordFailure — enregistre un échec : incrémente dans la fenêtre, repart à 1 si
 * elle a expiré, et pose le verrou dès que le seuil est atteint. Journalise.
 */
export async function recordFailure(
  playerName: string,
  ip: string,
): Promise<void> {
  const now = Date.now();

  const { data } = await supabaseAdmin
    .from("pin_attempts")
    .select("failed_count, first_failed_at, locked_until")
    .eq("player_name", playerName)
    .eq("ip", ip)
    .maybeSingle<AttemptRow>();

  // Fenêtre expirée (ou première fois) → on repart d'une fenêtre neuve à 1.
  const windowExpired =
    !data || now - new Date(data.first_failed_at).getTime() > WINDOW_MS;

  const failedCount = windowExpired ? 1 : data!.failed_count + 1;
  const firstFailedAt = windowExpired
    ? new Date(now).toISOString()
    : data!.first_failed_at;

  // Seuil atteint → on (re)pose un verrou dont la durée dépend de la politique.
  const lockedUntil =
    failedCount >= MAX_FAILURES
      ? new Date(now + lockDurationMs(failedCount)).toISOString()
      : (data?.locked_until ?? null);

  const { error } = await supabaseAdmin.from("pin_attempts").upsert(
    {
      player_name: playerName,
      ip,
      failed_count: failedCount,
      first_failed_at: firstFailedAt,
      locked_until: lockedUntil,
      updated_at: new Date(now).toISOString(),
    },
    { onConflict: "player_name,ip" },
  );

  if (error) {
    // On log mais on ne fait pas échouer la vérification pour autant :
    // un souci de compteur ne doit pas rendre l'auth indisponible.
    console.error("pinThrottle.recordFailure:", error);
  }

  // Journalisation serveur des échecs (sans révéler quoi que ce soit au client).
  console.warn(
    `[pin] échec #${failedCount} pour "${playerName}" depuis ${ip}` +
      (lockedUntil ? ` — verrouillé jusqu'à ${lockedUntil}` : ""),
  );
}

/**
 * clearAttempts — PIN correct : on efface le compteur pour repartir propre.
 */
export async function clearAttempts(
  playerName: string,
  ip: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("pin_attempts")
    .delete()
    .eq("player_name", playerName)
    .eq("ip", ip);

  if (error) console.error("pinThrottle.clearAttempts:", error);
}
