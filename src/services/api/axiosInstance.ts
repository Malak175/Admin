import axios from "axios";
import { getAdminToken } from "@/services/api/tokenStorage";

export const AUTH_EXPIRED_EVENT = "admin:auth-expired";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
const adminLoginEndpoint =
  import.meta.env.VITE_ADMIN_LOGIN_ENDPOINT || "/api/v1/auth/signin";

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAdminToken();
  const url = config.url || "";
  const isLoginRequest = url.includes(adminLoginEndpoint);

  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);
