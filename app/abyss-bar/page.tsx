"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardData } from "@/lib/types";

export default function AbyssBarPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("dashboardData");
    if (!raw) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(raw);
    setData(parsed.data);
  }, [router]);

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      {data && (
        <>
          {/* Header */}
          <div className="industrial-panel p-4 border-b-4 border-outline flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              local_bar
            </span>
            <p className="font-display text-2xl text-on-surface tracking-widest">
              ABYSS BAR
            </p>
          </div>

          {/* Anecdotes — issue #10 */}
          <div className="industrial-panel p-6">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest text-center py-4">
              ANECDOTES — COMING SOON
            </p>
          </div>

          {/* Badges — issue #11 */}
          <div className="industrial-panel p-6">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest text-center py-4">
              BADGES — COMING SOON
            </p>
          </div>
        </>
      )}
    </div>
  );
}
