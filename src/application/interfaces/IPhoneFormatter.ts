export interface PhoneFormatResult {
  rawInput: string;
  sanitizedInput: string;
  e164: string;
  valid: boolean;
}

export interface IPhoneFormatter {
  format(rawPhone: string): PhoneFormatResult;
}
