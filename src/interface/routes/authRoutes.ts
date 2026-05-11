import { Router } from "express";
import { container } from "../../infrastructure/container/inversify.config";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  authGeneralLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
} from "../middlewares/rateLimiters";

const router = Router();
if (!container.isBound(AuthController)) {
  container.bind(AuthController).toSelf();
}
const controller = container.get(AuthController);

router.use(authGeneralLimiter);
router.post("/signup", otpSendLimiter, asyncHandler(controller.handleSignup));
router.post("/login", asyncHandler(controller.handleLogin));
router.post("/verify-otp", otpVerifyLimiter, asyncHandler(controller.handleVerifyOtp));
router.post("/resend-otp", otpSendLimiter, asyncHandler(controller.handleResendOtp));
router.post("/forgot-password", asyncHandler(controller.handleForgotPassword));
router.post("/reset-password", asyncHandler(controller.handleResetPassword));
router.post("/refresh-token", asyncHandler(controller.handleRefreshToken));
router.post("/logout", asyncHandler(controller.handleLogout));
router.post("/resend-email-verification", asyncHandler(controller.handleResendEmailVerification));
router.post("/send-email-otp", otpSendLimiter, asyncHandler(controller.handleSendEmailOtp));
router.post("/verify-email-otp", otpVerifyLimiter, asyncHandler(controller.handleVerifyEmailOtp));
router.post("/send-phone-otp", otpSendLimiter, asyncHandler(controller.handleSendPhoneOtp));
router.post("/verify-phone-otp", otpVerifyLimiter, asyncHandler(controller.handleVerifyPhoneOtp));
router.get("/profile", authMiddleware, asyncHandler(controller.handleGetProfile));

export { router as authRoutes };

