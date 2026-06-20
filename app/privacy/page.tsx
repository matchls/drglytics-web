"use client";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { type TranslationKey } from "@/lib/i18n";

const SECTIONS: Array<{ title: TranslationKey; body: TranslationKey }> = [
  { title: "privSection1Title", body: "privSection1Body" },
  { title: "privSection2Title", body: "privSection2Body" },
  { title: "privSection3Title", body: "privSection3Body" },
  { title: "privSection4Title", body: "privSection4Body" },
  { title: "privSection5Title", body: "privSection5Body" },
];

export default function PrivacyPage() {
  const t = useTranslation();
  return (
    <div className="min-h-screen bg-background p-3 md:p-6 flex flex-col gap-4 md:gap-6">
      <div className="industrial-panel p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">shield</span>
        <p className="font-display text-2xl text-on-surface tracking-widest">
          {t("privFullTitle")}
        </p>
      </div>

      <div className="industrial-panel p-6 flex flex-col gap-6">
        {SECTIONS.map(({ title, body }) => (
          <div key={title}>
            <p className="font-display text-lg text-primary tracking-widest border-b border-drg-border pb-2 mb-3">
              {t(title)}
            </p>
            <p className="font-mono text-sm text-on-surface-variant leading-relaxed">
              {t(body)}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/"
        className="font-mono text-xs text-on-surface-variant hover:text-primary tracking-widest transition-colors self-start"
      >
        {t("privBackToTerminal")}
      </Link>
    </div>
  );
}
