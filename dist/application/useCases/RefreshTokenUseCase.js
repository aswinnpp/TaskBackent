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
exports.RefreshTokenUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const AppError_1 = require("../services/AppError");
const AuthErrorMapper_1 = require("../services/AuthErrorMapper");
let RefreshTokenUseCase = class RefreshTokenUseCase {
    constructor(authRepository, authErrorMapper) {
        this.authRepository = authRepository;
        this.authErrorMapper = authErrorMapper;
    }
    async execute(input) {
        if (!input?.refreshToken)
            throw new AppError_1.AppError("Missing refreshToken", 400);
        const result = await this.authRepository.refreshSession(input.refreshToken);
        if (result.error || !result.data)
            throw new AppError_1.AppError(this.authErrorMapper.map(result.error), 400);
        return result.data;
    }
};
exports.RefreshTokenUseCase = RefreshTokenUseCase;
exports.RefreshTokenUseCase = RefreshTokenUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.AuthRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.AuthErrorMapper)),
    __metadata("design:paramtypes", [Object, AuthErrorMapper_1.AuthErrorMapper])
], RefreshTokenUseCase);
