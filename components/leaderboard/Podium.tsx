import { type PlayerRow } from "@/lib/data/players";
import { TranslationKey } from "@/lib/i18n";
import { getStatusBadge, getPodiumStyle } from "@/lib/leaderboard";

interface PodiumProps {
  players: PlayerRow[];
  t: (key: TranslationKey) => string;
}

// Podium Top 3 — les trois premiers joueurs (ordre brut, non trié par colonne).
export default function Podium({ players, t }: PodiumProps) {
  const top3 = players.slice(0, 3);

  return (
    <div className="flex gap-4 justify-center">
      {top3.map((player, i) => {
        const badge = getStatusBadge(player.total_missions, t);
        return (
          <div
            key={player.player_name}
            className={`industrial-panel flex-1 max-w-xs p-6 flex flex-col items-center gap-2 border-4 transition-transform ${getPodiumStyle(i + 1)}`}
          >
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              #{i + 1}
            </p>
            <div className="w-16 h-16 bg-surface-container-highest border-4 border-outline flex items-center justify-center">
              <span className="font-display text-3xl text-primary">
                {player.player_name[0].toUpperCase()}
              </span>
            </div>
            <p className="font-display text-xl text-on-surface tracking-widest text-center">
              {player.player_name}
            </p>
            <p className="font-mono text-sm text-on-surface-variant">
              {player.total_missions} missions
            </p>
            <span
              className={`font-mono text-xs tracking-widest ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
