"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getPrefs } from "@/lib/preferences";
import { useUpload } from "@/lib/hooks/useUpload";
import PinModal from "@/components/PinModal";

export default function UploadForm() {
  const t = useTranslation();
  const [playerName, setPlayerName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pinModalMode, setPinModalMode] = useState<"create" | "verify" | null>(null);

  const {
    isLoading,
    progress,
    currentTip,
    handleSubmit,
    handlePinSuccess,
    handleDemo,
  } = useUpload({ playerName, selectedFile, setFormError, setPinModalMode });

  // Synchro Options → upload : pré-remplit le pseudo avec la préférence persistante
  useEffect(() => {
    const saved = getPrefs().playerName;
    if (saved) setPlayerName(saved);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background industrial-grid flex flex-col justify-center items-center gap-6">
        <p className="font-display text-2xl text-primary tracking-widest">
          {currentTip}
        </p>
        <div className="w-full max-w-md border-4 border-outline p-1 bg-surface-container pressed-metal">
          <div className="h-6 bg-surface-dim overflow-hidden relative">
            <div
              className="h-full bg-primary transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          {t("processing")} {progress}%
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background industrial-grid flex items-center justify-center relative overflow-hidden">
      {/* Modal PIN — s'affiche par-dessus le formulaire */}
      {pinModalMode && (
        <PinModal
          mode={pinModalMode}
          playerName={playerName.trim()}
          onSuccess={handlePinSuccess}
          onCancel={() => setPinModalMode(null)}
        />
      )}
      {/* Coins en rayures danger */}
      <div className="absolute top-0 left-0 w-24 h-24 hazard-stripes opacity-40" />
      <div className="absolute top-0 right-0 w-24 h-24 hazard-stripes opacity-40" />
      <div className="absolute bottom-0 left-0 w-24 h-24 hazard-stripes opacity-40" />
      <div className="absolute bottom-0 right-0 w-24 h-24 hazard-stripes opacity-40" />

      {/* Panel central */}
      <div className="industrial-panel pressed-metal w-full max-w-lg mx-4">
        {/* Header du panel */}
        <div className="p-6 border-b-4 border-outline flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">
            terminal
          </span>
          <h1 className="font-display text-3xl text-on-surface tracking-widest">
            {t("formTitle")}
          </h1>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Input pseudo */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              fingerprint
            </span>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t("operativeId")}
              className="w-full bg-surface-dim border-b-4 border-primary text-on-surface font-mono pl-10 pr-4 py-3 placeholder:text-on-surface-variant placeholder:tracking-widest focus:outline-none"
            />
          </div>

          {/* Dropzone */}
          <div className="scan-line border-2 border-dashed border-outline-variant p-8 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              architecture
            </span>
            <p className="font-mono text-sm text-on-surface-variant tracking-widest">
              {t("dragDrop")}
            </p>
            <input
              type="file"
              accept=".sav"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="text-on-surface-variant font-mono text-xs"
            />
            {selectedFile && (
              <p className="text-primary font-mono text-xs tracking-widest">
                ✓ {selectedFile.name}
              </p>
            )}
          </div>

          {/* Aide pour trouver le fichier */}
          <div>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="font-mono text-xs text-on-surface-variant tracking-widest hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                {showHelp ? "expand_less" : "expand_more"}
              </span>
              {t("whereFindFile")}
            </button>

            {showHelp && (
              <div className="mt-2 bg-surface-dim border-l-4 border-primary p-4 font-mono text-xs text-on-surface-variant flex flex-col gap-2">
                <p>
                  {t("helpStep1")}{" "}
                  <span className="text-primary">Deep Rock Galactic</span>{" "}
                  dans Steam
                </p>
                <p>
                  {t("helpStep2Prefix")}{" "}
                  <span className="text-primary">{t("helpStep2Action")}</span>
                </p>
                <p>
                  {t("helpStep3Prefix")}{" "}
                  <span className="text-primary">FSD \ Saved \ SaveGames</span>
                </p>
                <p>
                  {t("helpStep4Prefix")}{" "}
                  <span className="text-primary">{t("helpStep4Suffix")}</span>
                </p>
              </div>
            )}
          </div>

          {/* Avertissement */}
          <div className="bg-surface-dim border-l-4 border-error px-4 py-3">
            <p className="font-mono text-xs text-on-surface-variant italic">
              {t("warning")}
            </p>
          </div>

          {/* Message d'erreur validation */}
          {formError && (
            <p className="font-mono text-xs text-error tracking-widest text-center">
              {formError}
            </p>
          )}

          {/* Bouton submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="relative w-full bg-primary text-on-primary font-display text-xl tracking-widest py-3 flex items-center justify-center gap-2 overflow-hidden hover:bg-primary-fixed transition-colors"
          >
            <div className="absolute inset-0 hazard-stripes opacity-10" />
            <span className="material-symbols-outlined">cloud_upload</span>
            {t("submitBtn")}
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-drg-border" />
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              {t("separator")}
            </p>
            <div className="flex-1 border-t border-drg-border" />
          </div>

          {/* Bouton démo */}
          <button
            type="button"
            onClick={handleDemo}
            className="w-full border-2 border-drg-border text-on-surface-variant font-display text-lg tracking-widest py-2 hover:border-drg-orange hover:text-drg-orange transition-colors"
          >
            {t("tryDemo")}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t-4 border-outline">
          <p className="font-mono text-xs text-on-surface-variant tracking-widest">
            Ver: 8.4.2-STABLE | Loc: Hoxxes IV / Space Rig 17 | Enc:
            Deep-Rock-Standard
          </p>
        </div>
      </div>
    </div>
  );
}
