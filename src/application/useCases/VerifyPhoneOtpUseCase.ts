import { inject, injectable } from "inversify";
import { VerifyPhoneOtpDto } from "../dtos/AuthDtos";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IPendingSignupRepository } from "../../domain/repositories/IPendingSignupRepository";
import { IPhoneFormatter } from "../interfaces/IPhoneFormatter";
import { Phone } from "../../domain/valueObjects/Phone";
import { OtpCode } from "../../domain/valueObjects/OtpCode";
import { OtpChannel } from "../../domain/enums/OtpChannel";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";
import { AuthPolicy } from "../services/AuthPolicy";
import { ISecretCipher } from "../interfaces/ISecretCipher";
import { authLog, maskPhone, otpLengthOnly } from "../../shared/logging/authDebug";

@injectable()
export class VerifyPhoneOtpUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.PendingSignupRepository)
    private readonly pendingRepository: IPendingSignupRepository,
    @inject(TYPES.PhoneFormatter) private readonly phoneFormatter: IPhoneFormatter,
    @inject(TYPES.SecretCipher) private readonly secretCipher: ISecretCipher,
    @inject(TYPES.AuthPolicy) private readonly authPolicy: AuthPolicy,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(input: VerifyPhoneOtpDto): Promise<{ user: unknown | null; message: string }> {
    const phone = this.phoneFormatter.format(new Phone(input.phone).getValue()).e164;
    const otp = new OtpCode(input.code ?? input.otp ?? "").getValue();
    authLog("VERIFY OTP START", "INFO", {
      channel: "sms",
      phone: maskPhone(phone),
      otpLength: otpLengthOnly(otp),
      at: new Date().toISOString(),
    });

    const pending = await this.pendingRepository.findActiveByPhone(phone);
    if (!pending || !pending.id) {
      throw new AppError("No pending signup found for this phone. Please sign up again.", 400);
    }
    if (pending.isExpired()) {
      await this.pendingRepository.deleteById(pending.id);
      throw new AppError("OTP expired. Please sign up again.", 400);
    }
    this.authPolicy.ensureAttemptAllowed(pending.attemptCount);

    const verified = await this.authRepository.verifyOtp({
      channel: OtpChannel.Sms,
      phone,
      code: otp,
    });
    if (verified.error) {
      await this.pendingRepository.incrementAttemptCount(pending.id);
      authLog("VERIFY OTP RESULT", "WARN", {
        channel: "sms",
        phone: maskPhone(phone),
        success: false,
        error: verified.error,
        at: new Date().toISOString(),
      });
      throw new AppError(this.authErrorMapper.map(verified.error), 400);
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

    if (signUp.error) throw new AppError(this.authErrorMapper.map(signUp.error), 400);
    await this.pendingRepository.deleteById(pending.id);
    authLog("VERIFY OTP RESULT", "INFO", {
      channel: "sms",
      phone: maskPhone(phone),
      success: true,
      userCreated: true,
      at: new Date().toISOString(),
    });

    return {
      message: "Phone OTP verified. Registration completed.",
      user: signUp.data?.user ?? verified.data?.user ?? null,
    };
  }
}


