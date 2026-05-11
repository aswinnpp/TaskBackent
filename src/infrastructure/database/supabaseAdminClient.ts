import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

if (!env.supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
}

export const supabaseAdminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
