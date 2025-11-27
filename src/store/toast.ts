import { create } from "zustand";

type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string | null;
  type: ToastType;
  show: (msg: string, type?: ToastType, durationMs?: number) => void;
  hide: () => void;
};

export const useToast = create<ToastState>((set) => ({
  message: null,
  type: "info",
  show: (msg, type = "info", durationMs = 3000) => {
    set({ message: msg, type });
    if (durationMs > 0) {
      setTimeout(() => set({ message: null }), durationMs);
    }
  },
  hide: () => set({ message: null }),
}));
