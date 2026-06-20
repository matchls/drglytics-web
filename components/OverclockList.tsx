"use client";
import { OverclocksData, CLASS_NAMES, CLASS_COLORS, CLASS_ICONS, ClassName } from "@/lib/types";
import { WEAPON_ICONS } from "@/lib/weaponIcons";
import { useTranslation } from "@/lib/i18n";
import { translateOverclockName } from "@/lib/i18n/data-translations";
import { usePrefs } from "@/lib/PrefsContext";
import Image from "next/image";
import { useState, useMemo } from "react";

const MINERAL_ICONS: Record<string, string> = {
  credits: "/icons/misc/credit.png",
  bismor: "/icons/resources/bismor_icon.png",
  croppa: "/icons/resources/croppa_icon.png",
  enor: "/icons/resources/enor_pearl_icon.png",
  jadiz: "/icons/resources/jadiz_icon.png",
  magnite: "/icons/resources/magnite_icon.png",
  umanite: "/icons/resources/umanite_icon.png",
};

interface Props {
  overclocks: OverclocksData;
}

export default function OverclockList({ overclocks }: Props) {
  const t = useTranslation();
  const { prefs } = usePrefs();
  const totalForged = overclocks.forged_count;
  const totalOC = totalForged + overclocks.unforged_count;
  const globalPct = totalOC > 0 ? Math.round((totalForged / totalOC) * 100) : 0;

  const [selectedClass, setSelectedClass] = useState<ClassName | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);

  function toggleClass(className: ClassName) {
    setSelectedClass((prev) => (prev === className ? null : className));
    setSelectedWeapon(null);
  }

  // Liste des armes présentes dans les classes visibles (forgées + non-forgées)
  const allWeapons = useMemo(() => {
    const classes = selectedClass ? [selectedClass] : [...CLASS_NAMES];
    const weapons = new Set<string>();
    overclocks.forged.forEach((oc) => {
      if (classes.includes(oc.dwarf as ClassName)) weapons.add(oc.weapon);
    });
    overclocks.unforged.forEach((oc) => {
      if (classes.includes(oc.dwarf as ClassName)) weapons.add(oc.weapon);
    });
    return [...weapons].sort();
  }, [selectedClass, overclocks]);

  return (
    <div className="industrial-panel flex flex-col h-full">
      {/* Header — forge status + progression globale */}
      <div className="p-4 border-b-4 border-outline">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/icons/resources/overclock_core_icon.png"
            alt="Overclock core"
            width={28}
            height={28}
            className="opacity-90"
          />
          <p className="font-display text-xl text-on-surface tracking-widest flex-1">
            {t("forgeStatus")}
          </p>
          <p className="font-mono text-xs text-on-surface-variant tracking-widest">
            {totalForged} / {totalOC} · {globalPct}%
          </p>
        </div>
        {/* Barre de progression globale */}
        <div className="h-2 bg-surface-container-highest overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${globalPct}%` }}
          />
        </div>
      </div>

      {/* Filtre par classe */}
      <div className="px-4 pt-3 pb-1 flex gap-2 flex-wrap">
        {CLASS_NAMES.map((className) => (
          <button
            key={className}
            onClick={() => toggleClass(className)}
            style={
              selectedClass === className
                ? { color: CLASS_COLORS[className], borderColor: CLASS_COLORS[className] }
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

      {/* Filtre par arme */}
      <div className="px-4 pb-2">
        <select
          value={selectedWeapon ?? ""}
          onChange={(e) => setSelectedWeapon(e.target.value || null)}
          className="w-full bg-surface-container border border-drg-border text-on-surface-variant font-mono text-xs p-1.5 focus:outline-none focus:border-drg-orange"
        >
          <option value="">{t("ocAllWeapons")}</option>
          {allWeapons.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      {/* Liste scrollable */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {(selectedClass ? [selectedClass] : CLASS_NAMES).map((className) => {
          const allForged = overclocks.forged_by_dwarf[className] ?? [];
          const allUnforged = overclocks.unforged.filter((oc) => oc.dwarf === className);
          const totalClass = allForged.length + allUnforged.length;
          if (totalClass === 0) return null;

          // Application du filtre arme
          const forged = selectedWeapon
            ? allForged.filter((oc) => oc.weapon === selectedWeapon)
            : allForged;
          const unforged = selectedWeapon
            ? allUnforged.filter((oc) => oc.weapon === selectedWeapon)
            : allUnforged;

          if (forged.length === 0 && unforged.length === 0) return null;

          const classPct = Math.round((allForged.length / totalClass) * 100);

          return (
            <div key={className} className="flex flex-col gap-2">
              {/* Header par classe : icône + nom + barre de progression */}
              <div className="flex flex-col gap-1 border-b border-drg-border pb-2">
                <div className="flex items-center gap-2">
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
                  <p className="font-mono text-xs text-on-surface-variant tracking-widest ml-auto">
                    {allForged.length} / {totalClass} · {classPct}%
                  </p>
                </div>
                <div className="h-1.5 bg-surface-container-highest overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${classPct}%`,
                      backgroundColor: CLASS_COLORS[className],
                    }}
                  />
                </div>
              </div>

              {/* Grille responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                {/* Forgés */}
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

                {/* Non-forgés — grisés + coûts si disponibles */}
                {unforged.map((oc) => {
                  const costEntries = oc.cost
                    ? Object.entries(oc.cost).filter(([, v]) => v > 0)
                    : [];
                  return (
                    <div
                      key={oc.guid}
                      className="flex flex-col gap-1 bg-surface-container border border-outline p-2 opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        {WEAPON_ICONS[oc.weapon] && (
                          <Image
                            src={WEAPON_ICONS[oc.weapon]}
                            alt={oc.weapon}
                            width={80}
                            height={80}
                            className="grayscale flex-shrink-0"
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
                      {costEntries.length > 0 && (
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                          {costEntries.map(([mineral, amount]) => (
                            <span
                              key={mineral}
                              className="flex items-center gap-0.5 font-mono text-[10px] text-on-surface-variant"
                            >
                              {MINERAL_ICONS[mineral] && (
                                <Image
                                  src={MINERAL_ICONS[mineral]}
                                  alt={mineral}
                                  width={12}
                                  height={12}
                                />
                              )}
                              {amount.toLocaleString()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t-4 border-outline flex items-center justify-between">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          {t("totalForged")}: {totalForged} / {totalOC}
        </p>
        {overclocks.unforged_count > 0 && (
          <p className="font-mono text-xs text-on-surface-variant tracking-widest">
            {overclocks.unforged_count} {t("ocRemaining")}
          </p>
        )}
      </div>
    </div>
  );
}
