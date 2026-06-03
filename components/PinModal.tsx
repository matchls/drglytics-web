"use client";
import { useState } from "react";
import { verifyPIN } from "@/app/actions/pinActions";
import { useTranslation } from "@/lib/i18n";

interface Props {
  mode: "create" | "verify";
  playerName: string;
  onSuccess: (pin: string) => void;
  onCancel: () => void;
}

export default function PinModal({ mode, playerName, onSuccess, onCancel }: Props) {
  const t = useTranslation();
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!/^\d{4,6}$/.test(pin)) {
      setError(t("pinErrFormat"));
      return;
    }

    if (mode === "create") {
      if (pin !== pinConfirm) {
        setError(t("pinErrMismatch"));
        return;
      }
      setLoading(true);
      onSuccess(pin);
    }

    if (mode === "verify") {
      setLoading(true);
      const { valid } = await verifyPIN(playerName, pin);
      if (!valid) {
        setError(t("pinErrWrong"));
        setLoading(false);
        return;
      }
      onSuccess(pin);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="industrial-panel w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b-4 border-outline flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">lock</span>
          <p className="font-display text-lg text-on-surface tracking-widest flex-1">
            {mode === "create" ? t("pinTitleCreate") : t("pinTitleVerify")}
          </p>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t("pinClose")}
            className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
          >
            close
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="font-mono text-xs text-on-surface-variant">
            {mode === "create"
              ? `${t("pinCreateMsgPrefix")}${playerName}${t("pinCreateMsgSuffix")}`
              : `${t("pinVerifyMsgPrefix")}${playerName}${t("pinVerifyMsgSuffix")}`}
          </p>

          {mode === "create" && (
            <div className="bg-surface-container border-l-4 border-primary px-3 py-2">
              <p className="font-mono text-xs text-primary tracking-widest">
                {t("pinWarning")}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              {t("pinLabel")}
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange tracking-[0.5em]"
            />
          </div>

          {mode === "create" && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs text-on-surface-variant tracking-widest">
                {t("pinConfirmLabel")}
              </p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="bg-surface-container-highest border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange tracking-[0.5em]"
              />
            </div>
          )}

          {error && (
            <p className="font-mono text-xs text-error tracking-widest">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-on-primary font-display tracking-widest py-2 hover:bg-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t("pinBtnLoading")
              : mode === "create"
                ? t("pinBtnCreate")
                : t("pinBtnVerify")}
          </button>
        </div>
      </div>
    </div>
  );
}
