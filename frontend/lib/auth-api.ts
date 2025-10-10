// 简单的API客户端，包含认证处理
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface User {
  id: string;
  username: string;
  email: string;
  created_at?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

class AuthApi {
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (this.authToken) {
      headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.fetchWithAuth('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string): Promise<RegisterResponse> {
    return this.fetchWithAuth('/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getProfile(): Promise<{ user: User }> {
    return this.fetchWithAuth('/profile');
  }

  async updateProfile(userData: { username: string }): Promise<UpdateProfileResponse> {
    return this.fetchWithAuth('/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
}

export const authApi = new AuthApi();