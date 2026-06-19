"use client";
import Link from "next/link";
import QuoteTypewriter from "@/components/QuoteTypewriter";
import { logout } from "@/app/actions/logout";

interface TopBarProps {
  userEmail: string | null;
}

export default function TopBar({ userEmail }: TopBarProps) {
  return (
    <header className="h-14 bg-surface-container-high border-b-4 border-outline flex items-center px-6 gap-4">
      {/* Citation animée — prend tout l'espace central */}
      <QuoteTypewriter />

      {/* Zone auth — à droite de la citation, avant settings */}
      <div className="shrink-0 flex items-center gap-3">
        {userEmail ? (
          <>
            <span className="material-symbols-outlined text-primary">account_circle</span>
            <span className="font-mono text-xs text-on-surface-variant hidden sm:block">
              {userEmail}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-on-surface-variant hover:text-drg-orange transition-colors"
                title="Se déconnecter"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="text-on-surface-variant hover:text-drg-orange transition-colors"
            title="Se connecter"
          >
            <span className="material-symbols-outlined">login</span>
          </Link>
        )}
      </div>

      {/* Settings — fixe à droite */}
      <div className="shrink-0">
        <Link
          href="/options"
          className="text-on-surface-variant hover:text-drg-orange transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </div>
    </header>
  );
}
