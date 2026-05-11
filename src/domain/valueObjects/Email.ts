import { ValidationError } from "../errors/ValidationError";

export class Email {
  private readonly value: string;

  constructor(email: string) {
    const trimmed = String(email ?? "").trim().toLowerCase();
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) throw new ValidationError("Email is required");
    if (!pattern.test(trimmed)) throw new ValidationError("Email is not valid");
    this.value = trimmed;
  }

  getValue(): string {
    return this.value;
  }
}

