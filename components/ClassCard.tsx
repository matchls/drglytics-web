"use client";
import { usePrefs } from "@/lib/PrefsContext";
import { formatDistance, formatTime } from "@/lib/formatters";
import { useTranslation, TranslationKey } from "@/lib/i18n";
import { ClassSummary, CLASS_COLORS, CLASS_ICONS } from "@/lib/types";
import Image from "next/image";

interface Props {
  classData: ClassSummary;
}

const CLASS_IMAGES: Record<string, string> = {
  Driller: "/icons/classes/driller_img.png",
  Gunner: "/icons/classes/gunner_img.png",
  Engineer: "/icons/classes/engineer_img.png",
  Scout: "/icons/classes/scout_img.png",
};

// Taille d'affichage par classe — compense les différences de padding dans les PNG sources
const CLASS_IMAGE_SIZE: Record<string, number> = {
  Driller: 190,
  Gunner: 180,
  Engineer: 130,
  Scout: 120,
};

// Retourne la clé i18n du rang selon le nombre de missions
function getRankKey(missions: number): {
  key: TranslationKey;
  className: string;
} {
  if (missions >= 500)
    return {
      key: "rankVeteran",
      className: "text-primary border border-primary",
    };
  if (missions >= 200)
    return {
      key: "rankExperienced",
      className: "text-tertiary border border-tertiary",
    };
  if (missions >= 50)
    return {
      key: "rankRookie",
      className: "text-on-surface-variant border border-outline-variant",
    };
  return { key: "rankGreenbeard", className: "text-error border border-error" };
}

export default function ClassCard({ classData }: Props) {
  const { prefs } = usePrefs();
  const t = useTranslation();
  const rank = getRankKey(classData.missions_completed);

  const stats = [
    {
      label: t("catMissions"),
      value: classData.missions_completed.toLocaleString(),
    },
    { label: t("catKills"), value: classData.kills.toLocaleString() },
    {
      label:
        prefs.timeFormat === "hours"
          ? t("timeFormatHours")
          : t("timeFormatDhm"),
      value: formatTime(classData.time_played_s, prefs),
    },
    {
      label: prefs.distanceUnit.toUpperCase(),
      value: formatDistance(classData.distance_cm, prefs, false),
    },
    { label: t("downs"), value: classData.downs.toLocaleString() },
  ];

  return (
    <div className="industrial-panel pressed-metal overflow-hidden relative">
      {/* Image de fond semi-transparente — centrée dans la card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src={CLASS_IMAGES[classData.name] ?? ""}
          alt=""
          width={CLASS_IMAGE_SIZE[classData.name] ?? 130}
          height={CLASS_IMAGE_SIZE[classData.name] ?? 130}
          className="object-contain opacity-[0.2]"
        />
      </div>

      {/* Bande colorée en haut */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: CLASS_COLORS[classData.name] }}
      />

      <div className="p-4 flex gap-4 relative z-10">
        {/* Colonne gauche : header + stats */}
        <div className="flex-1 min-w-0">
          {/* Header : icône + nom + badge */}
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={CLASS_ICONS[classData.name] ?? ""}
              alt={classData.name}
              width={36}
              height={36}
              className="opacity-90"
            />
            <p className="font-display text-2xl text-on-surface tracking-widest flex-1">
              {classData.name.toUpperCase()}
            </p>
            <span
              className={`font-mono text-xs px-2 py-0.5 tracking-widest ${rank.className}`}
            >
              {t(rank.key)}
            </span>
          </div>

          {/* Stats */}
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between py-1.5 border-b border-outline last:border-0"
            >
              <span className="font-mono text-xs text-on-surface-variant tracking-widest">
                {label}
              </span>
              <span className="font-mono text-sm text-on-surface">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
