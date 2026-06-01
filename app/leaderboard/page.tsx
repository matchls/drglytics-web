"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useTranslation, TranslationKey } from "@/lib/i18n";
import { ClassName, CLASS_COLORS } from "@/lib/types";
import { useRouter } from "next/navigation";
import { getFriends, addFriend, removeFriend, isFriend } from "@/lib/friends";
import { getDashboardSession } from "@/lib/session";

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
  const [sortAsc, setSortAsc] = useState(false);
  const [friendsOnly, setFriendsOnly] = useState(false);
  // friends est un state React pour forcer le re-render quand on ajoute/retire un ami
  const [friends, setFriends] = useState<string[]>([]);
  const t = useTranslation();
  const router = useRouter();

  // Nom du joueur connecté depuis sessionStorage
  useEffect(() => {
    const session = getDashboardSession();
    setCurrentPlayerName(session?.data.player?.name ?? null);
    // Charge la liste d'amis depuis localStorage au montage
    setFriends(getFriends());
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

  // Ajoute ou retire un ami — met à jour localStorage ET le state React (pour re-render)
  function toggleFriend(name: string) {
    if (isFriend(name)) {
      removeFriend(name);
    } else {
      addFriend(name);
    }
    setFriends(getFriends()); // sync le state avec localStorage
  }

  // Copie triée
  const sortedPlayers = [...players].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  // Filtre "amis seulement" : toi + tes amis
  const displayedPlayers = friendsOnly
    ? sortedPlayers.filter(
        (p) =>
          p.player_name.toUpperCase() === currentPlayerName?.toUpperCase() ||
          friends.includes(p.player_name.toUpperCase()),
      )
    : sortedPlayers;

  const top3 = players.slice(0, 3);

  // Company Quota : top 5 selon la stat active (suit le tri du tableau)
  const top5 = sortedPlayers.slice(0, 5);
  const leaderValue = top5[0]?.[sortKey] ?? 1; // ?? 1 évite la division par zéro

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
          {/* Toggle Tous / Amis */}
          <div className="flex gap-1">
            <button
              onClick={() => setFriendsOnly(false)}
              className={`font-mono text-xs tracking-widest px-3 py-1 border-2 transition-colors ${
                !friendsOnly
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline text-on-surface-variant hover:border-drg-orange"
              }`}
            >
              {t("lbAllPlayers")}
            </button>
            <button
              onClick={() => setFriendsOnly(true)}
              className={`font-mono text-xs tracking-widest px-3 py-1 border-2 transition-colors ${
                friendsOnly
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline text-on-surface-variant hover:border-drg-orange"
              }`}
            >
              {t("lbFriendsOnly")}
            </button>
          </div>
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
                <th className="p-4 text-center">{t("lbFriend")}</th>
              </tr>
            </thead>
            <tbody>
              {displayedPlayers.map((player, index) => {
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
                    {/* Bouton ami — stopPropagation pour ne pas naviguer vers le profil */}
                    <td className="p-4 text-center">
                      {!isCurrentPlayer && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFriend(player.player_name);
                          }}
                          title={friends.includes(player.player_name.toUpperCase()) ? "Retirer des amis" : "Ajouter aux amis"}
                          className="hover:scale-125 transition-transform inline-flex items-center justify-center"
                        >
                          <Image
                            src="/icons/misc/icon_accessory.png"
                            alt="ami"
                            width={20}
                            height={20}
                            className={`transition-opacity ${
                              friends.includes(player.player_name.toUpperCase())
                                ? "opacity-100"
                                : "opacity-20 grayscale"
                            }`}
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {/* Message si aucun ami en mode "amis seulement" */}
              {friendsOnly && displayedPlayers.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 font-mono text-xs text-on-surface-variant text-center tracking-widest">
                    {t("lbNoFriends")}
                  </td>
                </tr>
              )}
              {/* Avertissement final */}
              <tr>
                <td
                  colSpan={10}
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
