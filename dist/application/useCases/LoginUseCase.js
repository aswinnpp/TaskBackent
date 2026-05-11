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
exports.LoginUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const Email_1 = require("../../domain/valueObjects/Email");
const Password_1 = require("../../domain/valueObjects/Password");
const AppError_1 = require("../services/AppError");
const AuthErrorMapper_1 = require("../services/AuthErrorMapper");
let LoginUseCase = class LoginUseCase {
    constructor(authRepository, authErrorMapper) {
        this.authRepository = authRepository;
        this.authErrorMapper = authErrorMapper;
    }
    async execute(input) {
        const email = new Email_1.Email(input.email).getValue();
        const password = new Password_1.Password(input.password).getValue();
        const result = await this.authRepository.signInWithPassword(email, password);
        if (result.error || !result.data) {
            throw new AppError_1.AppError(this.authErrorMapper.map(result.error), 400);
        }
        return result.data;
    }
};
exports.LoginUseCase = LoginUseCase;
exports.LoginUseCase = LoginUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.AuthRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.AuthErrorMapper)),
    __metadata("design:paramtypes", [Object, AuthErrorMapper_1.AuthErrorMapper])
], LoginUseCase);
