import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.29.6:4000/api", // your server URL
  withCredentials: true, // important if refresh token is in httpOnly cookie
});

// request interceptor to attach access token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
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
    if (
      originalReq.url.includes("/auth/login") ||
      originalReq.url.includes("/auth/signup")
    ) {
      return Promise.reject(err);
    }

    // ✅ Only refresh if 401 AND request not retried yet
    if (err.response.status === 401 && !originalReq._retry) {
      originalReq._retry = true;
      try {
        const res = await axios.post(
          "http://192.168.29.6:4000/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        if (res.data?.success) {
          const newToken = res.data.data.accessToken;
          localStorage.setItem("accessToken", newToken);
          originalReq.headers.Authorization = `Bearer ${newToken}`;
          return API(originalReq);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export const login = (username, password) =>
  API.post("/auth/login", { username, password });

export const logout = () => API.post("/auth/logout");
export default API;
