import { inject, injectable } from "inversify";
import { LoginDto } from "../dtos/AuthDtos";
import { TYPES } from "../di/types";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { Email } from "../../domain/valueObjects/Email";
import { Password } from "../../domain/valueObjects/Password";
import { AppError } from "../services/AppError";
import { AuthErrorMapper } from "../services/AuthErrorMapper";
import { AuthPolicy } from "../services/AuthPolicy";

@injectable()
export class LoginUseCase {
  constructor(
    @inject(TYPES.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(TYPES.AuthErrorMapper) private readonly authErrorMapper: AuthErrorMapper,
    @inject(TYPES.AuthPolicy) private readonly authPolicy: AuthPolicy
  ) {}

  async execute(input: LoginDto): Promise<{
    user: unknown;
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    const email = new Email(input.email).getValue();
    const password = new Password(input.password).getValue();

    const result = await this.authRepository.signInWithPassword(email, password);
    if (result.error || !result.data) {
      throw new AppError(this.authErrorMapper.map(result.error), 400);
    }

    try {
      this.authPolicy.ensurePhoneVerifiedAuthUser(result.data.user);
    } catch (e) {
      await this.authRepository.signOut();
      throw e;
    }

    return result.data;
  }
}


