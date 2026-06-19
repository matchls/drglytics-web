"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Supabase envoie un email avec un lien vers /auth/callback?code=xxx
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Supabase a envoyé un email de confirmation
    setEmailSent(true);
    setLoading(false);
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background industrial-grid flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="industrial-panel p-8 flex flex-col gap-6">
            <span className="material-symbols-outlined text-primary text-4xl">
              mark_email_read
            </span>
            <div className="flex flex-col gap-2">
              <p className="font-display text-3xl text-on-surface tracking-widest">
                VÉRIFIE TON EMAIL
              </p>
              <p className="font-mono text-xs text-on-surface-variant leading-relaxed">
                Un lien de confirmation a été envoyé à{" "}
                <span className="text-primary">{email}</span>. Clique dessus
                pour activer ton compte.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="font-mono text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background industrial-grid flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="industrial-panel p-8 flex flex-col gap-6">
          {/* En-tête */}
          <div className="flex flex-col gap-1">
            <p className="font-display text-3xl text-on-surface tracking-widest">
              CRÉER UN COMPTE
            </p>
            <p className="font-mono text-xs text-on-surface-variant">
              Rejoins la communauté DRG
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-error-container border border-error p-3">
              <p className="font-mono text-xs text-on-error">{error}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-on-surface-variant tracking-widest">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-on-surface-variant tracking-widest">
                MOT DE PASSE
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange"
              />
              <p className="font-mono text-xs text-on-surface-variant">
                Minimum 8 caractères
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-on-primary font-display text-lg tracking-widest py-2 px-4 hover:bg-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "CRÉATION..." : "CRÉER MON COMPTE"}
            </button>
          </form>

          {/* Lien vers login */}
          <p className="font-mono text-xs text-on-surface-variant text-center">
            Déjà un compte ?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary-fixed transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
