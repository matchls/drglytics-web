import { type PlayerRow } from "@/lib/data/players";
import {
  COMMUNITY_KILL_MILESTONE,
  COMMUNITY_MISSION_MILESTONE,
} from "@/lib/leaderboard";

interface BountyTargetsProps {
  players: PlayerRow[];
}

// Bounty Targets — agrégats communautaires (somme de tous les joueurs) vs milestones.
export default function BountyTargets({ players }: BountyTargetsProps) {
  const communityKills    = players.reduce((sum, p) => sum + p.total_kills, 0);
  const communityMissions = players.reduce((sum, p) => sum + p.total_missions, 0);

  return (
    <div className="industrial-panel p-4 flex flex-col gap-4">
      <p className="font-display text-lg text-on-surface tracking-widest">
        BOUNTY TARGETS: HOXXES IV
      </p>
      {[
        {
          label: "COMMUNITY KILLS",
          current: communityKills,
          milestone: COMMUNITY_KILL_MILESTONE,
        },
        {
          label: "COMMUNITY MISSIONS",
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
