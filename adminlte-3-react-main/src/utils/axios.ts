import axios from "axios";
import { API_BASE_URL } from "./api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // needed so the HttpOnly refreshToken cookie is sent
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Attach Access Token ────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;

        // SaaS: Support tenant override for Global Admins
        const overrideTenantId = localStorage.getItem("overrideTenantId");
        if (overrideTenantId) {
          config.headers["x-tenant-id"] = overrideTenantId;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Silent Token Refresh ───────────────────────────────
// When a 401 is received (access token expired), attempt one silent refresh
// using the HttpOnly cookie. Concurrent requests that also get 401 are queued
// until the refresh completes, then retried with the new access token.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const AUTH_SKIP_URLS = [
  "/auth/login",
  "/auth/google-login",
  "/auth/refresh-token",
];

const forceLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url: string = originalRequest?.url || "";

    // Only attempt refresh on 401, and not for auth endpoints themselves
    if (
      status === 401 &&
      !originalRequest._retry &&
      !AUTH_SKIP_URLS.some((u) => url.includes(u)) &&
      typeof window !== "undefined"
    ) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh finishes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Cookie is sent automatically (withCredentials: true)
        const { data } = await axiosInstance.post("/auth/refresh-token");
        const newToken: string = data?.data?.token;

        if (!newToken) throw new Error("No token in refresh response");

        localStorage.setItem("token", newToken);
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
