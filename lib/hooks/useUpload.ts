"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseSaveFile } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { checkPlayer } from "@/app/actions/pinActions";
import { savePlayerStats } from "@/app/actions/savePlayerStats";
import { buildPlayerRow } from "@/lib/buildPlayerRow";
import { getPrefs, setPrefs } from "@/lib/preferences";
import { setDashboardSession } from "@/lib/session";
import { getPlayerProfile } from "@/app/actions/getPlayerProfile";

interface UseUploadParams {
  playerName: string;
  selectedFile: File | null;
  setFormError: (error: string | null) => void;
  setPinModalMode: (mode: "create" | "verify" | null) => void;
}

interface UseUploadReturn {
  isLoading: boolean;
  progress: number;
  currentTip: string;
  handleSubmit: () => Promise<void>;
  handlePinSuccess: (pin: string) => Promise<void>;
  handleDemo: () => Promise<void>;
}

export function useUpload({
  playerName,
  selectedFile,
  setFormError,
  setPinModalMode,
}: UseUploadParams): UseUploadReturn {
  const t = useTranslation();
  const router = useRouter();

  const resultRef = useRef<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [apiDone, setApiDone] = useState(false);

  const tips = [t("tip1"), t("tip2"), t("tip3"), t("tip4"), t("tip5")];

  // Anime la barre de progression sur ~4 secondes
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Quand l'API a répondu, force la barre à 100 % puis redirige.
  useEffect(() => {
    if (!apiDone) return;
    if (progress < 100) {
      setProgress(100);
      return;
    }
    setDashboardSession(resultRef.current!, playerName, false);
    setPrefs({ playerName });
    router.push("/dashboard");
  }, [apiDone, progress, router, playerName]);

  // Rotation des tips pendant le chargement
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading, tips.length]);

  async function handleSubmit() {
    if (!playerName && !selectedFile) {
      setFormError(t("errMissingBoth"));
      return;
    }
    if (!playerName) {
      setFormError(t("errMissingId"));
      return;
    }
    if (!selectedFile) {
      setFormError(t("errMissingFile"));
      return;
    }
    setFormError(null);

    const { exists, hasPIN } = await checkPlayer(playerName);
    if (!exists || !hasPIN) {
      setPinModalMode("create");
    } else {
      setPinModalMode("verify");
    }
  }

  async function handlePinSuccess(pin: string) {
    setPinModalMode(null);
    setIsLoading(true);
    const response = await parseSaveFile(selectedFile!, playerName);
    resultRef.current = response;

    if (response.ok && response.data && getPrefs().showOnLeaderboard) {
      const result = await savePlayerStats(
        playerName,
        pin,
        buildPlayerRow(response.data),
      );
      if (!result.ok) console.error("savePlayerStats:", result.error);
    }

    setApiDone(true);
  }

  async function handleDemo() {
    const demoPlayer = process.env.NEXT_PUBLIC_DEMO_PLAYER ?? "poussif";
    const data = await getPlayerProfile(demoPlayer);

    if (!data) {
      alert(t("gbDemoUnavailable"));
      return;
    }

    setDashboardSession({ ok: true, data }, demoPlayer, true);
    router.push("/dashboard");
  }

  return {
    isLoading,
    progress,
    currentTip: tips[currentTip],
    handleSubmit,
    handlePinSuccess,
    handleDemo,
  };
}
