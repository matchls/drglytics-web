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

/**
 * lockDurationMs — combien de temps verrouiller, en fonction du nombre d'échecs.
 *
 * 👉 À TOI DE L'ÉCRIRE (voir le TODO ci-dessous). C'est LA décision de sécurité
 *    du #30 : la courbe de backoff. Quelques pistes et leurs compromis :
 *
 *    • Plat (toujours 15 min) : simple, mais un attaquant patient reprend
 *      pile 5 essais toutes les 15 min → ~480 essais/jour, encore beaucoup.
 *    • Progressif / exponentiel (15 min, puis 30, 1 h, 2 h…) : chaque palier
 *      franchi coûte de plus en plus cher → le brute-force devient non rentable,
 *      sans punir trop fort un joueur légitime qui se trompe une fois.
 *    • Pense à BORNER le maximum (ex. 24 h) pour ne pas verrouiller à vie sur
 *      faute de frappe répétée, et au confort d'un vrai joueur qui a oublié son PIN.
 *
 * @param failedCount nombre d'échecs cumulés dans la fenêtre (>= MAX_FAILURES ici)
 * @returns durée du verrou en millisecondes
 */
function lockDurationMs(failedCount: number): number {
  // 👉 À TOI DE TUNER cette courbe. Base de départ : backoff exponentiel borné.
  //   - On compte les paliers AU-DELÀ du seuil : 5e échec → palier 0, 6e → 1, etc.
  //   - Chaque palier double la durée : 15 min, 30 min, 1 h, 2 h…
  //   - Plafonné à 24 h pour ne pas verrouiller un vrai joueur « à vie ».
  const steps = failedCount - MAX_FAILURES; // 0 au premier verrouillage
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
