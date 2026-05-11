import { OtpChannel } from "../enums/OtpChannel";

export interface RepositoryResult<T> {
  data?: T;
  error?: string;
}

export interface LoginResult {
  user: unknown;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface IAuthRepository {
  emailExists(email: string): Promise<RepositoryResult<boolean>>;
  phoneExists(phone: string): Promise<RepositoryResult<boolean>>;
  signInWithPassword(email: string, password: string): Promise<RepositoryResult<LoginResult>>;
  refreshSession(refreshToken: string): Promise<RepositoryResult<LoginResult>>;
  sendPasswordResetEmail(email: string, redirectUrl?: string): Promise<RepositoryResult<void>>;
  setSession(accessToken: string, refreshToken: string): Promise<RepositoryResult<void>>;
  updatePassword(newPassword: string): Promise<RepositoryResult<void>>;
  getUserByAccessToken(accessToken: string): Promise<RepositoryResult<unknown>>;
  getCurrentUser(): Promise<RepositoryResult<unknown>>;
  signOut(): Promise<RepositoryResult<void>>;
  sendOtp(input: { email?: string; phone?: string }): Promise<RepositoryResult<void>>;
  verifyOtp(input: {
    channel: OtpChannel;
    email?: string;
    phone?: string;
    code: string;
  }): Promise<RepositoryResult<{ user: unknown | null }>>;
  resendSignupVerification(email: string, redirectUrl?: string): Promise<RepositoryResult<void>>;
  signUp(input: {
    email: string;
    password: string;
    metadata: Record<string, unknown>;
  }): Promise<RepositoryResult<{ user: unknown | null }>>;
}

