import { LoginForm, RegisterForm, User, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api-client';

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(credentials: LoginForm): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    console.log('Raw auth-api login response:', response);
    // L'interceptor retourne déjà response.data, donc response.data contient directement { success, data }
    return response.data || response;
  },

  async register(userData: RegisterForm): Promise<RegisterResponse> {
    const response = await apiClient.post('/auth/register', userData);
    console.log('Raw auth-api register response:', response);
    return response.data || response;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    console.log('Raw auth-api me response:', response);
    return response.data || response;
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return response.data!;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  },
};