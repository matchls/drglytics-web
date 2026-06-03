import { type PlayerRow } from "@/lib/data/players";
import { TranslationKey } from "@/lib/i18n";
import {
  COMMUNITY_KILL_MILESTONE,
  COMMUNITY_MISSION_MILESTONE,
} from "@/lib/leaderboard";

interface BountyTargetsProps {
  players: PlayerRow[];
  t: (key: TranslationKey) => string;
}

export default function BountyTargets({ players, t }: BountyTargetsProps) {
  const communityKills    = players.reduce((sum, p) => sum + p.total_kills, 0);
  const communityMissions = players.reduce((sum, p) => sum + p.total_missions, 0);

  return (
    <div className="industrial-panel p-4 flex flex-col gap-4">
      <p className="font-display text-lg text-on-surface tracking-widest">
        {t("lbBountyTitle")}
      </p>
      {[
        {
          label: t("lbCommunityKills"),
          current: communityKills,
          milestone: COMMUNITY_KILL_MILESTONE,
        },
        {
          label: t("lbCommunityMissions"),
          current: communityMissions,
          milestone: COMMUNITY_MISSION_MILESTONE,
        },
      ].map((target) => {
        // Math.min(100, ...) : cap à 100% si le milestone est dépassé
        const pct = Math.min(100, Math.round((target.current / target.milestone) * 100));
        return (
          <div key={target.label} className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-xs text-on-surface-variant">
              <span>{target.label}</span>
              <span>
                {target.current.toLocaleString()} / {target.milestone.toLocaleString()} ({pct}%)
              </span>
            </div>
            <div className="h-3 bg-surface-container-highest border border-outline">
              <div
                className="h-full bg-error transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
