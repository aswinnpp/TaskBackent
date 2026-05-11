"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdminClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
if (!env_1.env.supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
}
exports.supabaseAdminClient = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey);
