"use client";

import { parseSaveFile } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const tips = [
  "⛏ Drilling through your save file...",
  "🪨 Rock and Stone, Miner!",
  "📊 Counting your kills...",
  "🍺 Almost ready for a beer...",
  "💎 Gathering your stats...",
];

export default function UploadForm() {
  const [playerName, setPlayerName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          router.push("/dashboard");
          return 100;
        }
        return prev + 1;
      });
      return () => clearInterval(interval);
    }, 40);
  }, [isLoading]);

  async function handleSubmit() {
    if (!playerName || !selectedFile) return;
    setIsLoading(true);
    const response = await parseSaveFile(selectedFile, playerName);
    setResult(response);
  }

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-drg-dark text-white flex flex-col justify-center items-center">
        <p className="text-drg-orange text-xl font-bold uppercase tracking-widest">
          {tips[currentTip]}
        </p>
        <div className="w-full max-w-md mt-8 relative border-2 border-drg-orange p-1">
          <div className="h-6 bg-drg-panel overflow-hidden">
            <div
              className="h-full bg-drg-orange"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-drg-dark text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold uppercase tracking-widest text-drg-orange text-center">
          DRG Dashboard
        </h1>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Tape ton pseudo"
          className="w-full px-4 py-3 mt-8 rounded bg-drg-panel border border-drg-border text-white"
        />
        <div className="mt-4 border-2 border-dashed border-drg-orange rounded-lg p-8 text-center">
          <p>Dépose ton fichier de sauvegarde ici !</p>
          <p>
            (Chemin : ..\Steam\steamapps\common\Deep Rock
            Galactic\FSD\Saved\SaveGames)
          </p>
          <input
            type="file"
            accept=".sav"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="mt-6 flex justify-center">
          <div className="relative transition-transform duration-150 hover:scale-110 group">
            <div
              className="w-64 h-12 bg-drg-orange group-hover:bg-white"
              style={{
                clipPath: "polygon(90% 0, 100% 47%, 100% 100%, 0 100%, 0 0)",
              }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="absolute inset-0.5 w-[calc(100%-4px)] font-bold uppercase tracking-widest bg-drg-dark text-drg-orange group-hover:text-white"
              style={{
                clipPath: "polygon(90% 0, 99.8% 50%, 99.8% 100%, 0 100%, 0 0)",
              }}
            >
              Analyser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
