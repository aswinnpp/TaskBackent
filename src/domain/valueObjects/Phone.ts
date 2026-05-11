import { ValidationError } from "../errors/ValidationError";

export class Phone {
  private readonly value: string;

  constructor(phone: string) {
    const trimmed = String(phone ?? "").trim();
    const onlyDigits = trimmed.replace(/\D/g, "");
    if (!trimmed) throw new ValidationError("Phone number is required");
    if (onlyDigits.length < 10) {
      throw new ValidationError("Phone number must be at least 10 digits");
    }
    this.value = trimmed;
  }

  getValue(): string {
    return this.value;
  }
}

