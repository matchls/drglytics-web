import { DashboardData } from "@/lib/types";
import { getPlayerBadges } from "@/lib/badges";
import { useTranslation } from "@/lib/i18n";

interface Props {
  data: DashboardData;
}

export default function AbyssBarBadges({ data }: Props) {
  const t = useTranslation();
  const badges = getPlayerBadges(data);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b-4 border-outline pb-3">
        <span className="material-symbols-outlined text-primary">military_tech</span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          {t("badgesTitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`border p-3 flex flex-col gap-1 transition-opacity ${
              badge.unlocked
                ? "border-drg-orange bg-surface-container-highest"
                : "border-drg-border opacity-35"
            }`}
          >
            <p
              className={`font-display text-sm tracking-widest ${badge.unlocked ? "text-drg-orange" : "text-on-surface-variant"}`}
            >
              {t(badge.labelKey)}
            </p>
            <p className="font-mono text-xs text-on-surface-variant">
              {t(badge.descKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
