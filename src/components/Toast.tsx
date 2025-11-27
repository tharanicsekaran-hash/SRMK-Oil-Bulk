"use client";
import { useToast } from "@/store/toast";

export default function Toast() {
  const { message, type, hide } = useToast();
  if (!message) return null;

  const bgColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-gray-900",
  }[type];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <div
        className={`rounded-md ${bgColor} text-white px-4 py-2 shadow-lg shadow-black/20 flex items-center gap-3 cursor-pointer`}
        role="status"
        aria-live="polite"
        onClick={hide}
      >
        {message}
      </div>
    </div>
  );
}
