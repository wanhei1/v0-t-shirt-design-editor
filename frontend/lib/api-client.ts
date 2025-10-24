import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth';

// API 客户端配置
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'http://82.157.19.21:8189' : 'http://localhost:8189');

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 添加认证 token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 认证相关
  async register(userData: RegisterRequest) {
    return this.request<AuthResponse>('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest) {
    const response = await this.request<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // 保存 token 到 localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }

    return response;
  }

  async getProfile() {
    return this.request<User>('/api/profile', {
      method: 'GET',
    });
  }

  async logout() {
    localStorage.removeItem('authToken');
  }

  // 健康检查
  async healthCheck() {
    return this.request('/health', {
      method: 'GET',
    });
  }

  // 测试连接
  async testConnection() {
    try {
      // 直接调用后端的健康检查端点
      // baseURL 可能是 http://localhost:8189 或 http://localhost:8189/api
      const healthUrl = this.baseURL.includes('/api') 
        ? this.baseURL.replace('/api', '/health')
        : `${this.baseURL}/health`;
      
      const response = await fetch(healthUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as Record<string, unknown>;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接失败',
      };
    }
  }

  // 通用 GET 请求
  async get<T>(endpoint: string) {
    return this.request<T>(`/api${endpoint}`, {
      method: 'GET',
    });
  }

  // 通用 POST 请求
  async post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(`/api${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 通用 PATCH 请求
  async patch<T>(endpoint: string, data?: unknown) {
    return this.request<T>(`/api${endpoint}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 通用 DELETE 请求
  async delete<T>(endpoint: string) {
    return this.request<T>(`/api${endpoint}`, {
      method: 'DELETE',
    });
  }

  // ============ 产品相关 ============
  async getProducts() {
    return this.get('/products');
  }

  async getProductVariants(productId: string, color: string, gender: string) {
    return this.get(`/products/${productId}/variants?color=${color}&gender=${gender}`);
  }

  // ============ 设计相关 ============
  async createDesign(designData: unknown) {
    return this.post('/designs', designData);
  }

  async getUserDesigns() {
    return this.get('/designs');
  }

  async publishDesign(designId: string) {
    return this.patch(`/designs/${designId}/publish`, {});
  }

  async getDesignGallery(limit: number = 20, offset: number = 0) {
    return this.get(`/gallery?limit=${limit}&offset=${offset}`);
  }

  async getAuthorDesigns(authorId: string) {
    return this.get(`/authors/${authorId}`);
  }

  // ============ 订单相关 ============
  async createOrder(orderData: unknown) {
    return this.post('/orders', orderData);
  }

  async getUserOrders() {
    return this.get('/orders');
  }

  async payOrder(orderId: string, transactionId: string) {
    return this.post(`/orders/${orderId}/pay`, { transactionId });
  }

  // ============ 会员相关 ============
  async purchaseMembership(membershipType: string) {
    return this.post('/membership/purchase', { membershipType });
  }

  async getMembershipStatus() {
    return this.get('/membership/status');
  }

  // ============ 推荐相关 ============
  async generateReferralCode() {
    return this.post('/referral/generate', {});
  }

  async applyReferralCode(code: string) {
    return this.post('/referral/apply', { code });
  }

  // ============ 收益相关 ============
  async getEarnings() {
    return this.get('/earnings');
  }
}

// 导出单例实例
export const apiClient = new ApiClient();
export default apiClient;