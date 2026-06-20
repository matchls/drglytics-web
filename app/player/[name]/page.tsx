"use client";
import { useParams } from "next/navigation";
import { getPlayerProfile } from "@/app/actions/getPlayerProfile";
import { getProfileOwnership } from "@/app/actions/claimProfile";
import { useAsync } from "@/lib/hooks/useAsync";
import PlayerStatsLayout from "@/components/PlayerStatsLayout";
import ClaimProfilePanel from "@/components/ClaimProfilePanel";
import { useTranslation } from "@/lib/i18n";

export default function PlayerProfilePage() {
  const t = useTranslation();
  const params = useParams();
  const playerName = decodeURIComponent(params.name as string);

  const { data, loading, error } = useAsync(
    async () => {
      const profile = await getPlayerProfile(playerName);
      if (!profile) throw new Error(t("playerNotFound"));
      return profile;
    },
    [playerName],
  );

  const { data: ownership } = useAsync(
    () => getProfileOwnership(playerName),
    [playerName],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-on-surface-variant tracking-widest animate-pulse">
          {t("playerLoading")}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-error tracking-widest">
          ⚠ {error ?? t("playerNotFound")}
        </p>
      </div>
    );
  }

  return (
    <PlayerStatsLayout
      data={data}
      header={
        <>
          <div className="industrial-panel p-6 flex flex-col gap-1">
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              {t("playerFileHeader")}
            </p>
            <p className="font-display text-4xl text-primary tracking-widest">
              {data.player.name.toUpperCase()}
            </p>
          </div>
          {ownership && (
            <ClaimProfilePanel playerName={playerName} ownership={ownership} />
          )}
        </>
      }
    />
  );
}
