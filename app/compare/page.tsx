"use client";
import { Suspense, useState, useEffect, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getPlayerProfile } from "@/app/actions/getPlayerProfile";
import CompareView from "@/components/CompareView";
import { useTranslation } from "@/lib/i18n";
import { type DashboardData } from "@/lib/types";
import Link from "next/link";

type CompareResult = {
  nameA: string;
  nameB: string;
  dataA: DashboardData | null;
  dataB: DashboardData | null;
};

function CompareInner() {
  const params = useSearchParams();
  const router = useRouter();
  const t = useTranslation();

  const initialA = params.get("a") ?? "";
  const initialB = params.get("b") ?? "";

  const [inputA, setInputA] = useState(initialA);
  const [inputB, setInputB] = useState(initialB);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);

  async function doCompare(a: string, b: string) {
    setLoading(true);
    const [dataA, dataB] = await Promise.all([
      getPlayerProfile(a),
      getPlayerProfile(b),
    ]);
    setResult({ nameA: a, nameB: b, dataA, dataB });
    setLoading(false);
    // Met à jour l'URL pour rendre le lien partageable
    router.replace(
      `/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`,
    );
  }

  // Auto-compare si les deux paramètres URL sont présents
  useEffect(() => {
    if (initialA && initialB) {
      doCompare(initialA, initialB);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const a = inputA.trim();
    const b = inputB.trim();
    if (a && b) await doCompare(a, b);
  }

  const bothFound =
    result && result.dataA !== null && result.dataB !== null;

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="industrial-panel p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">compare_arrows</span>
        <p className="font-display text-2xl text-on-surface tracking-widest flex-1">
          {t("cmpTitle")}
        </p>
        <Link
          href="/leaderboard"
          className="font-mono text-xs text-on-surface-variant hover:text-primary tracking-widest transition-colors"
        >
          ← LEADERBOARD
        </Link>
      </div>

      {/* Formulaire de sélection */}
      <form onSubmit={handleSubmit} className="industrial-panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-on-surface-variant tracking-widest uppercase">
              {result?.nameA ?? "PLAYER A"}
            </label>
            <input
              type="text"
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
              placeholder={t("cmpEnterName")}
              className="bg-surface-container border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange w-full"
            />
          </div>

          <div className="flex items-center justify-center pb-2">
            <span className="font-display text-xl text-on-surface-variant tracking-widest">
              VS
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-on-surface-variant tracking-widest uppercase">
              {result?.nameB ?? "PLAYER B"}
            </label>
            <input
              type="text"
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
              placeholder={t("cmpEnterName")}
              className="bg-surface-container border border-drg-border text-on-surface font-mono text-sm p-2 focus:outline-none focus:border-drg-orange w-full"
            />
          </div>

          <button
            type="submit"
            disabled={!inputA.trim() || !inputB.trim() || loading}
            className="font-mono text-xs tracking-widest px-4 py-2 bg-primary text-on-primary disabled:opacity-40 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {loading ? t("cmpLoading") : t("cmpSearch")}
          </button>
        </div>
      </form>

      {/* États */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="font-mono text-on-surface-variant tracking-widest animate-pulse">
            {t("cmpLoading")}
          </p>
        </div>
      )}

      {!loading && result && !bothFound && (
        <div className="industrial-panel p-6 flex flex-col gap-3">
          {result.dataA === null && (
            <p className="font-mono text-sm text-error tracking-widest">
              {result.nameA}: {t("cmpNotFound")}
            </p>
          )}
          {result.dataB === null && (
            <p className="font-mono text-sm text-error tracking-widest">
              {result.nameB}: {t("cmpNotFound")}
            </p>
          )}
        </div>
      )}

      {!loading && bothFound && (
        <CompareView
          nameA={result.nameA}
          nameB={result.nameB}
          dataA={result.dataA!}
          dataB={result.dataB!}
        />
      )}
    </div>
  );
}

// Suspense boundary obligatoire pour useSearchParams() en Next.js 15
export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="font-mono text-on-surface-variant tracking-widest animate-pulse">
            LOADING...
          </p>
        </div>
      }
    >
      <CompareInner />
    </Suspense>
  );
}
