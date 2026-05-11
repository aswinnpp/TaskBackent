import { inject, injectable } from "inversify";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IPendingSignupRepository } from "../../domain/repositories/IPendingSignupRepository";
import { IPhoneFormatter } from "../interfaces/IPhoneFormatter";
import { Phone } from "../../domain/valueObjects/Phone";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";
import { AuthPolicy } from "../services/AuthPolicy";
import { authLog, isLikelyE164, maskPhone } from "../../shared/logging/authDebug";

@injectable()
export class SendPhoneOtpUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.PendingSignupRepository)
    private readonly pendingRepository: IPendingSignupRepository,
    @inject(TYPES.PhoneFormatter) private readonly phoneFormatter: IPhoneFormatter,
    @inject(TYPES.AuthPolicy) private readonly authPolicy: AuthPolicy,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(phoneInput: string): Promise<void> {
    const phone = this.phoneFormatter.format(new Phone(phoneInput).getValue()).e164;
    authLog("RESEND OTP START", isLikelyE164(phone) ? "INFO" : "WARN", {
      channel: "sms",
      phone: maskPhone(phone),
      phoneE164Format: isLikelyE164(phone),
      at: new Date().toISOString(),
    });
    const pending = await this.pendingRepository.findActiveByPhone(phone);
    if (!pending || !pending.id) {
      throw new AppError("No pending signup found for this phone. Please sign up again.", 404);
    }
    if (pending.isExpired()) {
      await this.pendingRepository.deleteById(pending.id);
      throw new AppError("OTP expired. Please sign up again.", 400);
    }
    this.authPolicy.ensureResendAllowed(pending.otpSentAt, pending.resendCount);

    const result = await this.authRepository.sendOtp({ phone });
    if (result.error) throw new AppError(this.authErrorMapper.map(result.error), 400);
    await this.pendingRepository.incrementResendCount(pending.id, new Date());
    authLog("RESEND OTP RESULT", "INFO", {
      channel: "sms",
      phone: maskPhone(phone),
      success: true,
      at: new Date().toISOString(),
    });
  }
}


