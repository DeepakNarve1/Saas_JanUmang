import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Get API URL from environment variable or use default
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Create a configured axios instance with interceptors
 */
export const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle common errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem("token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      // Don't reject if request was cancelled
      if (error.name === "CanceledError" || error.name === "AbortError") {
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Export a singleton instance
export const apiClient = createApiClient();

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};
