import { ClassSummary } from "@/lib/types";
import Image from "next/image";

interface Props {
  classData: ClassSummary;
}

const CLASS_TOP_COLORS: Record<string, string> = {
  Driller: "bg-[#e6c020]",
  Gunner: "bg-[#d44a4a]",
  Engineer: "bg-[#5cba5c]",
  Scout: "bg-[#4a8fd4]",
};

const CLASS_ICONS: Record<string, string> = {
  Driller: "/icons/classes/driller_icon.png",
  Gunner: "/icons/classes/gunner_icon.png",
  Engineer: "/icons/classes/engineer_icon.png",
  Scout: "/icons/classes/scout_icon.png",
};

function getRankBadge(missions: number): { label: string; className: string } {
  if (missions >= 500)
    return {
      label: "VETERAN",
      className: "text-primary border border-primary",
    };
  if (missions >= 200)
    return {
      label: "EXPERIENCED",
      className: "text-tertiary border border-tertiary",
    };
  if (missions >= 50)
    return {
      label: "ROOKIE",
      className: "text-on-surface-variant border border-outline-variant",
    };
  return { label: "GREENBEARD", className: "text-error border border-error" };
}

export default function ClassCard({ classData }: Props) {
  const hours = Math.floor(classData.time_played_s / 3600);
  const distanceKm = (classData.distance_cm / 100000).toFixed(1);
  const rank = getRankBadge(classData.missions_completed);

  const stats = [
    { label: "MISSIONS", value: classData.missions_completed.toLocaleString() },
    { label: "KILLS", value: classData.kills.toLocaleString() },
    { label: "HOURS", value: `${hours}h` },
    { label: "DISTANCE", value: `${distanceKm} km` },
  ];

  return (
    <div className="industrial-panel pressed-metal overflow-hidden">
      {/* Bande colorée en haut */}
      <div
        className={`h-1.5 w-full ${CLASS_TOP_COLORS[classData.name] ?? "bg-primary"}`}
      />

      <div className="p-4">
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
            {rank.label}
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
  );
}
