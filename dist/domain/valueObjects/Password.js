"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
const ValidationError_1 = require("../errors/ValidationError");
class Password {
    constructor(password) {
        if (!password)
            throw new ValidationError_1.ValidationError("Password is required");
        if (password.length < 8) {
            throw new ValidationError_1.ValidationError("Password must be at least 8 characters");
        }
        this.value = password;
    }
    getValue() {
        return this.value;
    }
    static ensureConfirmed(password, confirmPassword) {
        if (typeof confirmPassword === "undefined")
            return;
        if (!confirmPassword) {
            throw new ValidationError_1.ValidationError("Confirm password is required");
        }
        if (password !== confirmPassword) {
            throw new ValidationError_1.ValidationError("Passwords do not match");
        }
    }
}
exports.Password = Password;
