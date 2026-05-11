export class PendingSignup {
  constructor(
    public readonly id: string | null,
    public readonly email: string,
    public readonly phone: string,
    public readonly hashedPassword: string,
    public readonly encryptedPassword: string,
    public readonly expiresAt: Date,
    public readonly attemptCount: number,
    public readonly resendCount: number,
    public readonly otpSentAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  isExpired(): boolean {
    return this.expiresAt.getTime() <= Date.now();
  }
}

