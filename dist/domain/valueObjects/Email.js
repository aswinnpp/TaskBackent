"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const ValidationError_1 = require("../errors/ValidationError");
class Email {
    constructor(email) {
        const trimmed = String(email ?? "").trim().toLowerCase();
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmed)
            throw new ValidationError_1.ValidationError("Email is required");
        if (!pattern.test(trimmed))
            throw new ValidationError_1.ValidationError("Email is not valid");
        this.value = trimmed;
    }
    getValue() {
        return this.value;
    }
}
exports.Email = Email;
