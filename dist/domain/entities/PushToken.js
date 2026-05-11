"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushToken = void 0;
class PushToken {
    constructor(id, userId, pushToken, deviceType, createdAt, updatedAt) {
        this.id = id;
        this.userId = userId;
        this.pushToken = pushToken;
        this.deviceType = deviceType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.PushToken = PushToken;
