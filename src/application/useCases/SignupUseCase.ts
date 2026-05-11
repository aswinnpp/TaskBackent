import { inject, injectable } from "inversify";
import { SignupDto } from "../dtos/AuthDtos";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IPendingSignupRepository } from "../../domain/repositories/IPendingSignupRepository";
import { IPasswordHasher } from "../interfaces/IPasswordHasher";
import { ISecretCipher } from "../interfaces/ISecretCipher";
import { IPhoneFormatter } from "../interfaces/IPhoneFormatter";
import { Email } from "../../domain/valueObjects/Email";
import { Phone } from "../../domain/valueObjects/Phone";
import { Password } from "../../domain/valueObjects/Password";
import { PendingSignup } from "../../domain/entities/PendingSignup";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";
import { AuthPolicy } from "../services/AuthPolicy";
import { authLog, isLikelyE164, maskEmail, maskPhone } from "../../shared/logging/authDebug";

@injectable()
export class SignupUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.PendingSignupRepository)
    private readonly pendingRepository: IPendingSignupRepository,
    @inject(TYPES.PasswordHasher) private readonly passwordHasher: IPasswordHasher,
    @inject(TYPES.SecretCipher) private readonly secretCipher: ISecretCipher,
    @inject(TYPES.PhoneFormatter) private readonly phoneFormatter: IPhoneFormatter,
    @inject(TYPES.AuthPolicy) private readonly authPolicy: AuthPolicy,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(input: SignupDto): Promise<{ message: string; user: null }> {
    authLog("SIGNUP FLOW START", "INFO", {
      email: maskEmail(input.email),
      phone: maskPhone(input.phone),
      phoneE164Format: isLikelyE164(input.phone),
      at: new Date().toISOString(),
    });
    const email = new Email(input.email).getValue();
    const phone = this.phoneFormatter.format(new Phone(input.phone).getValue()).e164;
    const password = new Password(input.password).getValue();
    Password.ensureConfirmed(password, input.confirmPassword);

    const emailExists = await this.authRepository.emailExists(email);
    if (emailExists.error) throw new AppError(this.authErrorMapper.map(emailExists.error), 500);
    if (emailExists.data) throw new AppError("Email already exists", 409);

    const phoneExists = await this.authRepository.phoneExists(phone);
    if (phoneExists.error) throw new AppError(this.authErrorMapper.map(phoneExists.error), 500);
    if (phoneExists.data) throw new AppError("Phone number already exists", 409);

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
    const pending = await this.pendingRepository.upsert(
      new PendingSignup(
        existingByPhone?.id || existingByEmail?.id || null,
        email,
        phone,
        hashedPassword,
        encryptedPassword,
        new Date(Date.now() + this.authPolicy.pendingSignupTtlMs),
        0,
        existingByPhone?.resendCount || existingByEmail?.resendCount || 0,
        now,
        existingByPhone?.createdAt || existingByEmail?.createdAt || now,
        now
      )
    );

    const otpResponse = await this.authRepository.sendOtp({ phone });
    if (!otpResponse.error && pending.id) {
      await this.pendingRepository.incrementResendCount(pending.id, new Date());
    }
    authLog("SIGNUP OTP SEND RESULT", otpResponse.error ? "WARN" : "INFO", {
      phone: maskPhone(phone),
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
}


