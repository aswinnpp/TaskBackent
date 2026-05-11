import { ValidationError } from "../errors/ValidationError";

export class ExpoPushToken {
  private readonly value: string;

  constructor(raw: string) {
    const token = String(raw || "").trim();
    if (!token) throw new ValidationError("pushToken is required");
    // Expo format examples: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
    const re = /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9\-_]+\]$/;
    if (!re.test(token)) throw new ValidationError("Invalid Expo push token format");
    this.value = token;
  }

  getValue(): string {
    return this.value;
  }
}

