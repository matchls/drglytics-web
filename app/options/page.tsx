"use client";
import { useState } from "react";
import { usePrefs } from "@/lib/PrefsContext";
import { sendContactEmail } from "@/app/actions/sendContactEmail";

export default function OptionsPage() {
  const { prefs, update } = usePrefs();

  // État du formulaire de contact
  const [contactPseudo, setContactPseudo] = useState(prefs.playerName ?? "");
  const [contactMessage, setContactMessage] = useState("");
  // Honeypot anti-bot : doit rester VIDE. Un humain ne voit pas ce champ ; un bot
  // qui remplit aveuglément tous les inputs le remplira et sera filtré côté serveur.
  const [contactHoneypot, setContactHoneypot] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactResult, setContactResult] = useState<"success" | "error" | null>(null);
  const [contactError, setContactError] = useState("");

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
              className="w-12 h-6 border-2 border-drg-border bg-surface-container relative overflow-hidden p-0"
            >
              {/* Curseur : gris à gauche = off, orange à droite = on */}
              <span
                className={`absolute top-1 w-4 h-4 transition-all duration-200 ${
                  prefs.showOnLeaderboard
                    ? "translate-x-1 bg-drg-orange"
                    : "-translate-x-5 bg-on-surface-variant"
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

      {/* Formulaire de contact */}
      <div className="industrial-panel p-6">
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-display text-lg text-on-surface tracking-widest border-b border-drg-border pb-2">
              CONTACTER L&apos;ADMINISTRATION
            </p>
            <p className="font-mono text-xs text-on-surface-variant mt-2">
              Problème avec ton PIN, tes stats ou autre chose ? Envoie un message.
            </p>
          </div>

          {/* Pseudo */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              PSEUDO
            </p>
            <input
              type="text"
              value={contactPseudo}
              onChange={(e) => setContactPseudo(e.target.value)}
              maxLength={32}
              className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange"
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              MESSAGE
            </p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Décris ton problème..."
              className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange resize-none placeholder:text-on-surface-variant"
            />
          </div>

          {/* Honeypot anti-bot — INVISIBLE pour un humain (hors écran, non focusable,
              exclu des lecteurs d'écran et de l'autocomplétion). Doit rester vide. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={contactHoneypot}
            onChange={(e) => setContactHoneypot(e.target.value)}
            className="absolute left-[-9999px] w-px h-px opacity-0"
          />

          {/* Erreur de validation */}
          {contactResult === "error" && (
            <p className="font-mono text-xs text-error tracking-widest">
              ⚠ {contactError}
            </p>
          )}

          {/* Confirmation d'envoi */}
          {contactResult === "success" && (
            <p className="font-mono text-xs text-primary tracking-widest">
              ✓ MESSAGE ENVOYÉ — L&apos;ADMINISTRATION A ÉTÉ NOTIFIÉE.
            </p>
          )}

          {/* Bouton */}
          <button
            disabled={contactLoading || contactResult === "success"}
            onClick={async () => {
              setContactLoading(true);
              setContactResult(null);
              const result = await sendContactEmail(
                contactPseudo,
                contactMessage,
                contactHoneypot,
              );
              if (result.success) {
                setContactResult("success");
                setContactMessage("");
              } else {
                setContactResult("error");
                setContactError(result.error);
              }
              setContactLoading(false);
            }}
            className="self-start bg-primary text-on-primary font-display tracking-widest px-6 py-2 hover:bg-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {contactLoading ? "ENVOI EN COURS..." : "ENVOYER"}
          </button>
        </div>
      </div>
    </div>
  );
}
