import { ClassSummary } from "@/lib/types";

interface Props {
  classData: ClassSummary;
}

export default function ClassCard({ classData }: Props) {
  const hours = Math.floor(classData.time_played_s / 3600);
  const minutes = Math.floor((classData.time_played_s % 3600) / 60);
  const distanceKm = (classData.distance_cm / 100000).toFixed(1);

  return (
    <div
      className="p-4 rounded border"
      style={{ borderColor: classData.color }}
    >
      <h2
        className="text-xl font-bold uppercase"
        style={{ color: classData.color }}
      >
        {classData.name}
      </h2>
      <p>Missions : {classData.missions_completed}</p>
      <p>Kills : {classData.kills.toLocaleString()}</p>
      <p>
        Temps : {hours}h {minutes}m
      </p>
      <p>Distance : {distanceKm} km</p>
      <p>Downs : {classData.downs}</p>
    </div>
  );
}
