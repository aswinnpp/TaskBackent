"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingSignup = void 0;
class PendingSignup {
    constructor(id, email, phone, hashedPassword, encryptedPassword, expiresAt, attemptCount, resendCount, otpSentAt, createdAt, updatedAt) {
        this.id = id;
        this.email = email;
        this.phone = phone;
        this.hashedPassword = hashedPassword;
        this.encryptedPassword = encryptedPassword;
        this.expiresAt = expiresAt;
        this.attemptCount = attemptCount;
        this.resendCount = resendCount;
        this.otpSentAt = otpSentAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    isExpired() {
        return this.expiresAt.getTime() <= Date.now();
    }
}
exports.PendingSignup = PendingSignup;
