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
exports.SignupUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const Email_1 = require("../../domain/valueObjects/Email");
const Phone_1 = require("../../domain/valueObjects/Phone");
const Password_1 = require("../../domain/valueObjects/Password");
const PendingSignup_1 = require("../../domain/entities/PendingSignup");
const AppError_1 = require("../services/AppError");
const AuthErrorMapper_1 = require("../services/AuthErrorMapper");
const AuthPolicy_1 = require("../services/AuthPolicy");
const authDebug_1 = require("../../shared/logging/authDebug");
let SignupUseCase = class SignupUseCase {
    constructor(authRepository, pendingRepository, passwordHasher, secretCipher, phoneFormatter, authPolicy, authErrorMapper) {
        this.authRepository = authRepository;
        this.pendingRepository = pendingRepository;
        this.passwordHasher = passwordHasher;
        this.secretCipher = secretCipher;
        this.phoneFormatter = phoneFormatter;
        this.authPolicy = authPolicy;
        this.authErrorMapper = authErrorMapper;
    }
    async execute(input) {
        (0, authDebug_1.authLog)("SIGNUP FLOW START", "INFO", {
            email: (0, authDebug_1.maskEmail)(input.email),
            phone: (0, authDebug_1.maskPhone)(input.phone),
            phoneE164Format: (0, authDebug_1.isLikelyE164)(input.phone),
            at: new Date().toISOString(),
        });
        const email = new Email_1.Email(input.email).getValue();
        const phone = this.phoneFormatter.format(new Phone_1.Phone(input.phone).getValue()).e164;
        const password = new Password_1.Password(input.password).getValue();
        Password_1.Password.ensureConfirmed(password, input.confirmPassword);
        const emailExists = await this.authRepository.emailExists(email);
        if (emailExists.error)
            throw new AppError_1.AppError(this.authErrorMapper.map(emailExists.error), 500);
        if (emailExists.data)
            throw new AppError_1.AppError("Email already exists", 409);
        const phoneExists = await this.authRepository.phoneExists(phone);
        if (phoneExists.error)
            throw new AppError_1.AppError(this.authErrorMapper.map(phoneExists.error), 500);
        if (phoneExists.data)
            throw new AppError_1.AppError("Phone number already exists", 409);
        const existingByEmail = await this.pendingRepository.findActiveByEmail(email);
        if (existingByEmail) {
            this.authPolicy.ensureResendAllowed(existingByEmail.otpSentAt, existingByEmail.resendCount);
        }
        const existingByPhone = await this.pendingRepository.findActiveByPhone(phone);
        if (existingByPhone) {
            this.authPolicy.ensureResendAllowed(existingByPhone.otpSentAt, existingByPhone.resendCount);
        }
        const hashedPassword = await this.passwordHasher.hash(password);
        const encryptedPassword = this.secretCipher.encrypt(password);
        const now = new Date();
        const pending = await this.pendingRepository.upsert(new PendingSignup_1.PendingSignup(existingByPhone?.id || existingByEmail?.id || null, email, phone, hashedPassword, encryptedPassword, new Date(Date.now() + this.authPolicy.pendingSignupTtlMs), 0, existingByPhone?.resendCount || existingByEmail?.resendCount || 0, now, existingByPhone?.createdAt || existingByEmail?.createdAt || now, now));
        const otpResponse = await this.authRepository.sendOtp({ phone });
        if (!otpResponse.error && pending.id) {
            await this.pendingRepository.incrementResendCount(pending.id, new Date());
        }
        (0, authDebug_1.authLog)("SIGNUP OTP SEND RESULT", otpResponse.error ? "WARN" : "INFO", {
            phone: (0, authDebug_1.maskPhone)(phone),
            success: !otpResponse.error,
            error: otpResponse.error || null,
            at: new Date().toISOString(),
        });
        const otpSent = !otpResponse.error;
        return {
            message: otpSent
                ? "Signup successful. OTP sent to your phone."
                : "Signup successful, but OTP could not be sent now. Please tap resend OTP.",
            user: null,
        };
    }
};
exports.SignupUseCase = SignupUseCase;
exports.SignupUseCase = SignupUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.AuthRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.PendingSignupRepository)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.PasswordHasher)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.SecretCipher)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.PhoneFormatter)),
    __param(5, (0, inversify_1.inject)(types_1.TYPES.AuthPolicy)),
    __param(6, (0, inversify_1.inject)(types_1.TYPES.AuthErrorMapper)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, AuthPolicy_1.AuthPolicy,
        AuthErrorMapper_1.AuthErrorMapper])
], SignupUseCase);
