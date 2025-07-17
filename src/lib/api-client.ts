import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Pour les routes API internes Next.js, utiliser des URLs relatives
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Return the response data directly if it's successful
        if (response.data && response.data.success !== false) {
          return response.data;
        }
        
        // If the response indicates failure, throw an error
        if (response.data.success === false) {
          throw new Error(response.data.error || response.data.message || 'API Error');
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
          throw new Error('Erreur de réseau. Vérifiez votre connexion internet.');
        }

        // Handle 401 errors (unauthorized)
        if (error.response.status === 401) {
          // Clear auth token
          Cookies.remove('auth-token');
          
          // Only redirect if not already on login page
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth/login';
          }
          
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        // Handle 403 errors (forbidden)
        if (error.response.status === 403) {
          throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        }

        // Handle 404 errors
        if (error.response.status === 404) {
          throw new Error('Ressource non trouvée.');
        }

        // Handle 429 errors (rate limiting)
        if (error.response.status === 429) {
          const responseData = error.response.data as any;
          throw new Error(responseData?.message || 'Trop de requêtes. Veuillez patienter.');
        }

        // Handle 500 errors
        if (error.response.status >= 500) {
          throw new Error('Erreur interne du serveur. Veuillez réessayer plus tard.');
        }

        // Handle other HTTP errors
        const responseData = error.response.data as any;
        const errorMessage = responseData?.error || responseData?.message || 'Une erreur est survenue';
        throw new Error(errorMessage);
      }
    );
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: any): Promise<T> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    return this.client.delete(url, config);
  }

  // Helper methods
  setAuthToken(token: string) {
    Cookies.set('auth-token', token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  removeAuthToken() {
    Cookies.remove('auth-token');
  }

  getAuthToken(): string | undefined {
    return Cookies.get('auth-token');
  }
}

export const apiClient = new ApiClient();