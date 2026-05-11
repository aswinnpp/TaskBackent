"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabasePendingSignupRepository = void 0;
const inversify_1 = require("inversify");
const PendingSignup_1 = require("../../domain/entities/PendingSignup");
const supabaseAdminClient_1 = require("../database/supabaseAdminClient");
let SupabasePendingSignupRepository = class SupabasePendingSignupRepository {
    constructor() {
        this.table = "pending_signups";
    }
    async upsert(signup) {
        const payload = {
            email: signup.email,
            phone: signup.phone,
            hashed_password: signup.hashedPassword,
            encrypted_password: signup.encryptedPassword,
            expires_at: signup.expiresAt.toISOString(),
            attempt_count: signup.attemptCount,
            resend_count: signup.resendCount,
            otp_sent_at: signup.otpSentAt?.toISOString() ?? null,
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabaseAdminClient_1.supabaseAdminClient
            .from(this.table)
            .upsert(payload, { onConflict: "phone" })
            .select("*")
            .single();
        if (error || !data) {
            throw new Error(error?.message || "Failed to save pending signup");
        }
        return this.toEntity(data);
    }
    async findActiveByPhone(phone) {
        const { data, error } = await supabaseAdminClient_1.supabaseAdminClient
            .from(this.table)
            .select("*")
            .eq("phone", phone)
            .gt("expires_at", new Date().toISOString())
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        if (!data)
            return null;
        return this.toEntity(data);
    }
    async findActiveByEmail(email) {
        const { data, error } = await supabaseAdminClient_1.supabaseAdminClient
            .from(this.table)
            .select("*")
            .eq("email", email)
            .gt("expires_at", new Date().toISOString())
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        if (!data)
            return null;
        return this.toEntity(data);
    }
    async incrementAttemptCount(id) {
        const { data: current, error: fetchError } = await supabaseAdminClient_1.supabaseAdminClient
            .from(this.table)
            .select("attempt_count")
            .eq("id", id)
            .single();
        if (fetchError)
            throw new Error(fetchError.message);
        const { error } = await supabaseAdminClient_1.supabaseAdminClient
            .from(this.table)
            .update({
            attempt_count: (current?.attempt_count || 0) + 1,
            updated_at: new Date().toISOString(),
        })
            .eq("id", id);
        if (error)
            throw new Error(error.message);
    }
    async incrementResendCount(id, otpSentAt) {
        const { data: current, error: fetchError } = await supabaseAdminClient_1.supabaseAdminClient
            .from(this.table)
            .select("resend_count")
            .eq("id", id)
            .single();
        if (fetchError)
            throw new Error(fetchError.message);
        const { error } = await supabaseAdminClient_1.supabaseAdminClient
            .from(this.table)
            .update({
            resend_count: (current?.resend_count || 0) + 1,
            otp_sent_at: otpSentAt.toISOString(),
            updated_at: new Date().toISOString(),
        })
            .eq("id", id);
        if (error)
            throw new Error(error.message);
    }
    async deleteById(id) {
        const { error } = await supabaseAdminClient_1.supabaseAdminClient.from(this.table).delete().eq("id", id);
        if (error)
            throw new Error(error.message);
    }
    toEntity(row) {
        return new PendingSignup_1.PendingSignup(row.id, row.email, row.phone, row.hashed_password, row.encrypted_password, new Date(row.expires_at), row.attempt_count, row.resend_count, row.otp_sent_at ? new Date(row.otp_sent_at) : null, new Date(row.created_at), new Date(row.updated_at));
    }
};
exports.SupabasePendingSignupRepository = SupabasePendingSignupRepository;
exports.SupabasePendingSignupRepository = SupabasePendingSignupRepository = __decorate([
    (0, inversify_1.injectable)()
], SupabasePendingSignupRepository);
