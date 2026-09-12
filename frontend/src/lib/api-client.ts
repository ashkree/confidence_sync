import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  setAccessToken,
  notifyAuthFailure,
} from "@/lib/auth-token";

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) throw new Error("VITE_API_URL is not set");

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // required for the refresh cookie cross-origin
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Bare axios, not apiClient — otherwise a failing refresh recurses.
let refreshInFlight: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= axios
    .post<{ token: string }>(`${baseURL}/auth/refresh`, null, {
      withCredentials: true,
    })
    .then((r) => r.data.token)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !config || config._retried) {
      return Promise.reject(error);
    }

    config._retried = true;
    try {
      const token = await refreshAccessToken();
      setAccessToken(token);
      config.headers.set("Authorization", `Bearer ${token}`);
      return apiClient(config);
    } catch (refreshError) {
      setAccessToken(null);
      notifyAuthFailure();
      return Promise.reject(refreshError);
    }
  },
);
