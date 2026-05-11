"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpVerifyLimiter = exports.otpSendLimiter = exports.authGeneralLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authDebug_1 = require("../../shared/logging/authDebug");
const limiterResponse = (message) => ({
    success: false,
    message,
    error: { code: "RATE_LIMITED" },
});
exports.authGeneralLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) => {
        (0, authDebug_1.authLog)("RATE LIMIT HIT", "WARN", {
            limiter: "authGeneralLimiter",
            path: req.path,
            method: req.method,
            at: new Date().toISOString(),
        });
        res.status(429).json(limiterResponse("Too many requests. Please try again shortly."));
    },
});
exports.otpSendLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) => {
        (0, authDebug_1.authLog)("RATE LIMIT HIT", "WARN", {
            limiter: "otpSendLimiter",
            path: req.path,
            method: req.method,
            phone: (0, authDebug_1.maskPhone)(req.body?.phone || ""),
            email: (0, authDebug_1.maskEmail)(req.body?.email || ""),
            at: new Date().toISOString(),
        });
        res.status(429).json(limiterResponse("Too many OTP send requests. Please try later."));
    },
});
exports.otpVerifyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) => {
        (0, authDebug_1.authLog)("RATE LIMIT HIT", "WARN", {
            limiter: "otpVerifyLimiter",
            path: req.path,
            method: req.method,
            phone: (0, authDebug_1.maskPhone)(req.body?.phone || ""),
            email: (0, authDebug_1.maskEmail)(req.body?.email || ""),
            at: new Date().toISOString(),
        });
        res.status(429).json(limiterResponse("Too many OTP verification attempts. Please try later."));
    },
});
