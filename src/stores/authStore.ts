import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import apiClient from "@/services/apiClient";
import { apiEndpoints } from "@/services/apiEndpoints";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: Record<string, string>) => Promise<void>;
  logout: () => void;
  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;
  fetchSelf: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      setTokens: ({ accessToken, refreshToken }) => {
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: !!accessToken,
        }));
      },

      fetchSelf: async () => {
        try {
          const response = await apiClient.get<User>(apiEndpoints.users.self);
          set({ user: response.data, error: null });
        } catch (error) {
          console.error("Failed to fetch user data");
          get().logout();
          throw error;
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post(
            apiEndpoints.auth.login,
            credentials,
          );
          const { access, refresh } = response.data;

          // set the tokens and authentication status
          set({
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
          });

          await get().fetchSelf();

          const username = get().user?.username;
          toast.success(`Welcome back, ${username}!`);
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || "Login failed";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          user: null,
          error: null,
        });
        // Optional: clear any stored tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        toast.success("Logged out successfully.");
      },

      // Called on app start to check for persisted session
      initialize: async () => {
        const { accessToken, refreshToken, fetchSelf } = get();

        if (!accessToken || !refreshToken) {
          return;
        }

        try {
          // Just try to fetch user data - interceptor will handle refresh if needed
          await fetchSelf();
        } catch (error) {
          console.error("Initialization failed:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Initialize auth state when store is created
if (typeof window !== "undefined") {
  useAuthStore.getState().initialize();
}
