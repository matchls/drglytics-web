"use client";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

const POINTS = ["privPoint1", "privPoint2", "privPoint3", "privPoint4"] as const;

export default function PrivacyBanner() {
  const t = useTranslation();
  return (
    <div className="industrial-panel p-4 border-l-4 border-primary">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">shield</span>
        <div className="flex flex-col gap-2 flex-1">
          <p className="font-display text-sm text-primary tracking-widest">
            {t("privTitle")}
          </p>
          <ul className="flex flex-col gap-1">
            {POINTS.map((key) => (
              <li key={key} className="font-mono text-xs text-on-surface-variant flex items-start gap-2">
                <span className="text-primary shrink-0">›</span>
                {t(key)}
              </li>
            ))}
          </ul>
          <Link
            href="/privacy"
            className="font-mono text-xs text-primary hover:underline tracking-widest self-start"
          >
            {t("privLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
