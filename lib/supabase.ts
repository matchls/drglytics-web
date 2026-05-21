// supabase.ts — Client Supabase partagé
//
// Analogie : c'est le téléphone dédié à la base de données.
// On le crée une seule fois et on l'importe partout où on en a besoin.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
