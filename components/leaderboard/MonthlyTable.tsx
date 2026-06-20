"use client";
import { useRouter } from "next/navigation";
import { type MonthlyEntry } from "@/app/actions/getMonthlyLeaderboard";
import { type TranslationKey } from "@/lib/i18n";
import { usePrefs } from "@/lib/PrefsContext";
import { formatTime } from "@/lib/formatters";

interface Props {
  entries: MonthlyEntry[];
  t: (key: TranslationKey) => string;
}

function sign(n: number): string {
  return n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString();
}

export default function MonthlyTable({ entries, t }: Props) {
  const router = useRouter();
  const { prefs } = usePrefs();

  return (
    <div className="industrial-panel">
      <div className="p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">trending_up</span>
        <div className="flex-1">
          <p className="font-display text-xl text-on-surface tracking-widest">
            {t("lbMonthlyTitle")}
          </p>
          <p className="font-mono text-xs text-on-surface-variant tracking-widest mt-0.5">
            {t("lbMonthlyNote")}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="p-8 font-mono text-xs text-on-surface-variant text-center tracking-widest">
          {t("lbMonthlyEmpty")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b-4 border-outline text-on-surface-variant font-mono text-xs tracking-widest uppercase">
                <th className="p-4 text-left">{t("lbRank")}</th>
                <th className="p-4 text-left">{t("lbMinerName")}</th>
                <th className="p-4 text-right">+{t("catMissions")}</th>
                <th className="p-4 text-right">+{t("catKills")}</th>
                <th className="p-4 text-right">+{t("catTime")}</th>
                <th className="p-4 text-right">+OC</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={entry.player_name}
                  onClick={() =>
                    router.push(`/player/${encodeURIComponent(entry.player_name)}`)
                  }
                  className="border-b border-outline cursor-pointer hover:bg-surface-container-high transition-colors text-on-surface"
                >
                  <td className="p-4 font-mono text-sm text-on-surface-variant">
                    {idx + 1}
                  </td>
                  <td className="p-4 font-display text-lg tracking-widest">
                    {entry.player_name}
                  </td>
                  <td className="p-4 font-mono text-sm text-right text-primary">
                    {sign(entry.missions)}
                  </td>
                  <td className="p-4 font-mono text-sm text-right">
                    {sign(entry.kills)}
                  </td>
                  <td className="p-4 font-mono text-sm text-right">
                    +{formatTime(entry.time_s, prefs)}
                  </td>
                  <td className="p-4 font-mono text-sm text-right">
                    {entry.oc > 0 ? sign(entry.oc) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
