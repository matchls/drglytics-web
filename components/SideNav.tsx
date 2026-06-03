"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getCurrentIdentity } from "@/lib/session";

export default function SideNav() {
  const pathname = usePathname();
  const t = useTranslation();
  const [playerName, setPlayerName] = useState("DEEP ROCK GALACTIC");

  // navItems est défini ici car il utilise t() pour les labels traduits
  const navItems = [
    { label: t("navTerminal"), href: "/", icon: "terminal" },
    { label: t("navMissionControl"), href: "/dashboard", icon: "radar" },
    { label: t("navAbyssBar"), href: "/abyss-bar", icon: "local_bar" },
    { label: t("navMemorial"), href: "/leaderboard", icon: "military_tech" },
  ];

  useEffect(() => {
    // Source de vérité unique : on affiche le pseudo de l'identité courante
    // (session puis préférence), aligné avec l'abyss-bar et le leaderboard.
    const id = getCurrentIdentity();
    if (id.displayName) setPlayerName(id.displayName);
  }, []);

  return (
    <aside className="w-64 min-h-screen bg-surface-container flex flex-col border-r-4 border-outline">
      {/* Header */}
      <div className="p-6 border-b-4 border-outline">
        <p className="text-s tracking-[0.3em] text-on-surface-variant uppercase">
          {t("navSpaceRigProfile")}
        </p>
        <p className="font-display text-4xl text-primary truncate">
          {playerName}
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition-colors
                ${
                  isActive
                    ? "bg-primary-container border-l-4 border-primary text-primary"
                    : "border-l-4 border-transparent text-on-surface hover:bg-surface-container-high"
                }
              `}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span className="font-mono text-sm tracking-widest">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
