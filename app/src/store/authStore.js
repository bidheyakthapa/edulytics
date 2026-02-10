import { create } from "zustand";
import axios from "axios";

export const useAuthStore = create((set) => ({
  user: null, // {id, role, ...}
  loading: true, // while checking /me

  fetchMe: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/auth/me", { withCredentials: true });
      set({ user: res.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  clear: () => set({ user: null, loading: false }),
}));
