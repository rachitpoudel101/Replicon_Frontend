import type { ReactNode } from "react";
import { create } from "zustand";

interface User {
  username: ReactNode;
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
