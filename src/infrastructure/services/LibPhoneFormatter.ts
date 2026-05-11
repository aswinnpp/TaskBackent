import { injectable } from "inversify";
import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IPhoneFormatter, PhoneFormatResult } from "../../application/interfaces/IPhoneFormatter";
import { env } from "../config/env";
import { logPhoneFormatDebug } from "../../shared/logging/authDebug";

@injectable()
export class LibPhoneFormatter implements IPhoneFormatter {
  format(rawPhone: string): PhoneFormatResult {
    const rawInput = String(rawPhone ?? "");
    const sanitizedInput = this.sanitize(rawInput);

    const parsed =
      sanitizedInput.startsWith("+")
        ? parsePhoneNumberFromString(sanitizedInput)
        : parsePhoneNumberFromString(
            sanitizedInput,
            env.defaultPhoneCountry.toUpperCase() as CountryCode
          );

    if (!parsed || !parsed.isValid()) {
      logPhoneFormatDebug({
        rawInput,
        sanitizedInput,
        finalE164: null,
        valid: false,
      });
      throw new ValidationError("Phone number is invalid. Please use a valid international format.");
    }

    const e164 = parsed.number;
    const result: PhoneFormatResult = {
      rawInput,
      sanitizedInput,
      e164,
      valid: true,
    };

    logPhoneFormatDebug({
      rawInput,
      sanitizedInput,
      finalE164: e164,
      valid: true,
    });

    return result;
  }

  private sanitize(value: string): string {
    return value
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\(IN\)/gi, "")
      .replace(/[^\d+]/g, "");
  }
}
