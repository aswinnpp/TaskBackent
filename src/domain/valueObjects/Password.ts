import { ValidationError } from "../errors/ValidationError";

export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (!password) throw new ValidationError("Password is required");
    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters");
    }
    this.value = password;
  }

  getValue(): string {
    return this.value;
  }

  static ensureConfirmed(password: string, confirmPassword?: string): void {
    if (typeof confirmPassword === "undefined") return;
    if (!confirmPassword) {
      throw new ValidationError("Confirm password is required");
    }
    if (password !== confirmPassword) {
      throw new ValidationError("Passwords do not match");
    }
  }
}

