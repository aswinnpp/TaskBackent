"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPhoneOtpUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const Phone_1 = require("../../domain/valueObjects/Phone");
const OtpCode_1 = require("../../domain/valueObjects/OtpCode");
const OtpChannel_1 = require("../../domain/enums/OtpChannel");
const AppError_1 = require("../services/AppError");
const AuthErrorMapper_1 = require("../services/AuthErrorMapper");
const AuthPolicy_1 = require("../services/AuthPolicy");
const authDebug_1 = require("../../shared/logging/authDebug");
let VerifyPhoneOtpUseCase = class VerifyPhoneOtpUseCase {
    constructor(authRepository, pendingRepository, phoneFormatter, secretCipher, authPolicy, authErrorMapper) {
        this.authRepository = authRepository;
        this.pendingRepository = pendingRepository;
        this.phoneFormatter = phoneFormatter;
        this.secretCipher = secretCipher;
        this.authPolicy = authPolicy;
        this.authErrorMapper = authErrorMapper;
    }
    async execute(input) {
        const phone = this.phoneFormatter.format(new Phone_1.Phone(input.phone).getValue()).e164;
        const otp = new OtpCode_1.OtpCode(input.code ?? input.otp ?? "").getValue();
        (0, authDebug_1.authLog)("VERIFY OTP START", "INFO", {
            channel: "sms",
            phone: (0, authDebug_1.maskPhone)(phone),
            otpLength: (0, authDebug_1.otpLengthOnly)(otp),
            at: new Date().toISOString(),
        });
        const pending = await this.pendingRepository.findActiveByPhone(phone);
        if (!pending || !pending.id) {
            throw new AppError_1.AppError("No pending signup found for this phone. Please sign up again.", 400);
        }
        if (pending.isExpired()) {
            await this.pendingRepository.deleteById(pending.id);
            throw new AppError_1.AppError("OTP expired. Please sign up again.", 400);
        }
        this.authPolicy.ensureAttemptAllowed(pending.attemptCount);
        const verified = await this.authRepository.verifyOtp({
            channel: OtpChannel_1.OtpChannel.Sms,
            phone,
            code: otp,
        });
        if (verified.error) {
            await this.pendingRepository.incrementAttemptCount(pending.id);
            (0, authDebug_1.authLog)("VERIFY OTP RESULT", "WARN", {
                channel: "sms",
                phone: (0, authDebug_1.maskPhone)(phone),
                success: false,
                error: verified.error,
                at: new Date().toISOString(),
            });
            throw new AppError_1.AppError(this.authErrorMapper.map(verified.error), 400);
        }
        const signUp = await this.authRepository.signUp({
            email: pending.email,
            password: this.secretCipher.decrypt(pending.encryptedPassword),
            metadata: {
                phone: pending.phone,
                phone_verified: true,
                role: "user",
            },
        });
        if (signUp.error)
            throw new AppError_1.AppError(this.authErrorMapper.map(signUp.error), 400);
        await this.pendingRepository.deleteById(pending.id);
        (0, authDebug_1.authLog)("VERIFY OTP RESULT", "INFO", {
            channel: "sms",
            phone: (0, authDebug_1.maskPhone)(phone),
            success: true,
            userCreated: true,
            at: new Date().toISOString(),
        });
        return {
            message: "Phone OTP verified. Registration completed.",
            user: signUp.data?.user ?? verified.data?.user ?? null,
        };
    }
};
exports.VerifyPhoneOtpUseCase = VerifyPhoneOtpUseCase;
exports.VerifyPhoneOtpUseCase = VerifyPhoneOtpUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.AuthRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.PendingSignupRepository)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.PhoneFormatter)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.SecretCipher)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.AuthPolicy)),
    __param(5, (0, inversify_1.inject)(types_1.TYPES.AuthErrorMapper)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, AuthPolicy_1.AuthPolicy,
        AuthErrorMapper_1.AuthErrorMapper])
], VerifyPhoneOtpUseCase);
