"use client";
import { DashboardData } from "@/lib/types";
import { getUnlockedBadges, type BadgeTier } from "@/lib/badges";
import { useTranslation } from "@/lib/i18n";

const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: "#cd7f32",
  silver: "#b0b8c1",
  gold: "#e8a320",
};

interface Props {
  data: DashboardData;
}

export default function PlayerBadges({ data }: Props) {
  const t = useTranslation();
  const unlocked = getUnlockedBadges(data);

  return (
    <div className="industrial-panel overflow-hidden">
      <div className="p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">military_tech</span>
        <p className="font-display text-xl text-on-surface tracking-widest flex-1">
          {t("badgesTitle")}
        </p>
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          {unlocked.length} / {getUnlockedBadges(data).length > 0 ? unlocked.length : 0}
        </p>
      </div>

      {unlocked.length === 0 ? (
        <p className="p-6 font-mono text-xs text-on-surface-variant tracking-widest text-center">
          {t("badgesNone")}
        </p>
      ) : (
        <div className="p-4 flex flex-wrap gap-2">
          {unlocked.map((badge) => (
            <div
              key={badge.id}
              title={t(badge.descKey)}
              className="flex items-center gap-2 border px-3 py-1.5"
              style={{ borderColor: TIER_COLORS[badge.tier] }}
            >
              <span
                className="material-symbols-outlined text-base"
                style={{ color: TIER_COLORS[badge.tier] }}
              >
                military_tech
              </span>
              <span
                className="font-display text-sm tracking-widest"
                style={{ color: TIER_COLORS[badge.tier] }}
              >
                {t(badge.labelKey)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
