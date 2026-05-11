"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseAuthRepository = void 0;
const inversify_1 = require("inversify");
const OtpChannel_1 = require("../../domain/enums/OtpChannel");
const supabaseClient_1 = require("../database/supabaseClient");
const supabaseAdminClient_1 = require("../database/supabaseAdminClient");
const authDebug_1 = require("../../shared/logging/authDebug");
const libphonenumber_js_1 = require("libphonenumber-js");
const env_1 = require("../config/env");
let SupabaseAuthRepository = class SupabaseAuthRepository {
    async emailExists(email) {
        const { data, error } = await supabaseAdminClient_1.supabaseAdminClient.auth.admin.listUsers();
        if (error)
            return { error: error.message };
        const exists = (data.users || []).some((user) => user.email?.toLowerCase() === email.toLowerCase());
        return { data: exists };
    }
    async phoneExists(phone) {
        const { data, error } = await supabaseAdminClient_1.supabaseAdminClient.auth.admin.listUsers();
        if (error)
            return { error: error.message };
        const normalizedInput = this.toE164(phone);
        if (!normalizedInput)
            return { data: false };
        const exists = (data.users || []).some((user) => {
            const normalizedUserPhone = this.toE164(user.phone || "");
            if (!normalizedUserPhone)
                return false;
            return normalizedUserPhone === normalizedInput;
        });
        return { data: exists };
    }
    async signInWithPassword(email, password) {
        const { data, error } = await supabaseClient_1.supabaseClient.auth.signInWithPassword({ email, password });
        if (error)
            return { error: error.message };
        return {
            data: {
                user: data.user,
                accessToken: data.session?.access_token || null,
                refreshToken: data.session?.refresh_token || null,
            },
        };
    }
    async refreshSession(refreshToken) {
        const { data, error } = await supabaseClient_1.supabaseClient.auth.refreshSession({ refresh_token: refreshToken });
        if (error)
            return { error: error.message };
        return {
            data: {
                user: data.user,
                accessToken: data.session?.access_token || null,
                refreshToken: data.session?.refresh_token || null,
            },
        };
    }
    async sendPasswordResetEmail(email, redirectUrl) {
        const { error } = await supabaseClient_1.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });
        if (error)
            return { error: error.message };
        return {};
    }
    async setSession(accessToken, refreshToken) {
        const { error } = await supabaseClient_1.supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
        if (error)
            return { error: error.message };
        return {};
    }
    async updatePassword(newPassword) {
        const { error } = await supabaseClient_1.supabaseClient.auth.updateUser({ password: newPassword });
        if (error)
            return { error: error.message };
        return {};
    }
    async getCurrentUser() {
        const { data, error } = await supabaseClient_1.supabaseClient.auth.getUser();
        if (error)
            return { error: error.message };
        return { data: data.user };
    }
    async signOut() {
        const { error } = await supabaseClient_1.supabaseClient.auth.signOut();
        if (error)
            return { error: error.message };
        return {};
    }
    async getUserByAccessToken(accessToken) {
        const { data, error } = await supabaseClient_1.supabaseClient.auth.getUser(accessToken);
        if (error)
            return { error: error.message };
        return { data: data.user };
    }
    async sendOtp(input) {
        if (input.email) {
            (0, authDebug_1.authLog)("SEND OTP EMAIL START", "INFO", {
                email: (0, authDebug_1.maskEmail)(input.email),
                channel: "email",
                at: new Date().toISOString(),
            });
            const { data, error } = await supabaseClient_1.supabaseClient.auth.signInWithOtp({ email: input.email });
            (0, authDebug_1.authLog)("SUPABASE EMAIL OTP RESPONSE", error ? "WARN" : "INFO", {
                email: (0, authDebug_1.maskEmail)(input.email),
                ...(0, authDebug_1.summarizeSupabaseResult)(data, error),
            });
            if (error)
                return { error: error.message };
            return {};
        }
        if (input.phone) {
            const e164 = (0, authDebug_1.isLikelyE164)(input.phone);
            (0, authDebug_1.authLog)("SEND OTP PHONE START", e164 ? "INFO" : "WARN", {
                phone: (0, authDebug_1.maskPhone)(input.phone),
                channel: "sms",
                e164Format: e164,
                at: new Date().toISOString(),
            });
            const { data, error } = await supabaseClient_1.supabaseClient.auth.signInWithOtp({ phone: input.phone });
            (0, authDebug_1.authLog)("SUPABASE PHONE OTP RESPONSE", error ? "WARN" : "INFO", {
                phone: (0, authDebug_1.maskPhone)(input.phone),
                ...(0, authDebug_1.summarizeSupabaseResult)(data, error),
            });
            if (error)
                return { error: error.message };
            return {};
        }
        return { error: "Either email or phone is required" };
    }
    async verifyOtp(input) {
        if (input.channel === OtpChannel_1.OtpChannel.Email) {
            if (!input.email)
                return { error: "Email is required" };
            (0, authDebug_1.authLog)("VERIFY OTP START", "INFO", {
                channel: "email",
                email: (0, authDebug_1.maskEmail)(input.email),
                otpLength: (0, authDebug_1.otpLengthOnly)(input.code),
                at: new Date().toISOString(),
            });
            const { data, error } = await supabaseClient_1.supabaseClient.auth.verifyOtp({
                email: input.email,
                token: input.code,
                type: "email",
            });
            (0, authDebug_1.authLog)("VERIFY OTP RESPONSE", error ? "WARN" : "INFO", {
                channel: "email",
                email: (0, authDebug_1.maskEmail)(input.email),
                success: !error,
                userId: data?.user?.id || null,
                ...(0, authDebug_1.summarizeSupabaseResult)(data, error),
            });
            if (error)
                return { error: error.message };
            return { data: { user: data.user || null } };
        }
        if (!input.phone)
            return { error: "Phone is required" };
        (0, authDebug_1.authLog)("VERIFY OTP START", "INFO", {
            channel: "sms",
            phone: (0, authDebug_1.maskPhone)(input.phone),
            otpLength: (0, authDebug_1.otpLengthOnly)(input.code),
            at: new Date().toISOString(),
        });
        const { data, error } = await supabaseClient_1.supabaseClient.auth.verifyOtp({
            phone: input.phone,
            token: input.code,
            type: "sms",
        });
        (0, authDebug_1.authLog)("VERIFY OTP RESPONSE", error ? "WARN" : "INFO", {
            channel: "sms",
            phone: (0, authDebug_1.maskPhone)(input.phone),
            success: !error,
            userId: data?.user?.id || null,
            ...(0, authDebug_1.summarizeSupabaseResult)(data, error),
        });
        if (error)
            return { error: error.message };
        return { data: { user: data.user || null } };
    }
    toE164(phone) {
        const raw = String(phone || "");
        const sanitized = raw
            .normalize("NFKC")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .replace(/\(IN\)/gi, "")
            .replace(/[^\d+]/g, "");
        const parsed = sanitized.startsWith("+")
            ? (0, libphonenumber_js_1.parsePhoneNumberFromString)(sanitized)
            : (0, libphonenumber_js_1.parsePhoneNumberFromString)(sanitized, env_1.env.defaultPhoneCountry.toUpperCase());
        if (!parsed || !parsed.isValid())
            return null;
        return parsed.number;
    }
    async resendSignupVerification(email, redirectUrl) {
        const options = redirectUrl ? { emailRedirectTo: redirectUrl } : {};
        const { error } = await supabaseClient_1.supabaseClient.auth.resend({
            type: "signup",
            email,
            options,
        });
        if (error)
            return { error: error.message };
        return {};
    }
    async activateUserAfterPhoneOtp(input) {
        const { data, error } = await supabaseAdminClient_1.supabaseAdminClient.auth.admin.updateUserById(input.existingAuthUserId, {
            email: input.email,
            password: input.password,
            email_confirm: true,
            phone_confirm: true,
            user_metadata: input.metadata,
        });
        if (error)
            return { error: error.message };
        return { data: { user: data.user ?? null } };
    }
};
exports.SupabaseAuthRepository = SupabaseAuthRepository;
exports.SupabaseAuthRepository = SupabaseAuthRepository = __decorate([
    (0, inversify_1.injectable)()
], SupabaseAuthRepository);
