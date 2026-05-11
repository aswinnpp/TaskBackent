import { inject, injectable } from "inversify";
import { ResetPasswordDto } from "../dtos/AuthDtos";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { Password } from "../../domain/valueObjects/Password";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(input: ResetPasswordDto): Promise<void> {
    const password = new Password(input.newPassword).getValue();
    Password.ensureConfirmed(password, input.confirmPassword);
    if (!input.accessToken) throw new AppError("Missing access token", 400);
    if (!input.refreshToken) throw new AppError("Missing refresh token", 400);

    const session = await this.authRepository.setSession(input.accessToken, input.refreshToken);
    if (session.error) throw new AppError(this.authErrorMapper.map(session.error), 400);

    const updated = await this.authRepository.updatePassword(password);
    if (updated.error) throw new AppError(this.authErrorMapper.map(updated.error), 400);
  }
}


