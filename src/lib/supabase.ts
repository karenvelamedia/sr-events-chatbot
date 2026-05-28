import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase: SupabaseClient | null =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : (console.warn(
        "Supabase: SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY mangler — Supabase-logging deaktivert.",
      ),
      null);
