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
exports.SendPhoneOtpUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const Phone_1 = require("../../domain/valueObjects/Phone");
const AppError_1 = require("../services/AppError");
const AuthErrorMapper_1 = require("../services/AuthErrorMapper");
const AuthPolicy_1 = require("../services/AuthPolicy");
const authDebug_1 = require("../../shared/logging/authDebug");
let SendPhoneOtpUseCase = class SendPhoneOtpUseCase {
    constructor(authRepository, pendingRepository, phoneFormatter, authPolicy, authErrorMapper) {
        this.authRepository = authRepository;
        this.pendingRepository = pendingRepository;
        this.phoneFormatter = phoneFormatter;
        this.authPolicy = authPolicy;
        this.authErrorMapper = authErrorMapper;
    }
    async execute(phoneInput) {
        const phone = this.phoneFormatter.format(new Phone_1.Phone(phoneInput).getValue()).e164;
        (0, authDebug_1.authLog)("RESEND OTP START", (0, authDebug_1.isLikelyE164)(phone) ? "INFO" : "WARN", {
            channel: "sms",
            phone: (0, authDebug_1.maskPhone)(phone),
            phoneE164Format: (0, authDebug_1.isLikelyE164)(phone),
            at: new Date().toISOString(),
        });
        const pending = await this.pendingRepository.findActiveByPhone(phone);
        if (!pending || !pending.id) {
            throw new AppError_1.AppError("No pending signup found for this phone. Please sign up again.", 404);
        }
        if (pending.isExpired()) {
            await this.pendingRepository.deleteById(pending.id);
            throw new AppError_1.AppError("OTP expired. Please sign up again.", 400);
        }
        this.authPolicy.ensureResendAllowed(pending.otpSentAt, pending.resendCount);
        const result = await this.authRepository.sendOtp({ phone });
        if (result.error)
            throw new AppError_1.AppError(this.authErrorMapper.map(result.error), 400);
        await this.pendingRepository.incrementResendCount(pending.id, new Date());
        (0, authDebug_1.authLog)("RESEND OTP RESULT", "INFO", {
            channel: "sms",
            phone: (0, authDebug_1.maskPhone)(phone),
            success: true,
            at: new Date().toISOString(),
        });
    }
};
exports.SendPhoneOtpUseCase = SendPhoneOtpUseCase;
exports.SendPhoneOtpUseCase = SendPhoneOtpUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.AuthRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.PendingSignupRepository)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.PhoneFormatter)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.AuthPolicy)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.AuthErrorMapper)),
    __metadata("design:paramtypes", [Object, Object, Object, AuthPolicy_1.AuthPolicy,
        AuthErrorMapper_1.AuthErrorMapper])
], SendPhoneOtpUseCase);
