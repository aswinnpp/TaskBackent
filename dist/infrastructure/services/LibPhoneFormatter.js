"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibPhoneFormatter = void 0;
const inversify_1 = require("inversify");
const libphonenumber_js_1 = require("libphonenumber-js");
const ValidationError_1 = require("../../domain/errors/ValidationError");
const env_1 = require("../config/env");
const authDebug_1 = require("../../shared/logging/authDebug");
let LibPhoneFormatter = class LibPhoneFormatter {
    format(rawPhone) {
        const rawInput = String(rawPhone ?? "");
        const sanitizedInput = this.sanitize(rawInput);
        const parsed = sanitizedInput.startsWith("+")
            ? (0, libphonenumber_js_1.parsePhoneNumberFromString)(sanitizedInput)
            : (0, libphonenumber_js_1.parsePhoneNumberFromString)(sanitizedInput, env_1.env.defaultPhoneCountry.toUpperCase());
        if (!parsed || !parsed.isValid()) {
            (0, authDebug_1.logPhoneFormatDebug)({
                rawInput,
                sanitizedInput,
                finalE164: null,
                valid: false,
            });
            throw new ValidationError_1.ValidationError("Phone number is invalid. Please use a valid international format.");
        }
        const e164 = parsed.number;
        const result = {
            rawInput,
            sanitizedInput,
            e164,
            valid: true,
        };
        (0, authDebug_1.logPhoneFormatDebug)({
            rawInput,
            sanitizedInput,
            finalE164: e164,
            valid: true,
        });
        return result;
    }
    sanitize(value) {
        return value
            .normalize("NFKC")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .replace(/\(IN\)/gi, "")
            .replace(/[^\d+]/g, "");
    }
};
exports.LibPhoneFormatter = LibPhoneFormatter;
exports.LibPhoneFormatter = LibPhoneFormatter = __decorate([
    (0, inversify_1.injectable)()
], LibPhoneFormatter);
