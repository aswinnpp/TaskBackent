import { Router } from "express";
import { container } from "../../infrastructure/container/inversify.config";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();
if (!container.isBound(AuthController)) {
  container.bind(AuthController).toSelf();
}
const controller = container.get(AuthController);


router.post("/signup",  asyncHandler(controller.handleSignup));
router.post("/login", asyncHandler(controller.handleLogin));
router.post("/verify-otp",  asyncHandler(controller.handleVerifyOtp));
router.post("/resend-otp",  asyncHandler(controller.handleResendOtp));
router.post("/forgot-password", asyncHandler(controller.handleForgotPassword));
router.post("/reset-password", asyncHandler(controller.handleResetPassword));
router.post("/refresh-token", asyncHandler(controller.handleRefreshToken));
router.post("/logout", asyncHandler(controller.handleLogout));
router.post("/send-phone-otp", asyncHandler(controller.handleSendPhoneOtp));
router.post("/verify-phone-otp",  asyncHandler(controller.handleVerifyPhoneOtp));
router.get("/profile", authMiddleware, asyncHandler(controller.handleGetProfile));

export { router as authRoutes };

