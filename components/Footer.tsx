"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const t = useTranslation();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("fr-FR"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="font-mono text-xs tracking-widest bg-surface-container border-t border-drg-border">
      <div className="flex justify-between px-4 py-1 text-on-surface-variant opacity-60">
        <span>{t("footerCopyright")}</span>
        <span className="text-drg-orange opacity-100">{time}</span>
      </div>
    </footer>
  );
}
