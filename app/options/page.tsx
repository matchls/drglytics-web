"use client";
import { useState, useEffect } from "react";
import { usePrefs } from "@/lib/PrefsContext";
import { useTranslation } from "@/lib/i18n";
import { sendContactEmail } from "@/app/actions/sendContactEmail";
import {
  getLeaderboardVisibility,
  updateLeaderboardVisibility,
} from "@/app/actions/leaderboardVisibility";

export default function OptionsPage() {
  const { prefs, update } = usePrefs();
  const t = useTranslation();

  // Champ pseudo contrôlé — initialisé vide (cohérent avec le rendu SSR de PrefsContext),
  // puis synchronisé avec localStorage dès que PrefsProvider a hydraté ses valeurs.
  // Sans cet useEffect, defaultValue resterait figé sur "" et le champ n'afficherait
  // jamais le pseudo sauvegardé.
  const [pseudoField, setPseudoField] = useState("");
  useEffect(() => {
    setPseudoField(prefs.playerName);
  }, [prefs.playerName]);

  // null = non connecté ou pas de ligne en base ; boolean = valeur serveur
  const [dbVisibility, setDbVisibility] = useState<boolean | null>(null);
  const [visibilitySyncing, setVisibilitySyncing] = useState(false);

  // Au montage : récupère la valeur serveur et synchronise le toggle local
  useEffect(() => {
    getLeaderboardVisibility().then((v) => {
      if (v === null) return; // non connecté ou pas encore de ligne
      setDbVisibility(v);
      if (prefs.showOnLeaderboard !== v) update({ showOnLeaderboard: v });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVisibilityToggle() {
    const newValue = !prefs.showOnLeaderboard;
    update({ showOnLeaderboard: newValue }); // mise à jour optimiste + localStorage
    if (dbVisibility !== null) {
      // Joueur connecté avec une ligne en base — mise à jour immédiate en DB
      setVisibilitySyncing(true);
      const result = await updateLeaderboardVisibility(newValue);
      if (result.ok) {
        setDbVisibility(newValue);
      } else {
        update({ showOnLeaderboard: !newValue }); // annule si erreur
      }
      setVisibilitySyncing(false);
    }
  }

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
    <div className="min-h-screen bg-background p-3 md:p-6 flex flex-col gap-4 md:gap-6">
      <div className="industrial-panel p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">settings</span>
        <p className="font-display text-2xl text-on-surface tracking-widest">
          {t("optionsTitle")}
        </p>
      </div>

      {/* Leaderboard + Pseudo — issue #13 */}
      <div className="industrial-panel p-6">
        <div className="flex flex-col gap-6">
          <p className="font-display text-lg text-on-surface tracking-widest border-b border-drg-border pb-2">
            {t("optProfileLeaderboard")}
          </p>

          {/* Changement de pseudo */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              {t("optPseudo")}
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={pseudoField}
                onChange={(e) => setPseudoField(e.target.value)}
                onBlur={(e) => {
                  const trimmed = e.target.value.trim();
                  setPseudoField(trimmed);
                  update({ playerName: trimmed });
                }}
                maxLength={32}
                className="flex-1 bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange"
              />
            </div>
            <p className="font-mono text-xs text-on-surface-variant">
              {t("optPseudoHint")}
            </p>
          </div>

          {/* Opt-out leaderboard */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm text-on-surface tracking-widest">
                {t("optShowOnLeaderboard")}
              </p>
              <p className="font-mono text-xs text-on-surface-variant">
                {dbVisibility !== null
                  ? t("optShowOnLeaderboardHintConnected")
                  : t("optShowOnLeaderboardHint")}
              </p>
            </div>
            <button
              onClick={handleVisibilityToggle}
              disabled={visibilitySyncing}
              className="w-12 h-6 border-2 border-drg-border bg-surface-container relative overflow-hidden p-0 disabled:opacity-50"
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
            {t("languageLabel")}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm text-on-surface tracking-widest">
                {t("languageLabel")}
              </p>
              <p className="font-mono text-xs text-on-surface-variant">
                {t("optLanguageHint")}
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
            {t("unitsLabel")}
          </p>

          {/* Distance */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm text-on-surface tracking-widest">
                {t("distanceLabel")}
              </p>
              <p className="font-mono text-xs text-on-surface-variant">
                {t("optDistanceHint")}
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
                {t("timeFormatLabel")}
              </p>
              <p className="font-mono text-xs text-on-surface-variant">
                {t("optTimeFormatHint")}
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
                  {fmt === "hours" ? t("timeFormatHours") : t("timeFormatDhm")}
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
              {t("optContactTitle")}
            </p>
            <p className="font-mono text-xs text-on-surface-variant mt-2">
              {t("optContactHint")}
            </p>
          </div>

          {/* Pseudo */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              {t("optPseudo")}
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
              {t("optMessage")}
            </p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder={t("optMessagePlaceholder")}
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
              {t("optContactSuccess")}
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
            {contactLoading ? t("optContactSending") : t("optContactSend")}
          </button>
        </div>
      </div>
    </div>
  );
}
