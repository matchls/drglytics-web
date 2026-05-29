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

const CLASS_ICONS: Record<string, string> = {
  Driller: "/icons/classes/driller_icon.png",
  Gunner: "/icons/classes/gunner_icon.png",
  Engineer: "/icons/classes/engineer_icon.png",
  Scout: "/icons/classes/scout_icon.png",
};

export default function OverclockList({ overclocks }: Props) {
  const t = useTranslation();
  const { prefs } = usePrefs();
  const totalForged = overclocks.forged_count;
  const [selectedClass, setSelectedClass] = useState<
    (typeof CLASS_NAMES)[number] | null
  >(null);

  function toggleClass(className: (typeof CLASS_NAMES)[number]) {
    setSelectedClass((prev) => (prev === className ? null : className));
  }

  return (
    <div className="industrial-panel flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b-4 border-outline flex items-center gap-3">
        <Image
          src="/icons/resources/overclock_core_icon.png"
          alt="Overclock core"
          width={28}
          height={28}
          className="opacity-90"
        />
        <p className="font-display text-xl text-on-surface tracking-widest">
          {t("forgeStatus")}
        </p>
      </div>

      {/* Filtres par classe */}
      <div className="px-4 pt-3 pb-1 flex gap-2 flex-wrap">
        {CLASS_NAMES.map((className) => (
          <button
            key={className}
            onClick={() => toggleClass(className)}
            style={
              selectedClass === className
                ? {
                    color: CLASS_COLORS[className],
                    borderColor: CLASS_COLORS[className],
                  }
                : {}
            }
            className={`font-display text-m tracking-widest px-3 py-1 border transition-colors flex items-center gap-1.5 ${
              selectedClass === className
                ? ""
                : "border-drg-border text-on-surface-variant hover:border-drg-orange"
            }`}
          >
            <Image
              src={CLASS_ICONS[className]}
              alt={className}
              width={30}
              height={30}
              className="opacity-80"
            />
            {className.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Liste scrollable */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {(selectedClass ? [selectedClass] : CLASS_NAMES).map((className) => {
          const forged = overclocks.forged_by_dwarf[className] ?? [];
          // Overclocks non-forgés : filtrés depuis le tableau plat par classe
          const unforged = overclocks.unforged.filter(
            (oc) => oc.dwarf === className,
          );
          const total = forged.length + unforged.length;

          if (total === 0) return null;

          return (
            <div key={className} className="flex flex-col gap-2">
              {/* Header par classe : icone + nom + compteur forgés / total */}
              <div className="flex items-center gap-2 border-b border-drg-border pb-1">
                <Image
                  src={CLASS_ICONS[className]}
                  alt={className}
                  width={20}
                  height={20}
                  className="opacity-80"
                />
                <p
                  className="font-display text-m tracking-widest"
                  style={{ color: CLASS_COLORS[className] }}
                >
                  {className.toUpperCase()}
                </p>
                <p className="font-mono text-xs text-on-surface-variant tracking-widest">
                  · {forged.length} {t("forged")} / {total}
                </p>
              </div>

              {/* Grille responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                {/* Overclocks forgés */}
                {forged.map((oc) => (
                  <div
                    key={oc.guid}
                    className="flex items-center gap-2 bg-surface-container-highest border border-outline p-2"
                  >
                    {WEAPON_ICONS[oc.weapon] && (
                      <Image
                        src={WEAPON_ICONS[oc.weapon]}
                        alt={oc.weapon}
                        width={80}
                        height={80}
                        className="opacity-80 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-on-surface truncate">
                        {translateOverclockName(oc.name, prefs.language)}
                      </p>
                      <p className="font-mono text-xs text-on-surface-variant truncate opacity-60">
                        {oc.weapon}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Overclocks non-forgés — grisés */}
                {unforged.map((oc) => (
                  <div
                    key={oc.guid}
                    className="flex items-center gap-2 bg-surface-container border border-outline p-2 opacity-40 grayscale"
                  >
                    {WEAPON_ICONS[oc.weapon] && (
                      <Image
                        src={WEAPON_ICONS[oc.weapon]}
                        alt={oc.weapon}
                        width={80}
                        height={80}
                        className="flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-on-surface truncate">
                        {translateOverclockName(oc.name, prefs.language)}
                      </p>
                      <p className="font-mono text-xs text-on-surface-variant truncate opacity-60">
                        {oc.weapon}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t-4 border-outline">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          {t("totalForged")}: {totalForged} /{" "}
          {totalForged + overclocks.unforged_count}
        </p>
      </div>
    </div>
  );
}
