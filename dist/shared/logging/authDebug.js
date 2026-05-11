"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskEmail = maskEmail;
exports.maskPhone = maskPhone;
exports.otpLengthOnly = otpLengthOnly;
exports.isLikelyE164 = isLikelyE164;
exports.summarizeSupabaseResult = summarizeSupabaseResult;
exports.authLog = authLog;
exports.logPhoneFormatDebug = logPhoneFormatDebug;
function nowIso() {
    return new Date().toISOString();
}
function maskEmail(email) {
    if (!email)
        return "N/A";
    const trimmed = String(email).trim();
    const [local, domain] = trimmed.split("@");
    if (!local || !domain)
        return "invalid-email-format";
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}***@${domain}`;
}
function maskPhone(phone) {
    if (!phone)
        return "N/A";
    const value = String(phone).trim();
    const digits = value.replace(/\D/g, "");
    if (digits.length < 6)
        return "invalid-phone-format";
    const last3 = digits.slice(-3);
    return `+${"*".repeat(Math.max(0, digits.length - 3))}${last3}`;
}
function otpLengthOnly(otp) {
    return String(otp || "").trim().length;
}
function isLikelyE164(phone) {
    return /^\+[1-9]\d{7,14}$/.test(String(phone || "").trim());
}
function summarizeSupabaseResult(data, error) {
    const dataRecord = (data && typeof data === "object") ? data : null;
    const errorRecord = (error && typeof error === "object") ? error : null;
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
function authLog(scope, level, details) {
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
function logPhoneFormatDebug(details) {
    authLog("PHONE FORMAT DEBUG", details.valid ? "INFO" : "WARN", {
        rawInput: details.rawInput,
        sanitizedInput: details.sanitizedInput,
        finalE164: details.finalE164,
        length: details.finalE164 ? details.finalE164.length : 0,
        valid: details.valid,
        at: nowIso(),
    });
}
