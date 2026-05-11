import { injectable } from "inversify";

@injectable()
export class AuthErrorMapper {
  map(message?: string): string {
    if (!message) return "Unknown error";
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials")) {
      return "Incorrect email or password";
    }
    if (lower.includes("email not confirmed")) {
      return "Please verify your email before logging in";
    }
    return message;
  }
}

