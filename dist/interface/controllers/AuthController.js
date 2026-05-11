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
exports.AuthController = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../shared/di/types");
const SignupUseCase_1 = require("../../application/useCases/SignupUseCase");
const LoginUseCase_1 = require("../../application/useCases/LoginUseCase");
const ForgotPasswordUseCase_1 = require("../../application/useCases/ForgotPasswordUseCase");
const ResetPasswordUseCase_1 = require("../../application/useCases/ResetPasswordUseCase");
const GetProfileUseCase_1 = require("../../application/useCases/GetProfileUseCase");
const ResendEmailVerificationUseCase_1 = require("../../application/useCases/ResendEmailVerificationUseCase");
const SendEmailOtpUseCase_1 = require("../../application/useCases/SendEmailOtpUseCase");
const VerifyEmailOtpUseCase_1 = require("../../application/useCases/VerifyEmailOtpUseCase");
const SendPhoneOtpUseCase_1 = require("../../application/useCases/SendPhoneOtpUseCase");
const VerifyPhoneOtpUseCase_1 = require("../../application/useCases/VerifyPhoneOtpUseCase");
const RefreshTokenUseCase_1 = require("../../application/useCases/RefreshTokenUseCase");
const LogoutUseCase_1 = require("../../application/useCases/LogoutUseCase");
const ApiResponse_1 = require("../presenters/ApiResponse");
let AuthController = class AuthController {
    constructor(signupUseCase, loginUseCase, forgotPasswordUseCase, resetPasswordUseCase, getProfileUseCase, resendEmailVerificationUseCase, sendEmailOtpUseCase, verifyEmailOtpUseCase, sendPhoneOtpUseCase, verifyPhoneOtpUseCase, refreshTokenUseCase, logoutUseCase) {
        this.signupUseCase = signupUseCase;
        this.loginUseCase = loginUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.getProfileUseCase = getProfileUseCase;
        this.resendEmailVerificationUseCase = resendEmailVerificationUseCase;
        this.sendEmailOtpUseCase = sendEmailOtpUseCase;
        this.verifyEmailOtpUseCase = verifyEmailOtpUseCase;
        this.sendPhoneOtpUseCase = sendPhoneOtpUseCase;
        this.verifyPhoneOtpUseCase = verifyPhoneOtpUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.logoutUseCase = logoutUseCase;
        this.handleSignup = async (req, res) => {
            const result = await this.signupUseCase.execute(req.body);
            res.status(201).json({
                ...ApiResponse_1.ApiResponse.success(result.message, { user: result.user }),
                user: result.user,
            });
        };
        this.handleLogin = async (req, res) => {
            const result = await this.loginUseCase.execute(req.body);
            res.status(200).json({
                ...ApiResponse_1.ApiResponse.success("Login successful", {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                }),
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });
        };
        this.handleForgotPassword = async (req, res) => {
            await this.forgotPasswordUseCase.execute(req.body);
            res
                .status(200)
                .json(ApiResponse_1.ApiResponse.success("If this email exists, a reset link has been sent to the inbox.", {}));
        };
        this.handleResetPassword = async (req, res) => {
            await this.resetPasswordUseCase.execute(req.body);
            res.status(200).json(ApiResponse_1.ApiResponse.success("Password updated successfully. You can now log in with your new password.", {}));
        };
        this.handleRefreshToken = async (req, res) => {
            const result = await this.refreshTokenUseCase.execute(req.body);
            res.status(200).json({
                ...ApiResponse_1.ApiResponse.success("Token refreshed", {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                }),
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });
        };
        this.handleLogout = async (req, res) => {
            const authHeader = req.headers.authorization || "";
            const bearer = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "").trim() : "";
            await this.logoutUseCase.execute({
                accessToken: req.body?.accessToken || bearer || undefined,
                refreshToken: req.body?.refreshToken || undefined,
            });
            res.status(200).json(ApiResponse_1.ApiResponse.success("Logged out", {}));
        };
        this.handleGetProfile = async (req, res) => {
            const token = req.authToken || "";
            const user = await this.getProfileUseCase.execute(token);
            res.status(200).json({
                ...ApiResponse_1.ApiResponse.success("Profile loaded", { user }),
                user,
            });
        };
        this.handleResendEmailVerification = async (req, res) => {
            await this.resendEmailVerificationUseCase.execute(req.body.email, req.body.redirectUrl);
            res.status(200).json(ApiResponse_1.ApiResponse.success("Verification email sent (if this email exists).", {}));
        };
        this.handleSendEmailOtp = async (req, res) => {
            await this.sendEmailOtpUseCase.execute(req.body.email);
            res.status(200).json(ApiResponse_1.ApiResponse.success("OTP sent to email (if allowed by Supabase settings)."));
        };
        this.handleVerifyEmailOtp = async (req, res) => {
            const result = await this.verifyEmailOtpUseCase.execute(req.body);
            res.status(200).json({
                ...ApiResponse_1.ApiResponse.success("Email OTP verified successfully.", { user: result.user }),
                user: result.user,
            });
        };
        this.handleSendPhoneOtp = async (req, res) => {
            await this.sendPhoneOtpUseCase.execute(req.body.phone);
            res.status(200).json(ApiResponse_1.ApiResponse.success("OTP sent to phone number (if allowed by Supabase settings)."));
        };
        this.handleVerifyPhoneOtp = async (req, res) => {
            const result = await this.verifyPhoneOtpUseCase.execute(req.body);
            res.status(200).json({
                ...ApiResponse_1.ApiResponse.success(result.message, {
                    user: result.user,
                }),
                user: result.user,
            });
        };
        // Production API aliases required by frontend:
        this.handleResendOtp = this.handleSendPhoneOtp;
        this.handleVerifyOtp = this.handleVerifyPhoneOtp;
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.SignupUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.LoginUseCase)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ForgotPasswordUseCase)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.ResetPasswordUseCase)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.GetProfileUseCase)),
    __param(5, (0, inversify_1.inject)(types_1.TYPES.ResendEmailVerificationUseCase)),
    __param(6, (0, inversify_1.inject)(types_1.TYPES.SendEmailOtpUseCase)),
    __param(7, (0, inversify_1.inject)(types_1.TYPES.VerifyEmailOtpUseCase)),
    __param(8, (0, inversify_1.inject)(types_1.TYPES.SendPhoneOtpUseCase)),
    __param(9, (0, inversify_1.inject)(types_1.TYPES.VerifyPhoneOtpUseCase)),
    __param(10, (0, inversify_1.inject)(types_1.TYPES.RefreshTokenUseCase)),
    __param(11, (0, inversify_1.inject)(types_1.TYPES.LogoutUseCase)),
    __metadata("design:paramtypes", [SignupUseCase_1.SignupUseCase,
        LoginUseCase_1.LoginUseCase,
        ForgotPasswordUseCase_1.ForgotPasswordUseCase,
        ResetPasswordUseCase_1.ResetPasswordUseCase,
        GetProfileUseCase_1.GetProfileUseCase,
        ResendEmailVerificationUseCase_1.ResendEmailVerificationUseCase,
        SendEmailOtpUseCase_1.SendEmailOtpUseCase,
        VerifyEmailOtpUseCase_1.VerifyEmailOtpUseCase,
        SendPhoneOtpUseCase_1.SendPhoneOtpUseCase,
        VerifyPhoneOtpUseCase_1.VerifyPhoneOtpUseCase,
        RefreshTokenUseCase_1.RefreshTokenUseCase,
        LogoutUseCase_1.LogoutUseCase])
], AuthController);
