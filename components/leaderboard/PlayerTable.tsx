"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type PlayerRow } from "@/lib/data/players";
import { TranslationKey } from "@/lib/i18n";
import { ClassName, CLASS_COLORS } from "@/lib/types";
import { getStatusBadge, getBestClass, type SortKey } from "@/lib/leaderboard";

interface PlayerTableProps {
  // Joueurs déjà triés ET filtrés (filtre "amis seulement") par la page.
  players: PlayerRow[];
  currentPlayerName: string | null;
  sortKey: SortKey;
  sortAsc: boolean;
  friendsOnly: boolean;
  friends: string[];
  t: (key: TranslationKey) => string;
  onSort: (key: SortKey) => void;
  onToggleFriend: (name: string) => void;
  onFriendsOnlyChange: (value: boolean) => void;
}

// Table Company Spreadsheet — classement triable, filtre amis, navigation profil.
export default function PlayerTable({
  players,
  currentPlayerName,
  sortKey,
  sortAsc,
  friendsOnly,
  friends,
  t,
  onSort,
  onToggleFriend,
  onFriendsOnlyChange,
}: PlayerTableProps) {
  const router = useRouter();

  return (
    <div className="industrial-panel">
      <div className="p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">list</span>
        <p className="font-display text-xl text-on-surface tracking-widest flex-1">
          COMPANY SPREADSHEET V.2.04
        </p>
        {/* Toggle Tous / Amis */}
        <div className="flex gap-1">
          <button
            onClick={() => onFriendsOnlyChange(false)}
            className={`font-mono text-xs tracking-widest px-3 py-1 border-2 transition-colors ${
              !friendsOnly
                ? "bg-primary text-on-primary border-primary"
                : "border-outline text-on-surface-variant hover:border-drg-orange"
            }`}
          >
            {t("lbAllPlayers")}
          </button>
          <button
            onClick={() => onFriendsOnlyChange(true)}
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
                onClick={() => onSort("total_missions")}
              >
                {t("catMissions")}{" "}
                {sortKey === "total_missions" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                className="p-4 text-right cursor-pointer select-none hover:text-on-surface"
                onClick={() => onSort("total_kills")}
              >
                {t("catKills")}{" "}
                {sortKey === "total_kills" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                className="p-4 text-right cursor-pointer select-none hover:text-on-surface"
                onClick={() => onSort("total_time_s")}
              >
                {t("timeFormatHours")}{" "}
                {sortKey === "total_time_s" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                className="p-4 text-right cursor-pointer select-none hover:text-on-surface"
                onClick={() => onSort("total_distance_cm")}
              >
                {t("distanceLabel")}{" "}
                {sortKey === "total_distance_cm" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                className="p-4 text-right cursor-pointer select-none hover:text-on-surface"
                onClick={() => onSort("total_downs")}
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
            {players.map((player, index) => {
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
                      const bestClass: ClassName = getBestClass(player);
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
                          onToggleFriend(player.player_name);
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
            {friendsOnly && players.length === 0 && (
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
  );
}
