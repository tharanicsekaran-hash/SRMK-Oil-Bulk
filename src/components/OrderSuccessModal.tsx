"use client";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";

type OrderSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function OrderSuccessModal({
  isOpen,
  onClose,
}: OrderSuccessModalProps) {
  const { locale } = useI18n();
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
      }));
      setConfetti(pieces);

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Confetti Animation */}
      <div className="fixed inset-0 pointer-events-none z-[60]">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-3 h-3 animate-confetti"
            style={{
              left: `${piece.left}%`,
              top: "-10px",
              backgroundColor: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7", "#a29bfe", "#fd79a8"][
                Math.floor(Math.random() * 7)
              ],
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Success Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center transform scale-100 animate-scale-in shadow-2xl">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <CheckCircle className="w-24 h-24 text-green-500 animate-bounce-in" />
              <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75" />
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {locale === "en" ? "Order Placed! 🎉" : "ஆர்டர் வெற்றி! 🎉"}
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            {locale === "en"
              ? "Your order has been placed successfully!"
              : "உங்கள் ஆர்டர் வெற்றிகரமாக அளிக்கப்பட்டது!"}
          </p>

          {/* Redirecting text */}
          <p className="text-sm text-gray-500">
            {locale === "en"
              ? "Redirecting to your orders..."
              : "உங்கள் ஆர்டர்களுக்கு திருப்பிவிடப்படுகிறது..."}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-confetti {
          animation: confetti-fall linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}

