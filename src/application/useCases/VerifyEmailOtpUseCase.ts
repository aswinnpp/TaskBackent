import { inject, injectable } from "inversify";
import { VerifyEmailOtpDto } from "../dtos/AuthDtos";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { Email } from "../../domain/valueObjects/Email";
import { OtpCode } from "../../domain/valueObjects/OtpCode";
import { OtpChannel } from "../../domain/enums/OtpChannel";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";
import { authLog, maskEmail, otpLengthOnly } from "../../shared/logging/authDebug";

@injectable()
export class VerifyEmailOtpUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(input: VerifyEmailOtpDto): Promise<{ user: unknown | null }> {
    const email = new Email(input.email).getValue();
    const code = new OtpCode(input.code).getValue();
    authLog("VERIFY OTP START", "INFO", {
      channel: "email",
      email: maskEmail(email),
      otpLength: otpLengthOnly(code),
      at: new Date().toISOString(),
    });
    const result = await this.authRepository.verifyOtp({
      channel: OtpChannel.Email,
      email,
      code,
    });
    if (result.error || !result.data) {
      authLog("VERIFY OTP RESULT", "WARN", {
        channel: "email",
        email: maskEmail(email),
        success: false,
        error: result.error || "Missing verify response data",
        at: new Date().toISOString(),
      });
      throw new AppError(this.authErrorMapper.map(result.error), 400);
    }
    authLog("VERIFY OTP RESULT", "INFO", {
      channel: "email",
      email: maskEmail(email),
      success: true,
      at: new Date().toISOString(),
    });
    return result.data;
  }
}


