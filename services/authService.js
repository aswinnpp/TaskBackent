/**
 * Beginner-friendly auth helpers for:
 * Signup → send phone OTP → verify OTP → create user (only after OTP succeeds).
 *
 * This file is plain JavaScript and does NOT import any frontend code.
 *
 * Required env (backend/.env):
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 * - PENDING_SIGNUP_SECRET
 */

const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

// Load backend/.env (so this file works even when imported directly)
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const PENDING_TABLE = "pending_signups";
const TTL_MS = 10 * 60 * 1000; // 10 minutes
const BCRYPT_ROUNDS = 12;

function getEnv(name) {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : "";
}

function supabaseAnon() {
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_ANON_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return createClient(url, key);
}

function supabaseAdmin() {
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Same key derivation used by backend/src/infrastructure/services/AesSecretCipher.ts
function getAesKey() {
  const secret = getEnv("PENDING_SIGNUP_SECRET");
  if (!secret) throw new Error("Missing PENDING_SIGNUP_SECRET");
  return crypto.createHash("sha256").update(secret).digest();
}

// Returns: ivHex:authTagHex:cipherHex
function encryptPassword(plain) {
  const key = getAesKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptPassword(stored) {
  const key = getAesKey();
  const [ivHex, authTagHex, encryptedHex] = String(stored || "").split(":");
  if (!ivHex || !authTagHex || !encryptedHex) throw new Error("Invalid encrypted password format");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

function validateEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) return { ok: false, message: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return { ok: false, message: "Invalid email." };
  return { ok: true, value: e };
}

function validatePhone(phone) {
  const p = String(phone || "").trim();
  if (!p) return { ok: false, message: "Phone is required." };
  if (!/^\+[1-9]\d{7,14}$/.test(p)) {
    return { ok: false, message: "Use E.164 phone format, e.g. +14155552671" };
  }
  return { ok: true, value: p };
}

function validatePassword(password) {
  const pw = String(password || "");
  if (!pw) return { ok: false, message: "Password is required." };
  if (pw.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
    return { ok: false, message: "Password must include letters and numbers." };
  }
  return { ok: true, value: pw };
}

async function emailExists(admin, email) {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return { ok: false, message: error.message };
  const exists = (data.users || []).some((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  return { ok: true, exists };
}

async function phoneExists(admin, phoneE164) {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return { ok: false, message: error.message };
  const digits = (s) => String(s || "").replace(/\D/g, "");
  const target = digits(phoneE164);
  const exists = (data.users || []).some((u) => digits(u.phone) === target && target.length > 0);
  return { ok: true, exists };
}

/**
 * SIGNUP STEP:
 * - Validate inputs
 * - Save pending signup row
 * - Send phone OTP using Supabase
 * - DOES NOT create user yet
 */
async function startSignupWithPhoneOtp({ email, phone, password }) {
  const e = validateEmail(email);
  const ph = validatePhone(phone);
  const pw = validatePassword(password);
  if (!e.ok) return { ok: false, message: e.message };
  if (!ph.ok) return { ok: false, message: ph.message };
  if (!pw.ok) return { ok: false, message: pw.message };

  const admin = supabaseAdmin();
  const anon = supabaseAnon();

  const exEmail = await emailExists(admin, e.value);
  if (!exEmail.ok) return { ok: false, message: exEmail.message };
  if (exEmail.exists) return { ok: false, message: "Email already exists." };

  const exPhone = await phoneExists(admin, ph.value);
  if (!exPhone.ok) return { ok: false, message: exPhone.message };
  if (exPhone.exists) return { ok: false, message: "Phone number already exists." };

  const hashedPassword = await bcrypt.hash(pw.value, BCRYPT_ROUNDS);
  const encryptedPassword = encryptPassword(pw.value);
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
  const now = new Date().toISOString();

  const row = {
    email: e.value,
    phone: ph.value,
    hashed_password: hashedPassword,
    encrypted_password: encryptedPassword,
    expires_at: expiresAt,
    attempt_count: 0,
    resend_count: 0,
    otp_sent_at: now,
    updated_at: now,
  };

  const { error: saveErr } = await admin.from(PENDING_TABLE).upsert(row, { onConflict: "phone" });
  if (saveErr) return { ok: false, message: saveErr.message || "Could not save signup." };

  const { error: otpErr } = await anon.auth.signInWithOtp({ phone: ph.value });
  if (otpErr) return { ok: false, message: otpErr.message || "Could not send OTP." };

  return { ok: true, message: "OTP sent to your phone.", phone: ph.value };
}

/**
 * VERIFY OTP STEP:
 * - Verify SMS OTP using Supabase
 * - ONLY after success, create user using email+password
 * - Delete pending row
 * - Returns success message (frontend should redirect to Login)
 */
async function verifyOtpAndCreateUser({ phone, otp }) {
  const ph = validatePhone(phone);
  const code = String(otp || "").trim();
  if (!ph.ok) return { ok: false, message: ph.message };
  if (!/^\d{6}$/.test(code)) return { ok: false, message: "Enter the 6-digit code." };

  const admin = supabaseAdmin();
  const anon = supabaseAnon();

  const { data: pending, error: pErr } = await admin
    .from(PENDING_TABLE)
    .select("*")
    .eq("phone", ph.value)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (pErr) return { ok: false, message: pErr.message };
  if (!pending) return { ok: false, message: "No pending signup for this phone. Sign up again." };

  const { error: verifyErr } = await anon.auth.verifyOtp({
    phone: ph.value,
    token: code,
    type: "sms",
  });

  if (verifyErr) {
    await admin
      .from(PENDING_TABLE)
      .update({
        attempt_count: (pending.attempt_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pending.id);
    return { ok: false, message: verifyErr.message || "Invalid OTP." };
  }

  const plainPassword = decryptPassword(pending.encrypted_password);

  // IMPORTANT: This is where the user is finally created (after OTP success)
  const { data: signUpData, error: signUpErr } = await anon.auth.signUp({
    email: pending.email,
    password: plainPassword,
    options: {
      data: {
        phone: ph.value,
        phone_verified: true,
        role: "user",
      },
    },
  });

  if (signUpErr) return { ok: false, message: signUpErr.message || "Could not create account." };

  await admin.from(PENDING_TABLE).delete().eq("id", pending.id);

  return {
    ok: true,
    message: "OTP verified. Account created. Please log in.",
    user: signUpData.user || null,
  };
}

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  startSignupWithPhoneOtp,
  verifyOtpAndCreateUser,
};

