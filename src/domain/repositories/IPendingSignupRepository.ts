import { PendingSignup } from "../entities/PendingSignup";

export interface IPendingSignupRepository {
  upsert(signup: PendingSignup): Promise<PendingSignup>;
  findActiveByPhone(phone: string): Promise<PendingSignup | null>;
  findActiveByEmail(email: string): Promise<PendingSignup | null>;
  incrementAttemptCount(id: string): Promise<void>;
  incrementResendCount(id: string, otpSentAt: Date): Promise<void>;
  deleteById(id: string): Promise<void>;
}

