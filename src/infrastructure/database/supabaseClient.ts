import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
}

export const supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey);

