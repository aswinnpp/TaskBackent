import { Container } from "inversify";
import { TYPES } from "../../shared/di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IPendingSignupRepository } from "../../domain/repositories/IPendingSignupRepository";
import { SupabaseAuthRepository } from "../repositories/SupabaseAuthRepository";
import { SupabasePendingSignupRepository } from "../repositories/SupabasePendingSignupRepository";
import { AuthErrorMapper } from "../../application/services/AuthErrorMapper";
import { SignupUseCase } from "../../application/useCases/SignupUseCase";
import { LoginUseCase } from "../../application/useCases/LoginUseCase";
import { ForgotPasswordUseCase } from "../../application/useCases/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../application/useCases/ResetPasswordUseCase";
import { GetProfileUseCase } from "../../application/useCases/GetProfileUseCase";
import { ResendEmailVerificationUseCase } from "../../application/useCases/ResendEmailVerificationUseCase";
import { SendEmailOtpUseCase } from "../../application/useCases/SendEmailOtpUseCase";
import { VerifyEmailOtpUseCase } from "../../application/useCases/VerifyEmailOtpUseCase";
import { SendPhoneOtpUseCase } from "../../application/useCases/SendPhoneOtpUseCase";
import { VerifyPhoneOtpUseCase } from "../../application/useCases/VerifyPhoneOtpUseCase";
import { RefreshTokenUseCase } from "../../application/useCases/RefreshTokenUseCase";
import { LogoutUseCase } from "../../application/useCases/LogoutUseCase";
import { IPasswordHasher } from "../../application/interfaces/IPasswordHasher";
import { BcryptPasswordHasher } from "../services/BcryptPasswordHasher";
import { AuthPolicy } from "../../application/services/AuthPolicy";
import { ISecretCipher } from "../../application/interfaces/ISecretCipher";
import { AesSecretCipher } from "../services/AesSecretCipher";
import { IPhoneFormatter } from "../../application/interfaces/IPhoneFormatter";
import { LibPhoneFormatter } from "../services/LibPhoneFormatter";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { INotificationProvider } from "../../domain/repositories/INotificationProvider";
import { SupabaseNotificationRepository } from "../repositories/SupabaseNotificationRepository";
import { ExpoNotificationProvider } from "../services/ExpoNotificationProvider";
import { RegisterPushTokenUseCase } from "../../application/useCases/RegisterPushTokenUseCase";

const container = new Container();

container.bind<IAuthRepository>(TYPES.AuthRepository).to(SupabaseAuthRepository);
container
  .bind<IPendingSignupRepository>(TYPES.PendingSignupRepository)
  .to(SupabasePendingSignupRepository);
container.bind<IPasswordHasher>(TYPES.PasswordHasher).to(BcryptPasswordHasher);
container.bind<ISecretCipher>(TYPES.SecretCipher).to(AesSecretCipher);
container.bind<IPhoneFormatter>(TYPES.PhoneFormatter).to(LibPhoneFormatter);
container.bind<AuthPolicy>(TYPES.AuthPolicy).to(AuthPolicy);

container.bind<AuthErrorMapper>(TYPES.AuthErrorMapper).to(AuthErrorMapper);

container.bind<SignupUseCase>(TYPES.SignupUseCase).to(SignupUseCase);
container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
container.bind<ForgotPasswordUseCase>(TYPES.ForgotPasswordUseCase).to(ForgotPasswordUseCase);
container.bind<ResetPasswordUseCase>(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase);
container.bind<GetProfileUseCase>(TYPES.GetProfileUseCase).to(GetProfileUseCase);
container
  .bind<ResendEmailVerificationUseCase>(TYPES.ResendEmailVerificationUseCase)
  .to(ResendEmailVerificationUseCase);
container.bind<SendEmailOtpUseCase>(TYPES.SendEmailOtpUseCase).to(SendEmailOtpUseCase);
container.bind<VerifyEmailOtpUseCase>(TYPES.VerifyEmailOtpUseCase).to(VerifyEmailOtpUseCase);
container.bind<SendPhoneOtpUseCase>(TYPES.SendPhoneOtpUseCase).to(SendPhoneOtpUseCase);
container.bind<VerifyPhoneOtpUseCase>(TYPES.VerifyPhoneOtpUseCase).to(VerifyPhoneOtpUseCase);
container.bind<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase);
container.bind<LogoutUseCase>(TYPES.LogoutUseCase).to(LogoutUseCase);

container
  .bind<INotificationRepository>(TYPES.NotificationRepository)
  .to(SupabaseNotificationRepository);
container
  .bind<INotificationProvider>(TYPES.NotificationProvider)
  .to(ExpoNotificationProvider);
container.bind<RegisterPushTokenUseCase>(TYPES.RegisterPushTokenUseCase).to(RegisterPushTokenUseCase);

export { container };

