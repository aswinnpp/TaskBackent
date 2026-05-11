export interface SignupDto {
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
  redirectUrl?: string;
}

export interface ResetPasswordDto {
  accessToken: string;
  refreshToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  accessToken?: string;
  refreshToken?: string;
}

export interface VerifyPhoneOtpDto {
  phone: string;
  code?: string;
  otp?: string;
}

export interface VerifyEmailOtpDto {
  email: string;
  code: string;
}

