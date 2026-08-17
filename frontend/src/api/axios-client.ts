import axios from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://www.piacoloan.info',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred'
    return Promise.reject(new Error(message));
  },
);
