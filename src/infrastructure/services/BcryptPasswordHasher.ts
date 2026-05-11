import { injectable } from "inversify";
import bcrypt from "bcryptjs";
import { IPasswordHasher } from "../../application/interfaces/IPasswordHasher";

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, 12);
  }
}
