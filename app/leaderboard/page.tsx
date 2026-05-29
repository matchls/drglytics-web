"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation, TranslationKey } from "@/lib/i18n";
import { ClassName, CLASS_COLORS } from "@/lib/types";
import { useRouter } from "next/navigation";

interface PlayerRow {
  player_name: string;
  total_missions: number;
  total_kills: number;
  total_time_s: number;
  total_distance_cm: number;
  total_downs: number;
  total_minerals: number;
  driller_missions: number;
  gunner_missions: number;
  engineer_missions: number;
  scout_missions: number;
}

// Calcule le badge de statut selon le nombre de missions
// t est passé en paramètre car cette fonction est en dehors du composant (ne peut pas appeler un hook directement)
function getStatusBadge(
  missions: number,
  t: (key: TranslationKey) => string,
): { label: string; className: string } {
  if (missions >= 2000)
    return {
      label: t("lbLegendary"),
      className: "bg-primary text-on-primary px-2 py-0.5",
    };
  if (missions >= 500)
    return {
      label: t("lbProductive"),
      className: "border border-tertiary text-tertiary px-2 py-0.5",
    };
  if (missions >= 100)
    return {
      label: t("lbAdequate"),
      className:
        "border border-outline-variant text-on-surface-variant px-2 py-0.5",
    };
  return {
    label: t("lbCriticalSlacker"),
    className: "border border-error text-error px-2 py-0.5",
  };
}

// Couleurs du podium : or / argent / bronze
function getPodiumStyle(rank: number): string {
  if (rank === 1)
    return "border-[#FFD700] bg-[#FFD700]/10 scale-105 shadow-lg shadow-[#FFD700]/20";
  if (rank === 2) return "border-[#C0C0C0] bg-[#C0C0C0]/10";
  return "border-[#A52A2A] bg-[#A52A2A]/10";
}

// Trouve la classe avec le plus de missions pour un joueur
// reduce : parcourt le tableau en gardant le "meilleur" à chaque étape
function getBestClass(player: PlayerRow): ClassName {
  const scores: [ClassName, number][] = [
    ["Driller", player.driller_missions],
    ["Gunner", player.gunner_missions],
    ["Engineer", player.engineer_missions],
    ["Scout", player.scout_missions],
  ];
  return scores.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  )[0];
}

// Milestones communautaires pour les Bounty Targets
const COMMUNITY_KILL_MILESTONE    = 2_000_000;
const COMMUNITY_MISSION_MILESTONE = 10_000;

