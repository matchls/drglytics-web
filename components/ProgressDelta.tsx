"use client";
import { type ProgressDelta } from "@/app/actions/getProgressDelta";
import { useTranslation } from "@/lib/i18n";
import { formatTime } from "@/lib/formatters";
import { usePrefs } from "@/lib/PrefsContext";
import { type ClassName, CLASS_COLORS } from "@/lib/types";

interface Props {
  delta: ProgressDelta;
}

function sign(n: number): string {
  return n >= 0 ? `+${n.toLocaleString()}` : n.toLocaleString();
}

// Classe la plus jouée depuis le dernier upload (parmi les 4 classes)
function getBestDeltaClass(delta: ProgressDelta): { name: ClassName; missions: number } | null {
  const entries: [ClassName, number][] = [
    ["Driller", delta.driller_missions],
    ["Gunner", delta.gunner_missions],
    ["Engineer", delta.engineer_missions],
    ["Scout", delta.scout_missions],
  ];
  const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  if (best[1] <= 0) return null;
  return { name: best[0], missions: best[1] };
}

export default function ProgressDeltaPanel({ delta }: Props) {
  const t = useTranslation();
  const { prefs } = usePrefs();

  const date = new Date(delta.previous_date).toLocaleDateString(
    prefs.language === "fr" ? "fr-FR" : "en-GB",
    { day: "2-digit", month: "2-digit", year: "numeric" },
  );
  const since = t("progressSince").replace("{date}", date);
  const timeDelta = formatTime(Math.abs(delta.time_s), prefs);
  const bestClass = getBestDeltaClass(delta);

  const stats = [
    { label: t("progressMissions"), value: sign(delta.missions) },
    { label: t("progressKills"), value: sign(delta.kills) },
    {
      label: t("progressTime"),
      value: `${delta.time_s >= 0 ? "+" : "-"}${timeDelta}`,
    },
    { label: t("progressOverclocks"), value: sign(delta.forged_overclocks) },
  ];

  return (
    <div className="industrial-panel p-4 border-l-4 border-tertiary">
      <div className="flex items-center gap-3 mb-3">
        <span className="material-symbols-outlined text-tertiary">trending_up</span>
        <div>
          <p className="font-display text-sm text-tertiary tracking-widest">
            {t("progressTitle")}
          </p>
          <p className="font-mono text-xs text-on-surface-variant">{since}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <p className="font-display text-2xl text-on-surface">{value}</p>
            <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
              {label}
            </p>
          </div>
        ))}

        {bestClass && (
          <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-4 border-t border-outline-variant pt-2 mt-1">
            <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
              {t("progressBestClass")}
            </p>
            <span
              className="font-display text-lg tracking-widest"
              style={{ color: CLASS_COLORS[bestClass.name] }}
            >
              {bestClass.name.toUpperCase()} +{bestClass.missions}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
