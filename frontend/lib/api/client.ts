const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fieldops_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && typeof window !== 'undefined') {
        // If unauthorized and not already on /login or /reset-password
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/reset-password')) {
          localStorage.removeItem('fieldops_token');
          localStorage.removeItem('fieldops_user');
          window.location.href = '/login?expired=true';
        }
      }

      const json = await response.json();

      if (!response.ok) {
        const errorMsg = json.message || json.errorDetails || 'Request failed';
        throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
      }

      // Handle NestJS TransformInterceptor response format { success, data, ... }
      return (json.data !== undefined ? json.data : json) as T;
    } catch (error: any) {
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });
      const queryString = query.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(urlSanitize(endpoint), {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(urlSanitize(endpoint), {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(urlSanitize(endpoint), {
      method: 'DELETE',
    });
  }
}

function urlSanitize(endpoint: string): string {
  return endpoint;
}

export const apiClient = new ApiClient();
