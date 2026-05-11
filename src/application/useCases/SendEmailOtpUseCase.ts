import { inject, injectable } from "inversify";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { Email } from "../../domain/valueObjects/Email";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";
import { authLog, maskEmail } from "../../shared/logging/authDebug";

@injectable()
export class SendEmailOtpUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(emailInput: string): Promise<void> {
    authLog("EMAIL OTP SEND START", "INFO", {
      email: maskEmail(emailInput),
      channel: "email",
      at: new Date().toISOString(),
    });
    const email = new Email(emailInput).getValue();
    const result = await this.authRepository.sendOtp({ email });
    if (result.error) throw new AppError(this.authErrorMapper.map(result.error), 400);
    authLog("EMAIL OTP SEND RESULT", "INFO", {
      email: maskEmail(email),
      success: true,
      at: new Date().toISOString(),
    });
  }
}


