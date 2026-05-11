"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpoPushToken = void 0;
const ValidationError_1 = require("../errors/ValidationError");
class ExpoPushToken {
    constructor(raw) {
        const token = String(raw || "").trim();
        if (!token)
            throw new ValidationError_1.ValidationError("pushToken is required");
        // Expo format examples: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
        const re = /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9\-_]+\]$/;
        if (!re.test(token))
            throw new ValidationError_1.ValidationError("Invalid Expo push token format");
        this.value = token;
    }
    getValue() {
        return this.value;
    }
}
exports.ExpoPushToken = ExpoPushToken;
