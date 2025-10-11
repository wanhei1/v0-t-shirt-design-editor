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

    const endpoint = `${API_BASE_URL}${url}`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        ...options,
        headers,
      });
    } catch (networkError) {
      const message = networkError instanceof Error ? networkError.message : 'Unknown network error';
      throw new Error(`无法连接到 ${endpoint}: ${message}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      let serverDetails = '';

      if (contentType.includes('application/json')) {
        const errorBody = await response.json().catch(() => null);
        if (errorBody && typeof errorBody === 'object') {
          serverDetails = JSON.stringify(errorBody);
        }
      } else {
        const text = await response.text().catch(() => '');
        if (text) {
          serverDetails = text.length > 500 ? `${text.slice(0, 500)}...` : text;
        }
      }

      const statusInfo = `${response.status} ${response.statusText}`.trim();
      const detailSuffix = serverDetails ? ` 服务器返回: ${serverDetails}` : '';
      throw new Error(`请求 ${endpoint} 失败 (${statusInfo}).${detailSuffix}`);
    }

    if (contentType.includes('application/json')) {
      return response.json();
    }

    // 非 JSON 响应时提供更易理解的调试信息
    const text = await response.text().catch(() => '');
    throw new Error(`请求 ${endpoint} 成功但响应不是 JSON（content-type: ${contentType || 'unknown'}）。响应内容: ${text.slice(0, 200)}`);
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