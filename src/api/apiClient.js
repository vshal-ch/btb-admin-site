import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  config.headers.set("x-platform", "1"); // must be string
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    if (res.data?.success) {
      return res.data.data;
    } else {
      return Promise.reject(new Error(res.data?.error || "Unknown error"));
    }
  },
  async (err) => {
    const originalReq = err.config;

    // if no response or no status, just reject
    if (!err.response) return Promise.reject(err);

    // ✅ Don't try refresh on login failure or auth routes
    if (originalReq.url.includes("/auth/login")) {
      return Promise.reject(err);
    }

    // ✅ Only refresh if 401 AND request not retried yet
    if (
      (err.response.status === 401 || err.response.status === 403) &&
      !originalReq._retry
    ) {
      originalReq._retry = true;
      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { headers: { "x-platform": 1 }, withCredentials: true },
        );
        if (res.data?.success) {
          const newToken = res.data.data.accessToken;
          localStorage.setItem("accessToken", newToken);
          originalReq.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalReq);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(err.response.data.error);
  },
);

export default apiClient;
