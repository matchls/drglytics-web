import { type PlayerRow } from "@/lib/data/players";
import { TranslationKey } from "@/lib/i18n";
import { type SortKey } from "@/lib/leaderboard";

interface CompanyQuotaProps {
  // Joueurs déjà triés selon la colonne active (la quota suit le tri du tableau).
  players: PlayerRow[];
  sortKey: SortKey;
  t: (key: TranslationKey) => string;
}

// Company Quota Fulfillment — top 5 joueurs, proportionnel au leader.
export default function CompanyQuota({ players, sortKey, t }: CompanyQuotaProps) {
  const top5 = players.slice(0, 5);
  const leaderValue = top5[0]?.[sortKey] ?? 1; // ?? 1 évite la division par zéro

  return (
    <div className="industrial-panel p-4 flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <p className="font-display text-lg text-on-surface tracking-widest">
          COMPANY QUOTA FULFILLMENT
        </p>
        <p className="font-mono text-xs text-primary tracking-widest">
          — {sortKey === "total_missions"    ? t("catMissions")
            : sortKey === "total_kills"      ? t("catKills")
            : sortKey === "total_time_s"     ? t("timeFormatHours")
            : sortKey === "total_distance_cm"? t("distanceLabel")
            : t("downs")}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        {/* Zone des barres — hauteur fixe pour que les % fonctionnent */}
        <div className="flex gap-2 h-20 items-end">
          {top5.map((player) => {
            const pct = Math.round((player[sortKey] / leaderValue) * 100);
            return (
              <div
                key={player.player_name}
                className="flex-1 bg-primary border border-primary/40 transition-all"
                style={{ height: `${pct}%` }}
              />
            );
          })}
        </div>
        {/* Labels — rangée séparée, alignée sur chaque barre */}
        <div className="flex gap-2">
          {top5.map((player) => {
            const initials = player.player_name
              .split(" ")
              .map((word) => word[0]?.toUpperCase() ?? "")
              .join("")
              .slice(0, 3);
            return (
              <div key={player.player_name} className="flex-1 text-center">
                <span className="font-mono text-xs text-on-surface-variant tracking-widest">
                  {initials}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
