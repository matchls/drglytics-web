"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadAndSave } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { checkPlayer } from "@/app/actions/pinActions";
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
  leaderboardFailed: boolean;
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
  const [leaderboardFailed, setLeaderboardFailed] = useState(false);

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
  // Délai supplémentaire si leaderboard a échoué : laisse l'avertissement visible.
  useEffect(() => {
    if (!apiDone) return;
    if (progress < 100) {
      setProgress(100);
      return;
    }
    const delay = leaderboardFailed ? 2500 : 0;
    const timer = setTimeout(() => {
      setDashboardSession(resultRef.current!, playerName, false);
      setPrefs({ playerName });
      router.push("/dashboard");
    }, delay);
    return () => clearTimeout(timer);
  }, [apiDone, progress, leaderboardFailed, router, playerName]);

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

    // uploadAndSave orchestre parse + save côté serveur en un seul aller-retour.
    // Le DashboardData complet ne transite plus deux fois par le navigateur.
    const response = await uploadAndSave(
      selectedFile!,
      playerName,
      pin,
      getPrefs().showOnLeaderboard,
    );

    // Échec de parsing : on arrête le chargement et on affiche l'erreur.
    // On ne stocke pas la réponse et on ne déclenche pas apiDone,
    // pour éviter la redirection vers /dashboard avec une session vide.
    if (!response.ok || !response.data) {
      setIsLoading(false);
      setProgress(0);
      setFormError(t("errParseFailed"));
      return;
    }

    // On stocke uniquement la partie ApiResponse dans resultRef (pour setDashboardSession).
    resultRef.current = { ok: response.ok, data: response.data, error: response.error };

    if (response.leaderboardFailed) {
      if (process.env.NODE_ENV !== "production")
        console.warn("uploadAndSave: leaderboard save failed");
      setLeaderboardFailed(true);
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
    leaderboardFailed,
    handleSubmit,
    handlePinSuccess,
    handleDemo,
  };
}
