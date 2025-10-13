"use client";
import { useToast } from "@/store/toast";

export default function Toast() {
  const { message, hide } = useToast();
  if (!message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <div
        className="rounded-md bg-gray-900 text-white px-4 py-2 shadow-lg shadow-black/20 flex items-center gap-3"
        role="status"
        aria-live="polite"
        onClick={hide}
      >
        {message}
      </div>
    </div>
  );
}
