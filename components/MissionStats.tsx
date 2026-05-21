"use client";

import { useState } from "react";
import { DashboardData, CLASS_COLORS } from "@/lib/types";

interface Props {
  missionStats: DashboardData["mission_stats"];
}

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
    <div className="mt-8">
      <h2 className="text-2xl font-bold uppercase tracking-widest text-drg-orange mb-4">
        Mission Stats
      </h2>
      {/* Onglets */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 uppercase text-sm font-bold tracking-widest border ${
              activeCategory === cat
                ? "bg-drg-orange text-drg-dark border-drg-orange"
                : "bg-drg-panel text-white border-drg-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* Stats */}
      <div className="flex flex-col gap-4">
        {filteredStats.map((stat) => {
          const maxValue = Math.max(
            ...Object.values(stat.by_class).filter(
              (v): v is number => v !== undefined,
            ),
          );
          return (
            <div
              key={stat.guid}
              className="bg-drg-panel border border-drg-border rounded p-4"
            >
              <div className="flex justify-between mb-2">
                <span className="font-bold">{stat.name}</span>
                <span className="text-drg-orange font-bold">
                  {formatValue(stat.total, stat.unit)}
                </span>
              </div>
              {(["Driller", "Gunner", "Engineer", "Scout"] as const).map(
                (className) => {
                  const value = stat.by_class[className] ?? 0;
                  const percentage =
                    maxValue > 0 ? (value / maxValue) * 100 : 0;
                  return (
                    <div
                      key={className}
                      className="flex items-center gap-2 mt-1"
                    >
                      <span className="text-xs w-20 text-gray-400">
                        {className}
                      </span>
                      <div className="flex-1 bg-drg-dark rounded h-2">
                        <div
                          className="h-2 rounded"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: CLASS_COLORS[className],
                          }}
                        />
                      </div>
                      <span className="text-xs w-16 text-right">
                        {formatValue(value, stat.unit)}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
