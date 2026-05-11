import { injectable } from "inversify";
import { AppError } from "./AppError";

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
}
