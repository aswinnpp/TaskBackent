import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { SignupUseCase } from "../../application/useCases/SignupUseCase";
import { LoginUseCase } from "../../application/useCases/LoginUseCase";
import { ForgotPasswordUseCase } from "../../application/useCases/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../application/useCases/ResetPasswordUseCase";
import { GetProfileUseCase } from "../../application/useCases/GetProfileUseCase";
import { ResendEmailVerificationUseCase } from "../../application/useCases/ResendEmailVerificationUseCase";
import { SendEmailOtpUseCase } from "../../application/useCases/SendEmailOtpUseCase";
import { VerifyEmailOtpUseCase } from "../../application/useCases/VerifyEmailOtpUseCase";
import { SendPhoneOtpUseCase } from "../../application/useCases/SendPhoneOtpUseCase";
import { VerifyPhoneOtpUseCase } from "../../application/useCases/VerifyPhoneOtpUseCase";
import { RefreshTokenUseCase } from "../../application/useCases/RefreshTokenUseCase";
import { LogoutUseCase } from "../../application/useCases/LogoutUseCase";
import { ApiResponse } from "../presenters/ApiResponse";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.SignupUseCase) private readonly signupUseCase: SignupUseCase,
    @inject(TYPES.LoginUseCase) private readonly loginUseCase: LoginUseCase,
    @inject(TYPES.ForgotPasswordUseCase)
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    @inject(TYPES.ResetPasswordUseCase) private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @inject(TYPES.GetProfileUseCase) private readonly getProfileUseCase: GetProfileUseCase,
    @inject(TYPES.ResendEmailVerificationUseCase)
    private readonly resendEmailVerificationUseCase: ResendEmailVerificationUseCase,
    @inject(TYPES.SendEmailOtpUseCase) private readonly sendEmailOtpUseCase: SendEmailOtpUseCase,
    @inject(TYPES.VerifyEmailOtpUseCase) private readonly verifyEmailOtpUseCase: VerifyEmailOtpUseCase,
    @inject(TYPES.SendPhoneOtpUseCase) private readonly sendPhoneOtpUseCase: SendPhoneOtpUseCase,
    @inject(TYPES.VerifyPhoneOtpUseCase)
    private readonly verifyPhoneOtpUseCase: VerifyPhoneOtpUseCase,
    @inject(TYPES.RefreshTokenUseCase) private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @inject(TYPES.LogoutUseCase) private readonly logoutUseCase: LogoutUseCase
  ) {}

  handleSignup = async (req: Request, res: Response): Promise<void> => {
    const result = await this.signupUseCase.execute(req.body);
    res.status(201).json({
      ...ApiResponse.success(result.message, { user: result.user }),
      user: result.user,
    });
  };

  handleLogin = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUseCase.execute(req.body);
    res.status(200).json({
      ...ApiResponse.success("Login successful", {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }),
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  };

  handleForgotPassword = async (req: Request, res: Response): Promise<void> => {
    await this.forgotPasswordUseCase.execute(req.body);
    res
      .status(200)
      .json(ApiResponse.success("If this email exists, a reset link has been sent to the inbox.", {}));
  };

  handleResetPassword = async (req: Request, res: Response): Promise<void> => {
    await this.resetPasswordUseCase.execute(req.body);
    res.status(200).json(
      ApiResponse.success("Password updated successfully. You can now log in with your new password.", {})
    );
  };

  handleRefreshToken = async (req: Request, res: Response): Promise<void> => {
    const result = await this.refreshTokenUseCase.execute(req.body);
    res.status(200).json({
      ...ApiResponse.success("Token refreshed", {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }),
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  };

  handleLogout = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "").trim() : "";
    await this.logoutUseCase.execute({
      accessToken: req.body?.accessToken || bearer || undefined,
      refreshToken: req.body?.refreshToken || undefined,
    });
    res.status(200).json(ApiResponse.success("Logged out", {}));
  };

  handleGetProfile = async (req: Request, res: Response): Promise<void> => {
    const token = (req as Request & { authToken?: string }).authToken || "";
    const user = await this.getProfileUseCase.execute(token);
    res.status(200).json({
      ...ApiResponse.success("Profile loaded", { user }),
      user,
    });
  };

  handleResendEmailVerification = async (req: Request, res: Response): Promise<void> => {
    await this.resendEmailVerificationUseCase.execute(req.body.email, req.body.redirectUrl);
    res.status(200).json(ApiResponse.success("Verification email sent (if this email exists).", {}));
  };

  handleSendEmailOtp = async (req: Request, res: Response): Promise<void> => {
    await this.sendEmailOtpUseCase.execute(req.body.email);
    res.status(200).json(ApiResponse.success("OTP sent to email (if allowed by Supabase settings)."));
  };

  handleVerifyEmailOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.verifyEmailOtpUseCase.execute(req.body);
    res.status(200).json({
      ...ApiResponse.success("Email OTP verified successfully.", { user: result.user }),
      user: result.user,
    });
  };

  handleSendPhoneOtp = async (req: Request, res: Response): Promise<void> => {
    await this.sendPhoneOtpUseCase.execute(req.body.phone);
    res.status(200).json(ApiResponse.success("OTP sent to phone number (if allowed by Supabase settings)."));
  };

  handleVerifyPhoneOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.verifyPhoneOtpUseCase.execute(req.body);
    res.status(200).json({
      ...ApiResponse.success(result.message, {
        user: result.user,
      }),
      user: result.user,
    });
  };

  // Production API aliases required by frontend:
  handleResendOtp = this.handleSendPhoneOtp;
  handleVerifyOtp = this.handleVerifyPhoneOtp;
}

