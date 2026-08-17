import axios from "axios";
import { clearAdminAuth, getAdminAccessToken, refreshAccessToken } from "../utils/adminAuth";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://www.piacoloan.info',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
    const url = config.url ?? "";
    const isPublicEndpoint =
    url.includes("/availability/slots") ||
    url.includes("/availability/book")  ||
    url.includes("/availability/hold");

    if (!isPublicEndpoint) {
      const token = getAdminAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
})


let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "lỗi không xác định";
    const originalRequest = error.config;

    if (status !== 401) {
      return Promise.reject(new Error(message));
    }

    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        failedQueue.forEach((p) => p.resolve(newToken));
        failedQueue = [];
        isRefreshing = false;
        return axiosClient(originalRequest);
      } 
      else {
        failedQueue.forEach((p) => p.reject(error));
        failedQueue = [];
        isRefreshing = false;
        console.error('[Auth] All refresh attempts failed, logging out');
        clearAdminAuth();
        return Promise.reject(error);
      }
    }

    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((newToken) => {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosClient(originalRequest);
    });
  },
);
