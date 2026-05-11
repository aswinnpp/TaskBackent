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
exports.NotificationController = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../shared/di/types");
const RegisterPushTokenUseCase_1 = require("../../application/useCases/RegisterPushTokenUseCase");
const ApiResponse_1 = require("../presenters/ApiResponse");
let NotificationController = class NotificationController {
    constructor(registerPushTokenUseCase) {
        this.registerPushTokenUseCase = registerPushTokenUseCase;
        this.registerToken = async (req, res) => {
            const userId = req.userId ?? null;
            const result = await this.registerPushTokenUseCase.execute({
                pushToken: req.body?.pushToken,
                deviceType: req.body?.deviceType,
                userId,
            });
            res.status(200).json(ApiResponse_1.ApiResponse.success(result.exists ? "Token already registered" : "Token registered", {
                exists: result.exists,
            }));
        };
    }
};
exports.NotificationController = NotificationController;
exports.NotificationController = NotificationController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.RegisterPushTokenUseCase)),
    __metadata("design:paramtypes", [RegisterPushTokenUseCase_1.RegisterPushTokenUseCase])
], NotificationController);
