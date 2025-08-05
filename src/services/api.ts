import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token to all requests
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle common response patterns
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Return successful responses as-is
        return response;
      },
      (error: AxiosError) => {
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleResponseError(error: AxiosError): void {
    const { response } = error;
    
    if (!response) {
      // Network error
      console.error('Network Error:', error.message);
      return;
    }

    const { status, data } = response;
    const errorMessage = (data as any)?.message || 'An error occurred';

    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        this.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
      case 403:
        // Forbidden - insufficient permissions
        console.error('Permission denied:', errorMessage);
        break;
      case 404:
        // Not found
        console.error('Resource not found:', errorMessage);
        break;
      case 422:
        // Validation error
        console.error('Validation error:', errorMessage);
        break;
      case 500:
        // Server error
        console.error('Server error:', errorMessage);
        break;
      default:
        console.error(`API Error (${status}):`, errorMessage);
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }

  // Public API methods
  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public removeToken(): void {
    this.clearToken();
  }

  // HTTP Methods
  public async get<T>(url: string, params?: object): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  public async post<T>(url: string, data?: object, config?: object): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: object): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  public async patch<T>(url: string, data?: object): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // File upload method
  public async uploadFile<T>(url: string, file: File, additionalData?: object): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Get raw axios instance for advanced usage
  public getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export default for convenience
export default api;