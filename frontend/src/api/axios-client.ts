import axios from "axios";
import { clearAdminAuth, getAdminAccessToken } from "../utils/adminAuth";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://www.piacoloan.info',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
    const url = config.url ?? "";
    // Chỉ gắn admin token cho các endpoint /admin/*
    if (url.includes("/admin")) {
      const token = getAdminAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
})

axiosClient.interceptors.response.use(
  (response) => {
     response.data as any 
    return response.data;
  },
  (error) => {
    const status = error.response?.status; 
    const message = error.response?.data?.message || "lỗi không xác định"; 

    if(status === 401) { 
      clearAdminAuth();
    }

    return Promise.reject(new Error(message));
  },
);
