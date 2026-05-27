"use client";
import { useState } from "react";
import { DashboardData, CLASS_COLORS } from "@/lib/types";

interface Props {
  missionStats: DashboardData["mission_stats"];
}

// Traduction des clés backend → labels affichés
const CATEGORY_LABELS: Record<string, string> = {
  MSC_Missions: "MISSIONS",
  MSC_Bioms: "BIOMES",
  MSC_Warnings: "WARNINGS",
  MSC_Mined: "EXTRACTED DATA",
  MSC_Seasons: "SEASONS",
  MSC_Forging: "FORGING",
  MSC_Assignments: "ASSIGNMENTS",
  MSC_DeepDives: "DEEP DIVES",
};

export default function MissionStats({ missionStats }: Props) {
  const categories = Array.from(
    new Set(Object.values(missionStats).map((s) => s.category)),
  );
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filteredStats = Object.values(missionStats).filter(
    (s) => s.category === activeCategory,
  );

  function formatValue(value: number, unit?: string): string {
    if (unit === "cm") return (value / 100000).toFixed(1) + " km";
    if (unit === "s") {
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
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
          EMPLOYEE PERFORMANCE REPORT
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
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b-4 border-outline text-on-surface-variant font-mono text-xs tracking-widest uppercase">
            <th className="p-4 text-left">Stat Name</th>
            <th className="p-4 text-right">Total</th>
            <th className="p-4 text-left w-1/3">Class Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {filteredStats.map((stat) => {
            const classes = ["Driller", "Gunner", "Engineer", "Scout"] as const;
            const total = classes.reduce(
              (sum, c) => sum + (stat.by_class[c] ?? 0),
              0,
            );

            return (
              <tr
                key={stat.guid}
                className="border-b border-outline hover:bg-surface-container-high"
              >
                <td className="p-4 font-mono text-sm text-on-surface">
                  {stat.name}
                </td>
                <td className="p-4 font-mono text-sm text-primary text-right">
                  {formatValue(stat.total, stat.unit)}
                </td>
                <td className="p-4">
                  {/* Barre segmentée : chaque classe occupe sa part proportionnelle */}
                  <div className="flex h-4 w-full overflow-hidden border border-outline">
                    {total > 0 ? (
                      classes.map((c) => {
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
