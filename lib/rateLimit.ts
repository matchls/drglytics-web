import "server-only";
import { supabaseAdmin } from "@/lib/supabaseServer";

/**
 * Vérifie le rate limit via la table Supabase `rate_limits`.
 * Atomique : fonctionne en environnement serverless multi-instances.
 *
 * @returns true si l'action est autorisée, false si la limite est dépassée.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_ms: windowMs,
  });

  if (error) {
    // Fail open : en cas d'erreur DB, on ne bloque pas les utilisateurs légitimes.
    // L'erreur est loggée pour alerte.
    console.error("[rate-limit] DB error:", error.message);
    return true;
  }

  return data as boolean;
}
