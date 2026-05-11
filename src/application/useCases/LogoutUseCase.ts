import { inject, injectable } from "inversify";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(input: { accessToken?: string; refreshToken?: string }): Promise<void> {
    
    if (input?.accessToken && input?.refreshToken) {
      const set = await this.authRepository.setSession(input.accessToken, input.refreshToken);
      if (set.error) throw new AppError(this.authErrorMapper.map(set.error), 400);
    }
    const out = await this.authRepository.signOut();
    if (out.error) throw new AppError(this.authErrorMapper.map(out.error), 400);
  }
}

