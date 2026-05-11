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
exports.ForgotPasswordUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const Email_1 = require("../../domain/valueObjects/Email");
const AppError_1 = require("../services/AppError");
const AuthErrorMapper_1 = require("../services/AuthErrorMapper");
const env_1 = require("../../infrastructure/config/env");
let ForgotPasswordUseCase = class ForgotPasswordUseCase {
    constructor(authRepository, authErrorMapper) {
        this.authRepository = authRepository;
        this.authErrorMapper = authErrorMapper;
    }
    async execute(input) {
        const email = new Email_1.Email(input.email).getValue();
        const fallbackRedirect = env_1.env.publicBaseUrl && env_1.env.publicBaseUrl.startsWith("https://")
            ? `${env_1.env.publicBaseUrl.replace(/\/+$/, "")}/password-reset`
            : undefined;
        const result = await this.authRepository.sendPasswordResetEmail(email, input.redirectUrl || fallbackRedirect);
        if (result.error)
            throw new AppError_1.AppError(this.authErrorMapper.map(result.error), 400);
    }
};
exports.ForgotPasswordUseCase = ForgotPasswordUseCase;
exports.ForgotPasswordUseCase = ForgotPasswordUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.AuthRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.AuthErrorMapper)),
    __metadata("design:paramtypes", [Object, AuthErrorMapper_1.AuthErrorMapper])
], ForgotPasswordUseCase);
