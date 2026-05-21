"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-drg-panel border-b border-drg-border px-8 py-4 flex gap-6">
      <Link
        href="/"
        className={`uppercase font-bold tracking-widest transition-colors hover:text-drg-orange ${
          pathname === "/" ? "text-drg-orange" : "text-white"
        }`}
      >
        Upload
      </Link>
      <Link
        href="/dashboard"
        className={`uppercase font-bold tracking-widest transition-colors hover:text-drg-orange ${
          pathname === "/dashboard" ? "text-drg-orange" : "text-white"
        }`}
      >
        Profil
      </Link>
      <Link
        href="/leaderboard"
        className={`uppercase font-bold tracking-widest transition-colors hover:text-drg-orange ${
          pathname === "/leaderboard" ? "text-drg-orange" : "text-white"
        }`}
      >
        Leaderboard
      </Link>
    </nav>
  );
}
