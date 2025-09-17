import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { apiEndpoints } from "@/services/apiEndpoints";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

//automatic token injection on request
// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();

    // Handle 401 errors with token refresh
    if (
      error.response?.status === 401 &&
      authStore.refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const { data } = await axios.post(apiEndpoints.auth.refresh, {
          refresh: authStore.refreshToken,
        });

        const newAccessToken = data.access;
        const newRefreshToken = data.refresh;

        if (!newAccessToken) {
          throw new Error("No access token received");
        }

        // Update tokens in store
        authStore.setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || authStore.refreshToken,
        });

        // Update header and retry request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        authStore.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
