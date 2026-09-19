import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(name: string, email: string, password: string):Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    if (response.data.access_token) {
      localStorage.setItem('darukaa_token', response.data.access_token);
      localStorage.setItem('darukaa_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    if (response.data.access_token) {
      localStorage.setItem('darukaa_token', response.data.access_token);
      localStorage.setItem('darukaa_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('darukaa_token');
    localStorage.removeItem('darukaa_user');
  },

  getStoredToken(): string | null {
    return localStorage.getItem('darukaa_token');
  },

  getStoredUser(): User | null {
    const data = localStorage.getItem('darukaa_user');
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  },
};
