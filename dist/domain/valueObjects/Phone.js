"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = void 0;
const ValidationError_1 = require("../errors/ValidationError");
class Phone {
    constructor(phone) {
        const trimmed = String(phone ?? "").trim();
        const onlyDigits = trimmed.replace(/\D/g, "");
        if (!trimmed)
            throw new ValidationError_1.ValidationError("Phone number is required");
        if (onlyDigits.length < 10) {
            throw new ValidationError_1.ValidationError("Phone number must be at least 10 digits");
        }
        this.value = trimmed;
    }
    getValue() {
        return this.value;
    }
}
exports.Phone = Phone;
