import { request } from './client';
import { UserAccount, UserLogin, UserRole } from '../../types';

export interface LoginResponse {
  token: string;
  login: UserLogin;
  accounts: UserAccount[];
  activeAccountId: string;
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

export interface CreateAccountRequest {
  userLoginId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  bio?: string;
  phone?: string;
  isDefault?: boolean;
}

export const userManagementApi = {
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

  // GET /api/users/logins (List all logins + accounts for switcher)
  getLogins: async (): Promise<Array<UserLogin & { accounts: UserAccount[] }>> => {
    return request<Array<UserLogin & { accounts: UserAccount[] }>>('/api/users/logins');
  },

  // GET /api/users/logins/{loginId}/accounts
  getLoginAccounts: async (loginId: string): Promise<UserAccount[]> => {
    return request<UserAccount[]>(`/api/users/logins/${encodeURIComponent(loginId)}/accounts`);
  },

  // GET /api/users/accounts
  getAccounts: async (filters?: { role?: string; loginId?: string }): Promise<UserAccount[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.loginId) params.set('loginId', filters.loginId);
    const qs = params.toString();
    return request<UserAccount[]>(qs ? `/api/users/accounts?${qs}` : '/api/users/accounts');
  },

  // GET /api/users/accounts/{id}
  getAccountById: async (id: string): Promise<UserAccount> => {
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
  updateAccount: async (id: string, updates: Partial<UserAccount>): Promise<UserAccount> => {
    return request<UserAccount>(`/api/users/accounts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // POST /api/users/accounts/{id}/set-default
  setDefaultAccount: async (id: string): Promise<UserAccount> => {
    return request<UserAccount>(`/api/users/accounts/${encodeURIComponent(id)}/set-default`, {
      method: 'POST'
    });
  },

  // DELETE /api/users/accounts/{id}
  deleteAccount: async (id: string): Promise<void> => {
    return request<void>(`/api/users/accounts/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }
};
