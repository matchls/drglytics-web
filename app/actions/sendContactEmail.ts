"use server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ContactResult = { success: true } | { success: false; error: string };

export async function sendContactEmail(
  pseudo: string,
  message: string,
): Promise<ContactResult> {
  // Validation basique côté serveur
  if (!pseudo.trim() || !message.trim()) {
    return { success: false, error: "Pseudo et message requis." };
  }
  if (message.trim().length < 10) {
    return { success: false, error: "Message trop court (10 caractères minimum)." };
  }

  const { error } = await resend.emails.send({
    from: "DRG Dashboard <onboarding@resend.dev>", // domaine Resend par défaut (sans domaine custom)
    to: "mathieu.chales@gmail.com",
    subject: `[DRG Dashboard] Message de ${pseudo}`,
    text: `Pseudo : ${pseudo}\n\n${message}`,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error: "Erreur lors de l'envoi. Réessaie plus tard." };
  }

  return { success: true };
}
