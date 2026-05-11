import { injectable } from "inversify";
import {
  IAuthRepository,
  LoginResult,
  RepositoryResult,
} from "../../domain/repositories/IAuthRepository";
import { OtpChannel } from "../../domain/enums/OtpChannel";
import { supabaseClient } from "../database/supabaseClient";
import { supabaseAdminClient } from "../database/supabaseAdminClient";
import {
  authLog,
  isLikelyE164,
  maskEmail,
  maskPhone,
  otpLengthOnly,
  summarizeSupabaseResult,
} from "../../shared/logging/authDebug";
import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { env } from "../config/env";

@injectable()
export class SupabaseAuthRepository implements IAuthRepository {
  async emailExists(email: string): Promise<RepositoryResult<boolean>> {
    const { data, error } = await supabaseAdminClient.auth.admin.listUsers();
    if (error) return { error: error.message };
    const exists = (data.users || []).some((user) => user.email?.toLowerCase() === email.toLowerCase());
    return { data: exists };
  }

  async phoneExists(phone: string): Promise<RepositoryResult<boolean>> {
    const { data, error } = await supabaseAdminClient.auth.admin.listUsers();
    if (error) return { error: error.message };
    const normalizedInput = this.toE164(phone);
    if (!normalizedInput) return { data: false };
    const exists = (data.users || []).some((user) => {
      const normalizedUserPhone = this.toE164(user.phone || "");
      if (!normalizedUserPhone) return false;
      return normalizedUserPhone === normalizedInput;
    });
    return { data: exists };
  }

  async signInWithPassword(email: string, password: string): Promise<RepositoryResult<LoginResult>> {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {
      data: {
        user: data.user,
        accessToken: data.session?.access_token || null,
        refreshToken: data.session?.refresh_token || null,
      },
    };
  }

  async refreshSession(refreshToken: string): Promise<RepositoryResult<LoginResult>> {
    const { data, error } = await supabaseClient.auth.refreshSession({ refresh_token: refreshToken });
    if (error) return { error: error.message };
    return {
      data: {
        user: data.user,
        accessToken: data.session?.access_token || null,
        refreshToken: data.session?.refresh_token || null,
      },
    };
  }

  async sendPasswordResetEmail(email: string, redirectUrl?: string): Promise<RepositoryResult<void>> {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) return { error: error.message };
    return {};
  }

  async setSession(accessToken: string, refreshToken: string): Promise<RepositoryResult<void>> {
    const { error } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) return { error: error.message };
    return {};
  }

  async updatePassword(newPassword: string): Promise<RepositoryResult<void>> {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return {};
  }

  async getCurrentUser(): Promise<RepositoryResult<unknown>> {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) return { error: error.message };
    return { data: data.user };
  }

  async signOut(): Promise<RepositoryResult<void>> {
    const { error } = await supabaseClient.auth.signOut();
    if (error) return { error: error.message };
    return {};
  }

  async getUserByAccessToken(accessToken: string): Promise<RepositoryResult<unknown>> {
    const { data, error } = await supabaseClient.auth.getUser(accessToken);
    if (error) return { error: error.message };
    return { data: data.user };
  }

  async sendOtp(input: { email?: string; phone?: string }): Promise<RepositoryResult<void>> {
    if (input.email) {
      authLog("SEND OTP EMAIL START", "INFO", {
        email: maskEmail(input.email),
        channel: "email",
        at: new Date().toISOString(),
      });
      const { data, error } = await supabaseClient.auth.signInWithOtp({ email: input.email });
      authLog("SUPABASE EMAIL OTP RESPONSE", error ? "WARN" : "INFO", {
        email: maskEmail(input.email),
        ...summarizeSupabaseResult(data, error),
      });
      if (error) return { error: error.message };
      return {};
    }
    if (input.phone) {
      const e164 = isLikelyE164(input.phone);
      authLog("SEND OTP PHONE START", e164 ? "INFO" : "WARN", {
        phone: maskPhone(input.phone),
        channel: "sms",
        e164Format: e164,
        at: new Date().toISOString(),
      });
      const { data, error } = await supabaseClient.auth.signInWithOtp({ phone: input.phone });
      authLog("SUPABASE PHONE OTP RESPONSE", error ? "WARN" : "INFO", {
        phone: maskPhone(input.phone),
        ...summarizeSupabaseResult(data, error),
      });
      if (error) return { error: error.message };
      return {};
    }
    return { error: "Either email or phone is required" };
  }

  async verifyOtp(input: {
    channel: OtpChannel;
    email?: string;
    phone?: string;
    code: string;
  }): Promise<RepositoryResult<{ user: unknown | null }>> {
    if (input.channel === OtpChannel.Email) {
      if (!input.email) return { error: "Email is required" };
      authLog("VERIFY OTP START", "INFO", {
        channel: "email",
        email: maskEmail(input.email),
        otpLength: otpLengthOnly(input.code),
        at: new Date().toISOString(),
      });
      const { data, error } = await supabaseClient.auth.verifyOtp({
        email: input.email,
        token: input.code,
        type: "email",
      });
      authLog("VERIFY OTP RESPONSE", error ? "WARN" : "INFO", {
        channel: "email",
        email: maskEmail(input.email),
        success: !error,
        userId: data?.user?.id || null,
        ...summarizeSupabaseResult(data, error),
      });
      if (error) return { error: error.message };
      return { data: { user: data.user || null } };
    }

    if (!input.phone) return { error: "Phone is required" };
    authLog("VERIFY OTP START", "INFO", {
      channel: "sms",
      phone: maskPhone(input.phone),
      otpLength: otpLengthOnly(input.code),
      at: new Date().toISOString(),
    });
    const { data, error } = await supabaseClient.auth.verifyOtp({
      phone: input.phone,
      token: input.code,
      type: "sms",
    });
    authLog("VERIFY OTP RESPONSE", error ? "WARN" : "INFO", {
      channel: "sms",
      phone: maskPhone(input.phone),
      success: !error,
      userId: data?.user?.id || null,
      ...summarizeSupabaseResult(data, error),
    });
    if (error) return { error: error.message };
    return { data: { user: data.user || null } };
  }

  private toE164(phone: string): string | null {
    const raw = String(phone || "");
    const sanitized = raw
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\(IN\)/gi, "")
      .replace(/[^\d+]/g, "");
    const parsed = sanitized.startsWith("+")
      ? parsePhoneNumberFromString(sanitized)
      : parsePhoneNumberFromString(
          sanitized,
          env.defaultPhoneCountry.toUpperCase() as CountryCode
        );
    if (!parsed || !parsed.isValid()) return null;
    return parsed.number;
  }

  async resendSignupVerification(email: string, redirectUrl?: string): Promise<RepositoryResult<void>> {
    const options = redirectUrl ? { emailRedirectTo: redirectUrl } : {};
    const { error } = await supabaseClient.auth.resend({
      type: "signup",
      email,
      options,
    });
    if (error) return { error: error.message };
    return {};
  }

  async signUp(input: {
    email: string;
    password: string;
    metadata: Record<string, unknown>;
  }): Promise<RepositoryResult<{ user: unknown | null }>> {
    const { data, error } = await supabaseClient.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: input.metadata },
    });
    if (error) return { error: error.message };
    return { data: { user: data.user || null } };
  }
}

