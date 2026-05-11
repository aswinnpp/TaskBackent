"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
if (!env_1.env.supabaseUrl || !env_1.env.supabaseAnonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
}
exports.supabaseClient = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseAnonKey);
