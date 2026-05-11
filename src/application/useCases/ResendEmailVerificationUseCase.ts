import { inject, injectable } from "inversify";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { Email } from "../../domain/valueObjects/Email";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";

@injectable()
export class ResendEmailVerificationUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(emailInput: string, redirectUrl?: string): Promise<void> {
    const email = new Email(emailInput).getValue();
    const result = await this.authRepository.resendSignupVerification(email, redirectUrl);
    if (result.error) throw new AppError(this.authErrorMapper.map(result.error), 400);
  }
}


