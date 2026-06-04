import "server-only";
// getClientIp.ts — Extraction fiable de l'IP cliente pour les mécanismes de
// throttle côté serveur.
//
// Sur Vercel, X-Forwarded-For peut contenir plusieurs entrées séparées par des
// virgules. Le client peut PRÉFIXER la chaîne avec n'importe quelle valeur (ex :
// "fausse-ip, vraie-ip"). Vercel ajoute systématiquement l'IP réelle en DERNIÈRE
// position — c'est elle qui est fiable et non contrôlable par le client.
//
// On prend donc le DERNIER élément, pas le premier.
import { headers } from "next/headers";

/**
 * Renvoie l'adresse IP cliente fiable depuis les en-têtes HTTP Vercel.
 * Lit le dernier élément de X-Forwarded-For, posé par l'infrastructure Vercel
 * et non modifiable par le client.
 *
 * @returns l'IP sous forme de string, ou "unknown" si absente / non parseable
 */
export async function getClientIp(): Promise<string> {
  const reqHeaders = await headers();
  const forwarded = reqHeaders.get("x-forwarded-for");
  if (!forwarded) return "unknown";

  // Vercel ajoute l'IP réelle en dernière position — on la prend.
  const lastIp = forwarded.split(",").at(-1)?.trim();
  return lastIp || "unknown";
}
