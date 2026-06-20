"use client";
import { useRef, useState } from "react";
import { type ProfileOwnership, claimProfile } from "@/app/actions/claimProfile";
import { type ClaimResult } from "@/app/actions/claimProfile";
import { useTranslation } from "@/lib/i18n";
import { type DashboardData } from "@/lib/types";
import Link from "next/link";

interface Props {
  playerName: string;
  ownership: ProfileOwnership;
}

type State = "idle" | "parsing" | "done" | "error";

export default function ClaimProfilePanel({ playerName, ownership }: Props) {
  const t = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Badge "propriétaire vérifié"
  if (ownership.isOwner) {
    return (
      <div className="industrial-panel p-4 flex items-center gap-3 border-l-4 border-primary">
        <span className="material-symbols-outlined text-primary">verified</span>
        <p className="font-mono text-xs text-primary tracking-widest">
          {t("claimOwnerVerified")}
        </p>
      </div>
    );
  }

  // Profil réclamé par quelqu'un d'autre — on ne montre rien
  if (ownership.isClaimed) return null;

  // Profil non réclamé — affiche le badge + le flow selon contexte
  return (
    <div className="industrial-panel p-4 border-l-4 border-drg-orange flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-drg-orange">lock_open</span>
        <p className="font-display text-sm text-drg-orange tracking-widest">
          {t("claimUnclaimed")}
        </p>
      </div>

      {/* Cas : non connecté */}
      {!ownership.isLoggedIn && (
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          {t("claimLoginToVerify")}{" "}
          <Link href="/auth/login" className="text-primary underline">
            LOGIN
          </Link>
        </p>
      )}

      {/* Cas : connecté mais a déjà un autre profil */}
      {ownership.isLoggedIn && ownership.userHasOtherProfile && (
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          {t("claimErrUserHasProfile")}
        </p>
      )}

      {/* Cas : connecté et peut réclamer */}
      {ownership.isLoggedIn && !ownership.userHasOtherProfile && state !== "done" && (
        <>
          <p className="font-mono text-xs text-on-surface-variant tracking-widest">
            {t("claimDesc")}
          </p>
          <div className="flex gap-2 items-center">
            <input
              ref={fileRef}
              type="file"
              accept=".sav"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={state === "parsing"}
              className="font-mono text-xs tracking-widest px-4 py-2 bg-primary text-on-primary disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {state === "parsing" ? t("claimParsing") : t("claimBtn")}
            </button>
            {errorMsg && (
              <p className="font-mono text-xs text-error tracking-widest">{errorMsg}</p>
            )}
          </div>
        </>
      )}

      {/* Succès */}
      {state === "done" && (
        <p className="font-mono text-xs text-primary tracking-widest">
          ✓ {t("claimSuccess")}
        </p>
      )}
    </div>
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState("parsing");
    setErrorMsg(null);

    // 1. Parse le .sav via le endpoint parse-only
    const form = new FormData();
    form.append("file", file);
    const parseRes = await fetch("/api/parse-only", { method: "POST", body: form });
    const parseJson = await parseRes.json() as { ok: boolean; data?: DashboardData; error?: string };

    if (!parseJson.ok || !parseJson.data) {
      setState("error");
      setErrorMsg(parseJson.error ?? t("claimErrUnknown"));
      return;
    }

    // 2. Tente le claim avec les stats parsées
    const result: ClaimResult = await claimProfile(playerName, parseJson.data);

    if (result.ok) {
      setState("done");
    } else {
      setState("error");
      const errKey = {
        not_logged_in: "claimErrNotLoggedIn",
        already_claimed: "claimErrAlreadyClaimed",
        user_has_profile: "claimErrUserHasProfile",
        stats_mismatch: "claimErrStatsMismatch",
        not_found: "claimErrUnknown",
        db_error: "claimErrUnknown",
      }[result.error] as Parameters<typeof t>[0];
      setErrorMsg(t(errKey));
    }
  }
}
