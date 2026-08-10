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


let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const status = error.response?.status; 
    const message = error.response?.data?.message || "lỗi không xác định";
    const orginalRequest = error.config;

    if(status !== 401) { 
      return Promise.reject(new Error(message));
    }

    if(!isRefreshing) { 
      isRefreshing = true; 
      const token = await refreshAccessToken();
      isRefreshing = false; 

      if(token) { 
        failedQueue.forEach(({ resolve }) => resolve(token)); 
        failedQueue = []; 
        orginalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(orginalRequest);
      } else { 
        failedQueue.forEach(({ reject }) => reject(error)); 
        failedQueue = []; 
        clearAdminAuth(); 
      }
    }

    return new Promise((resolve, reject) => {
      failedQueue.push({resolve, reject});
    }).then((token) => { 
      orginalRequest.headers.Authorization = `Bearer ${token}`; 
      return axiosClient(orginalRequest);
    })
    
  },
);
