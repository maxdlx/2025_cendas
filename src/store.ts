import { create } from "zustand";

interface UserState {
  user: string | null;
  login: (name: string) => Promise<void>;
}

const getInitialUser = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("user") || null;
  }
  return null;
};

export const useUserStore = create<UserState>((set) => ({
  user: getInitialUser(),
  login: async (name: string) => {
    localStorage.setItem("user", name);
    set({ user: name });
  },
}));
