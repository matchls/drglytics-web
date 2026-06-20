"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type PlayerRow } from "@/lib/data/players";
import { TranslationKey } from "@/lib/i18n";
import { ClassName, CLASS_COLORS } from "@/lib/types";
import { getStatusBadge, getBestClass, type SortKey } from "@/lib/leaderboard";
import { normalizeName } from "@/lib/friends";
import { usePrefs } from "@/lib/PrefsContext";
import { formatTime, formatDistance } from "@/lib/formatters";


interface PlayerTableProps {
  // Joueurs de la page courante (triés et filtrés).
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
  // Pagination
  page: number;
  pageSize: number;
  hasMore: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

// Table Company Spreadsheet — classement triable, paginé, filtre amis, navigation profil.
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
  page,
  pageSize,
  hasMore,
  onPrevPage,
  onNextPage,
}: PlayerTableProps) {
  const router = useRouter();
  // Préférences utilisateur (unité de distance km/mi, format de temps h / j+h).
  // Le leaderboard doit les respecter au même titre que ClassCard.
  const { prefs } = usePrefs();

  // Garde défensive : ne jamais rendre plus que pageSize lignes, même si le parent
  // passe accidentellement une liste non bornée.
  const safeRows = players.slice(0, pageSize);

  return (
    <div className="industrial-panel">
      <div className="p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">list</span>
        <p className="font-display text-xl text-on-surface tracking-widest flex-1">
          {t("lbTableTitle")}
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
        <table className="w-full min-w-[700px]">
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
                {prefs.timeFormat === "hours"
                  ? t("timeFormatHours")
                  : t("timeFormatDhm")}{" "}
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
              <th className="p-4 text-center">{t("lbCompare")}</th>
            </tr>
          </thead>
          <tbody>
            {safeRows.map((player, index) => {
              const globalRank = page * pageSize + index + 1;
              const normalizedName = normalizeName(player.player_name);
              const isCurrentPlayer =
                currentPlayerName != null &&
                normalizedName === normalizeName(currentPlayerName);
              const isFriend = friends.includes(normalizedName);
              const badge = getStatusBadge(player.total_missions, t);
              const bestClass: ClassName = getBestClass(player);
              const time = formatTime(player.total_time_s, prefs);
              const distance = formatDistance(player.total_distance_cm, prefs);
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
                    {globalRank}
                  </td>
                  <td className="p-4 font-display text-lg tracking-widest">
                    {player.player_name}
                    {isCurrentPlayer && (
                      <span className="ml-2 font-mono text-xs text-primary">
                        {t("lbYou")}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-sm text-right">
                    {player.total_missions.toLocaleString()}
                  </td>
                  <td className="p-4 font-mono text-sm text-right">
                    {player.total_kills.toLocaleString()}
                  </td>
                  <td className="p-4 font-mono text-sm text-right">{time}</td>
                  <td className="p-4 font-mono text-sm text-right">
                    {distance}
                  </td>
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
                    <span
                      className="font-mono text-xs tracking-widest px-2 py-0.5 border"
                      style={{
                        color: CLASS_COLORS[bestClass],
                        borderColor: CLASS_COLORS[bestClass],
                      }}
                    >
                      {bestClass.toUpperCase()}
                    </span>
                  </td>
                  {/* Bouton ami — stopPropagation pour ne pas naviguer vers le profil */}
                  <td className="p-4 text-center">
                    {!isCurrentPlayer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFriend(player.player_name);
                        }}
                        title={isFriend ? t("lbRemoveFriend") : t("lbAddFriend")}
                        className="hover:scale-125 transition-transform inline-flex items-center justify-center"
                      >
                        <Image
                          src="/icons/misc/icon_accessory.png"
                          alt="ami"
                          width={20}
                          height={20}
                          className={`transition-opacity ${
                            isFriend
                              ? "opacity-100"
                              : "opacity-20 grayscale"
                          }`}
                        />
                      </button>
                    )}
                  </td>
                  {/* Bouton VS — lien vers /compare?a=currentPlayer&b=thisPlayer */}
                  <td className="p-4 text-center">
                    {!isCurrentPlayer && (
                      <Link
                        href={`/compare?a=${encodeURIComponent(currentPlayerName ?? "")}&b=${encodeURIComponent(player.player_name)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-[10px] tracking-widest border border-outline text-on-surface-variant hover:border-drg-orange hover:text-on-surface px-2 py-0.5 transition-colors"
                      >
                        VS
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {/* Message si aucun ami en mode "amis seulement" */}
            {friendsOnly && safeRows.length === 0 && (
              <tr>
                <td colSpan={11} className="p-8 font-mono text-xs text-on-surface-variant text-center tracking-widest">
                  {t("lbNoFriends")}
                </td>
              </tr>
            )}
            {/* Message de fin de liste : page vide hors mode "amis" (ex: hasMore faux positif) */}
            {!friendsOnly && safeRows.length === 0 && (
              <tr>
                <td colSpan={11} className="p-8 font-mono text-xs text-on-surface-variant text-center tracking-widest">
                  {t("lbEndOfList")}
                </td>
              </tr>
            )}
            {/* Avertissement final */}
            <tr>
              <td
                colSpan={11}
                className="p-4 font-mono text-xs text-error text-center tracking-widest"
              >
                {t("lbWarning")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Contrôles de pagination */}
      <div className="p-4 border-t border-outline flex items-center justify-between font-mono text-xs tracking-widest">
        <button
          onClick={onPrevPage}
          disabled={page === 0}
          className="px-3 py-1 border-2 border-outline text-on-surface-variant disabled:opacity-30 hover:border-drg-orange hover:text-on-surface transition-colors"
        >
          ← PREV
        </button>
        <span className="text-on-surface-variant">
          PAGE {page + 1}
        </span>
        <button
          onClick={onNextPage}
          disabled={!hasMore}
          className="px-3 py-1 border-2 border-outline text-on-surface-variant disabled:opacity-30 hover:border-drg-orange hover:text-on-surface transition-colors"
        >
          NEXT →
        </button>
      </div>
    </div>
  );
}
