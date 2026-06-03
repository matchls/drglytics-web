"use server";
// sendContactEmail — Envoi d'un message de contact (#31, Partie B).
//
// Exposé comme RPC : sans garde-fou, une boucle d'appels = email bombing,
// épuisement du quota Resend (facturé) et risque de blacklist du domaine.
// Trois défenses, du moins coûteux au plus coûteux pour un humain légitime :
//   1. Honeypot — un champ caché qu'un humain ne remplit jamais ; si rempli → bot.
//   2. Bornes de longueur — coupe les payloads géants.
//   3. Rate limiting par IP — plafonne le volume (best-effort, cf. lib/rateLimit).
import { Resend } from "resend";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

const MAX_PSEUDO_LENGTH = 32;
const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export type ContactResult = { success: true } | { success: false; error: string };

export async function sendContactEmail(
  pseudo: string,
  message: string,
  honeypot?: string,
): Promise<ContactResult> {
  // 1) Honeypot : champ invisible pour un humain. S'il contient quoi que ce soit,
  // c'est un bot. On renvoie un faux succès : le bot croit avoir réussi et ne
  // cherche pas à contourner, mais aucun email n'est envoyé.
  if (honeypot && honeypot.trim()) return { success: true };

  // 2) Validation + bornes de longueur (jamais confiance au client).
  const cleanPseudo = pseudo.trim();
  const cleanMessage = message.trim();
  if (!cleanPseudo || !cleanMessage) {
    return { success: false, error: "Pseudo et message requis." };
  }
  if (cleanMessage.length < 10) {
    return { success: false, error: "Message trop court (10 caractères minimum)." };
  }
  if (cleanPseudo.length > MAX_PSEUDO_LENGTH || cleanMessage.length > MAX_MESSAGE_LENGTH) {
    return { success: false, error: "Message trop long." };
  }

  // 3) Rate limiting par IP : 3 messages / heure. Best-effort (voir lib/rateLimit).
  const ip =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`contact:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return { success: false, error: "Trop de messages. Réessaie plus tard." };
  }

  const { error } = await resend.emails.send({
    from: "DRG Dashboard <onboarding@resend.dev>", // domaine Resend par défaut (sans domaine custom)
    to: "mathieu.chales@gmail.com",
    subject: `[DRG Dashboard] Message de ${cleanPseudo}`,
    text: `Pseudo : ${cleanPseudo}\n\n${cleanMessage}`,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error: "Erreur lors de l'envoi. Réessaie plus tard." };
  }

  return { success: true };
}
