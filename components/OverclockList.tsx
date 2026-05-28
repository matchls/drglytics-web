"use client";
import { OverclocksData, CLASS_NAMES, CLASS_COLORS } from "@/lib/types";
import { WEAPON_ICONS } from "@/lib/weaponIcons";
import { useTranslation } from "@/lib/i18n";
import { translateOverclockName } from "@/lib/data-translations";
import { usePrefs } from "@/lib/PrefsContext";
import Image from "next/image";
import { useState } from "react";

interface Props {
  overclocks: OverclocksData;
}

export default function OverclockList({ overclocks }: Props) {
  const t = useTranslation();
  const { prefs } = usePrefs();
  const totalForged = overclocks.forged_count;
  // null = toutes les classes affichées, sinon le nom de la classe sélectionnée
  const [selectedClass, setSelectedClass] = useState<
    (typeof CLASS_NAMES)[number] | null
  >(null);
  return (
    <div className="industrial-panel flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">
          construction
        </span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          {t("forgeStatus")}
        </p>
      </div>
      {/* Filtres par classe */}
      <div className="px-4 pt-3 pb-1 flex gap-2 flex-wrap">
        {/* Bouton "TOUTES" */}
        <button
          onClick={() => setSelectedClass(null)}
          className={`font-display text-xs tracking-widest px-2 py-1 border transition-colors ${
            selectedClass === null
              ? "border-drg-orange text-drg-orange"
              : "border-drg-border text-on-surface-variant hover:border-drg-orange"
          }`}
        >
          {t("allClasses")}
        </button>

        {/* Un bouton par classe */}
        {CLASS_NAMES.map((className) => (
          <button
            key={className}
            onClick={() => setSelectedClass(className)}
            style={
              selectedClass === className
                ? {
                    color: CLASS_COLORS[className],
                    borderColor: CLASS_COLORS[className],
                  }
                : {}
            }
            className={`font-display text-xs tracking-widest px-2 py-1 border transition-colors ${
              selectedClass === className
                ? ""
                : "border-drg-border text-on-surface-variant hover:border-drg-orange"
            }`}
          >
            {className.toUpperCase()}
          </button>
        ))}
      </div>
      {/* Liste scrollable */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {(selectedClass ? [selectedClass] : CLASS_NAMES).map((className) => {
          const classOverclocks = overclocks.forged_by_dwarf[className] ?? [];
          if (classOverclocks.length === 0) return null;

          return (
            <div key={className} className="flex flex-col gap-2">
              {/* Header par classe */}
              <p className="font-display text-sm text-drg-orange tracking-widest border-b border-drg-border pb-1">
                {className.toUpperCase()} · {classOverclocks.length} {t("forged")}
              </p>
              {/* Overclocks de cette classe */}
              {classOverclocks.map((oc) => (
                <div
                  key={oc.guid}
                  className="flex items-center gap-3 bg-surface-container-highest border border-outline p-2"
                >
                  {WEAPON_ICONS[oc.weapon] && (
                    <Image
                      src={WEAPON_ICONS[oc.weapon]}
                      alt={oc.weapon}
                      width={36}
                      height={36}
                      className="opacity-80"
                    />
                  )}
                  <div>
                    <p className="font-mono text-sm text-on-surface">
                      {translateOverclockName(oc.name, prefs.language)}
                    </p>
                    <p className="font-mono text-xs text-on-surface-variant">
                      {oc.weapon}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t-4 border-outline">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          {t("totalForged")}: {totalForged} / AVAILABLE SLOTS: ∞
        </p>
      </div>
    </div>
  );
}
