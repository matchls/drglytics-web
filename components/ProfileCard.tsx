"use client";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { type DashboardData, CLASS_COLORS, CLASS_NAMES, type ClassName } from "@/lib/types";
import { getUnlockedBadges } from "@/lib/badges";
import { useTranslation } from "@/lib/i18n";
import { LEADERBOARD_STATUS_THRESHOLDS } from "@/lib/ranks";

// Couleurs DRG — inline pour que html-to-image les capture correctement
const C = {
  bg: "#110b06",
  panel: "#1e1208",
  border: "#3d2a0f",
  orange: "#e8a320",
  text: "#f5e8cc",
  muted: "#8b6e4a",
};

function getBestClass(data: DashboardData): { name: ClassName; color: string; missions: number } {
  const best = data.classes.reduce((a, b) =>
    b.missions_completed > a.missions_completed ? b : a,
  );
  return {
    name: best.name as ClassName,
    color: CLASS_COLORS[best.name as ClassName],
    missions: best.missions_completed,
  };
}

function getStatusLabel(totalMissions: number): string {
  if (totalMissions >= LEADERBOARD_STATUS_THRESHOLDS.legendary) return "LEGENDARY";
  if (totalMissions >= LEADERBOARD_STATUS_THRESHOLDS.productive) return "PRODUCTIVE";
  if (totalMissions >= LEADERBOARD_STATUS_THRESHOLDS.adequate) return "ADEQUATE";
  return "CRITICAL SLACKER";
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtHours(seconds: number): string {
  return Math.floor(seconds / 3600) + "h";
}

// Composant carte — rendu dans un div off-screen, capturé par html-to-image
function CardContent({ data }: { data: DashboardData }) {
  const totalMissions = data.classes.reduce((s, c) => s + c.missions_completed, 0);
  const totalKills = Math.round(data.hero_stats.MS_Killed_TotalEnemies?.total ?? 0);
  const totalTimeSec = Math.round(data.hero_stats.MS_TimePlayed?.total ?? 0);
  const forgedOC = data.overclocks.forged_count;
  const bestClass = getBestClass(data);
  const status = getStatusLabel(totalMissions);
  const badges = getUnlockedBadges(data).slice(0, 4);

  const monoFont = '"Courier New", Courier, monospace';
  const displayFont = '"Arial Black", "Arial Bold", Arial, sans-serif';

  return (
    <div
      style={{
        width: 700,
        height: 350,
        background: C.bg,
        border: `4px solid ${C.orange}`,
        display: "flex",
        flexDirection: "column",
        fontFamily: monoFont,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: C.panel,
          borderBottom: `2px solid ${C.border}`,
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: C.orange, fontFamily: displayFont, fontSize: 13, letterSpacing: 4 }}>
          ◆ DRGLYTICS
        </span>
        <span style={{ color: C.muted, fontSize: 10, letterSpacing: 2 }}>
          DRG EMPLOYEE RECORD
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", padding: "14px 18px", gap: 20 }}>
        {/* Left — player identity */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Name */}
          <div>
            <p style={{ color: C.muted, fontSize: 9, letterSpacing: 3, marginBottom: 3 }}>
              OPERATIVE
            </p>
            <p
              style={{
                color: C.orange,
                fontFamily: displayFont,
                fontSize: 28,
                letterSpacing: 2,
                lineHeight: 1,
                textTransform: "uppercase",
                wordBreak: "break-all",
              }}
            >
              {data.player.name}
            </p>
          </div>

          {/* Status */}
          <p
            style={{
              color: C.text,
              fontSize: 10,
              letterSpacing: 3,
              border: `1px solid ${C.border}`,
              padding: "2px 8px",
              display: "inline-block",
              alignSelf: "flex-start",
            }}
          >
            {status}
          </p>

          {/* Main class */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/icons/classes/${bestClass.name.toLowerCase()}_icon.png`}
              alt={bestClass.name}
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
            <div>
              <p style={{ color: C.muted, fontSize: 9, letterSpacing: 2 }}>MAIN CLASS</p>
              <p style={{ color: bestClass.color, fontFamily: displayFont, fontSize: 14, letterSpacing: 2 }}>
                {bestClass.name.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "auto" }}>
              {badges.map((b) => (
                <span
                  key={b.id}
                  style={{
                    fontSize: 8,
                    letterSpacing: 1,
                    border: `1px solid ${C.border}`,
                    padding: "1px 5px",
                    color: C.muted,
                    background: C.panel,
                  }}
                >
                  {b.id.toUpperCase().replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right — stats grid */}
        <div
          style={{
            width: 240,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            alignContent: "start",
          }}
        >
          {[
            { label: "MISSIONS", value: fmt(totalMissions), color: C.orange },
            { label: "KILLS",    value: fmt(totalKills),    color: C.text },
            { label: "TIME",     value: fmtHours(totalTimeSec), color: C.text },
            { label: "OC FORGED", value: fmt(forgedOC),     color: C.text },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: C.panel, padding: "8px 10px", border: `1px solid ${C.border}` }}>
              <p style={{ color, fontFamily: displayFont, fontSize: 18, marginBottom: 2 }}>{value}</p>
              <p style={{ color: C.muted, fontSize: 8, letterSpacing: 2 }}>{label}</p>
            </div>
          ))}

          {/* Class breakdown bar */}
          <div
            style={{
              gridColumn: "1 / -1",
              background: C.panel,
              border: `1px solid ${C.border}`,
              padding: "6px 10px",
            }}
          >
            <p style={{ color: C.muted, fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>
              CLASS BREAKDOWN
            </p>
            <div style={{ display: "flex", height: 8, overflow: "hidden", gap: 1 }}>
              {CLASS_NAMES.map((cls) => {
                const clsMissions = data.classes.find((c) => c.name === cls)?.missions_completed ?? 0;
                const pct = totalMissions > 0 ? (clsMissions / totalMissions) * 100 : 0;
                return (
                  <div
                    key={cls}
                    style={{ width: `${pct}%`, background: CLASS_COLORS[cls], minWidth: pct > 0 ? 2 : 0 }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: "6px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: C.muted, fontSize: 9, letterSpacing: 2 }}>
          DEEP ROCK GALACTIC — EMPLOYEE STATISTICS
        </span>
        <span style={{ color: C.orange, fontSize: 9, letterSpacing: 2 }}>DRGLYTICS.IO</span>
      </div>
    </div>
  );
}

interface Props {
  data: DashboardData;
}

export default function ProfileCard({ data }: Props) {
  const t = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);

  async function handleDownload() {
    if (!cardRef.current) return;
    setGenerating(true);
    setError(false);

    try {
      // Attendre que toutes les polices soient chargées avant la capture
      await document.fonts.ready;
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,  // résolution ×2 pour les écrans retina
        width: 700,
        height: 350,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `drglytics-${data.player.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError(true);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="industrial-panel overflow-hidden">
      {/* Carte rendue en preview */}
      <div className="p-4 overflow-x-auto">
        <div
          ref={cardRef}
          style={{ display: "inline-block", minWidth: 700 }}
          className="shadow-lg"
        >
          <CardContent data={data} />
        </div>
      </div>

      {/* Bouton de téléchargement */}
      <div className="px-4 pb-4 flex items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={generating}
          className="flex items-center gap-2 font-mono text-xs tracking-widest px-4 py-2 bg-primary text-on-primary disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          {generating ? t("shareCardGenerating") : t("shareCard")}
        </button>
        {error && (
          <p className="font-mono text-xs text-error tracking-widest">{t("shareCardError")}</p>
        )}
      </div>
    </div>
  );
}
