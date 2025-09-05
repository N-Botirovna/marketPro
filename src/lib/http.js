import axios from "axios";
import { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY } from "@/config";
import { getItem } from "@/utils/storage";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 20000,
});

httpClient.interceptors.request.use((config) => {
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      status: error?.response?.status,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Unexpected error occurred",
      data: error?.response?.data,
    };
    return Promise.reject({ ...error, normalized });
  }
);

export default httpClient;


