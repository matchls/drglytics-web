"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ClassPieChart from "@/components/ClassPieChart";
import { DashboardData } from "@/lib/types";
import ClassCard from "@/components/ClassCard";
import HeroStats from "@/components/HeroStats";
import OverclockList from "@/components/OverclockList";
import MissionStats from "@/components/MissionStats";
import { getDashboardSession } from "@/lib/session";
import { useTranslation } from "@/lib/i18n";

export default function DashboardPage() {
  const t = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedStatKey, setSelectedStatKey] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const session = getDashboardSession();
    if (session) {
      setData(session.data);
      setIsDemo(session.isDemo);
    }
    setSessionChecked(true);
  }, []);

  if (!sessionChecked) return null;

  if (!data) {
    return (
      <div className="min-h-screen bg-background industrial-grid flex items-center justify-center">
        <div className="industrial-panel pressed-metal w-full max-w-md mx-4">
          <div className="p-6 border-b-4 border-outline flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              warning
            </span>
            <h1 className="font-display text-2xl text-on-surface tracking-widest">
              {t("noSessionTitle")}
            </h1>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <p className="font-mono text-sm text-on-surface-variant tracking-wider">
              {t("noSessionDesc")}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="w-full bg-primary text-on-primary font-display text-lg tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors"
              >
                <span className="material-symbols-outlined">cloud_upload</span>
                {t("noSessionUpload")}
              </Link>
              <Link
                href="/"
                className="w-full border-2 border-drg-border text-on-surface-variant font-display text-lg tracking-widest py-2 flex items-center justify-center gap-2 hover:border-drg-orange hover:text-drg-orange transition-colors"
              >
                {t("noSessionDemo")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      {isDemo && (
        <div className="border-l-4 border-drg-orange px-4 py-2 font-mono text-xs text-on-surface-variant tracking-widest flex items-center gap-3 bg-surface-container">
          <span className="material-symbols-outlined text-drg-orange text-sm">
            info
          </span>
          DEMO — DONNÉES DE {data.player.name.toUpperCase()} · UPLOADEZ
          VOTRE SAVE POUR VOIR VOS STATS
        </div>
      )}
      <HeroStats
        heroStats={data.hero_stats}
        selectedStatKey={selectedStatKey}
        onStatClick={setSelectedStatKey}
      />
      <div className="grid grid-cols-3 gap-6 items-start">
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {data.classes.map((classData) => (
            <ClassCard key={classData.name} classData={classData} />
          ))}
        </div>
        <ClassPieChart
          heroStats={data.hero_stats}
          selectedStatKey={selectedStatKey}
        />
      </div>
      <MissionStats missionStats={data.mission_stats} />
      <OverclockList overclocks={data.overclocks} />
    </div>
  );
}
