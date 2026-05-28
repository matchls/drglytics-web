"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  '"ROCK AND STONE!"',
  '"FOR KARL!"',
  '"WE DIG IT."',
  '"MANAGEMENT APPROVES OF YOUR DEDICATION."',
  '"LEAF LOVER."',
  '"ANOTHER GLORIOUS DAY IN THE CORPS."',
];

export default function Footer() {
  const [time, setTime] = useState("");
  const [quote, setQuote] = useState("");
  const [depth, setDepth] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState("OPERATIVE");

  useEffect(() => {
    // Horloge
    const tick = () => setTime(new Date().toLocaleTimeString("fr-FR"));
    tick();
    const id = setInterval(tick, 1000);

    // Valeurs client-only (calculées une seule fois après le mount)
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setDepth(Math.floor(Math.random() * 3000) + 500);
    setPlayerName(sessionStorage.getItem("playerName") ?? "OPERATIVE");

    return () => clearInterval(id);
  }, []);

  return (
    <footer className="font-mono text-xs tracking-widest bg-surface-container border-t border-drg-border">
      {/* Bande haute */}
      <div className="flex justify-between px-4 py-1 border-b border-drg-border text-on-surface-variant">
        <span>
          TERMINAL_ID: {playerName.toUpperCase()}&nbsp;&nbsp;·&nbsp;&nbsp;OS:
          DRG_MAINFRAME_V4.2
        </span>
        <span className="text-drg-orange">{time}</span>
      </div>

      {/* Bande milieu */}
      <div className="flex justify-between px-4 py-1 border-b border-drg-border text-on-surface-variant">
        <span>
          SYSTEM STATUS: OPTIMAL&nbsp;&nbsp;·&nbsp;&nbsp;DEPTH: {depth} M
        </span>
        <span className="text-drg-orange">{quote}</span>
      </div>

      {/* Bande basse */}
      <div className="flex justify-between px-4 py-1 text-on-surface-variant opacity-60">
        <span>
          © DEEP ROCK GALACTIC — PROPERTY OF MANAGEMENT. SURVIVAL NOT
          GUARANTEED.
        </span>
        <span className="cursor-default">
          SAFETY WAIVERS&nbsp;&nbsp;·&nbsp;&nbsp;SURVIVOR
          CLAIMS&nbsp;&nbsp;·&nbsp;&nbsp;KARL MEMORIAL FUND
        </span>
      </div>
    </footer>
  );
}
