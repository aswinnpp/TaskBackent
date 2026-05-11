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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterPushTokenUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const AppError_1 = require("../services/AppError");
const ExpoPushToken_1 = require("../../domain/valueObjects/ExpoPushToken");
const notificationLog_1 = require("../../shared/logging/notificationLog");
let RegisterPushTokenUseCase = class RegisterPushTokenUseCase {
    constructor(notificationRepository, notificationProvider) {
        this.notificationRepository = notificationRepository;
        this.notificationProvider = notificationProvider;
    }
    async execute(input) {
        (0, notificationLog_1.notificationLog)("REGISTER TOKEN START", "INFO", {
            hasUser: Boolean(input.userId),
            deviceType: input.deviceType || "unknown",
            at: new Date().toISOString(),
        });
        const token = new ExpoPushToken_1.ExpoPushToken(input.pushToken).getValue();
        if (!this.notificationProvider.isExpoToken(token)) {
            throw new AppError_1.AppError("Invalid Expo push token format", 400);
        }
        const deviceType = input.deviceType === "android" || input.deviceType === "ios" ? input.deviceType : "unknown";
        const existing = await this.notificationRepository.findByToken(token);
        if (existing) {
            (0, notificationLog_1.notificationLog)("TOKEN EXISTS", "INFO", {
                tokenId: existing.id,
                hasUser: Boolean(existing.userId),
                at: new Date().toISOString(),
            });
            return { exists: true };
        }
        try {
            await this.notificationRepository.upsertToken({
                userId: input.userId ?? null,
                pushToken: token,
                deviceType,
            });
            (0, notificationLog_1.notificationLog)("TOKEN SAVED", "INFO", { at: new Date().toISOString() });
            return { exists: false };
        }
        catch (err) {
            (0, notificationLog_1.notificationLog)("REGISTER TOKEN FAILED", "ERROR", {
                error: err?.message || String(err),
                at: new Date().toISOString(),
            });
            throw err;
        }
    }
};
exports.RegisterPushTokenUseCase = RegisterPushTokenUseCase;
exports.RegisterPushTokenUseCase = RegisterPushTokenUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.NotificationRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.NotificationProvider)),
    __metadata("design:paramtypes", [Object, Object])
], RegisterPushTokenUseCase);
