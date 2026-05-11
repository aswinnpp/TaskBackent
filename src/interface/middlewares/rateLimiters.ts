import rateLimit from "express-rate-limit";
import { authLog, maskEmail, maskPhone } from "../../shared/logging/authDebug";

const limiterResponse = (message: string) => ({
  success: false,
  message,
  error: { code: "RATE_LIMITED" },
});

export const authGeneralLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    authLog("RATE LIMIT HIT", "WARN", {
      limiter: "authGeneralLimiter",
      path: req.path,
      method: req.method,
      at: new Date().toISOString(),
    });
    res.status(429).json(limiterResponse("Too many requests. Please try again shortly."));
  },
});

export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    authLog("RATE LIMIT HIT", "WARN", {
      limiter: "otpSendLimiter",
      path: req.path,
      method: req.method,
      phone: maskPhone((req.body?.phone as string) || ""),
      email: maskEmail((req.body?.email as string) || ""),
      at: new Date().toISOString(),
    });
    res.status(429).json(limiterResponse("Too many OTP send requests. Please try later."));
  },
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    authLog("RATE LIMIT HIT", "WARN", {
      limiter: "otpVerifyLimiter",
      path: req.path,
      method: req.method,
      phone: maskPhone((req.body?.phone as string) || ""),
      email: maskEmail((req.body?.email as string) || ""),
      at: new Date().toISOString(),
    });
    res.status(429).json(limiterResponse("Too many OTP verification attempts. Please try later."));
  },
});
