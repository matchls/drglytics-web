"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getDashboardSession } from "@/lib/session";

export default function SideNav() {
  const pathname = usePathname();
  const t = useTranslation();
  const [playerName, setPlayerName] = useState("DEEP ROCK GALACTIC");

  // navItems est défini ici car il utilise t() pour les labels traduits
  const navItems = [
    { label: t("navTerminal"), href: "/", icon: "terminal", active: true },
    {
      label: t("navMissionControl"),
      href: "/dashboard",
      icon: "radar",
      active: true,
    },
    {
      label: t("navAbyssBar"),
      href: "/abyss-bar",
      icon: "local_bar",
      active: true,
    },
    {
      label: t("navMemorial"),
      href: "/leaderboard",
      icon: "military_tech",
      active: true,
    },
  ];

  useEffect(() => {
    const session = getDashboardSession();
    if (session) {
      // On affiche le nom porté par les stats (data.player.name), pas le pseudo
      // saisi à l'upload (session.name) — comportement historique conservé.
      setPlayerName(session.data.player?.name ?? "DEEP ROCK GALACTIC");
    }
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
              href={item.active ? item.href : "#"}
              onClick={!item.active ? (e) => e.preventDefault() : undefined}
              className={`flex items-center gap-3 px-6 py-3 transition-colors
                ${
                  isActive
                    ? "bg-primary-container border-l-4 border-primary text-primary"
                    : "border-l-4 border-transparent text-on-surface hover:bg-surface-container-high"
                }
                ${!item.active ? "opacity-40 cursor-not-allowed" : ""}
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

      {/*   <div className="p-4 border-t-4 border-outline">
        <Link
          href="/"
          className="block w-full bg-primary text-on-primary text-center font-display text-lg py-2 tracking-widest hover:bg-primary-fixed transition-colors"
        >
          {t("navStartMission")}
        </Link>
      </div> */}
    </aside>
  );
}
