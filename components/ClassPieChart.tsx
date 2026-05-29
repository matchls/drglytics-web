"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DashboardData, CLASS_COLORS } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { usePrefs } from "@/lib/PrefsContext";
import { translateStatName } from "@/lib/data-translations";

interface Props {
  heroStats: DashboardData["hero_stats"];
  selectedStatKey: string | null;
}

export default function ClassPieChart({ heroStats, selectedStatKey }: Props) {
  const t = useTranslation();
  const { prefs } = usePrefs();

  // Aucune stat sélectionnée → message d'invite
  if (!selectedStatKey || !heroStats[selectedStatKey]) {
    return (
      <div className="industrial-panel p-4 flex items-center justify-center h-full">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest text-center">
          {t("clickStat")}
          <br />
          {t("toDetail")}
        </p>
      </div>
    );
  }

  const stat = heroStats[selectedStatKey];
  const byClass = stat.by_class ?? {};

  // Transformer { Driller: 120, Gunner: 80, ... } en [{ name, value }, ...]
  const data = Object.entries(byClass)
    .filter(([, value]) => value != null && value > 0)
    .map(([name, value]) => ({ name, value: value as number }));

  return (
    <div className="industrial-panel p-4 flex flex-col gap-2 h-full">
      <p className="font-display text-sm text-drg-orange tracking-widest border-b border-drg-border pb-2">
        {translateStatName(stat.label, prefs.language)}
      </p>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={CLASS_COLORS[entry.name as keyof typeof CLASS_COLORS]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1208",
              border: "1px solid #3d2a0f",
              borderRadius: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "#f5e6c8",
              letterSpacing: "0.1em",
            }}
            itemStyle={{ color: "#e8a320" }}
            cursor={false}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
