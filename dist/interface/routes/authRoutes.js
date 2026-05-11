"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../infrastructure/container/inversify.config");
const AuthController_1 = require("../controllers/AuthController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const rateLimiters_1 = require("../middlewares/rateLimiters");
const router = (0, express_1.Router)();
exports.authRoutes = router;
if (!inversify_config_1.container.isBound(AuthController_1.AuthController)) {
    inversify_config_1.container.bind(AuthController_1.AuthController).toSelf();
}
const controller = inversify_config_1.container.get(AuthController_1.AuthController);
router.use(rateLimiters_1.authGeneralLimiter);
router.post("/signup", rateLimiters_1.otpSendLimiter, (0, asyncHandler_1.asyncHandler)(controller.handleSignup));
router.post("/login", (0, asyncHandler_1.asyncHandler)(controller.handleLogin));
router.post("/verify-otp", rateLimiters_1.otpVerifyLimiter, (0, asyncHandler_1.asyncHandler)(controller.handleVerifyOtp));
router.post("/resend-otp", rateLimiters_1.otpSendLimiter, (0, asyncHandler_1.asyncHandler)(controller.handleResendOtp));
router.post("/forgot-password", (0, asyncHandler_1.asyncHandler)(controller.handleForgotPassword));
router.post("/reset-password", (0, asyncHandler_1.asyncHandler)(controller.handleResetPassword));
router.post("/refresh-token", (0, asyncHandler_1.asyncHandler)(controller.handleRefreshToken));
router.post("/logout", (0, asyncHandler_1.asyncHandler)(controller.handleLogout));
router.post("/send-phone-otp", rateLimiters_1.otpSendLimiter, (0, asyncHandler_1.asyncHandler)(controller.handleSendPhoneOtp));
router.post("/verify-phone-otp", rateLimiters_1.otpVerifyLimiter, (0, asyncHandler_1.asyncHandler)(controller.handleVerifyPhoneOtp));
router.get("/profile", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(controller.handleGetProfile));
