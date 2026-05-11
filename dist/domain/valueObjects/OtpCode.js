"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpCode = void 0;
const ValidationError_1 = require("../errors/ValidationError");
class OtpCode {
    constructor(code) {
        const normalized = String(code ?? "").trim();
        if (!normalized)
            throw new ValidationError_1.ValidationError("OTP is required");
        if (!/^\d{4,6}$/.test(normalized)) {
            throw new ValidationError_1.ValidationError("OTP must be 4 to 6 digits");
        }
        this.value = normalized;
    }
    getValue() {
        return this.value;
    }
}
exports.OtpCode = OtpCode;
