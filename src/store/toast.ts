import { create } from "zustand";

type ToastState = {
  message: string | null;
  show: (msg: string, durationMs?: number) => void;
  hide: () => void;
};

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (msg, durationMs = 2200) => {
    set({ message: msg });
    if (durationMs > 0) {
      setTimeout(() => set({ message: null }), durationMs);
    }
  },
  hide: () => set({ message: null }),
}));
