"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../shared/di/types");
const SupabaseAuthRepository_1 = require("../repositories/SupabaseAuthRepository");
const SupabasePendingSignupRepository_1 = require("../repositories/SupabasePendingSignupRepository");
const AuthErrorMapper_1 = require("../../application/services/AuthErrorMapper");
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
const BcryptPasswordHasher_1 = require("../services/BcryptPasswordHasher");
const AuthPolicy_1 = require("../../application/services/AuthPolicy");
const AesSecretCipher_1 = require("../services/AesSecretCipher");
const LibPhoneFormatter_1 = require("../services/LibPhoneFormatter");
const SupabaseNotificationRepository_1 = require("../repositories/SupabaseNotificationRepository");
const ExpoNotificationProvider_1 = require("../services/ExpoNotificationProvider");
const RegisterPushTokenUseCase_1 = require("../../application/useCases/RegisterPushTokenUseCase");
const container = new inversify_1.Container();
exports.container = container;
container.bind(types_1.TYPES.AuthRepository).to(SupabaseAuthRepository_1.SupabaseAuthRepository);
container
    .bind(types_1.TYPES.PendingSignupRepository)
    .to(SupabasePendingSignupRepository_1.SupabasePendingSignupRepository);
container.bind(types_1.TYPES.PasswordHasher).to(BcryptPasswordHasher_1.BcryptPasswordHasher);
container.bind(types_1.TYPES.SecretCipher).to(AesSecretCipher_1.AesSecretCipher);
container.bind(types_1.TYPES.PhoneFormatter).to(LibPhoneFormatter_1.LibPhoneFormatter);
container.bind(types_1.TYPES.AuthPolicy).to(AuthPolicy_1.AuthPolicy);
container.bind(types_1.TYPES.AuthErrorMapper).to(AuthErrorMapper_1.AuthErrorMapper);
container.bind(types_1.TYPES.SignupUseCase).to(SignupUseCase_1.SignupUseCase);
container.bind(types_1.TYPES.LoginUseCase).to(LoginUseCase_1.LoginUseCase);
container.bind(types_1.TYPES.ForgotPasswordUseCase).to(ForgotPasswordUseCase_1.ForgotPasswordUseCase);
container.bind(types_1.TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase_1.ResetPasswordUseCase);
container.bind(types_1.TYPES.GetProfileUseCase).to(GetProfileUseCase_1.GetProfileUseCase);
container
    .bind(types_1.TYPES.ResendEmailVerificationUseCase)
    .to(ResendEmailVerificationUseCase_1.ResendEmailVerificationUseCase);
container.bind(types_1.TYPES.SendEmailOtpUseCase).to(SendEmailOtpUseCase_1.SendEmailOtpUseCase);
container.bind(types_1.TYPES.VerifyEmailOtpUseCase).to(VerifyEmailOtpUseCase_1.VerifyEmailOtpUseCase);
container.bind(types_1.TYPES.SendPhoneOtpUseCase).to(SendPhoneOtpUseCase_1.SendPhoneOtpUseCase);
container.bind(types_1.TYPES.VerifyPhoneOtpUseCase).to(VerifyPhoneOtpUseCase_1.VerifyPhoneOtpUseCase);
container.bind(types_1.TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase_1.RefreshTokenUseCase);
container.bind(types_1.TYPES.LogoutUseCase).to(LogoutUseCase_1.LogoutUseCase);
container
    .bind(types_1.TYPES.NotificationRepository)
    .to(SupabaseNotificationRepository_1.SupabaseNotificationRepository);
container
    .bind(types_1.TYPES.NotificationProvider)
    .to(ExpoNotificationProvider_1.ExpoNotificationProvider);
container.bind(types_1.TYPES.RegisterPushTokenUseCase).to(RegisterPushTokenUseCase_1.RegisterPushTokenUseCase);
