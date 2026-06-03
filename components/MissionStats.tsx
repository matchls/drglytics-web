"use client";
import { useState } from "react";
import Image from "next/image";
import { DashboardData, CLASS_COLORS, CLASS_ICONS, CLASS_NAMES, ClassName } from "@/lib/types";
import { usePrefs } from "@/lib/PrefsContext";
import { formatDistance, formatTime } from "@/lib/formatters";
import { useTranslation, TranslationKey } from "@/lib/i18n";
import { translateStatName } from "@/lib/i18n/data-translations";
import { MISSION_STAT_ICONS, STATS_HIDDEN, STATS_SORT_LAST } from "@/lib/missionIcons";

interface Props {
  missionStats: DashboardData["mission_stats"];
}

// Mapping labels backend (produits par get_stat_category_name()) → clés i18n
// Le backend renvoie stat.category = "Kills", "Missions", etc. (pas les clés MSC_*)
const CATEGORY_KEYS: Record<string, TranslationKey> = {
  "Kills":       "catKills",
  "Missions":    "catMissions",
  "Classes":     "catClasses",
  "Biomes":      "catBiomes",
  "Deep Dives":  "catDeepDives",
  "Mining":      "catMined",
  "Distance":    "catDistance",
  "Time":        "catTime",
  "Deaths":      "catDeaths",
  "Bar":         "catBar",
  "Forging":     "catForging",
  "Warnings":    "catWarnings",
  "Seasons":     "catSeasons",
  "Assignments": "catAssignments",
  "Purchases":   "catPurchases",
};

export default function MissionStats({ missionStats }: Props) {
  const { prefs } = usePrefs();
  const t = useTranslation();
  const categories = Array.from(
    new Set(Object.values(missionStats).map((s) => s.category)),
  );
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filteredStats = Object.values(missionStats)
    .filter((s) => s.category === activeCategory)
    // Masquer les stats indésirables (Hazard3, Hazard5, etc.)
    .filter((s) => !STATS_HIDDEN.has(s.name))
    // Pousser certaines stats en fin de liste
    .sort((a, b) => {
      const wa = STATS_SORT_LAST.has(a.name) ? 1 : 0;
      const wb = STATS_SORT_LAST.has(b.name) ? 1 : 0;
      return wa - wb;
    });

  function formatValue(value: number, unit?: string): string {
    if (unit === "cm") return formatDistance(value, prefs);
    if (unit === "s") return formatTime(value, prefs);
    return value.toLocaleString();
  }

  return (
    <div className="industrial-panel mt-6">
      {/* Header */}
      <div className="p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">
          analytics
        </span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          {t("employeeReport")}
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 flex-wrap p-4 border-b-4 border-outline">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 font-mono text-xs tracking-widest border-2 transition-colors
              ${
                activeCategory === cat
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container text-on-surface-variant border-outline hover:bg-surface-container-high"
              }`}
          >
            {CATEGORY_KEYS[cat] ? t(CATEGORY_KEYS[cat]) : cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b-4 border-outline text-on-surface-variant font-mono text-xs tracking-widest uppercase">
            <th className="p-4 text-left">{t("statName")}</th>
            <th className="p-4 text-right">{t("total")}</th>
            <th className="p-4 text-left w-1/3">{t("classBreakdown")}</th>
          </tr>
        </thead>
        <tbody>
          {filteredStats.map((stat) => {
            const total = CLASS_NAMES.reduce(
              (sum, c) => sum + (stat.by_class[c] ?? 0),
              0,
            );

            return (
              <tr
                key={stat.guid}
                className="border-b border-outline hover:bg-surface-container-high"
              >
                <td className="p-4 font-mono text-sm text-on-surface">
                  <div className="flex items-center gap-2">
                    {/* Icone de classe (catégorie MSC_Classes) */}
                    {CLASS_ICONS[stat.name as ClassName] && (
                      <Image
                        src={CLASS_ICONS[stat.name as ClassName]}
                        alt={stat.name}
                        width={24}
                        height={24}
                        className="opacity-80 flex-shrink-0"
                      />
                    )}
                    {/* Icone de mission (autres catégories) */}
                    {!CLASS_ICONS[stat.name as ClassName] && MISSION_STAT_ICONS[stat.name] && (
                      <Image
                        src={MISSION_STAT_ICONS[stat.name]}
                        alt={stat.name}
                        width={24}
                        height={24}
                        className="opacity-80 flex-shrink-0"
                      />
                    )}
                    {translateStatName(stat.name, prefs.language)}
                  </div>
                </td>
                <td className="p-4 font-mono text-sm text-primary text-right">
                  {formatValue(stat.total, stat.unit)}
                </td>
                <td className="p-4">
                  {/* Barre segmentée : chaque classe occupe sa part proportionnelle */}
                  <div className="flex h-4 w-full overflow-hidden border border-outline">
                    {total > 0 ? (
                      CLASS_NAMES.map((c) => {
                        const val = stat.by_class[c] ?? 0;
                        const pct = (val / total) * 100;
                        return pct > 0 ? (
                          <div
                            key={c}
                            title={`${c}: ${formatValue(val, stat.unit)}`}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: CLASS_COLORS[c],
                            }}
                          />
                        ) : null;
                      })
                    ) : (
                      <div className="w-full bg-primary" />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
