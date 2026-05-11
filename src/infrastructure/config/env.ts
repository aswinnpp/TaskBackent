import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  pendingSecretKey: process.env.PENDING_SIGNUP_SECRET || "",
  defaultPhoneCountry: process.env.DEFAULT_PHONE_COUNTRY || "IN",
  mobileDeepLinkBase: process.env.MOBILE_DEEPLINK_BASE || "tasktuto://",
  /** Default redirect for reset-password email (mobile deep link). Override with PASSWORD_RESET_REDIRECT_TO. */
  passwordResetRedirectTo:
    process.env.PASSWORD_RESET_REDIRECT_TO || "supabaseauth://reset-password",
};

