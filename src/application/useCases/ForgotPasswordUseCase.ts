import { inject, injectable } from "inversify";
import { ForgotPasswordDto } from "../dtos/AuthDtos";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { Email } from "../../domain/valueObjects/Email";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";
import { env } from "../../infrastructure/config/env";

@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(input: ForgotPasswordDto): Promise<void> {
    const email = new Email(input.email).getValue();
    const redirectTo = input.redirectUrl || env.passwordResetRedirectTo;
    const result = await this.authRepository.sendPasswordResetEmail(email, redirectTo);
    if (result.error) throw new AppError(this.authErrorMapper.map(result.error), 400);
  }
}


