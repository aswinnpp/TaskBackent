"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InMemoryPendingSignupRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPendingSignupRepository = void 0;
const inversify_1 = require("inversify");
let InMemoryPendingSignupRepository = InMemoryPendingSignupRepository_1 = class InMemoryPendingSignupRepository {
    save(signup) {
        InMemoryPendingSignupRepository_1.store.set(signup.phone, signup);
    }
    findByPhone(phone) {
        return InMemoryPendingSignupRepository_1.store.get(phone) || null;
    }
    removeByPhone(phone) {
        InMemoryPendingSignupRepository_1.store.delete(phone);
    }
};
exports.InMemoryPendingSignupRepository = InMemoryPendingSignupRepository;
InMemoryPendingSignupRepository.store = new Map();
exports.InMemoryPendingSignupRepository = InMemoryPendingSignupRepository = InMemoryPendingSignupRepository_1 = __decorate([
    (0, inversify_1.injectable)()
], InMemoryPendingSignupRepository);
