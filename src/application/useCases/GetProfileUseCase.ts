import { inject, injectable } from "inversify";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";

@injectable()
export class GetProfileUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper
  ) {}

  async execute(accessToken: string): Promise<unknown> {
    if (!accessToken) throw new AppError("Missing access token", 401);
    const user = await this.authRepository.getUserByAccessToken(accessToken);
    if (user.error) throw new AppError(this.authErrorMapper.map(user.error), 401);
    return user.data;
  }
}


