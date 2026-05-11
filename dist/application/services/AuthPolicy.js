"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthPolicy = void 0;
exports.isPhoneVerifiedAuthUser = isPhoneVerifiedAuthUser;
const inversify_1 = require("inversify");
const AppError_1 = require("./AppError");
/** True if this Supabase user completed phone OTP signup (phone confirmed or metadata flag). */
function isPhoneVerifiedAuthUser(user) {
    if (!user || typeof user !== "object")
        return false;
    const u = user;
    if (typeof u.phone_confirmed_at === "string" && u.phone_confirmed_at.length > 0)
        return true;
    const meta = u.user_metadata;
    if (meta && typeof meta === "object" && !Array.isArray(meta)) {
        const m = meta;
        if (m.phone_verified === true)
            return true;
    }
    return false;
}
let AuthPolicy = class AuthPolicy {
    constructor() {
        this.pendingSignupTtlMs = 10 * 60 * 1000;
        this.maxOtpAttempts = 5;
        this.maxOtpResends = 5;
        this.otpResendCooldownMs = 30 * 1000;
    }
    ensureResendAllowed(lastOtpSentAt, resendCount) {
        if (resendCount >= this.maxOtpResends) {
            throw new AppError_1.AppError("Resend limit exceeded. Please sign up again.", 429);
        }
        if (!lastOtpSentAt)
            return;
        const elapsed = Date.now() - lastOtpSentAt.getTime();
        if (elapsed < this.otpResendCooldownMs) {
            const waitSeconds = Math.ceil((this.otpResendCooldownMs - elapsed) / 1000);
            throw new AppError_1.AppError(`Please wait ${waitSeconds}s before requesting a new OTP.`, 429);
        }
    }
    ensureAttemptAllowed(attemptCount) {
        if (attemptCount >= this.maxOtpAttempts) {
            throw new AppError_1.AppError("Too many OTP attempts. Please sign up again.", 429);
        }
    }
    /** Login and token refresh require a phone-verified account (no email verification step). */
    ensurePhoneVerifiedAuthUser(user) {
        if (!isPhoneVerifiedAuthUser(user)) {
            throw new AppError_1.AppError("Log in is only allowed after phone verification. Complete OTP signup for this account first.", 403);
        }
    }
};
exports.AuthPolicy = AuthPolicy;
exports.AuthPolicy = AuthPolicy = __decorate([
    (0, inversify_1.injectable)()
], AuthPolicy);
