import { create } from "zustand";

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
  createUser: (userData: any) => { success: boolean; error?: string };
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
  createUser: (userData) => {
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
    // If all fields are present, add user (simulate creation)
    set((state) => ({ users: [...state.users, userData] }));
    return { success: true };
  },
}));
