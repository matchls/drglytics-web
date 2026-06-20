"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export type ProgressDelta = {
  missions: number;
  kills: number;
  time_s: number;
  driller_missions: number;
  gunner_missions: number;
  engineer_missions: number;
  scout_missions: number;
  forged_overclocks: number;
  // Date ISO du snapshot précédent — utilisée pour afficher "depuis le JJ/MM/AAAA"
  previous_date: string;
};

// Retourne le delta entre les deux derniers snapshots de l'utilisateur connecté.
// Retourne null si l'utilisateur n'est pas connecté ou s'il a moins de 2 snapshots.
export async function getProgressDelta(): Promise<ProgressDelta | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabaseAdmin
    .from("player_snapshots")
    .select(
      "total_missions, total_kills, total_time_s, driller_missions, gunner_missions, engineer_missions, scout_missions, forged_overclocks, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(2);

  if (!data || data.length < 2) return null;

  const [current, previous] = data;
  return {
    missions: current.total_missions - previous.total_missions,
    kills: current.total_kills - previous.total_kills,
    time_s: current.total_time_s - previous.total_time_s,
    driller_missions: current.driller_missions - previous.driller_missions,
    gunner_missions: current.gunner_missions - previous.gunner_missions,
    engineer_missions: current.engineer_missions - previous.engineer_missions,
    scout_missions: current.scout_missions - previous.scout_missions,
    forged_overclocks: current.forged_overclocks - previous.forged_overclocks,
    previous_date: previous.created_at,
  };
}
