import { ValidationError } from "../errors/ValidationError";

export class OtpCode {
  private readonly value: string;

  constructor(code: string) {
    const normalized = String(code ?? "").trim();
    if (!normalized) throw new ValidationError("OTP is required");
    if (!/^\d{4,6}$/.test(normalized)) {
      throw new ValidationError("OTP must be 4 to 6 digits");
    }
    this.value = normalized;
  }

  getValue(): string {
    return this.value;
  }
}

