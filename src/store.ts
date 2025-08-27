import { create } from "zustand";

interface UserState {
  user: string | null;
  login: (name: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  login: async (name: string) => {
    // TODO: RxDB user creation/selection logic
    set({ user: name });
  },
}));
