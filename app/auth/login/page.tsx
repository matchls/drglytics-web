"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n";

function LoginForm() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    callbackError === "confirmation_failed" ? t("authConfirmExpired") : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-background industrial-grid flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="industrial-panel p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="font-display text-3xl text-on-surface tracking-widest">
              {t("authLoginTitle")}
            </p>
            <p className="font-mono text-xs text-on-surface-variant">
              {t("authLoginSubtitle")}
            </p>
          </div>

          {error && (
            <div className="bg-error-container border border-error p-3">
              <p className="font-mono text-xs text-on-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="login-email" className="font-mono text-xs text-on-surface-variant tracking-widest">
                EMAIL
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="login-password" className="font-mono text-xs text-on-surface-variant tracking-widest">
                {t("authPasswordLabel")}
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-on-primary font-display text-lg tracking-widest py-2 px-4 hover:bg-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t("authLoginBtnLoading") : t("authLoginBtn")}
            </button>
          </form>

          <p className="font-mono text-xs text-on-surface-variant text-center">
            {t("authLoginNoAccount")}{" "}
            <Link href="/auth/signup" className="text-primary hover:text-primary-fixed transition-colors">
              {t("authLoginCreateLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
