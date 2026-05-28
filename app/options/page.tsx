"use client";
import { usePrefs } from "@/lib/PrefsContext";

export default function OptionsPage() {
  const { prefs, update } = usePrefs();

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
        <div className="flex flex-col gap-6">
          <p className="font-display text-lg text-on-surface tracking-widest border-b border-drg-border pb-2">
            LANGUE
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm text-on-surface tracking-widest">
                LANGUAGE
              </p>
              <p className="font-mono text-xs text-on-surface-variant">
                Français ou English.
              </p>
            </div>
            <div className="flex gap-2">
              {(["fr", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => update({ language: lang })}
                  className={`px-4 py-1 font-mono text-xs tracking-widest border-2 transition-colors ${
                    prefs.language === lang
                      ? "bg-primary text-on-primary border-primary"
                      : "border-drg-border text-on-surface-variant hover:border-drg-orange"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Unités — issue #14 */}
      <div className="industrial-panel p-6">
        <div className="flex flex-col gap-6">
          <p className="font-display text-lg text-on-surface tracking-widest border-b border-drg-border pb-2">
            UNITÉS
          </p>

          {/* Distance */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm text-on-surface tracking-widest">
                DISTANCE
              </p>
              <p className="font-mono text-xs text-on-surface-variant">
                Kilomètres ou miles.
              </p>
            </div>
            <div className="flex gap-2">
              {(["km", "mi"] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => update({ distanceUnit: unit })}
                  className={`px-4 py-1 font-mono text-xs tracking-widest border-2 transition-colors ${
                    prefs.distanceUnit === unit
                      ? "bg-primary text-on-primary border-primary"
                      : "border-drg-border text-on-surface-variant hover:border-drg-orange"
                  }`}
                >
                  {unit.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Format temps */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm text-on-surface tracking-widest">
                FORMAT TEMPS
              </p>
              <p className="font-mono text-xs text-on-surface-variant">
                342h 15m — ou — 14j 6h
              </p>
            </div>
            <div className="flex gap-2">
              {(["hours", "dhm"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => update({ timeFormat: fmt })}
                  className={`px-4 py-1 font-mono text-xs tracking-widest border-2 transition-colors ${
                    prefs.timeFormat === fmt
                      ? "bg-primary text-on-primary border-primary"
                      : "border-drg-border text-on-surface-variant hover:border-drg-orange"
                  }`}
                >
                  {fmt === "hours" ? "HEURES" : "J+H"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
