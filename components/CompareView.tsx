"use client";
import { DashboardData, CLASS_NAMES, CLASS_COLORS, CLASS_ICONS } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { usePrefs } from "@/lib/PrefsContext";
import { formatDistance, formatTime } from "@/lib/formatters";
import Image from "next/image";

interface Props {
  nameA: string;
  nameB: string;
  dataA: DashboardData;
  dataB: DashboardData;
}

type StatDef = {
  key: string;
  label: string;
  getVal: (d: DashboardData) => number;
  fmt: (n: number) => string;
  lowerIsBetter?: boolean;
};

function WinBadge({ wins }: { wins: "a" | "b" | "tie" }) {
  if (wins === "tie") return null;
  return (
    <span className="font-mono text-[10px] text-primary tracking-widest ml-1">
      ◀
    </span>
  );
}

export default function CompareView({ nameA, nameB, dataA, dataB }: Props) {
  const t = useTranslation();
  const { prefs } = usePrefs();

  const statDefs: StatDef[] = [
    {
      key: "missions",
      label: t("catMissions"),
      getVal: (d) => d.hero_stats.MS_Completed_TotalMissions?.total ?? 0,
      fmt: (n) => n.toLocaleString(),
    },
    {
      key: "kills",
      label: t("catKills"),
      getVal: (d) => d.hero_stats.MS_Killed_TotalEnemies?.total ?? 0,
      fmt: (n) => n.toLocaleString(),
    },
    {
      key: "time",
      label: t("catTime"),
      getVal: (d) => d.hero_stats.MS_TimePlayed?.total ?? 0,
      fmt: (n) => formatTime(n, prefs),
    },
    {
      key: "distance",
      label: t("distanceLabel"),
      getVal: (d) => d.hero_stats.MS_DistanceTravelled?.total ?? 0,
      fmt: (n) => formatDistance(n, prefs),
    },
    {
      key: "downs",
      label: t("downs"),
      getVal: (d) => d.hero_stats.MS_Death_TotalDowns?.total ?? 0,
      fmt: (n) => n.toLocaleString(),
      lowerIsBetter: true,
    },
    {
      key: "minerals",
      label: t("minerals"),
      getVal: (d) => d.hero_stats.MS_Mined_TotalMinerals?.total ?? 0,
      fmt: (n) => Math.floor(n).toLocaleString(),
    },
    {
      key: "oc",
      label: t("cmpOC"),
      getVal: (d) => d.overclocks.forged_count,
      fmt: (n) => n.toLocaleString(),
    },
  ];

  function winner(valA: number, valB: number, lower = false): "a" | "b" | "tie" {
    if (valA === valB) return "tie";
    const aWins = lower ? valA < valB : valA > valB;
    return aWins ? "a" : "b";
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Noms des joueurs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="industrial-panel p-4 text-center">
          <p className="font-display text-2xl text-primary tracking-widest truncate">
            {nameA.toUpperCase()}
          </p>
        </div>
        <div className="industrial-panel p-4 text-center">
          <p className="font-display text-2xl text-primary tracking-widest truncate">
            {nameB.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Stats globales */}
      <div className="industrial-panel overflow-hidden">
        <div className="p-4 border-b-4 border-outline">
          <p className="font-display text-lg text-on-surface tracking-widest">
            {t("employeeReport")}
          </p>
        </div>
        <div className="divide-y divide-outline">
          {statDefs.map(({ key, label, getVal, fmt, lowerIsBetter }) => {
            const vA = getVal(dataA);
            const vB = getVal(dataB);
            const w = winner(vA, vB, lowerIsBetter);
            return (
              <div key={key} className="grid grid-cols-[1fr_auto_1fr] items-center">
                <div
                  className={`p-3 text-right font-mono text-sm ${w === "a" ? "text-primary font-bold" : "text-on-surface"}`}
                >
                  {fmt(vA)}
                  {w === "a" && <WinBadge wins="a" />}
                </div>
                <div className="px-3 py-3 text-center font-mono text-xs text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                  {label}
                </div>
                <div
                  className={`p-3 text-left font-mono text-sm ${w === "b" ? "text-primary font-bold" : "text-on-surface"}`}
                >
                  {w === "b" && (
                    <span className="font-mono text-[10px] text-primary tracking-widest mr-1">
                      ▶
                    </span>
                  )}
                  {fmt(vB)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Par classe */}
      <div className="industrial-panel overflow-hidden">
        <div className="p-4 border-b-4 border-outline">
          <p className="font-display text-lg text-on-surface tracking-widest">
            {t("cmpPerClass")}
          </p>
        </div>
        <div className="divide-y divide-outline">
          {CLASS_NAMES.map((cls) => {
            const getClassMissions = (d: DashboardData) =>
              d.classes.find((c) => c.name === cls)?.missions_completed ?? 0;
            const vA = getClassMissions(dataA);
            const vB = getClassMissions(dataB);
            const w = winner(vA, vB);
            return (
              <div key={cls} className="grid grid-cols-[1fr_auto_1fr] items-center">
                <div
                  className={`p-3 text-right font-mono text-sm ${w === "a" ? "font-bold" : "text-on-surface"}`}
                  style={w === "a" ? { color: CLASS_COLORS[cls] } : {}}
                >
                  {vA.toLocaleString()}
                  {w === "a" && <WinBadge wins="a" />}
                </div>
                <div className="px-3 py-2 flex items-center gap-1.5">
                  <Image
                    src={CLASS_ICONS[cls]}
                    alt={cls}
                    width={20}
                    height={20}
                    className="opacity-80"
                  />
                  <span
                    className="font-display text-xs tracking-widest hidden sm:block"
                    style={{ color: CLASS_COLORS[cls] }}
                  >
                    {cls.toUpperCase()}
                  </span>
                </div>
                <div
                  className={`p-3 text-left font-mono text-sm ${w === "b" ? "font-bold" : "text-on-surface"}`}
                  style={w === "b" ? { color: CLASS_COLORS[cls] } : {}}
                >
                  {w === "b" && (
                    <span className="font-mono text-[10px] mr-1" style={{ color: CLASS_COLORS[cls] }}>
                      ▶
                    </span>
                  )}
                  {vB.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
