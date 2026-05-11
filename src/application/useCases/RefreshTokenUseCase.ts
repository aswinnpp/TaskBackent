import { inject, injectable } from "inversify";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";
import { AuthPolicy } from "../services/AuthPolicy";

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper,
    @inject(TYPES.AuthPolicy) private readonly authPolicy: AuthPolicy
  ) {}

  async execute(input: { refreshToken: string }): Promise<{
    user: unknown;
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    if (!input?.refreshToken) throw new AppError("Missing refreshToken", 400);
    const result = await this.authRepository.refreshSession(input.refreshToken);
    if (result.error || !result.data) throw new AppError(this.authErrorMapper.map(result.error), 400);

    try {
      this.authPolicy.ensurePhoneVerifiedAuthUser(result.data.user);
    } catch (e) {
      await this.authRepository.signOut();
      throw e;
    }

    return result.data;
  }
}

