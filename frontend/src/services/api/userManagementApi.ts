import { request } from './client';
import { UserAccount, UserLogin, UserRole, SellerOnboardingRequest, SellerDecisionNotification } from '../../types';

export interface LoginResponse {
  token: string;
  login: UserLogin;
  accounts: UserAccount[];
  activeAccountId: string | number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  accountName: string;
  role: UserRole;
  location?: string;
  bio?: string;
}

export interface AdminCreateUserRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
  roles: UserRole[];
  location?: string;
  bio?: string;
}

export interface CreateAccountRequest {
  userLoginId: string | number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  bio?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface ChangePasswordPayload {
  usernameOrEmail?: string;
  loginId?: number | string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const userManagementApi = {
  // POST /api/users/validate (Explicit credential verification)
  validate: async (usernameOrEmail: string, password: string): Promise<LoginResponse> => {
    return request<LoginResponse>('/api/users/validate', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });
  },

  // POST /api/users/login
  login: async (usernameOrEmail: string, password: string): Promise<LoginResponse> => {
    return request<LoginResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });
  },

  // POST /api/users/register
  register: async (payload: RegisterRequest): Promise<LoginResponse> => {
    return request<LoginResponse>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // POST /api/users/admin/create-user
  adminCreateUser: async (payload: AdminCreateUserRequest): Promise<LoginResponse> => {
    return request<LoginResponse>('/api/users/admin/create-user', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // GET /api/users/logins (List all logins + accounts for switcher)
  getLogins: async (): Promise<Array<UserLogin & { accounts: UserAccount[] }>> => {
    return request<Array<UserLogin & { accounts: UserAccount[] }>>('/api/users/logins');
  },

  // GET /api/users/logins/{loginId}/accounts
  getLoginAccounts: async (loginId: string | number): Promise<UserAccount[]> => {
    return request<UserAccount[]>(`/api/users/logins/${encodeURIComponent(loginId)}/accounts`);
  },

  // GET /api/users/accounts
  getAccounts: async (filters?: { role?: string; loginId?: string | number }): Promise<UserAccount[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.loginId !== undefined) params.set('loginId', String(filters.loginId));
    const qs = params.toString();
    return request<UserAccount[]>(qs ? `/api/users/accounts?${qs}` : '/api/users/accounts');
  },

  // GET /api/users/accounts/{id}
  getAccountById: async (id: string | number): Promise<UserAccount> => {
    return request<UserAccount>(`/api/users/accounts/${encodeURIComponent(id)}`);
  },

  // POST /api/users/accounts (Add new role persona under existing login)
  createAccount: async (payload: CreateAccountRequest): Promise<UserAccount> => {
    return request<UserAccount>('/api/users/accounts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // PUT /api/users/accounts/{id}
  updateAccount: async (id: string | number, updates: Partial<UserAccount>): Promise<UserAccount> => {
    return request<UserAccount>(`/api/users/accounts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // POST /api/users/accounts/{id}/set-default
  setDefaultAccount: async (id: string | number): Promise<UserAccount> => {
    return request<UserAccount>(`/api/users/accounts/${encodeURIComponent(id)}/set-default`, {
      method: 'POST'
    });
  },

  // DELETE /api/users/accounts/{id}
  deleteAccount: async (id: string | number): Promise<void> => {
    return request<void>(`/api/users/accounts/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // POST /api/users/change-password
  changePassword: async (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
    return request<ChangePasswordResponse>('/api/users/change-password', {
      method: 'POST',
      body: JSON.stringify({
        usernameOrEmail: payload.usernameOrEmail,
        loginId: payload.loginId ? Number(payload.loginId) : undefined,
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword
      })
    });
  },

  // PUT /api/users/logins/{loginId}/status (Toggle active/inactive)
  updateUserStatus: async (loginId: string | number, isActive: boolean): Promise<UserLogin> => {
    return request<UserLogin>(`/api/users/logins/${encodeURIComponent(loginId)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    });
  },

  // PUT /api/users/logins/{loginId}/password (Admin reset user password without current password)
  resetUserPassword: async (loginId: string | number, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/api/users/logins/${encodeURIComponent(loginId)}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword })
    });
  },

  // PUT /api/users/logins/{loginId} (Update user login details)
  updateUserLogin: async (
    loginId: string | number,
    updates: { username?: string; email?: string; isActive?: boolean }
  ): Promise<UserLogin> => {
    return request<UserLogin>(`/api/users/logins/${encodeURIComponent(loginId)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // DELETE /api/users/logins/{loginId} (Delete user login and all associated personas)
  deleteUserLogin: async (loginId: string | number): Promise<void> => {
    return request<void>(`/api/users/logins/${encodeURIComponent(loginId)}`, {
      method: 'DELETE'
    });
  },

  // GET /api/users/seller-onboarding/requests
  getSellerOnboardingRequests: async (status?: string): Promise<SellerOnboardingRequest[]> => {
    const qs = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return request<SellerOnboardingRequest[]>(`/api/users/seller-onboarding/requests${qs}`);
  },

  // POST /api/users/seller-onboarding/requests
  submitSellerOnboardingRequest: async (payload: {
    type: 'new_user' | 'new_persona';
    userLoginId?: string | number;
    username: string;
    email: string;
    password?: string;
    displayName: string;
    location?: string;
    bio?: string;
  }): Promise<SellerOnboardingRequest> => {
    return request<SellerOnboardingRequest>('/api/users/seller-onboarding/requests', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // POST /api/users/seller-onboarding/requests/{id}/approve
  approveSellerOnboardingRequest: async (
    id: string | number,
    payload?: { adminUsername?: string; note?: string }
  ): Promise<{ success: boolean; request: SellerOnboardingRequest; notification: SellerDecisionNotification }> => {
    return request<{ success: boolean; request: SellerOnboardingRequest; notification: SellerDecisionNotification }>(
      `/api/users/seller-onboarding/requests/${encodeURIComponent(id)}/approve`,
      {
        method: 'POST',
        body: JSON.stringify(payload || {})
      }
    );
  },

  // POST /api/users/seller-onboarding/requests/{id}/reject
  rejectSellerOnboardingRequest: async (
    id: string | number,
    payload: { reason: string; adminUsername?: string }
  ): Promise<{ success: boolean; request: SellerOnboardingRequest; notification: SellerDecisionNotification }> => {
    return request<{ success: boolean; request: SellerOnboardingRequest; notification: SellerDecisionNotification }>(
      `/api/users/seller-onboarding/requests/${encodeURIComponent(id)}/reject`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  // GET /api/users/seller-onboarding/notifications/{usernameOrEmail}
  getSellerNotification: async (usernameOrEmail: string): Promise<SellerDecisionNotification | null> => {
    try {
      return await request<SellerDecisionNotification>(
        `/api/users/seller-onboarding/notifications/${encodeURIComponent(usernameOrEmail)}`
      );
    } catch {
      return null;
    }
  },

  // POST /api/users/seller-onboarding/notifications/{id}/dismiss
  dismissSellerNotification: async (id: string | number): Promise<void> => {
    await request<void>(`/api/users/seller-onboarding/notifications/${encodeURIComponent(id)}/dismiss`, {
      method: 'POST'
    });
  }
};
