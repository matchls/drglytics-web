"use client";
import { useState, useEffect } from "react";
import { getPrefs, setPrefs, Preferences } from "@/lib/preferences";

export default function OptionsPage() {
  const [prefs, setPrefsState] = useState<Preferences | null>(null);

  useEffect(() => {
    setPrefsState(getPrefs());
  }, []);

  function update(partial: Partial<Preferences>) {
    setPrefs(partial);
    setPrefsState((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  if (!prefs) return null;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      <div className="industrial-panel p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">settings</span>
        <p className="font-display text-2xl text-on-surface tracking-widest">
          OPTIONS
        </p>
      </div>

      {/* Leaderboard + Pseudo — issue #13 */}
      <div className="industrial-panel p-6">
        <div className="flex flex-col gap-6">
          <p className="font-display text-lg text-on-surface tracking-widest border-b border-drg-border pb-2">
            PROFIL & LEADERBOARD
          </p>

          {/* Changement de pseudo */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              PSEUDO
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                defaultValue={prefs.playerName}
                maxLength={32}
                onBlur={(e) => update({ playerName: e.target.value.trim() })}
                className="flex-1 bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange"
              />
            </div>
            <p className="font-mono text-xs text-on-surface-variant">
              Modifié au prochain upload.
            </p>
          </div>

          {/* Opt-out leaderboard */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm text-on-surface tracking-widest">
                APPARAÎTRE DANS LE LEADERBOARD
              </p>
              <p className="font-mono text-xs text-on-surface-variant">
                Si désactivé, vos stats ne seront plus visibles par les autres
                joueurs.
              </p>
            </div>
            <button
              onClick={() =>
                update({ showOnLeaderboard: !prefs.showOnLeaderboard })
              }
              className={`w-12 h-6 border-2 transition-colors relative ${
                prefs.showOnLeaderboard
                  ? "bg-drg-orange border-drg-orange"
                  : "bg-transparent border-drg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-on-primary transition-transform ${
                  prefs.showOnLeaderboard ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Langue + Unités — issue #14 */}
      <div className="industrial-panel p-6">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest text-center py-4">
          LANGUE & UNITÉS — COMING SOON
        </p>
      </div>
    </div>
  );
}
