type LogLevel = "INFO" | "WARN" | "ERROR";

function nowIso(): string {
  return new Date().toISOString();
}

export function maskEmail(email?: string): string {
  if (!email) return "N/A";
  const trimmed = String(email).trim();
  const [local, domain] = trimmed.split("@");
  if (!local || !domain) return "invalid-email-format";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

export function maskPhone(phone?: string): string {
  if (!phone) return "N/A";
  const value = String(phone).trim();
  const digits = value.replace(/\D/g, "");
  if (digits.length < 6) return "invalid-phone-format";
  const last3 = digits.slice(-3);
  return `+${"*".repeat(Math.max(0, digits.length - 3))}${last3}`;
}

export function otpLengthOnly(otp?: string): number {
  return String(otp || "").trim().length;
}

export function isLikelyE164(phone?: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(String(phone || "").trim());
}

export function summarizeSupabaseResult(data: unknown, error: unknown): Record<string, unknown> {
  const dataRecord = (data && typeof data === "object") ? (data as Record<string, unknown>) : null;
  const errorRecord = (error && typeof error === "object") ? (error as Record<string, unknown>) : null;
  return {
    hasData: Boolean(data),
    dataKeys: dataRecord ? Object.keys(dataRecord) : [],
    hasError: Boolean(error),
    errorMessage: errorRecord?.message || null,
    errorCode: errorRecord?.code || null,
    errorName: errorRecord?.name || null,
    at: nowIso(),
  };
}

export function authLog(scope: string, level: LogLevel, details: Record<string, unknown>): void {
  const line = `[AUTH][${scope}][${level}]`;
  if (level === "ERROR") {
    console.error(line, details);
    return;
  }
  if (level === "WARN") {
    console.warn(line, details);
    return;
  }
  console.log(line, details);
}

export function logPhoneFormatDebug(details: {
  rawInput: string;
  sanitizedInput: string;
  finalE164: string | null;
  valid: boolean;
}): void {
  authLog("PHONE FORMAT DEBUG", details.valid ? "INFO" : "WARN", {
    rawInput: details.rawInput,
    sanitizedInput: details.sanitizedInput,
    finalE164: details.finalE164,
    length: details.finalE164 ? details.finalE164.length : 0,
    valid: details.valid,
    at: nowIso(),
  });
}
