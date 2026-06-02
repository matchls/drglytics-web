"use client";
import { useEffect, useState } from "react";
import { fetchLeaderboard, type PlayerRow } from "@/lib/data/players";
import { useTranslation } from "@/lib/i18n";
import { getFriends, addFriend, removeFriend, isFriend } from "@/lib/friends";
import { getDashboardSession } from "@/lib/session";
import { type SortKey } from "@/lib/leaderboard";
import Podium from "@/components/leaderboard/Podium";
import PlayerTable from "@/components/leaderboard/PlayerTable";
import CompanyQuota from "@/components/leaderboard/CompanyQuota";
import BountyTargets from "@/components/leaderboard/BountyTargets";

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

  // Nom du joueur connecté depuis sessionStorage
  useEffect(() => {
    const session = getDashboardSession();
    setCurrentPlayerName(session?.data.player?.name ?? null);
    // Charge la liste d'amis depuis localStorage au montage
    setFriends(getFriends());
  }, []);

  // Chargement du leaderboard via la couche d'accès aux données (trié par missions).
  useEffect(() => {
    async function loadPlayers() {
      setPlayers(await fetchLeaderboard());
    }
    loadPlayers();
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

  return (
    <div className="min-h-screen bg-background scanline-overlay p-6 flex flex-col gap-6">
      <Podium players={players} t={t} />

      <PlayerTable
        players={displayedPlayers}
        currentPlayerName={currentPlayerName}
        sortKey={sortKey}
        sortAsc={sortAsc}
        friendsOnly={friendsOnly}
        friends={friends}
        t={t}
        onSort={handleSort}
        onToggleFriend={toggleFriend}
        onFriendsOnlyChange={setFriendsOnly}
      />

      <div className="grid grid-cols-2 gap-4">
        <CompanyQuota players={sortedPlayers} sortKey={sortKey} t={t} />
        <BountyTargets players={players} />
      </div>
    </div>
  );
}