// Les colonnes sur lesquelles on peut trier
type SortKey =
  | "total_missions"
  | "total_kills"
  | "total_time_s"
  | "total_distance_cm"
  | "total_downs";

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(
    null,
  );
  const [sortKey, setSortKey] = useState<SortKey>("total_missions");
  const [sortAsc, setSortAsc] = useState(false); // false = décroissant par défaut (les meilleurs en premier)
  const t = useTranslation();
  const router = useRouter();

  // Nom du joueur connecté depuis sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem("dashboardData");
    if (data) {
      const parsed = JSON.parse(data);
      setCurrentPlayerName(parsed.player?.name ?? null);
    }
  }, []);

  // Fetch Supabase — trié par missions
  useEffect(() => {
    async function fetchPlayers() {
      const { data, error } = await supabase
        .from("players")
        .select(
          "player_name, total_missions, total_kills, total_time_s, total_distance_cm, total_downs, total_minerals, driller_missions, gunner_missions, engineer_missions, scout_missions",
        )
        .order("total_missions", { ascending: false });
      if (error) console.error(error);
      else setPlayers(data ?? []);
    }
    fetchPlayers();
  }, []);

  // Fonction appelée quand on clique sur un en-tête de colonne
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev); // même colonne → inverse la direction
    } else {
      setSortKey(key);
      setSortAsc(false); // nouvelle colonne → repart en décroissant
    }
  }

  // Copie triée — le [...] est important : on ne mute jamais le state directement
  const sortedPlayers = [...players].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  const top3 = players.slice(0, 3);

  // Company Quota : top 5 joueurs, barres proportionnelles au leader
  const top5 = players.slice(0, 5);
  const leaderMissions = top5[0]?.total_missions ?? 1; // ?? 1 évite la division par zéro

  // Bounty Targets : somme communautaire de tous les joueurs
  const communityKills    = players.reduce((sum, p) => sum + p.total_kills, 0);
  const communityMissions = players.reduce((sum, p) => sum + p.total_missions, 0);

  return (
    <div className="min-h-screen bg-background scanline-overlay p-6 flex flex-col gap-6">
      {/* Podium Top 3 */}
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

      {/* Table Company Spreadsheet */}
      <div className="industrial-panel">
        <div className="p-4 border-b-4 border-outline flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">list</span>
          <p className="font-display text-xl text-on-surface tracking-widest flex-1">
            COMPANY SPREADSHEET V.2.04
          </p>
          <p className="font-mono text-xs text-primary animate-pulse">
            {t("lbSyncing")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-outline text-on-surface-variant font-mono text-xs tracking-widest uppercase">
                <th className="p-4 text-left">{t("lbRank")}</th>
                <th className="p-4 text-left">{t("lbMinerName")}</th>
                <th
                  className="p-4 text-right cursor-pointer select-none hover:text-on-surface"
                  onClick={() => handleSort("total_missions")}
                >
                  {t("catMissions")}{" "}
                  {sortKey === "total_missions" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th
                  className="p-4 text-right cursor-pointer select-none hover:text-on-surface"
                  onClick={() => handleSort("total_kills")}
                >
                  {t("catKills")}{" "}
                  {sortKey === "total_kills" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th
                  className="p-4 text-right cursor-pointer select-none hover:text-on-surface"
                  onClick={() => handleSort("total_time_s")}
                >
                  {t("timeFormatHours")}{" "}
                  {sortKey === "total_time_s" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th
                  className="p-4 text-right cursor-pointer select-none hover:text-on-surface"
                  onClick={() => handleSort("total_distance_cm")}
                >
                  {t("distanceLabel")}{" "}
                  {sortKey === "total_distance_cm" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th
                  className="p-4 text-right cursor-pointer select-none hover:text-on-surface"
                  onClick={() => handleSort("total_downs")}
                >
                  {t("downs")}{" "}
                  {sortKey === "total_downs" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th className="p-4 text-left">{t("lbStatus")}</th>
                <th className="p-4 text-left">{t("lbBestClass")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => {
                const isCurrentPlayer =
                  player.player_name === currentPlayerName;
                const badge = getStatusBadge(player.total_missions, t);
                // Convertit les secondes en heures (arrondi à 1 décimale)
                const hours = (player.total_time_s / 3600).toFixed(1);
                // Convertit les centimètres en kilomètres (arrondi à 1 décimale)
                const km = (player.total_distance_cm / 100000).toFixed(1);
                return (
                  <tr
                    key={player.player_name}
                    onClick={() =>
                      router.push(
                        `/player/${encodeURIComponent(player.player_name)}`,
                      )
                    }
                    className={`border-b border-outline transition-colors cursor-pointer hover:bg-surface-container-high
                      ${isCurrentPlayer ? "bg-primary/5 text-primary" : "text-on-surface"}
                    `}
                  >
                    <td className="p-4 font-mono text-sm text-on-surface-variant">
                      {index + 1}
                    </td>
                    <td className="p-4 font-display text-lg tracking-widest">
                      {player.player_name}
                      {isCurrentPlayer && (
                        <span className="ml-2 font-mono text-xs text-primary">
                          [YOU]
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-sm text-right">
                      {player.total_missions.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-sm text-right">
                      {player.total_kills.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-sm text-right">
                      {hours}h
                    </td>
                    <td className="p-4 font-mono text-sm text-right">{km}km</td>
                    <td className="p-4 font-mono text-sm text-right">
                      {player.total_downs.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-mono text-xs tracking-widest ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const bestClass = getBestClass(player);
                        return (
                          <span
                            className="font-mono text-xs tracking-widest px-2 py-0.5 border"
                            style={{
                              color: CLASS_COLORS[bestClass],
                              borderColor: CLASS_COLORS[bestClass],
                            }}
                          >
                            {bestClass.toUpperCase()}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
              {/* Avertissement final */}
              <tr>
                <td
                  colSpan={9}
                  className="p-4 font-mono text-xs text-error text-center tracking-widest"
                >
                  {t("lbWarning")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Company Quota Fulfillment — top 5 joueurs, proportionnel au leader */}
        <div className="industrial-panel p-4 flex flex-col gap-4">
          <p className="font-display text-lg text-on-surface tracking-widest">
            COMPANY QUOTA FULFILLMENT
          </p>
          <div className="flex items-end gap-2 h-24">
            {top5.map((player) => {
              const pct = Math.round((player.total_missions / leaderMissions) * 100);
              // Initiales : première lettre de chaque mot, max 3 caractères
              const initials = player.player_name
                .split(" ")
                .map((word) => word[0]?.toUpperCase() ?? "")
                .join("")
                .slice(0, 3);
              return (
                <div key={player.player_name} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary/20 border border-primary/40 relative h-full">
                    <div
                      className="bg-primary absolute bottom-0 w-full transition-all"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-on-surface-variant tracking-widest">
                    {initials}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bounty Targets — agrégats communautaires vs milestones */}
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
      </div>
    </div>
  );
}
