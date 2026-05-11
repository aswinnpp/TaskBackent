import { injectable } from "inversify";
import { IPendingSignupRepository } from "../../domain/repositories/IPendingSignupRepository";
import { PendingSignup } from "../../domain/entities/PendingSignup";
import { supabaseAdminClient } from "../database/supabaseAdminClient";

type PendingSignupRow = {
  id: string;
  email: string;
  phone: string;
  hashed_password: string;
  encrypted_password: string;
  expires_at: string;
  attempt_count: number;
  resend_count: number;
  otp_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

@injectable()
export class SupabasePendingSignupRepository implements IPendingSignupRepository {
  private readonly table = "pending_signups";

  async upsert(signup: PendingSignup): Promise<PendingSignup> {
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

    const { data, error } = await supabaseAdminClient
      .from(this.table)
      .upsert(payload, { onConflict: "phone" })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to save pending signup");
    }

    return this.toEntity(data as PendingSignupRow);
  }

  async findActiveByPhone(phone: string): Promise<PendingSignup | null> {
    const { data, error } = await supabaseAdminClient
      .from(this.table)
      .select("*")
      .eq("phone", phone)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.toEntity(data as PendingSignupRow);
  }

  async findActiveByEmail(email: string): Promise<PendingSignup | null> {
    const { data, error } = await supabaseAdminClient
      .from(this.table)
      .select("*")
      .eq("email", email)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.toEntity(data as PendingSignupRow);
  }

  async incrementAttemptCount(id: string): Promise<void> {
    const { data: current, error: fetchError } = await supabaseAdminClient
      .from(this.table)
      .select("attempt_count")
      .eq("id", id)
      .single();
    if (fetchError) throw new Error(fetchError.message);

    const { error } = await supabaseAdminClient
      .from(this.table)
      .update({
        attempt_count: (current?.attempt_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async incrementResendCount(id: string, otpSentAt: Date): Promise<void> {
    const { data: current, error: fetchError } = await supabaseAdminClient
      .from(this.table)
      .select("resend_count")
      .eq("id", id)
      .single();
    if (fetchError) throw new Error(fetchError.message);

    const { error } = await supabaseAdminClient
      .from(this.table)
      .update({
        resend_count: (current?.resend_count || 0) + 1,
        otp_sent_at: otpSentAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await supabaseAdminClient.from(this.table).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  private toEntity(row: PendingSignupRow): PendingSignup {
    return new PendingSignup(
      row.id,
      row.email,
      row.phone,
      row.hashed_password,
      row.encrypted_password,
      new Date(row.expires_at),
      row.attempt_count,
      row.resend_count,
      row.otp_sent_at ? new Date(row.otp_sent_at) : null,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
