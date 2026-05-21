"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PlayerRow {
  player_name: string;
  total_missions: number;
  total_kills: number;
  total_time_s: number;
  total_distance_cm: number;
  total_downs: number;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [sortKey, setSortKey] =
    useState<Exclude<keyof PlayerRow, "player_name">>("total_time_s");

  useEffect(() => {
    async function fetchPlayers() {
      const { data, error } = await supabase
        .from("players")
        .select(
          "player_name, total_missions, total_kills, total_time_s, total_distance_cm, total_downs",
        )
        .order("total_missions", { ascending: false });

      if (error) console.error(error);
      else setPlayers(data ?? []);
    }
    fetchPlayers();
  }, []);
  const sortedPlayers = [...players].sort((a, b) => b[sortKey] - a[sortKey]);
  return (
    <div className="min-h-screen bg-drg-dark text-white p-8">
      {/* <h1 className="text-drg-orange text-4xl font-bold uppercase tracking-widest mb-8">
        Leaderboard
      </h1> */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-gray-400 uppercase text-sm border-b border-drg-border">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">Joueur</th>
            <th
              className={`pb-3 pr-4 cursor-pointer hover:text-white ${sortKey === "total_time_s" ? "text-drg-orange" : ""}`}
              onClick={() => setSortKey("total_time_s")}
            >
              Temps de jeu ▼
            </th>
            <th
              className={`pb-3 pr-4 cursor-pointer hover:text-white ${sortKey === "total_missions" ? "text-drg-orange" : ""}`}
              onClick={() => setSortKey("total_missions")}
            >
              Missions ▼
            </th>
            <th
              className={`pb-3 pr-4 cursor-pointer hover:text-white ${sortKey === "total_kills" ? "text-drg-orange" : ""}`}
              onClick={() => setSortKey("total_kills")}
            >
              Kills ▼
            </th>
            <th
              className={`pb-3 pr-4 cursor-pointer hover:text-white ${sortKey === "total_distance_cm" ? "text-drg-orange" : ""}`}
              onClick={() => setSortKey("total_distance_cm")}
            >
              Distance parcourue ▼
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => {
            const hours = Math.floor(player.total_time_s / 3600);
            const distanceKm = Math.floor(player.total_distance_cm / 100000);
            return (
              <tr
                key={player.player_name}
                className="border-b border-drg-border hover:bg-drg-panel transition-colors"
              >
                <td className="py-3 pr-4 text-gray-400">{index + 1}</td>
                <td className="py-3 pr-4 font-bold text-drg-orange">
                  {player.player_name}
                </td>
                <td className="py-3 pr-4">{hours}h</td>
                <td className="py-3 pr-4">
                  {player.total_missions.toLocaleString()}
                </td>
                <td className="py-3 pr-4">
                  {player.total_kills.toLocaleString()}
                </td>
                <td className="py-3">{distanceKm} km</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
