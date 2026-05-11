import { injectable } from "inversify";
import { AppError } from "./AppError";

/** True if this Supabase user completed phone OTP signup (phone confirmed or metadata flag). */
export function isPhoneVerifiedAuthUser(user: unknown): boolean {
  if (!user || typeof user !== "object") return false;
  const u = user as Record<string, unknown>;
  if (typeof u.phone_confirmed_at === "string" && u.phone_confirmed_at.length > 0) return true;
  const meta = u.user_metadata;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const m = meta as Record<string, unknown>;
    if (m.phone_verified === true) return true;
  }
  return false;
}

@injectable()
export class AuthPolicy {
  readonly pendingSignupTtlMs = 10 * 60 * 1000;
  readonly maxOtpAttempts = 5;
  readonly maxOtpResends = 5;
  readonly otpResendCooldownMs = 30 * 1000;

  ensureResendAllowed(lastOtpSentAt: Date | null, resendCount: number): void {
    if (resendCount >= this.maxOtpResends) {
      throw new AppError("Resend limit exceeded. Please sign up again.", 429);
    }
    if (!lastOtpSentAt) return;
    const elapsed = Date.now() - lastOtpSentAt.getTime();
    if (elapsed < this.otpResendCooldownMs) {
      const waitSeconds = Math.ceil((this.otpResendCooldownMs - elapsed) / 1000);
      throw new AppError(`Please wait ${waitSeconds}s before requesting a new OTP.`, 429);
    }
  }

  ensureAttemptAllowed(attemptCount: number): void {
    if (attemptCount >= this.maxOtpAttempts) {
      throw new AppError("Too many OTP attempts. Please sign up again.", 429);
    }
  }

  /** Login and token refresh require a phone-verified account (no email verification step). */
  ensurePhoneVerifiedAuthUser(user: unknown): void {
    if (!isPhoneVerifiedAuthUser(user)) {
      throw new AppError(
        "Log in is only allowed after phone verification. Complete OTP signup for this account first.",
        403
      );
    }
  }
}
