import { request } from './client';

export interface ForgotPasswordRequest {
  emailOrUsername: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetUrl?: string;
  expirationMinutes?: number;
}

export interface VerifyResetTokenRequest {
  userId: number;
  token: string;
}

export interface VerifyResetTokenResponse {
  isValid: boolean;
  message: string;
  username?: string;
}

export interface ResetPasswordRequest {
  userId: number;
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface RecentEmailRecord {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  type: string;
  success: boolean;
  errorMessage?: string;
  sentAt: string;
}

export const emailApi = {
  /**
   * Request password reset link for username or email
   */
  async forgotPassword(emailOrUsername: string): Promise<ForgotPasswordResponse> {
    return request<ForgotPasswordResponse>('/api/emails/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername }),
    });
  },

  /**
   * Verify token validity before presenting password reset form
   */
  async verifyResetToken(userId: number, token: string): Promise<VerifyResetTokenResponse> {
    return request<VerifyResetTokenResponse>('/api/emails/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify({ userId, token }),
    });
  },

  /**
   * Reset user password using token
   */
  async resetPassword(userId: number, token: string, newPassword: string): Promise<ResetPasswordResponse> {
    return request<ResetPasswordResponse>('/api/emails/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId, token, newPassword }),
    });
  },

  /**
   * Fetch recent emails (in-memory diagnostics)
   */
  async getRecentEmails(): Promise<RecentEmailRecord[]> {
    return request<RecentEmailRecord[]>('/api/emails/recent', {
      method: 'GET',
    });
  },
};

