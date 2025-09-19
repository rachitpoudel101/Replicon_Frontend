import { create } from "zustand";
import apiClient from "@/services/apiClient";
import { apiEndpoints } from "@/services/apiEndpoints";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
}

interface UserListState {
  users: User[];
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
  updateUser: (user: User) => void;
  setUsers: (users: User[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createUser: (userData: any) => Promise<{ success: boolean; error?: string }>;
}

export const useUserListStore = create<UserListState>((set) => ({
  users: [],
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  removeUser: (id) =>
    set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
  updateUser: (user) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === user.id ? user : u)),
    })),
  setUsers: (users) => set({ users }),
  createUser: async (userData) => {
    const requiredFields = [
      "username",
      "email",
      "first_name",
      "last_name",
      "password",
      "role",
    ];
    const missingFields: string[] = [];
    requiredFields.forEach((field) => {
      if (!userData[field]) missingFields.push(field);
    });
    const role = userData["role"];
    if (["trainer", "member"].includes(role)) {
      const additionalFields = [
        "age",
        "weight",
        "height",
        "phone",
        "bio",
        "gender",
      ];
      additionalFields.forEach((field) => {
        if (!userData[field]) missingFields.push(field);
      });
      if (!userData["profile_image"]) missingFields.push("profile_image");
    }
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Required fields missing: ${missingFields.join(", ")}`,
      };
    }

    try {
      // Attempt to create user on backend; explicitly type response data as User
      const response = await apiClient.post<User>(
        apiEndpoints.users.create,
        userData,
      );
      const created = response.data;
      // update local store with returned user (fallback to userData if API returns minimal)
      set((state) => ({
        users: [...state.users, (created as User) || (userData as User)],
      }));
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMessage };
    }
  },
}));
