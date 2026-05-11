"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AesSecretCipher = void 0;
const crypto_1 = require("crypto");
const inversify_1 = require("inversify");
const env_1 = require("../config/env");
let AesSecretCipher = class AesSecretCipher {
    constructor() {
        if (!env_1.env.pendingSecretKey) {
            throw new Error("Missing PENDING_SIGNUP_SECRET in .env");
        }
        this.key = (0, crypto_1.createHash)("sha256").update(env_1.env.pendingSecretKey).digest();
    }
    encrypt(value) {
        const iv = (0, crypto_1.randomBytes)(16);
        const cipher = (0, crypto_1.createCipheriv)("aes-256-gcm", this.key, iv);
        const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
    }
    decrypt(value) {
        const [ivHex, authTagHex, encryptedHex] = value.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const encrypted = Buffer.from(encryptedHex, "hex");
        const decipher = (0, crypto_1.createDecipheriv)("aes-256-gcm", this.key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString("utf8");
    }
};
exports.AesSecretCipher = AesSecretCipher;
exports.AesSecretCipher = AesSecretCipher = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], AesSecretCipher);
